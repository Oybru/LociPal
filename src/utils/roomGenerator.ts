// BSP Dungeon Generator for procedural room creation
// Pure function — no React or side-effect dependencies

import { TileType } from '../types';
import type {
  Rect,
  Room,
  Corridor,
  Portal,
  RoomGrid,
  DungeonGeneratorConfig,
  GeneratedDungeon,
  WallLayoutConfig,
} from '../types/dungeon';
import { SeededRandom } from './seededRandom';

// --- Default config ---

export const DEFAULT_DUNGEON_CONFIG: DungeonGeneratorConfig = {
  gridWidth: 25,
  gridHeight: 25,
  minRoomSize: 4,
  maxRoomSize: 8,
  minRooms: 4,
  maxElevation: 2,
  corridorWidth: 2,
};

/** Default wall sprite positioning offsets (in isometric tile units).
 *  Upper walls sit behind floor tiles (north & west edges).
 *  Lower walls hang below floor tiles (south & east edges, camera-facing). */
export const DEFAULT_WALL_LAYOUT: WallLayoutConfig = {
  // SE-facing wall on west perimeter: x = tile - 1.5, y span = [tile - 1, tile]
  upperSE: { xOffset: -1.5, yStart: -1, yEnd: 0 },
  // SW-facing wall on north perimeter: x span = [tile - 1, tile], y = tile - 1.5
  upperSW: { xStart: -1, xEnd: 0, yOffset: -1.5 },
  // SW-facing wall below south edge: x span = [tile, tile + 1], y = tile + 0.5
  lowerSW: { xStart: 0, xEnd: 1, yOffset: 0.5 },
  // SE-facing wall below east edge: x = tile + 0.5, y span = [tile, tile + 1]
  lowerSE: { xOffset: 0.5, yStart: 0, yEnd: 1 },
  depth: 3,
};

// --- BSP tree node ---

interface BSPNode {
  rect: Rect;
  left: BSPNode | null;
  right: BSPNode | null;
  room: Room | null;
}

// --- Main entry point ---

export function generateDungeon(config: DungeonGeneratorConfig): GeneratedDungeon {
  const rng = new SeededRandom(config.seed ?? Date.now());

  // Phase 1: BSP partition
  const root: BSPNode = {
    rect: { x: 0, y: 0, width: config.gridWidth, height: config.gridHeight },
    left: null,
    right: null,
    room: null,
  };
  bspSplit(root, config.minRoomSize, rng, 0);

  // Phase 2: Place rooms in leaf nodes
  const leaves = getLeaves(root);
  const rooms: Room[] = [];
  let roomIdx = 0;
  for (const leaf of leaves) {
    const room = placeRoomInPartition(
      leaf.rect,
      config.minRoomSize,
      config.maxRoomSize,
      `room-${roomIdx}`,
      rng
    );
    if (room) {
      leaf.room = room;
      rooms.push(room);
      roomIdx++;
    }
  }

  // Phase 3: Assign elevations
  assignElevations(rooms, config.maxElevation, rng);

  // Phase 4: Connect rooms with corridors
  const corridors: Corridor[] = [];
  connectBSPSiblings(root, corridors, config.corridorWidth, rng);

  // Phase 5: Build grid maps
  const heightMap = createGrid(config.gridHeight, config.gridWidth, 0);
  const tileTypeMap = createGrid(config.gridHeight, config.gridWidth, TileType.BLOCKED);

  carveRooms(rooms, heightMap, tileTypeMap);
  carveCorridors(corridors, heightMap, tileTypeMap);

  // Phase 6: Place stairs at elevation transitions
  placeStairs(heightMap, tileTypeMap, config.gridWidth, config.gridHeight);

  // Phase 7: Place portals on room walls
  const portals = placePortals(rooms, tileTypeMap, config.gridWidth, config.gridHeight, rng);

  // Phase 8: Validate connectivity — ensure all rooms reachable from spawn
  const spawnRoom = rooms[0];
  const spawnPoint = {
    x: Math.floor(spawnRoom.bounds.x + spawnRoom.bounds.width / 2),
    y: Math.floor(spawnRoom.bounds.y + spawnRoom.bounds.height / 2),
  };

  ensureConnectivity(
    spawnPoint,
    rooms,
    corridors,
    heightMap,
    tileTypeMap,
    config.gridWidth,
    config.gridHeight,
    config.corridorWidth
  );

  // Build output
  const grid: RoomGrid = {
    id: `dungeon-${config.seed ?? 0}`,
    name: 'Generated Dungeon',
    width: config.gridWidth,
    height: config.gridHeight,
    heightMap,
    tileTypeMap,
    rooms,
    corridors,
    portals,
    spawnPoint,
  };

  return { grid, rooms, corridors, portals, wallLayout: DEFAULT_WALL_LAYOUT };
}

