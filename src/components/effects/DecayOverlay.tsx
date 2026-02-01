// Decay Overlay - Visual indicator for fading memories
// Rooms not visited for 72 hours accumulate mist/vines
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

interface DecayOverlayProps {
  decayLevel: number; // 0-100 (0 = fresh, 100 = fully decayed)
  theme: 'atlantis' | 'medieval' | 'gothic';
  width: number;
  height: number;
}

// Theme-specific decay visuals
const DECAY_THEMES = {
  atlantis: {
    color1: 'rgba(10, 50, 70, 0.6)',
    color2: 'rgba(0, 80, 100, 0.4)',
    particleColor: '#1a5a6a',
    name: 'Deep Sea Mist',
  },
  medieval: {
    color1: 'rgba(30, 40, 20, 0.6)',
    color2: 'rgba(50, 60, 30, 0.4)',
    particleColor: '#3a4a2a',
    name: 'Creeping Vines',
  },
  gothic: {
    color1: 'rgba(40, 30, 50, 0.6)',
    color2: 'rgba(60, 40, 70, 0.4)',
    particleColor: '#4a3a5a',
    name: 'Shadow Fog',
  },
};

export default function DecayOverlay({
  decayLevel,
  theme,
  width,
  height,
}: DecayOverlayProps) {
  const themeConfig = DECAY_THEMES[theme];
  const fogOpacity = useRef(new Animated.Value(0)).current;
  const fogWave = useRef(new Animated.Value(0)).current;

  // Animate fog based on decay level
  useEffect(() => {
    Animated.timing(fogOpacity, {
      toValue: decayLevel / 100,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [decayLevel]);

  // Undulating fog wave animation
  useEffect(() => {
    if (decayLevel > 20) {
      const waveAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(fogWave, {
            toValue: 1,
            duration: 4000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(fogWave, {
            toValue: 0,
            duration: 4000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      );
      waveAnimation.start();
      return () => waveAnimation.stop();
    }
  }, [decayLevel > 20]);

  if (decayLevel < 10) return null;

  // Calculate wave translation
  const waveTranslateY = fogWave.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 10],
  });

  return (
    <View style={[styles.container, { width, height }]} pointerEvents="none">
      {/* Base fog layer */}
      <Animated.View
        style={[
          styles.fogLayer,
          {
            backgroundColor: themeConfig.color1,
            opacity: Animated.multiply(fogOpacity, 0.6),
          },
        ]}
      />

      {/* Animated wave layer */}
      <Animated.View
        style={[
          styles.waveLayer,
          {
            backgroundColor: themeConfig.color2,
            opacity: Animated.multiply(fogOpacity, 0.8),
            transform: [{ translateY: waveTranslateY }],
          },
        ]}
      />

      {/* Particles disabled - too distracting */}

      {/* Warning text for critical decay */}
      {decayLevel > 80 && (
        <View style={styles.warningContainer}>
          <Animated.View
            style={[
              styles.warningPulse,
              { opacity: fogWave },
            ]}
          >
            <View style={styles.warningBadge}>
              <Animated.Text style={styles.warningText}>
                ⚠️ Memory Fading
              </Animated.Text>
            </View>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

// Individual decay particle
function DecayParticle({
  theme,
  x,
  y,
  color,
}: {
  theme: string;
  x: number;
  y: number;
  color: string;
}) {
  const float = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    // Float animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: 3000 + Math.random() * 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 3000 + Math.random() * 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Flicker animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const translateY = float.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  // Different particle shapes by theme
  const getParticleStyle = () => {
    switch (theme) {
      case 'atlantis':
        // Bubbles
        return {
          width: 8 + Math.random() * 8,
          height: 8 + Math.random() * 8,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: color,
          backgroundColor: 'transparent',
        };
      case 'medieval':
        // Vine tendrils
        return {
          width: 2,
          height: 20 + Math.random() * 20,
          backgroundColor: color,
          borderRadius: 1,
        };
      case 'gothic':
        // Shadow wisps
        return {
          width: 12 + Math.random() * 12,
          height: 4,
          backgroundColor: color,
          borderRadius: 2,
        };
      default:
        return {
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: color,
        };
    }
  };

  return (
    <Animated.View
      style={[
        styles.particle,
        getParticleStyle(),
        {
          left: x,
          top: y,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'hidden',
  },
  fogLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  waveLayer: {
    position: 'absolute',
    top: '60%',
    left: -20,
    right: -20,
    height: '50%',
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
  },
  particleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  particle: {
    position: 'absolute',
  },
  warningContainer: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  warningPulse: {
    padding: 4,
  },
  warningBadge: {
    backgroundColor: 'rgba(233, 69, 96, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  warningText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
