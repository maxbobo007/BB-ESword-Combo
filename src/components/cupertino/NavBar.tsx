import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useCupertino } from '@/theme/ThemeProvider';
import { type } from '@/theme/cupertino';
import { Icon } from './Icon';

interface NavBarProps {
  title: string;
  large?: boolean; // 大标题样式（一级页面）
  onBack?: () => void;
  right?: ReactNode;
}

export const NavBar: React.FC<NavBarProps> = ({ title, large = false, onBack, right }) => {
  const { colors } = useCupertino();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.bar}>
        <View style={styles.side}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.back} hitSlop={styles.hitSlop}>
              <Icon name="chevron-back" size={26} color={colors.tint} />
              <Text style={[type.body, { color: colors.tint }]}>返回</Text>
            </TouchableOpacity>
          )}
        </View>
        {!large && (
          <Text style={[type.headline, styles.smallTitle, { color: colors.label }]} numberOfLines={1}>
            {title}
          </Text>
        )}
        <View style={[styles.side, styles.rightSide]}>{right}</View>
      </View>
      {large && (
        <Text style={[type.largeTitle, styles.largeTitle, { color: colors.label }]}>{title}</Text>
      )}
    </View>
  );
};

interface NavActionProps {
  icon: string;
  onPress: () => void;
  accessibilityLabel?: string;
}

export const NavAction: React.FC<NavActionProps> = ({ icon, onPress, accessibilityLabel }) => {
  const { colors } = useCupertino();
  return (
    <TouchableOpacity
      onPress={onPress}
      hitSlop={styles.hitSlop}
      style={styles.action}
      accessibilityLabel={accessibilityLabel}
    >
      <Icon name={icon} size={24} color={colors.tint} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  bar: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
  },
  side: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightSide: {
    justifyContent: 'flex-end',
    gap: 18,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: -8,
  },
  smallTitle: {
    flex: 2,
    textAlign: 'center',
  },
  largeTitle: {
    paddingBottom: 10,
  },
  action: {
    padding: 2,
  },
  hitSlop: { top: 10, bottom: 10, left: 10, right: 10 },
});