// --- BSP splitting ---

function bspSplit(node: BSPNode, minSize: number, rng: SeededRandom, depth: number): void {
  if (depth > 5) return;

  const { rect } = node;
  const minDim = minSize * 2 + 1; // need room for 2 rooms + 1 gap

  const canSplitH = rect.height >= minDim;
  const canSplitV = rect.width >= minDim;

  if (!canSplitH && !canSplitV) return;

  // Prefer splitting the longer dimension
  let splitVertically: boolean;
  if (canSplitV && !canSplitH) {
    splitVertically = true;
  } else if (canSplitH && !canSplitV) {
    splitVertically = false;
  } else {
    splitVertically =
      rect.width > rect.height
        ? true
        : rect.width < rect.height
          ? false
          : rng.next() > 0.5;
  }

  if (splitVertically) {
    const splitMin = rect.x + minSize;
    const splitMax = rect.x + rect.width - minSize;
    if (splitMin >= splitMax) return;
    const splitPos = rng.intRange(splitMin, splitMax);

    node.left = {
      rect: { x: rect.x, y: rect.y, width: splitPos - rect.x, height: rect.height },
      left: null,
      right: null,
      room: null,
    };
    node.right = {
      rect: { x: splitPos, y: rect.y, width: rect.x + rect.width - splitPos, height: rect.height },
      left: null,
      right: null,
      room: null,
    };
  } else {
    const splitMin = rect.y + minSize;
    const splitMax = rect.y + rect.height - minSize;
    if (splitMin >= splitMax) return;
    const splitPos = rng.intRange(splitMin, splitMax);

    node.left = {
      rect: { x: rect.x, y: rect.y, width: rect.width, height: splitPos - rect.y },
      left: null,
      right: null,
      room: null,
    };
    node.right = {
      rect: { x: rect.x, y: splitPos, width: rect.width, height: rect.y + rect.height - splitPos },
      left: null,
      right: null,
      room: null,
    };
  }

  bspSplit(node.left!, minSize, rng, depth + 1);
  bspSplit(node.right!, minSize, rng, depth + 1);
}

function getLeaves(node: BSPNode): BSPNode[] {
  if (!node.left && !node.right) return [node];
  const leaves: BSPNode[] = [];
  if (node.left) leaves.push(...getLeaves(node.left));
  if (node.right) leaves.push(...getLeaves(node.right));
  return leaves;
}

// --- Room placement ---

function placeRoomInPartition(
  partition: Rect,
  minSize: number,
  maxSize: number,
  id: string,
  rng: SeededRandom
): Room | null {
  const maxW = Math.min(maxSize, partition.width - 2);
  const maxH = Math.min(maxSize, partition.height - 2);

  if (maxW < minSize || maxH < minSize) return null;

  const roomW = rng.intRange(minSize, maxW + 1);
  const roomH = rng.intRange(minSize, maxH + 1);

  const maxX = partition.x + partition.width - roomW - 1;
  const maxY = partition.y + partition.height - roomH - 1;
  const roomX = rng.intRange(partition.x + 1, maxX + 1);
  const roomY = rng.intRange(partition.y + 1, maxY + 1);

  return {
    id,
    bounds: { x: roomX, y: roomY, width: roomW, height: roomH },
    elevation: 0,
    placementZone: {
      x: roomX + 1,
      y: roomY + 1,
      width: Math.max(1, roomW - 2),
      height: Math.max(1, roomH - 2),
    },
  };
}

// --- Elevation assignment ---

