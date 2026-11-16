import { resolveLexiconSign } from '../data/islAliases';
import { ISL_LEXICON } from '../data/islLexicon';
import type { ISLSignDefinition, NMMType, TranslatedGlossToken } from '../types/isl';

export interface PlaybackStep {
  tokenIndex: number;
  gloss: string;
  displayLabel: string;
  letter?: string;
  nmm: NMMType;
  sign: ISLSignDefinition;
}

export function buildPlaybackSteps(tokens: TranslatedGlossToken[]): PlaybackStep[] {
  const steps: PlaybackStep[] = [];

  tokens.forEach((token, tokenIndex) => {
    if (token.type === 'sign') {
      const sign = resolveLexiconSign(token.gloss);
      if (sign) {
        steps.push({
          tokenIndex,
          gloss: sign.gloss,
          displayLabel: token.displayLabel || sign.gloss,
          nmm: token.nmm,
          sign,
        });
        return;
      }
    }

    // Fingerspell fallback (either explicit fingerspell token or unresolved gloss)
    const rawLetters =
      token.letters && token.letters.length > 0
        ? token.letters
        : token.gloss
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '')
            .split('');

    for (const ch of rawLetters) {
      const letterSign = ISL_LEXICON[`FS_${ch}`] ?? ISL_LEXICON[ch];
      if (letterSign) {
        steps.push({
          tokenIndex,
          gloss: token.gloss,
          displayLabel: `${token.displayLabel} (${ch})`,
          letter: ch,
          nmm: token.nmm,
          sign: letterSign,
        });
      }
    }
  });

  return steps;
}
