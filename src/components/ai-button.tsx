import { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BRAND_GRADIENT, BRAND_GRADIENT_LOCATIONS } from '@/constants/gradient';

type AiButtonProps = {
  onPress: () => void;
  size?: number;
};

/**
 * Modern AI assistant button: blended cyan → blue → violet → purple
 * gradient, sparkle icon, soft animated glow. The pulse uses the native driver
 * on iOS/Android and falls back to JS animation on web.
 */
export function AiButton({ onPress, size = 64 }: AiButtonProps) {
  const pulse = useRef(new Animated.Value(0)).current;
  const radius = size / 2;

  useEffect(() => {
    const useNative = Platform.OS !== 'web';
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: useNative,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: useNative,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  const glowScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.18] });
  const glowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] });
  const overlayOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.95] });

  return (
    <View style={[styles.wrapper, { width: size + 28, height: size + 28 }]}>
      <Animated.View
        style={[
          styles.glow,
          {
            width: size,
            height: size,
            borderRadius: radius,
            opacity: glowOpacity,
            transform: [{ scale: glowScale }],
            pointerEvents: 'none',
          },
        ]}
      />
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Open the WattWise AI assistant"
        style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.94 : 1 }] }]}
      >
        <LinearGradient
          colors={BRAND_GRADIENT}
          locations={BRAND_GRADIENT_LOCATIONS}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.circle, { width: size, height: size, borderRadius: radius }]}
        >
          <Animated.View
            style={[styles.absoluteFill, { borderRadius: radius, opacity: overlayOpacity, pointerEvents: 'none' }]}
          >
            <LinearGradient
              colors={['rgba(0,197,232,0.95)', 'rgba(57,135,255,0.1)', 'rgba(118,87,245,0.9)']}
              start={{ x: 1, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={[styles.absoluteFill, { borderRadius: radius }]}
            />
          </Animated.View>
          <View style={[styles.ring, { borderRadius: radius }]} pointerEvents="none" />
          <Ionicons name="sparkles" size={size * 0.42} color="#FFFFFF" />
          <View style={styles.miniSparkle} pointerEvents="none">
            <Ionicons name="sparkles" size={Math.max(9, size * 0.16)} color="rgba(255,255,255,0.92)" />
          </View>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  absoluteFill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  wrapper: { alignItems: 'center', justifyContent: 'center' },
  glow: {
    position: 'absolute',
    backgroundColor: '#7C3AED',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.75,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 14,
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    shadowColor: '#7C3AED',
    shadowOpacity: 0.55,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
  ring: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  miniSparkle: { position: 'absolute', top: '24%', right: '24%' },
});
