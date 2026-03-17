import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'default',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
}) => {
  const { colors, isDark } = useTheme();

  const getContainerStyle = (): ViewStyle => {
    const base: ViewStyle = {
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    };

    const sizeStyles: Record<string, ViewStyle> = {
      sm: { paddingHorizontal: 12, paddingVertical: 6 },
      md: { paddingHorizontal: 16, paddingVertical: 10 },
      lg: { paddingHorizontal: 24, paddingVertical: 14 },
      icon: { width: 40, height: 40, padding: 0 },
    };

    const variantStyles: Record<string, ViewStyle> = {
      default: { backgroundColor: colors.primary },
      destructive: { backgroundColor: colors.destructive },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.border,
      },
      secondary: { backgroundColor: colors.secondary },
      ghost: { backgroundColor: 'transparent' },
      link: { backgroundColor: 'transparent' },
      gradient: { overflow: 'hidden' },
    };

    return {
      ...base,
      ...sizeStyles[size],
      ...variantStyles[variant],
      opacity: disabled ? 0.5 : 1,
    };
  };

  const getTextStyle = (): TextStyle => {
    const base: TextStyle = {
      fontWeight: '600',
      textAlign: 'center',
    };

    const sizeTextStyles: Record<string, TextStyle> = {
      sm: { fontSize: 13 },
      md: { fontSize: 15 },
      lg: { fontSize: 17 },
      icon: { fontSize: 15 },
    };

    const variantTextStyles: Record<string, TextStyle> = {
      default: { color: '#ffffff' },
      destructive: { color: '#ffffff' },
      outline: { color: colors.foreground },
      secondary: { color: colors.secondaryForeground },
      ghost: { color: colors.foreground },
      link: { color: colors.primary, textDecorationLine: 'underline' },
      gradient: { color: '#ffffff' },
    };

    return {
      ...base,
      ...sizeTextStyles[size],
      ...variantTextStyles[variant],
    };
  };

  const content = (
    <>
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'outline' ? colors.primary : '#fff'} />
      ) : (
        <>
          {leftIcon && <View style={{ marginRight: 6 }}>{leftIcon}</View>}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
          {rightIcon && <View style={{ marginLeft: 6 }}>{rightIcon}</View>}
        </>
      )}
    </>
  );

  if (variant === 'gradient') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[getContainerStyle(), style]}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#f59e0b', '#f97316']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[StyleSheet.absoluteFill, { borderRadius: 8 }]}
        />
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[getContainerStyle(), style]}
      activeOpacity={0.8}
    >
      {content}
    </TouchableOpacity>
  );
};
