import { TextStyle } from 'react-native';

// Apple HIG 色板与字体阶梯（iOS 系统语义色，浅/深两套）
export interface CupertinoTheme {
  dark: boolean;
  colors: {
    tint: string; // systemBlue，全局强调色
    onTint: string;
    tintSoft: string; // tinted button 背景（15% 蓝）
    green: string; // systemGreen（开关、成功）
    red: string; // systemRed（销毁操作）
    orange: string;
    background: string; // grouped background
    card: string; // 分组卡片/浮层
    elevated: string; // 弹窗等更高层级
    label: string;
    secondaryLabel: string;
    tertiaryLabel: string;
    separator: string;
    fill: string; // 控件填充（分段控件轨道、键盘键）
    chevron: string;
  };
}

export const cupertinoLight: CupertinoTheme = {
  dark: false,
  colors: {
    tint: '#007AFF',
    onTint: '#FFFFFF',
    tintSoft: 'rgba(0,122,255,0.14)',
    green: '#34C759',
    red: '#FF3B30',
    orange: '#FF9500',
    background: '#F2F2F7',
    card: '#FFFFFF',
    elevated: '#FFFFFF',
    label: '#000000',
    secondaryLabel: 'rgba(60,60,67,0.60)',
    tertiaryLabel: 'rgba(60,60,67,0.30)',
    separator: 'rgba(60,60,67,0.29)',
    fill: 'rgba(120,120,128,0.16)',
    chevron: '#C7C7CC',
  },
};

export const cupertinoDark: CupertinoTheme = {
  dark: true,
  colors: {
    tint: '#0A84FF',
    onTint: '#FFFFFF',
    tintSoft: 'rgba(10,132,255,0.22)',
    green: '#30D158',
    red: '#FF453A',
    orange: '#FF9F0A',
    background: '#000000',
    card: '#1C1C1E',
    elevated: '#2C2C2E',
    label: '#FFFFFF',
    secondaryLabel: 'rgba(235,235,245,0.60)',
    tertiaryLabel: 'rgba(235,235,245,0.30)',
    separator: 'rgba(84,84,88,0.60)',
    fill: 'rgba(120,120,128,0.24)',
    chevron: '#48484A',
  },
};

// iOS 字体阶梯（SF Pro 尺寸，安卓上落到 Roboto 同字号）
export const type: Record<string, TextStyle> = {
  largeTitle: { fontSize: 34, fontWeight: '700', letterSpacing: 0.37 },
  title2: { fontSize: 22, fontWeight: '700', letterSpacing: 0.35 },
  title3: { fontSize: 20, fontWeight: '600', letterSpacing: 0.38 },
  headline: { fontSize: 17, fontWeight: '600', letterSpacing: -0.41 },
  body: { fontSize: 17, fontWeight: '400', letterSpacing: -0.41 },
  callout: { fontSize: 16, fontWeight: '400', letterSpacing: -0.32 },
  subhead: { fontSize: 15, fontWeight: '400', letterSpacing: -0.24 },
  footnote: { fontSize: 13, fontWeight: '400', letterSpacing: -0.08 },
  caption: { fontSize: 12, fontWeight: '400' },
};
