// 网页版冒烟测试：持久化 / 浏览器后退 / 物理键盘 / 桌面布局 / 离线（PWA）
// 用法：node web/build.mjs && node web/smoke.mjs   （自带静态服务器，截图输出到 SHOT_DIR）
import { chromium } from 'playwright';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'web', 'dist');
const SHOT_DIR = process.env.SHOT_DIR ?? path.join(root, 'web', 'shots');
fs.mkdirSync(SHOT_DIR, { recursive: true });

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png',
  '.ttf': 'font/ttf', '.webmanifest': 'application/manifest+json',
};
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]);
  const file = path.join(dist, rel.endsWith('/') ? rel + 'index.html' : rel);
  if (!file.startsWith(dist) || !fs.existsSync(file)) {
    res.writeHead(404).end('not found');
    return;
  }
  res.writeHead(200, { 'content-type': MIME[path.extname(file)] ?? 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://localhost:${server.address().port}/`;

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM ?? '/opt/pw-browsers/chromium' });
let failures = 0;
const errors = [];
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
  if (!ok) failures++;
};

const T = (pg, ...args) => pg.getByText(...args).filter({ visible: true }).first();

const newPage = async (ctx) => {
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
  page.on('console', m => m.type() === 'error' && errors.push(`console: ${m.text()}`));
  return page;
};

// ———— 手机视口 ————
const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const page = await newPage(mobile);
await page.goto(base, { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
check('首页渲染', await T(page, '今日挑战').isVisible());

// 持久化：切换深色 → 刷新 → 仍为深色
await page.getByLabel('设置').click();
await T(page, '深色').click();
await page.waitForTimeout(300);
let bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
check('切换深色后页面底色变黑', bg === 'rgb(0, 0, 0)', bg);
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(800);
bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
check('刷新后主题偏好保留（localStorage 持久化）', bg === 'rgb(0, 0, 0)', bg);

// 恢复浅色，测试后退键
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(800);
await page.getByLabel('设置').click();
await T(page, '词库管理').click();
await page.waitForTimeout(500);
check('进入词库管理', await T(page, '等级词库', { exact: false }).isVisible());
await page.goBack();
await page.waitForTimeout(500);
check('浏览器后退 → 设置页', await T(page, '外观', { exact: false }).isVisible());
await page.goBack();
await page.waitForTimeout(500);
check('再后退 → 首页', await T(page, '今日挑战').isVisible());

// 开局 + 物理键盘
await T(page, 'A1 初级').click();
await T(page, /^食物 \d+/).click();
await T(page, '开始游戏').click();
await page.waitForTimeout(1200);
check('进入游戏页', await T(page, '错误 0').isVisible());
// 点第一个空白可编辑格：网格内尺寸近似正方形、无文字的可聚焦元素
const cellHandle = await page.evaluateHandle(() => {
  const cells = [...document.querySelectorAll('[tabindex="0"]')].filter(el => {
    const r = el.getBoundingClientRect();
    return r.width > 20 && r.width < 45 && Math.abs(r.width - r.height) < 2 && r.top > 150 && r.top < 560 && !el.textContent;
  });
  return cells[0] ?? null;
});
const cell = cellHandle.asElement();
check('找到可编辑格', !!cell);
if (cell) {
  await cell.click();
  // 西语键盘按 ñ 键时浏览器派发的就是 key:'ñ' 的 keydown
  await page.evaluate(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ñ', bubbles: true })));
  await page.waitForTimeout(300);
  const hasN = await page.evaluate(() => [...document.querySelectorAll('div')].some(d => d.children.length === 0 && d.textContent === 'Ñ' && d.getBoundingClientRect().top < 600));
  check('物理键盘输入 ñ 落格为 Ñ', hasN);
  const wrong = await T(page, /错误 [1-9]/).isVisible().catch(() => false);
  check('错字计入错误数', wrong);
}
await page.screenshot({ path: path.join(SHOT_DIR, 'mobile-game.png') });

// PWA：Service Worker 注册并缓存 → 离线可打开
await page.goto(base, { waitUntil: 'networkidle' });
await page.evaluate(() => navigator.serviceWorker.ready);
await page.reload({ waitUntil: 'networkidle' });
await mobile.setOffline(true);
await page.reload({ waitUntil: 'domcontentloaded' });
await page.waitForTimeout(1500);
check('离线刷新仍可打开（Service Worker 缓存）', await T(page, '今日挑战').isVisible().catch(() => false));
await mobile.setOffline(false);
await mobile.close();

// ———— 桌面视口 ————
const desktop = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
const dpage = await newPage(desktop);
await dpage.goto(base, { waitUntil: 'networkidle' });
await dpage.waitForTimeout(800);
const w = await dpage.evaluate(() => Math.round(document.querySelector('#root > div').getBoundingClientRect().width));
check('桌面端内容列居中且宽度 ≤ 520', w <= 520 && w > 300, `${w}px`);
await dpage.screenshot({ path: path.join(SHOT_DIR, 'desktop-home.png') });
await T(dpage, 'A1 初级').click();
await T(dpage, /^食物 \d+/).click();
await T(dpage, '开始游戏').click();
await dpage.waitForTimeout(1200);
await dpage.screenshot({ path: path.join(SHOT_DIR, 'desktop-game.png') });
await desktop.close();

check('无页面错误', errors.filter(e => !/favicon|sw\.js/.test(e)).length === 0, errors.slice(0, 3).join(' | '));
await browser.close();
server.close();
console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAILED`);
process.exit(failures === 0 ? 0 : 1);
