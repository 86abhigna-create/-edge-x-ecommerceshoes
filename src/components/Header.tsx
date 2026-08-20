import React from 'react';
import { ActiveTab } from '../types';
import { LanguageSelector } from './LanguageSelector';

interface HeaderProps {
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenMenu: () => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onSelectCategory: (cat: string) => void;
  userRole: 'customer' | 'owner' | 'guest';
  onOpenAuthModal: () => void;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenMenu,
  activeTab,
  setActiveTab,
  onSelectCategory,
  userRole,
  onOpenAuthModal,
  searchQuery,
  setSearchQuery,
  isDarkMode,
  toggleDarkMode,
}) => {
  const [isListening, setIsListening] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleVoiceSearch = () => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice search is not supported in your browser.');
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => {
      setIsListening(true);
    };
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (setSearchQuery) {
        setSearchQuery(transcript);
      }
      setIsListening(false);
    };
    
    recognition.onerror = (event: any) => {
      if (event.error !== 'aborted') {
        console.warn('Speech recognition error:', event.error);
      }
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.start();
  };

  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (setSearchQuery) {
        setSearchQuery(`Image search: ${file.name}`);
      }
    }
  };

  return (
    <header className="flex justify-between items-center w-full px-5 md:px-16 h-16 z-40 dark:bg-[#0D0D0D] bg-white border-b dark:border-[#262626] border-gray-200 fixed top-0 left-0 right-0">
      <div className="flex items-center gap-6">
        <button
          onClick={onOpenMenu}
          aria-label="Menu"
          className="dark:text-[#F2F2F2] text-gray-900 hover:text-[#D10000] transition-colors p-1 md:hidden"
        >
          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 0" }}>
            menu
          </span>
        </button>

        <div className="flex items-center gap-12">
<h1
              onClick={() => {
                setActiveTab('shop');
                onSelectCategory('All Shoes');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-3xl font-['Bebas_Neue',sans-serif] tracking-normal dark:text-[#F2F2F2] text-gray-900 cursor-pointer"
              style={{ fontFamily: "'Bebas Neue', 'Montserrat', sans-serif" }}
            >
              EDGEX
            </h1>
          <button
            onClick={() => {
              setActiveTab('shop');
              onSelectCategory('All Shoes');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="hidden sm:flex text-sm font-extrabold uppercase tracking-widest dark:text-[#F2F2F2] text-gray-900 hover:text-[#D10000] transition-colors"
          >
            Home
          </button>
          
          {/* Search Bar */}
          <div className="hidden sm:flex items-center dark:bg-[#1a1a1a] bg-gray-50 border dark:border-[#262626] border-gray-200 rounded-full px-4 py-1.5 w-64 md:w-80 lg:w-96 focus-within:border-[#D10000] transition-colors relative">
            <span className="material-symbols-outlined dark:text-[#868686] text-gray-500 text-lg mr-2">search</span>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery || ''}
              onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-xs dark:text-[#F2F2F2] text-gray-900 outline-none w-full dark:placeholder:text-[#868686] placeholder:dark:text-[#868686] text-gray-500"
            />
            <div className="flex items-center gap-1.5 ml-2">
              <button
                onClick={handleVoiceSearch}
                className={`${isListening ? 'text-[#D10000]' : 'dark:text-[#868686] text-gray-500'} dark:hover:text-[#F2F2F2] hover:dark:text-[#F2F2F2] text-gray-900 transition-colors p-0.5 flex items-center justify-center`}
                aria-label="Voice Search"
                title="Search by voice"
              >
                <span className="material-symbols-outlined text-lg">mic</span>
              </button>
              <div className="w-px h-4 dark:bg-[#262626] bg-gray-200"></div>
              <button
                onClick={handleCameraClick}
                className="dark:text-[#868686] text-gray-500 dark:hover:text-[#F2F2F2] hover:dark:text-[#F2F2F2] text-gray-900 transition-colors p-0.5 flex items-center justify-center"
                aria-label="Visual Search"
                title="Search by photo"
              >
                <span className="material-symbols-outlined text-lg">photo_camera</span>
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                capture="environment" 
                className="hidden" 
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Language Selector */}
        <LanguageSelector />

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          title="Toggle Dark Mode"
          className="flex items-center dark:text-[#F2F2F2] text-gray-900 hover:text-[#D10000] p-1"
        >
          <span className="material-symbols-outlined text-xl">
            {isDarkMode ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        {/* Wishlist button */}
        <button
          onClick={() => {
            if (userRole === 'customer') {
              setActiveTab('customer-dashboard');
            } else if (userRole === 'owner') {
              setActiveTab('owner-dashboard');
            } else {
              onOpenAuthModal();
            }
          }}
          title="Wishlist"
          className="hidden md:flex items-center dark:text-[#F2F2F2] text-gray-900 hover:text-[#D10000] p-1 relative"
        >
          <span className="material-symbols-outlined text-xl">favorite</span>
          {wishlistCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
              {wishlistCount}
            </span>
          )}
        </button>

        {/* Shopping Bag */}
        <button
          onClick={onOpenCart}
          aria-label="Shopping Bag"
          className="dark:text-[#F2F2F2] text-gray-900 hover:text-[#D10000] transition-colors relative p-1 flex items-center gap-1 ml-1"
        >
          <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 0" }}>
            shopping_bag
          </span>
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#D10000] dark:text-[#F2F2F2] text-gray-900 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>

        {/* Auth / Account Badge */}
        <button
          onClick={() => {
            if (userRole === 'owner') {
              setActiveTab('owner-dashboard');
            } else if (userRole === 'customer') {
              setActiveTab('customer-dashboard');
            } else {
              onOpenAuthModal();
            }
          }}
          className="dark:bg-[#F2F2F2] bg-black dark:text-[#0D0D0D] text-white px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ml-1 rounded-full hover:bg-[#D10000] dark:hover:text-[#F2F2F2] hover:dark:text-[#F2F2F2] text-gray-900 transition-colors shadow-xs translate-y-2"
        >
          <span className="material-symbols-outlined text-sm">person</span>
          <span className="hidden sm:inline">{userRole === 'owner' ? 'Owner' : userRole === 'customer' ? 'You' : 'Sign In'}</span>
        </button>
      </div>
    </header>
  );
};

