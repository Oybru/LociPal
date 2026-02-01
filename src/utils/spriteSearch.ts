// Sprite Search Utility - Fuzzy matching for totem suggestions
// Always returns suggestions, even with no match - uses relevance scoring

import { SPRITE_REGISTRY, SpriteAsset, SpriteCategory } from '../config/assetRegistry';

export interface SearchResult {
  sprite: SpriteAsset;
  score: number; // 0-100, higher is better match
  matchedOn: 'name' | 'tag' | 'category' | 'popular' | 'random';
}

// Popular sprites to show when no query or no matches — curated mix across categories
const POPULAR_SPRITE_IDS = [
  // Items with PNGs (shown first with images)
  'crystal_ball', 'golden_key', 'potion', 'spellbook', 'chest',
  'lantern', 'amethyst', 'hourglass', 'compass', 'skull',
  // Distinctive items across categories
  'wand', 'crown_royal', 'telescope', 'diamond', 'rose',
  'wolf', 'enchanted_sword', 'trophy', 'anchor', 'lightning_bolt',
];

/**
 * Search sprites by query with fuzzy matching
 * Always returns results - falls back to popular/random items
 */
export function searchSprites(
  query: string,
  maxResults: number = 12,
  categoryFilter?: SpriteCategory
): SearchResult[] {
  const normalizedQuery = query.toLowerCase().trim();

  // Filter by category if provided
  let candidates = categoryFilter
    ? SPRITE_REGISTRY.filter(s => s.category === categoryFilter)
    : SPRITE_REGISTRY;

  // If no query, return popular items
  if (!normalizedQuery) {
    return getPopularSprites(candidates, maxResults);
  }

  // Score all sprites
  const scored: SearchResult[] = candidates.map(sprite => {
    const result = calculateMatchScore(sprite, normalizedQuery);
    return {
      sprite,
      score: result.score,
      matchedOn: result.matchedOn,
    };
  });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // If top results have very low scores, mix in popular items
  const topResults = scored.slice(0, maxResults);
  const hasGoodMatches = topResults.some(r => r.score >= 30);

  if (!hasGoodMatches) {
    // Mix scored results with popular items
    const popular = getPopularSprites(candidates, Math.ceil(maxResults / 2));
    const combined = [...topResults.slice(0, Math.floor(maxResults / 2)), ...popular];

    // Dedupe
    const seen = new Set<string>();
    return combined.filter(r => {
      if (seen.has(r.sprite.id)) return false;
      seen.add(r.sprite.id);
      return true;
    }).slice(0, maxResults);
  }

  return topResults;
}

/**
 * Calculate match score for a sprite against a query
 */
function calculateMatchScore(
  sprite: SpriteAsset,
  query: string
): { score: number; matchedOn: SearchResult['matchedOn'] } {
  let bestScore = 0;
  let matchedOn: SearchResult['matchedOn'] = 'random';

  // Exact name match (100 points)
  if (sprite.name.toLowerCase() === query) {
    return { score: 100, matchedOn: 'name' };
  }

  // Name starts with query (90 points)
  if (sprite.name.toLowerCase().startsWith(query)) {
    bestScore = 90;
    matchedOn = 'name';
  }

  // Name contains query (70 points)
  if (sprite.name.toLowerCase().includes(query) && bestScore < 70) {
    bestScore = 70;
    matchedOn = 'name';
  }

  // Check tags
  for (const tag of sprite.tags) {
    // Exact tag match (85 points)
    if (tag === query) {
      if (bestScore < 85) {
        bestScore = 85;
        matchedOn = 'tag';
      }
    }
    // Tag starts with query (75 points)
    else if (tag.startsWith(query)) {
      if (bestScore < 75) {
        bestScore = 75;
        matchedOn = 'tag';
      }
    }
    // Tag contains query (55 points)
    else if (tag.includes(query)) {
      if (bestScore < 55) {
        bestScore = 55;
        matchedOn = 'tag';
      }
    }
    // Query contains tag (partial word match, 40 points)
    else if (query.includes(tag) && tag.length >= 3) {
      if (bestScore < 40) {
        bestScore = 40;
        matchedOn = 'tag';
      }
    }
  }

  // Fuzzy character matching (for typos)
  const fuzzyScore = calculateFuzzyScore(sprite.name.toLowerCase(), query);
  if (fuzzyScore > bestScore) {
    bestScore = fuzzyScore;
    matchedOn = 'name';
  }

  // Also fuzzy match against first few tags
  for (const tag of sprite.tags.slice(0, 5)) {
    const tagFuzzy = calculateFuzzyScore(tag, query);
    if (tagFuzzy > bestScore) {
      bestScore = tagFuzzy;
      matchedOn = 'tag';
    }
  }

  return { score: bestScore, matchedOn };
}

