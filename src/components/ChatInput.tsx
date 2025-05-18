import React, { useState, useRef, useEffect } from 'react';
import { compressImage, createImageAttachmentString } from '../utils/imageUtils';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

// Threshold for text to be considered large (in characters)
const LARGE_TEXT_THRESHOLD = 1000;

interface TextAttachment {
  id: string;
  content: string;
  filename: string;
  preview: string; // First few characters for preview
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingTextAttachments, setPendingTextAttachments] = useState<TextAttachment[]>([]);
  const [pendingImageAttachments, setPendingImageAttachments] = useState<{
    id: string;
    dataUrl: string;
    filename: string;
    width: number;
    height: number;
  }[]>([]);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  // Handle text paste event
  const handleTextPaste = (text: string) => {
    // If the pasted text is large, add it as an attachment
    if (text.length > LARGE_TEXT_THRESHOLD) {
      const timestamp = Date.now();
      const newAttachment: TextAttachment = {
        id: `text-${timestamp}`,
        content: text,
        filename: `pasted-text-${timestamp}.txt`,
        preview: text.substring(0, 100) + (text.length > 100 ? '...' : '')
      };
      
      setPendingTextAttachments([...pendingTextAttachments, newAttachment]);
      return true; // Indicate that we handled the paste
    }
    
    return false; // Let the default paste behavior occur
  };

  // Add clipboard paste handler for images and text
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      if (isLoading || isProcessingImage) return;

      // Check for plain text first
      const text = e.clipboardData?.getData('text/plain');
      if (text && text.length > LARGE_TEXT_THRESHOLD) {
        e.preventDefault(); // Prevent default paste
        handleTextPaste(text);
        return;
      }

      // Then check for images
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          e.preventDefault();

          try {
            // Clear any previous error
            setErrorMessage(null);
            setIsProcessingImage(true);
            const blob = items[i].getAsFile();
            if (!blob) continue;

            // Check file size before processing
            if (blob.size > 10 * 1024 * 1024) { // 10MB
              setErrorMessage('Pasted image is too large. Maximum size is 10MB.');
              return;
            }

            // Create a more meaningful filename with timestamp
            const timestamp = Date.now();
            const file = new File([blob], `clipboard-image-${timestamp}.png`, { type: 'image/png' });

            const { dataUrl, width, height } = await compressImage(file);

            // Add to pending image attachments instead of sending immediately
            setPendingImageAttachments(prev => [
              ...prev,
              {
                id: `img-${timestamp}`,
                dataUrl,
                filename: file.name,
                width,
                height
              }
            ]);
          } catch (error) {
            console.error('Failed to process pasted image:', error);
            if (error instanceof Error) {
              setErrorMessage(error.message);
            } else {
              setErrorMessage('Failed to process the pasted image');
            }
          } finally {
            setIsProcessingImage(false);
          }

          break;
        }
      }
    };

    // Add event listener to document
    document.addEventListener('paste', handlePaste);

    // Clean up
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [onSendMessage, isLoading, isProcessingImage, pendingTextAttachments, pendingImageAttachments]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if we have something to send (message text or attachments)
    if ((message.trim() || pendingTextAttachments.length > 0 || pendingImageAttachments.length > 0) && !isLoading) {
      try {
        // Clear any previous error
        setErrorMessage(null);
        
        let finalMessage = message;
        
        // Add text attachments to the message
        pendingTextAttachments.forEach(attachment => {
          const attachmentString = `[${attachment.filename}](text-attachment)\n\`\`\`text\n${attachment.content}\n\`\`\``;
          finalMessage = finalMessage.trim() 
            ? `${finalMessage}\n\n${attachmentString}` 
            : attachmentString;
        });
        
        // Add image attachments to the message
        pendingImageAttachments.forEach(img => {
          const imageAttachment = createImageAttachmentString(
            img.dataUrl,
            img.filename,
            img.width,
            img.height
          );
          
          finalMessage = finalMessage.trim() 
            ? `${finalMessage}\n\n${imageAttachment}` 
            : imageAttachment;
        });
        
        // Send the final message with all attachments
        onSendMessage(finalMessage);
        
        // Clear everything
        setMessage('');
        setPendingTextAttachments([]);
        setPendingImageAttachments([]);
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage('An error occurred while sending your message');
        }
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      // Clear any previous error
      setErrorMessage(null);
      setIsProcessingImage(true);

      const file = files[0];

      // Check file size before processing
      if (file.size > 10 * 1024 * 1024) { // 10MB
        setErrorMessage('Image is too large. Maximum size is 10MB.');
        return;
      }

      const { dataUrl, width, height } = await compressImage(file);

      // Add to pending image attachments instead of sending immediately
      const timestamp = Date.now();
      setPendingImageAttachments(prev => [
        ...prev,
        {
          id: `img-${timestamp}`,
          dataUrl,
          filename: file.name,
          width,
          height
        }
      ]);

      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Failed to process the image');
      }
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleImageButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Remove a text attachment
  const removeTextAttachment = (id: string) => {
    setPendingTextAttachments(pendingTextAttachments.filter(att => att.id !== id));
  };

  // Remove an image attachment
  const removeImageAttachment = (id: string) => {
    setPendingImageAttachments(pendingImageAttachments.filter(img => img.id !== id));
  };

  return (
    <div className="border-t border-Taylor-border bg-white p-4">
      {errorMessage && (
        <div className="max-w-3xl mx-auto mb-2 p-2 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
          <span className="font-medium">Error:</span> {errorMessage}
          <button
            className="float-right text-red-400 hover:text-red-600"
            onClick={() => setErrorMessage(null)}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}
      
      <form
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto"
      >
        {/* Attachment preview area */}
        {(pendingTextAttachments.length > 0 || pendingImageAttachments.length > 0) && (
          <div className="mb-3 border border-Taylor-border rounded-lg p-3 bg-gray-50">
            <div className="text-sm text-gray-500 mb-2">Attachments:</div>
            
            <div className="flex flex-wrap gap-2">
              {/* Text attachment previews */}
              {pendingTextAttachments.map(attachment => (
                <div 
                  key={attachment.id} 
                  className="flex items-center bg-white border border-gray-200 rounded-md p-2 pr-3 max-w-full"
                >
                  <div className="flex-shrink-0 mr-2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-700 truncate">{attachment.filename}</div>
                    <div className="text-xs text-gray-500 truncate">{attachment.preview}</div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => removeTextAttachment(attachment.id)}
                    className="ml-2 text-gray-400 hover:text-gray-600"
                    aria-label="Remove attachment"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
              
              {/* Image attachment previews */}
              {pendingImageAttachments.map(attachment => (
                <div
                  key={attachment.id}
                  className="relative inline-block border border-gray-200 rounded-md overflow-hidden"
                >
                  <img
                    src={attachment.dataUrl}
                    alt={attachment.filename}
                    className="h-16 w-auto object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImageAttachment(attachment.id)}
                    className="absolute top-0 right-0 bg-gray-800 bg-opacity-70 text-white rounded-bl-md p-0.5"
                    aria-label="Remove attachment"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Taylor..."
            className="w-full border border-Taylor-border rounded-lg py-3 px-4 pr-16 pl-12 resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-Taylor-purple focus:border-transparent"
            rows={1}
            disabled={isLoading || isProcessingImage}
          />

          {/* Image upload button */}
          <button
            type="button"
            onClick={handleImageButtonClick}
            disabled={isLoading || isProcessingImage}
            className={`absolute left-3 bottom-3 rounded-md p-1 ${
              !isLoading && !isProcessingImage ? 'text-gray-500 hover:text-Taylor-purple hover:bg-gray-100' : 'text-gray-400'
            }`}
            title="Upload image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          {/* Send button */}
          <button
            type="submit"
            disabled={(
              !message.trim() && 
              pendingTextAttachments.length === 0 && 
              pendingImageAttachments.length === 0
            ) || isLoading || isProcessingImage}
            className={`absolute right-3 bottom-3 rounded-md p-1 ${
              (message.trim() || pendingTextAttachments.length > 0 || pendingImageAttachments.length > 0) && !isLoading && !isProcessingImage 
                ? 'text-Taylor-purple hover:bg-gray-100' 
                : 'text-gray-400'
            }`}
          >
            {isProcessingImage ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;