// 西语动词变位引擎：规则词尾 + 词干变化 + 拼写变化 + 不规则动词表。
// 只覆盖词库里的动词会用到的规则；新增动词时要补测试（src/conjugation/__tests__）。

export type Tense =
  | 'presente' // 陈述式现在时
  | 'perfecto' // 现在完成时（he + 过去分词）
  | 'indefinido' // 简单过去时
  | 'imperfecto' // 过去未完成时
  | 'futuro' // 简单将来时
  | 'imperativo' // 肯定命令式
  | 'gerundio' // 副动词（estar + 副动词 = 进行时）
  | 'condicional' // 简单条件式
  | 'subjPresente' // 虚拟式现在时
  | 'pluscuamperfecto'; // 过去完成时（había + 过去分词）

// 0 yo · 1 tú · 2 él/ella/usted · 3 nosotros · 4 vosotros · 5 ellos/ellas/ustedes
export type Person = 0 | 1 | 2 | 3 | 4 | 5;
export const PERSONS: Person[] = [0, 1, 2, 3, 4, 5];

type Group = 'ar' | 'er' | 'ir';

// ---------- 词干变化 ----------

const E_IE = new Set([
  'pensar', 'empezar', 'cerrar', 'entender', 'perder', 'querer', 'preferir', 'sentir', 'despertar',
  'calentar', 'defender', 'encender', 'atender', 'divertir', 'mentir', 'sugerir', 'nevar',
]);
const O_UE = new Set([
  'poder', 'volver', 'devolver', 'mover', 'dormir', 'recordar', 'encontrar', 'contar', 'costar',
  'probar', 'mostrar', 'aprobar', 'colgar', 'soñar', 'llover', 'morir',
]);
const U_UE = new Set(['jugar']);
const E_I = new Set([
  'pedir', 'repetir', 'servir', 'seguir', 'corregir', 'elegir', 'medir', 'despedir', 'vestir',
]);
// 现在时 i/u 加重音：envío、reúno
const ACCENT_I = new Set(['enviar', 'esquiar']);
const ACCENT_U = new Set(['reunir']);

// ---------- 完全或部分不规则 ----------

const PRESENT_FULL: Record<string, string[]> = {
  ser: ['soy', 'eres', 'es', 'somos', 'sois', 'son'],
  estar: ['estoy', 'estás', 'está', 'estamos', 'estáis', 'están'],
  ir: ['voy', 'vas', 'va', 'vamos', 'vais', 'van'],
  haber: ['he', 'has', 'ha', 'hemos', 'habéis', 'han'],
  oír: ['oigo', 'oyes', 'oye', 'oímos', 'oís', 'oyen'],
  tener: ['tengo', 'tienes', 'tiene', 'tenemos', 'tenéis', 'tienen'],
  venir: ['vengo', 'vienes', 'viene', 'venimos', 'venís', 'vienen'],
  decir: ['digo', 'dices', 'dice', 'decimos', 'decís', 'dicen'],
  dar: ['doy', 'das', 'da', 'damos', 'dais', 'dan'],
  ver: ['veo', 'ves', 've', 'vemos', 'veis', 'ven'],
  reír: ['río', 'ríes', 'ríe', 'reímos', 'reís', 'ríen'],
  sonreír: ['sonrío', 'sonríes', 'sonríe', 'sonreímos', 'sonreís', 'sonríen'],
  huir: ['huyo', 'huyes', 'huye', 'huimos', 'huis', 'huyen'],
};

// 只有 yo 不规则
const PRESENT_YO: Record<string, string> = {
  hacer: 'hago', poner: 'pongo', salir: 'salgo', traer: 'traigo', caer: 'caigo', saber: 'sé',
};

const PRETERITE_FULL: Record<string, string[]> = {
  ser: ['fui', 'fuiste', 'fue', 'fuimos', 'fuisteis', 'fueron'],
  ir: ['fui', 'fuiste', 'fue', 'fuimos', 'fuisteis', 'fueron'],
  dar: ['di', 'diste', 'dio', 'dimos', 'disteis', 'dieron'],
  ver: ['vi', 'viste', 'vio', 'vimos', 'visteis', 'vieron'],
  reír: ['reí', 'reíste', 'rio', 'reímos', 'reísteis', 'rieron'],
  sonreír: ['sonreí', 'sonreíste', 'sonrio', 'sonreímos', 'sonreísteis', 'sonrieron'],
  huir: ['hui', 'huiste', 'huyó', 'huimos', 'huisteis', 'huyeron'],
};

// 强变化过去时词干：tuve, hice, dije…
const PRETERITE_STRONG: Record<string, string> = {
  tener: 'tuv', estar: 'estuv', poder: 'pud', poner: 'pus', saber: 'sup', querer: 'quis',
  venir: 'vin', hacer: 'hic', decir: 'dij', traer: 'traj', conducir: 'conduj',
  traducir: 'traduj', producir: 'produj',
};

