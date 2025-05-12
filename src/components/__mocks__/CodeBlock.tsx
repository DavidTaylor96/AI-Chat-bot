import React from 'react';

const CodeBlock = ({ code, language, filename }: { code: string, language: string, filename?: string }) => (
  <pre data-testid="code-block" data-language={language}>
    {code}
  </pre>
);

export default CodeBlock;