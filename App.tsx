import React from 'react';
import { StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { HomeScreen } from './src/screens/HomeScreen';
import { GameScreen } from './src/screens/GameScreen';
import { useGameStore } from './src/store/gameStore';

export default function App() {
  // 有进行中的关卡就显示游戏页；退出或结束后清空关卡，自动回到主页
  const hasPuzzle = useGameStore(state => state.currentPuzzle !== null);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar style={hasPuzzle ? 'dark' : 'light'} />
        {hasPuzzle ? <GameScreen /> : <HomeScreen />}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
