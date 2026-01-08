# 测试指南

## 推荐方案：iOS模拟器（最简单）

### 前置要求
- 已安装 Xcode（你已经有了✅）
- 已安装 Node.js

### 步骤

1. **安装依赖**
```bash
cd "/Users/maxzhou/Documents/Claude Code/BB ESword"
npm install
```

2. **安装CocoaPods（如果没有）**
```bash
sudo gem install cocoapods
```

3. **安装iOS依赖**
```bash
cd ios
pod install
cd ..
```

4. **运行iOS模拟器**
```bash
npm run ios
```

这将自动打开iOS模拟器并运行应用。

---

## 备选方案1：使用真实iPhone测试

### 通过Xcode无线调试

1. **iPhone和Mac连接同一WiFi**

2. **在iPhone上**
   - 设置 → 通用 → 关于本机 → 点击"名称"多次启用开发者模式
   - 设置 → 隐私与安全 → 开发者模式 → 开启

3. **在Mac上**
```bash
# 安装依赖
npm install
cd ios && pod install && cd ..

# 用数据线首次连接iPhone到Mac
# 在Xcode中: Window → Devices and Simulators
# 选择你的iPhone → 勾选 "Connect via network"

# 之后可拔掉数据线，运行：
npm run ios --device "你的iPhone名称"
```

---

## 备选方案2：Android模拟器

### 1. 安装Android Studio
下载: https://developer.android.com/studio

### 2. 安装SDK和模拟器
```
打开Android Studio
→ More Actions → SDK Manager
→ SDK Platforms: 勾选 Android 13.0 (Tiramisu)
→ SDK Tools: 勾选 Android SDK Build-Tools, Android Emulator
→ 点击 Apply
```

### 3. 配置环境变量
```bash
# 编辑配置文件
nano ~/.zshrc

# 添加以下内容
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin

# 保存后执行
source ~/.zshrc
```

### 4. 创建虚拟设备
```
Android Studio → More Actions → Virtual Device Manager
→ Create Device
→ 选择 Pixel 5
→ 选择 Tiramisu (API 33)
→ 点击 Download 下载系统镜像
→ Finish
→ 点击播放按钮启动模拟器
```

### 5. 运行应用
```bash
cd "/Users/maxzhou/Documents/Claude Code/BB ESword"
npm install
npm run android
```

---

## 备选方案3：使用真实Android设备

### 1. 启用开发者模式
```
在Android手机上:
设置 → 关于手机 → 连续点击"版本号"7次
返回 → 系统 → 开发者选项 → 开启USB调试
```

### 2. 连接并测试
```bash
# USB连接手机到Mac
# 手机上点击"允许USB调试"

# 验证连接
adb devices

# 运行应用
npm run android
```

---

## 快速测试（推荐新手）

如果以上都觉得复杂，可以先在Web浏览器中测试基本逻辑：

```bash
# 安装React Native Web
npm install react-native-web react-dom

# 我可以帮你创建web版本的配置
```

---

## 故障排除

### iOS问题
```bash
# 清理缓存
cd ios
pod deintegrate
pod install
cd ..
npm start -- --reset-cache
```

### Android问题
```bash
# 清理Gradle缓存
cd android
./gradlew clean
cd ..

# 重置Metro
npm start -- --reset-cache
```

### 通用问题
```bash
# 删除node_modules重新安装
rm -rf node_modules
npm install

# 清理watchman
watchman watch-del-all
```

---

## 我推荐你：

**最简单**: iOS模拟器（只需3个命令）
```bash
npm install
cd ios && pod install && cd ..
npm run ios
```

**如果有iPhone**: 用数据线连接后直接运行
```bash
npm run ios --device
```

需要我帮你执行哪个方案？
