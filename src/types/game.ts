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
  | 'culture' // 文化
  | 'home' // 家居
  | 'clothing' // 服装
  | 'city' // 城市与场所
  | 'time' // 时间
  | 'professions'; // 职业

// 词性
export type PartOfSpeech = 'noun' | 'verb';

// 单词数据结构
export interface Word {
  id: string;
  spanish: string; // 西语单词
  english: string; // 英文翻译
  chinese: string; // 中文翻译
  level: LanguageLevel;
  category: WordCategory; // 名词按主题分类；动词也保留一个大致主题
  pos: PartOfSpeech; // 词性
  gender?: 'm' | 'f'; // 名词的阴阳性
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
  revealed?: boolean; // 是否是游戏中用"提示"揭示出来的（区别于开局给出的字母）
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
  rows: number; // 裁剪后的网格行数
  cols: number; // 裁剪后的网格列数
  words: CrosswordWord[];
  unplacedWords: Word[]; // 没能放进网格的单词（之后用于"快速补练"）
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
  mistakes: number; // 整词填满但不正确时，按错误字母数累计
  wrongWordIds: string[]; // 本局出过错的单词
  hintedWordIds: string[]; // 本局用过提示的单词
  isCompleted: boolean;
  score?: number;
  accuracy?: number; // 0–100
}

// 开局设置，用于"再来一局"
export type BoardSize = 7 | 9 | 11;

export interface GameSettings {
  mode: PartOfSpeech; // 名词模式 / 动词模式
  level: LanguageLevel;
  topic: string; // 名词：WordCategory；动词：'ar' | 'er' | 'ir'
  difficulty: 'easy' | 'medium' | 'hard';
  boardSize: BoardSize; // 正方形棋盘边长
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
