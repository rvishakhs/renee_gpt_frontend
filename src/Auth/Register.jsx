import React, { useState } from 'react';

function Register({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(''); // New state for error messages
  const [success, setSuccess] = useState(false); // New state for success feedback

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('http://localhost:8000/auth/register/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        // Wait 2 seconds so they can read the success message
        setTimeout(() => {
          onNavigate('login');
        }, 2000);
      } else {
        // Show the specific error from FastAPI (e.g., "Email already registered")
        setError(data.detail || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('Could not connect to the server.');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-dark-950">
      <div className="w-full max-w-sm animate-fade-in-up">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white tracking-tight">Renee</h1>
          <p className="text-dark-200 text-sm mt-2">Create your account</p>
        </div>

        {/* --- Feedback Messages --- */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-500 text-xs text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/50 text-emerald-500 text-xs text-center">
            Success! Redirecting to login...
          </div>
        )}

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
            disabled={isLoading || success}
            className="w-full bg-white text-black font-medium py-3.5 rounded-xl hover:bg-gray-200 active:scale-[0.98] transition-all duration-200 text-sm disabled:opacity-50"
          >
            {isLoading ? 'Creating account...' : success ? 'Success!' : 'Create Account'}
          </button>
        </form>

        <p className="text-dark-200 text-center mt-8 text-sm">
          Already have an account?{' '}
          <span
            onClick={() => onNavigate('login')}
            className="text-white hover:underline cursor-pointer font-medium transition-colors"
          >
            Sign in
          </span>
        </p>
      </div>
    </div>
  );
}

export default Register;