import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: object;
}

/** iOS 风格图标（Ionicons，观感接近 SF Symbols） */
export const Icon: React.FC<IconProps> = ({ name, size = 22, color, style }) => (
  <Ionicons name={name} size={size} color={color} style={style} />
);
