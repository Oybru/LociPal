// Dungeon generation types for procedural room/map creation

/** A rectangular region within the dungeon grid */
export interface Rect {
  x: number;      // left column (inclusive)
  y: number;      // top row (inclusive)
  width: number;
  height: number;
}

/** A single room carved during BSP partitioning */
export interface Room {
  id: string;
  bounds: Rect;           // bounding rectangle within the dungeon grid
  elevation: number;      // base elevation for this room (0, 1, or 2)
  placementZone: Rect;    // interior region safe for totem placement (1-tile inset)
}

/** A corridor segment connecting two rooms */
export interface Corridor {
  tiles: Array<{ x: number; y: number }>;
  elevation: number;      // corridors are always at elevation 0
}

/** A portal linking two RoomGrid instances */
export interface Portal {
  id: string;
  sourceRoomId: string;
  sourcePosition: { x: number; y: number };
  targetRoomId: string;        // empty string = unlinked
  targetPosition: { x: number; y: number };
  active: boolean;             // false until portal rendering is implemented
}

/** A self-contained room grid (independent grid for the multi-grid system) */
export interface RoomGrid {
  id: string;
  name: string;
  width: number;
  height: number;
  heightMap: number[][];       // [y][x] = elevation
  tileTypeMap: number[][];     // [y][x] = TileType enum value
  rooms: Room[];
  corridors: Corridor[];
  portals: Portal[];
  spawnPoint: { x: number; y: number };
}

/** Configuration for the dungeon generator */
export interface DungeonGeneratorConfig {
  gridWidth: number;
  gridHeight: number;
  minRoomSize: number;
  maxRoomSize: number;
  minRooms: number;
  maxElevation: number;
  corridorWidth: number;
  seed?: number;
}

/** Wall sprite positioning offsets (in isometric tile units) relative to each floor tile */
export interface WallLayoutConfig {
  /** SE-facing wall on west edge (behind floor, facing camera) */
  upperSE: { xOffset: number; yStart: number; yEnd: number };
  /** SW-facing wall on north edge (behind floor, facing camera) */
  upperSW: { xStart: number; xEnd: number; yOffset: number };
  /** SW-facing wall on south edge (below floor, camera-facing drop) */
  lowerSW: { xStart: number; xEnd: number; yOffset: number };
  /** SE-facing wall on east edge (below floor, camera-facing drop) */
  lowerSE: { xOffset: number; yStart: number; yEnd: number };
  /** Number of wall sprite levels rendered downward below floor */
  depth: number;
}

/** Complete output of a dungeon generation call */
export interface GeneratedDungeon {
  grid: RoomGrid;
  rooms: Room[];
  corridors: Corridor[];
  portals: Portal[];
  wallLayout: WallLayoutConfig;
}
