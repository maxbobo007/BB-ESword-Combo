import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export interface DialogAction {
  label: string;
  onPress: () => void;
  primary?: boolean;
}

interface DialogProps {
  visible: boolean;
  title: string;
  message?: string;
  actions: DialogAction[];
  onRequestClose?: () => void;
}

// 跨平台弹窗：react-native-web 不支持带按钮的 Alert.alert
// Cross-platform dialog: Alert.alert with buttons is a no-op on react-native-web.
export const Dialog: React.FC<DialogProps> = ({
  visible,
  title,
  message,
  actions,
  onRequestClose,
}) => (
  <Modal transparent visible={visible} animationType="fade" onRequestClose={onRequestClose}>
    <View style={styles.backdrop}>
      <View style={styles.box} accessibilityRole="alert">
        <Text style={styles.title}>{title}</Text>
        {message ? <Text style={styles.message}>{message}</Text> : null}
        <View style={styles.actions}>
          {actions.map(action => (
            <TouchableOpacity
              key={action.label}
              style={[styles.button, action.primary && styles.primaryButton]}
              onPress={action.onPress}
              accessibilityRole="button"
            >
              <Text style={[styles.buttonText, action.primary && styles.primaryText]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  box: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  message: { fontSize: 15, color: '#555', lineHeight: 22, marginBottom: 8 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 12 },
  button: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 6 },
  primaryButton: { backgroundColor: '#1976D2' },
  buttonText: { fontSize: 15, fontWeight: '600', color: '#1976D2' },
  primaryText: { color: '#fff' },
});
