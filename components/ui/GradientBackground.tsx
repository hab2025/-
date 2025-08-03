import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';

interface GradientBackgroundProps {
  children?: React.ReactNode;
  animated?: boolean;
  variant?: 'primary' | 'secondary' | 'background';
  style?: any;
}

const { width, height } = Dimensions.get('window');

const GradientBackground: React.FC<GradientBackgroundProps> = ({
  children,
  animated = false,
  variant = 'background',
  style,
}) => {
  const { theme } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: false,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: false,
          }),
        ])
      );

      const rotateAnimation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 20000,
          useNativeDriver: true,
        })
      );

      animation.start();
      rotateAnimation.start();

      return () => {
        animation.stop();
        rotateAnimation.stop();
      };
    }
  }, [animated, animatedValue, rotateAnim]);

  const getGradientColors = () => {
    switch (variant) {
      case 'primary':
        return theme.colors.gradientPrimary;
      case 'secondary':
        return theme.colors.gradientSecondary;
      case 'background':
      default:
        return theme.colors.gradientBackground;
    }
  };

  const interpolatedColors = animated
    ? animatedValue.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [
          getGradientColors()[0],
          getGradientColors()[1],
          getGradientColors()[0],
        ],
      })
    : getGradientColors()[0];

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (animated) {
    return (
      <View style={[styles.container, style]}>
        <Animated.View
          style={[
            styles.animatedBackground,
            {
              transform: [{ rotate: rotation }],
            },
          ]}
        >
          <LinearGradient
            colors={getGradientColors()}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          />
        </Animated.View>
        
        {/* Overlay for better content readability */}
        <View style={styles.overlay} />
        
        {/* Content */}
        <View style={styles.content}>
          {children}
        </View>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={getGradientColors()}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, style]}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  animatedBackground: {
    position: 'absolute',
    top: -height * 0.5,
    left: -width * 0.5,
    width: width * 2,
    height: height * 2,
  },
  gradient: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
});

export default GradientBackground;

