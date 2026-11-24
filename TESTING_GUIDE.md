# 测试指南

## 手机上测（最简单）

1. 手机安装 **Expo Go**（App Store / Google Play）
2. 电脑上运行：
   ```bash
   npm install
   npx expo install --fix
   npx expo start
   ```
3. iPhone 用相机扫终端里的二维码，Android 用 Expo Go 扫码

> Expo Go 只支持最新的一个 SDK。如果提示版本不匹配，运行 `npx expo run:ios`（需要 Xcode）本地构建开发版。

## 模拟器

`npx expo start` 后按 `i`（iOS 模拟器，需要 Xcode）或 `a`（Android 模拟器）。

## 逻辑自检

```bash
npm run verify
```

对每个可玩的 等级 × 主题 × 难度 组合各生成 40 局，检查：单词都在格子里拼对、没有无意义的字母串、编号连续且按位置排序、网格不超过 13×11、每个词至少留一格给玩家。

## 手动测试清单

- [ ] 主页选 A1 / 食物 / 中等 → 开始
- [ ] 格子左上角有题号，点题目能跳到对应格子
- [ ] 输入后光标自动前进，⌫ 能退格
- [ ] café：中等模式输入 E 显示 É；困难模式输入 E 算错
- [ ] 「提示」优先揭开当前选中的词
- [ ] 完成后显示结算页，「再来一局」「返回主页」都能用
- [ ] 中途「‹ 退出」能回主页
- [ ] 完成一局后主页的连续天数变成 1
