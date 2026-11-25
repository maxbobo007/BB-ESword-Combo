import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Animated,
  ViewStyle,
} from 'react-native';
import { useCupertino } from '@/theme/ThemeProvider';
import { type } from '@/theme/cupertino';
import { Icon } from './Icon';

// —— iOS 风格按钮：filled（蓝底胶囊）/ tinted（淡蓝底）/ plain（纯文字） ——
interface CButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'filled' | 'tinted' | 'plain';
  icon?: string;
  disabled?: boolean;
  destructive?: boolean;
  style?: ViewStyle;
}

export const CButton: React.FC<CButtonProps> = ({
  title,
  onPress,
  variant = 'filled',
  icon,
  disabled = false,
  destructive = false,
  style,
}) => {
  const { colors } = useCupertino();
  const tint = destructive ? colors.red : colors.tint;
  const bg =
    variant === 'filled' ? tint : variant === 'tinted' ? colors.tintSoft : 'transparent';
  const fg = variant === 'filled' ? colors.onTint : tint;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.6}
      style={[
        styles.button,
        variant === 'plain' && styles.plainButton,
        { backgroundColor: bg, opacity: disabled ? 0.4 : 1 },
        style,
      ]}
    >
      {icon && <Icon name={icon} size={18} color={fg} />}
      <Text style={[type.headline, { color: fg }]}>{title}</Text>
    </TouchableOpacity>
  );
};

// —— iOS 开关（51×31 胶囊 + 白色滑块） ——
interface CSwitchProps {
  value: boolean;
  onValueChange: (v: boolean) => void;
}

export const CSwitch: React.FC<CSwitchProps> = ({ value, onValueChange }) => {
  const { colors } = useCupertino();
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: value ? 1 : 0, duration: 180, useNativeDriver: false }).start();
  }, [value, anim]);
  return (
    <Pressable onPress={() => onValueChange(!value)} accessibilityRole="switch">
      <Animated.View
        style={[
          styles.switchTrack,
          {
            backgroundColor: anim.interpolate({
              inputRange: [0, 1],
              outputRange: [colors.fill, colors.green],
            }),
          },
        ]}
      >
        <Animated.View
          style={[
            styles.switchThumb,
            { transform: [{ translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [2, 22] }) }] },
          ]}
        />
      </Animated.View>
    </Pressable>
  );
};

// —— iOS 13 风格分段控件（灰轨道 + 白色浮动段） ——
interface SegmentedProps<T extends string> {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}

export function Segmented<T extends string>({ value, options, onChange }: SegmentedProps<T>) {
  const { colors } = useCupertino();
  return (
    <View style={[styles.segTrack, { backgroundColor: colors.fill }]}>
      {options.map(opt => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            style={[
              styles.segItem,
              active && [styles.segActive, { backgroundColor: colors.elevated }],
            ]}
            onPress={() => onChange(opt.value)}
          >
            <Text
              style={[
                type.subhead,
                { color: colors.label, fontWeight: active ? '600' : '400' },
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 20,
  },
  plainButton: {
    height: 44,
    paddingHorizontal: 8,
  },
  switchTrack: {
    width: 51,
    height: 31,
    borderRadius: 15.5,
    justifyContent: 'center',
  },
  switchThumb: {
    width: 27,
    height: 27,
    borderRadius: 13.5,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  segTrack: {
    flexDirection: 'row',
    borderRadius: 9,
    padding: 2,
    height: 36,
  },
  segItem: {
    flex: 1,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  segActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
});
