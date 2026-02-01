// Sprite metadata index — combines all category data into a single registry
import { COMMON_SPRITES } from './commonSprites';
import { NATURE_SPRITES } from './natureSprites';
import { FANTASY_SPRITES } from './fantasySprites';
import { KNOWLEDGE_SPRITES } from './knowledgeSprites';
import { TREASURE_SPRITES } from './treasureSprites';
import { MISC_SPRITES } from './miscSprites';
import { IMAGINARY_SPRITES } from './imaginarySprites';

export type SpriteCategory = 'common' | 'nature' | 'fantasy' | 'knowledge' | 'treasures' | 'misc' | 'imaginary';

export interface SpriteMetadataEntry {
  id: string;
  name: string;
  category: string;
  tags: string[];
  emoji: string;
}

// All sprite metadata combined — 510 items across 7 categories
export const SPRITE_METADATA: SpriteMetadataEntry[] = [
  ...COMMON_SPRITES,
  ...NATURE_SPRITES,
  ...FANTASY_SPRITES,
  ...KNOWLEDGE_SPRITES,
  ...TREASURE_SPRITES,
  ...MISC_SPRITES,
  ...IMAGINARY_SPRITES,
];
