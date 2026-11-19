import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { exec } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import { VOCAB_GLOSS_LIST } from './src/data/islLexicon.ts';
import { GLOSS_ALIASES } from './src/data/islAliases.ts';
import type { ISLTranslationResponse, NMMType } from './src/types/isl.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const IS_PROD = process.env.NODE_ENV === 'production';

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const VALID_NMMS: NMMType[] = [
  'neutral',
  'question_yn',
  'question_wh',
  'affirmative',
  'negative',
  'happy',
  'sad',
  'urgent',
];

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  // Translate English / Hindi / Hinglish speech or text into Indian Sign Language (ISL) Glosses
  app.post('/api/isl/translate', async (req, res) => {
    try {
      const rawText = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
      if (!rawText) {
        return res.status(400).json({ error: 'Please enter or speak a phrase to translate into ISL.' });
      }

      const ai = getAiClient();

      const vocabSummary = VOCAB_GLOSS_LIST.join(', ');
      const aliasSummary = Object.entries(GLOSS_ALIASES)
        .slice(0, 60)
        .map(([k, v]) => `${k}->${v}`)
        .join(', ');

      const systemInstruction = `You are an expert Indian Sign Language (ISL) linguist and gloss translator.
Convert the user's input (English, Hindi, or Hinglish) into an authentic Indian Sign Language (ISL) gloss sequence.

Follow strict ISL grammatical rules:
1. Word Order: Use Subject-Object-Verb (SOV) order.
2. Time Markers: Place time indicators (TODAY, TOMORROW, YESTERDAY, MORNING, NIGHT, TIME) at the very beginning of the sentence.
3. WH-Questions: Place WH-words (WHAT, WHERE, WHO, WHEN, WHY, HOW) at the END of the sentence, and mark those tokens with nmm="question_wh".
4. Yes/No Questions: Omit auxiliary "do/does/is/are" and mark the final verb/predicate token with nmm="question_yn".
5. Negation: Place NO after the verb/clause (e.g. "I do not understand" -> I UNDERSTAND NO) with nmm="negative".
6. Omit copulas (is, am, are, was, were), articles (a, an, the), and filler prepositions (to, in, at, of).
7. Prefer mapping words to our built-in 3D sign lexicon whenever semantically appropriate:
   AVAILABLE LEXICON GLOSSES: [${vocabSummary}]
   COMMON SYNONYMS: [${aliasSummary}]
8. Only set type="fingerspell" (with uppercase letters array A-Z / 0-9) for proper nouns (people's names, city names) or concepts with no suitable sign in the lexicon.
9. Keep grammarNote concise (1 clear sentence explaining the ISL SOV / NMM rule applied).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash-lite',
        contents: `Translate this phrase into Indian Sign Language (ISL) glosses: "${rawText}"`,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              detectedLanguage: {
                type: Type.STRING,
                description: 'Detected input language such as English, Hindi, or Hinglish.',
              },
              sentenceType: {
                type: Type.STRING,
                description: 'One of: statement, question_yn, question_wh, imperative, exclamation.',
              },
              grammarNote: {
                type: Type.STRING,
                description: 'Short 1-sentence explanation of the ISL grammar transformation applied.',
              },
              tokens: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    gloss: {
                      type: Type.STRING,
                      description: 'Uppercase ISL gloss token, matching the available lexicon if type is sign.',
                    },
                    displayLabel: {
                      type: Type.STRING,
                      description: 'Clean readable gloss label to show in UI.',
                    },
                    type: {
                      type: Type.STRING,
                      description: 'Either "sign" or "fingerspell".',
                    },
                    letters: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: 'Uppercase single A-Z or 0-9 characters when type is fingerspell.',
                    },
                    nmm: {
                      type: Type.STRING,
                      description:
                        'Non-manual facial/head marker: neutral, question_yn, question_wh, affirmative, negative, happy, sad, or urgent.',
                    },
                    englishSource: {
                      type: Type.STRING,
                      description: 'Source word or phrase mapped to this gloss.',
                    },
                    description: {
                      type: Type.STRING,
                      description: 'Brief 1-sentence description of how this sign is performed.',
                    },
                  },
                  required: ['gloss', 'displayLabel', 'type', 'nmm', 'englishSource', 'description'],
                },
              },
            },
            required: ['detectedLanguage', 'sentenceType', 'grammarNote', 'tokens'],
          },
        },
      });

      const rawJson = (response.text ?? '{}').trim();
      const parsed = JSON.parse(rawJson) as Omit<
        ISLTranslationResponse,
        'originalText' | 'islGlossSentence'
      >;

      const sanitizedTokens = (parsed.tokens || []).map((t) => {
        const cleanGloss = (t.gloss || '').toUpperCase().replace(/[\s-]+/g, '_');
        const nmm = VALID_NMMS.includes(t.nmm) ? t.nmm : 'neutral';
        const isFingerspell = t.type === 'fingerspell';
        const letters = isFingerspell
          ? (t.letters && t.letters.length > 0
              ? t.letters
              : cleanGloss.replace(/[^A-Z0-9]/g, '').split('')
            ).map((c) => c.toUpperCase())
          : undefined;

        return {
          gloss: cleanGloss,
          displayLabel: (t.displayLabel || cleanGloss.replace(/_/g, ' ')).toUpperCase(),
          type: isFingerspell ? ('fingerspell' as const) : ('sign' as const),
          letters,
          nmm,
          englishSource: t.englishSource || '',
          description: t.description || '',
        };
      });

      const result: ISLTranslationResponse = {
        originalText: rawText,
        detectedLanguage: parsed.detectedLanguage || 'English',
        sentenceType: parsed.sentenceType || 'statement',
        grammarNote:
          parsed.grammarNote || 'Arranged into Indian Sign Language Subject-Object-Verb order.',
        islGlossSentence: sanitizedTokens.map((t) => t.displayLabel).join(' '),
        tokens: sanitizedTokens,
      };

      return res.json(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to translate phrase into ISL.';
      console.error('ISL translation error:', err);
      return res.status(500).json({ error: message });
    }
  });

  // Audio transcription endpoint using gemini-3.5-transcribe (cross-browser fallback for speech input)
  app.post('/api/isl/transcribe', async (req, res) => {
    try {
      const audioBase64 = typeof req.body?.audioBase64 === 'string' ? req.body.audioBase64 : '';
      const mimeType = typeof req.body?.mimeType === 'string' ? req.body.mimeType : 'audio/webm';

      if (!audioBase64) {
        return res.status(400).json({ error: 'No audio payload received for transcription.' });
      }

      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-transcribe',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: audioBase64,
              },
            },
            {
              text: 'Transcribe the spoken speech accurately into plain text (English or Hindi). Return only the spoken words without extra commentary.',
            },
          ],
        },
      });

      const transcript = (response.text ?? '').trim();
      return res.json({ transcript });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Audio transcription failed.';
      console.error('Audio transcription error:', err);
      return res.status(500).json({ error: message });
    }
  });

  if (IS_PROD) {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('/{*splat}', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
  const url = `http://localhost:${PORT}/`;

  console.log(`VaaniMudra ISL server running at ${url}`);

  if (process.platform === 'win32') {
    exec(`start "" "${url}"`);
  }
});
}
startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
