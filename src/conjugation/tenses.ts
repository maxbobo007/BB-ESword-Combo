import { Person, Tense } from '@/conjugation/engine';

export interface TenseInfo {
  id: Tense;
  zh: string; // 中文名
  es: string; // 西语名
  level: 'A1' | 'A2' | 'B1';
  // 例句模板：{s} 主语代词，{f} 完整变位形式，{c} 动词搭配
  esFrame: string;
  // 中文模板：{S} 主语，{VP} 动词短语
  zhFrame: string;
}

// 按学习顺序排列；A1–A2 默认开启，B1 默认关闭（在设置里可以打开）
export const TENSES: TenseInfo[] = [
  { id: 'presente', zh: '现在时', es: 'presente', level: 'A1', esFrame: 'Normalmente, {s} {f} {c}.', zhFrame: '{S}平时{VP}。' },
  { id: 'gerundio', zh: '进行时', es: 'estar + gerundio', level: 'A1', esFrame: 'Ahora {s} {f} {c}.', zhFrame: '{S}现在正在{VP}。' },
  { id: 'perfecto', zh: '现在完成时', es: 'pretérito perfecto', level: 'A2', esFrame: 'Hoy {s} {f} {c}.', zhFrame: '{S}今天{VP}了。' },
  { id: 'indefinido', zh: '简单过去时', es: 'pretérito indefinido', level: 'A2', esFrame: 'Ayer {s} {f} {c}.', zhFrame: '{S}昨天{VP}了。' },
  { id: 'imperfecto', zh: '过去未完成时', es: 'pretérito imperfecto', level: 'A2', esFrame: 'Antes {s} {f} {c} a menudo.', zhFrame: '{S}以前常常{VP}。' },
  { id: 'futuro', zh: '将来时', es: 'futuro simple', level: 'A2', esFrame: 'Mañana {s} {f} {c}.', zhFrame: '{S}明天会{VP}。' },
  { id: 'imperativo', zh: '命令式', es: 'imperativo afirmativo', level: 'A2', esFrame: '¡{F} {c}!', zhFrame: '{S}{VP}吧！' },
  { id: 'condicional', zh: '条件式', es: 'condicional simple', level: 'B1', esFrame: 'Con más tiempo, {s} {f} {c}.', zhFrame: '如果有更多时间，{S}会{VP}。' },
  { id: 'subjPresente', zh: '虚拟式现在时', es: 'presente de subjuntivo', level: 'B1', esFrame: 'Es importante que {s} {f} {c}.', zhFrame: '{S}{VP}很重要。' },
  { id: 'pluscuamperfecto', zh: '过去完成时', es: 'pretérito pluscuamperfecto', level: 'B1', esFrame: 'A las ocho, {s} ya {f} {c}.', zhFrame: '八点的时候，{S}已经{VP}了。' },
];

export const TENSE_BY_ID = Object.fromEntries(TENSES.map(t => [t.id, t])) as Record<Tense, TenseInfo>;

export const DEFAULT_TENSES: Tense[] = TENSES.filter(t => t.level !== 'B1').map(t => t.id);

export const PRONOUN_ES = ['yo', 'tú', 'él', 'nosotros', 'vosotros', 'ellos'];
export const PRONOUN_ZH = ['我', '你', '他', '我们', '你们', '他们'];

// 命令式的"人称"：tú, usted, nosotros, vosotros, ustedes
export const IMPERATIVE_PERSON_ES: Record<number, string> = {
  1: 'tú',
  2: 'usted',
  3: 'nosotros',
  4: 'vosotros',
  5: 'ustedes',
};
export const IMPERATIVE_PERSON_ZH: Record<number, string> = {
  1: '（你）',
  2: '（您）请',
  3: '我们',
  4: '（你们）',
  5: '（各位）请',
};

export const personLabelZh = (tense: Tense, p: Person) =>
  tense === 'imperativo' ? IMPERATIVE_PERSON_ES[p] : PRONOUN_ZH[p];
