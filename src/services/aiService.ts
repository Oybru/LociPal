// AI Service for pixel art generation using PixelLab API
import * as FileSystem from 'expo-file-system/legacy';

const PIXELLAB_API = 'https://api.pixellab.ai/v1';
const PIXELLAB_TOKEN = '6d4a1610-797d-4109-9037-d7f65ce234f7';

interface MapObjectResponse {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  download_url?: string;
  error?: string;
}

class AIServiceClass {
  private totemDirectoryPath: string;

  constructor() {
    this.totemDirectoryPath = `${FileSystem.documentDirectory}totems/`;
  }

  async init(): Promise<void> {
    const dirInfo = await FileSystem.getInfoAsync(this.totemDirectoryPath);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(this.totemDirectoryPath, { intermediates: true });
    }
  }

  /**
   * Generate pixel art from a text prompt using PixelLab API
   */
  async generatePixelArt(prompt: string): Promise<string> {
    await this.init();

    try {
      // Create map object request
      const jobId = await this.createMapObject(prompt);

      // Poll for completion
      const result = await this.pollForCompletion(jobId);

      if (result.download_url) {
        // Download and save the image locally
        const localUri = await this.downloadAndSaveImage(result.download_url, jobId);
        return localUri;
      }

      throw new Error('No download URL received');
    } catch (error) {
      console.error('PixelLab generation failed, using placeholder:', error);
      // Fallback to placeholder if API fails
      return this.createPlaceholderDataUri(prompt);
    }
  }

  /**
   * Create a map object via PixelLab API
   */
  private async createMapObject(description: string): Promise<string> {
    const response = await fetch(`${PIXELLAB_API}/create-map-object`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PIXELLAB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: `${description}, pixel art style, game asset, transparent background`,
        width: 64,
        height: 64,
        view: 'high top-down',
        outline: 'single color',
        shading: 'basic',
        detail: 'medium',
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.id;
  }

  /**
   * Poll for job completion
   */
  private async pollForCompletion(jobId: string, maxAttempts = 60): Promise<MapObjectResponse> {
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds

      const response = await fetch(`${PIXELLAB_API}/get-map-object?id=${jobId}`, {
        headers: {
          'Authorization': `Bearer ${PIXELLAB_TOKEN}`,
        },
      });

      if (!response.ok) {
        continue;
      }

      const data: MapObjectResponse = await response.json();

      if (data.status === 'completed' && data.download_url) {
        return data;
      }

      if (data.status === 'failed') {
        throw new Error(data.error || 'Generation failed');
      }
    }

    throw new Error('Generation timed out');
  }

  /**
   * Download image and save locally
   */
  private async downloadAndSaveImage(url: string, jobId: string): Promise<string> {
    const filename = `totem_${jobId}.png`;
    const localPath = `${FileSystem.documentDirectory}totems/${filename}`;

    // Ensure directory exists
    const dirInfo = await FileSystem.getInfoAsync(`${FileSystem.documentDirectory}totems`);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}totems`, { intermediates: true });
    }

    // Download the file
    const downloadResult = await FileSystem.downloadAsync(url, localPath);

    if (downloadResult.status === 200) {
      return downloadResult.uri;
    }

    throw new Error('Failed to download image');
  }

  /**
   * Fallback placeholder SVG
   */
  private createPlaceholderDataUri(prompt: string): string {
    const hash = this.hashString(prompt);
    const colors = ['#e94560', '#533483', '#16213e', '#ff6b6b', '#4ecdc4', '#45b7d1'];
    const color1 = colors[hash % colors.length];
    const color2 = colors[(hash + 3) % colors.length];
    const color3 = colors[(hash + 5) % colors.length];

    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 16 16">
        <rect width="16" height="16" fill="${color1}"/>
        <rect x="4" y="2" width="8" height="4" fill="${color2}"/>
        <rect x="3" y="6" width="10" height="6" fill="${color2}"/>
        <rect x="5" y="12" width="2" height="2" fill="${color3}"/>
        <rect x="9" y="12" width="2" height="2" fill="${color3}"/>
        <rect x="5" y="4" width="2" height="2" fill="#fff"/>
        <rect x="9" y="4" width="2" height="2" fill="#fff"/>
        <rect x="6" y="5" width="1" height="1" fill="#000"/>
        <rect x="10" y="5" width="1" height="1" fill="#000"/>
      </svg>
    `;

    const base64 = this.btoa(svgContent);
    return `data:image/svg+xml;base64,${base64}`;
  }

  private btoa(str: string): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let output = '';
    for (let i = 0; i < str.length; i += 3) {
      const byte1 = str.charCodeAt(i);
      const byte2 = i + 1 < str.length ? str.charCodeAt(i + 1) : 0;
      const byte3 = i + 2 < str.length ? str.charCodeAt(i + 2) : 0;

      const enc1 = byte1 >> 2;
      const enc2 = ((byte1 & 3) << 4) | (byte2 >> 4);
      const enc3 = ((byte2 & 15) << 2) | (byte3 >> 6);
      const enc4 = byte3 & 63;

      if (i + 1 >= str.length) {
        output += chars.charAt(enc1) + chars.charAt(enc2) + '==';
      } else if (i + 2 >= str.length) {
        output += chars.charAt(enc1) + chars.charAt(enc2) + chars.charAt(enc3) + '=';
      } else {
        output += chars.charAt(enc1) + chars.charAt(enc2) + chars.charAt(enc3) + chars.charAt(enc4);
      }
    }
    return output;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  async getStorageStats(): Promise<{ count: number; sizeBytes: number }> {
    await this.init();
    try {
      const contents = await FileSystem.readDirectoryAsync(this.totemDirectoryPath);
      let totalSize = 0;
      for (const filename of contents) {
        const info = await FileSystem.getInfoAsync(`${this.totemDirectoryPath}${filename}`);
        if (info.exists && info.size) {
          totalSize += info.size;
        }
      }
      return { count: contents.length, sizeBytes: totalSize };
    } catch {
      return { count: 0, sizeBytes: 0 };
    }
  }

  async clearCache(): Promise<void> {
    await this.init();
    try {
      const contents = await FileSystem.readDirectoryAsync(this.totemDirectoryPath);
      for (const filename of contents) {
        await FileSystem.deleteAsync(`${this.totemDirectoryPath}${filename}`);
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }
}

export const AIService = new AIServiceClass();
