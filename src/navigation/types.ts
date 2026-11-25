import { LanguageLevel, WordCategory, Difficulty } from '@/core/types/game';

export type GameParams =
  | { mode: 'free'; level: LanguageLevel; category: WordCategory; difficulty: Difficulty }
  | { mode: 'pack'; packId: string; difficulty: Difficulty }
  | { mode: 'daily' };

export type RootStackParamList = {
  Home: undefined;
  Game: GameParams;
  Achievements: undefined;
  Settings: undefined;
  WordPacks: undefined;
};
