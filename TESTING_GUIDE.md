# 测试指南

## 最简单：安装 CI 构建的 APK（推荐）

无需任何本地环境：

1. 打开仓库 **Actions** 页 → 最新的 `android` 工作流
2. 下载 **app-debug** 产物并解压得到 `app-debug.apk`
3. 安装到手机：
   - 方式 A：把 APK 传到手机（微信/网盘/数据线），点击安装（需允许"未知来源"）
   - 方式 B：`adb install app-debug.apk`

## 设备验收清单

- [ ] 应用正常启动，显示主页（无崩溃）
- [ ] 任选等级 × 主题 × 难度开局，网格有 6+ 个交叉单词
- [ ] 填对 café（键盘输入 C-A-F-E，无需重音键）→ 线索变绿显示 "café" 并朗读
- [ ] 完成整局 → 结算弹窗（得分/错误/成就）→ 返回主页，进度和连击已更新
- [ ] 今日挑战可玩且完成后当天标记 ✅，不能重复计
- [ ] 设置页切换深色/浅色/跟随系统，全部界面即时跟随
- [ ] 成就页显示解锁状态
- [ ] 飞行模式下游戏与发音正常（TTS 音色已下载的设备）
- [ ] 杀掉应用重开，学习进度仍在

## 本地跑模拟器（需要 Android Studio）

```bash
npm install
npm run android   # 需 ANDROID_HOME + 模拟器或 USB 真机
```

真机 USB 调试：手机开启开发者模式 + USB 调试，`adb devices` 确认后运行上面命令。

## 单元测试与类型检查

```bash
npm run type-check
npm test
```

核心逻辑（填字生成器不变量、重音归一化、每日谜题确定性、连击、成就）都有测试覆盖。

## 故障排除

```bash
# Metro 缓存
npm start -- --reset-cache

# Gradle 缓存
cd android && ./gradlew clean && cd ..

# 依赖重装
rm -rf node_modules && npm install
```

## iOS（后续版本）

iOS 工程尚未初始化（`ios/` 目前只有 Podfile），是下一阶段目标。
