import React from 'react';
import useChatStore from '../store/chatStore';

const Sidebar: React.FC = () => {
  const {
    sessions,
    currentSessionId,
    createSession,
    setCurrentSession,
    deleteSession
  } = useChatStore();

  // Get unique sessions by ID to prevent duplicates
  const uniqueSessions = Object.values(
    sessions.reduce((acc, session) => {
      if (!acc[session.id]) {
        acc[session.id] = session;
      }
      return acc;
    }, {} as Record<string, typeof sessions[0]>)
  );

  // Sort sessions by updatedAt (newest first)
  const sortedSessions = [...uniqueSessions].sort((a, b) => b.updatedAt - a.updatedAt);

  const handleCreateSession = () => {
    // Only create a new session if we're not going to create a duplicate
    createSession();
  };

  return (
    <div className="h-screen w-64 bg-claude-gray border-r border-claude-border flex flex-col">
      <div className="p-4">
        <button
          onClick={handleCreateSession}
          className="w-full py-2 px-4 bg-white border border-claude-border rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center"
        >
          <span className="mr-2">+</span> New chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {sortedSessions.map((session) => (
          <div
            key={session.id}
            className={`p-3 border-b border-claude-border cursor-pointer ${
              currentSessionId === session.id ? 'bg-white' : 'hover:bg-gray-100'
            }`}
            onClick={() => setCurrentSession(session.id)}
          >
            <div className="flex justify-between items-center">
              <div className="truncate flex-1">{session.title}</div>
              {currentSessionId === session.id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSession(session.id);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              )}
            </div>
            <div className="text-xs text-gray-500">
              {new Date(session.updatedAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;