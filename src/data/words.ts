import { LanguageLevel, PartOfSpeech, Word, WordCategory } from '@/types/game';
import { NOUNS, NounEntry, VERBS, VerbEntry } from '@/data/vocabulary';
import { MORE_NOUNS, MORE_VERBS } from '@/data/vocabularyMore';
import { buildExample } from '@/conjugation/examples';

// 最早的 20 个示例词（保留原 id，已有进度里引用了它们）
const LEGACY: Omit<Word, 'pos'>[] = [
  // A1 级别 - 食物
  {
    id: 'w001',
    spanish: 'agua',
    english: 'water',
    chinese: '水',
    level: 'A1',
    category: 'food',
    exampleSentence: 'Bebo agua todos los días.',
  },
  {
    id: 'w002',
    spanish: 'pan',
    english: 'bread',
    chinese: '面包',
    level: 'A1',
    category: 'food',
    exampleSentence: 'El pan está fresco.',
  },
  {
    id: 'w003',
    spanish: 'leche',
    english: 'milk',
    chinese: '牛奶',
    level: 'A1',
    category: 'food',
    exampleSentence: 'Me gusta la leche fría.',
  },
  {
    id: 'w004',
    spanish: 'café',
    english: 'coffee',
    chinese: '咖啡',
    level: 'A1',
    category: 'food',
    exampleSentence: 'Tomo café por la mañana.',
  },
  {
    id: 'w005',
    spanish: 'fruta',
    english: 'fruit',
    chinese: '水果',
    level: 'A1',
    category: 'food',
    exampleSentence: 'Como fruta cada día.',
  },

  // A1 级别 - 家庭
  {
    id: 'w006',
    spanish: 'madre',
    english: 'mother',
    chinese: '母亲',
    level: 'A1',
    category: 'family',
    exampleSentence: 'Mi madre es médica.',
  },
  {
    id: 'w007',
    spanish: 'padre',
    english: 'father',
    chinese: '父亲',
    level: 'A1',
    category: 'family',
    exampleSentence: 'Mi padre trabaja en una oficina.',
  },
  {
    id: 'w008',
    spanish: 'hijo',
    english: 'son',
    chinese: '儿子',
    level: 'A1',
    category: 'family',
    exampleSentence: 'Tengo un hijo pequeño.',
  },
  {
    id: 'w009',
    spanish: 'hija',
    english: 'daughter',
    chinese: '女儿',
    level: 'A1',
    category: 'family',
    exampleSentence: 'Mi hija tiene cinco años.',
  },
  {
    id: 'w010',
    spanish: 'hermano',
    english: 'brother',
    chinese: '兄弟',
    level: 'A1',
    category: 'family',
    exampleSentence: 'Mi hermano vive en Madrid.',
  },

  // A2 级别 - 旅行
  {
    id: 'w011',
    spanish: 'viaje',
    english: 'trip',
    chinese: '旅行',
    level: 'A1',
    category: 'travel',
    exampleSentence: 'El viaje fue increíble.',
  },
  {
    id: 'w012',
    spanish: 'hotel',
    english: 'hotel',
    chinese: '酒店',
    level: 'A1',
    category: 'travel',
    exampleSentence: 'Reservé un hotel cerca de la playa.',
  },
  {
    id: 'w013',
    spanish: 'playa',
    english: 'beach',
    chinese: '海滩',
    level: 'A1',
    category: 'travel',
    exampleSentence: 'Vamos a la playa este verano.',
  },
  {
    id: 'w014',
    spanish: 'avión',
    english: 'airplane',
    chinese: '飞机',
    level: 'A1',
    category: 'travel',
    exampleSentence: 'El avión sale a las tres.',
  },
  {
    id: 'w015',
    spanish: 'maleta',
    english: 'suitcase',
    chinese: '行李箱',
    level: 'A2',
    category: 'travel',
    exampleSentence: 'Necesito una maleta grande.',
  },

  // B1 级别 - 工作
  {
    id: 'w016',
    spanish: 'trabajo',
    english: 'work',
    chinese: '工作',
    level: 'A1',
    category: 'work',
    exampleSentence: 'Mi trabajo es muy interesante.',
  },
  {
    id: 'w017',
    spanish: 'jefe',
    english: 'boss',
    chinese: '老板；上司',
    level: 'A1',
    category: 'work',
    exampleSentence: 'Mi jefe es muy exigente.',
  },
  {
    id: 'w018',
    spanish: 'oficina',
    english: 'office',
    chinese: '办公室',
    level: 'A1',
    category: 'work',
    exampleSentence: 'La oficina está en el centro.',
  },
  {
    id: 'w019',
    spanish: 'reunión',
    english: 'meeting',
    chinese: '会议',
    level: 'A2',
    category: 'work',
    exampleSentence: 'Tenemos una reunión importante.',
  },
  {
    id: 'w020',
    spanish: 'proyecto',
    english: 'project',
    chinese: '项目',
    level: 'A2',
    category: 'work',
    exampleSentence: 'Estamos trabajando en un nuevo proyecto.',
  },
];

