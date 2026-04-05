import React, { useState, useRef, useEffect } from 'react';

function ChatInterface({ onLogout }) {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your AI assistant. How can I help you today?", sender: 'ai' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim() && !attachedFile) return;

    const newUserMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      attachment: attachedFile ? attachedFile.name : null
    };

    setMessages([...messages, newUserMessage]);
    setInputValue('');
    setAttachedFile(null);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        text: "This is a simulated response. Connect me to a backend API to make me smart!",
        sender: 'ai'
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setAttachedFile(file);
  };

  return (
    <div className="flex h-screen w-full bg-gray-900 overflow-hidden">
      
      {/* Sidebar (Hidden on small screens) */}
      <aside className="hidden md:flex flex-col w-64 bg-gray-950 border-r border-gray-800 p-4">
        <button className="flex items-center justify-center gap-2 w-full bg-transparent border border-gray-700 hover:bg-gray-800 text-gray-200 py-3 rounded-xl transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          New Chat
        </button>
        <div className="flex-1"></div>
        <button 
          onClick={onLogout}
          className="text-gray-400 hover:text-white py-2 px-4 rounded-lg hover:bg-gray-800 transition-colors text-left"
        >
          Log Out
        </button>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative">
        
        {/* Messages Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 pb-40">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] md:max-w-[75%] px-5 py-3 rounded-2xl ${
                  msg.sender === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-sm' 
                    : 'bg-gray-800 border border-gray-700 text-gray-100 rounded-bl-sm'
                }`}>
                  {msg.attachment && (
                    <div className="flex items-center gap-2 text-sm bg-black/20 px-3 py-2 rounded-lg mb-2 w-fit">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                      {msg.attachment}
                    </div>
                  )}
                  <p className="leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area Pinned to Bottom */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-gray-900 via-gray-900 to-transparent pt-10 pb-6 px-4 md:px-8">
          <div className="max-w-3xl mx-auto relative">
            
            {/* File Preview Floating Above Input */}
            {attachedFile && (
              <div className="absolute -top-12 left-0 bg-gray-800 border border-gray-700 text-gray-200 text-sm px-4 py-2 rounded-xl flex items-center gap-3 shadow-lg">
                <span className="truncate max-w-[200px]">{attachedFile.name}</span>
                <button onClick={() => setAttachedFile(null)} className="text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-full p-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
            )}

            <form 
              onSubmit={handleSend}
              className="flex items-end bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden shadow-2xl focus-within:ring-1 focus-within:ring-gray-500 transition-shadow"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
              />
              
              <button 
                type="button" 
                onClick={() => fileInputRef.current.click()}
                className="p-4 text-gray-400 hover:text-gray-200 transition-colors"
                title="Attach document"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
              </button>

              <input 
                type="text" 
                placeholder="Message your AI..." 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 bg-transparent border-none py-4 px-2 text-white focus:outline-none placeholder-gray-400"
              />

              <button 
                type="submit" 
                disabled={!inputValue.trim() && !attachedFile}
                className="p-4 m-1 bg-white text-gray-900 rounded-xl hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-white transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
              </button>
            </form>
            
            <p className="text-center text-xs text-gray-500 mt-3">
              AI can make mistakes. Consider verifying important information.
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}

export default ChatInterface;