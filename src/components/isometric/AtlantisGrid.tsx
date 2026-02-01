// AtlantisGrid - Isometric grid renderer with height map and cliff fill
import React, { useMemo } from 'react';
import { View, Image } from 'react-native';
import { isoToScreen } from '../../utils/isometric';
import { TileType } from '../../types';
import type { WallLayoutConfig } from '../../types';
import { DEFAULT_WALL_LAYOUT } from '../../utils/roomGenerator';

// Tile assets
const FLOOR_GRAY = require('../../assets/generated/tiles/atlantis/floor_gray.png');

// Render size for tile sprites
const SPRITE_SIZE = 128;
const SPRITE_OFFSET_Y = SPRITE_SIZE / 2;

interface AtlantisGridProps {
  gridWidth: number;
  gridHeight: number;
  selectedTile: { isoX: number; isoY: number } | null;
  totemPositions: { isoX: number; isoY: number }[];
  familiarPosition: { isoX: number; isoY: number };
  heightMap: number[][]; // heightMap[y][x] = elevation
  tileTypeMap?: number[][]; // tileTypeMap[y][x] = TileType
  stairTile?: any; // Optional stair tile source
  wallSE?: any; // SE-facing wall screen (west edge)
  wallSW?: any; // SW-facing wall screen (north edge)
  wallLayout?: WallLayoutConfig;
  highlightTiles?: Array<{ isoX: number; isoY: number }>;
}

