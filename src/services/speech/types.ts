// 平台发音接缝：native 用 react-native-tts，web 端未来用 Web Speech API
// （index.web.ts，Metro/RNW 按扩展名解析，调用方只 import '@/services/speech'）。
export interface SpeechService {
  /** 初始化；无 TTS 引擎或无西语音色时返回 false，UI 应隐藏发音入口 */
  init(): Promise<boolean>;
  /** 用西语朗读文本（es-ES） */
  speak(text: string): void;
  stop(): void;
}
