// 截图脚本：iPhone 尺寸逐页截屏（浅色 + 深色）
import { chromium } from 'playwright';

const OUT = process.env.SHOT_DIR ?? '/tmp/shots';
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });

async function shoot(colorScheme) {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    colorScheme,
  });
  const page = await ctx.newPage();
  page.on('pageerror', e => console.log('PAGEERROR:', e.message));
  page.on('console', m => m.type() === 'error' && console.log('CONSOLE:', m.text()));
  const tag = colorScheme === 'dark' ? 'dark' : 'light';
  const snap = async name => {
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${OUT}/${tag}-${name}.png` });
    console.log(`shot ${tag}-${name}`);
  };

  await page.goto('http://localhost:8765/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await snap('home');

  // 展开 A1 并打开难度弹窗
  await page.getByText('A1 初级', { exact: false }).first().click();
  await snap('home-expanded');
  await page.getByText(/^食物 \d+/).first().click();
  await snap('difficulty-dialog');
  await page.getByText('开始游戏').click();
  await page.waitForTimeout(1500);
  await snap('game');

  // 返回 → 设置
  await page.getByText('返回').first().click();
  await page.waitForTimeout(600);
  await page.getByText('词库管理').first().click();
  await page.waitForTimeout(600);
  await snap('wordpacks');
  await page.getByText('返回').first().click();
  await page.waitForTimeout(600);

  await ctx.close();
}

await shoot('light');
await shoot('dark');
await browser.close();
console.log('done');
