import AsyncStorage from '@react-native-async-storage/async-storage';

// 平台存储接缝：AsyncStorage 在 iOS/Android/Web(react-native-web) 同 API 可用。
// 未来数据同步 = 换一个实现或在此加同步中间层，业务层不感知。
export interface KeyValueStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export const storage: KeyValueStorage = AsyncStorage;
