// Web 预览构建（esbuild + react-native-web）
import * as esbuild from 'esbuild';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'web', 'dist');
fs.mkdirSync(outDir, { recursive: true });
fs.copyFileSync(path.join(root, 'web', 'index.html'), path.join(outDir, 'index.html'));
fs.copyFileSync(
  path.join(root, 'node_modules', 'react-native-vector-icons', 'Fonts', 'Ionicons.ttf'),
  path.join(outDir, 'Ionicons.ttf'),
);

await esbuild.build({
  entryPoints: [path.join(root, 'web', 'index.web.tsx')],
  bundle: true,
  outfile: path.join(outDir, 'bundle.js'),
  alias: {
    'react-native': 'react-native-web',
    '@': path.join(root, 'src'),
  },
  resolveExtensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.js', '.json'],
  loader: { '.ttf': 'file', '.png': 'file', '.js': 'jsx' },
  define: {
    __DEV__: 'false',
    'process.env.NODE_ENV': '"production"',
    global: 'window',
  },
  jsx: 'automatic',
  minify: false,
  logLevel: 'info',
});
console.log('web build ok →', outDir);
