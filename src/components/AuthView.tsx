import React, { useState } from 'react';
import { useAuth, GoogleAccountDetails } from '../context/AuthContext';
import { Mail, Lock, User as UserIcon, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';
import { GoogleAccountChooserModal } from './GoogleAccountChooserModal';

interface AuthViewProps {
  onLogin: (role: 'customer' | 'owner') => void;
  onContinueAsGuest?: () => void;
  onClose?: () => void;
  customPrompt?: string;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin, onContinueAsGuest, onClose, customPrompt }) => {
  const { signUp, signIn, signInWithGoogle } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const validateEmail = (emailStr: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(emailStr.trim());
  };

  const handleSelectGoogleAccount = async (selectedAccount: GoogleAccountDetails) => {
    setError('');
    setSuccessMsg('');
    setGoogleLoading(true);
    try {
      const result = await signInWithGoogle(selectedAccount);
      setSuccessMsg(`Authenticated as ${result.name} (${result.email})`);
      setTimeout(() => {
        setIsGoogleModalOpen(false);
        onLogin(result.role);
      }, 500);
    } catch (err: any) {
      console.error('Google sign in error:', err);
      setError(err?.message || 'Google sign in failed. Please try again.');
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const trimmedEmail = email.trim();
    const isOwnerEmail = trimmedEmail.toLowerCase() === 'neravatiabhigna@gmail.com';

    if (!trimmedEmail) {
      setError('Please enter your email address');
      return;
    }
    if (!validateEmail(trimmedEmail)) {
      setError('Please enter a valid email address (e.g. user@example.com)');
      return;
    }
    if (isSignUp && !fullName.trim()) {
      setError('Please enter your full name');
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

    // Strict Owner Credential Validation
    if (isOwnerEmail && password !== 'Bhuvi@2006') {
      setError('Invalid password for Owner account (neravatiabhigna@gmail.com). Access denied.');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        if (isOwnerEmail) {
          await signUp(trimmedEmail, password, fullName.trim() || 'Neravati Abhigna');
          setSuccessMsg('Owner account created successfully! Redirecting to Owner Dashboard...');
          setTimeout(() => {
            onLogin('owner');
          }, 400);
        } else {
          await signUp(trimmedEmail, password, fullName.trim());
          setSuccessMsg('Account created successfully! Logging you in...');
          setTimeout(() => {
            onLogin('customer');
          }, 400);
        }
      } else {
        await signIn(trimmedEmail, password);
        // Determine role: Only neravatiabhigna@gmail.com with Bhuvi@2006 gets Owner access
        if (isOwnerEmail && password === 'Bhuvi@2006') {
          setSuccessMsg('Owner authenticated! Opening Owner Dashboard...');
          setTimeout(() => {
            onLogin('owner');
          }, 400);
        } else {
          onLogin('customer');
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err?.message || 'Authentication failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen dark:bg-[#0D0D0D] bg-neutral-950 flex flex-col items-center justify-center p-4 sm:p-6 font-['Inter',sans-serif] relative overflow-hidden">
      {/* Dynamic Background Glow Elements */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#161616] border border-[#2A2A2A] p-6 sm:p-8 rounded-2xl shadow-2xl relative z-10 text-neutral-100">
        {onClose && (
          <button
            onClick={onClose}
            type="button"
            className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-lg leading-none">close</span>
          </button>
        )}
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center gap-2 mb-3">
            <span className="text-3xl sm:text-4xl font-black tracking-tighter uppercase font-['Bebas_Neue',sans-serif] text-white">
              EDGE<span className="text-red-500">X</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
              EST. 2026
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            {isSignUp ? 'Create Your Account' : 'Sign In to Your Account'}
          </h2>
          {customPrompt ? (
            <div className="mt-2.5 px-3 py-2 bg-red-950/40 border border-red-900/60 rounded-xl">
              <p className="text-red-400 text-xs font-semibold">
                {customPrompt}
              </p>
            </div>
          ) : (
            <p className="text-neutral-400 text-xs sm:text-sm mt-1">
              {isSignUp ? 'Join the future of high-performance streetwear footwear.' : 'Welcome back to the EDGEX luxury sneaker sanctuary.'}
            </p>
          )}
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-semibold p-3.5 rounded-xl mb-5 flex items-start gap-2.5">
            <span className="text-red-400 mt-0.5 shrink-0">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold p-3.5 rounded-xl mb-5 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Google Sign-in Button */}
        <button
          type="button"
          onClick={() => setIsGoogleModalOpen(true)}
          disabled={googleLoading || loading}
          className="w-full bg-white hover:bg-neutral-100 text-neutral-900 font-semibold text-sm py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-3 cursor-pointer shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group active:scale-[0.99]"
        >
          {googleLoading ? (
            <div className="flex items-center gap-2 text-neutral-800">
              <div className="w-4 h-4 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
              <span>Connecting to Google...</span>
            </div>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>

        <div className="my-5 flex items-center justify-between">
          <div className="h-px bg-neutral-800 flex-1" />
          <span className="text-[11px] text-neutral-500 px-3 font-semibold tracking-wider uppercase">or continue with email</span>
          <div className="h-px bg-neutral-800 flex-1" />
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#0D0D0D] border border-neutral-800 text-white pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder:text-neutral-600"
                  placeholder="e.g. Alex Vance"
                  autoComplete="name"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0D0D0D] border border-neutral-800 text-white pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder:text-neutral-600"
                placeholder="name@example.com"
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Password
              </label>
              {!isSignUp && (
                <button
                  type="button"
                  onClick={() => alert('Password reset link sent to your registered email address!')}
                  className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors cursor-pointer"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0D0D0D] border border-neutral-800 text-white pl-10 pr-11 py-2.5 rounded-xl text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder:text-neutral-600"
                placeholder="•••••••• (min 6 characters)"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-500 hover:text-neutral-300 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-500 active:scale-[0.99] text-white font-bold uppercase tracking-wider py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Verifying...</span>
              </div>
            ) : (
              <>
                <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Sign In / Sign Up Switcher */}
        <div className="mt-5 text-center text-xs sm:text-sm text-neutral-400">
          {isSignUp ? 'Already have an account?' : "Don't have an EDGEX account?"}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
              setSuccessMsg('');
            }}
            className="text-white font-bold ml-1.5 hover:text-red-400 transition-colors underline-offset-4 hover:underline cursor-pointer"
          >
            {isSignUp ? 'Sign In' : 'Create One'}
          </button>
        </div>

        {/* Guest Access Option */}
        {onContinueAsGuest && (
          <div className="mt-6 pt-4 border-t border-neutral-800/80 text-center">
            <button
              type="button"
              onClick={onContinueAsGuest}
              className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors py-1 cursor-pointer"
            >
              Continue exploring as guest →
            </button>
          </div>
        )}
      </div>

      {/* Google Account Chooser Modal */}
      <GoogleAccountChooserModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSelectAccount={handleSelectGoogleAccount}
        isLoading={googleLoading}
      />
    </div>
  );
};
