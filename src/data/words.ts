import type { Word, LanguageLevel, WordCategory } from '../types/game';

// 核心示例词（带例句）
const CORE_WORDS: Word[] = [
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
    gender: 'm',
    english: 'bread',
    chinese: '面包',
    level: 'A1',
    category: 'food',
    exampleSentence: 'El pan está fresco.',
  },
  {
    id: 'w003',
    spanish: 'leche',
    gender: 'f',
    english: 'milk',
    chinese: '牛奶',
    level: 'A1',
    category: 'food',
    exampleSentence: 'Me gusta la leche fría.',
  },
  {
    id: 'w004',
    spanish: 'café',
    gender: 'm',
    english: 'coffee',
    chinese: '咖啡',
    level: 'A1',
    category: 'food',
    exampleSentence: 'Tomo café por la mañana.',
  },
  {
    id: 'w005',
    spanish: 'fruta',
    gender: 'f',
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
    gender: 'f',
    english: 'mother',
    chinese: '母亲',
    level: 'A1',
    category: 'family',
    exampleSentence: 'Mi madre es médica.',
  },
  {
    id: 'w007',
    spanish: 'padre',
    gender: 'm',
    english: 'father',
    chinese: '父亲',
    level: 'A1',
    category: 'family',
    exampleSentence: 'Mi padre trabaja en una oficina.',
  },
  {
    id: 'w008',
    spanish: 'hijo',
    gender: 'm',
    english: 'son',
    chinese: '儿子',
    level: 'A1',
    category: 'family',
    exampleSentence: 'Tengo un hijo pequeño.',
  },
  {
    id: 'w009',
    spanish: 'hija',
    gender: 'f',
    english: 'daughter',
    chinese: '女儿',
    level: 'A1',
    category: 'family',
    exampleSentence: 'Mi hija tiene cinco años.',
  },
  {
    id: 'w010',
    spanish: 'hermano',
    gender: 'm',
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
    gender: 'm',
    english: 'trip',
    chinese: '旅行',
    level: 'A2',
    category: 'travel',
    exampleSentence: 'El viaje fue increíble.',
  },
  {
    id: 'w012',
    spanish: 'hotel',
    gender: 'm',
    english: 'hotel',
    chinese: '酒店',
    level: 'A2',
    category: 'travel',
    exampleSentence: 'Reservé un hotel cerca de la playa.',
  },
  {
    id: 'w013',
    spanish: 'playa',
    gender: 'f',
    english: 'beach',
    chinese: '海滩',
    level: 'A2',
    category: 'travel',
    exampleSentence: 'Vamos a la playa este verano.',
  },
  {
    id: 'w014',
    spanish: 'avión',
    gender: 'm',
    english: 'airplane',
    chinese: '飞机',
    level: 'A2',
    category: 'travel',
    exampleSentence: 'El avión sale a las tres.',
  },
  {
    id: 'w015',
    spanish: 'maleta',
    gender: 'f',
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
    gender: 'm',
    english: 'work',
    chinese: '工作',
    level: 'B1',
    category: 'work',
    exampleSentence: 'Mi trabajo es muy interesante.',
  },
  {
    id: 'w017',
    spanish: 'jefe',
    gender: 'm',
    english: 'boss',
    chinese: '老板',
    level: 'B1',
    category: 'work',
    exampleSentence: 'Mi jefe es muy exigente.',
  },
  {
    id: 'w018',
    spanish: 'oficina',
    gender: 'f',
    english: 'office',
    chinese: '办公室',
    level: 'B1',
    category: 'work',
    exampleSentence: 'La oficina está en el centro.',
  },
  {
    id: 'w019',
    spanish: 'reunión',
    gender: 'f',
    english: 'meeting',
    chinese: '会议',
    level: 'B1',
    category: 'work',
    exampleSentence: 'Tenemos una reunión importante.',
  },
  {
    id: 'w020',
    spanish: 'proyecto',
    gender: 'm',
    english: 'project',
    chinese: '项目',
    level: 'B1',
    category: 'work',
    exampleSentence: 'Estamos trabajando en un nuevo proyecto.',
  },
];
// 扩充词库：格式为 '西语|英文|中文|阴阳性(m/f，可省略)'
// id 用「主题:单词」，保证以后增删别的词时已学进度不会错位
type Compact = Partial<Record<LanguageLevel, string[]>>;