export default function AtlantisGrid({
  gridWidth,
  gridHeight,
  selectedTile,
  heightMap,
  tileTypeMap,
  stairTile,
  wallSE,
  wallSW,
  wallLayout = DEFAULT_WALL_LAYOUT,
  highlightTiles,
}: AtlantisGridProps) {
  const { tiles, gridLines, cliffEdges, wallScreens } = useMemo(() => {
    const allTiles: React.ReactNode[] = [];
    const lines: React.ReactNode[] = [];
    const lineColor = 'rgba(255, 0, 0, 0.5)';

    // Render tiles with height map support
    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        const tileType = tileTypeMap?.[y]?.[x] ?? TileType.FLOOR;
        if (tileType === TileType.BLOCKED) continue; // Skip void tiles

        const elevation = heightMap[y]?.[x] ?? 0;
        const isStair = tileType === TileType.STAIR_NE;

        // Cliff fill: render block tiles at each layer below the surface
        for (let z = 0; z < elevation; z++) {
          const fillPos = isoToScreen(x, y, z);
          const fillZIndex = (x + y) * 100 + z * 10;

          allTiles.push(
            <Image
              key={`cliff-${x}-${y}-${z}`}
              source={FLOOR_GRAY}
              style={{
                position: 'absolute',
                left: fillPos.x - SPRITE_SIZE / 2,
                top: fillPos.y - SPRITE_SIZE / 2 + SPRITE_OFFSET_Y,
                width: SPRITE_SIZE,
                height: SPRITE_SIZE,
                zIndex: fillZIndex,
                opacity: 0.6,
              }}
              resizeMode="contain"
            />
          );
        }

        // Surface tile
        const pos = isoToScreen(x, y, elevation);
        const zIndex = (x + y) * 100 + elevation * 10 + 1;
        const tileSource = (isStair && stairTile) ? stairTile : FLOOR_GRAY;

        allTiles.push(
          <Image
            key={`floor-${x}-${y}`}
            source={tileSource}
            style={{
              position: 'absolute',
              left: pos.x - SPRITE_SIZE / 2,
              top: pos.y - SPRITE_SIZE / 2 + SPRITE_OFFSET_Y,
              width: SPRITE_SIZE,
              height: SPRITE_SIZE,
              zIndex,
            }}
            resizeMode="contain"
          />
        );
      }
    }

    // Per-tile diamond outlines at correct elevation
    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        const gridTileType = tileTypeMap?.[y]?.[x] ?? TileType.FLOOR;
        if (gridTileType === TileType.BLOCKED) continue;
        const elev = heightMap[y]?.[x] ?? 0;
        const top = isoToScreen(x, y, elev);
        const right = isoToScreen(x + 1, y, elev);
        const bottom = isoToScreen(x + 1, y + 1, elev);
        const left = isoToScreen(x, y + 1, elev);
        const lineZ = (x + y) * 100 + elev * 10 + 3;

        const edges = [
          { from: top, to: right, id: 'tr' },
          { from: right, to: bottom, id: 'rb' },
          { from: bottom, to: left, id: 'bl' },
          { from: left, to: top, id: 'lt' },
        ];

        for (const edge of edges) {
          const edx = edge.to.x - edge.from.x;
          const edy = edge.to.y - edge.from.y;
          const length = Math.sqrt(edx * edx + edy * edy);
          const angle = Math.atan2(edy, edx) * (180 / Math.PI);

          lines.push(
            <View
              key={`grid-${x}-${y}-${edge.id}`}
              style={{
                position: 'absolute',
                left: edge.from.x,
                top: edge.from.y,
                width: length,
                height: 1,
                backgroundColor: lineColor,
                transform: [{ rotate: `${angle}deg` }],
                transformOrigin: 'left center',
                zIndex: lineZ,
              }}
            />
          );
        }
      }
    }

    // Cliff edge outlines — draw on edges where elevation drops
    const cliffEdges: React.ReactNode[] = [];
    const cliffColor = 'rgba(20, 10, 40, 0.85)';
    const cliffWidth = 2;

    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        const elev = heightMap[y]?.[x] ?? 0;
        if (elev === 0) continue; // Only care about elevated tiles

        const cliffZ = (x + y) * 100 + elev * 10 + 4;

        // Check 4 neighbors: north (y-1), east (x+1), south (y+1), west (x-1)
        // Each neighbor maps to a specific edge of the diamond
        const neighbors = [
          { nx: x, ny: y - 1, edge: 'top-right' },    // north neighbor → top-right edge
          { nx: x + 1, ny: y, edge: 'bottom-right' },  // east neighbor → bottom-right edge
          { nx: x, ny: y + 1, edge: 'bottom-left' },   // south neighbor → bottom-left edge
          { nx: x - 1, ny: y, edge: 'top-left' },      // west neighbor → top-left edge
        ];

        const top = isoToScreen(x, y, elev);
        const right = isoToScreen(x + 1, y, elev);
        const bottom = isoToScreen(x + 1, y + 1, elev);
        const left = isoToScreen(x, y + 1, elev);

        const edgeMap: Record<string, { from: { x: number; y: number }; to: { x: number; y: number } }> = {
          'top-right': { from: top, to: right },
          'bottom-right': { from: right, to: bottom },
          'bottom-left': { from: bottom, to: left },
          'top-left': { from: left, to: top },
        };

        for (const { nx, ny, edge } of neighbors) {
          const neighborElev = (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight)
            ? (heightMap[ny]?.[nx] ?? 0)
            : -1; // Out of bounds treated as lower

          if (neighborElev < elev) {
            const seg = edgeMap[edge];
            const edx = seg.to.x - seg.from.x;
            const edy = seg.to.y - seg.from.y;
            const length = Math.sqrt(edx * edx + edy * edy);
            const angle = Math.atan2(edy, edx) * (180 / Math.PI);

            cliffEdges.push(
              <View
                key={`cliff-edge-${x}-${y}-${edge}`}
                style={{
                  position: 'absolute',
                  left: seg.from.x,
                  top: seg.from.y,
                  width: length,
                  height: cliffWidth,
                  backgroundColor: cliffColor,
                  transform: [{ rotate: `${angle}deg` }],
                  transformOrigin: 'left center',
                  zIndex: cliffZ,
                }}
              />
            );
          }
        }
      }
    }

    // Wall screens along floor tile perimeters (where FLOOR/STAIR borders BLOCKED)
    const wallScreens: React.ReactNode[] = [];
    const WALL_SPRITE_SIZE = 128;
    const WALL_OFFSET_Y = WALL_SPRITE_SIZE / 2;

    for (let wy = 0; wy < gridHeight; wy++) {
      for (let wx = 0; wx < gridWidth; wx++) {
        const wTileType = tileTypeMap?.[wy]?.[wx] ?? TileType.FLOOR;
        if (wTileType === TileType.BLOCKED) continue;

        const elev = heightMap[wy]?.[wx] ?? 0;

        // West neighbor (x-1): place SE-facing wall on west edge
        const westType = (wx > 0) ? (tileTypeMap?.[wy]?.[wx - 1] ?? TileType.FLOOR) : TileType.BLOCKED;
        if (westType === TileType.BLOCKED && wallSE) {
          const edgeTop = isoToScreen(wx + wallLayout.upperSE.xOffset, wy + wallLayout.upperSE.yStart, elev);
          const edgeBot = isoToScreen(wx + wallLayout.upperSE.xOffset, wy + wallLayout.upperSE.yEnd, elev);
          const cx = (edgeTop.x + edgeBot.x) / 2;
          const cy = (edgeTop.y + edgeBot.y) / 2;
          const wz = (wx + wy) * 100 + elev * 10 + 2;

          wallScreens.push(
            <Image
              key={`wall-se-${wx}-${wy}`}
              source={wallSE}
              style={{
                position: 'absolute',
                left: cx - WALL_SPRITE_SIZE / 2,
                top: cy - WALL_SPRITE_SIZE / 2 + WALL_OFFSET_Y - 32,
                width: WALL_SPRITE_SIZE,
                height: WALL_SPRITE_SIZE,
                zIndex: wz,
              }}
              resizeMode="contain"
            />
          );
        }

        // North neighbor (y-1): place SW-facing wall on north edge
        const northType = (wy > 0) ? (tileTypeMap?.[wy - 1]?.[wx] ?? TileType.FLOOR) : TileType.BLOCKED;
        if (northType === TileType.BLOCKED && wallSW) {
          const edgeLeft = isoToScreen(wx + wallLayout.upperSW.xStart, wy + wallLayout.upperSW.yOffset, elev);
          const edgeRight = isoToScreen(wx + wallLayout.upperSW.xEnd, wy + wallLayout.upperSW.yOffset, elev);
          const cx = (edgeLeft.x + edgeRight.x) / 2;
          const cy = (edgeLeft.y + edgeRight.y) / 2;
          const wz = (wx + wy) * 100 + elev * 10 + 2;

          wallScreens.push(
            <Image
              key={`wall-sw-${wx}-${wy}`}
              source={wallSW}
              style={{
                position: 'absolute',
                left: cx - WALL_SPRITE_SIZE / 2,
                top: cy - WALL_SPRITE_SIZE / 2 + WALL_OFFSET_Y - 32,
                width: WALL_SPRITE_SIZE,
                height: WALL_SPRITE_SIZE,
                zIndex: wz,
              }}
              resizeMode="contain"
            />
          );
        }
      }
    }

    // Downward wall columns on camera-facing edges (south & east perimeters)
    // Creates the illusion of height by stacking walls below floor level
    for (let wy = 0; wy < gridHeight; wy++) {
      for (let wx = 0; wx < gridWidth; wx++) {
        const dwTileType = tileTypeMap?.[wy]?.[wx] ?? TileType.FLOOR;
        if (dwTileType === TileType.BLOCKED) continue;

        const elev = heightMap[wy]?.[wx] ?? 0;

        // South neighbor (y+1) is BLOCKED: SW-facing walls going downward
        const southType = (wy < gridHeight - 1) ? (tileTypeMap?.[wy + 1]?.[wx] ?? TileType.FLOOR) : TileType.BLOCKED;
        if (southType === TileType.BLOCKED && wallSW) {
          for (let d = 0; d < wallLayout.depth; d++) {
            const z = elev - d - 1;
            const edgeLeft = isoToScreen(wx + wallLayout.lowerSW.xStart, wy + wallLayout.lowerSW.yOffset, z);
            const edgeRight = isoToScreen(wx + wallLayout.lowerSW.xEnd, wy + wallLayout.lowerSW.yOffset, z);
            const cx = (edgeLeft.x + edgeRight.x) / 2;
            const cy = (edgeLeft.y + edgeRight.y) / 2;
            const wz = (wx + wy) * 100 + (elev - d) * 10 + 1;

            wallScreens.push(
              <Image
                key={`wall-down-sw-${wx}-${wy}-${d}`}
                source={wallSW}
                style={{
                  position: 'absolute',
                  left: cx - WALL_SPRITE_SIZE / 2,
                  top: cy - WALL_SPRITE_SIZE / 2 + WALL_OFFSET_Y - 32,
                  width: WALL_SPRITE_SIZE,
                  height: WALL_SPRITE_SIZE,
                  zIndex: wz,
                }}
                resizeMode="contain"
              />
            );
          }
        }

        // East neighbor (x+1) is BLOCKED: SE-facing walls going downward
        const eastType = (wx < gridWidth - 1) ? (tileTypeMap?.[wy]?.[wx + 1] ?? TileType.FLOOR) : TileType.BLOCKED;
        if (eastType === TileType.BLOCKED && wallSE) {
          for (let d = 0; d < wallLayout.depth; d++) {
            const z = elev - d - 1;
            const edgeTop = isoToScreen(wx + wallLayout.lowerSE.xOffset, wy + wallLayout.lowerSE.yStart, z);
            const edgeBot = isoToScreen(wx + wallLayout.lowerSE.xOffset, wy + wallLayout.lowerSE.yEnd, z);
            const cx = (edgeTop.x + edgeBot.x) / 2;
            const cy = (edgeTop.y + edgeBot.y) / 2;
            const wz = (wx + wy) * 100 + (elev - d) * 10 + 1;

            wallScreens.push(
              <Image
                key={`wall-down-se-${wx}-${wy}-${d}`}
                source={wallSE}
                style={{
                  position: 'absolute',
                  left: cx - WALL_SPRITE_SIZE / 2,
                  top: cy - WALL_SPRITE_SIZE / 2 + WALL_OFFSET_Y - 32,
                  width: WALL_SPRITE_SIZE,
                  height: WALL_SPRITE_SIZE,
                  zIndex: wz,
                }}
                resizeMode="contain"
              />
            );
          }
        }
      }
    }

    return { tiles: allTiles, gridLines: lines, cliffEdges, wallScreens };
  }, [gridWidth, gridHeight, heightMap, tileTypeMap, stairTile, wallSE, wallSW, wallLayout]);

  // Selected tile highlight — 4 lines tracing the isometric diamond at elevation
  const selectedHighlight = useMemo(() => {
    if (!selectedTile) return null;

    const { isoX, isoY } = selectedTile;
    const elevation = heightMap[isoY]?.[isoX] ?? 0;

    const top = isoToScreen(isoX, isoY, elevation);
    const right = isoToScreen(isoX + 1, isoY, elevation);
    const bottom = isoToScreen(isoX + 1, isoY + 1, elevation);
    const left = isoToScreen(isoX, isoY + 1, elevation);

    const corners = [
      { from: top, to: right },
      { from: right, to: bottom },
      { from: bottom, to: left },
      { from: left, to: top },
    ];

    const highlightColor = 'rgba(78, 205, 196, 0.6)';
    const highlightZ = (isoX + isoY) * 100 + elevation * 10 + 5;

    return corners.map((edge, i) => {
      const dx = edge.to.x - edge.from.x;
      const dy = edge.to.y - edge.from.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);

      return (
        <View
          key={`highlight-${i}`}
          style={{
            position: 'absolute',
            left: edge.from.x,
            top: edge.from.y,
            width: length,
            height: 2,
            backgroundColor: highlightColor,
            transform: [{ rotate: `${angle}deg` }],
            transformOrigin: 'left center',
            zIndex: highlightZ,
          }}
        />
      );
    });
  }, [selectedTile, heightMap]);

  // Gold diamond outlines for highlighted placement tiles
  const highlightTilesOverlay = useMemo(() => {
    if (!highlightTiles || highlightTiles.length === 0) return null;

    const goldColor = 'rgba(255, 215, 0, 0.7)';
    const elements: React.ReactNode[] = [];

    for (const tile of highlightTiles) {
      const { isoX, isoY } = tile;
      const elevation = heightMap[isoY]?.[isoX] ?? 0;

      const top = isoToScreen(isoX, isoY, elevation);
      const right = isoToScreen(isoX + 1, isoY, elevation);
      const bottom = isoToScreen(isoX + 1, isoY + 1, elevation);
      const left = isoToScreen(isoX, isoY + 1, elevation);

      const corners = [
        { from: top, to: right, id: 'tr' },
        { from: right, to: bottom, id: 'rb' },
        { from: bottom, to: left, id: 'bl' },
        { from: left, to: top, id: 'lt' },
      ];

      const hlZ = (isoX + isoY) * 100 + elevation * 10 + 6;

      for (const edge of corners) {
        const dx = edge.to.x - edge.from.x;
        const dy = edge.to.y - edge.from.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);

        elements.push(
          <View
            key={`hl-${isoX}-${isoY}-${edge.id}`}
            style={{
              position: 'absolute',
              left: edge.from.x,
              top: edge.from.y,
              width: length,
              height: 3,
              backgroundColor: goldColor,
              transform: [{ rotate: `${angle}deg` }],
              transformOrigin: 'left center',
              zIndex: hlZ,
            }}
          />
        );
      }
    }

    return elements;
  }, [highlightTiles, heightMap]);

  return (
    <>
      {wallScreens}
      {tiles}
      {gridLines}
      {cliffEdges}
      {selectedHighlight}
      {highlightTilesOverlay}
    </>
  );
}
