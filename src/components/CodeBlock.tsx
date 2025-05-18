import React, { useState, useEffect } from 'react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, prism as lightTheme } from 'react-syntax-highlighter/dist/esm/styles/prism';
import MermaidDiagram from './MermaidDiagram';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import java from 'react-syntax-highlighter/dist/esm/languages/prism/java';
import go from 'react-syntax-highlighter/dist/esm/languages/prism/go';
import rust from 'react-syntax-highlighter/dist/esm/languages/prism/rust';
import c from 'react-syntax-highlighter/dist/esm/languages/prism/c';
import cpp from 'react-syntax-highlighter/dist/esm/languages/prism/cpp';
import csharp from 'react-syntax-highlighter/dist/esm/languages/prism/csharp';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import markdown from 'react-syntax-highlighter/dist/esm/languages/prism/markdown';
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql';
import yaml from 'react-syntax-highlighter/dist/esm/languages/prism/yaml';

// Register languages
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('java', java);
SyntaxHighlighter.registerLanguage('go', go);
SyntaxHighlighter.registerLanguage('rust', rust);
SyntaxHighlighter.registerLanguage('c', c);
SyntaxHighlighter.registerLanguage('cpp', cpp);
SyntaxHighlighter.registerLanguage('csharp', csharp);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('jsx', jsx);
SyntaxHighlighter.registerLanguage('markdown', markdown);
SyntaxHighlighter.registerLanguage('sql', sql);
SyntaxHighlighter.registerLanguage('yaml', yaml);

// Languages that can be executed in the browser
const executableLanguages = ['javascript', 'typescript', 'jsx'];

interface CodeBlockProps {
  code: string;
  language: string;
  filename?: string;
  showLineNumbers?: boolean;
  theme?: 'dark' | 'light';
}

const CodeBlock: React.FC<CodeBlockProps> = ({ 
  code, 
  language, 
  filename,
  showLineNumbers = true,
  theme = 'dark' 
}) => {
  const [copied, setCopied] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Check if the code is executable
  const isExecutable = executableLanguages.includes(language?.toLowerCase() || '');

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy code:', err);
    });
  };

  const executeCode = () => {
    if (!isExecutable) return;
    
    setIsExecuting(true);
    setOutput(null);
    setError(null);
    
    try {
      // For security, use a sandboxed approach in production
      // This is a simplified example
      const result = eval(`
        try {
          (function() {
            const console = {
              log: function(...args) {
                return args.map(arg => 
                  typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                ).join(' ');
              }
            };
            
            ${code}
          })();
        } catch (e) {
          throw e;
        }
      `);
      
      setOutput(String(result));
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An error occurred during execution');
      }
    } finally {
      setIsExecuting(false);
    }
  };

  // Strip any leading/trailing whitespace
  const cleanedCode = code.trim();

  // Render mermaid diagrams using the specialized component
  if (language === 'mermaid') {
    return (
      <MermaidDiagram code={cleanedCode} filename={filename || 'diagram.mmd'} />
    );
  }

  // Determine the style based on theme
  const codeStyle = theme === 'dark' ? vscDarkPlus : lightTheme;
  const bgColor = theme === 'dark' ? '#1E1E1E' : '#f5f5f5';
  const headerBgColor = theme === 'dark' ? '#2D2D2D' : '#e5e5e5';
  const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-300';
  const textColor = theme === 'dark' ? 'text-white' : 'text-gray-800';
  const headerTextColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className={`my-4 rounded-md overflow-hidden border ${borderColor} bg-[${bgColor}] ${textColor}`}>
      {/* Header with language and copy button */}
      <div className={`flex items-center justify-between px-4 py-2 bg-[${headerBgColor}] text-sm font-mono border-b ${borderColor}`}>
        <div className="flex items-center space-x-2">
          <span className={headerTextColor}>
            {filename || `${language || 'code'}`}
          </span>
        </div>
        <div className="flex space-x-2">
          {isExecutable && (
            <button
              onClick={executeCode}
              disabled={isExecuting}
              className={`focus:outline-none transition-colors ${
                isExecuting ? 'opacity-50 cursor-not-allowed' : 'hover:text-blue-500'
              } ${headerTextColor}`}
              aria-label="Execute code"
            >
              <div className="flex items-center">
                {isExecuting ? (
                  <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                )}
                <span>{isExecuting ? 'Running...' : 'Run'}</span>
              </div>
            </button>
          )}
          <button
            onClick={handleCopy}
            className={`focus:outline-none transition-colors ${headerTextColor} hover:text-blue-500`}
            aria-label="Copy code"
          >
            {copied ? (
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Copied!</span>
              </div>
            ) : (
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
                <span>Copy</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Code content */}
      <div className="overflow-auto max-h-[500px]" role="region" aria-label="Code snippet">
        <SyntaxHighlighter
          language={language || 'text'}
          style={codeStyle}
          showLineNumbers={showLineNumbers}
          wrapLines={true}
          wrapLongLines={false} // Better to scroll horizontally on mobile
          customStyle={{ 
            margin: 0, 
            padding: '1rem', 
            background: bgColor,
            fontSize: '0.9rem',
            lineHeight: '1.5',
          }}
          codeTagProps={{ 
            style: { 
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            } 
          }}
        >
          {cleanedCode}
        </SyntaxHighlighter>
      </div>

      {/* Execution results */}
      {(output || error) && (
        <div className={`border-t ${borderColor} p-4`}>
          <div className="font-semibold mb-2">
            {error ? 'Error:' : 'Output:'}
          </div>
          <div className={`font-mono text-sm overflow-auto max-h-[200px] p-2 rounded ${
            error 
              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
              : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
          }`}>
            {error || output}
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeBlock;