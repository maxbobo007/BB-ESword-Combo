# BB ESword - 西语填字游戏

一个基于 React Native 的西班牙语单词学习应用，通过填字游戏的方式帮助用户记忆西语单词。

## 功能特点

- 📚 **分级词库**: 600 词，A1-C2 六个等级 × 10 个主题，全部含西/英/中翻译和例句
- 🎮 **填字游戏**: 横纵交叉记忆单词，重音自动归一化（é 填 E 即可，Ñ 为独立字母）
- 📅 **每日挑战**: 日期种子确定性谜题，每天一题全球同题
- 🏆 **成就系统**: 11 个成就（连击、词量、完美局等）
- 🔊 **西语发音**: 完成单词自动朗读（系统 TTS，可关闭）
- 🌗 **深色模式**: 跟随系统或手动切换
- 📊 **学习追踪**: 总分、已学单词、连续学习天数（本地持久化）
- 💾 **纯离线**: 无需联网，数据本地存储（预留同步接缝）
- 🌐 **跨平台架构**: 核心逻辑为纯 TS（`src/core`），为 iOS/Web/macOS 复用铺路

## 技术栈

- React Native 0.73（裸工程，非 Expo）+ TypeScript strict
- Zustand（persist 中间件持久化）+ AsyncStorage
- React Navigation (native-stack)
- react-native-tts（西语发音）
- Jest（核心逻辑 46+ 测试）

## 项目结构

```
src/
├── core/                  # 纯 TS，零 RN 依赖（未来四端复用）
│   ├── types/game.ts      # 核心类型
│   ├── data/words/        # 词库（a1…c2 按等级分文件）
│   ├── engine/            # 归一化 / 可种子随机 / 填字生成器
│   ├── progress/          # 连击 / 计分
│   ├── daily/             # 每日挑战（日期种子）
│   └── achievements/      # 成就定义与判定
├── services/              # 平台接缝
│   ├── storage/           # KeyValueStorage 抽象（AsyncStorage 实现）
│   └── speech/            # SpeechService 抽象（.native.ts / 未来 .web.ts）
├── store/                 # gameStore(内存) / progressStore / settingsStore(持久化)
├── theme/                 # 主题 token + ThemeProvider（深色模式）
├── navigation/            # native-stack 路由
├── screens/               # Home / Game / Achievements / Settings
└── components/            # Grid / Keyboard / ClueList
```

## 获取安卓 APK

每次 push 后 GitHub Actions 会自动构建：

1. 打开仓库的 **Actions** 页 → 选择最新的 `android` 工作流运行
2. 下载 **app-debug** 产物（app-debug.apk）
3. 传到手机安装（需允许安装未知来源应用），或 `adb install app-debug.apk`

## 本地开发

```bash
npm install
npm run type-check   # TS 检查
npm test             # 单元测试
npm start            # Metro
npm run android      # 需要本机 Android SDK + 模拟器/真机
```

## 游戏说明

1. 主页选择等级（A1-C2）→ 主题 → 难度（简单 40% / 中等 25% / 困难 15% 提示字母）
2. 点击格子，用屏幕键盘输入字母；重音不计，键盘含 Ñ
3. 单词填对会变绿并显示带重音的原词，可点 🔊 听发音
4. 计分：基础 1000 分，错误 -10，提示 -20，每秒 -0.5

## 开发计划

- [x] 核心填字引擎（交叉枚举、相邻校验、可种子随机）
- [x] 600 词分级词库
- [x] 导航 + 深色模式
- [x] TTS 发音、每日挑战、成就系统
- [x] 安卓构建 + CI 出包
- [ ] iOS 工程（Xcode 工程初始化 + Podfile 完善）
- [ ] Web 版（react-native-web + speech/index.web.ts）
- [ ] macOS（Web 版桌面壳或 react-native-macos）
- [ ] 数据同步后端（progressStore 已预留接缝）
- [ ] 社交功能（排行榜、好友对战）

## 扩展词库

编辑 `src/core/data/words/` 下对应等级文件即可，约束由测试保证
（ID 形如 `a1_food_01`，西语单词 3-12 个小写字母）：

```typescript
{
  id: 'a1_family_11',
  spanish: 'casa',
  english: 'house',
  chinese: '房子',
  level: 'A1',
  category: 'family',
  exampleSentence: 'Mi casa es grande.',
}
```

## 许可证

MIT License