/**
 * Calculate fuzzy matching score using Levenshtein-like approach
 * Returns 0-60 score based on similarity
 */
function calculateFuzzyScore(text: string, query: string): number {
  if (text.length < 2 || query.length < 2) return 0;

  // Count matching characters in order
  let matchCount = 0;
  let textIndex = 0;

  for (const char of query) {
    const foundIndex = text.indexOf(char, textIndex);
    if (foundIndex !== -1) {
      matchCount++;
      textIndex = foundIndex + 1;
    }
  }

  const matchRatio = matchCount / query.length;

  // Need at least 60% of characters to match in order
  if (matchRatio < 0.6) return 0;

  // Score based on match ratio and length similarity
  const lengthRatio = Math.min(text.length, query.length) / Math.max(text.length, query.length);

  return Math.floor(matchRatio * lengthRatio * 50);
}

/**
 * Get popular sprites (used as fallback)
 */
function getPopularSprites(
  candidates: SpriteAsset[],
  count: number
): SearchResult[] {
  const popular: SearchResult[] = [];

  // First add popular sprites that are in candidates
  for (const id of POPULAR_SPRITE_IDS) {
    const sprite = candidates.find(s => s.id === id);
    if (sprite && popular.length < count) {
      popular.push({ sprite, score: 50, matchedOn: 'popular' });
    }
  }

  // Fill remaining with random from candidates
  const remaining = candidates.filter(s => !POPULAR_SPRITE_IDS.includes(s.id));
  const shuffled = shuffleArray([...remaining]);

  for (const sprite of shuffled) {
    if (popular.length >= count) break;
    popular.push({ sprite, score: 25, matchedOn: 'random' });
  }

  return popular;
}

/**
 * Get sprite suggestions for a specific concept/memory
 * Uses semantic matching to find related sprites
 */
export function getSuggestionsForConcept(concept: string, count: number = 8): SearchResult[] {
  // Split concept into words and search for each
  const words = concept.toLowerCase().split(/\s+/).filter(w => w.length >= 2);

  if (words.length === 0) {
    return getPopularSprites(SPRITE_REGISTRY, count);
  }

  // Collect and score all matching sprites
  const allResults = new Map<string, SearchResult>();

  for (const word of words) {
    const results = searchSprites(word, count);
    for (const result of results) {
      const existing = allResults.get(result.sprite.id);
      if (!existing || result.score > existing.score) {
        allResults.set(result.sprite.id, result);
      }
    }
  }

  // Sort by score and return top results
  const sorted = Array.from(allResults.values()).sort((a, b) => b.score - a.score);
  return sorted.slice(0, count);
}

/**
 * Get sprites grouped by category with search applied
 */
export function searchByCategory(
  query: string
): Record<SpriteCategory, SearchResult[]> {
  const categories: SpriteCategory[] = ['common', 'nature', 'fantasy', 'knowledge', 'treasures', 'misc'];

  const result: Record<SpriteCategory, SearchResult[]> = {} as any;

  for (const category of categories) {
    result[category] = searchSprites(query, 10, category);
  }

  return result;
}

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
