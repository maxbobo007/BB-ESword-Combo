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
  pronunciation?: string; // 发音（IPA）
  exampleSentence?: string; // 例句
}

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
  direction: 'horizontal' | 'vertical';
  clueNumber: number; // 提示编号
  isCompleted: boolean; // 是否已完成
}

// 填字游戏关卡
export interface CrosswordPuzzle {
  id: string;
  level: LanguageLevel;
  category: WordCategory;
  gridSize: number; // 网格大小（如10表示10x10）
  words: CrosswordWord[];
  cells: CrosswordCell[][];
  difficulty: 'easy' | 'medium' | 'hard'; // 难度（基于提示字母数量）
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
