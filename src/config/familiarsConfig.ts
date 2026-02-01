// Familiars Configuration - Based on LociPal concept art
// Wizard's Familiars: Aether-Wisp, Crystal Drake, Celestial Owl, Rune-Golem

export type FamiliarType = 'aether_wisp' | 'crystal_drake' | 'celestial_owl' | 'rune_golem';

export interface FamiliarConfig {
  id: FamiliarType;
  name: string;
  title: string; // Display title
  description: string;
  emoji: string; // Fallback until sprites are added
  colors: {
    primary: string;
    secondary: string;
    glow: string;
    particle: string;
  };
  particleType: 'sparkle' | 'smoke' | 'bubble' | 'flame' | 'rune';
  animations: {
    idle: string;
    walk: string;
    happy: string;
    sleep: string;
  };
  unlockRequirement?: string; // How to unlock this familiar
  themeAffinity?: string[]; // Which themes this familiar prefers
}

export const FAMILIARS: Record<FamiliarType, FamiliarConfig> = {
  aether_wisp: {
    id: 'aether_wisp',
    name: 'Aether-Wisp',
    title: 'Spirit of Memory',
    description: 'A swirling essence of pure thought, the Aether-Wisp drifts through the corridors of the mind, leaving trails of starlight.',
    emoji: '✨',
    colors: {
      primary: '#00d4ff',
      secondary: '#8b5cf6',
      glow: '#00d4ff',
      particle: '#00ffff',
    },
    particleType: 'sparkle',
    animations: {
      idle: 'ethereal wisp floating, swirling blue and purple energy, glowing core, pixel art sprite',
      walk: 'wisp gliding forward, trailing stardust, energy tendrils flowing, pixel art sprite sheet',
      happy: 'wisp spinning excitedly, burst of sparkles, bright glow, pixel art sprite',
      sleep: 'wisp dimmed, gently pulsing, peaceful hover, pixel art sprite',
    },
    themeAffinity: ['celestial_archive', 'atlantis'],
  },

  crystal_drake: {
    id: 'crystal_drake',
    name: 'Crystal Drake',
    title: 'Guardian of Knowledge',
    description: 'A magnificent drake forged from living amethyst, its crystalline wings catch and scatter light into rainbows of wisdom.',
    emoji: '🐉',
    colors: {
      primary: '#a855f7',
      secondary: '#fbbf24',
      glow: '#c084fc',
      particle: '#e879f9',
    },
    particleType: 'sparkle',
    animations: {
      idle: 'crystal dragon sitting, purple amethyst scales, golden accents, wings folded, pixel art sprite',
      walk: 'crystal dragon walking, crystalline wings spread, tail swishing, pixel art sprite sheet',
      happy: 'crystal dragon excited, wings flapping, crystals glowing brighter, pixel art sprite',
      sleep: 'crystal dragon curled up, soft purple glow, peaceful, pixel art sprite',
    },
    themeAffinity: ['clockwork_vault', 'atlantis'],
  },

  celestial_owl: {
    id: 'celestial_owl',
    name: 'Celestial Owl',
    title: 'Keeper of Stars',
    description: 'An ancient owl whose feathers hold the map of constellations, guiding seekers through the night of forgetting.',
    emoji: '🦉',
    colors: {
      primary: '#1e3a5f',
      secondary: '#ffd700',
      glow: '#60a5fa',
      particle: '#fbbf24',
    },
    particleType: 'sparkle',
    animations: {
      idle: 'celestial owl perched, starry feathers, constellation patterns, wise eyes, pixel art sprite',
      walk: 'celestial owl hopping, feathers ruffling, star trail, pixel art sprite sheet',
      happy: 'celestial owl wings spread, hooting, stars twinkling in feathers, pixel art sprite',
      sleep: 'celestial owl eyes closed, feathers dimmed, peaceful on branch, pixel art sprite',
    },
    themeAffinity: ['celestial_archive', 'botanical'],
  },

  rune_golem: {
    id: 'rune_golem',
    name: 'Rune-Golem',
    title: 'Sentinel of Secrets',
    description: 'A construct of ancient stone and glowing runes, the Rune-Golem stands eternal watch over precious memories.',
    emoji: '🤖',
    colors: {
      primary: '#4b5563',
      secondary: '#06b6d4',
      glow: '#22d3ee',
      particle: '#0ea5e9',
    },
    particleType: 'rune',
    animations: {
      idle: 'stone golem standing, glowing blue runes, purple gem core, sturdy pose, pixel art sprite',
      walk: 'stone golem walking, heavy steps, runes pulsing, pixel art sprite sheet',
      happy: 'stone golem arms raised, runes glowing bright, happy stance, pixel art sprite',
      sleep: 'stone golem kneeling, runes dimmed, dormant mode, pixel art sprite',
    },
    themeAffinity: ['clockwork_vault', 'celestial_archive'],
  },
};

// Default familiar for new users
export const DEFAULT_FAMILIAR: FamiliarType = 'aether_wisp';

// Get familiar by ID with fallback
export function getFamiliar(id: string): FamiliarConfig {
  return FAMILIARS[id as FamiliarType] || FAMILIARS[DEFAULT_FAMILIAR];
}

// Get all familiars as array
export function getAllFamiliars(): FamiliarConfig[] {
  return Object.values(FAMILIARS);
}
