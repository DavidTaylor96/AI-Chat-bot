module.exports = {
  projects: [
    // Unit tests configuration
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}'],
      testPathIgnorePatterns: ['<rootDir>/src/__tests__/e2e/'],
      testEnvironment: 'jsdom',
      transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
        '^.+\\.(js|jsx)$': 'babel-jest',
      },
      transformIgnorePatterns: [
        '/node_modules/'
      ],
      moduleNameMapper: {
        "^react-markdown$": "<rootDir>/src/__mocks__/react-markdown.tsx",
        "^mermaid$": "<rootDir>/src/__mocks__/mermaid/index.js",
        "^./services/api$": "<rootDir>/src/__mocks__/services/api.ts"
      },
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    },
    // E2E tests configuration
    {
      displayName: 'e2e',
      preset: 'jest-puppeteer',
      testMatch: ['<rootDir>/src/__tests__/e2e/**/*.test.{ts,tsx}'],
      testEnvironment: 'jest-environment-puppeteer',
      transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
        '^.+\\.(js|jsx)$': 'babel-jest',
      },
      transformIgnorePatterns: [
        '/node_modules/'
      ],
      moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    }
  ]
};