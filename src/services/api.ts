import axios from 'axios';
import { Message } from '../store/chatStore';
import { sendMockMessage } from './mockApi';

// Using a proxy to avoid CORS issues in development
// The proxy is configured in src/setupProxy.js
const API_URL = '/api';  // This will use the proxy defined in setupProxy.js
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

    // Check payload size
    const payloadSize = JSON.stringify({
      model: 'claude-3-opus-20240229',
      messages: formattedMessages,
      max_tokens: 4000,
      temperature: 0.7
    }).length;

    console.log(`API payload size: ${(payloadSize / 1024 / 1024).toFixed(2)} MB`);

    // If payload is too large (>100MB), throw an error
    if (payloadSize > 100 * 1024 * 1024) {
      throw new Error('Payload size too large. Please reduce the size of your images or message history.');
    }

    const response = await api.post('/messages', {
      model: 'claude-3-opus-20240229',
      messages: formattedMessages,
      max_tokens: 4000,
      temperature: 0.7
    }, {
      timeout: 120000, // 2 minute timeout for large payloads
      maxContentLength: 100 * 1024 * 1024, // 100MB max content length
      maxBodyLength: 100 * 1024 * 1024 // 100MB max body length
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
  } catch (error: any) {
    console.error('Error sending message to Claude API:', error);

    // Format error message for UI display
    if (error.response) {
      // Server responded with an error
      const status = error.response.status;
      const data = error.response.data;

      if (status === 413) {
        throw new Error('Payload too large. Please reduce the size of your images or message history.');
      } else if (data && data.error) {
        throw new Error(`API Error: ${data.error.message || 'Unknown error'}`);
      } else {
        throw new Error(`API Error (${status}): ${data || 'Unknown error'}`);
      }
    } else if (error.request) {
      // Request was made but no response was received
      if (error.code === 'ECONNABORTED') {
        throw new Error('Request timed out. Your message may be too large.');
      }
      throw new Error('No response received from API. Please check your connection.');
    } else {
      // Something happened in setting up the request
      const errorMessage = error.message || 'Unknown error';
      if (errorMessage.includes('size too large')) {
        throw new Error('Message too large. Please reduce the size of your images or try splitting your message.');
      }
      throw new Error(`Error: ${errorMessage}`);
    }
  }
};

export default api;