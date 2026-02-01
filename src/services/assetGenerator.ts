// Asset Generator Service - Batch generates themed assets via PixelLab API
import * as FileSystem from 'expo-file-system/legacy';
import { ATLANTIS_THEME, TileDefinition, ThemeConfig } from '../config/atlantisTheme';

const PIXELLAB_API = 'https://api.pixellab.ai/v1';
const PIXELLAB_TOKEN = '6d4a1610-797d-4109-9037-d7f65ce234f7';

interface GenerationJob {
  id: string;
  assetId: string;
  variant: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  localPath?: string;
}

interface AssetManifest {
  themeId: string;
  generatedAt: number;
  assets: {
    [assetId: string]: {
      variants: string[]; // Local file paths
    };
  };
}

class AssetGeneratorService {
  private assetsDir: string;
  private manifestPath: string;

  constructor() {
    this.assetsDir = `${FileSystem.documentDirectory}generated_assets/`;
    this.manifestPath = `${this.assetsDir}manifest.json`;
  }

  async init(): Promise<void> {
    const dirInfo = await FileSystem.getInfoAsync(this.assetsDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(this.assetsDir, { intermediates: true });
    }
  }

  /**
   * Generate a single isometric tile via PixelLab
   */
  async generateIsometricTile(
    description: string,
    size: number = 32,
    tileShape: 'thin' | 'thick' | 'block' = 'thin'
  ): Promise<string> {
    const response = await fetch(`${PIXELLAB_API}/generate-isometric-tile`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PIXELLAB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description,
        size,
        tile_shape: tileShape,
        outline: 'single color',
        shading: 'detailed',
        detail: 'high',
      }),
    });

    if (!response.ok) {
      // Fallback to map object if isometric tile fails
      return this.generateMapObject(description, size, size);
    }

    const data = await response.json();
    return this.pollAndDownload(data.id, 'isometric-tile');
  }

  /**
   * Generate a map object (props, totems, etc.)
   */
  async generateMapObject(
    description: string,
    width: number = 64,
    height: number = 64
  ): Promise<string> {
    const response = await fetch(`${PIXELLAB_API}/generate-map-object`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PIXELLAB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: `${description}, transparent background, game asset`,
        width,
        height,
        view: 'high top-down',
        outline: 'single color',
        shading: 'detailed',
        detail: 'high',
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return this.pollAndDownload(data.id, 'map-object');
  }

  /**
   * Generate a character sprite (for familiars)
   */
  async generateCharacter(
    description: string,
    directions: number = 4,
    size: number = 32
  ): Promise<string> {
    const response = await fetch(`${PIXELLAB_API}/generate-character`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PIXELLAB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description,
        n_directions: directions,
        size,
        proportions: 'chibi',
        outline: 'single color',
        shading: 'detailed',
        detail: 'high',
      }),
    });

    if (!response.ok) {
      // Fallback to map object
      return this.generateMapObject(description, size, size);
    }

    const data = await response.json();
    return this.pollAndDownload(data.id, 'character');
  }

  /**
   * Poll for job completion and download
   */
  private async pollAndDownload(
    jobId: string,
    type: 'isometric-tile' | 'map-object' | 'character',
    maxAttempts: number = 60
  ): Promise<string> {
    const endpoints: Record<string, string> = {
      'isometric-tile': 'get-isometric-tile',
      'map-object': 'get-map-object',
      'character': 'get-character',
    };

    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, 3000));

      const response = await fetch(
        `${PIXELLAB_API}/${endpoints[type]}?id=${jobId}`,
        {
          headers: { 'Authorization': `Bearer ${PIXELLAB_TOKEN}` },
        }
      );

      if (!response.ok) continue;

      const data = await response.json();

      if (data.status === 'completed' && data.download_url) {
        // Download and save locally
        const filename = `${type}_${jobId}.png`;
        const localPath = `${this.assetsDir}${filename}`;

        const downloadResult = await FileSystem.downloadAsync(
          data.download_url,
          localPath
        );

        if (downloadResult.status === 200) {
          return downloadResult.uri;
        }
      }

      if (data.status === 'failed') {
        throw new Error(data.error || 'Generation failed');
      }
    }

    throw new Error('Generation timed out');
  }

  /**
   * Generate all assets for a theme
   */
  async generateThemeAssets(
    theme: ThemeConfig,
    onProgress?: (current: number, total: number, assetName: string) => void
  ): Promise<AssetManifest> {
    await this.init();

    const manifest: AssetManifest = {
      themeId: theme.id,
      generatedAt: Date.now(),
      assets: {},
    };

    const allAssets = [...theme.tiles, ...theme.props];
    let completed = 0;
    const total = allAssets.reduce((sum, asset) => sum + asset.variants, 0);

    for (const asset of allAssets) {
      manifest.assets[asset.id] = { variants: [] };

      for (let v = 0; v < asset.variants; v++) {
        try {
          onProgress?.(completed, total, `${asset.name} (variant ${v + 1})`);

          const prompt = `${asset.pixelLabPrompt}, variant ${v + 1}`;
          let localPath: string;

          if (asset.type === 'floor') {
            localPath = await this.generateIsometricTile(
              prompt,
              asset.size.width * 32,
              'thin'
            );
          } else {
            localPath = await this.generateMapObject(
              prompt,
              asset.size.width * 32,
              asset.size.height * 32
            );
          }

          manifest.assets[asset.id].variants.push(localPath);
          completed++;
        } catch (error) {
          console.error(`Failed to generate ${asset.id} variant ${v}:`, error);
          // Continue with next asset
          completed++;
        }
      }
    }

    // Generate familiar
    try {
      onProgress?.(completed, total + 4, 'Black Dragon Familiar');
      manifest.assets[theme.familiar.id] = { variants: [] };

      for (const [animName, prompt] of Object.entries(theme.familiar.animations)) {
        const localPath = await this.generateCharacter(prompt, 4, 48);
        manifest.assets[theme.familiar.id].variants.push(localPath);
      }
    } catch (error) {
      console.error('Failed to generate familiar:', error);
    }

    // Save manifest
    await FileSystem.writeAsStringAsync(
      this.manifestPath,
      JSON.stringify(manifest, null, 2)
    );

    return manifest;
  }

  /**
   * Load existing manifest
   */
  async loadManifest(): Promise<AssetManifest | null> {
    try {
      const info = await FileSystem.getInfoAsync(this.manifestPath);
      if (!info.exists) return null;

      const content = await FileSystem.readAsStringAsync(this.manifestPath);
      return JSON.parse(content);
    } catch {
      return null;
    }
  }

  /**
   * Check if theme assets are already generated
   */
  async hasThemeAssets(themeId: string): Promise<boolean> {
    const manifest = await this.loadManifest();
    return manifest?.themeId === themeId && Object.keys(manifest.assets).length > 0;
  }

  /**
   * Get asset path by ID
   */
  async getAssetPath(assetId: string, variant: number = 0): Promise<string | null> {
    const manifest = await this.loadManifest();
    if (!manifest?.assets[assetId]) return null;

    const variants = manifest.assets[assetId].variants;
    return variants[variant % variants.length] || null;
  }
}

export const assetGenerator = new AssetGeneratorService();
