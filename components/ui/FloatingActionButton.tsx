import React, { useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  Animated,
  StyleSheet,
  ViewStyle,
  GestureResponderEvent,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface FloatingActionButtonProps {
  onPress: (event: GestureResponderEvent) => void;
  icon: React.ReactNode;
  size?: number;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  style?: ViewStyle;
  animated?: boolean;
  pulseAnimation?: boolean;
  shadowIntensity?: 'light' | 'medium' | 'heavy';
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  icon,
  size = 56,
  position = 'bottom-right',
  style,
  animated = true,
  pulseAnimation = false,
  shadowIntensity = 'medium',
}) => {
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      // Entry animation
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 3,
        useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(1);
    }
  }, [animated, scaleAnim]);

  useEffect(() => {
    if (pulseAnimation) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();

      return () => pulse.stop();
    }
  }, [pulseAnimation, pulseAnim]);

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.9,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getPositionStyle = (): ViewStyle => {
    const offset = theme.spacing.lg;
    
    switch (position) {
      case 'bottom-right':
        return { bottom: offset, right: offset };
      case 'bottom-left':
        return { bottom: offset, left: offset };
      case 'top-right':
        return { top: offset, right: offset };
      case 'top-left':
        return { top: offset, left: offset };
      default:
        return { bottom: offset, right: offset };
    }
  };

  const getShadowStyle = (): ViewStyle => {
    const shadows = {
      light: {
        shadowColor: theme.colors.shadowLight,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
      medium: {
        shadowColor: theme.colors.shadowMedium,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
      },
      heavy: {
        shadowColor: theme.colors.shadowHeavy,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 12,
      },
    };

    return shadows[shadowIntensity];
  };

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const animatedStyle = {
    transform: [
      { scale: Animated.multiply(scaleAnim, pulseAnim) },
      { rotate: rotation },
    ],
  };

  return (
    <Animated.View
      style={[
        styles.container,
        getPositionStyle(),
        getShadowStyle(),
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        animatedStyle,
        style,
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.button,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: theme.colors.primary,
          },
        ]}
        activeOpacity={0.8}
      >
        {icon}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 1000,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FloatingActionButton;

