import { conjugate, Person, Tense } from '@/conjugation/engine';
import { VERB_USAGE } from '@/conjugation/complements';
import { IMPERATIVE_PERSON_ZH, PRONOUN_ES, PRONOUN_ZH, TENSE_BY_ID } from '@/conjugation/tenses';

export interface Example {
  es: string;
  zh: string;
  form: string; // 完整变位形式，用于高亮
  answer: string; // 填字答案
  auxiliary?: string;
}

const capitalize = (s: string) => s.charAt(0).toLocaleUpperCase('es') + s.slice(1);

// 这个动词在这个时态下能不能出题
export const isUsable = (inf: string, tense: Tense) => {
  const u = VERB_USAGE[inf];
  if (!u || u.skip) return false;
  if (tense === 'imperativo' && u.noImp) return false;
  if (tense === 'gerundio' && u.noProg) return false;
  return true;
};

// 用时态模板 + 动词搭配生成例句：Ayer yo hablé con Ana. / 我昨天和安娜说话了。
export const buildExample = (inf: string, tense: Tense, p: Person): Example | null => {
  if (!isUsable(inf, tense)) return null;
  const conj = conjugate(inf, tense, p);
  if (!conj) return null;
  const u = VERB_USAGE[inf];
  const info = TENSE_BY_ID[tense];
  const es = info.esFrame
    .replace('{s}', PRONOUN_ES[p])
    .replace('{F}', capitalize(conj.form))
    .replace('{f}', conj.form)
    .replace('{c}', u.es);
  const subjectZh = tense === 'imperativo' ? IMPERATIVE_PERSON_ZH[p] : PRONOUN_ZH[p];
  const zh = info.zhFrame.replace('{S}', subjectZh).replace('{VP}', u.zh);
  return { es: capitalize(es), zh, form: conj.form, answer: conj.answer, auxiliary: conj.auxiliary };
};