const EXPANDED: Record<WordCategory, Compact> = {
  food: {
    A1: ['huevo|egg|鸡蛋|m', 'queso|cheese|奶酪|m', 'arroz|rice|米饭|m', 'carne|meat|肉|f',
      'pollo|chicken|鸡肉|m', 'pescado|fish (food)|鱼（食物）|m', 'manzana|apple|苹果|f', 'sopa|soup|汤|f'],
    A2: ['cebolla|onion|洋葱|f', 'ajo|garlic|大蒜|m', 'azúcar|sugar|糖|m', 'sal|salt|盐|f',
      'aceite|oil|油|m', 'cerdo|pork|猪肉|m', 'naranja|orange|橙子|f', 'tomate|tomato|番茄|m',
      'patata|potato|土豆|f', 'galleta|cookie|饼干|f'],
    B1: ['receta|recipe|食谱|f', 'ingrediente|ingredient|配料|m', 'hervir|to boil|煮沸',
      'freír|to fry|油炸', 'asar|to roast|烤', 'sabroso|tasty|美味的', 'postre|dessert|甜点|m',
      'harina|flour|面粉|f'],
  },
  family: {
    A1: ['hermana|sister|姐妹|f', 'abuelo|grandfather|祖父|m', 'abuela|grandmother|祖母|f',
      'tío|uncle|叔叔/舅舅|m', 'tía|aunt|阿姨/姑姑|f', 'primo|cousin|堂/表兄弟|m',
      'bebé|baby|婴儿|m', 'familia|family|家庭|f'],
    A2: ['esposo|husband|丈夫|m', 'esposa|wife|妻子|f', 'sobrino|nephew|侄子/外甥|m',
      'nieto|grandson|孙子|m', 'nieta|granddaughter|孙女|f', 'suegra|mother-in-law|婆婆/岳母|f',
      'boda|wedding|婚礼|f', 'pareja|partner|伴侣|f'],
    B1: ['soltero|single|单身的', 'casado|married|已婚的', 'divorcio|divorce|离婚|m',
      'criar|to raise (a child)|抚养', 'pariente|relative|亲戚|m', 'adoptar|to adopt|收养',
      'embarazada|pregnant|怀孕的', 'herencia|inheritance|遗产|f'],
  },
  travel: {
    A1: ['tren|train|火车|m', 'coche|car|汽车|m', 'mapa|map|地图|m', 'calle|street|街道|f',
      'billete|ticket|票|m', 'ciudad|city|城市|f', 'país|country|国家|m', 'autobús|bus|公交车|m'],
    A2: ['pasaporte|passport|护照|m', 'aeropuerto|airport|机场|m', 'estación|station|车站|f',
      'reserva|reservation|预订|f', 'equipaje|luggage|行李|m', 'vuelo|flight|航班|m',
      'museo|museum|博物馆|m'],
    B1: ['destino|destination|目的地|m', 'alojamiento|accommodation|住宿|m', 'aduana|customs|海关|f',
      'frontera|border|边境|f', 'retraso|delay|延误|m', 'itinerario|itinerary|行程|m',
      'excursión|day trip|短途旅行|f', 'embarcar|to board|登机'],
  },
  work: {
    A1: ['trabajar|to work|工作（动词）', 'mesa|table|桌子|f', 'ordenador|computer|电脑|m',
      'papel|paper|纸|m', 'dinero|money|钱|m', 'hora|hour|小时|f', 'médico|doctor|医生|m',
      'profesor|teacher|老师|m'],
    A2: ['empresa|company|公司|f', 'cliente|client|客户|m', 'sueldo|salary|工资|m',
      'correo|mail|邮件|m', 'contrato|contract|合同|m', 'horario|schedule|时间表|m',
      'tienda|shop|商店|f', 'vender|to sell|卖'],
    B1: ['plazo|deadline|期限|m', 'equipo|team|团队|m', 'negocio|business|生意|m',
      'venta|sale|销售|f', 'entrevista|interview|面试|f', 'ascenso|promotion|升职|m',
      'despedir|to fire|解雇', 'currículum|CV|简历|m'],
  },
  health: {
    A1: ['cabeza|head|头|f', 'mano|hand|手|f', 'pie|foot|脚|m', 'ojo|eye|眼睛|m',
      'boca|mouth|嘴|f', 'brazo|arm|手臂|m', 'pierna|leg|腿|f', 'dormir|to sleep|睡觉'],
    A2: ['hospital|hospital|医院|m', 'dolor|pain|疼痛|m', 'fiebre|fever|发烧|f', 'gripe|flu|流感|f',
      'farmacia|pharmacy|药店|f', 'pastilla|pill|药片|f', 'enfermo|sick|生病的', 'diente|tooth|牙齿|m'],
    B1: ['síntoma|symptom|症状|m', 'tos|cough|咳嗽|f', 'alergia|allergy|过敏|f', 'vacuna|vaccine|疫苗|f',
      'herida|wound|伤口|f', 'sangre|blood|血|f', 'corazón|heart|心脏|m', 'pulmón|lung|肺|m'],
  },
  nature: {
    A1: ['sol|sun|太阳|m', 'luna|moon|月亮|f', 'mar|sea|海|m', 'río|river|河|m',
      'árbol|tree|树|m', 'flor|flower|花|f', 'perro|dog|狗|m', 'gato|cat|猫|m'],
    A2: ['montaña|mountain|山|f', 'bosque|forest|森林|m', 'lago|lake|湖|m', 'nube|cloud|云|f',
      'lluvia|rain|雨|f', 'nieve|snow|雪|f', 'viento|wind|风|m', 'pájaro|bird|鸟|m'],
    B1: ['paisaje|landscape|风景|m', 'clima|climate|气候|m', 'tormenta|storm|暴风雨|f',
      'selva|jungle|丛林|f', 'desierto|desert|沙漠|m', 'isla|island|岛|f', 'volcán|volcano|火山|m',
      'costa|coast|海岸|f'],
  },
  education: {
    A1: ['libro|book|书|m', 'escuela|school|学校|f', 'clase|class|课|f', 'lápiz|pencil|铅笔|m',
      'leer|to read|读', 'escribir|to write|写', 'alumno|student|学生|m', 'examen|exam|考试|m'],
    A2: ['universidad|university|大学|f', 'pregunta|question|问题|f', 'respuesta|answer|答案|f',
      'tarea|homework|作业|f', 'cuaderno|notebook|笔记本|m', 'aprender|to learn|学会',
      'estudiar|to study|学习', 'nota|grade|成绩|f'],
    B1: ['asignatura|school subject|科目|f', 'beca|scholarship|奖学金|f', 'título|degree|学位|m',
      'carrera|degree course|大学专业|f', 'aprobar|to pass (an exam)|及格',
      'suspender|to fail (an exam)|不及格', 'matrícula|enrolment|注册|f', 'biblioteca|library|图书馆|f'],
  },
  sports: {
    A1: ['fútbol|football|足球|m', 'pelota|ball|球|f', 'correr|to run|跑步', 'nadar|to swim|游泳',
      'jugar|to play|玩', 'bici|bike|自行车|f', 'ganar|to win|赢', 'gol|goal|进球|m'],
    A2: ['partido|match|比赛|m', 'tenis|tennis|网球|m', 'piscina|swimming pool|游泳池|f',
      'gimnasio|gym|健身房|m', 'jugador|player|球员|m', 'perder|to lose|输',
      'entrenar|to train|训练', 'campo|pitch|球场|m'],
    B1: ['árbitro|referee|裁判|m', 'torneo|tournament|锦标赛|m', 'empate|draw|平局|m',
      'entrenador|coach|教练|m', 'marcador|scoreboard|比分牌|m', 'aficionado|fan|球迷|m',
      'medalla|medal|奖牌|f', 'estadio|stadium|体育场|m'],
  },
  technology: {
    A1: ['móvil|mobile phone|手机|m', 'foto|photo|照片|f', 'radio|radio|收音机|f', 'tele|TV|电视|f',
      'reloj|clock|钟表|m', 'luz|light|灯|f', 'cámara|camera|相机|f', 'vídeo|video|视频|m'],
    A2: ['teléfono|telephone|电话|m', 'pantalla|screen|屏幕|f', 'teclado|keyboard|键盘|m',
      'ratón|mouse|鼠标|m', 'internet|internet|互联网|m', 'mensaje|message|消息|m',
      'batería|battery|电池|f', 'cargador|charger|充电器|m'],
    B1: ['contraseña|password|密码|f', 'aplicación|app|应用|f', 'archivo|file|文件|m',
      'descargar|to download|下载', 'red|network|网络|f', 'usuario|user|用户|m', 'enlace|link|链接|m',
      'impresora|printer|打印机|f'],
  },
  culture: {
    A1: ['música|music|音乐|f', 'fiesta|party|派对|f', 'cine|cinema|电影院|m', 'baile|dance|舞蹈|m',
      'canción|song|歌曲|f', 'arte|art|艺术|m', 'película|film|电影|f', 'teatro|theatre|剧院|m'],
    A2: ['pintura|painting|绘画|f', 'concierto|concert|音乐会|m', 'novela|novel|小说|f',
      'poema|poem|诗|m', 'guitarra|guitar|吉他|f', 'tradición|tradition|传统|f',
      'festival|festival|节庆活动|m'],
    B1: ['escultura|sculpture|雕塑|f', 'costumbre|custom|习俗|f', 'exposición|exhibition|展览|f',
      'obra|work of art|作品|f', 'escritor|writer|作家|m', 'flamenco|flamenco|弗拉门戈|m',
      'patrimonio|heritage|文化遗产|m', 'idioma|language|语言|m'],
  },
};

