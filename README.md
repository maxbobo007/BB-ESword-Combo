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

- **框架**: React Native 0.73
- **语言**: TypeScript
- **状态管理**: Zustand
- **本地存储**: AsyncStorage
- **导航**: React Navigation
- **动画**: React Native Reanimated

## 项目结构

```
BB ESword/
├── src/
│   ├── types/          # TypeScript类型定义
│   │   └── game.ts     # 游戏核心类型
│   ├── data/           # 数据层
│   │   └── words.ts    # 词库数据
│   ├── utils/          # 工具函数
│   │   └── puzzleGenerator.ts  # 填字谜生成器
│   ├── store/          # 状态管理
│   │   └── gameStore.ts  # 游戏状态
│   └── screens/        # 页面组件
│       ├── HomeScreen.tsx    # 主页
│       └── GameScreen.tsx    # 游戏页面
├── App.tsx             # 应用入口
├── package.json        # 依赖配置
└── tsconfig.json       # TypeScript配置
```

## 安装步骤

1. 安装依赖:
```bash
npm install
# 或
yarn install
```

2. 安装iOS依赖（仅Mac）:
```bash
cd ios && pod install && cd ..
```

3. 运行应用:
```bash
# Android
npm run android

# iOS
npm run ios
```

## 游戏说明

### 填字游戏玩法

1. 根据英文/中文提示填入正确的西语单词
2. 横向和纵向的单词会在某些字母处交叉
3. 蓝色字母是提示字母，不可修改
4. 点击空白格子，使用虚拟键盘输入字母
5. 完成所有单词即可过关

### 难度等级

- **简单**: 40%的字母作为提示
- **中等**: 25%的字母作为提示
- **困难**: 15%的字母作为提示

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
- [ ] 社交功能（排行榜、好友对战）
- [ ] 离线模式完善
- [ ] 音频发音
- [ ] 自定义词库
- [ ] 每日挑战
- [ ] 深色模式

## 扩展词库

当前包含20个示例单词。可以通过编辑 `src/data/words.ts` 添加更多单词:

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
