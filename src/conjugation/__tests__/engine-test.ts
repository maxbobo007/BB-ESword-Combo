import { conjugate, gerundio, participio, Person, Tense } from '@/conjugation/engine';

// 手写的标准答案（yo, tú, él, nosotros, vosotros, ellos），独立于引擎代码。
// 覆盖：三类规则动词、靴型词干变化（e→ie, o→ue, u→ue, e→i）、拼写变化
// （c/g/z、g→j、gu→g、zc、z、-uir 的 y）、重音（envío、reúno）、强变化过去时、完全不规则动词。
const GOLDEN: Record<string, Partial<Record<Tense, string[]>>> = {
  hablar: {
    presente: ['hablo', 'hablas', 'habla', 'hablamos', 'habláis', 'hablan'],
    indefinido: ['hablé', 'hablaste', 'habló', 'hablamos', 'hablasteis', 'hablaron'],
    imperfecto: ['hablaba', 'hablabas', 'hablaba', 'hablábamos', 'hablabais', 'hablaban'],
    futuro: ['hablaré', 'hablarás', 'hablará', 'hablaremos', 'hablaréis', 'hablarán'],
    condicional: ['hablaría', 'hablarías', 'hablaría', 'hablaríamos', 'hablaríais', 'hablarían'],
    subjPresente: ['hable', 'hables', 'hable', 'hablemos', 'habléis', 'hablen'],
    perfecto: ['he hablado', 'has hablado', 'ha hablado', 'hemos hablado', 'habéis hablado', 'han hablado'],
    pluscuamperfecto: ['había hablado', 'habías hablado', 'había hablado', 'habíamos hablado', 'habíais hablado', 'habían hablado'],
    gerundio: ['estoy hablando', 'estás hablando', 'está hablando', 'estamos hablando', 'estáis hablando', 'están hablando'],
  },
  comer: {
    presente: ['como', 'comes', 'come', 'comemos', 'coméis', 'comen'],
    indefinido: ['comí', 'comiste', 'comió', 'comimos', 'comisteis', 'comieron'],
    imperfecto: ['comía', 'comías', 'comía', 'comíamos', 'comíais', 'comían'],
    subjPresente: ['coma', 'comas', 'coma', 'comamos', 'comáis', 'coman'],
  },
  vivir: {
    presente: ['vivo', 'vives', 'vive', 'vivimos', 'vivís', 'viven'],
    indefinido: ['viví', 'viviste', 'vivió', 'vivimos', 'vivisteis', 'vivieron'],
    futuro: ['viviré', 'vivirás', 'vivirá', 'viviremos', 'viviréis', 'vivirán'],
  },
  pensar: {
    presente: ['pienso', 'piensas', 'piensa', 'pensamos', 'pensáis', 'piensan'],
    subjPresente: ['piense', 'pienses', 'piense', 'pensemos', 'penséis', 'piensen'],
  },
  empezar: {
    presente: ['empiezo', 'empiezas', 'empieza', 'empezamos', 'empezáis', 'empiezan'],
    indefinido: ['empecé', 'empezaste', 'empezó', 'empezamos', 'empezasteis', 'empezaron'],
    subjPresente: ['empiece', 'empieces', 'empiece', 'empecemos', 'empecéis', 'empiecen'],
  },
  volver: {
    presente: ['vuelvo', 'vuelves', 'vuelve', 'volvemos', 'volvéis', 'vuelven'],
    subjPresente: ['vuelva', 'vuelvas', 'vuelva', 'volvamos', 'volváis', 'vuelvan'],
  },
  dormir: {
    presente: ['duermo', 'duermes', 'duerme', 'dormimos', 'dormís', 'duermen'],
    indefinido: ['dormí', 'dormiste', 'durmió', 'dormimos', 'dormisteis', 'durmieron'],
    subjPresente: ['duerma', 'duermas', 'duerma', 'durmamos', 'durmáis', 'duerman'],
  },
  jugar: {
    presente: ['juego', 'juegas', 'juega', 'jugamos', 'jugáis', 'juegan'],
    indefinido: ['jugué', 'jugaste', 'jugó', 'jugamos', 'jugasteis', 'jugaron'],
    subjPresente: ['juegue', 'juegues', 'juegue', 'juguemos', 'juguéis', 'jueguen'],
  },
  pedir: {
    presente: ['pido', 'pides', 'pide', 'pedimos', 'pedís', 'piden'],
    indefinido: ['pedí', 'pediste', 'pidió', 'pedimos', 'pedisteis', 'pidieron'],
    subjPresente: ['pida', 'pidas', 'pida', 'pidamos', 'pidáis', 'pidan'],
  },
  sentir: {
    presente: ['siento', 'sientes', 'siente', 'sentimos', 'sentís', 'sienten'],
    indefinido: ['sentí', 'sentiste', 'sintió', 'sentimos', 'sentisteis', 'sintieron'],
    subjPresente: ['sienta', 'sientas', 'sienta', 'sintamos', 'sintáis', 'sientan'],
  },
  seguir: {
    presente: ['sigo', 'sigues', 'sigue', 'seguimos', 'seguís', 'siguen'],
    indefinido: ['seguí', 'seguiste', 'siguió', 'seguimos', 'seguisteis', 'siguieron'],
    subjPresente: ['siga', 'sigas', 'siga', 'sigamos', 'sigáis', 'sigan'],
  },
  elegir: {
    presente: ['elijo', 'eliges', 'elige', 'elegimos', 'elegís', 'eligen'],
    subjPresente: ['elija', 'elijas', 'elija', 'elijamos', 'elijáis', 'elijan'],
  },
  coger: {
    presente: ['cojo', 'coges', 'coge', 'cogemos', 'cogéis', 'cogen'],
    subjPresente: ['coja', 'cojas', 'coja', 'cojamos', 'cojáis', 'cojan'],
  },
  buscar: {
    indefinido: ['busqué', 'buscaste', 'buscó', 'buscamos', 'buscasteis', 'buscaron'],
    subjPresente: ['busque', 'busques', 'busque', 'busquemos', 'busquéis', 'busquen'],
  },
  llegar: {
    indefinido: ['llegué', 'llegaste', 'llegó', 'llegamos', 'llegasteis', 'llegaron'],
  },
  conocer: {
    presente: ['conozco', 'conoces', 'conoce', 'conocemos', 'conocéis', 'conocen'],
    subjPresente: ['conozca', 'conozcas', 'conozca', 'conozcamos', 'conozcáis', 'conozcan'],
  },
  vencer: {
    presente: ['venzo', 'vences', 'vence', 'vencemos', 'vencéis', 'vencen'],
  },
  conducir: {
    presente: ['conduzco', 'conduces', 'conduce', 'conducimos', 'conducís', 'conducen'],
    indefinido: ['conduje', 'condujiste', 'condujo', 'condujimos', 'condujisteis', 'condujeron'],
  },
  construir: {
    presente: ['construyo', 'construyes', 'construye', 'construimos', 'construís', 'construyen'],
    indefinido: ['construí', 'construiste', 'construyó', 'construimos', 'construisteis', 'construyeron'],
  },
  huir: {
    presente: ['huyo', 'huyes', 'huye', 'huimos', 'huis', 'huyen'],
    indefinido: ['hui', 'huiste', 'huyó', 'huimos', 'huisteis', 'huyeron'],
  },
  leer: {
    indefinido: ['leí', 'leíste', 'leyó', 'leímos', 'leísteis', 'leyeron'],
  },
  oír: {
    presente: ['oigo', 'oyes', 'oye', 'oímos', 'oís', 'oyen'],
    indefinido: ['oí', 'oíste', 'oyó', 'oímos', 'oísteis', 'oyeron'],
    futuro: ['oiré', 'oirás', 'oirá', 'oiremos', 'oiréis', 'oirán'],
    subjPresente: ['oiga', 'oigas', 'oiga', 'oigamos', 'oigáis', 'oigan'],
  },
  reír: {
    presente: ['río', 'ríes', 'ríe', 'reímos', 'reís', 'ríen'],
    indefinido: ['reí', 'reíste', 'rio', 'reímos', 'reísteis', 'rieron'],
  },
  enviar: {
    presente: ['envío', 'envías', 'envía', 'enviamos', 'enviáis', 'envían'],
    subjPresente: ['envíe', 'envíes', 'envíe', 'enviemos', 'enviéis', 'envíen'],
  },
  reunir: {
    presente: ['reúno', 'reúnes', 'reúne', 'reunimos', 'reunís', 'reúnen'],
  },
  ser: {
    presente: ['soy', 'eres', 'es', 'somos', 'sois', 'son'],
    indefinido: ['fui', 'fuiste', 'fue', 'fuimos', 'fuisteis', 'fueron'],
    imperfecto: ['era', 'eras', 'era', 'éramos', 'erais', 'eran'],
    subjPresente: ['sea', 'seas', 'sea', 'seamos', 'seáis', 'sean'],
  },
  estar: {
    presente: ['estoy', 'estás', 'está', 'estamos', 'estáis', 'están'],
    indefinido: ['estuve', 'estuviste', 'estuvo', 'estuvimos', 'estuvisteis', 'estuvieron'],
  },
  ir: {
    presente: ['voy', 'vas', 'va', 'vamos', 'vais', 'van'],
    indefinido: ['fui', 'fuiste', 'fue', 'fuimos', 'fuisteis', 'fueron'],
    imperfecto: ['iba', 'ibas', 'iba', 'íbamos', 'ibais', 'iban'],
    futuro: ['iré', 'irás', 'irá', 'iremos', 'iréis', 'irán'],
    subjPresente: ['vaya', 'vayas', 'vaya', 'vayamos', 'vayáis', 'vayan'],
  },
  tener: {
    presente: ['tengo', 'tienes', 'tiene', 'tenemos', 'tenéis', 'tienen'],
    indefinido: ['tuve', 'tuviste', 'tuvo', 'tuvimos', 'tuvisteis', 'tuvieron'],
    futuro: ['tendré', 'tendrás', 'tendrá', 'tendremos', 'tendréis', 'tendrán'],
    subjPresente: ['tenga', 'tengas', 'tenga', 'tengamos', 'tengáis', 'tengan'],
  },
  hacer: {
    presente: ['hago', 'haces', 'hace', 'hacemos', 'hacéis', 'hacen'],
    indefinido: ['hice', 'hiciste', 'hizo', 'hicimos', 'hicisteis', 'hicieron'],
    futuro: ['haré', 'harás', 'hará', 'haremos', 'haréis', 'harán'],
    condicional: ['haría', 'harías', 'haría', 'haríamos', 'haríais', 'harían'],
  },
  decir: {
    presente: ['digo', 'dices', 'dice', 'decimos', 'decís', 'dicen'],
    indefinido: ['dije', 'dijiste', 'dijo', 'dijimos', 'dijisteis', 'dijeron'],
    futuro: ['diré', 'dirás', 'dirá', 'diremos', 'diréis', 'dirán'],
  },
  poder: {
    presente: ['puedo', 'puedes', 'puede', 'podemos', 'podéis', 'pueden'],
    indefinido: ['pude', 'pudiste', 'pudo', 'pudimos', 'pudisteis', 'pudieron'],
    futuro: ['podré', 'podrás', 'podrá', 'podremos', 'podréis', 'podrán'],
  },
  querer: {
    indefinido: ['quise', 'quisiste', 'quiso', 'quisimos', 'quisisteis', 'quisieron'],
    futuro: ['querré', 'querrás', 'querrá', 'querremos', 'querréis', 'querrán'],
  },
  saber: {
    presente: ['sé', 'sabes', 'sabe', 'sabemos', 'sabéis', 'saben'],
    subjPresente: ['sepa', 'sepas', 'sepa', 'sepamos', 'sepáis', 'sepan'],
  },
  poner: {
    presente: ['pongo', 'pones', 'pone', 'ponemos', 'ponéis', 'ponen'],
    indefinido: ['puse', 'pusiste', 'puso', 'pusimos', 'pusisteis', 'pusieron'],
  },
  venir: {
    presente: ['vengo', 'vienes', 'viene', 'venimos', 'venís', 'vienen'],
    indefinido: ['vine', 'viniste', 'vino', 'vinimos', 'vinisteis', 'vinieron'],
  },
  traer: {
    presente: ['traigo', 'traes', 'trae', 'traemos', 'traéis', 'traen'],
    indefinido: ['traje', 'trajiste', 'trajo', 'trajimos', 'trajisteis', 'trajeron'],
  },
  caer: {
    presente: ['caigo', 'caes', 'cae', 'caemos', 'caéis', 'caen'],
    indefinido: ['caí', 'caíste', 'cayó', 'caímos', 'caísteis', 'cayeron'],
  },
  dar: {
    presente: ['doy', 'das', 'da', 'damos', 'dais', 'dan'],
    indefinido: ['di', 'diste', 'dio', 'dimos', 'disteis', 'dieron'],
    subjPresente: ['dé', 'des', 'dé', 'demos', 'deis', 'den'],
  },
  ver: {
    presente: ['veo', 'ves', 've', 'vemos', 'veis', 'ven'],
    indefinido: ['vi', 'viste', 'vio', 'vimos', 'visteis', 'vieron'],
    imperfecto: ['veía', 'veías', 'veía', 'veíamos', 'veíais', 'veían'],
  },
  salir: {
    presente: ['salgo', 'sales', 'sale', 'salimos', 'salís', 'salen'],
    futuro: ['saldré', 'saldrás', 'saldrá', 'saldremos', 'saldréis', 'saldrán'],
  },
};

