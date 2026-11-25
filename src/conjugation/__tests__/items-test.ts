import { PERSONS, Tense } from '@/conjugation/engine';
import { buildExample, isUsable } from '@/conjugation/examples';
import { conjugationPool, conjugationVerbs } from '@/conjugation/items';
import { TENSES } from '@/conjugation/tenses';
import { SAMPLE_WORDS } from '@/data/words';
import { createRng } from '@/utils/puzzleGenerator';

const verbs = SAMPLE_WORDS.filter(w => w.pos === 'verb').map(w => w.spanish);
const ALL_TENSES = TENSES.map(t => t.id);

describe('变位例句', () => {
  it('每个可用的 动词 × 时态 × 人称 都能生成完整例句', () => {
    let count = 0;
    for (const v of verbs) {
      for (const t of ALL_TENSES) {
        if (!isUsable(v, t)) continue;
        for (const p of PERSONS) {
          const ex = buildExample(v, t, p);
          if (t === 'imperativo' && p === 0) {
            expect(ex).toBeNull();
            continue;
          }
          expect(ex).not.toBeNull();
          const { es, zh, form, answer } = ex!;
          // 模板占位符都被替换了
          expect(es).not.toMatch(/[{}]/);
          expect(zh).not.toMatch(/[{}]/);
          // 例句里包含完整变位形式（不区分大小写），答案是能放进格子的单个词
          expect(es.toLocaleLowerCase('es')).toContain(form.toLocaleLowerCase('es'));
          expect(answer).toMatch(/^[a-záéíóúüñ]+$/);
          count++;
        }
      }
    }
    console.log('可生成的变位题数量', count);
    expect(count).toBeGreaterThan(8000);
  });

  it('例句示例', () => {
    expect(buildExample('hablar', 'indefinido', 0)).toMatchObject({
      es: 'Ayer yo hablé con Ana.',
      zh: '我昨天和安娜说话了。',
      answer: 'hablé',
    });
    expect(buildExample('comer', 'perfecto', 3)).toMatchObject({
      es: 'Hoy nosotros hemos comido paella.',
      answer: 'comido',
      auxiliary: 'hemos',
    });
    expect(buildExample('ir', 'imperativo', 1)).toMatchObject({ es: '¡Ve al cine!', zh: '（你）去电影院吧！' });
    expect(buildExample('leer', 'gerundio', 5)).toMatchObject({ es: 'Ahora ellos están leyendo el periódico.' });
    expect(buildExample('tener', 'subjPresente', 1)).toMatchObject({ es: 'Es importante que tú tengas paciencia.' });
  });

  it('标为 noImp / noProg / skip 的动词不出对应题型', () => {
    expect(isUsable('gustar', 'presente')).toBe(false);
    expect(isUsable('poder', 'imperativo')).toBe(false);
    expect(isUsable('ser', 'gerundio')).toBe(false);
    expect(isUsable('hablar', 'imperativo')).toBe(true);
  });
});

describe('变位出题池', () => {
  it('只出设置里开启的时态，答案不重复，关掉 vosotros 后不出 vosotros', () => {
    const tenses: Tense[] = ['indefinido', 'imperfecto'];
    const pool = conjugationPool('A1', 'ar', { tenses, vosotros: false }, 60, createRng(7));
    expect(pool.length).toBeGreaterThan(20);
    expect(new Set(pool.map(w => w.spanish)).size).toBe(pool.length);
    for (const w of pool) {
      const [, , tense, person] = w.id.split(':');
      expect(tenses).toContain(tense);
      expect(person).not.toBe('4');
      expect(w.exampleSentence).toBeTruthy();
      expect(w.exampleTranslation).toBeTruthy();
    }
  });

  it('A1、A2 的每个词尾分组和"不规则动词"都有足够的动词', () => {
    for (const level of ['A1', 'A2']) {
      for (const topic of ['ar', 'er', 'ir', 'irr'] as const) {
        expect(conjugationVerbs(level, topic, ALL_TENSES).length).toBeGreaterThanOrEqual(5);
      }
    }
  });
});
