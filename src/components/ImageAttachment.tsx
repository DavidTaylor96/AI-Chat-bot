import React, { useState } from 'react';

interface ImageAttachmentProps {
  src: string;
  alt?: string;
  filename?: string;
  width?: number;
  height?: number;
}

const ImageAttachment: React.FC<ImageAttachmentProps> = ({ 
  src, 
  alt = 'Image', 
  filename = 'image.png',
  width,
  height
}) => {
  const [expanded, setExpanded] = useState(false);
  
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExpand = () => {
    setExpanded(!expanded);
  };

  // Determine actual dimensions for preview
  const imageStyle: React.CSSProperties = expanded
    ? {} // Full size in expanded view
    : { maxWidth: '100%', maxHeight: '300px' }; // Limited size in collapsed view

  return (
    <div className="border border-Taylor-border rounded-lg my-4 overflow-hidden bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-Taylor-border">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="font-medium text-gray-700">{filename}</span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleDownload}
            className="text-gray-500 hover:text-Taylor-purple transition-colors p-1 rounded"
            title="Download image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={handleExpand}
            className="text-gray-500 hover:text-Taylor-purple transition-colors p-1 rounded"
            title={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className={`p-4 bg-white flex justify-center ${expanded ? '' : 'max-h-[300px] overflow-hidden'}`}>
        <img 
          src={src} 
          alt={alt} 
          style={imageStyle}
          className={`object-contain ${expanded ? '' : 'cursor-pointer'}`}
          onClick={expanded ? undefined : handleExpand}
        />
      </div>
      
      {/* Footer/Info (only shown in collapsed view) */}
      {!expanded && width && height && (
        <div className="p-2 bg-gray-50 text-xs text-gray-500 border-t border-Taylor-border">
          <span>{width} × {height} px</span>
        </div>
      )}
    </div>
  );
};

export default ImageAttachment;