// Totem Sprite Component - Renders a single totem in the isometric view
import React, { useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, Image, View, Text, Animated } from 'react-native';
import { Totem } from '../../types';
import { TILE_WIDTH, TILE_HEIGHT } from '../../utils/isometric';

interface TotemSpriteProps {
  totem: Totem;
  onPress: () => void;
  isSelected: boolean;
}

// Default totem size
const TOTEM_SIZE = 48;

export default function TotemSprite({ totem, onPress, isSelected }: TotemSpriteProps) {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isSelected) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -4,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      Animated.timing(bounceAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [isSelected]);

  const animatedStyle = {
    transform: [{ translateY: bounceAnim }],
  };

  const size = TOTEM_SIZE * totem.scale;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.container,
        {
          left: totem.position.screenX - size / 2,
          top: totem.position.screenY - size,
          zIndex: totem.zIndex + 1000,
        },
      ]}
      activeOpacity={0.8}
    >
      <Animated.View style={[styles.spriteContainer, animatedStyle]}>
        {totem.imageUri ? (
          <Image
            source={{ uri: totem.imageUri }}
            style={[
              styles.sprite,
              { width: size, height: size },
              isSelected && styles.spriteSelected,
            ]}
            resizeMode="contain"
          />
        ) : (
          <View
            style={[
              styles.placeholder,
              { width: size, height: size },
              isSelected && styles.spriteSelected,
            ]}
          >
            <Text style={styles.placeholderText}>?</Text>
          </View>
        )}

        {/* Shadow */}
        <View
          style={[
            styles.shadow,
            {
              width: size * 0.8,
              height: size * 0.3,
              left: size * 0.1,
            },
          ]}
        />

        {/* Selection indicator */}
        {isSelected && (
          <View style={styles.selectionRing}>
            <View style={[styles.selectionRingInner, { width: size + 8, height: size + 8 }]} />
          </View>
        )}
      </Animated.View>

      {/* Title label on hover/selection */}
      {isSelected && totem.content.title && (
        <View style={styles.labelContainer}>
          <Text style={styles.labelText} numberOfLines={1}>
            {totem.content.title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  spriteContainer: {
    alignItems: 'center',
  },
  sprite: {
    borderRadius: 4,
  },
  spriteSelected: {
    shadowColor: '#e94560',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 10,
  },
  placeholder: {
    backgroundColor: '#16213e',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e94560',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#e94560',
    fontSize: 24,
    fontWeight: 'bold',
  },
  shadow: {
    position: 'absolute',
    bottom: -8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 100,
  },
  selectionRing: {
    position: 'absolute',
    top: -4,
    left: -4,
  },
  selectionRingInner: {
    borderWidth: 2,
    borderColor: '#e94560',
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  labelContainer: {
    position: 'absolute',
    bottom: -24,
    left: -50,
    right: -50,
    alignItems: 'center',
  },
  labelText: {
    backgroundColor: 'rgba(233, 69, 96, 0.9)',
    color: '#fff',
    fontSize: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
});
