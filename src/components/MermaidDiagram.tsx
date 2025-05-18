import React, { useEffect, useState, useRef } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  code: string;
  filename?: string;
}

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ code, filename = 'diagram.md' }) => {
  const [viewMode, setViewMode] = useState<'code' | 'diagram'>('diagram');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const uniqueId = useRef(`mermaid-${Math.random().toString(36).substring(2, 11)}`);

  // Initialize mermaid with better configuration
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'neutral',
      securityLevel: 'loose',
      fontFamily: 'monospace',
      logLevel: 4, // Error level for better debugging
    });
  }, []);

  // Render diagram when in diagram mode
  useEffect(() => {
    if (viewMode === 'diagram' && containerRef.current) {
      try {
        // Clear previous renders and errors
        containerRef.current.innerHTML = '';
        setError(null);

        // Create a div for mermaid to render into
        const element = document.createElement('div');
        element.id = uniqueId.current;
        element.className = 'mermaid';
        element.textContent = code;
        containerRef.current.appendChild(element);

        // Render the diagram
        mermaid.render(uniqueId.current, code)
          .then(({ svg }) => {
            if (containerRef.current) {
              containerRef.current.innerHTML = svg;
            }
          })
          .catch((err) => {
            console.error('Mermaid rendering error:', err);
            setError(`Failed to render diagram: ${err.message || 'Check syntax'}`);
          });
      } catch (err: any) {
        console.error('Mermaid diagram error:', err);
        setError(`Diagram error: ${err.message || 'Check syntax'}`);
      }
    }
  }, [code, viewMode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    
    if (viewMode === 'code') {
      // Download as text file
      const fileBlob = new Blob([code], { type: 'text/plain' });
      element.href = URL.createObjectURL(fileBlob);
      element.download = filename;
    } else {
      // Download as SVG
      const svgElement = containerRef.current?.querySelector('svg');
      if (svgElement) {
        const svgData = new XMLSerializer().serializeToString(svgElement);
        const fileBlob = new Blob([svgData], { type: 'image/svg+xml' });
        element.href = URL.createObjectURL(fileBlob);
        element.download = filename.replace(/\.\w+$/, '.svg');
      } else {
        // Fallback to text if SVG not available
        const fileBlob = new Blob([code], { type: 'text/plain' });
        element.href = URL.createObjectURL(fileBlob);
        element.download = filename;
      }
    }
    
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'code' ? 'diagram' : 'code');
  };

  return (
    <div className="border border-Taylor-border rounded-lg my-4 overflow-hidden bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-Taylor-border">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          <span className="font-medium text-gray-700">{filename}</span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleCopy}
            className="text-gray-500 hover:text-Taylor-purple transition-colors p-1 rounded"
            title="Copy code"
          >
            {copied ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zm-.894 1L7.382 6H4v10h8V6h-3.382l-.724-1.447A1 1 0 007 4H9.106z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm12 6h2a1 1 0 110 2h-2v-2z" />
              </svg>
            )}
          </button>
          <button
            onClick={handleDownload}
            className="text-gray-500 hover:text-Taylor-purple transition-colors p-1 rounded"
            title={viewMode === 'code' ? "Download code" : "Download SVG"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={toggleViewMode}
            className="text-gray-500 hover:text-Taylor-purple transition-colors p-1 rounded"
            title={viewMode === 'code' ? "Show diagram" : "Show code"}
          >
            {viewMode === 'code' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="border-t border-Taylor-border">
        {viewMode === 'code' ? (
          <div className="p-4 bg-gray-50">
            <pre className="text-sm text-gray-800 whitespace-pre-wrap overflow-auto">{code}</pre>
          </div>
        ) : (
          <div className="p-4 flex justify-center overflow-auto">
            {error ? (
              <div className="text-red-500 py-4">{error}</div>
            ) : (
              <div ref={containerRef} className="max-w-full"></div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MermaidDiagram;