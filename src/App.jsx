import React, { useState } from 'react';
import Login from './Auth/Login';
import Register from './Auth/Register';
import ChatInterface from './Interface/ChatInterface';

function App() {
  const [currentView, setCurrentView] = useState('login');

  return (
    <div className="min-h-screen w-full bg-dark-950 text-accent font-sans flex flex-col">
      <div className="flex-1 flex flex-col animate-fade-in" key={currentView}>
        {currentView === 'login' && <Login onNavigate={setCurrentView} />}
        {currentView === 'register' && <Register onNavigate={setCurrentView} />}
        {currentView === 'chat' && <ChatInterface onLogout={() => setCurrentView('login')} />}
      </div>
    </div>
  );
}

export default App;
