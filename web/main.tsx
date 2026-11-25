import { AppRegistry } from 'react-native';
import App from '../App';

// 与移动端共用 App.tsx 和 src/ (same App.tsx and src/ as mobile)
AppRegistry.registerComponent('BBESword', () => App);
AppRegistry.runApplication('BBESword', {
  rootTag: document.getElementById('root'),
});
