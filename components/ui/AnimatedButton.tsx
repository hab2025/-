import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface AnimatedButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  hapticFeedback?: boolean;
  animationType?: 'scale' | 'bounce' | 'pulse' | 'slide';
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  hapticFeedback = true,
  animationType = 'scale',
}) => {
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    if (disabled || loading) return;

    switch (animationType) {
      case 'scale':
        Animated.spring(scaleAnim, {
          toValue: 0.95,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        }).start();
        break;
      case 'bounce':
        Animated.sequence([
          Animated.spring(scaleAnim, {
            toValue: 0.9,
            useNativeDriver: true,
            tension: 400,
            friction: 3,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1.05,
            useNativeDriver: true,
            tension: 400,
            friction: 3,
          }),
        ]).start();
        break;
      case 'pulse':
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 0.7,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();
        break;
      case 'slide':
        Animated.timing(slideAnim, {
          toValue: 5,
          duration: 150,
          useNativeDriver: true,
        }).start();
        break;
    }
  };

  const handlePressOut = () => {
    if (disabled || loading) return;

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: theme.borderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: iconPosition === 'left' ? 'row' : 'row-reverse',
    };

    const sizeStyles = {
      small: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        minHeight: 36,
      },
      medium: {
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        minHeight: 44,
      },
      large: {
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.lg,
        minHeight: 52,
      },
    };

    const variantStyles = {
      primary: {
        backgroundColor: disabled ? theme.colors.disabled : theme.colors.primary,
        shadowColor: theme.colors.shadowMedium,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
      secondary: {
        backgroundColor: disabled ? theme.colors.disabled : theme.colors.secondary,
        shadowColor: theme.colors.shadowMedium,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: disabled ? theme.colors.disabled : theme.colors.primary,
      },
      ghost: {
        backgroundColor: 'transparent',
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  const getTextStyle = (): TextStyle => {
    const sizeStyles = {
      small: {
        fontSize: theme.typography.fontSize.sm,
      },
      medium: {
        fontSize: theme.typography.fontSize.base,
      },
      large: {
        fontSize: theme.typography.fontSize.lg,
      },
    };

    const variantStyles = {
      primary: {
        color: disabled ? theme.colors.textTertiary : theme.colors.textInverse,
        fontWeight: '600' as const,
      },
      secondary: {
        color: disabled ? theme.colors.textTertiary : theme.colors.textInverse,
        fontWeight: '600' as const,
      },
      outline: {
        color: disabled ? theme.colors.disabled : theme.colors.primary,
        fontWeight: '600' as const,
      },
      ghost: {
        color: disabled ? theme.colors.disabled : theme.colors.primary,
        fontWeight: '500' as const,
      },
    };

    return {
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  const animatedStyle = {
    transform: [
      { scale: scaleAnim },
      { translateX: slideAnim },
    ],
    opacity: opacityAnim,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[styles.container, style]}
    >
      <Animated.View style={[getButtonStyle(), animatedStyle]}>
        {icon && iconPosition === 'left' && (
          <Animated.View style={[styles.icon, { marginRight: theme.spacing.sm }]}>
            {icon}
          </Animated.View>
        )}
        
        <Text style={[getTextStyle(), textStyle]}>
          {loading ? 'جاري التحميل...' : title}
        </Text>
        
        {icon && iconPosition === 'right' && (
          <Animated.View style={[styles.icon, { marginLeft: theme.spacing.sm }]}>
            {icon}
          </Animated.View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AnimatedButton;

