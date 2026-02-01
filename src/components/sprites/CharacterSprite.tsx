// CharacterSprite - Renders a single frame from a character spritesheet
// Extracts and displays the idle pose from premade character sprite sheets

import React, { useMemo } from 'react';
import { View, Image, StyleSheet, ImageSourcePropType, Text } from 'react-native';

// TEMPORARILY DISABLED - using emoji fallbacks only
// TODO: Re-enable once sprite paths are verified
function getSpritesheets(): Record<string, ImageSourcePropType> {
  return {}; // Return empty to force emoji fallbacks
}

// Sprite sheet dimensions
const FRAME_WIDTH = 48;
const FRAME_HEIGHT = 48;
const SHEET_COLS = 56; // Approximate columns in the spritesheet

// Direction offsets (column in row 0)
type Direction = 'down' | 'left' | 'right' | 'up';
const DIRECTION_OFFSETS: Record<Direction, number> = {
  down: 0,
  left: 1,
  right: 2,
  up: 3,
};

// Emoji fallbacks for each character
const EMOJI_FALLBACKS: Record<string, string> = {
  person_01: '🧑‍🎓',
  person_02: '👔',
  person_03: '🎨',
  person_04: '🏃',
  person_05: '🧑‍🏫',
  person_06: '🎵',
  person_07: '👨‍🍳',
  person_08: '👨‍⚕️',
  person_09: '👨‍💻',
  person_10: '👩‍🏫',
  person_11: '🧳',
  person_12: '👨‍🌾',
  person_13: '✍️',
  person_14: '🔬',
  person_15: '📷',
  person_16: '💃',
  person_17: '👨‍✈️',
  person_18: '🕵️',
  person_19: '📚',
  person_20: '🤝',
};

interface CharacterSpriteProps {
  spriteId: string;
  direction?: Direction;
  scale?: number;
  style?: object;
  highlighted?: boolean;
}

export default function CharacterSprite({
  spriteId,
  direction = 'down',
  scale = 1,
  style,
  highlighted = false,
}: CharacterSpriteProps) {
  const spritesheets = getSpritesheets();
  const spriteSource = spritesheets[spriteId];

  // Calculate the frame position
  // Row 0 contains the 4 direction idle poses
  const frameX = DIRECTION_OFFSETS[direction];
  const frameY = 0;

  // Calculate dimensions
  const displayWidth = FRAME_WIDTH * scale;
  const displayHeight = FRAME_HEIGHT * scale;

  // The spritesheet image needs to be positioned to show only the desired frame
  // We use a clip/overflow approach with positioning
  const spritePosition = useMemo(() => ({
    left: -frameX * FRAME_WIDTH * scale,
    top: -frameY * FRAME_HEIGHT * scale,
  }), [frameX, frameY, scale]);

  // If sprite not available, show emoji fallback
  if (!spriteSource) {
    const emoji = EMOJI_FALLBACKS[spriteId] || '👤';
    return (
      <View style={[styles.fallback, { width: displayWidth, height: displayHeight }, style]}>
        <Text style={[styles.fallbackEmoji, { fontSize: displayWidth * 0.7 }]}>
          {emoji}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          width: displayWidth,
          height: displayHeight,
        },
        highlighted && styles.highlighted,
        style,
      ]}
    >
      <Image
        source={spriteSource}
        style={[
          styles.spritesheet,
          {
            width: SHEET_COLS * FRAME_WIDTH * scale,
            height: 24 * FRAME_HEIGHT * scale, // Approximate rows
            left: spritePosition.left,
            top: spritePosition.top,
          },
        ]}
        resizeMode="contain"
      />
    </View>
  );
}

// Helper to check if a sprite ID is a people sprite
export function isPeopleSprite(spriteId: string): boolean {
  return spriteId in EMOJI_FALLBACKS;
}

// Get all available people sprite IDs
export function getAvailablePeopleSprites(): string[] {
  return Object.keys(EMOJI_FALLBACKS);
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  spritesheet: {
    position: 'absolute',
  },
  highlighted: {
    shadowColor: '#ffd700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackEmoji: {
    textAlign: 'center',
  },
});