function assignElevations(rooms: Room[], maxElevation: number, rng: SeededRandom): void {
  for (let i = 0; i < rooms.length; i++) {
    if (i === 0) {
      // First room is always ground level (spawn)
      rooms[i].elevation = 0;
      continue;
    }
    const roll = rng.next();
    if (roll < 0.4) {
      rooms[i].elevation = 0;
    } else if (roll < 0.75) {
      rooms[i].elevation = Math.min(1, maxElevation);
    } else {
      rooms[i].elevation = Math.min(2, maxElevation);
    }
  }
}

// --- Corridor connection ---

function connectBSPSiblings(
  node: BSPNode,
  corridors: Corridor[],
  corridorWidth: number,
  rng: SeededRandom
): void {
  if (!node.left || !node.right) return;

  connectBSPSiblings(node.left, corridors, corridorWidth, rng);
  connectBSPSiblings(node.right, corridors, corridorWidth, rng);

  const leftRooms = getRoomsInSubtree(node.left);
  const rightRooms = getRoomsInSubtree(node.right);

  if (leftRooms.length === 0 || rightRooms.length === 0) return;

  // Find closest pair
  let bestDist = Infinity;
  let bestA: Room = leftRooms[0];
  let bestB: Room = rightRooms[0];

  for (const a of leftRooms) {
    for (const b of rightRooms) {
      const d = rectCenterDist(a.bounds, b.bounds);
      if (d < bestDist) {
        bestDist = d;
        bestA = a;
        bestB = b;
      }
    }
  }

  const corridor = createLShapedCorridor(
    rectCenter(bestA.bounds),
    rectCenter(bestB.bounds),
    corridorWidth,
    rng
  );
  corridors.push(corridor);
}

function getRoomsInSubtree(node: BSPNode): Room[] {
  if (!node.left && !node.right) {
    return node.room ? [node.room] : [];
  }
  const rooms: Room[] = [];
  if (node.left) rooms.push(...getRoomsInSubtree(node.left));
  if (node.right) rooms.push(...getRoomsInSubtree(node.right));
  return rooms;
}

function rectCenter(r: Rect): { x: number; y: number } {
  return {
    x: Math.floor(r.x + r.width / 2),
    y: Math.floor(r.y + r.height / 2),
  };
}

function rectCenterDist(a: Rect, b: Rect): number {
  const ca = rectCenter(a);
  const cb = rectCenter(b);
  return Math.abs(ca.x - cb.x) + Math.abs(ca.y - cb.y);
}

function createLShapedCorridor(
  from: { x: number; y: number },
  to: { x: number; y: number },
  width: number,
  rng: SeededRandom
): Corridor {
  const tiles: Array<{ x: number; y: number }> = [];
  const tileSet = new Set<string>();

  const addTile = (x: number, y: number) => {
    const key = `${x},${y}`;
    if (!tileSet.has(key)) {
      tileSet.add(key);
      tiles.push({ x, y });
    }
  };

  // Randomly choose horizontal-first or vertical-first
  const horizontalFirst = rng.next() > 0.5;

  if (horizontalFirst) {
    // Horizontal from.x → to.x at from.y
    const xMin = Math.min(from.x, to.x);
    const xMax = Math.max(from.x, to.x);
    for (let x = xMin; x <= xMax; x++) {
      for (let w = 0; w < width; w++) {
        addTile(x, from.y + w);
      }
    }
    // Vertical at to.x from from.y → to.y
    const yMin = Math.min(from.y, to.y);
    const yMax = Math.max(from.y, to.y);
    for (let y = yMin; y <= yMax; y++) {
      for (let w = 0; w < width; w++) {
        addTile(to.x + w, y);
      }
    }
  } else {
    // Vertical from.y → to.y at from.x
    const yMin = Math.min(from.y, to.y);
    const yMax = Math.max(from.y, to.y);
    for (let y = yMin; y <= yMax; y++) {
      for (let w = 0; w < width; w++) {
        addTile(from.x + w, y);
      }
    }
    // Horizontal at to.y from from.x → to.x
    const xMin = Math.min(from.x, to.x);
    const xMax = Math.max(from.x, to.x);
    for (let x = xMin; x <= xMax; x++) {
      for (let w = 0; w < width; w++) {
        addTile(x, to.y + w);
      }
    }
  }

  return { tiles, elevation: 0 };
}

// --- Grid building ---

