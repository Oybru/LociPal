// Atlantis Test Screen - Integration testing for all game systems
// Combines: Isometric grid, Familiar, Crystal Ball, Decay Overlay
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  Image,
  Animated,
  LayoutChangeEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ATLANTIS_THEME } from '../config/atlantisTheme';
import Familiar from '../components/familiar/Familiar';
import CrystalBall from '../components/recall/CrystalBall';
import DecayOverlay from '../components/effects/DecayOverlay';
import TotemPicker from '../components/totem/TotemPicker';
import { TotemDetailPanel } from '../components/totem/TotemDetailPanel';
import AtlantisGrid from '../components/isometric/AtlantisGrid';
import { Totem, IsometricPosition, PathNode, TileType } from '../types';
import { isoToScreen } from '../utils/isometric';
import { isAdjacent, isSameTile, calculateDecayLevel } from '../utils/gameUtils';
import { useGameCamera } from '../hooks/useGameCamera';
import { SAMPLE_TOTEMS, TotemWithSprite } from '../data/sampleTotems';
import { SpriteAsset, SPRITE_BY_ID } from '../config/assetRegistry';
import { FamiliarType } from '../config/familiarsConfig';
import { findPath } from '../utils/pathfinding';
import { DEFAULT_WALL_LAYOUT, generatePortalRoom } from '../utils/roomGenerator';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const GRID_WIDTH = 25;
const GRID_HEIGHT = 25;

// Parallax background tile
const BG_TILE = require('../assets/generated/tiles/atlantis/floor_rune.png');
const PARALLAX_FACTOR = 0.3; // moves at 30% of camera speed

// Static dungeon layout (BSP-generated, seed 42)
// 7 rooms connected by corridors, 2 rooms elevated
const HEIGHT_MAP: number[][] = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // y=0
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // y=1
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // y=2
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // y=3
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // y=4
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // y=5
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // y=6
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // y=7
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // y=8
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // y=9
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // y=10 (stair landing)
  [0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // y=11
  [0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // y=12
  [0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // y=13 (x=5 stair landing)
  [0, 0, 0, 0, 0, 1, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // y=14 (x=5 stair landing)
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // y=15 (stair landing)
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // y=16
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // y=17
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // y=18
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0], // y=19 (stair landing)
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 0], // y=20
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 3, 2, 0], // y=21 (inner sanctum)
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 3, 3, 2, 0], // y=22 (inner sanctum)
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 0], // y=23
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // y=24
];

