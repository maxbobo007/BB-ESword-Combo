import { Platform } from 'react-native';

// 设计方向：摊在暖色纸面上的一套赤陶拼字方块。
// 语义命名，以后加深色主题只需再写一份同样 key 的对象。
export const colors = {
  background: '#FBF6EE',
  surface: '#FFFFFF',
  surfaceAlt: '#F3EADC',
  ink: '#2B2420',
  inkMuted: '#6B5F55',
  inkDisabled: '#B3A799',
  border: '#E3D5BF',
  borderStrong: '#D6C6AC',

  primary: '#B5482A',
  primaryPressed: '#96391F',
  onPrimary: '#FFFFFF',
  primarySoft: '#FBE3D6',

  accent: '#1F4E79',
  accentSoft: '#E3ECF5',

  success: '#4F7A28',
  successSoft: '#DCEBC6',
  onSuccessSoft: '#2F4A16',

  warning: '#8A5A00',
  warningTile: '#F6C445',
  warningSoft: '#FCEBB6',

  danger: '#B3261E',
  dangerSoft: '#F9DEDC',

  tile: '#FFFDF8',
  tileBorder: '#E3D5BF',
  tileEdge: '#D2BF9F',
  tileText: '#2B2420',
  tileNumber: '#8A7D70',
  tileHintBg: '#EFE2CC',
  tileHintText: '#9A3B21',
  tileActiveWord: '#FBE3D6',
  tileActiveBorder: '#E8B9A3',
  tileSelected: '#B5482A',
  tileSelectedEdge: '#7E2F19',
  tileCorrectBg: '#DCEBC6',
  tileCorrectText: '#2F4A16',
  tileCorrectEdge: '#4F7A28',

  overlay: 'rgba(43,36,32,0.45)',
} as const;

export const space = { xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = { sm: 6, md: 10, lg: 14, xl: 20, pill: 999 } as const;

// 统一用 boxShadow：新架构下 iOS / Android / Web 写法一致。
// 阴影只做装饰，层级同时用边框表达。
export const shadow = {
  card: '0 1px 2px rgba(43,36,32,0.06), 0 4px 12px rgba(43,36,32,0.06)',
  raised: '0 2px 4px rgba(43,36,32,0.08), 0 8px 24px rgba(43,36,32,0.10)',
  primary: '0 4px 12px rgba(181,72,42,0.28)',
} as const;

// Nunito 只用于拉丁字母和数字（格子、键盘、西语单词、分数、品牌字）。
// 中文文案用系统字体 + fontWeight。字体加载失败时 fontsReady=false，全部回退系统字体。
let fontsReady = true;
export const setFontsReady = (ready: boolean) => {
  fontsReady = ready;
};

type LatinWeight = 600 | 700 | 800;
const FAMILY: Record<LatinWeight, string> = {
  600: 'Nunito_600SemiBold',
  700: 'Nunito_700Bold',
  800: 'Nunito_800ExtraBold',
};

// 拉丁字体样式：原生端用 fontFamily 区分字重（不再叠加 fontWeight），Web 端用字体栈
export const latin = (weight: LatinWeight) => {
  if (!fontsReady) return { fontWeight: String(weight) as '600' | '700' | '800' };
  return Platform.select({
    web: {
      fontFamily: `${FAMILY[weight]}, "PingFang SC", "Microsoft YaHei", system-ui, sans-serif`,
    },
    default: { fontFamily: FAMILY[weight] },
  })!;
};

export const type = {
  display: { fontSize: 32, lineHeight: 38 },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '700' as const },
  heading: { fontSize: 17, lineHeight: 24, fontWeight: '700' as const },
  body: { fontSize: 15, lineHeight: 22 },
  label: { fontSize: 15, lineHeight: 20, fontWeight: '600' as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const },
  tileLetterRatio: 0.52,
  tileNumberRatio: 0.24,
} as const;

// Web 端键盘焦点环（Pressable 的 style 回调里使用）
export const focusRing = {
  outlineColor: colors.primary,
  outlineStyle: 'solid',
  outlineWidth: 2,
  outlineOffset: 2,
} as const;

// 只在用键盘操作时显示焦点环（类似 CSS :focus-visible），鼠标/触摸点击后不残留
let keyboardModality = false;
let modalityInstalled = false;
export const installFocusModality = () => {
  if (modalityInstalled || Platform.OS !== 'web' || typeof document === 'undefined') return;
  modalityInstalled = true;
  document.addEventListener(
    'keydown',
    e => {
      if (e.key === 'Tab' || e.key.startsWith('Arrow')) keyboardModality = true;
    },
    true
  );
  document.addEventListener('pointerdown', () => (keyboardModality = false), true);
};

export const webFocus = (state: { pressed: boolean }) =>
  Platform.OS === 'web' && keyboardModality && (state as { focused?: boolean }).focused
    ? focusRing
    : null;
