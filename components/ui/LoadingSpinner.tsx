import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Text } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  text?: string;
  variant?: 'spinner' | 'dots' | 'pulse' | 'wave';
  style?: any;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color,
  text,
  variant = 'spinner',
  style,
}) => {
  const { theme } = useTheme();
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  const waveValues = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  const sizes = {
    small: 20,
    medium: 40,
    large: 60,
  };

  const spinnerSize = sizes[size];
  const spinnerColor = color || theme.colors.primary;

  useEffect(() => {
    if (variant === 'spinner') {
      const spinAnimation = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      );
      spinAnimation.start();
      return () => spinAnimation.stop();
    }

    if (variant === 'pulse') {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      return () => pulseAnimation.stop();
    }

    if (variant === 'wave') {
      const waveAnimation = Animated.loop(
        Animated.stagger(
          150,
          waveValues.map((value) =>
            Animated.sequence([
              Animated.timing(value, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
              }),
              Animated.timing(value, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
              }),
            ])
          )
        )
      );
      waveAnimation.start();
      return () => waveAnimation.stop();
    }

    if (variant === 'dots') {
      const dotsAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseValue, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(pulseValue, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
      dotsAnimation.start();
      return () => dotsAnimation.stop();
    }
  }, [variant, spinValue, pulseValue, waveValues]);

  const renderSpinner = () => {
    const spin = spinValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <Animated.View
        style={[
          styles.spinner,
          {
            width: spinnerSize,
            height: spinnerSize,
            borderColor: `${spinnerColor}20`,
            borderTopColor: spinnerColor,
            borderWidth: spinnerSize / 10,
            borderRadius: spinnerSize / 2,
            transform: [{ rotate: spin }],
          },
        ]}
      />
    );
  };

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {[0, 1, 2].map((index) => (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                width: spinnerSize / 4,
                height: spinnerSize / 4,
                borderRadius: spinnerSize / 8,
                backgroundColor: spinnerColor,
                opacity: pulseValue,
                transform: [
                  {
                    scale: pulseValue.interpolate({
                      inputRange: [0.3, 1],
                      outputRange: [0.3, 1],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}
      </View>
    );
  };

  const renderPulse = () => {
    return (
      <Animated.View
        style={[
          styles.pulse,
          {
            width: spinnerSize,
            height: spinnerSize,
            borderRadius: spinnerSize / 2,
            backgroundColor: spinnerColor,
            transform: [{ scale: pulseValue }],
            opacity: pulseValue.interpolate({
              inputRange: [1, 1.2],
              outputRange: [1, 0.6],
            }),
          },
        ]}
      />
    );
  };

  const renderWave = () => {
    return (
      <View style={styles.waveContainer}>
        {waveValues.map((value, index) => (
          <Animated.View
            key={index}
            style={[
              styles.waveBar,
              {
                width: spinnerSize / 8,
                backgroundColor: spinnerColor,
                transform: [
                  {
                    scaleY: value.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.3, 1],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}
      </View>
    );
  };

  const renderVariant = () => {
    switch (variant) {
      case 'spinner':
        return renderSpinner();
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'wave':
        return renderWave();
      default:
        return renderSpinner();
    }
  };

  return (
    <View style={[styles.container, style]}>
      {renderVariant()}
      {text && (
        <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
          {text}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    // Styles applied dynamically
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 60,
  },
  dot: {
    // Styles applied dynamically
  },
  pulse: {
    // Styles applied dynamically
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
    width: 40,
  },
  waveBar: {
    height: '100%',
    borderRadius: 2,
  },
  text: {
    marginTop: 12,
    fontSize: 14,
    textAlign: 'center',
  },
});

export default LoadingSpinner;

