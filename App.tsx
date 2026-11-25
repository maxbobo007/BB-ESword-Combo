import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { HomeScreen } from './src/screens/HomeScreen';
import { GameScreen } from './src/screens/GameScreen';
import { useGameStore } from './src/store/gameStore';

export default function App() {
  // 页面由 store 决定：有进行中的谜题就显示游戏页
  // The store decides the screen: an active puzzle shows the game.
  const isPlaying = useGameStore(state => state.currentPuzzle !== null);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1976D2" />
      {isPlaying ? <GameScreen /> : <HomeScreen />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
