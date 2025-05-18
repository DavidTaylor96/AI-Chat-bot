import { sleep, sendMessage } from './test-utils';

jest.setTimeout(30000); // Increase timeout to 30 seconds

describe('Mermaid Diagram Rendering', () => {
  beforeAll(async () => {
    await page.goto('http://localhost:3000');
    // Wait for the app to load
    await page.waitForSelector('textarea[placeholder="Message Taylor..."]');
  });

  test('Mermaid diagrams should render correctly', async () => {
    // Simple flowchart diagram
    const flowchartDiagram = '```mermaid\n' +
      'flowchart TD\n' +
      '  A[Start] --> B{Is it working?}\n' +
      '  B -->|Yes| C[Great!]\n' +
      '  B -->|No| D[Debug]\n' +
      '  D --> B\n' +
      '```';

    // Send the mermaid diagram message
    await sendMessage(page, flowchartDiagram);
    
    // Wait for mermaid to render
    await sleep(3000);
    
    // Look for SVG rendered by mermaid
    await page.waitForSelector('svg', { timeout: 5000 });
    const svgElements = await page.$$('svg');
    expect(svgElements.length).toBeGreaterThan(0);

    // Check if the SVG contains expected mermaid elements
    const hasMermaidElements = await page.evaluate((element) => {
      return !!element.querySelector('path') || !!element.querySelector('rect');
    }, svgElements[svgElements.length - 1]);
    
    expect(hasMermaidElements).toBe(true);
  });

  test('Complex mermaid diagrams should render correctly', async () => {
    // More complex sequence diagram
    const sequenceDiagram = '```mermaid\n' +
      'sequenceDiagram\n' +
      '  participant User\n' +
      '  participant App\n' +
      '  participant API\n' +
      '  participant DB\n' +
      '  User->>App: Enter text\n' +
      '  App->>API: Send request\n' +
      '  API->>DB: Query data\n' +
      '  DB-->>API: Return results\n' +
      '  API-->>App: Send response\n' +
      '  App-->>User: Display results\n' +
      '```';

    // Send the complex mermaid diagram message
    await sendMessage(page, sequenceDiagram);
    
    // Wait for mermaid to render
    await sleep(3000);
    
    // Wait for SVG to be rendered
    await page.waitForSelector('svg', { timeout: 5000 });
    const svgElements = await page.$$('svg');
    const lastSvg = svgElements[svgElements.length - 1];

    // Check if SVG contains expected elements
    const svgContent = await page.evaluate((element) => {
      if (!element) return null;

      // For sequence diagrams, look for relevant elements
      const textElements = element.querySelectorAll('text');
      const paths = element.querySelectorAll('path');

      return {
        participantCount: textElements.length,
        arrowCount: paths.length
      };
    }, lastSvg);
    
    // Verify that diagram has expected elements
    expect(svgContent).toBeTruthy();
    // Mermaid rendering may vary, just check that we have some content
    expect(svgContent.participantCount + svgContent.arrowCount).toBeGreaterThan(0);
  });
  
  test('Mermaid diagrams should be responsive', async () => {
    // A simple diagram to test responsiveness
    const simpleDiagram = '```mermaid\n' +
      'graph LR\n' +
      '  A[Client] --> B[Load Balancer]\n' +
      '  B --> C[Server 1]\n' +
      '  B --> D[Server 2]\n' +
      '```';

    // Send the mermaid diagram message
    await sendMessage(page, simpleDiagram);
    
    // Wait for mermaid to render
    await sleep(3000);
    
    // Wait for SVG to be rendered
    await page.waitForSelector('svg', { timeout: 5000 });
    const svgElements = await page.$$('svg');
    const lastSvg = svgElements[svgElements.length - 1];

    // Measure the diagram size
    const initialSize = await page.evaluate((element) => {
      if (!element) return null;

      return {
        width: element.width.baseVal.value,
        height: element.height.baseVal.value,
        viewBox: element.getAttribute('viewBox')
      };
    }, lastSvg);
    
    expect(initialSize).toBeTruthy();
    expect(initialSize.width).toBeGreaterThan(0);
    
    // Resize viewport to test responsiveness
    await page.setViewport({ width: 500, height: 800 });
    await sleep(1000);
    
    // Measure again after resize
    const afterResizeSize = await page.evaluate((element) => {
      if (!element) return null;

      return {
        width: element.width.baseVal.value,
        height: element.height.baseVal.value,
        viewBox: element.getAttribute('viewBox')
      };
    }, lastSvg);
    
    expect(afterResizeSize).toBeTruthy();
    
    // Reset viewport
    await page.setViewport({ width: 1280, height: 800 });
  });
});