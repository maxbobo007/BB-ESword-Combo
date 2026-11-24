# BB ESword - 西语填字游戏

一个基于React Native的西班牙语单词学习应用，通过填字游戏的方式帮助用户记忆西语单词。

## 功能特点

- 📚 **分级词库**: 支持A1-C2六个等级的西语词汇
- 🎯 **主题分类**: 按食物、家庭、旅行等10个主题组织单词
- 🎮 **填字游戏**: 类似填字谜的游戏方式，横纵交叉记忆单词
- 📊 **学习追踪**: 记录学习进度、已学单词、完成关卡
- 🏆 **成就系统**: 积分、连续学习天数、准确率统计
- 💾 **离线支持**: 本地存储，无需联网即可学习
- 🌐 **跨平台**: 支持Android和iOS（当前优先Android）

## 技术栈

- **框架**: Expo SDK 58（React Native 0.88）
- **语言**: TypeScript
- **状态管理**: Zustand
- **本地存储**: AsyncStorage

## 项目结构

```
BB ESword/
├── src/
│   ├── types/          # TypeScript类型定义
│   │   └── game.ts     # 游戏核心类型
│   ├── data/           # 数据层
│   │   └── words.ts    # 词库数据
│   ├── utils/          # 工具函数
│   │   ├── puzzleGenerator.ts  # 填字谜生成器
│   │   └── text.ts             # 重音/Ñ 处理
│   ├── store/          # 状态管理
│   │   └── gameStore.ts  # 游戏状态
│   └── screens/        # 页面组件
│       ├── HomeScreen.tsx    # 主页
│       └── GameScreen.tsx    # 游戏页面
├── scripts/
│   └── verifyPuzzles.ts  # 生成器自检
├── App.tsx             # 应用入口
├── package.json        # 依赖配置
└── tsconfig.json       # TypeScript配置
```

## 安装步骤

```bash
npm install
npx expo install --fix   # 把 Expo 相关依赖对齐到 SDK 58 的版本
npx expo start           # 手机装 Expo Go 扫码；或按 i / a 打开模拟器
```

> 如果 App Store 里的 Expo Go 还不支持 SDK 58，用 `npx expo run:ios` 本地构建，或用 `eas build --profile development` 做开发版。

自检（只需要 TypeScript）：

```bash
npm run verify   # 对所有可玩组合各生成上百局，检查网格不变量
```

## 游戏说明

### 填字游戏玩法

1. 根据中文/英文提示填入西语单词，名词会提示阴阳性（el / la）
2. 点格子选中整个单词，再点一次同一格切换横/竖；也可以点题目直接跳过去
3. 输入后光标自动跳到下一格，⌫ 会退回上一格
4. 蓝色字母是提示字母，不可修改
5. 简单、中等模式输入 E 也算 É 正确（格子里会显示正确的带重音字母）；困难模式必须输对重音

### 难度等级

- **简单**: 40%的字母作为提示，错字标红
- **中等**: 25%的字母作为提示
- **困难**: 15%的字母作为提示，重音必须精确输入

用过提示的单词不计入「已学会」。

### 计分系统

- 基础分: 1000分
- 错误扣分: 每个错误 -10分
- 提示扣分: 每次使用提示 -20分
- 时间扣分: 每秒 -0.5分

## 开发计划

- [x] 项目基础结构和配置
- [x] 核心填字游戏逻辑
- [x] 词库系统（分级、主题分类）
- [x] 学习追踪和进度系统
- [x] 迁移到 Expo；生成器重写（相邻检查、标准编号、自动裁剪网格）
- [x] 重音输入、题号显示、整词高亮、结算页
- [ ] 间隔重复（FSRS）选词
- [ ] B2–C2 词库、动词变位
- [ ] 社交功能（排行榜、好友对战）
- [ ] 离线模式完善
- [ ] 音频发音
- [ ] 自定义词库
- [ ] 每日挑战
- [ ] 深色模式

## 扩展词库

当前 260 个词，覆盖 A1–B1 × 10 个主题（每个组合 7–10 个词）。B2–C2 还在建设中。

在 `src/data/words.ts` 的 `EXPANDED` 里按 `'西语|英文|中文|m/f'` 的格式添加，或者用完整格式：

```typescript
{
  id: 'w021',
  spanish: 'casa',
  english: 'house',
  chinese: '房子',
  level: 'A1',
  category: 'family',
  exampleSentence: 'Mi casa es grande.'
}
```

## 许可证

MIT License
