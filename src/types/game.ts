// 西语等级
export type LanguageLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

// 主题分类
export type WordCategory =
  | 'food' // 食物
  | 'family' // 家庭
  | 'travel' // 旅行
  | 'work' // 工作
  | 'health' // 健康
  | 'nature' // 自然
  | 'education' // 教育
  | 'sports' // 运动
  | 'technology' // 科技
  | 'culture'; // 文化

// 单词数据结构
export interface Word {
  id: string;
  spanish: string; // 西语单词
  english: string; // 英文翻译
  chinese: string; // 中文翻译
  level: LanguageLevel;
  category: WordCategory;
  gender?: 'm' | 'f'; // 名词阴阳性（m = el, f = la）
  pronunciation?: string; // 发音（IPA）
  exampleSentence?: string; // 例句
}

export type Difficulty = 'easy' | 'medium' | 'hard';
export type Direction = 'horizontal' | 'vertical';

// 填字游戏单元格
export interface CrosswordCell {
  row: number;
  col: number;
  letter: string | null; // 当前字母
  correctLetter: string; // 正确字母
  isFixed: boolean; // 是否是提示字母（固定不可修改）
  wordIds: string[]; // 所属的单词ID列表
}

// 填字游戏中的单词位置
export interface CrosswordWord {
  id: string;
  wordData: Word;
  startRow: number;
  startCol: number;
  direction: Direction;
  clueNumber: number; // 提示编号（按标准填字规则：从左到右、从上到下编号）
  isCompleted: boolean; // 是否已完成
}

// 填字游戏关卡
export interface CrosswordPuzzle {
  id: string;
  level: LanguageLevel;
  category: WordCategory;
  rows: number; // 网格行数（已裁剪到单词范围）
  cols: number; // 网格列数
  words: CrosswordWord[];
  cells: CrosswordCell[][];
  difficulty: Difficulty; // 难度（提示字母比例；困难模式要求精确输入重音）
  unplacedWordIds: string[]; // 无法放进网格的单词
  estimatedTime: number; // 预估完成时间（秒）
}

// 游戏会话
export interface GameSession {
  puzzleId: string;
  startTime: number;
  endTime?: number;
  currentCells: CrosswordCell[][];
  hintsUsed: number;
  mistakes: number;
  totalEntries: number; // 输入次数（用于计算准确率）
  hintedWordIds: string[]; // 使用过提示的单词（不计入「已学会」）
  isCompleted: boolean;
  score?: number;
}

// 用户进度
export interface UserProgress {
  userId: string;
  wordsLearned: string[]; // 已学单词ID
  puzzlesCompleted: string[]; // 已完成关卡ID
  currentLevel: LanguageLevel;
  totalScore: number;
  streak: number; // 连续学习天数
  lastStudyDate: string;
  statistics: {
    totalGamesPlayed: number;
    totalWordsLearned: number;
    averageAccuracy: number;
    totalTimeSpent: number; // 总学习时间（秒）
  };
}

// 排行榜条目
export interface LeaderboardEntry {
  userId: string;
  username: string;
  score: number;
  rank: number;
  avatar?: string;
}

// 成就
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: number;
  unlockedAt?: number;
}