// 肯定命令式：tú, usted, nosotros, vosotros, ustedes
const IMPERATIVE: Record<string, string[]> = {
  hablar: ['habla', 'hable', 'hablemos', 'hablad', 'hablen'],
  comer: ['come', 'coma', 'comamos', 'comed', 'coman'],
  pensar: ['piensa', 'piense', 'pensemos', 'pensad', 'piensen'],
  pedir: ['pide', 'pida', 'pidamos', 'pedid', 'pidan'],
  decir: ['di', 'diga', 'digamos', 'decid', 'digan'],
  hacer: ['haz', 'haga', 'hagamos', 'haced', 'hagan'],
  ir: ['ve', 'vaya', 'vamos', 'id', 'vayan'],
  poner: ['pon', 'ponga', 'pongamos', 'poned', 'pongan'],
  salir: ['sal', 'salga', 'salgamos', 'salid', 'salgan'],
  ser: ['sé', 'sea', 'seamos', 'sed', 'sean'],
  tener: ['ten', 'tenga', 'tengamos', 'tened', 'tengan'],
  venir: ['ven', 'venga', 'vengamos', 'venid', 'vengan'],
  oír: ['oye', 'oiga', 'oigamos', 'oíd', 'oigan'],
  jugar: ['juega', 'juegue', 'juguemos', 'jugad', 'jueguen'],
};

