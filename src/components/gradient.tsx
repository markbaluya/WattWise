import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  BRAND_GRADIENT,
  BRAND_GRADIENT_END,
  BRAND_GRADIENT_LOCATIONS,
  BRAND_GRADIENT_START,
} from '@/constants/gradient';

type GradientViewProps = {
  colors?: readonly string[];
  locations?: readonly number[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  style?: ViewStyle | ViewStyle[];
  children?: React.ReactNode;
};

/** Thin wrapper so every screen uses the same gradient defaults. */
export function GradientView({
  colors = BRAND_GRADIENT,
  locations = BRAND_GRADIENT_LOCATIONS,
  start = BRAND_GRADIENT_START,
  end = BRAND_GRADIENT_END,
  style,
  children,
}: GradientViewProps) {
  return (
    <LinearGradient colors={colors as any} locations={locations as any} start={start} end={end} style={style}>
      {children}
    </LinearGradient>
  );
}

type GradientBorderProps = {
  colors?: readonly string[];
  radius?: number;
  borderWidth?: number;
  innerColor: string;
  style?: ViewStyle;
  children?: React.ReactNode;
};

/**
 * A rounded container with a gradient border/glow and a solid inner fill.
 * Used for the chat input field.
 */
export function GradientBorder({
  colors = BRAND_GRADIENT,
  radius = 24,
  borderWidth = 1.5,
  innerColor,
  style,
  children,
}: GradientBorderProps) {
  return (
    <LinearGradient
      colors={colors as any}
      start={BRAND_GRADIENT_START}
      end={BRAND_GRADIENT_END}
      style={[
        styles.borderWrap,
        {
          borderRadius: radius,
          padding: borderWidth,
          shadowColor: '#3987FF',
          shadowOpacity: 0.35,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 0 },
          elevation: 6,
        },
        style,
      ]}
    >
      <View
        style={{
          flex: 1,
          borderRadius: Math.max(0, radius - borderWidth),
          backgroundColor: innerColor,
          overflow: 'hidden',
        }}
      >
        {children}
      </View>
    </LinearGradient>
  );
}

/**
 * Slow sheen that travels across the gradient bill card. Pure transform
 * animation, so it stays cheap on low-end devices and web.
 */
export function GradientShimmer({ opacity = 0.16 }: { opacity?: number }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const useNative = Platform.OS !== 'web';
    const animation = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 3000,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: useNative,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [progress]);

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-180, 560],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.shimmerWrap, { transform: [{ translateX }], opacity }]}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.85)', 'rgba(255,255,255,0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.shimmerBar}
      />
    </Animated.View>
  );
}

/** Animated cyan/blue/purple typing dots shown while the AI is responding. */
export function TypingDots({
  colors = ['#00C5E8', '#3987FF', '#9B5DE5'],
}: {
  colors?: string[];
}) {
  const first = useRef(new Animated.Value(0.35)).current;
  const second = useRef(new Animated.Value(0.35)).current;
  const third = useRef(new Animated.Value(0.35)).current;
  const values = [first, second, third];

  useEffect(() => {
    const useNative = Platform.OS !== 'web';
    const animations = values.map((value, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 160),
          Animated.timing(value, {
            toValue: 1,
            duration: 320,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: useNative,
          }),
          Animated.timing(value, {
            toValue: 0.35,
            duration: 320,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: useNative,
          }),
        ])
      )
    );
    animations.forEach((animation) => animation.start());
    return () => animations.forEach((animation) => animation.stop());
  }, [first, second, third]);

  return (
    <View style={styles.typingRow}>
      {values.map((value, index) => (
        <Animated.View
          key={index}
          style={[
            styles.typingDot,
            {
              backgroundColor: colors[index % colors.length],
              opacity: value,
              transform: [
                {
                  scale: value.interpolate({
                    inputRange: [0.35, 1],
                    outputRange: [0.8, 1.15],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  borderWrap: {},
  shimmerWrap: {
    position: 'absolute',
    top: -40,
    bottom: -40,
    left: 0,
    width: 150,
  },
  shimmerBar: {
    flex: 1,
    transform: [{ rotate: '18deg' }],
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowColor: '#3987FF',
    shadowOpacity: 0.9,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
});
