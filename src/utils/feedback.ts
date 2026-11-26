import { Platform, Share } from 'react-native';
import Constants from 'expo-constants';
import { Word } from '@/types/game';

// 内测阶段没有后端：把反馈整理成一段文字，交给系统分享面板（微信、邮件、短信都可以）
export const appVersion = () => Constants.expoConfig?.version ?? 'unknown';

const deviceLine = () => `版本 ${appVersion()} · ${Platform.OS} ${String(Platform.Version ?? '')}`.trim();

const share = async (message: string) => {
  try {
    await Share.share({ message });
    return true;
  } catch (e) {
    console.warn('Share failed:', e);
    return false;
  }
};

// 某个词的释义、提示或例句不对
export const reportWord = (word: Word, where: string) =>
  share(
    [
      '【BB ESword 报错】',
      `词：${word.spanish}`,
      `提示：${word.chinese}${word.english ? ` · ${word.english}` : ''}`,
      word.exampleSentence ? `例句：${word.exampleSentence}` : null,
      word.exampleTranslation ? `翻译：${word.exampleTranslation}` : null,
      `位置：${where}`,
      `编号：${word.id}`,
      deviceLine(),
      '',
      '哪里不对（请写在下面）：',
    ]
      .filter(line => line !== null)
      .join('\n')
  );

// 一般反馈：卡住、闪退、建议
export const sendFeedback = (where: string) =>
  share(['【BB ESword 反馈】', `位置：${where}`, deviceLine(), '', '想说的（请写在下面）：'].join('\n'));