const IMPERFECT_FULL: Record<string, string[]> = {
  ser: ['era', 'eras', 'era', 'éramos', 'erais', 'eran'],
  ir: ['iba', 'ibas', 'iba', 'íbamos', 'ibais', 'iban'],
  ver: ['veía', 'veías', 'veía', 'veíamos', 'veíais', 'veían'],
};

const FUTURE_STEM: Record<string, string> = {
  tener: 'tendr', venir: 'vendr', poner: 'pondr', salir: 'saldr', poder: 'podr', saber: 'sabr',
  querer: 'querr', hacer: 'har', decir: 'dir', haber: 'habr', valer: 'valdr',
  oír: 'oir', reír: 'reir', sonreír: 'sonreir',
};

const SUBJ_FULL: Record<string, string[]> = {
  ser: ['sea', 'seas', 'sea', 'seamos', 'seáis', 'sean'],
  estar: ['esté', 'estés', 'esté', 'estemos', 'estéis', 'estén'],
  ir: ['vaya', 'vayas', 'vaya', 'vayamos', 'vayáis', 'vayan'],
  saber: ['sepa', 'sepas', 'sepa', 'sepamos', 'sepáis', 'sepan'],
  dar: ['dé', 'des', 'dé', 'demos', 'deis', 'den'],
  haber: ['haya', 'hayas', 'haya', 'hayamos', 'hayáis', 'hayan'],
  reír: ['ría', 'rías', 'ría', 'riamos', 'riais', 'rían'],
  sonreír: ['sonría', 'sonrías', 'sonría', 'sonriamos', 'sonriais', 'sonrían'],
};

const IMPERATIVE_TU: Record<string, string> = {
  decir: 'di', hacer: 'haz', ir: 've', poner: 'pon', salir: 'sal', ser: 'sé', tener: 'ten', venir: 'ven',
};

const PARTICIPLE: Record<string, string> = {
  abrir: 'abierto', escribir: 'escrito', describir: 'descrito', ver: 'visto', hacer: 'hecho',
  poner: 'puesto', decir: 'dicho', volver: 'vuelto', devolver: 'devuelto', romper: 'roto',
  cubrir: 'cubierto', imprimir: 'impreso', morir: 'muerto',
};

const GERUND: Record<string, string> = {
  ir: 'yendo', decir: 'diciendo', venir: 'viniendo', poder: 'pudiendo', reír: 'riendo',
  sonreír: 'sonriendo',
};

// ---------- 工具函数 ----------

const groupOf = (inf: string): Group => {
  const end = inf.slice(-2);
  if (end === 'ar') return 'ar';
  if (end === 'er') return 'er';
  return 'ir'; // -ir 和 -ír（oír, reír）
};

const stemOf = (inf: string) => inf.slice(0, -2);

// 把词干里最后一个 from 换成 to（pens → piens）
const replaceLast = (stem: string, from: string, to: string) => {
  const i = stem.lastIndexOf(from);
  return i < 0 ? stem : stem.slice(0, i) + to + stem.slice(i + from.length);
};

// 靴型词干变化（重读在词干上的人称）
const bootStem = (inf: string): string => {
  const stem = stemOf(inf);
  if (E_IE.has(inf)) return replaceLast(stem, 'e', 'ie');
  if (O_UE.has(inf)) return replaceLast(stem, 'o', 'ue');
  if (U_UE.has(inf)) return replaceLast(stem, 'u', 'ue');
  if (E_I.has(inf)) return replaceLast(stem, 'e', 'i');
  return stem;
};

// -ir 词干变化动词在过去时第三人称、副动词、虚拟式 nosotros/vosotros 中的弱变化：e→i，o→u
const weakStem = (inf: string): string => {
  const stem = stemOf(inf);
  if (groupOf(inf) !== 'ir') return stem;
  if (E_IE.has(inf) || E_I.has(inf)) return replaceLast(stem, 'e', 'i');
  if (O_UE.has(inf)) return replaceLast(stem, 'o', 'u');
  return stem;
};

const isUir = (inf: string) => /[^g]uir$/.test(inf); // construir, huir（seguir 不算）
const vowelStemEr = (inf: string) => /[aeo](er|ir|ír)$/.test(inf) && !isUir(inf); // leer, creer, caer, traer, oír

// 词尾以 e/é 开头时的拼写变化：c→qu，g→gu，z→c（-ar 动词）
const spellBeforeE = (stem: string) => {
  if (stem.endsWith('c')) return stem.slice(0, -1) + 'qu';
  if (stem.endsWith('g')) return stem.slice(0, -1) + 'gu';
  if (stem.endsWith('z')) return stem.slice(0, -1) + 'c';
  return stem;
};