const PARTICIPLES: Record<string, string> = {
  hablar: 'hablado', comer: 'comido', vivir: 'vivido', ir: 'ido', ser: 'sido',
  abrir: 'abierto', escribir: 'escrito', describir: 'descrito', ver: 'visto', hacer: 'hecho',
  poner: 'puesto', decir: 'dicho', volver: 'vuelto', devolver: 'devuelto', romper: 'roto',
  cubrir: 'cubierto', leer: 'leído', creer: 'creído', oír: 'oído', traer: 'traído', caer: 'caído',
  reír: 'reído', construir: 'construido', imprimir: 'impreso',
};

const GERUNDS: Record<string, string> = {
  hablar: 'hablando', comer: 'comiendo', vivir: 'viviendo', ir: 'yendo', leer: 'leyendo',
  creer: 'creyendo', oír: 'oyendo', caer: 'cayendo', traer: 'trayendo', construir: 'construyendo',
  pedir: 'pidiendo', dormir: 'durmiendo', sentir: 'sintiendo', seguir: 'siguiendo',
  decir: 'diciendo', venir: 'viniendo', poder: 'pudiendo', reír: 'riendo', ser: 'siendo',
  preferir: 'prefiriendo', vestir: 'vistiendo', corregir: 'corrigiendo',
};

