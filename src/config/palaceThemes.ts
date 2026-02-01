// Palace Themes Configuration - Based on Loci Legends concept art
// Four unique memory palace environments with distinct visual styles

export type PalaceThemeId = 'celestial_archive' | 'botanical_palace' | 'clockwork_vault' | 'atlantis';

export interface TileStyle {
  lineColor: string;
  fillColor: string;
  glowColor?: string;
}

export interface PalaceTheme {
  id: PalaceThemeId;
  name: string;
  subtitle: string;
  description: string;
  emoji: string;

  // Color palette
  colors: {
    background: string;       // Main background gradient start
    backgroundEnd: string;    // Background gradient end
    primary: string;          // Main accent color
    secondary: string;        // Secondary accent
    text: string;             // Text color
    textMuted: string;        // Muted text
    glow: string;             // Glow/particle color
  };

  // Tile styling
  tiles: {
    default: TileStyle;
    highlighted: TileStyle;
    path: TileStyle;
    special: TileStyle;
  };

  // Environment decorations
  decorations: {
    emoji: string;
    name: string;
    frequency: number; // 0-1, how often this appears
  }[];

  // Ambient particles
  particles: {
    type: 'star' | 'leaf' | 'gear' | 'bubble' | 'sparkle' | 'rune';
    color: string;
    count: number;
    speed: 'slow' | 'medium' | 'fast';
  };

  // Sound theme (for future audio)
  ambientSound?: string;

  // Unlock requirements
  unlockRequirement?: {
    type: 'memories' | 'reviews' | 'streak' | 'default';
    count?: number;
  };
}

export const PALACE_THEMES: Record<PalaceThemeId, PalaceTheme> = {
  celestial_archive: {
    id: 'celestial_archive',
    name: 'The Celestial Archive',
    subtitle: 'Library Among the Stars',
    description: 'An ancient library floating in the cosmos, where constellations map the paths of knowledge and starlight illuminates forgotten wisdom.',
    emoji: '✨',

    colors: {
      background: '#0a0a1a',
      backgroundEnd: '#1a1a3e',
      primary: '#ffd700',
      secondary: '#4a90d9',
      text: '#ffffff',
      textMuted: '#8888aa',
      glow: '#ffd700',
    },

    tiles: {
      default: {
        lineColor: '#3a3a5e',
        fillColor: 'transparent',
      },
      highlighted: {
        lineColor: '#ffd700',
        fillColor: 'rgba(255, 215, 0, 0.1)',
        glowColor: '#ffd700',
      },
      path: {
        lineColor: '#4a90d9',
        fillColor: 'rgba(74, 144, 217, 0.05)',
      },
      special: {
        lineColor: '#ff6b6b',
        fillColor: 'rgba(255, 107, 107, 0.1)',
        glowColor: '#ff6b6b',
      },
    },

    decorations: [
      { emoji: '📚', name: 'Bookshelf', frequency: 0.15 },
      { emoji: '🔮', name: 'Crystal Orb', frequency: 0.08 },
      { emoji: '⭐', name: 'Star Fragment', frequency: 0.1 },
      { emoji: '🕯️', name: 'Floating Candle', frequency: 0.12 },
      { emoji: '📜', name: 'Ancient Scroll', frequency: 0.1 },
      { emoji: '🌙', name: 'Moon Relic', frequency: 0.05 },
    ],

    particles: {
      type: 'star',
      color: '#ffd700',
      count: 30,
      speed: 'slow',
    },

    ambientSound: 'celestial_hum',

    unlockRequirement: {
      type: 'default',
    },
  },

  botanical_palace: {
    id: 'botanical_palace',
    name: 'The Botanical Mind-Palace',
    subtitle: 'Garden of Living Memories',
    description: 'A verdant greenhouse where memories bloom like flowers, tended by ancient magic. Vines of thought intertwine with crystal structures.',
    emoji: '🌿',

    colors: {
      background: '#0d1a0d',
      backgroundEnd: '#1a2e1a',
      primary: '#4ecdc4',
      secondary: '#a8e6cf',
      text: '#e8f5e9',
      textMuted: '#81c784',
      glow: '#4ecdc4',
    },

    tiles: {
      default: {
        lineColor: '#2e5a2e',
        fillColor: 'transparent',
      },
      highlighted: {
        lineColor: '#4ecdc4',
        fillColor: 'rgba(78, 205, 196, 0.1)',
        glowColor: '#4ecdc4',
      },
      path: {
        lineColor: '#81c784',
        fillColor: 'rgba(129, 199, 132, 0.05)',
      },
      special: {
        lineColor: '#ff9f43',
        fillColor: 'rgba(255, 159, 67, 0.1)',
        glowColor: '#ff9f43',
      },
    },

    decorations: [
      { emoji: '🌳', name: 'Memory Tree', frequency: 0.1 },
      { emoji: '🌸', name: 'Bloom Crystal', frequency: 0.12 },
      { emoji: '🌿', name: 'Thought Fern', frequency: 0.15 },
      { emoji: '🍄', name: 'Wisdom Mushroom', frequency: 0.08 },
      { emoji: '🦋', name: 'Memory Butterfly', frequency: 0.06 },
      { emoji: '💎', name: 'Nature Crystal', frequency: 0.05 },
    ],

    particles: {
      type: 'leaf',
      color: '#a8e6cf',
      count: 25,
      speed: 'medium',
    },

    ambientSound: 'forest_ambience',

    unlockRequirement: {
      type: 'memories',
      count: 10,
    },
  },

  clockwork_vault: {
    id: 'clockwork_vault',
    name: 'The Clockwork Vault',
    subtitle: 'Engine of Recollection',
    description: 'A magnificent steampunk mechanism where memories are stored in brass gears and copper pipes. Time itself bends to preserve knowledge.',
    emoji: '⚙️',

    colors: {
      background: '#1a1410',
      backgroundEnd: '#2d2520',
      primary: '#cd7f32',
      secondary: '#b8860b',
      text: '#f5deb3',
      textMuted: '#d2b48c',
      glow: '#ffa500',
    },

    tiles: {
      default: {
        lineColor: '#5a4a3a',
        fillColor: 'transparent',
      },
      highlighted: {
        lineColor: '#cd7f32',
        fillColor: 'rgba(205, 127, 50, 0.1)',
        glowColor: '#ffa500',
      },
      path: {
        lineColor: '#8b7355',
        fillColor: 'rgba(139, 115, 85, 0.05)',
      },
      special: {
        lineColor: '#00ced1',
        fillColor: 'rgba(0, 206, 209, 0.1)',
        glowColor: '#00ced1',
      },
    },

    decorations: [
      { emoji: '⚙️', name: 'Brass Gear', frequency: 0.15 },
      { emoji: '🔧', name: 'Memory Wrench', frequency: 0.08 },
      { emoji: '💡', name: 'Edison Lamp', frequency: 0.1 },
      { emoji: '⏰', name: 'Time Keeper', frequency: 0.06 },
      { emoji: '🔩', name: 'Copper Bolt', frequency: 0.12 },
      { emoji: '📡', name: 'Aether Antenna', frequency: 0.05 },
    ],

    particles: {
      type: 'gear',
      color: '#cd7f32',
      count: 20,
      speed: 'slow',
    },

    ambientSound: 'clockwork_ticking',

    unlockRequirement: {
      type: 'reviews',
      count: 50,
    },
  },

  atlantis: {
    id: 'atlantis',
    name: 'The Underwater Sanctuary',
    subtitle: 'Depths of the Mind',
    description: 'A sunken palace beneath crystalline waters, where memories drift like luminescent fish and ancient secrets rest in coral halls.',
    emoji: '🌊',

    colors: {
      background: '#0a1628',
      backgroundEnd: '#1a2a4a',
      primary: '#4ecdc4',
      secondary: '#00b4d8',
      text: '#e0f7fa',
      textMuted: '#80deea',
      glow: '#00ffff',
    },

    tiles: {
      default: {
        lineColor: '#2a4a6a',
        fillColor: 'transparent',
      },
      highlighted: {
        lineColor: '#4ecdc4',
        fillColor: 'rgba(78, 205, 196, 0.15)',
        glowColor: '#00ffff',
      },
      path: {
        lineColor: '#00b4d8',
        fillColor: 'rgba(0, 180, 216, 0.05)',
      },
      special: {
        lineColor: '#ff6b9d',
        fillColor: 'rgba(255, 107, 157, 0.1)',
        glowColor: '#ff6b9d',
      },
    },

    decorations: [
      { emoji: '🐚', name: 'Memory Shell', frequency: 0.12 },
      { emoji: '🪸', name: 'Coral Pillar', frequency: 0.1 },
      { emoji: '🐠', name: 'Thought Fish', frequency: 0.08 },
      { emoji: '💎', name: 'Sea Crystal', frequency: 0.06 },
      { emoji: '⚓', name: 'Ancient Anchor', frequency: 0.05 },
      { emoji: '🔱', name: 'Trident Relic', frequency: 0.04 },
    ],

    particles: {
      type: 'bubble',
      color: '#00ffff',
      count: 35,
      speed: 'medium',
    },

    ambientSound: 'underwater_ambience',

    unlockRequirement: {
      type: 'streak',
      count: 7,
    },
  },
};

