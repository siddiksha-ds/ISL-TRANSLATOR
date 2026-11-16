import { Play, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ISL_LEXICON } from '../data/islLexicon';
import type { ISLSignDefinition, SignCategory } from '../types/isl';

interface LexiconDrawerProps {
  mode: 'lexicon' | 'fingerspelling';
  onClose: () => void;
  onSelectSign: (sign: ISLSignDefinition) => void;
}

const VOCAB_CATEGORIES: Array<'All' | Exclude<SignCategory, 'Fingerspelling'>> = [
  'All',
  'Greetings',
  'Pronouns',
  'Questions',
  'Time',
  'People',
  'Actions',
  'Places',
  'Objects & Needs',
  'Emotions',
  'Modifiers',
];

export function LexiconDrawer({ mode, onClose, onSelectSign }: LexiconDrawerProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] =
    useState<'All' | Exclude<SignCategory, 'Fingerspelling'>>('All');

  const allSigns = useMemo(() => Object.values(ISL_LEXICON), []);

  const filteredVocab = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allSigns.filter((s) => {
      if (s.category === 'Fingerspelling') return false;
      if (category !== 'All' && s.category !== category) return false;
      if (!q) return true;
      return (
        s.gloss.toLowerCase().includes(q) ||
        s.meaning.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
      );
    });
  }, [allSigns, category, query]);

  const fingerspellItems = useMemo(() => {
    const letters = allSigns.filter((s) => s.category === 'Fingerspelling');
    const alpha = letters.filter((s) => /^[A-Z]$/.test(s.gloss));
    const digits = letters.filter((s) => /^[0-9]$/.test(s.gloss));
    return { alpha, digits };
  }, [allSigns]);

  return (
    <aside
      className="absolute top-16 right-4 z-30 flex max-h-[calc(100vh-14.5rem)] w-[min(430px,calc(100vw-2rem))] flex-col rounded-2xl border border-white/10 bg-slate-900/95 shadow-2xl"
      aria-label={mode === 'lexicon' ? 'ISL Sign Lexicon' : 'ISL Two-Handed Fingerspelling'}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div>
          <h2 className="font-display text-base font-semibold text-slate-100">
            {mode === 'lexicon' ? 'ISL Sign Lexicon' : 'ISL Manual Alphabet & Digits'}
          </h2>
          <p className="text-xs text-slate-400">
            {mode === 'lexicon'
              ? `${filteredVocab.length} signs ready for 3D demonstration`
              : 'Two-handed Indian Sign Language alphabet & numerals'}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-amber-400"
          aria-label="Close panel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {mode === 'lexicon' ? (
        <>
          <div className="space-y-2.5 border-b border-white/10 p-3.5">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search gloss or English meaning..."
                className="w-full rounded-lg border border-white/10 bg-slate-950 py-2 pr-3 pl-9 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {VOCAB_CATEGORIES.map((cat) => {
                const active = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                      active
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 divide-y divide-white/5 overflow-y-auto p-2">
            {filteredVocab.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-slate-400">
                No matching ISL gloss found.
              </p>
            ) : (
              filteredVocab.map((item) => (
                <button
                  key={item.gloss}
                  type="button"
                  onClick={() => onSelectSign(item)}
                  className="group flex w-full items-start justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/5"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="font-mono text-sm font-semibold text-amber-300">
                        {item.gloss.replace(/_/g, ' ')}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{item.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.twoHanded ? '2-hand' : '1-hand'}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-300">{item.meaning}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-slate-400">
                      {item.description}
                    </p>
                  </div>
                  <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-300 transition-colors group-hover:bg-amber-400 group-hover:text-slate-950">
                    <Play className="h-3.5 w-3.5 fill-current" />
                  </span>
                </button>
              ))
            )}
          </div>
        </>
      ) : (
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          <div>
            <p className="mb-2 text-xs font-medium text-slate-400">
              Alphabet (A–Z) — Click any character to sign
            </p>
            <div className="grid grid-cols-6 gap-2">
              {fingerspellItems.alpha.map((item) => (
                <button
                  key={item.gloss}
                  type="button"
                  onClick={() => onSelectSign(item)}
                  className="flex h-11 items-center justify-center rounded-lg border border-white/10 bg-slate-800/80 font-mono text-sm font-semibold text-slate-100 transition-colors hover:border-amber-400 hover:bg-amber-400 hover:text-slate-950"
                  title={item.description}
                >
                  {item.gloss}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-slate-400">Numerals (0–9)</p>
            <div className="grid grid-cols-5 gap-2">
              {fingerspellItems.digits.map((item) => (
                <button
                  key={item.gloss}
                  type="button"
                  onClick={() => onSelectSign(item)}
                  className="flex h-11 items-center justify-center rounded-lg border border-white/10 bg-slate-800/80 font-mono text-sm font-semibold text-slate-100 tabular-nums transition-colors hover:border-amber-400 hover:bg-amber-400 hover:text-slate-950"
                  title={item.description}
                >
                  {item.gloss}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
