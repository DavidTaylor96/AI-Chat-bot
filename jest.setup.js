// Import testing-library jest-dom matchers
import '@testing-library/jest-dom';

// Mock the CodeBlock component
jest.mock('./src/components/CodeBlock', () => {
  return {
    __esModule: true,
    default: ({ code, language }) => (
      `<div data-testid="mocked-code-block" data-language="${language}">${code}</div>`
    )
  };
});

// Mock scrollIntoView
Element.prototype.scrollIntoView = jest.fn();

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};