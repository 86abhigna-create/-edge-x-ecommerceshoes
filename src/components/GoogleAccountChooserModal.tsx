import React, { useState } from 'react';
import { GoogleAccountDetails } from '../context/AuthContext';
import { User, Plus, X, ArrowRight, ShieldCheck, Check } from 'lucide-react';

interface GoogleAccountChooserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount: (account: GoogleAccountDetails) => void;
  isLoading?: boolean;
}

export const LINKED_GOOGLE_ACCOUNTS: (GoogleAccountDetails & { subtitle: string })[] = [
  {
    email: 'neravatiabhigna29@gmail.com',
    name: 'Neravati Abhigna',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    role: 'customer',
    subtitle: 'Primary Google Account (Active)',
  },
  {
    email: 'neravatiabhigna@gmail.com',
    name: 'Neravati Abhigna',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    role: 'owner',
    subtitle: 'Store Owner Account',
  },
  {
    email: 'alex.vance@gmail.com',
    name: 'Alex Vance',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'customer',
    subtitle: 'Verified Sneakerhead Member',
  },
  {
    email: 'jordan.brooks@gmail.com',
    name: 'Jordan Brooks',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'customer',
    subtitle: 'Personal Google Workspace',
  },
];

export const GoogleAccountChooserModal: React.FC<GoogleAccountChooserModalProps> = ({
  isOpen,
  onClose,
  onSelectAccount,
  isLoading = false,
}) => {
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [customError, setCustomError] = useState('');
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAccountClick = (account: GoogleAccountDetails) => {
    if (isLoading) return;
    setSelectedEmail(account.email);
    onSelectAccount(account);
  };

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

    const isOwner = trimmed.toLowerCase() === 'neravatiabhigna@gmail.com';
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
            aria-label="Close Google account chooser"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-3">
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
              <p className="text-xs text-neutral-400">Choose an account to continue to <span className="text-neutral-200 font-semibold">EDGEX</span></p>
            </div>
          </div>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="p-8 text-center space-y-3 bg-[#161616]">
            <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold text-white">
              Signing in as {selectedEmail || 'Google User'}...
            </p>
            <p className="text-xs text-neutral-400">Connecting securely with Google authentication</p>
          </div>
        )}

        {/* Accounts List */}
        {!isLoading && (
          <div className="p-4 space-y-2 max-h-[380px] overflow-y-auto">
            <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 px-2 pt-1 pb-1">
              Available Linked Google Accounts
            </p>

            {LINKED_GOOGLE_ACCOUNTS.map((acc) => {
              const isOwner = acc.role === 'owner';
              return (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleAccountClick(acc)}
                  className="w-full p-3 rounded-xl bg-neutral-900/90 hover:bg-neutral-800/90 border border-neutral-800 hover:border-neutral-700 transition-all flex items-center justify-between text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={acc.avatarUrl}
                      alt={acc.name}
                      className="w-10 h-10 rounded-full object-cover border border-neutral-700 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-bold text-white truncate group-hover:text-red-400 transition-colors">
                          {acc.name}
                        </p>
                        {isOwner && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                            Owner
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400 truncate">{acc.email}</p>
                      <p className="text-[10px] text-neutral-500 truncate mt-0.5">{acc.subtitle}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                </button>
              );
            })}

            {/* Custom Google Account Input Toggle */}
            {!showCustomInput ? (
              <button
                type="button"
                onClick={() => setShowCustomInput(true)}
                className="w-full p-3 rounded-xl bg-neutral-900/40 hover:bg-neutral-900 border border-dashed border-neutral-700 hover:border-neutral-500 transition-colors flex items-center gap-3 text-left group cursor-pointer mt-3"
              >
                <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 group-hover:text-white shrink-0">
                  <Plus className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-neutral-200 group-hover:text-white">Use another Google account</p>
                  <p className="text-[10px] text-neutral-500">Sign in with any Gmail or Workspace email</p>
                </div>
              </button>
            ) : (
              <form onSubmit={handleCustomSubmit} className="p-3.5 bg-neutral-900 rounded-xl border border-neutral-700 mt-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-neutral-400" />
                    Enter Google Account Details
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomInput(false);
                      setCustomError('');
                    }}
                    className="text-[11px] text-neutral-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                <input
                  type="email"
                  placeholder="Google Email (e.g. user@gmail.com)"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 text-white px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-red-500"
                  autoFocus
                />

                <input
                  type="text"
                  placeholder="Full Name (optional)"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 text-white px-3 py-2 rounded-lg text-xs focus:outline-none focus:border-red-500"
                />

                {customError && (
                  <p className="text-[11px] text-red-400 font-medium">{customError}</p>
                )}

                <button
                  type="submit"
                  className="w-full py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  Continue with this Google Account
                </button>
              </form>
            )}
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
