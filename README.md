# BB ESword：西语填字

用填字游戏记西班牙语单词（之后还会加上动词变位），一套代码同时支持 iOS、Android 和 Web。

后续规划见 [docs/ROADMAP.md](docs/ROADMAP.md)。

## 技术栈

- [Expo](https://docs.expo.dev/) SDK 58（React Native 0.88）+ Expo Router
- TypeScript、Zustand
- Jest（jest-expo）+ React Native Testing Library

## 开始

```bash
npm install
npm start          # 启动开发服务器，用 Expo Go 扫码在手机上预览
npm run web        # 在浏览器里运行
npm run android    # Android 模拟器或真机
npm run ios        # iOS 模拟器（需要 Mac）
```

`ios/` 和 `android/` 不提交到仓库，需要时用 `npx expo prebuild` 生成。打安装包用 EAS：`npx eas-cli@latest build`。

## 检查

```bash
npx tsc --noEmit   # 类型检查
npm run lint       # ESLint
npm test           # 单元测试和页面测试
```

GitHub Actions 会在每个 PR 上跑这几项，外加一次 Web 构建。

## 目录结构

```
src/
├── app/            # 路由：每个文件就是一个页面（Expo Router）
│   ├── _layout.tsx
│   ├── index.tsx   # 主页
│   └── game.tsx    # 游戏页
├── components/     # 页面组件和通用组件
├── data/words.ts   # 示例词库
├── store/          # Zustand 状态
├── types/          # 类型定义
└── utils/
    ├── letters.ts          # 重音和 Ñ 的字母比较
    └── puzzleGenerator.ts  # 填字生成器
```

## 填字生成器

- 按标准填字规则放词：单词首尾前后不能紧贴别的字母，新字母两侧不能有字母，所以不会拼出伪单词。
- 支持随机种子：同一个种子加同一组词，得到同一个关卡。
- 放不下的词放进 `unplacedWords`，不会悄悄丢掉。
- 生成后把网格裁剪到实际用到的大小。

## 许可证

MIT
