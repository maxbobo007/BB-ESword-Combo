import { Word } from '@/types/game';

// 示例词库 - 实际使用时可从API或本地数据库加载
export const SAMPLE_WORDS: Word[] = [
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
    level: 'A2',
    category: 'travel',
    exampleSentence: 'El viaje fue increíble.',
  },
  {
    id: 'w012',
    spanish: 'hotel',
    english: 'hotel',
    chinese: '酒店',
    level: 'A2',
    category: 'travel',
    exampleSentence: 'Reservé un hotel cerca de la playa.',
  },
  {
    id: 'w013',
    spanish: 'playa',
    english: 'beach',
    chinese: '海滩',
    level: 'A2',
    category: 'travel',
    exampleSentence: 'Vamos a la playa este verano.',
  },
  {
    id: 'w014',
    spanish: 'avión',
    english: 'airplane',
    chinese: '飞机',
    level: 'A2',
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
    level: 'B1',
    category: 'work',
    exampleSentence: 'Mi trabajo es muy interesante.',
  },
  {
    id: 'w017',
    spanish: 'jefe',
    english: 'boss',
    chinese: '老板',
    level: 'B1',
    category: 'work',
    exampleSentence: 'Mi jefe es muy exigente.',
  },
  {
    id: 'w018',
    spanish: 'oficina',
    english: 'office',
    chinese: '办公室',
    level: 'B1',
    category: 'work',
    exampleSentence: 'La oficina está en el centro.',
  },
  {
    id: 'w019',
    spanish: 'reunión',
    english: 'meeting',
    chinese: '会议',
    level: 'B1',
    category: 'work',
    exampleSentence: 'Tenemos una reunión importante.',
  },
  {
    id: 'w020',
    spanish: 'proyecto',
    english: 'project',
    chinese: '项目',
    level: 'B1',
    category: 'work',
    exampleSentence: 'Estamos trabajando en un nuevo proyecto.',
  },
];

// 按等级获取单词
export const getWordsByLevel = (level: string): Word[] => {
  return SAMPLE_WORDS.filter(word => word.level === level);
};

// 按分类获取单词
export const getWordsByCategory = (category: string): Word[] => {
  return SAMPLE_WORDS.filter(word => word.category === category);
};

// 获取随机单词
export const getRandomWords = (count: number, level?: string, category?: string): Word[] => {
  let filtered = SAMPLE_WORDS;

  if (level) {
    filtered = filtered.filter(word => word.level === level);
  }

  if (category) {
    filtered = filtered.filter(word => word.category === category);
  }

  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};
