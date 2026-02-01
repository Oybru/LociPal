// A* Pathfinding for isometric grid with elevation support
import { PathNode, TileType } from '../types';
import { isoToScreen } from './isometric';

export interface PathfindingConfig {
  gridWidth: number;
  gridHeight: number;
  heightMap: number[][]; // heightMap[y][x] = elevation
  tileTypeMap?: number[][]; // tileTypeMap[y][x] = TileType
}

interface AStarNode {
  x: number;
  y: number;
  z: number;
  g: number; // Cost from start
  h: number; // Heuristic to end
  f: number; // g + h
  parent: AStarNode | null;
}

// Cardinal + diagonal directions (8-directional movement)
const DIRECTIONS = [
  { dx: 0, dy: -1, cost: 1 },   // north
  { dx: 1, dy: 0, cost: 1 },    // east
  { dx: 0, dy: 1, cost: 1 },    // south
  { dx: -1, dy: 0, cost: 1 },   // west
  { dx: 1, dy: -1, cost: 1.41 }, // northeast
  { dx: 1, dy: 1, cost: 1.41 },  // southeast
  { dx: -1, dy: 1, cost: 1.41 }, // southwest
  { dx: -1, dy: -1, cost: 1.41 }, // northwest
];

function heuristic(ax: number, ay: number, bx: number, by: number): number {
  return Math.max(Math.abs(ax - bx), Math.abs(ay - by)); // Chebyshev distance
}

function nodeKey(x: number, y: number): string {
  return `${x},${y}`;
}

/**
 * Find a path from (startX, startY) to (endX, endY) using A*.
 * Returns PathNode[] including both start and end, or empty array if no path.
 */
export function findPath(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  config: PathfindingConfig
): PathNode[] {
  const { gridWidth, gridHeight, heightMap, tileTypeMap } = config;

  // Bounds check
  if (
    startX < 0 || startX >= gridWidth || startY < 0 || startY >= gridHeight ||
    endX < 0 || endX >= gridWidth || endY < 0 || endY >= gridHeight
  ) {
    return [];
  }

  // Check if destination is blocked or a wall
  const endType = tileTypeMap?.[endY]?.[endX] ?? TileType.FLOOR;
  if (endType === TileType.BLOCKED || endType === TileType.WALL) {
    return [];
  }

  const startZ = heightMap[startY]?.[startX] ?? 0;
  const endZ = heightMap[endY]?.[endX] ?? 0;

  // Already there
  if (startX === endX && startY === endY) {
    const screen = isoToScreen(startX, startY, startZ);
    return [{ isoX: startX, isoY: startY, isoZ: startZ, screenX: screen.x, screenY: screen.y }];
  }

  const startNode: AStarNode = {
    x: startX, y: startY, z: startZ,
    g: 0,
    h: heuristic(startX, startY, endX, endY),
    f: heuristic(startX, startY, endX, endY),
    parent: null,
  };

  const openSet: AStarNode[] = [startNode];
  const closedSet = new Set<string>();
  const gScores = new Map<string, number>();
  gScores.set(nodeKey(startX, startY), 0);

  while (openSet.length > 0) {
    // Find node with lowest f score
    let lowestIdx = 0;
    for (let i = 1; i < openSet.length; i++) {
      if (openSet[i].f < openSet[lowestIdx].f) {
        lowestIdx = i;
      }
    }
    const current = openSet[lowestIdx];

    // Reached destination
    if (current.x === endX && current.y === endY) {
      return reconstructPath(current);
    }

    openSet.splice(lowestIdx, 1);
    const currentKey = nodeKey(current.x, current.y);
    closedSet.add(currentKey);

    // Explore neighbors
    for (const dir of DIRECTIONS) {
      const nx = current.x + dir.dx;
      const ny = current.y + dir.dy;

      // Bounds check
      if (nx < 0 || nx >= gridWidth || ny < 0 || ny >= gridHeight) continue;

      const neighborKey = nodeKey(nx, ny);
      if (closedSet.has(neighborKey)) continue;

      // Tile type check — walls and blocked tiles are impassable
      const neighborType = tileTypeMap?.[ny]?.[nx] ?? TileType.FLOOR;
      if (neighborType === TileType.BLOCKED || neighborType === TileType.WALL) continue;

      const neighborZ = heightMap[ny]?.[nx] ?? 0;
      const elevationDiff = Math.abs(neighborZ - current.z);

      // Elevation rules: cliffs are impassable, only stairs allow elevation changes
      const currentType = tileTypeMap?.[current.y]?.[current.x] ?? TileType.FLOOR;
      const isStairCurrent = currentType === TileType.STAIR_NE;
      const isStairNeighbor = neighborType === TileType.STAIR_NE;
      const hasStair = isStairCurrent || isStairNeighbor;
      const maxElevationDiff = hasStair ? 1 : 0;

      if (elevationDiff > maxElevationDiff) continue;

      // Diagonal moves blocked by elevation cliffs: both shared cardinal neighbors must be passable
      const isDiagonal = dir.dx !== 0 && dir.dy !== 0;
      if (isDiagonal) {
        const adj1Z = heightMap[current.y]?.[current.x + dir.dx] ?? 0;
        const adj2Z = heightMap[current.y + dir.dy]?.[current.x] ?? 0;
        const adj1Type = tileTypeMap?.[current.y]?.[current.x + dir.dx] ?? TileType.FLOOR;
        const adj2Type = tileTypeMap?.[current.y + dir.dy]?.[current.x] ?? TileType.FLOOR;
        const adj1Blocked = adj1Type === TileType.BLOCKED || Math.abs(adj1Z - current.z) > (hasStair ? 1 : 0);
        const adj2Blocked = adj2Type === TileType.BLOCKED || Math.abs(adj2Z - current.z) > (hasStair ? 1 : 0);
        if (adj1Blocked || adj2Blocked) continue;
      }

      const tentativeG = current.g + dir.cost + elevationDiff * 0.5; // Slight cost for elevation changes

      const existingG = gScores.get(neighborKey);
      if (existingG !== undefined && tentativeG >= existingG) continue;

      gScores.set(neighborKey, tentativeG);

      const neighborNode: AStarNode = {
        x: nx, y: ny, z: neighborZ,
        g: tentativeG,
        h: heuristic(nx, ny, endX, endY),
        f: tentativeG + heuristic(nx, ny, endX, endY),
        parent: current,
      };

      // Add to open set (or update if already there)
      const existingIdx = openSet.findIndex(n => n.x === nx && n.y === ny);
      if (existingIdx >= 0) {
        openSet[existingIdx] = neighborNode;
      } else {
        openSet.push(neighborNode);
      }
    }
  }

  // No path found
  return [];
}

function reconstructPath(endNode: AStarNode): PathNode[] {
  const path: PathNode[] = [];
  let current: AStarNode | null = endNode;

  while (current) {
    const screen = isoToScreen(current.x, current.y, current.z);
    path.unshift({
      isoX: current.x,
      isoY: current.y,
      isoZ: current.z,
      screenX: screen.x,
      screenY: screen.y,
    });
    current = current.parent;
  }

  return path;
}
