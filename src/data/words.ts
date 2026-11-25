import { LanguageLevel, Word, WordCategory } from '@/types/game';

// 紧凑格式：[西语, 英语, 中文, 例句?]  Compact rows: [spanish, english, chinese, example?]
type Row = [string, string, string, string?];

const GROUPS: { level: LanguageLevel; category: WordCategory; rows: Row[] }[] = [
  // ───────────── A1 ─────────────
  {
    level: 'A1',
    category: 'food',
    rows: [
      ['agua', 'water', '水', 'Bebo agua todos los días.'],
      ['pan', 'bread', '面包', 'El pan está fresco.'],
      ['leche', 'milk', '牛奶', 'Me gusta la leche fría.'],
      ['café', 'coffee', '咖啡', 'Tomo café por la mañana.'],
      ['fruta', 'fruit', '水果', 'Como fruta cada día.'],
      ['huevo', 'egg', '鸡蛋'],
      ['queso', 'cheese', '奶酪'],
      ['carne', 'meat', '肉'],
      ['pescado', 'fish (food)', '鱼（食物）'],
      ['arroz', 'rice', '米饭'],
      ['sopa', 'soup', '汤'],
      ['manzana', 'apple', '苹果'],
      ['naranja', 'orange', '橙子'],
      ['azúcar', 'sugar', '糖'],
      ['sal', 'salt', '盐'],
    ],
  },
  {
    level: 'A1',
    category: 'family',
    rows: [
      ['madre', 'mother', '母亲', 'Mi madre es médica.'],
      ['padre', 'father', '父亲', 'Mi padre trabaja en una oficina.'],
      ['hijo', 'son', '儿子', 'Tengo un hijo pequeño.'],
      ['hija', 'daughter', '女儿', 'Mi hija tiene cinco años.'],
      ['hermano', 'brother', '兄弟', 'Mi hermano vive en Madrid.'],
      ['hermana', 'sister', '姐妹'],
      ['abuelo', 'grandfather', '祖父 / 外公'],
      ['abuela', 'grandmother', '祖母 / 外婆'],
      ['tío', 'uncle', '叔叔 / 舅舅'],
      ['tía', 'aunt', '阿姨 / 姑姑'],
      ['primo', 'cousin', '堂兄弟 / 表兄弟'],
      ['bebé', 'baby', '婴儿'],
      ['familia', 'family', '家庭'],
      ['esposo', 'husband', '丈夫'],
      ['esposa', 'wife', '妻子'],
    ],
  },
  {
    level: 'A1',
    category: 'nature',
    rows: [
      ['sol', 'sun', '太阳'],
      ['luna', 'moon', '月亮'],
      ['árbol', 'tree', '树'],
      ['flor', 'flower', '花'],
      ['río', 'river', '河'],
      ['mar', 'sea', '海'],
      ['cielo', 'sky', '天空'],
      ['lluvia', 'rain', '雨'],
      ['nieve', 'snow', '雪'],
      ['perro', 'dog', '狗'],
      ['gato', 'cat', '猫'],
      ['montaña', 'mountain', '山'],
    ],
  },
  {
    level: 'A1',
    category: 'education',
    rows: [
      ['libro', 'book', '书'],
      ['escuela', 'school', '学校'],
      ['lápiz', 'pencil', '铅笔'],
      ['mesa', 'table', '桌子'],
      ['silla', 'chair', '椅子'],
      ['clase', 'class', '课'],
      ['profesor', 'teacher', '老师'],
      ['papel', 'paper', '纸'],
      ['número', 'number', '数字'],
      ['letra', 'letter (alphabet)', '字母'],
      ['pregunta', 'question', '问题'],
      ['alumno', 'student', '学生'],
    ],
  },
  {
    level: 'A1',
    category: 'travel',
    rows: [
      ['casa', 'house', '房子'],
      ['calle', 'street', '街道'],
      ['coche', 'car', '汽车'],
      ['tren', 'train', '火车'],
      ['autobús', 'bus', '公交车'],
      ['ciudad', 'city', '城市'],
      ['mapa', 'map', '地图'],
      ['billete', 'ticket', '票'],
      ['puerta', 'door', '门'],
      ['tienda', 'shop', '商店'],
    ],
  },

  // ───────────── A2 ─────────────
  {
    level: 'A2',
    category: 'travel',
    rows: [
      ['viaje', 'trip', '旅行', 'El viaje fue increíble.'],
      ['hotel', 'hotel', '酒店', 'Reservé un hotel cerca de la playa.'],
      ['playa', 'beach', '海滩', 'Vamos a la playa este verano.'],
      ['avión', 'airplane', '飞机', 'El avión sale a las tres.'],
      ['maleta', 'suitcase', '行李箱', 'Necesito una maleta grande.'],
      ['pasaporte', 'passport', '护照'],
      ['aeropuerto', 'airport', '机场'],
      ['estación', 'station', '车站'],
      ['equipaje', 'luggage', '行李'],
      ['turista', 'tourist', '游客'],
      ['reserva', 'reservation', '预订'],
      ['vuelo', 'flight', '航班'],
      ['frontera', 'border', '边境'],
      ['museo', 'museum', '博物馆'],
      ['viajero', 'traveller', '旅行者'],
    ],
  },
  {
    level: 'A2',
    category: 'food',
    rows: [
      ['cocina', 'kitchen', '厨房'],
      ['cena', 'dinner', '晚餐'],
      ['desayuno', 'breakfast', '早餐'],
      ['almuerzo', 'lunch', '午餐'],
      ['postre', 'dessert', '甜点'],
      ['verdura', 'vegetable', '蔬菜'],
      ['pollo', 'chicken', '鸡肉'],
      ['cuchara', 'spoon', '勺子'],
      ['tenedor', 'fork', '叉子'],
      ['cuchillo', 'knife', '刀'],
      ['receta', 'recipe', '食谱'],
      ['plato', 'dish / plate', '盘子 / 菜'],
    ],
  },
  {
    level: 'A2',
    category: 'health',
    rows: [
      ['médico', 'doctor', '医生'],
      ['hospital', 'hospital', '医院'],
      ['cabeza', 'head', '头'],
      ['brazo', 'arm', '手臂'],
      ['pierna', 'leg', '腿'],
      ['mano', 'hand', '手'],
      ['dolor', 'pain', '疼痛'],
      ['fiebre', 'fever', '发烧'],
      ['farmacia', 'pharmacy', '药店'],
      ['enfermo', 'sick', '生病的'],
      ['corazón', 'heart', '心脏'],
      ['diente', 'tooth', '牙齿'],
    ],
  },
  {
    level: 'A2',
    category: 'sports',
    rows: [
      ['fútbol', 'football', '足球'],
      ['pelota', 'ball', '球'],
      ['equipo', 'team', '队'],
      ['partido', 'match', '比赛'],
      ['correr', 'to run', '跑步'],
      ['nadar', 'to swim', '游泳'],
      ['gimnasio', 'gym', '健身房'],
      ['jugador', 'player', '球员'],
      ['ganar', 'to win', '赢'],
      ['perder', 'to lose', '输'],
      ['piscina', 'swimming pool', '游泳池'],
      ['carrera', 'race', '赛跑'],
    ],
  },
  {
    level: 'A2',
    category: 'nature',
    rows: [
      ['bosque', 'forest', '森林'],
      ['lago', 'lake', '湖'],
      ['isla', 'island', '岛'],
      ['viento', 'wind', '风'],
      ['nube', 'cloud', '云'],
      ['piedra', 'stone', '石头'],
      ['hoja', 'leaf', '叶子'],
      ['pájaro', 'bird', '鸟'],
      ['caballo', 'horse', '马'],
      ['desierto', 'desert', '沙漠'],
      ['campo', 'countryside', '田野'],
    ],
  },

  // ───────────── B1 ─────────────
  {
    level: 'B1',
    category: 'work',
    rows: [
      ['trabajo', 'work', '工作', 'Mi trabajo es muy interesante.'],
      ['jefe', 'boss', '老板', 'Mi jefe es muy exigente.'],
      ['oficina', 'office', '办公室', 'La oficina está en el centro.'],
      ['reunión', 'meeting', '会议', 'Tenemos una reunión importante.'],
      ['proyecto', 'project', '项目', 'Estamos trabajando en un nuevo proyecto.'],
      ['empresa', 'company', '公司'],
      ['sueldo', 'salary', '工资'],
      ['contrato', 'contract', '合同'],
      ['cliente', 'client', '客户'],
      ['empleado', 'employee', '员工'],
      ['entrevista', 'interview', '面试'],
      ['horario', 'schedule', '时间表'],
      ['colega', 'colleague', '同事'],
      ['negocio', 'business', '生意'],
    ],
  },
  {
    level: 'B1',
    category: 'technology',
    rows: [
      ['ordenador', 'computer', '电脑'],
      ['pantalla', 'screen', '屏幕'],
      ['teclado', 'keyboard', '键盘'],
      ['ratón', 'mouse', '鼠标'],
      ['red', 'network', '网络'],
      ['contraseña', 'password', '密码'],
      ['archivo', 'file', '文件'],
      ['correo', 'email', '邮件'],
      ['aplicación', 'app', '应用'],
      ['móvil', 'mobile phone', '手机'],
      ['cargador', 'charger', '充电器'],
      ['batería', 'battery', '电池'],
    ],
  },
  {
    level: 'B1',
    category: 'health',
    rows: [
      ['salud', 'health', '健康'],
      ['enfermera', 'nurse', '护士'],
      ['pastilla', 'pill', '药片'],
      ['alergia', 'allergy', '过敏'],
      ['herida', 'wound', '伤口'],
      ['gripe', 'flu', '流感'],
      ['sangre', 'blood', '血'],
      ['consulta', 'appointment', '门诊'],
      ['síntoma', 'symptom', '症状'],
      ['tos', 'cough', '咳嗽'],
      ['vacuna', 'vaccine', '疫苗'],
    ],
  },
  {
    level: 'B1',
    category: 'education',
    rows: [
      ['universidad', 'university', '大学'],
      ['examen', 'exam', '考试'],
      ['nota', 'grade', '成绩'],
      ['asignatura', 'subject', '科目'],
      ['beca', 'scholarship', '奖学金'],
      ['título', 'degree', '学位'],
      ['aprobar', 'to pass (exam)', '及格'],
      ['suspender', 'to fail (exam)', '不及格'],
      ['biblioteca', 'library', '图书馆'],
      ['deberes', 'homework', '作业'],
      ['curso', 'course', '课程'],
    ],
  },
  {
    level: 'B1',
    category: 'culture',
    rows: [
      ['fiesta', 'party / festival', '聚会 / 节日'],
      ['música', 'music', '音乐'],
      ['cine', 'cinema', '电影院'],
      ['teatro', 'theatre', '剧院'],
      ['pintura', 'painting', '绘画'],
      ['canción', 'song', '歌曲'],
      ['baile', 'dance', '舞蹈'],
      ['tradición', 'tradition', '传统'],
      ['idioma', 'language', '语言'],
      ['novela', 'novel', '小说'],
    ],
  },

  // ───────────── B2 ─────────────
  {
    level: 'B2',
    category: 'technology',
    rows: [
      ['programa', 'program', '程序'],
      ['datos', 'data', '数据'],
      ['servidor', 'server', '服务器'],
      ['descargar', 'to download', '下载'],
      ['actualizar', 'to update', '更新'],
      ['enlace', 'link', '链接'],
      ['buscador', 'search engine', '搜索引擎'],
      ['usuario', 'user', '用户'],
      ['dispositivo', 'device', '设备'],
      ['algoritmo', 'algorithm', '算法'],
      ['robot', 'robot', '机器人'],
    ],
  },
  {
    level: 'B2',
    category: 'nature',
    rows: [
      ['contaminación', 'pollution', '污染'],
      ['reciclaje', 'recycling', '回收'],
      ['clima', 'climate', '气候'],
      ['sequía', 'drought', '干旱'],
      ['incendio', 'fire (blaze)', '火灾'],
      ['especie', 'species', '物种'],
      ['energía', 'energy', '能源'],
      ['residuo', 'waste', '废弃物'],
      ['huracán', 'hurricane', '飓风'],
      ['terremoto', 'earthquake', '地震'],
    ],
  },
  {
    level: 'B2',
    category: 'work',
    rows: [
      ['ascenso', 'promotion', '升职'],
      ['jubilación', 'retirement', '退休'],
      ['sindicato', 'trade union', '工会'],
      ['plazo', 'deadline', '期限'],
      ['presupuesto', 'budget', '预算'],
      ['beneficio', 'profit', '利润'],
      ['inversión', 'investment', '投资'],
      ['factura', 'invoice', '发票'],
      ['huelga', 'strike', '罢工'],
      ['mercado', 'market', '市场'],
    ],
  },
  {
    level: 'B2',
    category: 'culture',
    rows: [
      ['exposición', 'exhibition', '展览'],
      ['escultura', 'sculpture', '雕塑'],
      ['poesía', 'poetry', '诗歌'],
      ['escritor', 'writer', '作家'],
      ['obra', 'work (of art)', '作品'],
      ['festival', 'festival', '节庆'],
      ['costumbre', 'custom', '习俗'],
      ['leyenda', 'legend', '传说'],
      ['patrimonio', 'heritage', '遗产'],
      ['orquesta', 'orchestra', '管弦乐团'],
    ],
  },

  // ───────────── C1 ─────────────
  {
    level: 'C1',
    category: 'education',
    rows: [
      ['investigación', 'research', '研究'],
      ['tesis', 'thesis', '论文'],
      ['conocimiento', 'knowledge', '知识'],
      ['aprendizaje', 'learning', '学习'],
      ['licenciatura', "bachelor's degree", '学士学位'],
      ['doctorado', 'doctorate', '博士学位'],
      ['enseñanza', 'teaching', '教学'],
      ['catedrático', 'full professor', '正教授'],
      ['matrícula', 'enrolment', '注册'],
      ['rendimiento', 'performance', '表现'],
    ],
  },
  {
    level: 'C1',
    category: 'health',
    rows: [
      ['diagnóstico', 'diagnosis', '诊断'],
      ['tratamiento', 'treatment', '治疗'],
      ['cirugía', 'surgery', '手术'],
      ['recuperación', 'recovery', '康复'],
      ['bienestar', 'well-being', '身心健康'],
      ['prevención', 'prevention', '预防'],
      ['trastorno', 'disorder', '失调'],
      ['análisis', 'medical test', '化验'],
      ['dolencia', 'ailment', '病痛'],
      ['terapia', 'therapy', '疗法'],
    ],
  },

  // ───────────── C2 ─────────────
  {
    level: 'C2',
    category: 'culture',
    rows: [
      ['idiosincrasia', 'idiosyncrasy', '特质'],
      ['vanguardia', 'avant-garde', '先锋派'],
      ['mecenas', 'patron (of the arts)', '赞助人'],
      ['ensayo', 'essay', '随笔'],
      ['metáfora', 'metaphor', '隐喻'],
      ['quijotesco', 'quixotic', '堂吉诃德式的'],
      ['esperpento', 'grotesque (genre)', '荒诞剧'],
      ['picaresca', 'picaresque', '流浪汉文学'],
      ['retórica', 'rhetoric', '修辞'],
      ['alegoría', 'allegory', '寓言'],
    ],
  },
  {
    level: 'C2',
    category: 'nature',
    rows: [
      ['ecosistema', 'ecosystem', '生态系统'],
      ['biodiversidad', 'biodiversity', '生物多样性'],
      ['sostenibilidad', 'sustainability', '可持续性'],
      ['deforestación', 'deforestation', '森林砍伐'],
      ['desertificación', 'desertification', '荒漠化'],
      ['acuífero', 'aquifer', '含水层'],
      ['glaciar', 'glacier', '冰川'],
      ['erosión', 'erosion', '侵蚀'],
      ['humedal', 'wetland', '湿地'],
      ['marisma', 'marsh', '沼泽'],
    ],
  },
];

