import { sleep, sendMessage, pasteImage } from './test-utils';
import * as fs from 'fs';
import * as path from 'path';

jest.setTimeout(30000); // Increase timeout to 30 seconds

describe('Screenshot Pasting and Compression', () => {
  beforeAll(async () => {
    await page.goto('http://localhost:3000');
    // Wait for the app to load
    await page.waitForSelector('textarea[placeholder="Message Claude..."]');

    // Create test fixture directory if it doesn't exist
    const fixturesDir = path.join(__dirname, 'fixtures');
    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir, { recursive: true });
    }
  });

  test('Should properly handle pasting a screenshot from clipboard', async () => {
    // Create a small test image in-browser
    const smallImageData = await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      
      // Create a simple test image
      ctx.fillStyle = 'green';
      ctx.fillRect(0, 0, 100, 100);
      ctx.fillStyle = 'white';
      ctx.font = '14px Arial';
      ctx.fillText('Test Image', 10, 50);
      
      // Return base64 data without the prefix
      return canvas.toDataURL('image/png').split(',')[1];
    });
    
    // Focus the textarea
    await page.click('textarea[placeholder="Message Claude..."]');
    
    // Simulate pasting the image
    await pasteImage(page, smallImageData);
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Wait for image to be processed and displayed
    await sleep(3000);
    
    // Check if the image was added to the conversation
    const images = await page.$$('img.object-contain');
    expect(images.length).toBeGreaterThan(0);
    
    // Verify image content
    const lastImage = images[images.length - 1];
    const imageVisible = await page.evaluate((img) => {
      return img.complete && img.naturalWidth > 0;
    }, lastImage);
    
    expect(imageVisible).toBe(true);
  });

  test('Should compress large screenshots', async () => {
    // Create a large test image
    const largeImageData = await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 2000;
      canvas.height = 1500;
      const ctx = canvas.getContext('2d');
      
      // Fill with a gradient to create some complexity
      const gradient = ctx.createLinearGradient(0, 0, 2000, 1500);
      gradient.addColorStop(0, 'blue');
      gradient.addColorStop(0.5, 'purple');
      gradient.addColorStop(1, 'red');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 2000, 1500);
      
      // Add some text
      ctx.fillStyle = 'white';
      ctx.font = '40px Arial';
      ctx.fillText('Large Test Image For Compression', 100, 750);
      
      // Return base64 data without the prefix
      return canvas.toDataURL('image/png').split(',')[1];
    });
    
    // Get the size of the large image data
    const originalSize = Math.ceil((largeImageData.length * 3) / 4); // Base64 to binary size estimate
    
    // Focus the textarea
    await page.click('textarea[placeholder="Message Claude..."]');
    
    // Simulate pasting the image
    await pasteImage(page, largeImageData);
    
    // Wait for compression to complete
    await sleep(2000);
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Wait for image to be processed and displayed
    await sleep(3000);
    
    // Check if the image was added to the conversation
    const images = await page.$$('img.object-contain');
    expect(images.length).toBeGreaterThan(0);
    
    // Get the last image and examine its source
    const lastImage = images[images.length - 1];
    const compressedImageSrc = await page.evaluate((img) => {
      return img.src;
    }, lastImage);
    
    // Extract the base64 data from the src attribute
    const compressedData = compressedImageSrc.split(',')[1];
    const compressedSize = Math.ceil((compressedData.length * 3) / 4); // Base64 to binary size estimate
    
    // Verify the image was compressed (should be smaller than original)
    expect(compressedSize).toBeLessThan(originalSize);
  });

  test('Should show an error when image is too large', async () => {
    // Create an extremely large image that should trigger the size error
    // We'll create an image that's just large enough to trigger the error but small enough to not crash the test
    const hugeImageData = await page.evaluate(() => {
      // This is just a mock - in reality we're just testing error handling
      // The size check in the code will be done by the actual image size, not the dimensions
      const mockLargeImage = 'X'.repeat(15 * 1024 * 1024); // 15MB of mock image data
      return btoa(mockLargeImage);
    });
    
    // Focus the textarea
    await page.click('textarea[placeholder="Message Claude..."]');
    
    // Clear any error banners first if present
    const errorBanners = await page.$$('.bg-red-50');
    if (errorBanners.length > 0) {
      await page.click('.bg-red-50 button');
      await sleep(500);
    }
    
    // Attempt to paste a very large image
    await page.evaluate((imageData) => {
      // Mock clipboard event
      const pasteEvent = new ClipboardEvent('paste', {
        clipboardData: new DataTransfer(),
        bubbles: true
      });
      
      // Create a large blob that will fail validation
      const mockBlobData = new Uint8Array(11 * 1024 * 1024); // 11MB, larger than 10MB limit
      const blob = new Blob([mockBlobData], {type: 'image/png'});
      
      // Add image to clipboard data
      Object.defineProperty(pasteEvent.clipboardData, 'items', {
        value: [{
          kind: 'file',
          type: 'image/png',
          getAsFile: () => blob
        }]
      });
      
      // Dispatch event on the textarea
      document.querySelector('textarea').dispatchEvent(pasteEvent);
    }, hugeImageData);
    
    // Wait for error message to appear
    await sleep(1000);
    
    // Check if error message is shown
    const errorBanner = await page.$('.bg-red-50');
    expect(errorBanner).toBeTruthy();
    
    // Verify error message text
    const errorText = await page.evaluate(error => error.textContent, errorBanner);
    expect(errorText).toContain('too large');
  });
});