import React, { useState } from 'react';
import Login from './Auth/Login';
import Register from './Auth/Register';
import ChatInterface from './Interface/ChatInterface'

function App() {
  const [currentView, setCurrentView] = useState('login'); 

  return (
    <div className="min-h-screen w-full bg-gray-900 text-gray-100 font-sans flex flex-col">
      {currentView === 'login' && <Login onNavigate={setCurrentView} />}
      {currentView === 'register' && <Register onNavigate={setCurrentView} />}
      {currentView === 'chat' && <ChatInterface onLogout={() => setCurrentView('login')} />}
    </div>
  );
}

export default App;