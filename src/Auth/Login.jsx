import React, { useEffect, useState } from 'react';

function Login({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [message, setMessage] = useState('Checking session...');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

    useEffect(() => {
      const checkSession = async () => {
        setIsLoading(true); // Start loading immediately
        const storedToken = localStorage.getItem('accessToken');
        
        if (storedToken) {
          try {

            const apiUrl = import.meta.env.VITE_API_URL
            const response = await fetch('${apiUrl}/auth/verify', {
              headers: { 'Authorization': `Bearer ${storedToken}` }
            });

            if (response.ok) {
              const data = await response.json();
              sessionStorage.setItem('user_id', data.user_id);
              setAccessToken(storedToken);
              onNavigate('chat');
              return; 
            } 
            
            // If verify fails (401), try to refresh
            const newToken = await handleRefresh();
            if (newToken) {
              onNavigate('chat');
              return;

            }
          } catch (err) {
            console.error("Session check failed", err);
          }
        }
        
        // If no token or refresh failed, stop loading and stay on login
        setIsLoading(false);
        setMessage('Please sign in');
      };

      checkSession();
    }, []);

  const handleSubmit = async (e) => {
      e.preventDefault();
      setIsLoading(true);
      setError('');
      setSuccess(false);

      try {
        const res = await fetch('http://localhost:8000/auth/login/user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (res.ok) {
          setSuccess(true);
          const token = data.access_token;
          setAccessToken(token);
          localStorage.setItem('accessToken', token); 
          sessionStorage.setItem('user_id', data.user_id);

          // Wait 2 seconds so they can read the success message
          setTimeout(() => {
            onNavigate('chat');
          }, 2000);
        } else {
          // Show the specific error from FastAPI (e.g., "Email already registered")
          setError(data.detail || 'Login failed. Please try again.');
        }
      } catch (err) {
        setError('Could not connect to the server.');
        console.error('Login error error:', err);
      } finally {
        setIsLoading(false);
      }
    };

  const handleRefresh = async () => {
    const response = await fetch('http://localhost:8000/auth/refresh', {
      method: 'POST',
      credentials: 'include' // Crucial: sends the HttpOnly cookie
    });

    if (response.ok) {
      const data = await response.json();
      setAccessToken(data.access_token);
      // NEW: Update localStorage with the brand new token
      localStorage.setItem('accessToken', data.access_token);
      setMessage('Session refreshed successfully!');
      return data.access_token;
    } else {
      // NEW: If refresh fails, clear everything out
      setAccessToken(null);
      localStorage.removeItem('accessToken');
      setMessage('Please log in.');
      return null;
    }
  };

  const handleGuestMode = () => {
    // Generate a random ID for this session
    const guestId = `guest_${Math.random().toString(36).substring(2, 11)}`;
    
    // Save to sessionStorage (disappears when tab closes)
    sessionStorage.setItem('user_id', guestId);
    sessionStorage.setItem('is_guest', 'true'); // Flag to identify guests if needed
    
    onNavigate('chat');
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-dark-950">
      <div className="w-full max-w-sm animate-fade-in-up">
        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white tracking-tight">Renee</h1>
          <p className="text-dark-200 text-sm mt-2">Your AI assistant</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3.5 rounded-xl bg-dark-700 border border-dark-500 text-white placeholder-dark-200 focus:outline-none focus:border-dark-300 focus:ring-1 focus:ring-dark-300 transition-all duration-200 text-sm"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3.5 rounded-xl bg-dark-700 border border-dark-500 text-white placeholder-dark-200 focus:outline-none focus:border-dark-300 focus:ring-1 focus:ring-dark-300 transition-all duration-200 text-sm"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-white text-black font-medium py-3.5 rounded-xl hover:bg-gray-200 active:scale-[0.98] transition-all duration-200 text-sm disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Signing in...
              </span>
            ) : 'Sign In'}
          </button>
        </form>

        {/* Footer link */}
        <p className="text-dark-200 text-center mt-8 text-sm">
          Don't have an account?{' '}
          <span
            onClick={() => onNavigate('register')}
            className="text-white hover:underline cursor-pointer font-medium transition-colors"
          >
            Create one
          </span>
        </p>
        <p className="text-dark-200 text-center mt-2 text-sm">
          Try for Now?{' '}
          <span
            onClick={handleGuestMode}
            className="text-white hover:underline cursor-pointer font-medium transition-colors"
          >
            Guest Mode
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;