// 词尾以 a/o 开头时的拼写变化：g→j，gu→g，c→zc / z（-er/-ir 动词）
const spellBeforeAO = (inf: string, stem: string) => {
  if (/(ger|gir)$/.test(inf) && stem.endsWith('g')) return stem.slice(0, -1) + 'j';
  if (inf.endsWith('guir') && stem.endsWith('gu')) return stem.slice(0, -2) + 'g';
  if (/[aeiou]c(er|ir)$/.test(inf) && stem.endsWith('c')) return stem.slice(0, -1) + 'zc';
  if (/[^aeiou]cer$/.test(inf) && stem.endsWith('c')) return stem.slice(0, -1) + 'z';
  return stem;
};

const ENDINGS = {
  presente: {
    ar: ['o', 'as', 'a', 'amos', 'áis', 'an'],
    er: ['o', 'es', 'e', 'emos', 'éis', 'en'],
    ir: ['o', 'es', 'e', 'imos', 'ís', 'en'],
  },
  indefinido: {
    ar: ['é', 'aste', 'ó', 'amos', 'asteis', 'aron'],
    er: ['í', 'iste', 'ió', 'imos', 'isteis', 'ieron'],
    ir: ['í', 'iste', 'ió', 'imos', 'isteis', 'ieron'],
  },
  imperfecto: {
    ar: ['aba', 'abas', 'aba', 'ábamos', 'abais', 'aban'],
    er: ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'],
    ir: ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'],
  },
  subj: {
    ar: ['e', 'es', 'e', 'emos', 'éis', 'en'],
    er: ['a', 'as', 'a', 'amos', 'áis', 'an'],
    ir: ['a', 'as', 'a', 'amos', 'áis', 'an'],
  },
  futuro: ['é', 'ás', 'á', 'emos', 'éis', 'án'],
  condicional: ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'],
};

const STRONG_ENDINGS = ['e', 'iste', 'o', 'imos', 'isteis', 'ieron'];
const BOOT_PERSONS: Person[] = [0, 1, 2, 5];

const hasStemChange = (inf: string) => E_IE.has(inf) || O_UE.has(inf) || U_UE.has(inf) || E_I.has(inf);

// ---------- 各时态 ----------

export const presente = (inf: string, p: Person): string => {
  if (PRESENT_FULL[inf]) return PRESENT_FULL[inf][p];
  if (p === 0 && PRESENT_YO[inf]) return PRESENT_YO[inf];
  const g = groupOf(inf);
  const ending = ENDINGS.presente[g][p];
  let stem = BOOT_PERSONS.includes(p) ? bootStem(inf) : stemOf(inf);
  if (BOOT_PERSONS.includes(p) && ACCENT_I.has(inf)) stem = replaceLast(stem, 'i', 'í');
  if (BOOT_PERSONS.includes(p) && ACCENT_U.has(inf)) stem = replaceLast(stem, 'u', 'ú');
  if (isUir(inf) && !/^[ií]/.test(ending)) stem += 'y'; // construyo, construyes（construimos, construís 不加）
  if (p === 0) stem = spellBeforeAO(inf, stem);
  return stem + ending;
};

export const indefinido = (inf: string, p: Person): string => {
  if (PRETERITE_FULL[inf]) return PRETERITE_FULL[inf][p];
  const strong = PRETERITE_STRONG[inf];
  if (strong) {
    if (inf === 'hacer' && p === 2) return 'hizo';
    let ending = STRONG_ENDINGS[p];
    if (p === 5 && strong.endsWith('j')) ending = 'eron'; // dijeron, trajeron
    return strong + ending;
  }
  const g = groupOf(inf);
  let ending = ENDINGS.indefinido[g][p];
  let stem = stemOf(inf);
  if (g === 'ar' && p === 0) stem = spellBeforeE(stem); // busqué, llegué, empecé
  if (g !== 'ar' && (p === 2 || p === 5)) stem = weakStem(inf); // pidió, durmieron
  if (vowelStemEr(inf) || isUir(inf)) {
    // leyó, leyeron, construyó
    if (p === 2) ending = 'yó';
    if (p === 5) ending = 'yeron';
    // leí, leíste, leímos（-uir 不加重音：construiste）
    if (vowelStemEr(inf) && [1, 3, 4].includes(p)) ending = ending.replace(/^i/, 'í');
  }
  return stem + ending;
};

export const imperfecto = (inf: string, p: Person): string => {
  if (IMPERFECT_FULL[inf]) return IMPERFECT_FULL[inf][p];
  const g = groupOf(inf);
  return stemOf(inf) + ENDINGS.imperfecto[g][p];
};

const futureStem = (inf: string) => FUTURE_STEM[inf] ?? inf;

