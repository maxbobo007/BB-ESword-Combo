import { AccessibilityInfo, Platform } from 'react-native';

type Listener = (message: string) => void;
let webListener: Listener | null = null;

// Web 端由 <LiveRegion /> 注册，用 aria-live 区域播报；原生端走系统读屏
export const setWebAnnouncer = (listener: Listener | null) => {
  webListener = listener;
};

export const announce = (message: string) => {
  if (Platform.OS === 'web') {
    webListener?.(message);
  } else {
    AccessibilityInfo.announceForAccessibility(message);
  }
};
