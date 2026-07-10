import Tts from 'react-native-tts';
import { SpeechService } from './types';

class NativeSpeechService implements SpeechService {
  private ready = false;
  private initPromise: Promise<boolean> | null = null;

  init(): Promise<boolean> {
    if (!this.initPromise) {
      this.initPromise = (async () => {
        try {
          await Tts.getInitStatus();
          await Tts.setDefaultLanguage('es-ES'); // 缺少西语音色数据时会抛错
          Tts.setDefaultRate(0.45);
          this.ready = true;
        } catch {
          this.ready = false; // 无引擎/无音色 → 静默降级
        }
        return this.ready;
      })();
    }
    return this.initPromise;
  }

  speak(text: string): void {
    if (!this.ready) {
      return;
    }
    Tts.stop();
    Tts.speak(text);
  }

  stop(): void {
    if (this.ready) {
      Tts.stop();
    }
  }
}

export const speech: SpeechService = new NativeSpeechService();
