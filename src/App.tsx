import React from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';

function App() {
  return (
    <div className="flex h-screen bg-Taylor-background">
      <Sidebar />
      <ChatWindow />
    </div>
  );
}

export default App;
