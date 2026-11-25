import { SAMPLE_WORDS } from '@/data/words';
import { VERB_USAGE } from '@/conjugation/complements';

describe('动词例句搭配', () => {
  it('词库里每个动词都配了搭配（或明确标为不出变位题）', () => {
    const verbs = SAMPLE_WORDS.filter(w => w.pos === 'verb').map(w => w.spanish);
    const missing = verbs.filter(v => !VERB_USAGE[v]);
    const extra = Object.keys(VERB_USAGE).filter(v => !verbs.includes(v));
    expect({ missing, extra }).toEqual({ missing: [], extra: [] });
  });
});
