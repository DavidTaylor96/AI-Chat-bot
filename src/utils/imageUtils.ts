/**
 * Utility functions for handling images and image compression
 */

// Maximum dimension (width or height) for compressed images
const MAX_IMAGE_DIMENSION = 1200;
// Quality level for JPEG compression (0-1)
const JPEG_QUALITY = 0.85;
// Maximum file size in bytes (1MB)
const MAX_FILE_SIZE = 1024 * 1024;

/**
 * Compresses an image by resizing it and reducing quality
 * 
 * @param file The original image file to compress
 * @returns A promise that resolves to a compressed Blob object
 */
export const compressImage = async (file: File): Promise<{ 
  blob: Blob; 
  dataUrl: string;
  width: number;
  height: number;
}> => {
  return new Promise((resolve, reject) => {
    // Check if the file is already small enough
    if (file.size <= MAX_FILE_SIZE) {
      // Convert to data URL for preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          resolve({
            blob: file,
            dataUrl: e.target?.result as string,
            width: img.width,
            height: img.height
          });
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
      return;
    }

    // Create an image element to load the file
    const img = new Image();
    const reader = new FileReader();
    
    reader.onload = (e) => {
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > height && width > MAX_IMAGE_DIMENSION) {
          height = Math.round(height * (MAX_IMAGE_DIMENSION / width));
          width = MAX_IMAGE_DIMENSION;
        } else if (height > MAX_IMAGE_DIMENSION) {
          width = Math.round(width * (MAX_IMAGE_DIMENSION / height));
          height = MAX_IMAGE_DIMENSION;
        }
        
        // Create a canvas to draw the resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        // Draw the image on the canvas
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Could not compress image'));
            return;
          }
          
          // Get the data URL for preview
          const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
          
          resolve({ blob, dataUrl, width, height });
        }, 'image/jpeg', JPEG_QUALITY);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Converts a compressed image blob to a Base64 string
 * 
 * @param blob The compressed image blob
 * @returns A promise that resolves to a Base64 string
 */
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to convert blob to Base64'));
    reader.readAsDataURL(blob);
  });
};

/**
 * Gets file extension from a filename
 * 
 * @param filename The filename to extract extension from
 * @returns The file extension (e.g., 'jpg', 'png') without the dot
 */
export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || 'jpg';
};

/**
 * Generates an image attachment string that can be embedded in a message
 * 
 * @param dataUrl The Base64 data URL of the image
 * @param filename The name of the file
 * @param width The width of the image
 * @param height The height of the image
 * @returns A formatted string for embedding an image in a message
 */
export const createImageAttachmentString = (
  dataUrl: string,
  filename: string,
  width: number,
  height: number
): string => {
  return `[${filename}](image-attachment:${width}:${height})\n\`\`\`image\n${dataUrl}\n\`\`\``;
};