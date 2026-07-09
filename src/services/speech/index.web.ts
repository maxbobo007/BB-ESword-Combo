/// <reference lib="dom" />
import { SpeechService } from './types';

// Web 端发音：浏览器 Web Speech API
class WebSpeechService implements SpeechService {
  private ready = false;

  async init(): Promise<boolean> {
    this.ready = typeof window !== 'undefined' && 'speechSynthesis' in window;
    return this.ready;
  }

  speak(text: string): void {
    if (!this.ready) {
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }

  stop(): void {
    if (this.ready) {
      window.speechSynthesis.cancel();
    }
  }
}

export const speech: SpeechService = new WebSpeechService();
