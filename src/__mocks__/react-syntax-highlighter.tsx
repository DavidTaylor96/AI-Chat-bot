import React from 'react';

const SyntaxHighlighter = ({ children }: { children: string }) => (
  <pre data-testid="syntax-highlighter">{children}</pre>
);

SyntaxHighlighter.registerLanguage = jest.fn();

export default SyntaxHighlighter;
export const Prism = SyntaxHighlighter;
export const Light = SyntaxHighlighter;