function createGrid(rows: number, cols: number, fill: number): number[][] {
  return Array.from({ length: rows }, () => Array(cols).fill(fill));
}

function carveRooms(rooms: Room[], heightMap: number[][], tileTypeMap: number[][]): void {
  for (const room of rooms) {
    const { x, y, width, height } = room.bounds;
    for (let ry = y; ry < y + height; ry++) {
      for (let rx = x; rx < x + width; rx++) {
        if (ry >= 0 && ry < heightMap.length && rx >= 0 && rx < heightMap[0].length) {
          heightMap[ry][rx] = room.elevation;
          tileTypeMap[ry][rx] = TileType.FLOOR;
        }
      }
    }
  }
}

function carveCorridors(corridors: Corridor[], heightMap: number[][], tileTypeMap: number[][]): void {
  for (const corridor of corridors) {
    for (const tile of corridor.tiles) {
      if (
        tile.y >= 0 && tile.y < heightMap.length &&
        tile.x >= 0 && tile.x < heightMap[0].length
      ) {
        // Only carve if currently blocked (don't overwrite room elevation)
        if (tileTypeMap[tile.y][tile.x] === TileType.BLOCKED) {
          heightMap[tile.y][tile.x] = 0;
          tileTypeMap[tile.y][tile.x] = TileType.FLOOR;
        }
      }
    }
  }
}

// --- Stair placement ---

const CARDINAL = [
  { dx: 0, dy: -1 },
  { dx: 1, dy: 0 },
  { dx: 0, dy: 1 },
  { dx: -1, dy: 0 },
];

function placeStairs(
  heightMap: number[][],
  tileTypeMap: number[][],
  gridWidth: number,
  gridHeight: number
): void {
  // First pass: handle elevation diff of 2 by inserting intermediate tiles
  // We need to scan for corridor tiles adjacent to elevated rooms and create ramps
  let changed = true;
  while (changed) {
    changed = false;
    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        if (tileTypeMap[y][x] !== TileType.FLOOR) continue;
        const elev = heightMap[y][x];

        for (const dir of CARDINAL) {
          const nx = x + dir.dx;
          const ny = y + dir.dy;
          if (nx < 0 || nx >= gridWidth || ny < 0 || ny >= gridHeight) continue;
          if (tileTypeMap[ny][nx] !== TileType.FLOOR) continue;

          const nElev = heightMap[ny][nx];
          const diff = Math.abs(nElev - elev);

          if (diff >= 2) {
            // Set the lower tile to an intermediate elevation
            if (elev < nElev) {
              heightMap[y][x] = elev + 1;
            } else {
              heightMap[ny][nx] = nElev + 1;
            }
            changed = true;
          }
        }
      }
    }
  }

  // Second pass: place STAIR_NE on tiles where elevation differs by exactly 1
  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      if (tileTypeMap[y][x] !== TileType.FLOOR) continue;
      const elev = heightMap[y][x];

      for (const dir of CARDINAL) {
        const nx = x + dir.dx;
        const ny = y + dir.dy;
        if (nx < 0 || nx >= gridWidth || ny < 0 || ny >= gridHeight) continue;
        if (tileTypeMap[ny][nx] === TileType.BLOCKED) continue;

        const nElev = heightMap[ny][nx];
        if (nElev - elev === 1) {
          // This tile is lower, neighbor is higher — place stair here
          tileTypeMap[y][x] = TileType.STAIR_NE;
          break; // Only one stair designation per tile
        }
      }
    }
  }
}

// --- Portal placement ---

