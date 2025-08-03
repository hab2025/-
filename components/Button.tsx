import React, { useMemo } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import colors from '@/constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
  testID?: string;
  style?: any;
  textStyle?: any;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  isLoading = false,
  variant = 'primary',
  size = 'default',
  disabled = false,
  testID,
  style,
  textStyle,
}) => {
  const buttonStyles = useMemo(() => {
    const baseStyles = [
      styles.button,
      styles[`button_${variant}`],
      styles[`button_${size}`],
      disabled || isLoading ? styles.button_disabled : null,
      style,
    ];

    const textBaseStyles = [
      styles.buttonText,
      styles[`buttonText_${variant}`],
      styles[`buttonText_${size}`],
      textStyle,
    ];

    return { baseStyles, textBaseStyles };
  }, [variant, size, disabled, isLoading, style, textStyle]);

  return (
    <TouchableOpacity
      style={buttonStyles.baseStyles}
      onPress={onPress}
      disabled={disabled || isLoading}
      testID={testID}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.lightText : colors.primary}
          size="small"
        />
      ) : (
        <Text style={buttonStyles.textBaseStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  // Variants
  button_primary: {
    backgroundColor: colors.primary,
  },
  button_secondary: {
    backgroundColor: colors.secondary,
  },
  button_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  button_ghost: {
    backgroundColor: 'transparent',
  },
  button_destructive: {
    backgroundColor: colors.error,
  },
  button_disabled: {
    opacity: 0.6,
  },
  // Sizes
  button_default: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  button_sm: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  button_lg: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  button_icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  buttonText: {
    fontWeight: '600',
  },
  // Text Variants
  buttonText_primary: {
    color: colors.lightText,
  },
  buttonText_secondary: {
    color: colors.lightText,
  },
  buttonText_outline: {
    color: colors.primary,
  },
  buttonText_ghost: {
    color: colors.text,
  },
  buttonText_destructive: {
    color: colors.lightText,
  },
  // Text Sizes
  buttonText_default: {
    fontSize: 16,
  },
  buttonText_sm: {
    fontSize: 14,
  },
  buttonText_lg: {
    fontSize: 18,
  },
  buttonText_icon: {
    fontSize: 16,
  },
});

export default Button;

