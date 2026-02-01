// Isometric Grid Component - Renders the palace floor grid
import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import {
  isoToScreen,
  TILE_WIDTH,
  TILE_HEIGHT,
  getDepthSortedPositions,
} from '../../utils/isometric';

interface IsometricGridProps {
  width: number;
  height: number;
  onTilePress: (screenX: number, screenY: number) => void;
  isPlacingMode: boolean;
}

export default function IsometricGrid({
  width,
  height,
  onTilePress,
  isPlacingMode,
}: IsometricGridProps) {
  // Calculate grid positions (memoized for performance)
  const tiles = useMemo(() => {
    return getDepthSortedPositions(width, height);
  }, [width, height]);

  const handleTilePress = (isoX: number, isoY: number) => {
    const screen = isoToScreen(isoX, isoY);
    onTilePress(screen.x, screen.y);
  };

  return (
    <View style={styles.container}>
      {tiles.map((pos) => {
        const isEven = (pos.isoX + pos.isoY) % 2 === 0;
        return (
          <TouchableOpacity
            key={`${pos.isoX}-${pos.isoY}`}
            style={[
              styles.tile,
              {
                left: pos.screenX - TILE_WIDTH / 2,
                top: pos.screenY - TILE_HEIGHT / 2,
                backgroundColor: isEven ? '#1e2a4a' : '#162040',
              },
              isPlacingMode && styles.tileHighlight,
            ]}
            onPress={() => handleTilePress(pos.isoX, pos.isoY)}
            activeOpacity={isPlacingMode ? 0.7 : 1}
          >
            {/* Diamond shape using CSS */}
            <View
              style={[
                styles.tileInner,
                { backgroundColor: isEven ? '#1e2a4a' : '#162040' },
                isPlacingMode && styles.tileInnerHighlight,
              ]}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: TILE_WIDTH * 10,
    height: TILE_HEIGHT * 10 + 100,
  },
  tile: {
    position: 'absolute',
    width: TILE_WIDTH,
    height: TILE_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileHighlight: {
    zIndex: 1,
  },
  tileInner: {
    width: TILE_WIDTH - 4,
    height: TILE_HEIGHT - 2,
    transform: [{ rotate: '45deg' }, { scaleX: 2 }],
    borderWidth: 1,
    borderColor: '#2a3a5a',
  },
  tileInnerHighlight: {
    borderColor: '#e94560',
    borderWidth: 2,
  },
});
