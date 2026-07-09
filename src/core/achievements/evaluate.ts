import { UserProgress, AchievementDef } from '@/core/types/game';
import { ACHIEVEMENTS } from './definitions';

export function getNewlyUnlocked(progress: UserProgress): AchievementDef[] {
  return ACHIEVEMENTS.filter(def => !(def.id in progress.achievements) && def.check(progress));
}
