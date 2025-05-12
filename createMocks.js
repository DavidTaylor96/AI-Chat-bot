const fs = require('fs');
const path = require('path');

const languages = [
  'bash',
  'javascript',
  'typescript',
  'python',
  'java',
  'go',
  'rust',
  'c',
  'cpp',
  'csharp',
  'css',
  'json',
  'jsx',
  'markdown',
  'sql',
  'yaml'
];

const mockDir = path.join(__dirname, 'src/__mocks__/react-syntax-highlighter/dist/esm/languages/prism');

// Create the directory structure if it doesn't exist
if (!fs.existsSync(mockDir)) {
  fs.mkdirSync(mockDir, { recursive: true });
}

// Create a mock file for each language
languages.forEach(language => {
  const filePath = path.join(mockDir, `${language}.js`);
  fs.writeFileSync(filePath, 'export default {};');
  console.log(`Created mock for ${language}`);
});

console.log('All language mocks created successfully!');