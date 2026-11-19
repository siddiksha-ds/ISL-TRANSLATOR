import {
  ChevronDown,
  ChevronUp,
  Loader2,
  Mic,
  MicOff,
  Pause,
  Play,
  RotateCcw,
  Send,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { LexiconDrawer } from './components/LexiconDrawer';
import { useSpeechInput } from './hooks/useSpeechInput';
import { ISLStage } from './three/ISLStage';
import type {
  CameraPreset,
  ISLSignDefinition,
  ISLTranslationResponse,
  NMMType,
  TranslatedGlossToken,
} from './types/isl';
import { buildPlaybackSteps, type PlaybackStep } from './utils/islPlayback';

const SAMPLE_PHRASES = [
  'Namaste, how are you?',
  'What is your name?',
  'I want water please',
  'Tomorrow morning I go to school',
];

const INITIAL_GREETING: ISLTranslationResponse = {
  originalText: 'Namaste, I am happy to help you',
  detectedLanguage: 'English',
  sentenceType: 'statement',
  islGlossSentence: 'NAMASTE I HAPPY YOU HELP',
  grammarNote:
    'Copula "am" omitted and object "you" placed before verb "help" in ISL Subject-Object-Verb order.',
  tokens: [
    {
      gloss: 'NAMASTE',
      displayLabel: 'NAMASTE',
      type: 'sign',
      nmm: 'happy',
      englishSource: 'Namaste',
      description: 'Both flat palms pressed together at chest center with a respectful slight bow.',
    },
    {
      gloss: 'I',
      displayLabel: 'I',
      type: 'sign',
      nmm: 'neutral',
      englishSource: 'I',
      description: 'Right index finger points inward toward the center of the chest.',
    },
    {
      gloss: 'HAPPY',
      displayLabel: 'HAPPY',
      type: 'sign',
      nmm: 'happy',
      englishSource: 'happy',
      description: 'Both flat palms brush lightly upward over the chest with a bright smile.',
    },
    {
      gloss: 'YOU',
      displayLabel: 'YOU',
      type: 'sign',
      nmm: 'neutral',
      englishSource: 'you',
      description: 'Right index finger points directly forward at chest height toward the addressee.',
    },
    {
      gloss: 'HELP',
      displayLabel: 'HELP',
      type: 'sign',
      nmm: 'happy',
      englishSource: 'help',
      description:
        'Closed thumb-up right fist rests on open left palm and both lift upward together.',
    },
  ],
};

const NMM_LABELS: Record<NMMType, string> = {
  neutral: 'Neutral Expression',
  question_yn: 'Raised Brows (Yes/No Question)',
  question_wh: 'Furrowed Brows (WH-Question)',
  affirmative: 'Head Nod (Affirmative)',
  negative: 'Head Shake (Negation)',
  happy: 'Warm Smile',
  sad: 'Lowered Gaze',
  urgent: 'Focused / Urgent',
};

export default function App() {
  const [activeNav, setActiveNav] = useState<'translator' | 'lexicon' | 'fingerspelling'>(
    'translator',
  );
  const [inputText, setInputText] = useState('Namaste, how are you?');
  const [speechLang, setSpeechLang] = useState<'en-IN' | 'hi-IN'>('en-IN');
  const [translation, setTranslation] = useState<ISLTranslationResponse>(INITIAL_GREETING);
  const [isTranslating, setIsTranslating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState<0.6 | 1 | 1.4>(1);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('upper_body');
  const [cameraResetNonce, setCameraResetNonce] = useState(0);
  const [dockCollapsed, setDockCollapsed] = useState(false);

  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [activeStep, setActiveStep] = useState<PlaybackStep | null>(null);
  const [jumpToStepNonce, setJumpToStepNonce] = useState<{
    stepIndex: number;
    nonce: number;
  } | null>(null);

  const steps = useMemo(() => buildPlaybackSteps(translation.tokens), [translation.tokens]);

  const translatePhrase = useCallback(async (textToTranslate: string) => {
    const clean = textToTranslate.trim();
    if (!clean) {
      setErrorMsg('Please enter or speak a phrase to translate into ISL.');
      return;
    }

    setErrorMsg(null);
    setIsTranslating(true);

    try {
      const res = await fetch('/api/isl/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: clean }),
      });

      const data = (await res.json()) as ISLTranslationResponse & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Could not translate text into ISL.');
      }

      setTranslation(data);
      setIsPlaying(true);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Translation failed.');
    } finally {
      setIsTranslating(false);
    }
  }, []);

  const handleSpeechInterim = useCallback((text: string) => {
    setInputText(text);
  }, []);  
  
  useEffect(() => {
    const handleParentMessage = (event: MessageEvent) => {
      if (event.origin !== "http://localhost:5173") return;

      const data = event.data;

      if (
        data?.type === "ISL_TRANSLATE_TEXT" &&
        typeof data.text === "string"
      ) {
        setInputText(data.text);
        void translatePhrase(data.text);
      }
    };

    window.addEventListener("message", handleParentMessage);

    return () => {
      window.removeEventListener("message", handleParentMessage);
    };
  }, [translatePhrase]);

  const handleSpeechFinal = useCallback(
    (text: string) => {
      setInputText(text);
      void translatePhrase(text);
    },
    [translatePhrase],
  );

  const handleSpeechError = useCallback((msg: string) => {
    setErrorMsg(msg);
  }, []);

  const { status: speechStatus, toggleListening } = useSpeechInput({
    language: speechLang,
    onInterimText: handleSpeechInterim,
    onFinalText: handleSpeechFinal,
    onError: handleSpeechError,
  });

  // Keyboard shortcut 'H' to toggle HUD dock when not typing
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'h' || e.key === 'H') {
        setDockCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleActiveStepChange = useCallback((stepIdx: number, step: PlaybackStep | null) => {
    setActiveStepIndex(stepIdx);
    setActiveStep(step);
  }, []);

  const handlePlaybackComplete = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const handleReplay = useCallback(() => {
    if (steps.length === 0) return;
    setJumpToStepNonce((prev) => ({ stepIndex: 0, nonce: (prev?.nonce ?? 0) + 1 }));
    setIsPlaying(true);
  }, [steps.length]);

  const handleTokenClick = useCallback(
    (tokenIndex: number) => {
      const targetStepIdx = steps.findIndex((s) => s.tokenIndex === tokenIndex);
      if (targetStepIdx >= 0) {
        setJumpToStepNonce((prev) => ({
          stepIndex: targetStepIdx,
          nonce: (prev?.nonce ?? 0) + 1,
        }));
        setIsPlaying(true);
      }
    },
    [steps],
  );

  const handleSelectLexiconSign = useCallback((sign: ISLSignDefinition) => {
    const isAlpha = sign.category === 'Fingerspelling';
    const token: TranslatedGlossToken = {
      gloss: sign.gloss,
      displayLabel: sign.gloss.replace(/_/g, ' '),
      type: 'sign',
      nmm: 'neutral',
      englishSource: sign.meaning,
      description: sign.description,
    };
    setTranslation({
      originalText: sign.meaning,
      detectedLanguage: 'ISL Lexicon',
      sentenceType: 'statement',
      islGlossSentence: token.displayLabel,
      grammarNote: isAlpha
        ? `Manual alphabet / numeral reference: ${sign.description}`
        : `Lexicon sign (${sign.category}): ${sign.description}`,
      tokens: [token],
    });
    setIsPlaying(true);
  }, []);

  const currentStep = activeStep ?? steps[activeStepIndex] ?? null;
  const activeTokenIndex = currentStep?.tokenIndex ?? -1;

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#0b1120] text-slate-100">
      {/* Unobstructed 100% 3D Studio Viewport */}
      <ISLStage
        steps={steps}
        isPlaying={isPlaying}
        speed={speed}
        cameraPreset={cameraPreset}
        cameraResetNonce={cameraResetNonce}
        jumpToStepNonce={jumpToStepNonce}
        onActiveStepChange={handleActiveStepChange}
        onPlaybackComplete={handlePlaybackComplete}
      />

      {/* Top Bar (3-zone contract: Wordmark — Nav Links — Single Primary Action) */}
      <header className="pointer-events-auto absolute top-0 right-0 left-0 z-20 flex items-center justify-between gap-8 border-b border-white/10 bg-[#0b1120]/90 px-6 py-3.5">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveNav('translator');
          }}
          className="font-display text-lg font-bold tracking-tight whitespace-nowrap shrink-0 text-white"
        >
          VaaniMudra
        </a>

        <nav
          className="flex items-center gap-6 text-sm font-medium"
          aria-label="Primary sections"
        >
          <button
            type="button"
            onClick={() => setActiveNav('translator')}
            className={`whitespace-nowrap shrink-0 border-b-2 pb-0.5 transition-colors ${
              activeNav === 'translator'
                ? 'border-amber-400 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-100'
            }`}
          >
            Translator
          </button>
          <button
            type="button"
            onClick={() =>
              setActiveNav((prev) => (prev === 'lexicon' ? 'translator' : 'lexicon'))
            }
            className={`whitespace-nowrap shrink-0 border-b-2 pb-0.5 transition-colors ${
              activeNav === 'lexicon'
                ? 'border-amber-400 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-100'
            }`}
          >
            ISL Lexicon
          </button>
          <button
            type="button"
            onClick={() =>
              setActiveNav((prev) =>
                prev === 'fingerspelling' ? 'translator' : 'fingerspelling',
              )
            }
            className={`whitespace-nowrap shrink-0 border-b-2 pb-0.5 transition-colors ${
              activeNav === 'fingerspelling'
                ? 'border-amber-400 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-100'
            }`}
          >
            Fingerspelling
          </button>
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => {
              setCameraPreset('upper_body');
              setCameraResetNonce((n) => n + 1);
            }}
            className="rounded-lg border border-white/15 bg-slate-800 px-3.5 py-2 text-xs font-medium whitespace-nowrap shrink-0 text-slate-100 transition-colors hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-amber-400"
          >
            Reset Camera
          </button>
        </div>
      </header>

      {/* Subtle Active Gloss & NMM Readout (top-left below header, never occluding center face/hands) */}
      {currentStep && (
        <div className="pointer-events-none absolute top-18 left-5 z-10 max-w-xs rounded-xl border border-white/10 bg-slate-900/90 px-4 py-3 shadow-lg">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Signing Now</span>
            <span aria-hidden="true">·</span>
            <span>{NMM_LABELS[currentStep.nmm]}</span>
          </div>
          <p className="mt-0.5 font-mono text-lg font-semibold tracking-wide text-amber-300">
            {currentStep.displayLabel}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-slate-300">
            {currentStep.sign.description}
          </p>
        </div>
      )}

      {/* Lexicon / Fingerspelling Slide-Over Drawer */}
      {(activeNav === 'lexicon' || activeNav === 'fingerspelling') && (
        <LexiconDrawer
          mode={activeNav}
          onClose={() => setActiveNav('translator')}
          onSelectSign={handleSelectLexiconSign}
        />
      )}

      {/* Unified Collapsible Bottom Control Dock */}
      <div
        className={`pointer-events-auto fixed bottom-4 left-1/2 z-20 w-[min(920px,calc(100vw-1.5rem))] -translate-x-1/2 transition-transform duration-300 ease-out ${
          dockCollapsed ? 'translate-y-[calc(100%-2.1rem)]' : 'translate-y-0'
        }`}
      >
        {/* Collapse / Expand Tab */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setDockCollapsed((c) => !c)}
            className="flex items-center gap-1.5 rounded-t-xl border border-b-0 border-white/10 bg-slate-900/95 px-4 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:text-white"
            aria-expanded={!dockCollapsed}
          >
            {dockCollapsed ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" />
                <span>Show Controls</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
                <span>Hide Controls</span>
              </>
            )}
          </button>
        </div>

        <section
          className="rounded-2xl border border-white/10 bg-slate-900/95 p-4 shadow-2xl"
          aria-label="ISL Speech and Text Controls"
        >
          {/* Gloss Sequence Timeline + Grammar Note */}
          <div className="mb-3 border-b border-white/10 pb-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {translation.tokens.map((tok, idx) => {
                  const isActive = idx === activeTokenIndex;
                  return (
                    <button
                      key={`${tok.gloss}-${idx}`}
                      type="button"
                      onClick={() => handleTokenClick(idx)}
                      className={`rounded-lg px-2.5 py-1 font-mono text-xs font-semibold whitespace-nowrap transition-colors ${
                        isActive
                          ? 'bg-amber-400 text-slate-950'
                          : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                      }`}
                      title={tok.description || tok.englishSource}
                    >
                      {tok.displayLabel}
                      {tok.type === 'fingerspell' ? ' (FS)' : ''}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>{translation.detectedLanguage}</span>
                <span aria-hidden="true">·</span>
                <span className="capitalize">
                  {translation.sentenceType.replace('_', ' ')}
                </span>
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-400">{translation.grammarNote}</p>
          </div>

          {/* Speech & Text Input Row */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void translatePhrase(inputText);
            }}
            className="flex flex-col gap-2.5 sm:flex-row sm:items-center"
          >
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-slate-950 px-3 py-1.5 focus-within:border-amber-400">
              <select
                value={speechLang}
                onChange={(e) => setSpeechLang(e.target.value as 'en-IN' | 'hi-IN')}
                aria-label="Speech recognition language"
                className="rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-slate-300 focus:outline-none"
              >
                <option value="en-IN">English (IN)</option>
                <option value="hi-IN">Hindi (IN)</option>
              </select>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Speak or type in English or Hindi..."
                className="min-w-0 flex-1 bg-transparent py-1.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
              />

              <button
                type="button"
                onClick={() => void toggleListening()}
                disabled={speechStatus === 'transcribing'}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                  speechStatus === 'listening'
                    ? 'bg-rose-500 text-white hover:bg-rose-600'
                    : speechStatus === 'transcribing'
                      ? 'bg-slate-800 text-slate-400'
                      : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
                aria-label={
                  speechStatus === 'listening' ? 'Stop listening' : 'Start speech input'
                }
              >
                {speechStatus === 'listening' ? (
                  <>
                    <MicOff className="h-3.5 w-3.5" />
                    <span>Stop</span>
                  </>
                ) : speechStatus === 'transcribing' ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Transcribing</span>
                  </>
                ) : (
                  <>
                    <Mic className="h-3.5 w-3.5" />
                    <span>Speak</span>
                  </>
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={isTranslating || !inputText.trim()}
              className="flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-semibold whitespace-nowrap shrink-0 text-slate-950 transition-colors hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isTranslating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Translating</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Translate & Sign</span>
                </>
              )}
            </button>
          </form>

          {errorMsg && (
            <p
              role="alert"
              className="mt-2.5 rounded-lg border border-rose-500/30 bg-rose-950/50 px-3 py-2 text-xs text-rose-200"
            >
              {errorMsg}
            </p>
          )}

          {/* Bottom Utility Strip: Quick Phrases + Playback + Camera Presets */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-1.5">
              {SAMPLE_PHRASES.map((phrase) => (
                <button
                  key={phrase}
                  type="button"
                  onClick={() => {
                    setInputText(phrase);
                    void translatePhrase(phrase);
                  }}
                  className="rounded-md border border-white/10 bg-slate-800/70 px-2.5 py-1 text-xs text-slate-300 whitespace-nowrap transition-colors hover:border-amber-400/50 hover:text-white"
                >
                  {phrase}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Play / Pause & Replay */}
              <div className="flex items-center gap-1 rounded-lg bg-slate-800 p-1">
                <button
                  type="button"
                  onClick={() => {
                    if (!isPlaying && activeStepIndex >= steps.length - 1) {
                      handleReplay();
                    } else {
                      setIsPlaying((p) => !p);
                    }
                  }}
                  className="flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-slate-100 hover:bg-slate-700"
                  aria-label={isPlaying ? 'Pause signing' : 'Play signing'}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-3.5 w-3.5" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5" />
                      <span>Play</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleReplay}
                  className="flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-slate-300 hover:bg-slate-700 hover:text-white"
                  aria-label="Replay sequence"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Replay</span>
                </button>
              </div>

              {/* Speed Multiplier */}
              <div className="flex items-center gap-0.5 rounded-lg bg-slate-800 p-1 tabular-nums">
                {([0.6, 1, 1.4] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSpeed(s)}
                    className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                      speed === s
                        ? 'bg-amber-400 text-slate-950'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>

              {/* Camera Presets */}
              <div className="flex items-center gap-0.5 rounded-lg bg-slate-800 p-1">
                {(
                  [
                    { id: 'upper_body', label: 'Upper Body' },
                    { id: 'hands_focus', label: 'Hands' },
                    { id: 'face_nmm', label: 'Face' },
                  ] as const
                ).map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setCameraPreset(preset.id);
                      setCameraResetNonce((n) => n + 1);
                    }}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                      cameraPreset === preset.id
                        ? 'bg-slate-600 text-white'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