function placePortals(
  rooms: Room[],
  tileTypeMap: number[][],
  gridWidth: number,
  gridHeight: number,
  rng: SeededRandom
): Portal[] {
  const portals: Portal[] = [];

  for (const room of rooms) {
    const { x, y, width, height } = room.bounds;
    const candidates: Array<{ x: number; y: number }> = [];

    // Check perimeter tiles of the room
    for (let rx = x; rx < x + width; rx++) {
      for (let ry = y; ry < y + height; ry++) {
        // Only perimeter tiles
        if (rx !== x && rx !== x + width - 1 && ry !== y && ry !== y + height - 1) continue;
        if (tileTypeMap[ry]?.[rx] !== TileType.FLOOR) continue;

        // Must have at least one adjacent BLOCKED tile (i.e., against a wall)
        for (const dir of CARDINAL) {
          const adjX = rx + dir.dx;
          const adjY = ry + dir.dy;
          if (
            adjX < 0 || adjX >= gridWidth || adjY < 0 || adjY >= gridHeight ||
            tileTypeMap[adjY][adjX] === TileType.BLOCKED
          ) {
            candidates.push({ x: rx, y: ry });
            break;
          }
        }
      }
    }

    if (candidates.length > 0) {
      const pos = rng.pick(candidates);
      portals.push({
        id: `portal-${room.id}`,
        sourceRoomId: room.id,
        sourcePosition: pos,
        targetRoomId: '',
        targetPosition: { x: 0, y: 0 },
        active: false,
      });
    }
  }

  return portals;
}

// --- Connectivity validation ---

function ensureConnectivity(
  spawnPoint: { x: number; y: number },
  rooms: Room[],
  corridors: Corridor[],
  heightMap: number[][],
  tileTypeMap: number[][],
  gridWidth: number,
  gridHeight: number,
  corridorWidth: number
): void {
  const reachable = floodFill(spawnPoint, heightMap, tileTypeMap, gridWidth, gridHeight);

  for (let i = 1; i < rooms.length; i++) {
    const center = rectCenter(rooms[i].bounds);
    const key = `${center.x},${center.y}`;

    if (!reachable.has(key)) {
      // Room is disconnected — carve emergency corridor from spawn
      const rng = new SeededRandom(i * 31337);
      const corridor = createLShapedCorridor(spawnPoint, center, corridorWidth, rng);
      corridors.push(corridor);

      // Carve it into the grid
      for (const tile of corridor.tiles) {
        if (
          tile.y >= 0 && tile.y < heightMap.length &&
          tile.x >= 0 && tile.x < heightMap[0].length
        ) {
          if (tileTypeMap[tile.y][tile.x] === TileType.BLOCKED) {
            heightMap[tile.y][tile.x] = 0;
            tileTypeMap[tile.y][tile.x] = TileType.FLOOR;
          }
        }
      }

      // Re-run stair placement for new corridor tiles
      placeStairs(heightMap, tileTypeMap, gridWidth, gridHeight);
    }
  }
}

function floodFill(
  start: { x: number; y: number },
  heightMap: number[][],
  tileTypeMap: number[][],
  gridWidth: number,
  gridHeight: number
): Set<string> {
  const visited = new Set<string>();
  const queue: Array<{ x: number; y: number }> = [start];
  visited.add(`${start.x},${start.y}`);

  while (queue.length > 0) {
    const current = queue.shift()!;
    const elev = heightMap[current.y]?.[current.x] ?? 0;
    const type = tileTypeMap[current.y]?.[current.x] ?? TileType.BLOCKED;

    for (const dir of CARDINAL) {
      const nx = current.x + dir.dx;
      const ny = current.y + dir.dy;
      const key = `${nx},${ny}`;

      if (nx < 0 || nx >= gridWidth || ny < 0 || ny >= gridHeight) continue;
      if (visited.has(key)) continue;

      const nType = tileTypeMap[ny][nx];
      if (nType === TileType.BLOCKED || nType === TileType.WALL) continue;

      const nElev = heightMap[ny][nx];
      const diff = Math.abs(nElev - elev);

      // Same movement rules as pathfinding: stair allows diff of 1, floor allows 0
      const hasStair = type === TileType.STAIR_NE || nType === TileType.STAIR_NE;
      const maxDiff = hasStair ? 1 : 0;

      if (diff <= maxDiff) {
        visited.add(key);
        queue.push({ x: nx, y: ny });
      }
    }
  }

  return visited;
}

/**
 * Generate a smaller dungeon suitable for a portal destination room.
 * Uses a deterministic seed so the same portal always produces the same room.
 */
export function generatePortalRoom(seed: number): GeneratedDungeon {
  return generateDungeon({
    gridWidth: 15,
    gridHeight: 15,
    minRoomSize: 3,
    maxRoomSize: 6,
    minRooms: 2,
    maxElevation: 1,
    corridorWidth: 2,
    seed,
  });
}
