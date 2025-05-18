import { Page } from 'puppeteer';

// Sleep function for waiting
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Helper function to send a message in the chat
export const sendMessage = async (page: Page, message: string) => {
  await page.type('textarea[placeholder="Message Taylor..."]', message);
  await page.click('button[type="submit"]');
  // Wait for response
  await sleep(1000);
};

// Helper to get the content of the last message
export const getLastMessage = async (page: Page) => {
  const messages = await page.$$('.whitespace-pre-wrap');
  return messages[messages.length - 1];
};

// Helper to paste an image from clipboard
export const pasteImage = async (page: Page, imageData: string) => {
  // Create a clipboard item with image data
  await page.evaluate((imageData) => {
    // Mock clipboard event
    const pasteEvent = new ClipboardEvent('paste', {
      clipboardData: new DataTransfer(),
      bubbles: true
    });
    
    // Add image to clipboard data
    const blob = new Blob([Uint8Array.from(atob(imageData), c => c.charCodeAt(0))], {type: 'image/png'});
    Object.defineProperty(pasteEvent.clipboardData, 'items', {
      value: [{
        kind: 'file',
        type: 'image/png',
        getAsFile: () => blob
      }]
    });
    
    // Dispatch event on the textarea
    document.querySelector('textarea').dispatchEvent(pasteEvent);
  }, imageData);
  
  await sleep(1000);
};

// Sample pixel data for a simple test image
export const createTestImage = (width = 100, height = 100): string => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  // Create a simple colored rectangle
  ctx.fillStyle = 'blue';
  ctx.fillRect(0, 0, width, height);
  
  // Draw some text
  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.fillText('Test Image', 10, 50);
  
  // Return base64 data (without the data:image/png;base64, prefix)
  return canvas.toDataURL('image/png').split(',')[1];
};