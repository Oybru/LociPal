// Deterministic seeded PRNG using Mulberry32 algorithm

export class SeededRandom {
  private state: number;

  constructor(seed: number) {
    this.state = seed | 0;
  }

  /** Returns a float in [0, 1) */
  next(): number {
    this.state |= 0;
    this.state = (this.state + 0x6d2b79f5) | 0;
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Returns an integer in [min, max) */
  intRange(min: number, max: number): number {
    return Math.floor(this.next() * (max - min)) + min;
  }

  /** Pick a random element from an array */
  pick<T>(array: T[]): T {
    return array[this.intRange(0, array.length)];
  }

  /** Fisher-Yates shuffle (returns new array) */
  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.intRange(0, i + 1);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}