const TILE_TYPE_MAP: number[][] = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // y=0
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // y=1
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // y=2
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // y=3
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // y=4
  [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // y=5
  [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // y=6
  [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // y=7
  [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // y=8
  [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // y=9
  [1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // y=10
  [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // y=11
  [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // y=12
  [1, 1, 1, 0, 0, 2, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1], // y=13
  [1, 1, 1, 0, 0, 2, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1], // y=14
  [1, 1, 1, 0, 0, 1, 1, 1, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // y=15
  [1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // y=16
  [1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1], // y=17
  [1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1], // y=18
  [1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 2, 2, 1, 1], // y=19
  [1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 2, 2, 0, 1], // y=20 (x=21-22 stair 2→3)
  [1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 2, 0, 0, 2, 1], // y=21 (x=20,23 stair 2→3)
  [1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 2, 0, 0, 2, 1], // y=22 (x=20,23 stair 2→3)
  [1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 2, 2, 0, 1], // y=23 (x=21-22 stair 2→3)
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // y=24
];

// Spawn point (center of room-0)
const SPAWN_X = 8;
const SPAWN_Y = 7;

// Stair tile
const STAIR_TILE = require('../assets/generated/tiles/atlantis/stair_ne.png');

// Wall screen tiles (directional)
const WALL_SE = require('../assets/generated/tiles/atlantis/marblewall_SEfacing.png');
const WALL_SW = require('../assets/generated/tiles/atlantis/marblewall_SWfacing.png');

// Portal sprite (static icon for UI)
const PORTAL_SW = require('../assets/generated/tiles/atlantis/portal_sw1.png');

// Portal animation frames
const PORTAL_FRAMES = [
  require('../assets/generated/tiles/atlantis/portal_sw1.png'),
  require('../assets/generated/tiles/atlantis/portal_sw2_2.png'),
  require('../assets/generated/tiles/atlantis/portal_sw2_3.png'),
  require('../assets/generated/tiles/atlantis/portal_sw2_4.png'),
];
const PORTAL_FRAME_INTERVAL = 100; // ms per frame

// Animated portal component — cycles through frames using opacity switching
const AnimatedPortal: React.FC<{
  style: {
    position: 'absolute';
    left: number;
    top: number;
    width: number;
    height: number;
    zIndex: number;
  };
}> = ({ style }) => {
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setFrameIndex(prev => (prev + 1) % PORTAL_FRAMES.length);
    }, PORTAL_FRAME_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={style}>
      {PORTAL_FRAMES.map((frame, i) => (
        <Image
          key={i}
          source={frame}
          style={{
            position: 'absolute' as const,
            width: style.width,
            height: style.height,
            opacity: i === frameIndex ? 1 : 0,
          }}
          resizeMode="contain"
        />
      ))}
    </View>
  );
};

interface PlacedPortal {
  id: string;
  tileX: number;
  tileY: number;
  wallFacing: 'upperSW' | 'lowerSW';
  linkedRoomSeed?: number;
  isReturnPortal?: boolean;
}

interface RoomContext {
  gridWidth: number;
  gridHeight: number;
  heightMap: number[][];
  tileTypeMap: number[][];
  familiarReturnTile: { isoX: number; isoY: number };
  placedPortals: PlacedPortal[];
  totems: TotemWithSprite[];
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h) + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

// Detect which SW-facing wall edge a floor tile has (if any)
function detectSWWallEdge(
  tileX: number,
  tileY: number,
  tileTypeMap: number[][],
  gridHeight: number,
): 'upperSW' | 'lowerSW' | null {
  const tileType = tileTypeMap[tileY]?.[tileX];
  if (tileType === undefined || tileType === TileType.BLOCKED) return null;

  const northType = (tileY > 0)
    ? (tileTypeMap[tileY - 1]?.[tileX] ?? TileType.FLOOR)
    : TileType.BLOCKED;
  if (northType === TileType.BLOCKED) return 'upperSW';

  const southType = (tileY < gridHeight - 1)
    ? (tileTypeMap[tileY + 1]?.[tileX] ?? TileType.FLOOR)
    : TileType.BLOCKED;
  if (southType === TileType.BLOCKED) return 'lowerSW';

  return null;
}

export default function AtlantisTestScreen() {
  // Filter sample totems to only those on walkable tiles
  const validTotems = useMemo(() => {
    return SAMPLE_TOTEMS.filter(t => {
      const ty = t.position.isoY;
      const tx = t.position.isoX;
      if (ty < 0 || ty >= GRID_HEIGHT || tx < 0 || tx >= GRID_WIDTH) return false;
      const type = TILE_TYPE_MAP[ty]?.[tx] ?? TileType.BLOCKED;
      return type !== TileType.BLOCKED && type !== TileType.WALL;
    });
  }, []);

  const [totems, setTotems] = useState<TotemWithSprite[]>(validTotems);
  const [familiarPosition, setFamiliarPosition] = useState<{ isoX: number; isoY: number }>({
    isoX: SPAWN_X,
    isoY: SPAWN_Y,
  });
  const initialElevation = HEIGHT_MAP[SPAWN_Y]?.[SPAWN_X] ?? 0;
  const [familiarTargetPosition, setFamiliarTargetPosition] = useState<IsometricPosition>(() => {
    const screenPos = isoToScreen(SPAWN_X, SPAWN_Y, initialElevation);
    return { isoX: SPAWN_X, isoY: SPAWN_Y, isoZ: initialElevation, screenX: screenPos.x, screenY: screenPos.y };
  });
  const [walkPath, setWalkPath] = useState<PathNode[] | undefined>(undefined);
  const [familiarHappiness] = useState(80);
  const [selectedFamiliar] = useState<FamiliarType>('celestial_owl');
  const [showCrystalBall, setShowCrystalBall] = useState(false);
  const [showTotemPicker, setShowTotemPicker] = useState(false);
  const [pendingTotemPosition, setPendingTotemPosition] = useState<{ isoX: number; isoY: number } | null>(null);
  const [mana, setMana] = useState(50);
  const [lastRoomVisit] = useState(Date.now() - 86400000 * 2);
  const [selectedTile, setSelectedTile] = useState<{ isoX: number; isoY: number } | null>(null);
  const [selectedTotem, setSelectedTotem] = useState<TotemWithSprite | null>(null);
  const [pendingInteraction, setPendingInteraction] = useState<TotemWithSprite | null>(null);
  const [portalPlacementMode, setPortalPlacementMode] = useState(false);
  const [totemPlacementMode, setTotemPlacementMode] = useState(false);
  const [placedPortals, setPlacedPortals] = useState<PlacedPortal[]>([]);
  const [familiarCasting, setFamiliarCasting] = useState(false);
  const [pendingPortalPlacement, setPendingPortalPlacement] = useState<PlacedPortal | null>(null);

  // Dynamic room state (portal transitions swap these)
  const [activeHeightMap, setActiveHeightMap] = useState<number[][]>(HEIGHT_MAP);
  const [activeTileTypeMap, setActiveTileTypeMap] = useState<number[][]>(TILE_TYPE_MAP);
  const [activeGridWidth, setActiveGridWidth] = useState(GRID_WIDTH);
  const [activeGridHeight, setActiveGridHeight] = useState(GRID_HEIGHT);
  const [roomStack, setRoomStack] = useState<RoomContext[]>([]);
  const [pendingPortal, setPendingPortal] = useState<PlacedPortal | null>(null);
  const [transitionOpacity] = useState(() => new Animated.Value(0));

  const [viewLayout, setViewLayout] = useState({ width: SCREEN_WIDTH, height: 400 });

  const decayLevel = calculateDecayLevel(lastRoomVisit);
  const gridCenterX = viewLayout.width / 2;
  const gridCenterY = viewLayout.height / 2 - 20;

  // Compute valid placement tiles for totem placement mode
  const placementTiles = useMemo(() => {
    if (!totemPlacementMode) return [];
    const tiles: Array<{ isoX: number; isoY: number }> = [];
    const offsets = [
      { dx: 0, dy: -1 }, { dx: 1, dy: 0 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 },
      { dx: 1, dy: -1 }, { dx: 1, dy: 1 }, { dx: -1, dy: 1 }, { dx: -1, dy: -1 },
    ];
    for (const { dx, dy } of offsets) {
      const x = familiarPosition.isoX + dx;
      const y = familiarPosition.isoY + dy;
      if (x >= 0 && x < activeGridWidth && y >= 0 && y < activeGridHeight) {
        const tileType = activeTileTypeMap[y]?.[x] ?? TileType.BLOCKED;
        if (tileType !== TileType.BLOCKED && tileType !== TileType.WALL) {
          const occupied = totems.some(t => t.position.isoX === x && t.position.isoY === y);
          if (!occupied) tiles.push({ isoX: x, isoY: y });
        }
      }
    }
    // Also include familiar's own tile if empty
    const famOccupied = totems.some(
      t => t.position.isoX === familiarPosition.isoX && t.position.isoY === familiarPosition.isoY
    );
    if (!famOccupied) tiles.push({ isoX: familiarPosition.isoX, isoY: familiarPosition.isoY });
    return tiles;
  }, [totemPlacementMode, familiarPosition, activeGridWidth, activeGridHeight, activeTileTypeMap, totems]);

  // Move familiar to any tile (tap-to-move) using A* pathfinding
  const moveFamiliarToTile = useCallback((targetX: number, targetY: number) => {
    if (targetX < 0 || targetX >= activeGridWidth || targetY < 0 || targetY >= activeGridHeight) return;

    const path = findPath(
      familiarPosition.isoX,
      familiarPosition.isoY,
      targetX,
      targetY,
      {
        gridWidth: activeGridWidth,
        gridHeight: activeGridHeight,
        heightMap: activeHeightMap,
        tileTypeMap: activeTileTypeMap,
      }
    );

    if (path.length >= 2) {
      // Update destination state
      const dest = path[path.length - 1];
      setFamiliarPosition({ isoX: dest.isoX, isoY: dest.isoY });
      setFamiliarTargetPosition({
        isoX: dest.isoX,
        isoY: dest.isoY,
        isoZ: dest.isoZ,
        screenX: dest.screenX,
        screenY: dest.screenY,
      });
      setSelectedTile({ isoX: targetX, isoY: targetY });
      // Trigger walk path
      setWalkPath(path);
    } else if (path.length === 1) {
      // Already at destination
      setSelectedTile({ isoX: targetX, isoY: targetY });
    }
    // Empty path = unreachable, do nothing
  }, [familiarPosition.isoX, familiarPosition.isoY, activeGridWidth, activeGridHeight, activeHeightMap, activeTileTypeMap]);

  // Find best adjacent tile to a target position
  const findAdjacentTile = useCallback((targetX: number, targetY: number): { isoX: number; isoY: number } => {
    const adjacentOffsets = [
      { dx: 0, dy: -1 },
      { dx: 1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 0 },
      { dx: 1, dy: -1 },
      { dx: 1, dy: 1 },
      { dx: -1, dy: 1 },
      { dx: -1, dy: -1 },
    ];

    let bestTile = { isoX: targetX, isoY: targetY };
    let bestDistance = Infinity;

    for (const offset of adjacentOffsets) {
      const adjX = targetX + offset.dx;
      const adjY = targetY + offset.dy;

      if (adjX >= 0 && adjX < activeGridWidth && adjY >= 0 && adjY < activeGridHeight) {
        const hasTotem = totems.some(t => t.position.isoX === adjX && t.position.isoY === adjY);
        if (!hasTotem) {
          const dist = Math.abs(adjX - familiarPosition.isoX) + Math.abs(adjY - familiarPosition.isoY);
          if (dist < bestDistance) {
            bestDistance = dist;
            bestTile = { isoX: adjX, isoY: adjY };
          }
        }
      }
    }

    return bestTile;
  }, [totems, familiarPosition, activeGridWidth, activeGridHeight]);

  // Portal transition — core push/pop logic
  const activatePortal = useCallback((portal: PlacedPortal) => {
    Animated.timing(transitionOpacity, {
      toValue: 1, duration: 150, useNativeDriver: true,
    }).start(() => {
      if (portal.isReturnPortal) {
        // POP: return to previous room
        setRoomStack(prev => {
          const stack = [...prev];
          const restored = stack.pop();
          if (restored) {
            setActiveGridWidth(restored.gridWidth);
            setActiveGridHeight(restored.gridHeight);
            setActiveHeightMap(restored.heightMap);
            setActiveTileTypeMap(restored.tileTypeMap);
            setFamiliarPosition(restored.familiarReturnTile);
            const elev = restored.heightMap[restored.familiarReturnTile.isoY]?.[restored.familiarReturnTile.isoX] ?? 0;
            const sp = isoToScreen(restored.familiarReturnTile.isoX, restored.familiarReturnTile.isoY, elev);
            setFamiliarTargetPosition({
              isoX: restored.familiarReturnTile.isoX,
              isoY: restored.familiarReturnTile.isoY,
              isoZ: elev,
              screenX: sp.x,
              screenY: sp.y,
            });
            setPlacedPortals(restored.placedPortals);
            setTotems(restored.totems);
          }
          return stack;
        });
      } else {
        // PUSH: enter new room
        const ctx: RoomContext = {
          gridWidth: activeGridWidth,
          gridHeight: activeGridHeight,
          heightMap: activeHeightMap,
          tileTypeMap: activeTileTypeMap,
          familiarReturnTile: { isoX: portal.tileX, isoY: portal.tileY },
          placedPortals,
          totems,
        };
        setRoomStack(prev => [...prev, ctx]);

        const seed = portal.linkedRoomSeed ?? hashCode(portal.id);
        const dungeon = generatePortalRoom(seed);
        const grid = dungeon.grid;

        // Find return portal position
        const rPos = grid.portals.length > 0
          ? grid.portals[0].sourcePosition
          : grid.spawnPoint;
        const wallEdge = detectSWWallEdge(rPos.x, rPos.y, grid.tileTypeMap, grid.height) ?? 'upperSW';
        const returnPortal: PlacedPortal = {
          id: `return-${Date.now()}`,
          tileX: rPos.x,
          tileY: rPos.y,
          wallFacing: wallEdge,
          isReturnPortal: true,
        };

        setActiveGridWidth(grid.width);
        setActiveGridHeight(grid.height);
        setActiveHeightMap(grid.heightMap);
        setActiveTileTypeMap(grid.tileTypeMap);

        const sx = grid.spawnPoint.x, sy = grid.spawnPoint.y;
        const se = grid.heightMap[sy]?.[sx] ?? 0;
        const ss = isoToScreen(sx, sy, se);
        setFamiliarPosition({ isoX: sx, isoY: sy });
        setFamiliarTargetPosition({ isoX: sx, isoY: sy, isoZ: se, screenX: ss.x, screenY: ss.y });

        setPlacedPortals([returnPortal]);
        setTotems([]);
      }

      setWalkPath(undefined);
      setSelectedTile(null);
      setPendingInteraction(null);

      Animated.timing(transitionOpacity, {
        toValue: 0, duration: 150, useNativeDriver: true,
      }).start();
    });
  }, [activeGridWidth, activeGridHeight, activeHeightMap, activeTileTypeMap, placedPortals, totems, transitionOpacity]);

  // Handle tile tap - tap anywhere to move, auto-travel to objects
  const handleTileTap = useCallback((isoX: number, isoY: number) => {
    // Portal placement intercept
    if (portalPlacementMode) {
      let placeX = isoX;
      let placeY = isoY;
      let wallEdge = detectSWWallEdge(isoX, isoY, activeTileTypeMap, activeGridHeight);

      // If the tapped tile didn't produce a wall edge (e.g. tapped a wall tile),
      // check cardinal neighbors for a floor tile that borders a wall
      if (!wallEdge) {
        const neighbors = [
          { x: isoX, y: isoY - 1 },  // north
          { x: isoX, y: isoY + 1 },  // south
          { x: isoX - 1, y: isoY },  // west
          { x: isoX + 1, y: isoY },  // east
        ];
        for (const n of neighbors) {
          const edge = detectSWWallEdge(n.x, n.y, activeTileTypeMap, activeGridHeight);
          if (edge) {
            placeX = n.x;
            placeY = n.y;
            wallEdge = edge;
            break;
          }
        }
      }

      if (wallEdge) {
        const alreadyPlaced = placedPortals.some(
          p => p.tileX === placeX && p.tileY === placeY && p.wallFacing === wallEdge
        );
        if (!alreadyPlaced) {
          // Trigger casting animation — portal appears when casting finishes
          setPendingPortalPlacement({
            id: `portal-${Date.now()}`,
            tileX: placeX,
            tileY: placeY,
            wallFacing: wallEdge,
            linkedRoomSeed: Date.now(),
          });
          setFamiliarCasting(true);
        }
      }
      setPortalPlacementMode(false);
      return;
    }

    // Totem placement intercept
    if (totemPlacementMode) {
      const isValidPlacement = placementTiles.some(
        t => t.isoX === isoX && t.isoY === isoY
      );
      if (isValidPlacement) {
        setPendingTotemPosition({ isoX, isoY });
        setTotemPlacementMode(false);
        setShowTotemPicker(true);
      }
      return; // Swallow all taps during placement mode
    }

    // Portal activation — check if tapped tile has a portal
    const tappedPortal = placedPortals.find(
      p => p.tileX === isoX && p.tileY === isoY
    );
    if (tappedPortal) {
      const alreadyThere = familiarPosition.isoX === isoX && familiarPosition.isoY === isoY;
      if (alreadyThere) {
        activatePortal(tappedPortal);
      } else {
        setPendingPortal(tappedPortal);
        moveFamiliarToTile(isoX, isoY);
      }
      return;
    }

    setSelectedTile({ isoX, isoY });

    const totemOnTile = totems.find(
      (t) => t.position.isoX === isoX && t.position.isoY === isoY
    );

    const isAdjacentTile = isAdjacent(familiarPosition, { isoX, isoY });
    const isSame = isSameTile(familiarPosition, { isoX, isoY });

    if (totemOnTile) {
      if (isAdjacentTile || isSame) {
        setSelectedTotem(totemOnTile);
        setPendingInteraction(null);
      } else {
        const adjacentTile = findAdjacentTile(isoX, isoY);
        moveFamiliarToTile(adjacentTile.isoX, adjacentTile.isoY);
        setPendingInteraction(totemOnTile);
      }
    } else {
      moveFamiliarToTile(isoX, isoY);
      setPendingInteraction(null);
    }
  }, [portalPlacementMode, totemPlacementMode, placementTiles, placedPortals, totems, familiarPosition, moveFamiliarToTile, findAdjacentTile, activatePortal, activeTileTypeMap, activeGridHeight]);

  // Parallax background dimensions — extra padding for pan travel
  const bgWidth = SCREEN_WIDTH + 200;
  const bgHeight = SCREEN_HEIGHT + 200;

  // Camera and panning
  const {
    cameraOffset,
    zoomScale,
    isFreePanning,
    refocusCamera,
    panHandlers,
    handleTouchStart,
    handleTouchEnd,
  } = useGameCamera({
    familiarPosition,
    gridCenterX,
    gridCenterY,
    gridWidth: activeGridWidth,
    gridHeight: activeGridHeight,
    onTileTap: handleTileTap,
  });

  // Auto-interact with totem after travel completes
  useEffect(() => {
    if (pendingInteraction) {
      const totemPos = pendingInteraction.position;
      const isNowAdjacent = isAdjacent(familiarPosition, { isoX: totemPos.isoX, isoY: totemPos.isoY }) ||
                           isSameTile(familiarPosition, { isoX: totemPos.isoX, isoY: totemPos.isoY });

      if (isNowAdjacent) {
        const timer = setTimeout(() => {
          setSelectedTotem(pendingInteraction);
          setPendingInteraction(null);
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [familiarPosition.isoX, familiarPosition.isoY, pendingInteraction]);

  const handleViewLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setViewLayout({ width, height });
  }, []);

  // Arrival callback — fires when the walk animation visually finishes
  const handleFamiliarArrival = useCallback(() => {
    if (pendingPortal) {
      const portal = pendingPortal;
      setPendingPortal(null);
      setTimeout(() => activatePortal(portal), 200);
    }
  }, [pendingPortal, activatePortal]);

  // Casting completion — place the portal after the animation finishes
  const handleCastingComplete = useCallback(() => {
    setFamiliarCasting(false);
    if (pendingPortalPlacement) {
      setPlacedPortals(prev => [...prev, pendingPortalPlacement]);
      setPendingPortalPlacement(null);
    }
  }, [pendingPortalPlacement]);

  // Handle sprite selection from TotemPicker
  const handleSpriteSelected = useCallback((sprite: SpriteAsset, customTitle?: string) => {
    if (!pendingTotemPosition) return;

    const newTotem: TotemWithSprite = {
      id: `totem-${Date.now()}`,
      palaceId: 'atlantis-test',
      position: {
        isoX: pendingTotemPosition.isoX,
        isoY: pendingTotemPosition.isoY,
        screenX: 0,
        screenY: 0,
      },
      prompt: sprite.name,
      imageUri: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      content: {
        title: customTitle || sprite.name,
        description: `A ${sprite.name.toLowerCase()} to remember by`,
        links: [],
        images: [],
        notes: '',
      },
      scale: 1,
      zIndex: pendingTotemPosition.isoX + pendingTotemPosition.isoY,
      spriteId: sprite.id,
      emoji: sprite.emoji,
    };

    setTotems(prev => [...prev, newTotem]);
    setPendingTotemPosition(null);

    // Auto-open the totem info screen for the newly placed totem
    setSelectedTotem(newTotem);
  }, [pendingTotemPosition]);

  const handleRecallSuccess = (totem: Totem, earnedMana: number) => {
    setMana((prev) => prev + earnedMana);
  };

  const handleRecallFail = (_totem: Totem) => {
    // Could add visual feedback here in the future
  };

  const handleTotemSave = useCallback((totemId: string, updates: Partial<import('../types').TotemContent>) => {
    setTotems(prev => prev.map(t =>
      t.id === totemId
        ? { ...t, content: { ...t.content, ...updates }, updatedAt: Date.now() }
        : t
    ));
  }, []);

  // Render totems on grid
  const renderTotems = () => {
    return totems.map((totem) => {
      const totemElevation = activeHeightMap[totem.position.isoY]?.[totem.position.isoX] ?? 0;
      const screenPos = isoToScreen(totem.position.isoX, totem.position.isoY, totemElevation);
      const totemDecay = calculateDecayLevel(totem.updatedAt);
      const canInteract = isAdjacent(familiarPosition, totem.position) ||
                          isSameTile(familiarPosition, totem.position);

      const spriteAsset = totem.spriteId ? SPRITE_BY_ID[totem.spriteId] : null;

      return (
        <View
          key={totem.id}
          pointerEvents="none"
          style={[
            styles.totemSprite,
            {
              left: screenPos.x - 24,
              top: screenPos.y,
              zIndex: (totem.position.isoX + totem.position.isoY) * 100 + totemElevation * 10 + 5,
              opacity: 1 - totemDecay / 200,
            },
          ]}
        >
          {spriteAsset?.spriteSource ? (
            <View style={canInteract ? styles.totemGlow : undefined}>
              <Image
                source={spriteAsset.spriteSource}
                style={styles.totemImage}
                resizeMode="contain"
              />
            </View>
          ) : (
            <Text style={[
              styles.totemEmoji,
              canInteract && styles.totemInteractable,
            ]}>
              {totem.emoji || '💎'}
            </Text>
          )}
        </View>
      );
    });
  };

  // Render placed portals on walls
  const renderPortals = () => {
    const WALL_SPRITE_SIZE = 128;
    const WALL_OFFSET_Y = WALL_SPRITE_SIZE / 2;

    return placedPortals.map((portal) => {
      const elev = activeHeightMap[portal.tileY]?.[portal.tileX] ?? 0;
      let cx: number, cy: number, wz: number;

      if (portal.wallFacing === 'upperSW') {
        const edgeLeft = isoToScreen(
          portal.tileX + DEFAULT_WALL_LAYOUT.upperSW.xStart,
          portal.tileY + DEFAULT_WALL_LAYOUT.upperSW.yOffset,
          elev,
        );
        const edgeRight = isoToScreen(
          portal.tileX + DEFAULT_WALL_LAYOUT.upperSW.xEnd,
          portal.tileY + DEFAULT_WALL_LAYOUT.upperSW.yOffset,
          elev,
        );
        cx = (edgeLeft.x + edgeRight.x) / 2;
        cy = (edgeLeft.y + edgeRight.y) / 2;
        wz = (portal.tileX + portal.tileY) * 100 + elev * 10 + 3;
      } else {
        // lowerSW: top layer (d=0), z = elev - 1
        const z = elev - 1;
        const edgeLeft = isoToScreen(
          portal.tileX + DEFAULT_WALL_LAYOUT.lowerSW.xStart,
          portal.tileY + DEFAULT_WALL_LAYOUT.lowerSW.yOffset,
          z,
        );
        const edgeRight = isoToScreen(
          portal.tileX + DEFAULT_WALL_LAYOUT.lowerSW.xEnd,
          portal.tileY + DEFAULT_WALL_LAYOUT.lowerSW.yOffset,
          z,
        );
        cx = (edgeLeft.x + edgeRight.x) / 2;
        cy = (edgeLeft.y + edgeRight.y) / 2;
        wz = (portal.tileX + portal.tileY) * 100 + elev * 10 + 2;
      }

      return (
        <AnimatedPortal
          key={portal.id}
          style={{
            position: 'absolute' as const,
            left: cx - WALL_SPRITE_SIZE / 2,
            top: cy - WALL_SPRITE_SIZE / 2 + WALL_OFFSET_Y - 32,
            width: WALL_SPRITE_SIZE,
            height: WALL_SPRITE_SIZE,
            zIndex: wz,
          }}
        />
      );
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header with stats */}
      <View style={styles.header}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>✨ {mana}</Text>
        </View>
        <Text style={styles.title}>Atlantis</Text>
        <View style={styles.stat}>
          <Text style={[styles.statValue, decayLevel > 60 && styles.statWarning]}>
            {Math.round(decayLevel)}%
          </Text>
        </View>
      </View>

      {/* Main game area */}
      <View
        style={styles.gameArea}
        onLayout={handleViewLayout}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        {...panHandlers}
      >
        {/* Parallax background */}
        <Animated.View
          style={[
            styles.parallaxContainer,
            {
              transform: [
                { translateX: Animated.multiply(cameraOffset.x, PARALLAX_FACTOR) },
                { translateY: Animated.multiply(cameraOffset.y, PARALLAX_FACTOR) },
              ],
            },
          ]}
          pointerEvents="none"
        >
          <Image
            source={BG_TILE}
            style={{ width: bgWidth, height: bgHeight }}
            resizeMode="cover"
          />
          {/* Dark overlay for depth */}
          <View style={styles.parallaxDarken} />
        </Animated.View>

        {/* Grid container with camera follow offset */}
        <Animated.View
          style={[
            styles.gridContainer,
            {
              transform: [
                { translateX: gridCenterX },
                { translateY: gridCenterY },
                { scale: zoomScale },
                { translateX: cameraOffset.x },
                { translateY: cameraOffset.y },
              ],
            },
          ]}
          pointerEvents="none"
        >
          <AtlantisGrid
            gridWidth={activeGridWidth}
            gridHeight={activeGridHeight}
            selectedTile={selectedTile}
            totemPositions={totems.map(t => ({
              isoX: t.position.isoX,
              isoY: t.position.isoY,
            }))}
            familiarPosition={familiarPosition}
            heightMap={activeHeightMap}
            tileTypeMap={activeTileTypeMap}
            stairTile={STAIR_TILE}
            wallSE={WALL_SE}
            wallSW={WALL_SW}
            highlightTiles={placementTiles}
          />
          {renderTotems()}
          {renderPortals()}

          {/* Familiar */}
          <Familiar
            type={selectedFamiliar}
            targetPosition={familiarTargetPosition}
            happiness={familiarHappiness}
            evolutionLevel={1}
            walkPath={walkPath}
            onArrival={handleFamiliarArrival}
            isCasting={familiarCasting}
            onCastingComplete={handleCastingComplete}
          />
        </Animated.View>

        {/* Decay overlay */}
        <View style={styles.decayOverlayContainer} pointerEvents="none">
          <DecayOverlay
            decayLevel={decayLevel}
            theme="atlantis"
            width={viewLayout.width}
            height={viewLayout.height}
          />
        </View>

        {/* Portal transition overlay */}
        <Animated.View
          style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: '#000', zIndex: 999,
            opacity: transitionOpacity,
          }}
          pointerEvents="none"
        />

        {/* Room depth badge */}
        {roomStack.length > 0 && (
          <View style={styles.roomDepthBadge}>
            <Text style={styles.roomDepthText}>Portal Room</Text>
          </View>
        )}

        {/* Action buttons */}
        <View style={styles.actionButtonsContainer}>
          {isFreePanning && (
            <TouchableOpacity
              style={[styles.actionButton, styles.refocusButton]}
              onPress={refocusCamera}
            >
              <Text style={styles.actionIcon}>⊕</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowCrystalBall(true)}
          >
            <Text style={styles.actionIcon}>🔮</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, totemPlacementMode && styles.totemButtonActive]}
            onPress={() => setTotemPlacementMode(prev => !prev)}
          >
            <Text style={styles.actionIcon}>➕</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, portalPlacementMode && styles.portalButtonActive]}
            onPress={() => setPortalPlacementMode(prev => !prev)}
          >
            <Image source={PORTAL_SW} style={{ width: 28, height: 28 }} resizeMode="contain" />
          </TouchableOpacity>
        </View>

        {/* Portal placement mode banner */}
        {portalPlacementMode && (
          <View style={styles.portalPromptBanner}>
            <Text style={styles.portalPromptText}>Tap a wall to place a portal</Text>
            <TouchableOpacity onPress={() => setPortalPlacementMode(false)}>
              <Text style={styles.portalPromptCancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {totemPlacementMode && (
          <View style={styles.totemPlacementBanner}>
            <Text style={styles.totemPlacementText}>Tap a tile to place a totem</Text>
            <TouchableOpacity onPress={() => setTotemPlacementMode(false)}>
              <Text style={styles.totemPlacementCancel}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Crystal Ball Modal */}
      <CrystalBall
        visible={showCrystalBall}
        totems={totems}
        onClose={() => setShowCrystalBall(false)}
        onRecallSuccess={handleRecallSuccess}
        onRecallFail={handleRecallFail}
      />

      {/* Totem Detail Panel */}
      {selectedTotem && (
        <TotemDetailPanel
          totem={selectedTotem}
          onClose={() => setSelectedTotem(null)}
          onSave={handleTotemSave}
        />
      )}

      {/* Totem Picker Modal */}
      <TotemPicker
        visible={showTotemPicker}
        onClose={() => {
          setShowTotemPicker(false);
          setPendingTotemPosition(null);
        }}
        onSelect={handleSpriteSelected}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ATLANTIS_THEME.ambientColor,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: ATLANTIS_THEME.lightColor,
    opacity: 0.8,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    opacity: 0.9,
  },
  statWarning: {
    color: '#e94560',
  },
  gameArea: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  gridContainer: {
    position: 'absolute',
  },
  parallaxContainer: {
    position: 'absolute',
    top: -100,
    left: -100,
  },
  parallaxDarken: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  decayOverlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  totemSprite: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  totemEmoji: {
    fontSize: 36,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 3,
  },
  totemImage: {
    width: 48,
    height: 48,
  },
  totemGlow: {
    shadowColor: '#4ecdc4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.95,
    shadowRadius: 14,
    elevation: 12,
  },
  totemInteractable: {
    textShadowColor: '#4ecdc4',
    textShadowRadius: 10,
  },
  actionButtonsContainer: {
    position: 'absolute',
    right: 16,
    bottom: 80,
    gap: 10,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    backgroundColor: 'rgba(78, 205, 196, 0.4)',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: ATLANTIS_THEME.lightColor,
  },
  actionDisabled: {
    opacity: 0.4,
  },
  refocusButton: {
    backgroundColor: 'rgba(255, 215, 0, 0.5)',
    borderColor: '#ffd700',
  },
  actionIcon: {
    fontSize: 22,
  },
  portalButtonActive: {
    backgroundColor: 'rgba(147, 51, 234, 0.6)',
    borderColor: '#a855f7',
  },
  portalPromptBanner: {
    position: 'absolute',
    top: 12,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(147, 51, 234, 0.85)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 500,
  },
  portalPromptText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  portalPromptCancel: {
    color: '#e2e8f0',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  totemButtonActive: {
    backgroundColor: 'rgba(255, 215, 0, 0.5)',
    borderColor: '#ffd700',
  },
  totemPlacementBanner: {
    position: 'absolute',
    top: 12,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 215, 0, 0.85)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 500,
  },
  totemPlacementText: {
    color: '#0a1628',
    fontSize: 14,
    fontWeight: 'bold',
  },
  totemPlacementCancel: {
    color: '#0a1628',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  roomDepthBadge: {
    position: 'absolute',
    top: 12,
    left: 16,
    backgroundColor: 'rgba(147, 51, 234, 0.8)',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    zIndex: 500,
  },
  roomDepthText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
