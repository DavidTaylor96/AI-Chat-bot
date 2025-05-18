import { sleep, sendMessage, getLastMessage } from './test-utils';

jest.setTimeout(30000); // Increase timeout to 30 seconds

describe('Code Block Text Wrapping', () => {
  beforeAll(async () => {
    await page.goto('http://localhost:3000');
    // Wait for the app to load
    await page.waitForSelector('textarea[placeholder="Message Taylor..."]');
  });

  test('Code blocks should wrap long lines of code properly', async () => {
    // Create a very long line of code that should be wrapped
    const longCodeMessage = '```javascript\n' +
      'function testVeryLongFunctionNameThatShouldWrapCorrectlyInTheUIAndNotOverflowOrCreateHorizontalScrollbars(param1, param2, param3, param4, param5, param6, param7, param8, param9, param10) {\n' +
      '  // This is a comment with lots of text that should also wrap properly in the UI and demonstrate that our fix is working correctly for all content inside code blocks including comments.\n' +
      '  const veryLongVariableName = param1 + param2 + param3 + param4 + param5 + param6 + param7 + param8 + param9 + param10;\n' +
      '  return `This is a very long template string that should also be displayed correctly in the UI and show proper text wrapping for all content including strings that contain a lot of text. ${veryLongVariableName}`;\n' +
      '}\n' +
      '```';

    // Send the long code message
    await sendMessage(page, longCodeMessage);
    
    // Wait for message to be processed
    await sleep(1000);
    
    // Get the code block element
    const codeBlocks = await page.$$('.overflow-auto');
    expect(codeBlocks.length).toBeGreaterThan(0);
    
    const lastCodeBlock = codeBlocks[codeBlocks.length - 1];
    
    // Check that the code block has proper wrapping styles
    const wrapStyles = await page.evaluate((element) => {
      const codeElement = element.querySelector('code');
      if (!codeElement) return null;
      
      const styles = window.getComputedStyle(codeElement);
      return {
        whiteSpace: styles.whiteSpace,
        wordBreak: styles.wordBreak,
        overflowWrap: styles.overflowWrap
      };
    }, lastCodeBlock);
    
    // Check for proper text wrapping styles
    expect(wrapStyles).toBeTruthy();
    expect(wrapStyles.whiteSpace).toMatch(/pre-wrap|break-spaces/);
    
    // Test visible width vs content width to confirm no overflow
    const dimensions = await page.evaluate((element) => {
      const container = element.closest('.overflow-auto');
      if (!container) return null;
      
      const containerWidth = container.clientWidth;
      const scrollWidth = container.scrollWidth;
      
      // If text is properly wrapped, scrollWidth should be less than or equal to clientWidth
      // or the difference should be very small (scrollbar width)
      return {
        containerWidth,
        scrollWidth,
        difference: scrollWidth - containerWidth
      };
    }, lastCodeBlock);
    
    // Check that there's no significant horizontal overflow
    // Allow a small tolerance for scrollbar width or minor implementation differences
    expect(dimensions.difference).toBeLessThan(20);
  });

  test('Code blocks maintain syntax highlighting with wrapping enabled', async () => {
    // Code with various syntax elements to test highlighting
    const syntaxHighlightCode = '```javascript\n' +
      'function highlight(test) {\n' +
      '  // This is a comment\n' +
      '  const stringVar = "This is a string";\n' +
      '  const numberVar = 12345;\n' +
      '  const booleanVar = true;\n' +
      '  return stringVar.length > 10 ? numberVar : booleanVar;\n' +
      '}\n' +
      '```';

    // Send the message with syntax highlighting elements
    await sendMessage(page, syntaxHighlightCode);
    
    // Wait for message to be processed
    await sleep(1000);
    
    // Get the code block element
    const codeBlocks = await page.$$('.overflow-auto');
    const lastCodeBlock = codeBlocks[codeBlocks.length - 1];
    
    // Check that syntax highlighting is applied
    const hasHighlighting = await page.evaluate((element) => {
      // Check for highlighted elements
      const spans = element.querySelectorAll('span[style]');
      return spans.length > 0;
    }, lastCodeBlock);
    
    expect(hasHighlighting).toBe(true);
  });
});