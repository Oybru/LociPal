// IsometricDPad - Diamond-shaped D-Pad for isometric movement
import React, { useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';

interface IsometricDPadProps {
  size?: number;
  onMove: (direction: 'up' | 'down' | 'left' | 'right') => void;
  activeColor?: string;
  inactiveColor?: string;
}

export default function IsometricDPad({
  size = 120,
  onMove,
  activeColor = 'rgba(78, 205, 196, 0.8)',
  inactiveColor = 'rgba(78, 205, 196, 0.3)',
}: IsometricDPadProps) {
  const buttonSize = size * 0.38;
  const centerOffset = size / 2 - buttonSize / 2;

  // Isometric directions:
  // "Up" = move toward top of screen (iso: -X, -Y)
  // "Down" = move toward bottom of screen (iso: +X, +Y)
  // "Left" = move toward left of screen (iso: -X, +Y)
  // "Right" = move toward right of screen (iso: +X, -Y)

  const handlePress = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    onMove(direction);
  }, [onMove]);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Diamond background shape */}
      <View style={[styles.diamondBg, { width: size * 0.85, height: size * 0.85 }]}>
        <View style={styles.diamondInner} />
      </View>

      {/* Up button (top of diamond) */}
      <TouchableOpacity
        style={[
          styles.button,
          styles.buttonUp,
          {
            width: buttonSize,
            height: buttonSize,
            top: 0,
            left: centerOffset,
          },
        ]}
        onPress={() => handlePress('up')}
        activeOpacity={0.7}
      >
        <View style={[styles.arrow, styles.arrowUp]} />
      </TouchableOpacity>

      {/* Down button (bottom of diamond) */}
      <TouchableOpacity
        style={[
          styles.button,
          styles.buttonDown,
          {
            width: buttonSize,
            height: buttonSize,
            bottom: 0,
            left: centerOffset,
          },
        ]}
        onPress={() => handlePress('down')}
        activeOpacity={0.7}
      >
        <View style={[styles.arrow, styles.arrowDown]} />
      </TouchableOpacity>

      {/* Left button (left of diamond) */}
      <TouchableOpacity
        style={[
          styles.button,
          styles.buttonLeft,
          {
            width: buttonSize,
            height: buttonSize,
            left: 0,
            top: centerOffset,
          },
        ]}
        onPress={() => handlePress('left')}
        activeOpacity={0.7}
      >
        <View style={[styles.arrow, styles.arrowLeft]} />
      </TouchableOpacity>

      {/* Right button (right of diamond) */}
      <TouchableOpacity
        style={[
          styles.button,
          styles.buttonRight,
          {
            width: buttonSize,
            height: buttonSize,
            right: 0,
            top: centerOffset,
          },
        ]}
        onPress={() => handlePress('right')}
        activeOpacity={0.7}
      >
        <View style={[styles.arrow, styles.arrowRight]} />
      </TouchableOpacity>

      {/* Center indicator */}
      <View style={styles.centerDot} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  diamondBg: {
    position: 'absolute',
    transform: [{ rotate: '45deg' }],
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(78, 205, 196, 0.5)',
  },
  diamondInner: {
    flex: 1,
    margin: 2,
    backgroundColor: 'rgba(26, 58, 74, 0.6)',
    borderRadius: 6,
  },
  button: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(78, 205, 196, 0.4)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(78, 205, 196, 0.7)',
  },
  buttonUp: {},
  buttonDown: {},
  buttonLeft: {},
  buttonRight: {},
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#fff',
  },
  arrowUp: {
    transform: [{ rotate: '0deg' }],
  },
  arrowDown: {
    transform: [{ rotate: '180deg' }],
  },
  arrowLeft: {
    transform: [{ rotate: '-90deg' }],
  },
  arrowRight: {
    transform: [{ rotate: '90deg' }],
  },
  centerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(78, 205, 196, 0.6)',
    borderWidth: 1,
    borderColor: '#fff',
  },
});
