import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
};

export type ChatSession = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
};

type ChatStore = {
  sessions: ChatSession[];
  currentSessionId: string | null;
  
  // Actions
  createSession: () => void;
  addMessage: (content: string, role: 'user' | 'assistant') => void;
  setCurrentSession: (sessionId: string) => void;
  clearSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  updateSessionTitle: (sessionId: string, title: string) => void;
  
  // Selectors
  getCurrentSession: () => ChatSession | undefined;
};

const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      sessions: [],
      currentSessionId: null,
      
      createSession: () => {
        const newSession: ChatSession = {
          id: Date.now().toString(),
          title: 'New Chat',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        set((state) => {
          // Check if this would create a duplicate session
          if (state.sessions.some(s => s.id === newSession.id)) {
            // If it would, just set the current session
            return { currentSessionId: newSession.id };
          }

          return {
            sessions: [...state.sessions, newSession],
            currentSessionId: newSession.id,
          };
        });
      },
      
      addMessage: (content, role) => {
        const { currentSessionId } = get();
        
        if (!currentSessionId) return;
        
        const newMessage: Message = {
          id: Date.now().toString(),
          content,
          role,
          timestamp: Date.now(),
        };
        
        set((state) => ({
          sessions: state.sessions.map((session) => 
            session.id === currentSessionId 
              ? {
                  ...session,
                  messages: [...session.messages, newMessage],
                  updatedAt: Date.now(),
                  title: session.messages.length === 0 && role === 'user' 
                    ? content.substring(0, 30) + (content.length > 30 ? '...' : '')
                    : session.title,
                }
              : session
          ),
        }));
      },
      
      setCurrentSession: (sessionId) => {
        set({ currentSessionId: sessionId });
      },
      
      clearSession: (sessionId) => {
        set((state) => ({
          sessions: state.sessions.map((session) => 
            session.id === sessionId 
              ? { ...session, messages: [] }
              : session
          ),
        }));
      },
      
      deleteSession: (sessionId) => {
        const { currentSessionId, sessions } = get();
        const filteredSessions = sessions.filter((session) => session.id !== sessionId);
        
        set((state) => ({
          sessions: filteredSessions,
          currentSessionId: 
            currentSessionId === sessionId 
              ? filteredSessions.length > 0 
                ? filteredSessions[0].id 
                : null
              : currentSessionId,
        }));
      },
      
      updateSessionTitle: (sessionId, title) => {
        set((state) => ({
          sessions: state.sessions.map((session) => 
            session.id === sessionId 
              ? { ...session, title }
              : session
          ),
        }));
      },
      
      getCurrentSession: () => {
        const { currentSessionId, sessions } = get();
        return sessions.find((session) => session.id === currentSessionId);
      },
    }),
    {
      name: 'Taylor-chat-storage',
    }
  )
);

export default useChatStore;