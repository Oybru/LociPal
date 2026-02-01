// Game utility functions for isometric game logic
import { TILE_WIDTH, TILE_HEIGHT, GRID_OFFSET_X, GRID_OFFSET_Y } from './isometric';

/**
 * Convert touch screen coordinates to isometric tile coordinates.
 * Uses local coordinates relative to grid center, accounting for camera offset.
 */
export function touchToTile(
  touchX: number,
  touchY: number,
  gridCenterX: number,
  gridCenterY: number,
  cameraOffsetX: number,
  cameraOffsetY: number,
  gridWidth: number,
  gridHeight: number,
  zoomScale: number = 1
): { isoX: number; isoY: number } | null {
  // Reverse the transform chain: screen → undo gridCenter → undo scale → undo cameraOffset → undo gridOffset
  // Transform order is: gridCenter, scale, cameraOffset (applied to grid content)
  const relativeX = (touchX - gridCenterX) / zoomScale - cameraOffsetX - GRID_OFFSET_X;
  const relativeY = (touchY - gridCenterY) / zoomScale - cameraOffsetY - GRID_OFFSET_Y;

  // Convert to isometric coordinates using the tile dimensions
  // Isometric formula: screenX = (isoX - isoY) * (TILE_WIDTH/2)
  //                   screenY = (isoX + isoY) * (TILE_HEIGHT/2)
  // Solving for isoX and isoY:
  const isoX = (relativeX / (TILE_WIDTH / 2) + relativeY / (TILE_HEIGHT / 2)) / 2;
  const isoY = (relativeY / (TILE_HEIGHT / 2) - relativeX / (TILE_WIDTH / 2)) / 2;

  const roundedX = Math.round(isoX);
  const roundedY = Math.round(isoY);

  // Check if within grid bounds
  if (roundedX >= 0 && roundedX < gridWidth && roundedY >= 0 && roundedY < gridHeight) {
    return { isoX: roundedX, isoY: roundedY };
  }
  return null;
}

/**
 * Check if two positions are adjacent (including diagonals)
 */
export function isAdjacent(
  pos1: { isoX: number; isoY: number },
  pos2: { isoX: number; isoY: number }
): boolean {
  const dx = Math.abs(pos1.isoX - pos2.isoX);
  const dy = Math.abs(pos1.isoY - pos2.isoY);
  return dx <= 1 && dy <= 1 && (dx + dy > 0);
}

/**
 * Check if two positions are on the same tile
 */
export function isSameTile(
  pos1: { isoX: number; isoY: number },
  pos2: { isoX: number; isoY: number }
): boolean {
  return pos1.isoX === pos2.isoX && pos1.isoY === pos2.isoY;
}

/**
 * Calculate memory decay level based on last visit time.
 * 72 hours = full decay (100%)
 */
export function calculateDecayLevel(lastVisitedAt: number): number {
  const hoursSinceVisit = (Date.now() - lastVisitedAt) / (1000 * 60 * 60);
  return Math.min(100, (hoursSinceVisit / 72) * 100);
}
