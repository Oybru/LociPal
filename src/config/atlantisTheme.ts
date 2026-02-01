// Atlantis Theme Configuration
// Defines all assets needed for the underwater palace theme

export interface TileDefinition {
  id: string;
  name: string;
  description: string;
  type: 'floor' | 'wall_left' | 'wall_right' | 'corner_inner' | 'corner_outer' | 'prop' | 'portal';
  size: { width: number; height: number }; // in tiles
  variants: number;
  pixelLabPrompt: string;
}

export interface FamiliarDefinition {
  id: string;
  name: string;
  description: string;
  animations: {
    idle: string;
    walk: string;
    happy: string;
    sleep: string;
  };
  particleColor: string;
  particleType: 'sparkle' | 'smoke' | 'bubble' | 'flame';
}

export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  ambientColor: string;
  fogColor: string;
  lightColor: string;
  tiles: TileDefinition[];
  props: TileDefinition[];
  familiar: FamiliarDefinition;
}

// Atlantis Theme - Underwater ancient civilization
export const ATLANTIS_THEME: ThemeConfig = {
  id: 'atlantis',
  name: 'Atlantis',
  description: 'A sunken palace of ancient wisdom, where bioluminescent corals illuminate marble halls',
  ambientColor: '#1a3a4a',
  fogColor: '#0a2030',
  lightColor: '#4ecdc4',

  tiles: [
    // Floor Tiles
    {
      id: 'floor_marble',
      name: 'Marble Floor',
      description: 'Ancient Atlantean marble flooring',
      type: 'floor',
      size: { width: 1, height: 1 },
      variants: 3,
      pixelLabPrompt: 'isometric floor tile, ancient underwater marble, blue-green tint, subtle cracks, pixel art, 32x32',
    },
    {
      id: 'floor_mosaic',
      name: 'Mosaic Floor',
      description: 'Decorative sea creature mosaic',
      type: 'floor',
      size: { width: 1, height: 1 },
      variants: 2,
      pixelLabPrompt: 'isometric floor tile, underwater mosaic pattern, octopus and fish design, ancient greek style, pixel art, 32x32',
    },
    {
      id: 'floor_seaweed',
      name: 'Overgrown Floor',
      description: 'Floor with seaweed growing through cracks',
      type: 'floor',
      size: { width: 1, height: 1 },
      variants: 2,
      pixelLabPrompt: 'isometric floor tile, cracked marble with green seaweed growing through, underwater ruins, pixel art, 32x32',
    },

    // Wall Tiles
    {
      id: 'wall_left',
      name: 'Left Wall',
      description: 'Atlantean wall facing left',
      type: 'wall_left',
      size: { width: 1, height: 2 },
      variants: 2,
      pixelLabPrompt: 'isometric left-facing wall, ancient underwater palace, coral encrusted marble, bioluminescent accents, pixel art, 32x64',
    },
    {
      id: 'wall_right',
      name: 'Right Wall',
      description: 'Atlantean wall facing right',
      type: 'wall_right',
      size: { width: 1, height: 2 },
      variants: 2,
      pixelLabPrompt: 'isometric right-facing wall, ancient underwater palace, seashell decorations, glowing runes, pixel art, 32x64',
    },
    {
      id: 'corner_inner',
      name: 'Inner Corner',
      description: 'Inner wall corner',
      type: 'corner_inner',
      size: { width: 1, height: 2 },
      variants: 1,
      pixelLabPrompt: 'isometric inner corner wall, underwater palace junction, marble with coral, pixel art, 32x64',
    },
    {
      id: 'corner_outer',
      name: 'Outer Corner',
      description: 'Outer wall corner',
      type: 'corner_outer',
      size: { width: 1, height: 2 },
      variants: 1,
      pixelLabPrompt: 'isometric outer corner wall, underwater palace pillar edge, ancient stone, pixel art, 32x64',
    },

    // Portal
    {
      id: 'portal_entrance',
      name: 'Sea Gate',
      description: 'Magical underwater portal',
      type: 'portal',
      size: { width: 2, height: 2 },
      variants: 1,
      pixelLabPrompt: 'isometric magical portal, ancient sea gate, swirling blue water vortex, glowing runes, atlantean architecture, pixel art, 64x64',
    },
  ],

  props: [
    // Architectural Flavor
    {
      id: 'pillar_coral',
      name: 'Coral Pillar',
      description: 'Living coral column',
      type: 'prop',
      size: { width: 1, height: 2 },
      variants: 2,
      pixelLabPrompt: 'isometric coral pillar, bioluminescent pink and blue coral column, underwater palace, pixel art, 32x64',
    },
    {
      id: 'window_porthole',
      name: 'Porthole Window',
      description: 'Circular window with fish swimming past',
      type: 'prop',
      size: { width: 1, height: 1 },
      variants: 2,
      pixelLabPrompt: 'isometric circular porthole window, deep sea view, fish silhouettes, brass frame, pixel art, 32x32',
    },
    {
      id: 'statue_poseidon',
      name: 'Poseidon Statue',
      description: 'Ancient god statue',
      type: 'prop',
      size: { width: 1, height: 2 },
      variants: 1,
      pixelLabPrompt: 'isometric statue of poseidon, weathered underwater stone, holding trident, seaweed draped, pixel art, 32x64',
    },
    {
      id: 'fountain_shell',
      name: 'Shell Fountain',
      description: 'Giant clam shell fountain',
      type: 'prop',
      size: { width: 2, height: 1 },
      variants: 1,
      pixelLabPrompt: 'isometric giant clam shell fountain, pearl inside glowing, water bubbles, ancient atlantis, pixel art, 64x32',
    },

    // Environmental Props
    {
      id: 'treasure_chest',
      name: 'Sunken Treasure',
      description: 'Ancient treasure chest',
      type: 'prop',
      size: { width: 1, height: 1 },
      variants: 2,
      pixelLabPrompt: 'isometric treasure chest, underwater sunken gold, barnacles, open with coins spilling, pixel art, 32x32',
    },
    {
      id: 'kelp_cluster',
      name: 'Kelp Forest',
      description: 'Swaying kelp plants',
      type: 'prop',
      size: { width: 1, height: 1 },
      variants: 3,
      pixelLabPrompt: 'isometric kelp forest cluster, green and brown seaweed, small fish hiding, pixel art, 32x32',
    },
    {
      id: 'amphora',
      name: 'Ancient Amphora',
      description: 'Greek storage vessels',
      type: 'prop',
      size: { width: 1, height: 1 },
      variants: 2,
      pixelLabPrompt: 'isometric ancient greek amphora vases, underwater with barnacles, broken and intact, pixel art, 32x32',
    },
    {
      id: 'crystal_cluster',
      name: 'Sea Crystal',
      description: 'Glowing underwater crystals',
      type: 'prop',
      size: { width: 1, height: 1 },
      variants: 2,
      pixelLabPrompt: 'isometric glowing crystal cluster, aquamarine and teal, bioluminescent, underwater cave, pixel art, 32x32',
    },

    // The Crystal Ball (Global Asset)
    {
      id: 'crystal_ball',
      name: 'Scrying Orb',
      description: 'The central recall engine',
      type: 'prop',
      size: { width: 1, height: 1 },
      variants: 1,
      pixelLabPrompt: 'isometric magical crystal ball on ornate golden stand, swirling mist inside, glowing purple and blue, ancient artifact, pixel art, 48x48',
    },
  ],

  // Default familiar for this theme - Crystal Drake has atlantis affinity
  // Full familiar config is in familiarsConfig.ts
  familiar: {
    id: 'crystal_drake',
    name: 'Crystal Drake',
    description: 'A magnificent drake forged from living amethyst, its crystalline wings catch and scatter light into rainbows of wisdom.',
    animations: {
      idle: 'crystal dragon sitting, purple amethyst scales, golden accents, wings folded, pixel art sprite',
      walk: 'crystal dragon walking, crystalline wings spread, tail swishing, pixel art sprite sheet',
      happy: 'crystal dragon excited, wings flapping, crystals glowing brighter, pixel art sprite',
      sleep: 'crystal dragon curled up, soft purple glow, peaceful, pixel art sprite',
    },
    particleColor: '#e879f9', // Crystal pink/purple
    particleType: 'sparkle',
  },
};

// Autotiling bitmask configuration for Wang tiles
export const AUTOTILE_BITMASK = {
  // 4-bit bitmask: [North, East, South, West]
  ISOLATED: 0b0000,
  NORTH: 0b1000,
  EAST: 0b0100,
  SOUTH: 0b0010,
  WEST: 0b0001,
  NORTH_EAST: 0b1100,
  NORTH_SOUTH: 0b1010,
  NORTH_WEST: 0b1001,
  EAST_SOUTH: 0b0110,
  EAST_WEST: 0b0101,
  SOUTH_WEST: 0b0011,
  NORTH_EAST_SOUTH: 0b1110,
  NORTH_EAST_WEST: 0b1101,
  NORTH_SOUTH_WEST: 0b1011,
  EAST_SOUTH_WEST: 0b0111,
  ALL: 0b1111,
};

// Helper to calculate autotile index from neighbors
export function getAutotileIndex(neighbors: {
  north: boolean;
  east: boolean;
  south: boolean;
  west: boolean;
}): number {
  let index = 0;
  if (neighbors.north) index |= 0b1000;
  if (neighbors.east) index |= 0b0100;
  if (neighbors.south) index |= 0b0010;
  if (neighbors.west) index |= 0b0001;
  return index;
}
