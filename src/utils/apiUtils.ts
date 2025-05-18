/**
 * Utility functions for API-related operations
 */

import { Message } from '../store/chatStore';

// Default window size for context (number of messages to include)
const DEFAULT_CONTEXT_WINDOW_SIZE = 10;

/**
 * Windows the conversation to include only the most recent messages
 * plus the first message (which often contains system instructions)
 * 
 * @param messages The full array of conversation messages
 * @param windowSize The number of recent messages to include
 * @returns A windowed subset of messages
 */
export const windowConversation = (messages: Message[], windowSize: number = DEFAULT_CONTEXT_WINDOW_SIZE): Message[] => {
  if (!messages || messages.length === 0) return [];
  if (messages.length <= windowSize) return messages;
  
  // Always include the first message (often contains system instructions)
  const firstMessage = messages[0];
  
  // Get the most recent messages up to windowSize - 1 (to account for first message)
  const recentMessages = messages.slice(-(windowSize - 1));
  
  // Return the first message followed by the most recent messages
  return [firstMessage, ...recentMessages];
};

/**
 * Estimates the token count of a message
 * This is a rough estimation (4 chars ~= 1 token)
 * 
 * @param message The message content
 * @returns Estimated token count
 */
export const estimateTokenCount = (content: string): number => {
  if (!content) return 0;
  
  // Rough estimation: 4 characters ~= 1 token for English text
  return Math.ceil(content.length / 4);
};

/**
 * Helper function to create model parameter object for API calls
 * 
 * @param model The AI model to use
 * @param maxTokens Maximum tokens for response
 * @param temperature Temperature parameter for response randomness
 * @returns Model parameters object
 */
export const createModelParams = (
  model: string,
  maxTokens: number = 4000,
  temperature: number = 0.7
) => {
  return {
    model,
    max_tokens: maxTokens,
    temperature
  };
};
