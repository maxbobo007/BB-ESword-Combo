import React, { ReactNode, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Animated } from 'react-native';
import { useCupertino } from '@/theme/ThemeProvider';
import { type } from '@/theme/cupertino';

// —— iOS 风格居中弹窗（270pt 宽、按钮细线分隔） ——
export interface AlertAction {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

interface CAlertProps {
  visible: boolean;
  title: string;
  message?: string;
  children?: ReactNode; // 自定义内容（输入框等）
  actions: AlertAction[];
  onDismiss?: () => void;
  wide?: boolean; // 含表单时用更宽的面板
}

export const CAlert: React.FC<CAlertProps> = ({
  visible,
  title,
  message,
  children,
  actions,
  onDismiss,
  wide = false,
}) => {
  const { colors } = useCupertino();
  const stacked = actions.length > 2 || wide;
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onDismiss}>
      <Pressable style={styles.backdrop} onPress={onDismiss}>
        <Pressable
          style={[styles.panel, wide && styles.panelWide, { backgroundColor: colors.elevated }]}
        >
          <View style={styles.alertBody}>
            <Text style={[type.headline, styles.center, { color: colors.label }]}>{title}</Text>
            {message ? (
              <Text style={[type.footnote, styles.center, styles.message, { color: colors.label }]}>
                {message}
              </Text>
            ) : null}
            {children}
          </View>
          {!stacked && <View style={[styles.hairlineH, { backgroundColor: colors.separator }]} />}
          <View style={[stacked ? styles.actionsCol : styles.actionsRow]}>
            {actions.map((action, i) => (
              <React.Fragment key={action.text}>
                {(stacked || i > 0) && (
                  <View
                    style={
                      stacked
                        ? [styles.hairlineH, { backgroundColor: colors.separator }]
                        : [styles.hairlineV, { backgroundColor: colors.separator }]
                    }
                  />
                )}
                <Pressable
                  style={[styles.actionButton, !stacked && styles.actionFlex]}
                  onPress={() => {
                    action.onPress?.();
                  }}
                  android_ripple={{ color: colors.fill }}
                >
                  <Text
                    style={[
                      type.body,
                      action.style === 'cancel' && { fontWeight: '600' },
                      {
                        color: action.style === 'destructive' ? colors.red : colors.tint,
                      },
                    ]}
                  >
                    {action.text}
                  </Text>
                </Pressable>
              </React.Fragment>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

// —— iOS 风格底部胶囊 Toast ——
interface CToastProps {
  message: string;
  onHide: () => void;
  duration?: number;
}

export const CToast: React.FC<CToastProps> = ({ message, onHide, duration = 1800 }) => {
  const { colors } = useCupertino();
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!message) {
      return;
    }
    Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }).start();
    const timer = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start(() =>
        onHide(),
      );
    }, duration);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);
  if (!message) {
    return null;
  }
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.toast, { backgroundColor: colors.elevated, opacity }]}
    >
      <Text style={[type.subhead, { color: colors.label }]}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  panel: {
    width: 280,
    borderRadius: 14,
    overflow: 'hidden',
  },
  panelWide: {
    width: 330,
  },
  alertBody: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    gap: 4,
  },
  center: {
    textAlign: 'center',
  },
  message: {
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'transparent',
  },
  actionsCol: {},
  actionFlex: {
    flex: 1,
  },
  actionButton: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hairlineH: {
    height: StyleSheet.hairlineWidth,
  },
  hairlineV: {
    width: StyleSheet.hairlineWidth,
  },
  toast: {
    position: 'absolute',
    bottom: 90,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
});
