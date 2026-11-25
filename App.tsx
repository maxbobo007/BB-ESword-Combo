import React, { useEffect } from 'react';
import { Platform, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useCupertino } from '@/theme/ThemeProvider';
import { RootNavigator } from '@/navigation/RootNavigator';

function ThemedApp() {
  const { dark, colors } = useCupertino();
  // 网页端：页面底色（桌面两侧留白、iOS 橡皮筋区域）与主题保持一致
  useEffect(() => {
    if (Platform.OS === 'web') {
      document.body.style.backgroundColor = colors.background;
      document.documentElement.style.backgroundColor = colors.background;
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', colors.background);
    }
  }, [colors.background]);
  return (
    <>
      <StatusBar
        barStyle={dark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <RootNavigator />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ThemedApp />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
