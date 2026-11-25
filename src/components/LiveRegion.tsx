import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text } from 'react-native';
import { setWebAnnouncer } from '@/utils/announce';

// 视觉上隐藏、只给读屏用的播报区域（仅 Web）
export const LiveRegion: React.FC = () => {
  const [message, setMessage] = useState('');
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    // 先清空再写入，保证同一句话重复时也会被读出
    setWebAnnouncer(m => {
      setMessage('');
      setTimeout(() => setMessage(m), 50);
    });
    return () => setWebAnnouncer(null);
  }, []);
  if (Platform.OS !== 'web') return null;
  return (
    <Text aria-live="polite" style={styles.hidden}>
      {message}
    </Text>
  );
};

const styles = StyleSheet.create({
  hidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    overflow: 'hidden',
    opacity: 0,
  },
});
