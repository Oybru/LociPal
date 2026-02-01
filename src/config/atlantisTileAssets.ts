// Atlantis Tile Asset Registry
// Maps generated PNG tiles to require() sources for use in the isometric grid

import { ImageSourcePropType } from 'react-native';

// Floor tiles (128x64, isometric)
export const ATLANTIS_FLOOR_TILES: ImageSourcePropType[] = [
  require('../assets/generated/tiles/atlantis/floor_marble.png'),
  require('../assets/generated/tiles/atlantis/floor_coral.png'),
  require('../assets/generated/tiles/atlantis/floor_sand.png'),
  require('../assets/generated/tiles/atlantis/floor_mosaic.png'),
  require('../assets/generated/tiles/atlantis/floor_barnacle.png'),
  require('../assets/generated/tiles/atlantis/floor_crystal.png'),
  require('../assets/generated/tiles/atlantis/floor_rune.png'),
];

// Wall tiles (64x128, isometric)
export const ATLANTIS_WALL_TILES: ImageSourcePropType[] = [
  require('../assets/generated/tiles/atlantis/wall_coral.png'),
  require('../assets/generated/tiles/atlantis/wall_marble.png'),
];

// Prop sprites (64x64, transparent background)
export const ATLANTIS_PROPS = {
  pillar: require('../assets/generated/tiles/atlantis/prop_pillar.png'),
  amphora: require('../assets/generated/tiles/atlantis/prop_amphora.png'),
  crystal: require('../assets/generated/tiles/atlantis/prop_crystal.png'),
  fountain: require('../assets/generated/tiles/atlantis/prop_fountain.png'),
} as const;

// Deterministic tile selection based on grid position
// Uses a simple hash to ensure the same tile always appears at the same position
export function getFloorTileForPosition(isoX: number, isoY: number): ImageSourcePropType {
  const hash = (isoX * 7 + isoY * 13 + isoX * isoY * 3) % ATLANTIS_FLOOR_TILES.length;
  return ATLANTIS_FLOOR_TILES[hash];
}

// Get wall tile for a border position
export function getWallTileForPosition(index: number): ImageSourcePropType {
  return ATLANTIS_WALL_TILES[index % ATLANTIS_WALL_TILES.length];
}

// Default prop placements for a 9x9 grid (positions that won't conflict with sample totems)
export const DEFAULT_PROP_PLACEMENTS = [
  { isoX: 0, isoY: 0, prop: 'pillar' as const },
  { isoX: 8, isoY: 0, prop: 'crystal' as const },
  { isoX: 0, isoY: 8, prop: 'amphora' as const },
  { isoX: 8, isoY: 8, prop: 'fountain' as const },
  { isoX: 4, isoY: 0, prop: 'pillar' as const },
  { isoX: 0, isoY: 4, prop: 'crystal' as const },
];
