#!/usr/bin/env node
/**
 * 零依赖生成安卓启动图标 PNG（API 23-25 的 mipmap 兜底；26+ 用自适应矢量图标）。
 * 图案：品牌蓝底 + 白色 5×5 填字网格，部分格子为深色"格挡"，模拟填字谜外观。
 */
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

const BG = [0x19, 0x76, 0xd2]; // #1976D2
const CELL = [0xff, 0xff, 0xff];
const BLOCKED = [0x0d, 0x47, 0xa1]; // 深蓝格挡

// 5×5 填字布局：1=白格，0=格挡
const LAYOUT = [
  [1, 1, 1, 1, 1],
  [1, 0, 1, 0, 1],
  [1, 1, 1, 1, 1],
  [1, 0, 1, 0, 1],
  [1, 1, 1, 1, 1],
];

function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = [];
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      table[n] = c >>> 0;
    }
  }
  let crc = 0xffffffff;
  for (const b of buf) {
    crc = table[(crc ^ b) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function makePng(size, round) {
  const raw = Buffer.alloc(size * (size * 4 + 1));
  const margin = Math.round(size * 0.16);
  const gridSize = size - margin * 2;
  const cellGap = Math.max(1, Math.round(size / 48));
  const cellSize = (gridSize - cellGap * 4) / 5;
  const center = size / 2;
  const radius = size / 2;

  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      let rgb = BG;
      let alpha = 255;

      if (round) {
        const dx = x - center + 0.5;
        const dy = y - center + 0.5;
        if (dx * dx + dy * dy > radius * radius) {
          alpha = 0;
        }
      }

      const gx = x - margin;
      const gy = y - margin;
      if (alpha > 0 && gx >= 0 && gy >= 0 && gx < gridSize && gy < gridSize) {
        const col = Math.min(4, Math.floor(gx / (cellSize + cellGap)));
        const row = Math.min(4, Math.floor(gy / (cellSize + cellGap)));
        const inCellX = gx - col * (cellSize + cellGap) < cellSize;
        const inCellY = gy - row * (cellSize + cellGap) < cellSize;
        if (inCellX && inCellY) {
          rgb = LAYOUT[row][col] ? CELL : BLOCKED;
        }
      }

      const o = y * (size * 4 + 1) + 1 + x * 4;
      raw[o] = rgb[0];
      raw[o + 1] = rgb[1];
      raw[o + 2] = rgb[2];
      raw[o + 3] = alpha;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const DENSITIES = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };
const resDir = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');

for (const [density, size] of Object.entries(DENSITIES)) {
  const dir = path.join(resDir, `mipmap-${density}`);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'ic_launcher.png'), makePng(size, false));
  fs.writeFileSync(path.join(dir, 'ic_launcher_round.png'), makePng(size, true));
  console.log(`mipmap-${density}: ${size}x${size} ok`);
}
console.log('done');
