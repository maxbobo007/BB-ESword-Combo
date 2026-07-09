// 游戏棋盘专用颜色（MD3 组件色板之外的领域 token）
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
    blocked: '#1A1C1E',
    selected: '#BBDEFB',
    fixedBg: '#D3E4FD',
    fixedText: '#0A3060',
    text: '#1A1C1E',
    border: '#C4C6CF',
    correctBg: '#E4F3E5',
    wordHighlight: '#E8F1FC',
  },
  success: '#2E7D32',
  warning: '#EF6C00',
};

export const darkGameTheme: GameTheme = {
  dark: true,
  cell: {
    bg: '#23262B',
    blocked: '#000000',
    selected: '#2E5A8F',
    fixedBg: '#2A4E7E',
    fixedText: '#D3E4FD',
    text: '#E2E2E6',
    border: '#44474E',
    correctBg: '#1E3B22',
    wordHighlight: '#20344E',
  },
  success: '#81C784',
  warning: '#FFB74D',
};
