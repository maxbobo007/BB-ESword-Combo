import React, { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
  createNavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useCupertino } from '@/theme/ThemeProvider';
import { RootStackParamList } from '@/navigation/types';
import { HomeScreen } from '@/screens/HomeScreen';
import { GameScreen } from '@/screens/GameScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { AchievementsScreen } from '@/screens/AchievementsScreen';
import { WordPacksScreen } from '@/screens/WordPacksScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const navRef = createNavigationContainerRef<RootStackParamList>();

export function RootNavigator() {
  const { dark, colors } = useCupertino();
  const base = dark ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: {
      ...base.colors,
      background: colors.background,
      card: colors.card,
      text: colors.label,
      primary: colors.tint,
      border: colors.separator,
    },
  };

  // 网页端：让浏览器前进/后退键与页面栈同步（不改 URL，避免 GitHub Pages 子路径与刷新问题）。
  // 每进入一层就 pushState({n: 栈深度})；popstate 时若浏览器记录深度低于页面栈，则逐层返回。
  const depthRef = useRef(1);
  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }
    // 应用总是从首页（栈深 1）启动；刷新后浏览器当前条目可能还带着上次会话的深度，重置之
    window.history.replaceState({ n: 1 }, '');
    const onPop = (e: PopStateEvent) => {
      const target: number = typeof e.state?.n === 'number' ? e.state.n : 1;
      const steps = depthRef.current - target;
      for (let i = 0; i < steps && navRef.canGoBack(); i++) {
        navRef.goBack();
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const onStateChange = () => {
    if (Platform.OS !== 'web') {
      return;
    }
    const n = navRef.getRootState()?.routes.length ?? 1;
    const prev = depthRef.current;
    depthRef.current = n;
    if (n > prev) {
      for (let i = prev + 1; i <= n; i++) {
        window.history.pushState({ n: i }, '');
      }
    } else if (n < prev) {
      // 通过界面上的返回按钮退栈时，同步收回浏览器历史
      const historyDepth: number = window.history.state?.n ?? 1;
      if (historyDepth > n) {
        window.history.go(n - historyDepth);
      }
    }
  };

  return (
    <NavigationContainer ref={navRef} theme={navTheme} onStateChange={onStateChange}>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Game" component={GameScreen} />
        <Stack.Screen name="Achievements" component={AchievementsScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="WordPacks" component={WordPacksScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
