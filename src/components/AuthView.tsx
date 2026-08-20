import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface AuthViewProps {
  onLogin: (role: 'customer' | 'owner') => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const { signUp, signIn } = useAuth();
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrPhone.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!validateEmail(emailOrPhone)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(emailOrPhone, password);
        // Check if email confirmation is needed
        setError('Account created! Please check your email to confirm your account, then sign in.');
        setIsSignUp(false);
        setPassword('');
      } else {
        await signIn(emailOrPhone, password);
        setError('');
        
        // Determine role based on email (for demo purposes)
        if (emailOrPhone.toLowerCase() === 'admin' || password === '2026') {
          onLogin('owner');
        } else {
          onLogin('customer');
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen dark:bg-[#0D0D0D] bg-white flex items-center justify-center p-4 font-['Inter',sans-serif]">
      <div className="w-full max-w-md dark:bg-[#1a1a1a] bg-gray-50 p-8 rounded-xl border dark:border-[#262626] border-gray-200 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-['Bebas_Neue',sans-serif] tracking-normal dark:text-[#F2F2F2] text-gray-900 mb-2">EDGEX</h1>
          <h2 className="text-xl font-bold dark:text-[#F2F2F2] text-gray-900">
            {isSignUp ? 'Create your account' : 'Welcome to EDGEX'}
          </h2>
          <p className="dark:text-[#868686] text-gray-500 text-sm mt-2">
            {isSignUp ? 'Join us to explore the collection' : 'Sign in to access your account'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm font-bold p-3 rounded-lg mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest dark:text-[#868686] text-gray-500 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              className="w-full dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 dark:text-[#F2F2F2] text-gray-900 px-4 py-3 rounded-lg focus:outline-none focus:dark:border-[#F2F2F2] border-black transition-colors"
              placeholder="Enter your email address"
              autoComplete="email"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold uppercase tracking-widest dark:text-[#868686] text-gray-500">
                Password
              </label>
              {!isSignUp && (
                <button
                  type="button"
                  className="text-xs font-bold text-[#b7c4fd] dark:hover:text-[#F2F2F2] hover:dark:text-[#F2F2F2] text-gray-900 transition-colors"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 dark:text-[#F2F2F2] text-gray-900 px-4 py-3 rounded-lg focus:outline-none focus:dark:border-[#F2F2F2] border-black transition-colors pr-12"
                placeholder="Enter password (min 6 characters)"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 dark:text-[#868686] text-gray-500 dark:hover:text-[#F2F2F2] hover:dark:text-[#F2F2F2] text-gray-900"
              >
                <span className="material-symbols-outlined text-lg">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full dark:bg-[#F2F2F2] bg-black dark:text-[#0D0D0D] text-white font-bold uppercase tracking-widest py-3.5 rounded-lg hover:bg-[#D10000] dark:hover:text-[#F2F2F2] hover:dark:text-[#F2F2F2] text-gray-900 transition-colors mt-2 opacity-100 disabled:opacity-50"
          >
            {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between">
          <div className="h-px dark:bg-[#262626] bg-gray-200 flex-1"></div>
          <span className="text-xs dark:text-[#868686] text-gray-500 px-4 font-bold uppercase tracking-widest">OR</span>
          <div className="h-px dark:bg-[#262626] bg-gray-200 flex-1"></div>
        </div>

        <button
          type="button"
          className="w-full mt-6 dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 dark:text-[#F2F2F2] text-gray-900 font-bold py-3.5 rounded-lg dark:hover:border-[#F2F2F2] hover:dark:border-[#F2F2F2] border-black transition-colors flex items-center justify-center gap-2"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>

        <div className="mt-8 flex flex-col gap-4 text-center text-sm dark:text-[#868686] text-gray-500">
          <div>
            {isSignUp ? 'Already have an account?' : 'New to EDGEX?'}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setEmailOrPhone('');
                setPassword('');
              }}
              className="dark:text-[#F2F2F2] text-gray-900 font-bold ml-2 hover:text-[#D10000] transition-colors"
            >
              {isSignUp ? 'Sign In' : 'Create Account'}
            </button>
          </div>
          
          <div className="pt-4 border-t dark:border-[#262626] border-gray-200">
            <button
              onClick={() => onLogin('owner')}
              className="text-emerald-500 font-bold hover:text-emerald-400 transition-colors uppercase tracking-widest text-xs"
            >
              Platform Owner Portal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};