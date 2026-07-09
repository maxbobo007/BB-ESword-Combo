import { parsePackText } from '@/core/data/importPack';

describe('parsePackText', () => {
  it('解析 JSON 单词数组', () => {
    const text = JSON.stringify([
      { spanish: 'gato', english: 'cat', chinese: '猫' },
      { spanish: 'perro', english: 'dog', chinese: '狗' },
      { spanish: 'casa', english: 'house', chinese: '房子' },
      { spanish: 'libro', english: 'book', chinese: '书' },
      { spanish: 'mesa', english: 'table', chinese: '桌子' },
    ]);
    const result = parsePackText(text, 'custom_1', '我的词库');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.pack.words).toHaveLength(5);
      expect(result.pack.name).toBe('我的词库');
      expect(result.pack.builtin).toBe(false);
      expect(result.pack.words[0].id).toBe('custom_1_001');
    }
  });

  it('解析含 name/words 的 JSON 包对象', () => {
    const text = JSON.stringify({
      name: '动物词汇',
      words: [
        { spanish: 'gato', english: 'cat', chinese: '猫' },
        { spanish: 'perro', english: 'dog', chinese: '狗' },
        { spanish: 'pájaro', english: 'bird', chinese: '鸟' },
        { spanish: 'caballo', english: 'horse', chinese: '马' },
        { spanish: 'ratón', english: 'mouse', chinese: '老鼠' },
      ],
    });
    const result = parsePackText(text, 'custom_2', '默认名');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.pack.name).toBe('动物词汇');
      expect(result.pack.words.map(w => w.spanish)).toContain('pájaro');
    }
  });

  it('解析带表头的 CSV', () => {
    const text = [
      'spanish,english,chinese,level,category,exampleSentence',
      'gato,cat,猫,A1,nature,El gato duerme.',
      'perro,dog,狗,A1,nature,El perro corre.',
      'casa,house,房子,A1,family,Mi casa es grande.',
      'libro,book,书,A1,education,Leo un libro.',
      'mesa,table,桌子,A1,family,La mesa es azul.',
    ].join('\n');
    const result = parsePackText(text, 'custom_3', 'CSV 词库');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.pack.words).toHaveLength(5);
      expect(result.pack.words[0].category).toBe('nature');
      expect(result.pack.words[0].exampleSentence).toBe('El gato duerme.');
    }
  });

  it('无表头 CSV 按默认列序解析', () => {
    const text = ['gato,cat,猫', 'perro,dog,狗', 'casa,house,房子', 'libro,book,书', 'mesa,table,桌子'].join(
      '\n',
    );
    const result = parsePackText(text, 'custom_4', '无表头');
    expect(result.ok).toBe(true);
  });

  it('非法西语单词报错并指明位置', () => {
    const text = JSON.stringify([
      { spanish: 'gato', english: 'cat', chinese: '猫' },
      { spanish: 'two words', english: 'x', chinese: 'x' },
    ]);
    const result = parsePackText(text, 'custom_5', 'x');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('第 2 个');
    }
  });

  it('大写和重音自动归一到小写原形', () => {
    const text = JSON.stringify([
      { spanish: 'GATO', english: 'cat', chinese: '猫' },
      { spanish: 'Avión', english: 'plane', chinese: '飞机' },
      { spanish: 'casa', english: 'house', chinese: '房子' },
      { spanish: 'libro', english: 'book', chinese: '书' },
      { spanish: 'mesa', english: 'table', chinese: '桌子' },
    ]);
    const result = parsePackText(text, 'custom_6', 'x');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.pack.words[0].spanish).toBe('gato');
      expect(result.pack.words[1].spanish).toBe('avión');
    }
  });

  it('重复单词去重，少于 5 个有效词报错', () => {
    const dup = JSON.stringify([
      { spanish: 'gato', english: 'cat', chinese: '猫' },
      { spanish: 'gato', english: 'cat', chinese: '猫' },
      { spanish: 'perro', english: 'dog', chinese: '狗' },
    ]);
    const result = parsePackText(dup, 'custom_7', 'x');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain('至少需要 5 个');
    }
  });

  it('缺翻译、空内容、坏 JSON 都报错', () => {
    expect(parsePackText('', 'c', 'x').ok).toBe(false);
    expect(parsePackText('{bad json', 'c', 'x').ok).toBe(false);
    const noTrans = JSON.stringify([{ spanish: 'gato' }]);
    expect(parsePackText(noTrans, 'c', 'x').ok).toBe(false);
  });
});
