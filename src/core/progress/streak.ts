// 连续学习天数：必须用本地日期，toISOString 是 UTC，会让 UTC+8 用户在晚间断签。

export function localDateString(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function previousDateString(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() - 1);
  return localDateString(date);
}

export function nextStreak(currentStreak: number, lastStudyDate: string, today: string): number {
  if (lastStudyDate === today) {
    return Math.max(1, currentStreak); // 同一天多局不重复累计
  }
  if (lastStudyDate === previousDateString(today)) {
    return currentStreak + 1;
  }
  return 1;
}
