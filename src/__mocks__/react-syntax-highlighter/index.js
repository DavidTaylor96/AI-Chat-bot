import React from 'react';

const SyntaxHighlighter = ({ children }) => (
  <pre data-testid="syntax-highlighter">{children}</pre>
);

SyntaxHighlighter.registerLanguage = jest.fn();

export default SyntaxHighlighter;

// Create the PrismLight export with registerLanguage method
export const PrismLight = function({ children }) {
  return (
    <pre data-testid="prism-light">{children}</pre>
  );
};

PrismLight.registerLanguage = jest.fn();

export const Prism = SyntaxHighlighter;
export const Light = SyntaxHighlighter;