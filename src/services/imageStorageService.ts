/**
 * Image Storage Service - Manages images separately from messages
 * Reduces token usage by storing images with references instead of base64 in messages
 */

export interface StoredImage {
  id: string;
  dataUrl: string;
  filename: string;
  width: number;
  height: number;
  hash: string; // For deduplication
  timestamp: number;
  size: number; // File size in bytes
}

export interface ImageReference {
  type: 'image';
  id: string;
  filename: string;
  width: number;
  height: number;
}

class ImageStorageService {
  private static instance: ImageStorageService;
  private images: Map<string, StoredImage> = new Map();
  private hashToId: Map<string, string> = new Map(); // For deduplication
  private readonly STORAGE_KEY = 'taylor-image-storage';
  private readonly MAX_IMAGES = 100; // Limit stored images
  private readonly MAX_AGE_DAYS = 30; // Auto-cleanup after 30 days

  private constructor() {
    this.loadFromStorage();
    this.cleanupOldImages();
  }

  static getInstance(): ImageStorageService {
    if (!ImageStorageService.instance) {
      ImageStorageService.instance = new ImageStorageService();
    }
    return ImageStorageService.instance;
  }

  /**
   * Store an image and return its reference
   */
  async storeImage(
    dataUrl: string,
    filename: string,
    width: number,
    height: number
  ): Promise<ImageReference> {
    try {
      // Calculate hash for deduplication
      const hash = await this.calculateHash(dataUrl);
      
      // Check if we already have this image
      const existingId = this.hashToId.get(hash);
      if (existingId && this.images.has(existingId)) {
        const existing = this.images.get(existingId)!;
        console.log(`Deduplicated image: reusing ${existingId}`);
        return {
          type: 'image',
          id: existingId,
          filename: existing.filename,
          width: existing.width,
          height: existing.height
        };
      }

      // Create new image entry
      const id = this.generateId();
      const size = this.estimateSize(dataUrl);
      
      const storedImage: StoredImage = {
        id,
        dataUrl,
        filename,
        width,
        height,
        hash,
        timestamp: Date.now(),
        size
      };

      // Store the image
      this.images.set(id, storedImage);
      this.hashToId.set(hash, id);

      // Cleanup if we have too many images
      this.cleanupExcessImages();

      // Save to persistent storage
      this.saveToStorage();

      console.log(`Stored image ${id} (${(size/1024).toFixed(2)}KB)`);

      return {
        type: 'image',
        id,
        filename,
        width,
        height
      };
    } catch (error) {
      console.error('Failed to store image:', error);
      throw new Error('Failed to store image');
    }
  }

  /**
   * Get an image by ID
   */
  getImage(id: string): StoredImage | null {
    return this.images.get(id) || null;
  }

  /**
   * Get multiple images by IDs
   */
  getImages(ids: string[]): Map<string, StoredImage> {
    const result = new Map<string, StoredImage>();
    for (const id of ids) {
      const image = this.images.get(id);
      if (image) {
        result.set(id, image);
      }
    }
    return result;
  }

  /**
   * Create image attachment string with reference
   */
  createImageReference(
    id: string,
    filename: string,
    width: number,
    height: number
  ): string {
    return `[${filename}](image-ref:${id}:${width}:${height})`;
  }

  /**
   * Parse image references from message content
   */
  parseImageReferences(content: string): ImageReference[] {
    const references: ImageReference[] = [];
    const pattern = /\[([^\]]+)\]\(image-ref:([^:]+):(\d+):(\d+)\)/g;
    
    let match;
    while ((match = pattern.exec(content)) !== null) {
      references.push({
        type: 'image',
        id: match[2],
        filename: match[1],
        width: parseInt(match[3]),
        height: parseInt(match[4])
      });
    }
    
    return references;
  }

  /**
   * Replace image references with full image data for API calls
   */
  expandImageReferences(content: string, includeImages: Set<string>): string {
    return content.replace(
      /\[([^\]]+)\]\(image-ref:([^:]+):(\d+):(\d+)\)/g,
      (match, filename, id, width, height) => {
        if (!includeImages.has(id)) {
          // Return just the reference if image shouldn't be included
          return `[${filename}](image-reference-placeholder)`;
        }

        const image = this.images.get(id);
        if (!image) {
          console.warn(`Image ${id} not found`);
          return `[${filename}](missing-image)`;
        }

        // Return full image data for API
        return `[${filename}](image-attachment:${width}:${height})\n\`\`\`image\n${image.dataUrl}\n\`\`\``;
      }
    );
  }

  /**
   * Get storage statistics
   */
  getStats() {
    const totalSize = Array.from(this.images.values())
      .reduce((sum, img) => sum + img.size, 0);
    
    return {
      imageCount: this.images.size,
      totalSize,
      totalSizeMB: (totalSize / 1024 / 1024).toFixed(2)
    };
  }

  /**
   * Clear all stored images
   */
  clearAll(): void {
    this.images.clear();
    this.hashToId.clear();
    this.saveToStorage();
    console.log('Cleared all stored images');
  }

  private generateId(): string {
    return `img_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  private async calculateHash(dataUrl: string): Promise<string> {
    // Simple hash based on data URL content (excluding metadata)
    const data = dataUrl.split(',')[1] || dataUrl;
    
    // Use crypto.subtle if available, fallback to simple hash
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      try {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);
        const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      } catch (error) {
        // Fallback to simple hash
      }
    }

    // Simple fallback hash
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  private estimateSize(dataUrl: string): number {
    // Rough estimate: base64 is about 1.37x the original size
    // and data URL has additional metadata
    const base64Data = dataUrl.split(',')[1] || dataUrl;
    return Math.round(base64Data.length * 0.75); // Convert back to approximate binary size
  }

  private cleanupOldImages(): void {
    const cutoffTime = Date.now() - (this.MAX_AGE_DAYS * 24 * 60 * 60 * 1000);
    let removedCount = 0;

    const imageEntries = Array.from(this.images.entries());
    for (const [id, image] of imageEntries) {
      if (image.timestamp < cutoffTime) {
        this.images.delete(id);
        this.hashToId.delete(image.hash);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      console.log(`Cleaned up ${removedCount} old images`);
      this.saveToStorage();
    }
  }

  private cleanupExcessImages(): void {
    if (this.images.size <= this.MAX_IMAGES) return;

    // Sort by timestamp, remove oldest
    const imageEntries = Array.from(this.images.entries());
    const sorted = imageEntries.sort(([, a], [, b]) => a.timestamp - b.timestamp);

    const toRemove = sorted.slice(0, this.images.size - this.MAX_IMAGES);
    
    for (const [id, image] of toRemove) {
      this.images.delete(id);
      this.hashToId.delete(image.hash);
    }

    console.log(`Cleaned up ${toRemove.length} excess images`);
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return;

      const data = JSON.parse(stored);
      if (data.images && data.hashToId) {
        this.images = new Map(Object.entries(data.images));
        this.hashToId = new Map(Object.entries(data.hashToId));
        console.log(`Loaded ${this.images.size} images from storage`);
      }
    } catch (error) {
      console.warn('Failed to load images from storage:', error);
      this.images.clear();
      this.hashToId.clear();
    }
  }

  private saveToStorage(): void {
    try {
      const data = {
        images: Object.fromEntries(this.images.entries()),
        hashToId: Object.fromEntries(this.hashToId.entries()),
        lastSaved: Date.now()
      };
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save images to storage:', error);
      // If storage is full, try cleanup
      this.cleanupExcessImages();
      this.cleanupOldImages();
    }
  }
}

export default ImageStorageService;