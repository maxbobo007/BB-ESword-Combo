import React, { ReactNode, Children, Fragment } from 'react';
import { View, Text, StyleSheet, TouchableHighlight } from 'react-native';
import { useCupertino } from '@/theme/ThemeProvider';
import { type } from '@/theme/cupertino';
import { Icon } from './Icon';

// iOS 分组圆角列表（Settings 同款）
interface GroupProps {
  header?: string;
  footer?: string;
  children: ReactNode;
}

export const Group: React.FC<GroupProps> = ({ header, footer, children }) => {
  const { colors } = useCupertino();
  const items = Children.toArray(children).filter(Boolean);
  return (
    <View style={styles.group}>
      {header ? (
        <Text style={[type.footnote, styles.header, { color: colors.secondaryLabel }]}>
          {header.toUpperCase()}
        </Text>
      ) : null}
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        {items.map((child, i) => (
          <Fragment key={i}>
            {child}
            {i < items.length - 1 && (
              <View style={[styles.separator, { backgroundColor: colors.separator }]} />
            )}
          </Fragment>
        ))}
      </View>
      {footer ? (
        <Text style={[type.footnote, styles.footer, { color: colors.secondaryLabel }]}>
          {footer}
        </Text>
      ) : null}
    </View>
  );
};

interface RowProps {
  title: string;
  subtitle?: string;
  icon?: string;
  iconColor?: string;
  value?: string; // 右侧灰色文字
  chevron?: boolean;
  destructive?: boolean;
  right?: ReactNode; // 右侧自定义（开关等）
  onPress?: () => void;
}

export const Row: React.FC<RowProps> = ({
  title,
  subtitle,
  icon,
  iconColor,
  value,
  chevron = false,
  destructive = false,
  right,
  onPress,
}) => {
  const { colors } = useCupertino();
  const inner = (
    <View style={styles.row}>
      {icon && (
        <View style={[styles.iconBadge, { backgroundColor: iconColor ?? colors.tint }]}>
          <Icon name={icon} size={17} color="#fff" />
        </View>
      )}
      <View style={styles.rowBody}>
        <Text
          style={[type.body, { color: destructive ? colors.red : colors.label }]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text style={[type.footnote, { color: colors.secondaryLabel }]} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {value ? (
        <Text style={[type.body, styles.value, { color: colors.secondaryLabel }]}>{value}</Text>
      ) : null}
      {right}
      {chevron && <Icon name="chevron-forward" size={18} color={colors.chevron} style={styles.chevron} />}
    </View>
  );
  if (!onPress) {
    return inner;
  }
  return (
    <TouchableHighlight underlayColor={colors.fill} onPress={onPress}>
      {inner}
    </TouchableHighlight>
  );
};

const styles = StyleSheet.create({
  group: {
    marginHorizontal: 16,
    marginBottom: 22,
  },
  header: {
    marginLeft: 16,
    marginBottom: 6,
  },
  footer: {
    marginLeft: 16,
    marginTop: 6,
  },
  card: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  iconBadge: {
    width: 29,
    height: 29,
    borderRadius: 6.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowBody: {
    flex: 1,
    gap: 1,
  },
  value: {
    marginRight: -4,
  },
  chevron: {
    marginRight: -6,
  },
});
