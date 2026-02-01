// People Sprites Configuration - Premade character sprites for memory totems
// These are 48x48 pixel sprite sheets with multiple animations

export interface PeopleSprite {
  id: string;
  name: string;
  description: string;
  // Path to the full spritesheet
  spritesheetPath: string;
  // Frame position for idle pose (front-facing, first frame)
  idleFrame: {
    x: number; // Column (0-based)
    y: number; // Row (0-based)
  };
  // Sprite dimensions
  frameWidth: number;
  frameHeight: number;
  // Tags for search
  tags: string[];
}

// Spritesheet layout reference:
// Row 0: Standing poses (4 directions: down, left, right, up)
// Row 1: Idle animation
// Row 2: Walk animation
// For totems, we use Row 0, Col 0 (front-facing idle)

const SPRITE_BASE_PATH = '../../assets/palaces/2_Characters/Character_Generator/0_Premade_Characters/48x48';

export const PEOPLE_SPRITES: PeopleSprite[] = [
  {
    id: 'person_01',
    name: 'Student',
    description: 'A casual student with brown hair',
    spritesheetPath: `${SPRITE_BASE_PATH}/Premade_Character_48x48_01.png`,
    idleFrame: { x: 0, y: 0 },
    frameWidth: 48,
    frameHeight: 48,
    tags: ['student', 'casual', 'young', 'person', 'human', 'brown hair', 'school'],
  },
  {
    id: 'person_02',
    name: 'Professional',
    description: 'A well-dressed professional',
    spritesheetPath: `${SPRITE_BASE_PATH}/Premade_Character_48x48_02.png`,
    idleFrame: { x: 0, y: 0 },
    frameWidth: 48,
    frameHeight: 48,
    tags: ['professional', 'business', 'adult', 'person', 'human', 'office', 'worker'],
  },
  {
    id: 'person_03',
    name: 'Artist',
    description: 'A creative artistic type',
    spritesheetPath: `${SPRITE_BASE_PATH}/Premade_Character_48x48_03.png`,
    idleFrame: { x: 0, y: 0 },
    frameWidth: 48,
    frameHeight: 48,
    tags: ['artist', 'creative', 'person', 'human', 'colorful', 'painter'],
  },
  {
    id: 'person_04',
    name: 'Athlete',
    description: 'A sporty athletic person',
    spritesheetPath: `${SPRITE_BASE_PATH}/Premade_Character_48x48_04.png`,
    idleFrame: { x: 0, y: 0 },
    frameWidth: 48,
    frameHeight: 48,
    tags: ['athlete', 'sports', 'fitness', 'person', 'human', 'active', 'runner'],
  },
  {
    id: 'person_05',
    name: 'Scholar',
    description: 'A studious bookworm',
    spritesheetPath: `${SPRITE_BASE_PATH}/Premade_Character_48x48_05.png`,
    idleFrame: { x: 0, y: 0 },
    frameWidth: 48,
    frameHeight: 48,
    tags: ['scholar', 'smart', 'glasses', 'person', 'human', 'intelligent', 'nerd'],
  },
  {
    id: 'person_06',
    name: 'Musician',
    description: 'A melodic music lover',
    spritesheetPath: `${SPRITE_BASE_PATH}/Premade_Character_48x48_06.png`,
    idleFrame: { x: 0, y: 0 },
    frameWidth: 48,
    frameHeight: 48,
    tags: ['musician', 'music', 'artist', 'person', 'human', 'singer', 'band'],
  },
  {
    id: 'person_07',
    name: 'Chef',
    description: 'A culinary expert',
    spritesheetPath: `${SPRITE_BASE_PATH}/Premade_Character_48x48_07.png`,
    idleFrame: { x: 0, y: 0 },
    frameWidth: 48,
    frameHeight: 48,
    tags: ['chef', 'cook', 'food', 'person', 'human', 'kitchen', 'restaurant'],
  },
  {
    id: 'person_08',
    name: 'Doctor',
    description: 'A medical professional',
    spritesheetPath: `${SPRITE_BASE_PATH}/Premade_Character_48x48_08.png`,
    idleFrame: { x: 0, y: 0 },
    frameWidth: 48,
    frameHeight: 48,
    tags: ['doctor', 'medical', 'health', 'person', 'human', 'nurse', 'hospital'],
  },
  {
    id: 'person_09',
    name: 'Engineer',
    description: 'A technical problem solver',
    spritesheetPath: `${SPRITE_BASE_PATH}/Premade_Character_48x48_09.png`,
    idleFrame: { x: 0, y: 0 },
    frameWidth: 48,
    frameHeight: 48,
    tags: ['engineer', 'tech', 'builder', 'person', 'human', 'developer', 'programmer'],
  },
  {
    id: 'person_10',
    name: 'Teacher',
    description: 'An educator and mentor',
    spritesheetPath: `${SPRITE_BASE_PATH}/Premade_Character_48x48_10.png`,
    idleFrame: { x: 0, y: 0 },
    frameWidth: 48,
    frameHeight: 48,
    tags: ['teacher', 'educator', 'mentor', 'person', 'human', 'professor', 'instructor'],
  },
  {
    id: 'person_11',
    name: 'Traveler',
    description: 'An adventurous explorer',
    spritesheetPath: `${SPRITE_BASE_PATH}/Premade_Character_48x48_11.png`,
    idleFrame: { x: 0, y: 0 },
    frameWidth: 48,
    frameHeight: 48,
    tags: ['traveler', 'explorer', 'adventure', 'person', 'human', 'tourist', 'backpacker'],
  },
  {
    id: 'person_12',
    name: 'Gardener',
    description: 'A nature lover',
    spritesheetPath: `${SPRITE_BASE_PATH}/Premade_Character_48x48_12.png`,
    idleFrame: { x: 0, y: 0 },
    frameWidth: 48,
    frameHeight: 48,
    tags: ['gardener', 'nature', 'plants', 'person', 'human', 'farmer', 'green'],
  },
  {
    id: 'person_13',
    name: 'Writer',
    description: 'A creative wordsmith',
    spritesheetPath: `${SPRITE_BASE_PATH}/Premade_Character_48x48_13.png`,
    idleFrame: { x: 0, y: 0 },
    frameWidth: 48,
    frameHeight: 48,
    tags: ['writer', 'author', 'creative', 'person', 'human', 'journalist', 'poet'],
  },
  {
    id: 'person_14',
    name: 'Scientist',
    description: 'A curious researcher',
    spritesheetPath: `${SPRITE_BASE_PATH}/Premade_Character_48x48_14.png`,
    idleFrame: { x: 0, y: 0 },
    frameWidth: 48,
    frameHeight: 48,
    tags: ['scientist', 'research', 'lab', 'person', 'human', 'experiment', 'discovery'],
  },
  {
    id: 'person_15',
    name: 'Photographer',
    description: 'A visual storyteller',
    spritesheetPath: `${SPRITE_BASE_PATH}/Premade_Character_48x48_15.png`,
    idleFrame: { x: 0, y: 0 },
    frameWidth: 48,
    frameHeight: 48,
    tags: ['photographer', 'camera', 'visual', 'person', 'human', 'artist', 'capture'],
  },
  {
    id: 'person_16',
    name: 'Dancer',
    description: 'A graceful performer',
    spritesheetPath: `${SPRITE_BASE_PATH}/Premade_Character_48x48_16.png`,
    idleFrame: { x: 0, y: 0 },
    frameWidth: 48,
    frameHeight: 48,
    tags: ['dancer', 'performer', 'grace', 'person', 'human', 'ballet', 'movement'],
  },
  {
    id: 'person_17',
    name: 'Pilot',
    description: 'A sky navigator',
    spritesheetPath: `${SPRITE_BASE_PATH}/Premade_Character_48x48_17.png`,
    idleFrame: { x: 0, y: 0 },
    frameWidth: 48,
    frameHeight: 48,
    tags: ['pilot', 'aviation', 'flight', 'person', 'human', 'captain', 'airplane'],
  },
  {
    id: 'person_18',
    name: 'Detective',
    description: 'A mystery solver',
    spritesheetPath: `${SPRITE_BASE_PATH}/Premade_Character_48x48_18.png`,
    idleFrame: { x: 0, y: 0 },
    frameWidth: 48,
    frameHeight: 48,
    tags: ['detective', 'mystery', 'investigator', 'person', 'human', 'sleuth', 'clue'],
  },
  {
    id: 'person_19',
    name: 'Librarian',
    description: 'A keeper of knowledge',
    spritesheetPath: `${SPRITE_BASE_PATH}/Premade_Character_48x48_19.png`,
    idleFrame: { x: 0, y: 0 },
    frameWidth: 48,
    frameHeight: 48,
    tags: ['librarian', 'books', 'knowledge', 'person', 'human', 'quiet', 'reading'],
  },
  {
    id: 'person_20',
    name: 'Volunteer',
    description: 'A helpful community member',
    spritesheetPath: `${SPRITE_BASE_PATH}/Premade_Character_48x48_20.png`,
    idleFrame: { x: 0, y: 0 },
    frameWidth: 48,
    frameHeight: 48,
    tags: ['volunteer', 'helper', 'community', 'person', 'human', 'kind', 'service'],
  },
];

// Get sprite by ID
export function getPeopleSprite(id: string): PeopleSprite | undefined {
  return PEOPLE_SPRITES.find(sprite => sprite.id === id);
}

// Search people sprites by name or tags
export function searchPeopleSprites(query: string): PeopleSprite[] {
  const lowerQuery = query.toLowerCase();
  return PEOPLE_SPRITES.filter(sprite =>
    sprite.name.toLowerCase().includes(lowerQuery) ||
    sprite.tags.some(tag => tag.includes(lowerQuery))
  );
}
