export interface Theme {
  dark: boolean;
  colors: {
    background: string;
    surface: string;
    primary: string;
    onPrimary: string;
    primaryContainer: string; // 主色浅容器（提示格、信息卡）
    textPrimary: string;
    textSecondary: string;
    border: string;
    cellBg: string;
    cellBlocked: string;
    cellSelected: string;
    cellFixedBg: string;
    cellFixedText: string;
    cellText: string;
    keyBg: string;
    keyText: string;
    success: string;
    warning: string;
    disabled: string;
    shadow: string;
  };
}

export const lightTheme: Theme = {
  dark: false,
  colors: {
    background: '#f5f5f5',
    surface: '#ffffff',
    primary: '#1976D2',
    onPrimary: '#ffffff',
    primaryContainer: '#E3F2FD',
    textPrimary: '#333333',
    textSecondary: '#666666',
    border: '#e0e0e0',
    cellBg: '#ffffff',
    cellBlocked: '#000000',
    cellSelected: '#BBDEFB',
    cellFixedBg: '#E3F2FD',
    cellFixedText: '#1976D2',
    cellText: '#333333',
    keyBg: '#e0e0e0',
    keyText: '#333333',
    success: '#4CAF50',
    warning: '#ff9800',
    disabled: '#bdbdbd',
    shadow: '#000000',
  },
};

export const darkTheme: Theme = {
  dark: true,
  colors: {
    background: '#121212',
    surface: '#1E1E1E',
    primary: '#64B5F6',
    onPrimary: '#0D2A45',
    primaryContainer: '#1A3A5C',
    textPrimary: '#E6E6E6',
    textSecondary: '#9E9E9E',
    border: '#333333',
    cellBg: '#2A2A2A',
    cellBlocked: '#000000',
    cellSelected: '#2E5A8F',
    cellFixedBg: '#1A3A5C',
    cellFixedText: '#90CAF9',
    cellText: '#E6E6E6',
    keyBg: '#3A3A3A',
    keyText: '#E6E6E6',
    success: '#81C784',
    warning: '#FFB74D',
    disabled: '#555555',
    shadow: '#000000',
  },
};
