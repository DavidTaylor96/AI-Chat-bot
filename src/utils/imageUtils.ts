/**
 * Utility functions for handling images and image compression
 */

// Maximum dimension (width or height) for compressed images
const MAX_IMAGE_DIMENSION = 800; // Reduced from 1000 to save tokens
// Quality level for JPEG compression (0-1)
const JPEG_QUALITY = 0.6; // Reduced from 0.7 to save tokens
// Initial maximum file size in bytes (1MB)
const INITIAL_MAX_FILE_SIZE = 1024 * 1024;
// Absolute maximum file size after multiple compression attempts (300KB)
const ABSOLUTE_MAX_FILE_SIZE = 300 * 1024; // Reduced from 500KB to save tokens
// Maximum attempts to compress an image
const MAX_COMPRESSION_ATTEMPTS = 3;

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
    // Check if the file is already small enough for initial pass
    if (file.size <= ABSOLUTE_MAX_FILE_SIZE) {
      // Convert to data URL for preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // For small files, still resize if dimensions are too large
          if (img.width > MAX_IMAGE_DIMENSION || img.height > MAX_IMAGE_DIMENSION) {
            // Continue to resize the image even if it's small enough
            processAndCompressImage(img, e.target?.result as string, JPEG_QUALITY, resolve, reject);
            return;
          }

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
        // Process and compress the image
        processAndCompressImage(img, e.target?.result as string, JPEG_QUALITY, resolve, reject);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

/**
 * Process and compress an image with multiple attempts if needed
 * to get the size under the maximum allowed
 */
const processAndCompressImage = (
  img: HTMLImageElement,
  originalDataUrl: string,
  quality: number,
  resolve: Function,
  reject: Function,
  attempt: number = 1
) => {
  // Calculate new dimensions while maintaining aspect ratio
  let width = img.width;
  let height = img.height;

  // Calculate scale factor based on attempt number
  const scaleFactor = Math.max(0.5, 1 - (0.1 * attempt));
  const maxDimension = MAX_IMAGE_DIMENSION * scaleFactor;

  if (width > height && width > maxDimension) {
    height = Math.round(height * (maxDimension / width));
    width = Math.round(maxDimension);
  } else if (height > maxDimension) {
    width = Math.round(width * (maxDimension / height));
    height = Math.round(maxDimension);
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

  // Use better image smoothing for downscaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  // Calculate compression quality based on attempt
  const compressionQuality = quality * Math.pow(0.8, attempt - 1);

  // Convert to blob
  canvas.toBlob((blob) => {
    if (!blob) {
      reject(new Error('Could not compress image'));
      return;
    }

    // Get the data URL for preview
    const dataUrl = canvas.toDataURL('image/jpeg', compressionQuality);

    // Check if the blob is still too large and we haven't exceeded max attempts
    if (blob.size > ABSOLUTE_MAX_FILE_SIZE && attempt < MAX_COMPRESSION_ATTEMPTS) {
      console.log(`Compression attempt ${attempt} produced size ${(blob.size/1024).toFixed(2)}KB, trying again...`);
      // Try again with more aggressive compression
      processAndCompressImage(img, originalDataUrl, quality, resolve, reject, attempt + 1);
    } else {
      console.log(`Image compressed to ${(blob.size/1024).toFixed(2)}KB`);
      resolve({ blob, dataUrl, width, height });
    }
  }, 'image/jpeg', compressionQuality);
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