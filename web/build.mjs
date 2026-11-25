// Web 构建（esbuild + react-native-web）→ web/dist，含 PWA 资源
import * as esbuild from 'esbuild';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'web', 'dist');
const require = createRequire(import.meta.url);
const { makePng } = require(path.join(root, 'scripts', 'gen-icons.js'));

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

// 静态资源
fs.copyFileSync(path.join(root, 'web', 'index.html'), path.join(outDir, 'index.html'));
fs.copyFileSync(
  path.join(root, 'node_modules', 'react-native-vector-icons', 'Fonts', 'Ionicons.ttf'),
  path.join(outDir, 'Ionicons.ttf'),
);
fs.writeFileSync(path.join(outDir, 'icon-192.png'), makePng(192, false));
fs.writeFileSync(path.join(outDir, 'icon-512.png'), makePng(512, false));
fs.writeFileSync(path.join(outDir, '.nojekyll'), '');

// PWA manifest
fs.writeFileSync(
  path.join(outDir, 'manifest.webmanifest'),
  JSON.stringify(
    {
      name: 'BB 西语填字',
      short_name: '西语填字',
      description: '用填字游戏学西班牙语',
      start_url: './',
      scope: './',
      display: 'standalone',
      orientation: 'portrait',
      lang: 'zh-CN',
      background_color: '#F2F2F7',
      theme_color: '#F2F2F7',
      icons: [
        { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
        { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
      ],
    },
    null,
    2,
  ),
);

// 打包 JS
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
  // 注意：不能开 minifySyntax —— 实测它会让依赖里的某段代码在打开设置页时抛
  // "ReferenceError: V is not defined"（二分确认）。仅关这一项，体积只多约 33 KB。
  minifyWhitespace: true,
  minifyIdentifiers: true,
  minifySyntax: false,
  target: 'es2020',
  logLevel: 'warning',
});

// Service Worker：缓存版本随构建变化，新版本部署后自动更新缓存
const buildId = Date.now().toString(36);
const assets = [
  './',
  './index.html',
  './bundle.js',
  './Ionicons.ttf',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
];
fs.writeFileSync(
  path.join(outDir, 'sw.js'),
  `const CACHE = 'bbesword-${buildId}';
const ASSETS = ${JSON.stringify(assets)};
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(ASSETS.map(u => fetch(u, { cache: 'reload' }).then(r => c.put(u, r)))))
      .then(() => self.skipWaiting()),
  );
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    })),
  );
});
`,
);

const size = fs.statSync(path.join(outDir, 'bundle.js')).size;
console.log(`web build ok → ${outDir} (bundle ${(size / 1024).toFixed(0)} KB, build ${buildId})`);
