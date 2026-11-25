// 游戏棋盘专用颜色（iOS 系统蓝色系）
export interface GameTheme {
  dark: boolean;
  cell: {
    bg: string;
    blocked: string;
    selected: string;
    fixedBg: string;
    fixedText: string;
    text: string;
    border: string;
    correctBg: string; // 已填对格子的柔和高亮
    wordHighlight: string; // 当前单词整词淡高亮
  };
  success: string;
  warning: string;
}

export const lightGameTheme: GameTheme = {
  dark: false,
  cell: {
    bg: '#FFFFFF',
    blocked: '#1C1C1E',
    selected: 'rgba(0,122,255,0.35)',
    fixedBg: 'rgba(0,122,255,0.12)',
    fixedText: '#007AFF',
    text: '#000000',
    border: 'rgba(60,60,67,0.29)',
    correctBg: 'rgba(52,199,89,0.16)',
    wordHighlight: 'rgba(0,122,255,0.08)',
  },
  success: '#34C759',
  warning: '#FF9500',
};

export const darkGameTheme: GameTheme = {
  dark: true,
  cell: {
    bg: '#1C1C1E',
    blocked: '#000000',
    selected: 'rgba(10,132,255,0.45)',
    fixedBg: 'rgba(10,132,255,0.22)',
    fixedText: '#64A8FF',
    text: '#FFFFFF',
    border: 'rgba(84,84,88,0.60)',
    correctBg: 'rgba(48,209,88,0.22)',
    wordHighlight: 'rgba(10,132,255,0.12)',
  },
  success: '#30D158',
  warning: '#FF9F0A',
};
