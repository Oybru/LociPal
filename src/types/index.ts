// Core data types for MemPal

export interface Position {
  x: number;
  y: number;
}

export interface IsometricPosition {
  isoX: number; // Isometric grid X
  isoY: number; // Isometric grid Y
  isoZ?: number; // Elevation level (optional, default 0)
  screenX: number; // Calculated screen X
  screenY: number; // Calculated screen Y
}

export interface PathNode {
  isoX: number;
  isoY: number;
  isoZ: number;
  screenX: number;
  screenY: number;
}

export enum TileType {
  FLOOR = 0,
  BLOCKED = 1,
  STAIR_NE = 2,
  WALL = 3,
}

export type PalaceTheme =
  | 'medieval'
  | 'gothic'
  | 'asian'
  | 'middle_eastern'
  | 'renaissance'
  | 'ancient_greek'
  | 'egyptian'
  | 'nordic'
  | 'atlantis';

export interface PalaceTemplate {
  id: string;
  name: string;
  theme: PalaceTheme;
  thumbnail: string; // Asset path
  backgroundImage: string; // Asset path
  gridSize: { width: number; height: number };
  placementZones: PlacementZone[]; // Areas where totems can be placed
}

export interface PlacementZone {
  id: string;
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
  label?: string; // e.g., "table", "shelf", "floor"
}

export interface Palace {
  id: string;
  name: string;
  templateId: string;
  theme: PalaceTheme;
  createdAt: number;
  updatedAt: number;
  totems: Totem[];
  backgroundColor?: string;
}

export interface Totem {
  id: string;
  palaceId: string;
  position: IsometricPosition;
  prompt: string; // The AI prompt used to generate
  imageUri: string; // Local path to generated/stored image
  createdAt: number;
  updatedAt: number;
  content: TotemContent;
  scale: number; // Size multiplier
  zIndex: number; // Layering order
}

export interface TotemContent {
  title: string;
  description: string;
  links: TotemLink[];
  images: TotemImage[];
  notes: string;
}

export interface TotemLink {
  id: string;
  url: string;
  label: string;
}

export interface TotemImage {
  id: string;
  uri: string;
  caption?: string;
}

// Navigation types
export type RootStackParamList = {
  Home: undefined;
  PalaceList: undefined;
  CreatePalace: undefined;
  PalaceView: { palaceId: string };
  TotemDetail: { palaceId: string; totemId: string };
  TotemCreate: { palaceId: string; position: IsometricPosition };
  AtlantisTest: undefined;
};

// Store types
export interface AppState {
  palaces: Palace[];
  currentPalaceId: string | null;
  isLoading: boolean;
}

// Dungeon generation types
export type { Rect, Room, Corridor, Portal, RoomGrid, DungeonGeneratorConfig, GeneratedDungeon, WallLayoutConfig } from './dungeon';
