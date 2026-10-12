import React from 'react';
import { ActiveTab } from '../types';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  userRole: 'customer' | 'owner' | 'guest';
  onOpenAuthModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  onOpenAuthModal,
}) => {
  const isHomeActive = activeTab === 'shop';
  const isDashboardActive = activeTab === 'customer-dashboard' || activeTab === 'owner-dashboard';
  const isAccountActive = activeTab === 'profile';

  const handleHomeClick = () => {
    setActiveTab('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDashboardClick = () => {
    if (userRole === 'owner') {
      setActiveTab('owner-dashboard');
    } else if (userRole === 'customer') {
      setActiveTab('customer-dashboard');
    } else {
      onOpenAuthModal();
    }
  };

  const handleAccountClick = () => {
    if (userRole === 'guest') {
      onOpenAuthModal();
    } else {
      setActiveTab('profile');
    }
  };

  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 w-full z-50 bg-white/95 dark:bg-[#0D0D0D]/95 backdrop-blur-md border-t border-gray-200 dark:border-[#262626] shadow-[0_-2px_12px_rgba(0,0,0,0.06)] h-14 sm:h-16 flex items-center justify-around px-4 sm:px-6 pb-[env(safe-area-inset-bottom,0px)] notranslate select-none"
      translate="no"
    >
      {/* 1. Home Logo Only */}
      <button
        type="button"
        onClick={handleHomeClick}
        aria-label="Home"
        title="Home"
        className={`flex items-center justify-center p-3 rounded-full transition-all cursor-pointer ${
          isHomeActive
            ? 'text-[#D10000] scale-110'
            : 'text-gray-400 dark:text-[#868686] hover:text-gray-800 dark:hover:text-white'
        }`}
      >
        <svg
          className="w-6 h-6 stroke-current stroke-2 fill-none"
          viewBox="0 0 24 24"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </button>

      {/* 2. Shield Logo Only */}
      <button
        type="button"
        onClick={handleDashboardClick}
        aria-label="Dashboard"
        title="Dashboard"
        className={`flex items-center justify-center p-3 rounded-full transition-all cursor-pointer ${
          isDashboardActive
            ? 'text-[#D10000] scale-110'
            : 'text-gray-400 dark:text-[#868686] hover:text-gray-800 dark:hover:text-white'
        }`}
      >
        <svg
          className="w-6 h-6 stroke-current stroke-2 fill-none"
          viewBox="0 0 24 24"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      </button>

      {/* 3. Account Logo Only */}
      <button
        type="button"
        onClick={handleAccountClick}
        aria-label="Account"
        title="Account"
        className={`flex items-center justify-center p-3 rounded-full transition-all cursor-pointer ${
          isAccountActive
            ? 'text-[#D10000] scale-110'
            : 'text-gray-400 dark:text-[#868686] hover:text-gray-800 dark:hover:text-white'
        }`}
      >
        <svg
          className="w-6 h-6 stroke-current stroke-2 fill-none"
          viewBox="0 0 24 24"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </button>
    </nav>
  );
};
