import axios from 'axios';
import { Message } from '../store/chatStore';
import { sendMockMessage } from './mockApi';

// Using a proxy to avoid CORS issues in development
// The proxy is configured in src/setupProxy.js
const API_URL = process.env.NODE_ENV === 'development' 
  ? '/api/messages'  // This will be proxied to https://api.anthropic.com/v1/messages
  : 'https://api.anthropic.com/v1/messages';
const API_KEY = process.env.REACT_APP_CLAUDE_API_KEY || '';

if (!API_KEY) {
  console.warn('Claude API key is not set. Set REACT_APP_CLAUDE_API_KEY environment variable.');
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
    'anthropic-version': '2023-06-01',
    'anthropic-beta': 'messages-2023-12-15'
  }
});

// Update to newer API format if needed
if (API_KEY && API_KEY.startsWith('sk-')) {
  // Using API Key format for newer Claude API versions
  api.defaults.headers.common['Authorization'] = `Bearer ${API_KEY}`;
  delete api.defaults.headers.common['x-api-key'];
}

export type ContentBlock = {
  type: string;
  text: string;
};

export type ApiResponse = {
  id: string;
  content: Array<ContentBlock> | string;
  model: string;
  role: 'assistant' | string;
  type?: string;
};

export const sendMessage = async (messages: Message[]): Promise<ApiResponse> => {
  try {
    console.log('Sending messages to Claude API:', messages);
    
    // Check if we should use mock mode (no API key or DEBUG_USE_MOCK=true)
    const useMockApi = !API_KEY || process.env.REACT_APP_DEBUG_USE_MOCK === 'true';
    
    if (useMockApi) {
      console.log('Using mock API due to missing API key or debug mode');
      return await sendMockMessage(messages);
    }
    
    // Format messages for Claude API
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const response = await api.post('', {
      model: 'claude-3-opus-20240229',
      messages: formattedMessages,
      max_tokens: 4000,
      temperature: 0.7
    });

    console.log('Claude API response:', response.data);
    
    // Handle different response formats
    let processedResponse = response.data;
    
    // If content is an array of blocks, extract text
    if (processedResponse && Array.isArray(processedResponse.content)) {
      const textContent = processedResponse.content
        .filter((block: ContentBlock) => block.type === 'text')
        .map((block: ContentBlock) => block.text)
        .join('\n');
      
      processedResponse.content = textContent;
    }
    
    return processedResponse;
  } catch (error) {
    console.error('Error sending message to Claude API:', error);
    // Fall back to mock API if real API fails
    console.log('Falling back to mock API due to error');
    return await sendMockMessage(messages);
  }
};

export default api;