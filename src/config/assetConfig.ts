// Asset Configuration - Maps LimeZu pack to MemPal palace themes
// LimeZu Modern Interiors v41.4 asset mapping

import { PalaceTheme } from '../types';

// Base paths for assets (relative to src/assets/palaces)
const INTERIORS_32 = '1_Interiors/32x32/Theme_Sorter_Singles_32x32';
const HOME_DESIGNS_32 = '6_Home_Designs';

// Theme configuration with LimeZu asset mappings
export interface ThemeAssetConfig {
  id: PalaceTheme;
  name: string;
  description: string;
  color: string;
  icon: string;
  // LimeZu folder mappings
  roomBackgroundFolder?: string;
  furnitureFolders: string[];
  // Fallback colors for rooms without specific backgrounds
  floorColor: string;
  wallColor: string;
}

export const THEME_ASSETS: Record<PalaceTheme, ThemeAssetConfig> = {
  medieval: {
    id: 'medieval',
    name: 'Medieval Castle',
    description: 'Stone walls, torches, and royal chambers',
    color: '#8b4513',
    icon: '🏰',
    furnitureFolders: [
      `${INTERIORS_32}/14_Basement_Singles_32x32`, // Dungeon-like items
      `${INTERIORS_32}/22_Museum_Singles_32x32`, // Antique furniture
    ],
    floorColor: '#3d3d3d',
    wallColor: '#5a5a5a',
  },

  gothic: {
    id: 'gothic',
    name: 'Gothic Cathedral',
    description: 'Stained glass, arches, and shadowy halls',
    color: '#2f1f2f',
    icon: '⛪',
    furnitureFolders: [
      `${INTERIORS_32}/11_Halloween_Singles_32x32`, // Dark atmosphere
      `${INTERIORS_32}/14_Basement_Singles_32x32`,
    ],
    floorColor: '#1a1a2e',
    wallColor: '#2d2d4a',
  },

  asian: {
    id: 'asian',
    name: 'Asian Temple',
    description: 'Zen gardens, paper screens, and pagodas',
    color: '#c41e3a',
    icon: '🏯',
    roomBackgroundFolder: `${HOME_DESIGNS_32}/Japanese_Interiors_Home_Designs/32x32`,
    furnitureFolders: [
      `${INTERIORS_32}/20_Japanese_Interiors_Singles_32x32`,
    ],
    floorColor: '#4a3728',
    wallColor: '#8b7355',
  },

  middle_eastern: {
    id: 'middle_eastern',
    name: 'Middle Eastern Palace',
    description: 'Ornate tiles, fountains, and golden domes',
    color: '#daa520',
    icon: '🕌',
    furnitureFolders: [
      `${INTERIORS_32}/7_Art_Singles_32x32`, // Decorative items
      `${INTERIORS_32}/22_Museum_Singles_32x32`,
    ],
    floorColor: '#c4a35a',
    wallColor: '#8b6914',
  },

  renaissance: {
    id: 'renaissance',
    name: 'Renaissance Villa',
    description: 'Art galleries, marble, and grand staircases',
    color: '#4a7c59',
    icon: '🎨',
    furnitureFolders: [
      `${INTERIORS_32}/7_Art_Singles_32x32`,
      `${INTERIORS_32}/22_Museum_Singles_32x32`,
      `${INTERIORS_32}/2_Living_Room_Singles_32x32`,
    ],
    floorColor: '#d4c4a8',
    wallColor: '#f5f0e1',
  },

  ancient_greek: {
    id: 'ancient_greek',
    name: 'Ancient Greek',
    description: 'Columns, amphitheaters, and olive groves',
    color: '#e8e8e8',
    icon: '🏛️',
    furnitureFolders: [
      `${INTERIORS_32}/22_Museum_Singles_32x32`,
      `${INTERIORS_32}/8_Gym_Singles_32x32`, // Athletic items
    ],
    floorColor: '#f5f5f0',
    wallColor: '#ffffff',
  },

  egyptian: {
    id: 'egyptian',
    name: 'Egyptian Temple',
    description: 'Hieroglyphics, pyramids, and sacred chambers',
    color: '#c4a35a',
    icon: '🔺',
    furnitureFolders: [
      `${INTERIORS_32}/22_Museum_Singles_32x32`,
      `${INTERIORS_32}/7_Art_Singles_32x32`,
    ],
    floorColor: '#d4a855',
    wallColor: '#8b6914',
  },

  nordic: {
    id: 'nordic',
    name: 'Nordic Hall',
    description: 'Viking longhouses, runes, and great halls',
    color: '#4682b4',
    icon: '⚔️',
    furnitureFolders: [
      `${INTERIORS_32}/14_Basement_Singles_32x32`,
      `${INTERIORS_32}/9_Fishing_Singles_32x32`, // Maritime items
    ],
    floorColor: '#5a4a3a',
    wallColor: '#8b7355',
  },

  atlantis: {
    id: 'atlantis',
    name: 'Atlantis',
    description: 'Sunken palace with bioluminescent corals and ancient marble',
    color: '#4ecdc4',
    icon: '🐚',
    furnitureFolders: [
      `${INTERIORS_32}/22_Museum_Singles_32x32`, // Ancient artifacts
      `${INTERIORS_32}/7_Art_Singles_32x32`, // Decorative items
    ],
    floorColor: '#1a3a4a',
    wallColor: '#0a2030',
  },
};

// Additional room types that can be used across themes
export const ROOM_TYPES = {
  livingRoom: `${INTERIORS_32}/2_Living_Room_Singles_32x32`,
  bedroom: `${INTERIORS_32}/4_Bedroom_Singles_32x32`,
  kitchen: `${INTERIORS_32}/12_Kitchen_Singles_32x32`,
  library: `${INTERIORS_32}/5_Classroom_and_Library_Singles_32x32`,
  bathroom: `${INTERIORS_32}/3_Bathroom_Singles_32x32`,
  gym: `${INTERIORS_32}/8_Gym_Singles_32x32`,
  art: `${INTERIORS_32}/7_Art_Singles_32x32`,
  music: `${INTERIORS_32}/6_Music_and_Sport_32x32`,
};

// Pre-designed room layouts available
export const ROOM_LAYOUTS = {
  japanese: `${HOME_DESIGNS_32}/Japanese_Interiors_Home_Designs/32x32`,
  generic: `${HOME_DESIGNS_32}/Generic_Home_Designs/32x32`,
  museum: `${HOME_DESIGNS_32}/Museum_Designs/32x32`,
  gym: `${HOME_DESIGNS_32}/Gym_Designs/32x32`,
};

// Asset size configurations
export const ASSET_SIZES = {
  small: 16,
  medium: 32,
  large: 48,
} as const;

export type AssetSize = keyof typeof ASSET_SIZES;

// Default size for the app
export const DEFAULT_ASSET_SIZE: AssetSize = 'medium';
