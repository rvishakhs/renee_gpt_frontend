import React, { useState } from 'react';

function Register({ onNavigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    console.log("Registering:", email);
    setTimeout(() => {
      onNavigate('chat');
    }, 400);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-dark-950">
      <div className="w-full max-w-sm animate-fade-in-up">
        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white tracking-tight">Renee</h1>
          <p className="text-dark-200 text-sm mt-2">Create your account</p>
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
                Creating account...
              </span>
            ) : 'Create Account'}
          </button>
        </form>

        {/* Footer link */}
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
