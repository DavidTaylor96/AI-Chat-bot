import React from 'react';
import { Message } from '../store/chatStore';
import MessageParser from './MessageParser';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`py-5 ${isUser ? 'bg-white' : 'bg-claude-gray'}`}>
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-start">
          <div className={`rounded-full w-8 h-8 flex items-center justify-center ${
            isUser ? 'bg-gray-200' : 'bg-claude-purple'
          }`}>
            <span className={isUser ? 'text-gray-600' : 'text-white'}>
              {isUser ? 'U' : 'C'}
            </span>
          </div>
          <div className="ml-4 flex-1">
            <div className="font-medium">
              {isUser ? 'You' : 'Claude'}
            </div>
            <div className="mt-1 prose prose-slate max-w-none">
              <MessageParser content={message.content} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;