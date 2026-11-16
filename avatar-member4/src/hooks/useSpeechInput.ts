import { useCallback, useEffect, useRef, useState } from 'react';

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechStatus = 'idle' | 'listening' | 'transcribing';

interface UseSpeechInputOptions {
  language: string;
  onInterimText: (text: string) => void;
  onFinalText: (text: string) => void;
  onError: (message: string) => void;
}

export function useSpeechInput({
  language,
  onInterimText,
  onFinalText,
  onError,
}: UseSpeechInputOptions) {
  const [status, setStatus] = useState<SpeechStatus>('idle');
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const finalBufferRef = useRef('');

  const stopMediaStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore stop race
      }
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  useEffect(() => {
    return () => {
      stopListening();
      stopMediaStream();
    };
  }, [stopListening, stopMediaStream]);

  const startMediaRecorderFallback = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      onError('Microphone capture is not supported in this browser. Please type your phrase.');
      setStatus('idle');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4';

      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];

      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunksRef.current.push(ev.data);
      };

      recorder.onstop = async () => {
        stopMediaStream();
        const blob = new Blob(chunksRef.current, { type: mimeType });
        chunksRef.current = [];
        mediaRecorderRef.current = null;

        if (blob.size < 400) {
          setStatus('idle');
          return;
        }

        setStatus('transcribing');
        try {
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const result = typeof reader.result === 'string' ? reader.result : '';
              const comma = result.indexOf(',');
              resolve(comma >= 0 ? result.slice(comma + 1) : result);
            };
            reader.onerror = () => reject(new Error('Failed to read recorded audio.'));
            reader.readAsDataURL(blob);
          });

          const res = await fetch('/api/isl/transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audioBase64: base64,
              mimeType: mimeType.split(';')[0],
            }),
          });
          const data = (await res.json()) as { transcript?: string; error?: string };
          if (!res.ok) {
            throw new Error(data.error || 'Could not transcribe audio.');
          }
          if (data.transcript) {
            onFinalText(data.transcript);
          } else {
            onError('No speech detected. Try speaking clearly closer to the mic.');
          }
        } catch (err) {
          onError(err instanceof Error ? err.message : 'Audio transcription failed.');
        } finally {
          setStatus('idle');
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setStatus('listening');
    } catch (err) {
      stopMediaStream();
      setStatus('idle');
      const msg =
        err instanceof Error && err.name === 'NotAllowedError'
          ? 'Microphone permission was denied. Allow mic access or type text directly.'
          : 'Unable to access microphone. Check audio device permissions.';
      onError(msg);
    }
  }, [onError, onFinalText, stopMediaStream]);

  const startListening = useCallback(async () => {
    if (status !== 'idle') {
      stopListening();
      return;
    }

    const win = window as unknown as {
      SpeechRecognition?: new () => SpeechRecognitionInstance;
      webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
    };
    const SpeechRecCtor = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (SpeechRecCtor) {
      try {
        const recognition = new SpeechRecCtor();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = language;
        finalBufferRef.current = '';

        recognition.onresult = (event) => {
          let interim = '';
          let finalChunk = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const res = event.results[i];
            const transcript = res[0]?.transcript ?? '';
            if (res.isFinal) {
              finalChunk += transcript;
            } else {
              interim += transcript;
            }
          }
          if (finalChunk) {
            finalBufferRef.current = `${finalBufferRef.current} ${finalChunk}`.trim();
          }
          const combined = `${finalBufferRef.current} ${interim}`.trim();
          if (combined) {
            onInterimText(combined);
          }
        };

        recognition.onerror = (event) => {
          recognitionRef.current = null;
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            setStatus('idle');
            onError('Microphone access was blocked. Allow microphone permission or type below.');
            return;
          }
          if (event.error === 'network' || event.error === 'audio-capture') {
            // Fall back smoothly to MediaRecorder + Gemini audio transcription
            void startMediaRecorderFallback();
            return;
          }
          setStatus('idle');
          if (event.error !== 'aborted' && event.error !== 'no-speech') {
            onError(`Speech recognition error (${event.error}). Try typing or recording again.`);
          }
        };

        recognition.onend = () => {
          recognitionRef.current = null;
          const captured = finalBufferRef.current.trim();
          setStatus('idle');
          if (captured) {
            onFinalText(captured);
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
        setStatus('listening');
        return;
      } catch {
        // Fallback to MediaRecorder
      }
    }

    await startMediaRecorderFallback();
  }, [
    language,
    onError,
    onFinalText,
    onInterimText,
    startMediaRecorderFallback,
    status,
    stopListening,
  ]);

  return {
    status,
    toggleListening: startListening,
    stopListening,
  };
}
