import axios from 'axios';
import { Message } from '../store/chatStore';
import { sendMockMessage } from './mockApi';
import { windowConversation, createModelParams } from '../utils/apiUtils';

// Using a proxy to avoid CORS issues in development
// The proxy is configured in src/setupProxy.js
const API_URL = '/api';  // This will use the proxy defined in setupProxy.js
const API_KEY = process.env.REACT_APP_API_KEY || '';

if (!API_KEY) {
  console.warn('Taylor API key is not set. Set REACT_APP_API_KEY environment variable.');
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
  // Using API Key format for newer Taylor API versions
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

// Available AI models
export const AI_MODELS = {
  DEFAULT: 'claude-3-7-sonnet-20250219',
  SONNET: 'claude-3-7-sonnet-20250219',
  HAIKU: 'claude-3-5-haiku-20240307'
};

// Default model settings
const DEFAULT_MODEL = AI_MODELS.DEFAULT;
const DEFAULT_MAX_TOKENS = 4000;
const DEFAULT_TEMPERATURE = 0.7;

// Context window size (number of messages to include)
const DEFAULT_CONTEXT_WINDOW_SIZE = 10;

export const sendMessage = async (
  messages: Message[], 
  modelConfig: { 
    model?: string, 
    maxTokens?: number, 
    temperature?: number,
    contextWindowSize?: number
  } = {}
): Promise<ApiResponse> => {
  try {
    console.log('Sending messages to Taylor API:', messages);

    // Check if we should use mock mode (no API key or DEBUG_USE_MOCK=true)
    const useMockApi = !API_KEY

    if (useMockApi) {
      console.log('Using mock API due to missing API key or debug mode');
      return await sendMockMessage(messages);
    }

    // Get configuration or defaults
    const model = modelConfig.model || DEFAULT_MODEL;
    const maxTokens = modelConfig.maxTokens || DEFAULT_MAX_TOKENS;
    const temperature = modelConfig.temperature || DEFAULT_TEMPERATURE;
    const contextWindowSize = modelConfig.contextWindowSize || DEFAULT_CONTEXT_WINDOW_SIZE;
    
    // Window conversation to reduce token usage
    const windowedMessages = windowConversation(messages, contextWindowSize);
    
    // Format messages for Taylor API
    const formattedMessages = windowedMessages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    console.log(`Sending ${windowedMessages.length} of ${messages.length} messages using ${contextWindowSize} context window`);

    // Check payload size
    const payloadSize = JSON.stringify({
      model: model,
      messages: formattedMessages,
      max_tokens: maxTokens,
      temperature: temperature
    }).length;

    console.log(`API payload size: ${(payloadSize / 1024 / 1024).toFixed(2)} MB`);

    // If payload is too large (>100MB), throw an error
    if (payloadSize > 100 * 1024 * 1024) {
      throw new Error('Payload size too large. Please reduce the size of your images or message history.');
    }

    const response = await api.post('/messages', {
      model: model,
      messages: formattedMessages,
      max_tokens: maxTokens,
      temperature: temperature
    }, {
      timeout: 120000, // 2 minute timeout for large payloads
      maxContentLength: 100 * 1024 * 1024, // 100MB max content length
      maxBodyLength: 100 * 1024 * 1024 // 100MB max body length
    });

    console.log('Taylor API response:', response.data);
    
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
    console.error('Error sending message to Taylor API:', error);

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