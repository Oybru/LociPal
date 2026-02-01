// Asset Loader Service - Placeholder for future asset loading
// Will be expanded to load LimeZu pixel art assets

import { PalaceTheme } from '../types';
import { THEME_ASSETS, ThemeAssetConfig } from '../config/assetConfig';

class AssetLoaderClass {
  /**
   * Get theme configuration
   */
  getThemeConfig(theme: PalaceTheme): ThemeAssetConfig {
    return THEME_ASSETS[theme];
  }

  /**
   * Get floor and wall colors for a theme
   */
  getThemeColors(theme: PalaceTheme): { floor: string; wall: string } {
    const config = THEME_ASSETS[theme];
    return {
      floor: config.floorColor,
      wall: config.wallColor,
    };
  }

  /**
   * Get all available themes with their configs
   */
  getAllThemes(): ThemeAssetConfig[] {
    return Object.values(THEME_ASSETS);
  }

  /**
   * Placeholder for preloading - will be implemented with actual assets
   */
  async preloadAllThemes(): Promise<void> {
    // No-op for now - assets will be loaded on demand
  }
}

export const AssetLoader = new AssetLoaderClass();
