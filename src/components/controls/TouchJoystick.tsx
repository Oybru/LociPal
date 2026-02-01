// TouchJoystick - Virtual joystick for character movement
import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  Animated,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';

interface TouchJoystickProps {
  size?: number;
  onMove: (direction: { x: number; y: number }) => void;
  onRelease?: () => void;
  baseColor?: string;
  knobColor?: string;
}

export default function TouchJoystick({
  size = 120,
  onMove,
  onRelease,
  baseColor = 'rgba(78, 205, 196, 0.3)',
  knobColor = 'rgba(78, 205, 196, 0.8)',
}: TouchJoystickProps) {
  const knobSize = size * 0.4;
  const maxDistance = (size - knobSize) / 2;

  const knobPosition = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const [isActive, setIsActive] = useState(false);

  const clampPosition = useCallback((x: number, y: number) => {
    const distance = Math.sqrt(x * x + y * y);
    if (distance > maxDistance) {
      const angle = Math.atan2(y, x);
      return {
        x: Math.cos(angle) * maxDistance,
        y: Math.sin(angle) * maxDistance,
      };
    }
    return { x, y };
  }, [maxDistance]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: () => {
        setIsActive(true);
      },

      onPanResponderMove: (
        _event: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        const { dx, dy } = gestureState;
        const clamped = clampPosition(dx, dy);

        knobPosition.setValue(clamped);

        // Normalize to -1 to 1 range
        const normalizedX = clamped.x / maxDistance;
        const normalizedY = clamped.y / maxDistance;

        // Convert screen direction to isometric direction
        // Screen right+down = iso X+, Screen left+down = iso Y+
        const isoX = (normalizedX + normalizedY) / Math.SQRT2;
        const isoY = (normalizedY - normalizedX) / Math.SQRT2;

        onMove({ x: isoX, y: isoY });
      },

      onPanResponderRelease: () => {
        setIsActive(false);
        Animated.spring(knobPosition, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
          friction: 5,
        }).start();
        onRelease?.();
      },

      onPanResponderTerminate: () => {
        setIsActive(false);
        knobPosition.setValue({ x: 0, y: 0 });
        onRelease?.();
      },
    })
  ).current;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Base circle */}
      <View
        style={[
          styles.base,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: baseColor,
            borderColor: isActive ? knobColor : 'rgba(255, 255, 255, 0.3)',
          },
        ]}
      >
        {/* Direction indicators */}
        <View style={[styles.directionIndicator, styles.indicatorUp]} />
        <View style={[styles.directionIndicator, styles.indicatorDown]} />
        <View style={[styles.directionIndicator, styles.indicatorLeft]} />
        <View style={[styles.directionIndicator, styles.indicatorRight]} />
      </View>

      {/* Draggable knob */}
      <Animated.View
        style={[
          styles.knob,
          {
            width: knobSize,
            height: knobSize,
            borderRadius: knobSize / 2,
            backgroundColor: knobColor,
            transform: [
              { translateX: knobPosition.x },
              { translateY: knobPosition.y },
            ],
            opacity: isActive ? 1 : 0.7,
          },
        ]}
        {...panResponder.panHandlers}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  base: {
    position: 'absolute',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  knob: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  directionIndicator: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
  },
  indicatorUp: {
    top: 8,
    transform: [{ rotate: '0deg' }],
  },
  indicatorDown: {
    bottom: 8,
    transform: [{ rotate: '180deg' }],
  },
  indicatorLeft: {
    left: 8,
    transform: [{ rotate: '-90deg' }],
  },
  indicatorRight: {
    right: 8,
    transform: [{ rotate: '90deg' }],
  },
});
