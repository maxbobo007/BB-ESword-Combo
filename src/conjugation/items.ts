import { isIrregular, Person, Tense } from '@/conjugation/engine';
import { buildExample, isUsable } from '@/conjugation/examples';
import { personLabelZh, TENSE_BY_ID } from '@/conjugation/tenses';
import { SAMPLE_WORDS, verbGroupOf } from '@/data/words';
import { Word } from '@/types/game';

export type ConjTopic = 'ar' | 'er' | 'ir' | 'irr';

export const CONJ_TOPIC_NAMES: Record<ConjTopic, string> = {
  ar: '-AR 动词',
  er: '-ER 动词',
  ir: '-IR 动词',
  irr: '不规则动词',
};

export interface ConjOptions {
  tenses: Tense[];
  vosotros: boolean;
}

const personsFor = (tense: Tense, vosotros: boolean): Person[] => {
  const all: Person[] = tense === 'imperativo' ? [1, 2, 3, 4, 5] : [0, 1, 2, 3, 4, 5];
  return vosotros ? all : all.filter(p => p !== 4);
};

// 某等级、某分组下能出变位题的动词
export const conjugationVerbs = (level: string, topic: ConjTopic, tenses: Tense[]): Word[] =>
  SAMPLE_WORDS.filter(
    w =>
      w.pos === 'verb' &&
      w.level === level &&
      (topic === 'irr' ? isIrregular(w.spanish) : verbGroupOf(w.spanish) === topic) &&
      tenses.some(t => isUsable(w.spanish, t))
  );

const pick = <T,>(items: T[], rng: () => number) => items[Math.floor(rng() * items.length)];

// 生成一题：动词 × 时态 × 人称 → 填字用的 Word（答案、提示、例句）
export const conjugationItem = (verb: Word, tense: Tense, p: Person): Word | null => {
  const ex = buildExample(verb.spanish, tense, p);
  if (!ex) return null;
  const info = TENSE_BY_ID[tense];
  const meaning = verb.chinese; // 用完整释义（例如 contar：数；讲述），和例句的意思对得上
  return {
    id: `c:${verb.spanish}:${tense}:${p}`,
    spanish: ex.answer,
    chinese: `${verb.spanish}（${meaning}）· ${personLabelZh(tense, p)} · ${info.zh}`,
    english: ex.auxiliary ? `${ex.auxiliary} ___` : info.es,
    level: verb.level,
    category: verb.category,
    pos: 'verb',
    exampleSentence: ex.es,
    exampleTranslation: ex.zh,
    exampleHighlight: ex.form,
  };
};

// 一个棋盘的候选题：尽量每个动词只出一次，答案不重复
export const conjugationPool = (
  level: string,
  topic: ConjTopic,
  opts: ConjOptions,
  size = 60,
  rng: () => number = Math.random
): Word[] => {
  const verbs = conjugationVerbs(level, topic, opts.tenses);
  const order = [...verbs].sort(() => rng() - 0.5);
  const seen = new Set<string>();
  const pool: Word[] = [];
  for (let round = 0; round < 3 && pool.length < size; round++) {
    for (const verb of order) {
      if (pool.length >= size) break;
      const tenses = opts.tenses.filter(t => isUsable(verb.spanish, t));
      if (tenses.length === 0) continue;
      const tense = pick(tenses, rng);
      const item = conjugationItem(verb, tense, pick(personsFor(tense, opts.vosotros), rng));
      if (!item || seen.has(item.spanish)) continue;
      seen.add(item.spanish);
      pool.push(item);
    }
  }
  return pool;
};