const LEGACY_GENDER: Record<string, 'm' | 'f'> = {
  agua: 'f', pan: 'm', leche: 'f', café: 'm', fruta: 'f',
  madre: 'f', padre: 'm', hijo: 'm', hija: 'f', hermano: 'm',
  viaje: 'm', hotel: 'm', playa: 'f', avión: 'm', maleta: 'f',
  trabajo: 'm', jefe: 'm', oficina: 'f', reunión: 'f', proyecto: 'm',
};

// 动词的大致主题只用于兼容 Word 类型；动词模式按词尾分组，不按主题
const VERB_CATEGORY: WordCategory = 'culture';

type NounTable = Partial<Record<WordCategory, Partial<Record<LanguageLevel, NounEntry[]>>>>;
type VerbTable = Partial<Record<LanguageLevel, VerbEntry[]>>;

const nounsFrom = (table: NounTable): Word[] =>
  (Object.entries(table) as [WordCategory, Partial<Record<LanguageLevel, NounEntry[]>>][]).flatMap(
    ([category, byLevel]) =>
      (Object.entries(byLevel) as [LanguageLevel, NounEntry[]][]).flatMap(([level, entries]) =>
        entries.map(([spanish, chinese, english, gender]) => ({
          id: `n:${spanish}`,
          spanish,
          chinese,
          english,
          level,
          category,
          pos: 'noun' as const,
          gender,
        }))
      )
  );

// 动词原形模式答对时弹出的例句：用现在时 yo 的模板生成
const verbExample = (inf: string) => {
  const ex = buildExample(inf, 'presente', 0);
  return ex
    ? { exampleSentence: ex.es, exampleTranslation: ex.zh, exampleHighlight: ex.form }
    : {};
};

const verbsFrom = (table: VerbTable): Word[] =>
  (Object.entries(table) as [LanguageLevel, VerbEntry[]][]).flatMap(([level, entries]) =>
    entries.map(([spanish, chinese, english]) => ({
      id: `v:${spanish}`,
      spanish,
      chinese,
      english,
      level,
      category: VERB_CATEGORY,
      pos: 'verb' as const,
      ...verbExample(spanish),
    }))
  );

const nounWords = [...nounsFrom(NOUNS), ...nounsFrom(MORE_NOUNS)];
const verbWords = [...verbsFrom(VERBS), ...verbsFrom(MORE_VERBS)];

export const SAMPLE_WORDS: Word[] = [
  ...LEGACY.map(w => ({ ...w, pos: 'noun' as const, gender: LEGACY_GENDER[w.spanish] })),
  ...nounWords,
  ...verbWords,
];

// ---------- 模式与主题 ----------

export type Mode = PartOfSpeech; // 名词 / 动词原形（变位模式见 src/conjugation/items.ts）
export type VerbGroup = 'ar' | 'er' | 'ir';

export const VERB_GROUP_NAMES: Record<VerbGroup, string> = {
  ar: '-AR 动词',
  er: '-ER 动词',
  ir: '-IR 动词',
};

export const CATEGORY_NAMES: Record<WordCategory, string> = {
  food: '食物',
  family: '家庭',
  travel: '旅行',
  work: '工作',
  health: '身体与健康',
  nature: '自然',
  education: '学校',
  sports: '运动',
  technology: '科技',
  culture: '文化娱乐',
  home: '家居',
  clothing: '服装',
  city: '城市与场所',
  time: '时间',
  professions: '职业',
};

// 一局至少需要的单词数
export const MIN_WORDS_PER_PUZZLE = 6;

export const verbGroupOf = (infinitive: string): VerbGroup | null => {
  const end = infinitive.normalize('NFC').slice(-2).toLowerCase();
  if (end === 'ar') return 'ar';
  if (end === 'er') return 'er';
  if (end === 'ir' || end === 'ír') return 'ir';
  return null;
};

// 某个模式、等级、主题下的全部单词
export const getTopicWords = (mode: Mode, level: string, topic: string): Word[] =>
  SAMPLE_WORDS.filter(
    w =>
      w.pos === mode &&
      w.level === level &&
      (mode === 'verb' ? verbGroupOf(w.spanish) === topic : w.category === topic)
  );

export interface TopicOption {
  id: string;
  name: string;
  count: number;
}

// 某个模式和等级下，单词数量足够开一局的主题
export const getTopics = (mode: Mode, level: string): TopicOption[] => {
  const ids: string[] =
    mode === 'verb' ? (Object.keys(VERB_GROUP_NAMES) as VerbGroup[]) : (Object.keys(CATEGORY_NAMES) as WordCategory[]);
  return ids
    .map(id => ({
      id,
      name: mode === 'verb' ? VERB_GROUP_NAMES[id as VerbGroup] : CATEGORY_NAMES[id as WordCategory],
      count: getTopicWords(mode, level, id).length,
    }))
    .filter(t => t.count >= MIN_WORDS_PER_PUZZLE);
};

// 打乱顺序（Fisher–Yates）
export const shuffle = <T,>(items: T[]): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};
