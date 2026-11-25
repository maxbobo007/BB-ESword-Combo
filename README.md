# BB ESword - 西语填字游戏

一个基于React Native的西班牙语单词学习应用，通过填字游戏的方式帮助用户记忆西语单词。

## 功能特点

- 📚 **分级词库**: 支持A1-C2六个等级的西语词汇
- 🎯 **主题分类**: 按食物、家庭、旅行等10个主题组织单词
- 🎮 **填字游戏**: 类似填字谜的游戏方式，横纵交叉记忆单词
- 📊 **学习追踪**: 记录学习进度、已学单词、完成关卡
- 🏆 **成就系统**: 积分、连续学习天数、准确率统计
- 💾 **离线支持**: 本地存储，无需联网即可学习
- 🌐 **跨平台**: Android、iOS 和 Web（浏览器）共用同一套代码

## 技术栈

- **框架**: React Native 0.73
- **语言**: TypeScript
- **状态管理**: Zustand
- **本地存储**: AsyncStorage
- **导航**: React Navigation
- **动画**: React Native Reanimated
- **Web**: react-native-web + Vite（与移动端共用 `App.tsx` 和 `src/`）

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
│   │   └── letters.ts  # 字母归一化（去重音，保留 Ñ）
│   ├── components/     # 通用组件
│   │   └── Dialog.tsx  # 跨平台弹窗
│   ├── store/          # 状态管理
│   │   └── gameStore.ts  # 游戏状态
│   └── screens/        # 页面组件
│       ├── HomeScreen.tsx    # 主页
│       └── GameScreen.tsx    # 游戏页面
├── web/                # Web 入口（index.html + main.tsx）
├── __tests__/          # 单元测试
├── vite.config.ts      # Web 构建配置
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

# Web（浏览器打开 http://localhost:5173）
npm run web
```

4. Web 版打包（输出到 `dist-web/`，可直接部署到任何静态网站托管）:
```bash
npm run web:build
```

5. 测试与类型检查:
```bash
npm test
npm run type-check
```

## 游戏说明

### 填字游戏玩法

1. 选择等级 → 主题 → 难度，点“开始游戏”
2. 根据英文/中文提示填入正确的西语单词
3. 横向和纵向的单词会在某些字母处交叉
4. 蓝色字母是提示字母，不可修改
5. 点击格子后用屏幕键盘输入；再点同一格可切换横 / 纵方向
6. 重音可以省略（café 填 CAFE），Ñ 是单独的一个键
7. Web 版可以直接用电脑键盘输入，方向键移动，退格删除
8. 完成所有单词即可过关，结束时会列出全部答案

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
- [x] Web 版本（react-native-web，与移动端共用代码）
- [x] 词库扩充到约 270 词（A1–C2，每个等级至少 2 个主题）
- [ ] 社交功能（排行榜、好友对战）— 暂缓
- [ ] 离线模式完善
- [ ] 音频发音
- [ ] 自定义词库
- [ ] 每日挑战
- [ ] 深色模式

## 扩展词库

当前约 270 个单词。在 `src/data/words.ts` 里找到对应的等级和主题分组，加一行即可（ID 自动生成）:

```typescript
['casa', 'house', '房子', 'Mi casa es grande.'], // [西语, 英语, 中文, 例句（可选）]
```

一个主题至少要有 5 个单词才会出现在选择列表里。单词必须是不含空格的单个词，最长 15 个字母。

## 许可证

MIT License
