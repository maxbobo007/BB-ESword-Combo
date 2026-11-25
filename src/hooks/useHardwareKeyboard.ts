/// <reference lib="dom" />
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { normalizeLetter } from '@/core/engine/normalize';

interface Handlers {
  enabled: boolean;
  onLetter: (letter: string) => void;
  onDelete: () => void;
  onToggleDirection: () => void;
}

/**
 * 网页端物理键盘：字母（重音自动归一化）、Backspace/Delete 删除、空格/Tab 切换横纵方向。
 * 原生平台不做任何事。
 */
export function useHardwareKeyboard({ enabled, onLetter, onDelete, onToggleDirection }: Handlers) {
  useEffect(() => {
    if (Platform.OS !== 'web' || !enabled) {
      return;
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) {
        return;
      }
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return; // 在输入框（如导入词库）里打字时不拦截
      }
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        onDelete();
      } else if (e.key === ' ' || e.key === 'Tab') {
        e.preventDefault();
        onToggleDirection();
      } else if (e.key.length === 1) {
        const ch = normalizeLetter(e.key);
        if (/^[A-ZÑ]$/.test(ch)) {
          e.preventDefault();
          onLetter(ch);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });
}