const expand = (): Word[] =>
  (Object.keys(EXPANDED) as WordCategory[]).flatMap(category =>
    (Object.keys(EXPANDED[category]) as LanguageLevel[]).flatMap(level =>
      (EXPANDED[category][level] ?? []).map(entry => {
        const [spanish, english, chinese, gender] = entry.split('|');
        return {
          id: `${category}:${spanish}`,
          spanish,
          english,
          chinese,
          level,
          category,
          ...(gender === 'm' || gender === 'f' ? { gender } : {}),
        };
      })
    )
  );

export const SAMPLE_WORDS: Word[] = [...CORE_WORDS, ...expand()];

/** 每局最少需要几个词才能生成填字。 */
export const MIN_WORDS_PER_PUZZLE = 5;

export const getWordsByLevel = (level: LanguageLevel): Word[] =>
  SAMPLE_WORDS.filter(word => word.level === level);

export const getWordsByCategory = (category: WordCategory): Word[] =>
  SAMPLE_WORDS.filter(word => word.category === category);

export const countWords = (level: LanguageLevel, category: WordCategory): number =>
  SAMPLE_WORDS.filter(w => w.level === level && w.category === category).length;

/**
 * 随机取词（random 可注入，方便测试）。
 */
export const getRandomWords = (
  count: number,
  level?: LanguageLevel,
  category?: WordCategory,
  random: () => number = Math.random
): Word[] => {
  const filtered = SAMPLE_WORDS.filter(
    w => (!level || w.level === level) && (!category || w.category === category)
  );
  const arr = [...filtered];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, count);
};
