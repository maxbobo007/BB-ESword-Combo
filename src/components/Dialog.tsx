import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

export interface DialogAction {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

interface DialogProps {
  visible: boolean;
  title: string;
  message?: string;
  actions: DialogAction[];
  onRequestClose?: () => void;
}

// React Native 的 Alert 在 Web 上不工作，用 Modal 自己做一个三端一致的对话框
export const Dialog: React.FC<DialogProps> = ({ visible, title, message, actions, onRequestClose }) => (
  <Modal transparent animationType="fade" visible={visible} onRequestClose={onRequestClose}>
    <View style={styles.backdrop}>
      <View style={styles.card} accessibilityRole="alert">
        <Text style={styles.title}>{title}</Text>
        {message ? <Text style={styles.message}>{message}</Text> : null}
        <View style={styles.actions}>
          {actions.map(action => (
            <Pressable
              key={action.label}
              accessibilityRole="button"
              onPress={action.onPress}
              style={({ pressed }) => [
                styles.button,
                action.variant === 'primary' && styles.primary,
                action.variant === 'danger' && styles.danger,
                pressed && styles.pressed,
              ]}
            >
              <Text
                style={[
                  styles.buttonText,
                  (action.variant === 'primary' || action.variant === 'danger') && styles.buttonTextLight,
                ]}
              >
                {action.label}
              </Text>
            </Pressable>
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  title: { fontSize: 18, fontWeight: '700', color: '#222', marginBottom: 8 },
  message: { fontSize: 15, color: '#555', lineHeight: 22, marginBottom: 16 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 4 },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  primary: { backgroundColor: '#1976D2' },
  danger: { backgroundColor: '#D32F2F' },
  pressed: { opacity: 0.75 },
  buttonText: { fontSize: 15, fontWeight: '600', color: '#333' },
  buttonTextLight: { color: '#fff' },
});
