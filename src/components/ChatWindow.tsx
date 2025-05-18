import React, { useEffect, useRef, useState } from 'react';
import useChatStore from '../store/chatStore';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { sendMessage, AI_MODELS } from '../services/api';

const ChatWindow: React.FC = () => {
  const { getCurrentSession, addMessage, createSession } = useChatStore();
  const currentSession = getCurrentSession();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modelSettings, setModelSettings] = useState({
    model: AI_MODELS.DEFAULT,
    maxTokens: 4000,
    temperature: 0.7,
    contextWindowSize: 10
  });

  // Create a new session if none exists and no sessions are available
  useEffect(() => {
    const { sessions } = useChatStore.getState();
    if (!currentSession && sessions.length === 0) {
      createSession();
    }
  }, [currentSession, createSession]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages]);

  const handleSendMessage = async (content: string) => {
    if (!currentSession) return;
    
    // Add user message
    addMessage(content, 'user');
    setIsLoading(true);
    
    try {
      // Send message to API with model settings
      const response = await sendMessage([
        ...currentSession.messages,
        { id: 'temp', content, role: 'user', timestamp: Date.now() }
      ], modelSettings);
      
      // Add assistant response
      let responseContent = '';
      
      if (typeof response.content === 'string') {
        responseContent = response.content;
      } else if (Array.isArray(response.content)) {
        responseContent = response.content
          .filter(item => item && typeof item === 'object' && 'text' in item)
          .map(item => item.text || '')
          .join('\n');
      } else {
        responseContent = 'Sorry, I couldn\'t process that response.';
      }
      
      addMessage(responseContent, 'assistant');
    } catch (error) {
      console.error('Failed to get response:', error);
      addMessage('Sorry, I encountered an error processing your request. Please try again.', 'assistant');
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentSession) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-gray-500">
          <button
            onClick={createSession}
            className="px-4 py-2 bg-Taylor-purple text-white rounded-md"
          >
            Start a new chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto">
        {currentSession.messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500">
            <div className="text-2xl font-medium mb-2">How can I help you today?</div>
            <div className="text-sm">Ask me anything...</div>
          </div>
        ) : (
          currentSession.messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))
        )}
        {isLoading && (
          <div className="py-5 bg-Taylor-gray">
            <div className="max-w-3xl mx-auto px-4">
              <div className="flex items-start">
                <div className="rounded-full w-8 h-8 flex items-center justify-center bg-Taylor-purple">
                  <span className="text-white">C</span>
                </div>
                <div className="ml-4 flex-1">
                  <div className="font-medium">Taylor</div>
                  <div className="mt-1">
                    <div className="animate-pulse flex space-x-1">
                      <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                      <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                      <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default ChatWindow;