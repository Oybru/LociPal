// Asset Registry - Catalog of all totem sprites with metadata for search/suggestions
// Each sprite backed by a generated PNG from PixelLab (emoji fallback when PNG not yet generated)

import { SPRITE_METADATA, SpriteMetadataEntry } from './sprites';
import { SPRITE_SOURCES } from './spriteRequires';

export type SpriteCategory = 'common' | 'nature' | 'fantasy' | 'knowledge' | 'treasures' | 'misc' | 'imaginary';

export interface SpriteAsset {
  id: string;
  name: string;
  category: SpriteCategory;
  tags: string[];
  emoji: string; // Fallback when sprite image not available
  spriteSource: any | null; // require() result for the PNG sprite, null if not yet generated
}

// Category metadata for UI
export const SPRITE_CATEGORIES: Record<SpriteCategory, { name: string; emoji: string; color: string }> = {
  common: { name: 'Common', emoji: '🏠', color: '#8b8b8b' },
  nature: { name: 'Nature', emoji: '🌿', color: '#4caf50' },
  fantasy: { name: 'Fantasy', emoji: '✨', color: '#9c27b0' },
  knowledge: { name: 'Knowledge', emoji: '📚', color: '#2196f3' },
  treasures: { name: 'Treasures', emoji: '💎', color: '#ffc107' },
  misc: { name: 'Misc', emoji: '📦', color: '#795548' },
  imaginary: { name: 'Imaginary', emoji: '🌀', color: '#e040fb' },
};

// Build the registry by merging metadata with available PNG sources
export const SPRITE_REGISTRY: SpriteAsset[] = SPRITE_METADATA.map(
  (meta: SpriteMetadataEntry) => ({
    id: meta.id,
    name: meta.name,
    category: meta.category as SpriteCategory,
    tags: meta.tags,
    emoji: meta.emoji,
    spriteSource: SPRITE_SOURCES[meta.id] ?? null,
  })
);

// Quick lookup by ID
export const SPRITE_BY_ID: Record<string, SpriteAsset> = SPRITE_REGISTRY.reduce((acc, sprite) => {
  acc[sprite.id] = sprite;
  return acc;
}, {} as Record<string, SpriteAsset>);

// Get sprites by category
export function getSpritesByCategory(category: SpriteCategory): SpriteAsset[] {
  return SPRITE_REGISTRY.filter(sprite => sprite.category === category);
}

// Get all categories with their sprites
export function getAllCategorizedSprites(): Record<SpriteCategory, SpriteAsset[]> {
  const result: Record<SpriteCategory, SpriteAsset[]> = {
    common: [],
    nature: [],
    fantasy: [],
    knowledge: [],
    treasures: [],
    misc: [],
    imaginary: [],
  };

  SPRITE_REGISTRY.forEach(sprite => {
    result[sprite.category].push(sprite);
  });

  return result;
}
