import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

// 系统开启"减少动态效果"时返回 true（Web 端对应 prefers-reduced-motion）
export const useReducedMotion = () => {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then(v => mounted && setReduced(v))
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => {
      mounted = false;
      sub?.remove?.();
    };
  }, []);
  return reduced;
};
