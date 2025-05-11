import React from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';

function App() {
  return (
    <div className="flex h-screen bg-claude-background">
      <Sidebar />
      <ChatWindow />
    </div>
  );
}

export default App;
