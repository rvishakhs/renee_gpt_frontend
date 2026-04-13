import { data } from 'autoprefixer';
import React, { useState, useRef, useEffect } from 'react';

function ChatInterface({ onNavigate }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt'); // Default model
  const [showModelMenu, setShowModelMenu] = useState(false);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  const apiUrl = import.meta.env.VITE_API_URL
  const models = [
  { id: 'gpt', name: 'Chat GPT', desc: 'Fast & Basic inferencing' },
  { id: 'deepseek', name: 'Renee GPT', desc: 'will take a minute to start (Having a snooze in AWS)' }
];

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      const userId = sessionStorage.getItem('user_id');

      // Don't fetch if it's a guest or no ID exists
      if (!userId || isGuest) return;

      try {
        const res = await fetch(`${apiUrl}/chat/sessions/${userId}/history`);
        if (res.ok) {
          const history = await res.json();
          // Update your messages state with the DB records
          setMessages(history); 
        }
      } catch (err) {
        console.error("Failed to load history:", err);
      }
    };

    fetchHistory();
  }, []);

  const userId = sessionStorage.getItem('user_id');
  const isGuest = sessionStorage.getItem('is_guest') === 'true';


  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() && !attachedFile) return;

    const fileToBase64 = (file) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });

    let processedFileData = null;
    if (attachedFile) {
      try {
        // 1. Convert to Base64 first
        const base64String = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(attachedFile);
          reader.onload = () => resolve(reader.result);
          reader.onerror = error => reject(error);
        });

        // 2. Build the object structure Python expects
        processedFileData = {
          name: attachedFile.name,
          content: base64String, // The long string
          type: attachedFile.type
        };
        console.log("File processed successfully:", attachedFile.name);
      } catch (err) {
        console.error("File processing failed:", err);
      }
    }

    const newUserMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      attachment: attachedFile ? attachedFile.name : null,
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue('');
    setAttachedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsTyping(true);

    // 1. Create a placeholder for the AI response
  const aiResponseId = Date.now() + 1;
  const aiPlaceholder = {
    id: aiResponseId,
    text: '', 
    sender: 'Renee_backend',
  };
  setMessages((prev) => [...prev, aiPlaceholder]);
  try {
      const res = await fetch('${apiUrl}/chat/sessions/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
              session_id: userId, 
              user_message: newUserMessage.text,
              attachedFile : processedFileData,
              model: selectedModel
          }),
      });

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullText = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      // 3. Decode the chunk and parse SSE format "data: {...}"
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const content = line.replace('data: ', '').trim();
          
          if (content === '[DONE]') break;

          try {
            const parsed = JSON.parse(content);
            if (parsed.token) {
              fullText += parsed.token;
              
              // 4. Update the UI with the new token immediately
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === aiResponseId ? { ...msg, text: fullText } : msg
                )
              );
            }
          } catch (e) {
            console.error("Error parsing stream chunk", e);
          }
        }
      }
    }
    setIsTyping(false);
  } catch (error) {
    console.error('Error fetching streaming AI response:', error);
    // Update the message to show an error occurred
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === aiResponseId ? { ...msg, text: "Error: Connection lost." } : msg
      )
    );
  } finally {
      setIsTyping(false);
  }
  };

  const onLogout = () => {
      localStorage.removeItem('accessToken');
      onNavigate('login')
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setAttachedFile(file);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const isEmptyChat = messages.length === 0;

  return (
    <div className="flex h-screen w-full bg-dark-950 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative z-40 h-full w-64 bg-dark-900 border-r border-dark-700/50 flex flex-col transition-transform duration-300 ease-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-3">
          <button
            className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-dark-100 hover:bg-dark-700 hover:text-white transition-all duration-200 text-sm"
            onClick={() => {
              setMessages([]);
              setSidebarOpen(false);
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            New chat
          </button>
        </div>

        <div className="flex-1 px-3 overflow-y-auto">
          {messages.length > 0 && (
            <div className="text-xs text-dark-300 px-3 py-2">Today</div>
          )}
        </div>

        <div className="p-3 border-t border-dark-700/50">
          <button
            onClick={onLogout}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-dark-200 hover:bg-dark-700 hover:text-white transition-all duration-200 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Log out
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col  relative min-w-0">
        {/* Top bar */}
        <header className="flex items-center h-12 px-4 border-b border-dark-700/30 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-1.5 -ml-1 rounded-lg text-dark-200 hover:text-white hover:bg-dark-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-sm font-medium text-dark-100 ml-2 md:ml-0">Renee</span>
        </header>

            {isGuest && (
        <div className="sticky top-0 z-10 bg-amber-500/10 border-b border-amber-500/20 backdrop-blur-md">
          <p className="text-amber-500 text-[11px] font-medium text-center py-2 flex items-center justify-center gap-2">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Guest Session: History won't be saved.
          </p>
        </div>
      )}

        {/* Messages or Empty State */}
        <div className="flex-1 overflow-y-auto">
          {isEmptyChat ? (
            <div className="flex flex-col items-center justify-center h-full px-4 animate-fade-in">
              <h2 className="text-2xl md:text-3xl font-semibold text-white mb-2 tracking-tight">
                What can I help with?
              </h2>
              <p className="text-dark-200 text-sm">
                Ask me anything to get started.
              </p>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto w-full px-4 md:px-0 py-6 space-y-6">
              {messages.map((msg, index) => (
                <div
                  key={msg.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${Math.min(index * 0.05, 0.3)}s` }}
                >
                  {msg.sender === 'user' ? (
                    /* User message */
                    <div className="flex justify-end">
                      <div className="max-w-[80%] md:max-w-[70%]">
                        {msg.attachment && (
                          <div className="flex items-center gap-2 text-xs bg-dark-700 border border-dark-500 px-3 py-2 rounded-lg mb-2 ml-auto w-fit text-dark-100">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            {msg.attachment}
                          </div>
                        )}
                        <div className="bg-dark-600 text-white px-4 py-3 rounded-2xl rounded-br-md text-sm leading-relaxed">
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* AI message */
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-dark-600 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-semibold text-dark-100">R</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        {msg.text ? (
                          <p className="text-sm leading-relaxed text-dark-100">
                            {msg.text}
                          </p>
                        ) : (
                          <div className="flex items-center gap-1.5 pt-2">
                            {[0, 1, 2].map((i) => (
                              <span
                                key={i}
                                className="w-1.5 h-1.5 bg-dark-200 rounded-full"
                                style={{
                                  animation: `pulse-dot 1.4s ease-in-out ${i * 0.2}s infinite`,
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className={`shrink-0 px-4 md:px-0 pb-4 md:pb-6 ${isEmptyChat ? 'pt-0' : 'pt-2'}`}>
          <div className="max-w-2xl mx-auto w-full relative">
              {showModelMenu && (
              <div className="absolute bottom-full mb-3 left-0 w-64 bg-dark-800 border border-dark-500 rounded-2xl shadow-2xl p-2 z-50 animate-scale-in">
                <div className="text-[10px] font-bold text-dark-400 px-3 py-1 uppercase tracking-wider">Select Model</div>
                {models.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedModel(m.id);
                      setShowModelMenu(false);
                    }}
                    className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl hover:bg-dark-700 transition-colors group"
                  >
                    <div className="text-left">
                      <div className="text-sm font-medium text-white">{m.name}</div>
                      <div className="text-[10px] text-dark-300">{m.desc}</div>
                    </div>
                    {selectedModel === m.id && (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
            {/* File preview */}
            {attachedFile && (
              <div className="mb-2 animate-scale-in">
                <div className="inline-flex items-center gap-2 bg-dark-700 border border-dark-500 text-dark-100 text-xs px-3 py-2 rounded-lg">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  <span className="truncate max-w-50">{attachedFile.name}</span>
                  <button
                    onClick={() => setAttachedFile(null)}
                    className="text-dark-300 hover:text-white transition-colors ml-1"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            <form
              onSubmit={handleSend}
              className="flex items-end bg-dark-800 border border-dark-500 rounded-2xl overflow-hidden transition-all duration-200 focus-within:border-dark-400 focus-within:shadow-[0_0_0_1px_rgba(255,255,255,0.05)]"
            >
              {/* Model Selector Button */}
              <button
                type="button"
                onClick={() => setShowModelMenu(!showModelMenu)}
                className={`p-3.5 mb-0.5  transition-colors shrink-0 ${showModelMenu ? 'text-white' : 'text-dark-300 hover:text-white'}`}
                title="Change Model"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 20 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="p-3.5 text-dark-300 hover:text-white transition-colors shrink-0"
                title="Attach file"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>

              <textarea
                ref={inputRef}
                placeholder="Ask anything..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                className="flex-1 bg-transparent py-3.5 px-1 text-white text-sm focus:outline-none placeholder-dark-300 resize-none max-h-32 leading-relaxed"
                style={{ fieldSizing: 'content' }}
              />

              <button
                type="submit"
                disabled={!inputValue.trim() && !attachedFile}
                className="p-2 mx-2 my-2.5   bg-white text-black rounded-xl hover:bg-gray-200 active:scale-95 disabled:opacity-20 disabled:hover:bg-white transition-all duration-150 shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </button>
            </form>

            <p className="text-center text-[11px] text-dark-300 mt-2.5">
              Renee can make mistakes. Verify important information.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ChatInterface;