const buildWords = (): Word[] => {
  let n = 0;
  const words: Word[] = [];
  for (const group of GROUPS) {
    for (const [spanish, english, chinese, exampleSentence] of group.rows) {
      n++;
      words.push({
        id: `w${String(n).padStart(3, '0')}`,
        spanish,
        english,
        chinese,
        level: group.level,
        category: group.category,
        ...(exampleSentence ? { exampleSentence } : {}),
      });
    }
  }
  return words;
};

export const SAMPLE_WORDS: Word[] = buildWords();

export const CATEGORY_LABELS: Record<WordCategory, string> = {
  food: '食物 Comida',
  family: '家庭 Familia',
  travel: '旅行 Viajes',
  work: '工作 Trabajo',
  health: '健康 Salud',
  nature: '自然 Naturaleza',
  education: '教育 Educación',
  sports: '运动 Deportes',
  technology: '科技 Tecnología',
  culture: '文化 Cultura',
};

// 一局至少需要的单词数 (minimum words for one puzzle)
export const MIN_WORDS_PER_PUZZLE = 5;

export const getWordsByLevel = (level: string): Word[] =>
  SAMPLE_WORDS.filter(word => word.level === level);

export const getWordsByCategory = (category: string): Word[] =>
  SAMPLE_WORDS.filter(word => word.category === category);

// 某等级下可玩的主题及单词数 (playable themes for a level, with word counts)
export const getCategoriesForLevel = (
  level: LanguageLevel
): { category: WordCategory; count: number }[] => {
  const counts = new Map<WordCategory, number>();
  for (const w of getWordsByLevel(level)) {
    counts.set(w.category, (counts.get(w.category) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, count]) => count >= MIN_WORDS_PER_PUZZLE)
    .map(([category, count]) => ({ category, count }));
};

export const getRandomWords = (count: number, level?: string, category?: string): Word[] => {
  let filtered = SAMPLE_WORDS;
  if (level) filtered = filtered.filter(word => word.level === level);
  if (category) filtered = filtered.filter(word => word.category === category);

  const shuffled = [...filtered];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
};