export const futuro = (inf: string, p: Person): string => futureStem(inf) + ENDINGS.futuro[p];

export const condicional = (inf: string, p: Person): string => futureStem(inf) + ENDINGS.condicional[p];

export const subjPresente = (inf: string, p: Person): string => {
  if (SUBJ_FULL[inf]) return SUBJ_FULL[inf][p];
  const g = groupOf(inf);
  const ending = ENDINGS.subj[g][p];
  const yo = presente(inf, 0);
  let stem = yo.endsWith('o') ? yo.slice(0, -1) : stemOf(inf);
  if (p === 3 || p === 4) {
    // 靴型变化动词的 nosotros/vosotros 回到原词干（-ir 动词用弱变化）
    if (hasStemChange(inf)) stem = groupOf(inf) === 'ir' ? spellBeforeAO(inf, weakStem(inf)) : stemOf(inf);
    if (ACCENT_I.has(inf) || ACCENT_U.has(inf)) stem = stemOf(inf); // enviemos, reunamos
  }
  if (g === 'ar') stem = spellBeforeE(stem); // busque, juegue, empiece
  return stem + ending;
};

// 肯定命令式：p = 1 tú · 2 usted · 3 nosotros · 4 vosotros · 5 ustedes（yo 没有命令式）
export const imperativo = (inf: string, p: Person): string | null => {
  if (p === 0) return null;
  if (p === 1) return IMPERATIVE_TU[inf] ?? presente(inf, 2);
  if (p === 4) return inf === 'ir' ? 'id' : inf.slice(0, -1) + 'd'; // hablad, comed, oíd
  if (p === 3 && inf === 'ir') return 'vamos';
  return subjPresente(inf, p);
};

export const participio = (inf: string): string => {
  if (PARTICIPLE[inf]) return PARTICIPLE[inf];
  const g = groupOf(inf);
  if (g === 'ar') return stemOf(inf) + 'ado';
  if (vowelStemEr(inf)) return stemOf(inf) + 'ído'; // leído, oído, traído
  return stemOf(inf) + 'ido';
};

export const gerundio = (inf: string): string => {
  if (GERUND[inf]) return GERUND[inf];
  const g = groupOf(inf);
  if (g === 'ar') return stemOf(inf) + 'ando';
  if (vowelStemEr(inf) || isUir(inf)) return stemOf(inf) + 'yendo'; // leyendo, construyendo
  return weakStem(inf) + 'iendo'; // pidiendo, durmiendo
};

const HABER_PRESENT = PRESENT_FULL.haber;
const HABER_IMPERFECT = ['había', 'habías', 'había', 'habíamos', 'habíais', 'habían'];
const ESTAR_PRESENT = PRESENT_FULL.estar;

export interface Conjugated {
  form: string; // 完整形式，例如 "he hablado"
  answer: string; // 填进格子的单词，例如 "hablado"
  auxiliary?: string; // 助动词，例如 "he"
}

// 统一入口：返回完整形式和填字答案；没有这个人称时返回 null
export const conjugate = (inf: string, tense: Tense, p: Person): Conjugated | null => {
  switch (tense) {
    case 'presente':
      return single(presente(inf, p));
    case 'indefinido':
      return single(indefinido(inf, p));
    case 'imperfecto':
      return single(imperfecto(inf, p));
    case 'futuro':
      return single(futuro(inf, p));
    case 'condicional':
      return single(condicional(inf, p));
    case 'subjPresente':
      return single(subjPresente(inf, p));
    case 'imperativo': {
      const f = imperativo(inf, p);
      return f ? single(f) : null;
    }
    case 'perfecto':
      return compound(HABER_PRESENT[p], participio(inf));
    case 'pluscuamperfecto':
      return compound(HABER_IMPERFECT[p], participio(inf));
    case 'gerundio':
      return compound(ESTAR_PRESENT[p], gerundio(inf));
  }
};

const single = (form: string): Conjugated => ({ form, answer: form });
const compound = (aux: string, answer: string): Conjugated => ({
  form: `${aux} ${answer}`,
  answer,
  auxiliary: aux,
});

// 是否属于"不规则或变干"动词（用于"不规则动词"主题）
export const isIrregular = (inf: string) =>
  hasStemChange(inf) ||
  !!PRESENT_FULL[inf] ||
  !!PRESENT_YO[inf] ||
  !!PRETERITE_FULL[inf] ||
  !!PRETERITE_STRONG[inf] ||
  !!FUTURE_STEM[inf] ||
  !!PARTICIPLE[inf] ||
  ACCENT_I.has(inf) ||
  ACCENT_U.has(inf) ||
  isUir(inf) ||
  vowelStemEr(inf) ||
  /(ger|gir|guir|[aeiou]cer|[aeiou]cir)$/.test(inf);
