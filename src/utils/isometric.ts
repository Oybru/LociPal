// Isometric grid utilities for MemPal
// Converts between screen coordinates and isometric grid coordinates

import { IsometricPosition, Position } from '../types';

// Isometric tile dimensions - 128x64 for better touch targets on mobile
export const TILE_WIDTH = 128;
export const TILE_HEIGHT = 64;

// Grid configuration
export const GRID_OFFSET_X = 200; // Screen offset for centering
export const GRID_OFFSET_Y = 100;

// Elevation
export const ELEVATION_HEIGHT = 32; // pixels per elevation level

/**
 * Convert isometric grid coordinates to screen coordinates
 * Standard isometric projection: 2:1 ratio
 */
export function isoToScreen(isoX: number, isoY: number, isoZ: number = 0): Position {
  const screenX = (isoX - isoY) * (TILE_WIDTH / 2) + GRID_OFFSET_X;
  const screenY = (isoX + isoY) * (TILE_HEIGHT / 2) + GRID_OFFSET_Y - isoZ * ELEVATION_HEIGHT;
  return { x: screenX, y: screenY };
}

/**
 * Convert screen coordinates to isometric grid coordinates
 * Returns the nearest grid cell
 */
export function screenToIso(screenX: number, screenY: number): Position {
  const adjustedX = screenX - GRID_OFFSET_X;
  const adjustedY = screenY - GRID_OFFSET_Y;

  const isoX = (adjustedX / (TILE_WIDTH / 2) + adjustedY / (TILE_HEIGHT / 2)) / 2;
  const isoY = (adjustedY / (TILE_HEIGHT / 2) - adjustedX / (TILE_WIDTH / 2)) / 2;

  return {
    x: Math.round(isoX),
    y: Math.round(isoY),
  };
}

/**
 * Create a full IsometricPosition from grid coordinates
 */
export function createIsometricPosition(isoX: number, isoY: number, isoZ: number = 0): IsometricPosition {
  const screen = isoToScreen(isoX, isoY, isoZ);
  return {
    isoX,
    isoY,
    isoZ,
    screenX: screen.x,
    screenY: screen.y,
  };
}

/**
 * Calculate z-index for isometric depth sorting
 * Objects with higher isoX + isoY should render on top
 */
export function calculateZIndex(isoX: number, isoY: number, isoZ: number = 0): number {
  return (isoX + isoY) * 100 + isoZ * 10;
}

/**
 * Check if a screen position is within the grid bounds
 */
export function isWithinGrid(
  screenX: number,
  screenY: number,
  gridWidth: number,
  gridHeight: number
): boolean {
  const iso = screenToIso(screenX, screenY);
  return iso.x >= 0 && iso.x < gridWidth && iso.y >= 0 && iso.y < gridHeight;
}

/**
 * Snap screen coordinates to the nearest grid position
 */
export function snapToGrid(screenX: number, screenY: number): IsometricPosition {
  const iso = screenToIso(screenX, screenY);
  return createIsometricPosition(iso.x, iso.y);
}

/**
 * Get all grid positions sorted by depth (back to front)
 * Useful for rendering order
 */
export function getDepthSortedPositions(
  gridWidth: number,
  gridHeight: number
): IsometricPosition[] {
  const positions: IsometricPosition[] = [];

  for (let y = 0; y < gridHeight; y++) {
    for (let x = 0; x < gridWidth; x++) {
      positions.push(createIsometricPosition(x, y));
    }
  }

  // Sort by depth (back to front)
  return positions.sort((a, b) => (a.isoX + a.isoY) - (b.isoX + b.isoY));
}
