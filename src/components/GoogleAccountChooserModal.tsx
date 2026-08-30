import React, { useState } from 'react';
import { GoogleAccountDetails } from '../context/AuthContext';
import { User, X, ShieldCheck, Check } from 'lucide-react';

interface GoogleAccountChooserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (account: GoogleAccountDetails) => void;
  isLoading?: boolean;
}

export const GoogleAccountChooserModal: React.FC<GoogleAccountChooserModalProps> = ({
  isOpen,
  onClose,
  onSelectAccount,
  isLoading = false,
}) => {
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [customError, setCustomError] = useState('');
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError('');
    const trimmed = customEmail.trim();
    if (!trimmed) {
      setCustomError('Please enter your Google email address');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setCustomError('Please enter a valid email address (e.g. yourname@gmail.com)');
      return;
    }

    const isOwner = ['neravatiabhigna@gmail.com', 'neravatiabhigna29@gmail.com'].includes(trimmed.toLowerCase());
    const fallbackName = customName.trim() || (trimmed.split('@')[0]);

    setSelectedEmail(trimmed);
    onSelectAccount({
      email: trimmed,
      name: isOwner ? 'Neravati Abhigna (Owner)' : fallbackName,
      role: isOwner ? 'owner' : 'customer',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Google Sign-in Card */}
      <div 
        className="w-full max-w-[440px] bg-[#1a1a1a] text-neutral-100 rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-neutral-800/80 relative">
          <button
            onClick={onClose}
            type="button"
            disabled={isLoading}
            className="absolute top-5 right-5 p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Close Google sign-in dialog"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            {/* Official Google G Logo */}
            <div className="w-8 h-8 rounded-full bg-white p-1.5 flex items-center justify-center shadow-sm shrink-0">
              <svg viewBox="0 0 24 24" className="w-full h-full">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-snug">Sign in with Google</h2>
              <p className="text-xs text-neutral-400">Continue to <span className="text-neutral-200 font-semibold">EDGEX</span></p>
            </div>
          </div>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="p-8 text-center space-y-3 bg-[#161616]">
            <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold text-white">
              Signing in as {selectedEmail || customEmail || 'Google User'}...
            </p>
            <p className="text-xs text-neutral-400">Connecting securely with Google authentication</p>
          </div>
        )}

        {/* Enter Google Account Details Form */}
        {!isLoading && (
          <div className="p-5">
            <form onSubmit={handleCustomSubmit} className="p-4 bg-neutral-900 rounded-xl border border-neutral-800 space-y-3.5 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-neutral-400" />
                  Enter Google Account Details
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                  Google Email
                </label>
                <input
                  type="email"
                  placeholder="Google Email (e.g. user@gmail.com)"
                  value={customEmail}
                  onChange={(e) => {
                    setCustomEmail(e.target.value);
                    if (customError) setCustomError('');
                  }}
                  className="w-full bg-neutral-950 border border-neutral-700 text-white placeholder:text-neutral-500 px-3.5 py-2.5 rounded-lg text-xs focus:outline-none focus:border-red-500 transition-colors"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                  Full Name <span className="text-neutral-500 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Full Name (optional)"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 text-white placeholder:text-neutral-500 px-3.5 py-2.5 rounded-lg text-xs focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              {customError && (
                <p className="text-[11px] text-red-400 font-medium">{customError}</p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-[#D10000] hover:bg-[#b00000] active:bg-[#900000] text-white text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md mt-2"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Continue with this Google Account</span>
              </button>
            </form>
          </div>
        )}

        {/* Footer Security Notice */}
        <div className="p-4 bg-[#141414] border-t border-neutral-800 text-[11px] text-neutral-400 leading-relaxed">
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p>
              To continue, Google will share your name, email address, language preference, and profile picture with <strong className="text-neutral-200">EDGEX</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

