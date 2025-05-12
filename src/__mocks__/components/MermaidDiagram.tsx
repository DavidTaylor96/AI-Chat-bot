import React from 'react';

const MermaidDiagram = ({ code, filename }: { code: string, filename?: string }) => (
  <div data-testid="mermaid-diagram">
    {code}
  </div>
);

export default MermaidDiagram;