describe('变位引擎：标准答案对照', () => {
  for (const [verb, tenses] of Object.entries(GOLDEN)) {
    for (const [tense, forms] of Object.entries(tenses)) {
      it(`${verb} · ${tense}`, () => {
        const got = ([0, 1, 2, 3, 4, 5] as Person[]).map(p => conjugate(verb, tense as Tense, p)!.form);
        expect(got).toEqual(forms);
      });
    }
  }

  it.each(Object.entries(IMPERATIVE))('%s · 肯定命令式', (verb, forms) => {
    const got = ([1, 2, 3, 4, 5] as Person[]).map(p => conjugate(verb, 'imperativo', p)!.form);
    expect(got).toEqual(forms);
    expect(conjugate(verb, 'imperativo', 0)).toBeNull();
  });

  it.each(Object.entries(PARTICIPLES))('%s · 过去分词', (verb, form) => {
    expect(participio(verb)).toBe(form);
  });

  it.each(Object.entries(GERUNDS))('%s · 副动词', (verb, form) => {
    expect(gerundio(verb)).toBe(form);
  });

  it('复合时态的填字答案只有分词，助动词单独给出', () => {
    expect(conjugate('hablar', 'perfecto', 0)).toEqual({ form: 'he hablado', answer: 'hablado', auxiliary: 'he' });
    expect(conjugate('leer', 'gerundio', 3)).toEqual({ form: 'estamos leyendo', answer: 'leyendo', auxiliary: 'estamos' });
  });
});