// Default theme for new users
export const DEFAULT_THEME: PalaceThemeId = 'celestial_archive';

// Get theme by ID with fallback
export function getTheme(id: string): PalaceTheme {
  return PALACE_THEMES[id as PalaceThemeId] || PALACE_THEMES[DEFAULT_THEME];
}

// Get all themes as array
export function getAllThemes(): PalaceTheme[] {
  return Object.values(PALACE_THEMES);
}

// Check if a theme is unlocked based on user stats
export function isThemeUnlocked(
  themeId: PalaceThemeId,
  userStats: { memories: number; reviews: number; streak: number }
): boolean {
  const theme = PALACE_THEMES[themeId];
  if (!theme.unlockRequirement || theme.unlockRequirement.type === 'default') {
    return true;
  }

  const { type, count = 0 } = theme.unlockRequirement;

  switch (type) {
    case 'memories':
      return userStats.memories >= count;
    case 'reviews':
      return userStats.reviews >= count;
    case 'streak':
      return userStats.streak >= count;
    default:
      return true;
  }
}

// Get unlock progress for a theme
export function getUnlockProgress(
  themeId: PalaceThemeId,
  userStats: { memories: number; reviews: number; streak: number }
): { current: number; required: number; percentage: number } {
  const theme = PALACE_THEMES[themeId];
  if (!theme.unlockRequirement || theme.unlockRequirement.type === 'default') {
    return { current: 1, required: 1, percentage: 100 };
  }

  const { type, count = 0 } = theme.unlockRequirement;
  let current = 0;

  switch (type) {
    case 'memories':
      current = userStats.memories;
      break;
    case 'reviews':
      current = userStats.reviews;
      break;
    case 'streak':
      current = userStats.streak;
      break;
  }

  return {
    current,
    required: count,
    percentage: Math.min(100, Math.round((current / count) * 100)),
  };
}
