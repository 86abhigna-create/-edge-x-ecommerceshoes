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
  const [isMobileSearchOpen, setIsMobileSearchOpen] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const mobileFileInputRef = React.useRef<HTMLInputElement>(null);

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

  const handleCameraClick = (isMobile = false) => {
    if (isMobile && mobileFileInputRef.current) {
      mobileFileInputRef.current.click();
    } else if (fileInputRef.current) {
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
    <header className="w-full fixed top-0 left-0 right-0 z-40 dark:bg-[#0D0D0D] bg-white border-b dark:border-[#262626] border-gray-200">
      <div className="flex justify-between items-center w-full px-3 sm:px-5 md:px-16 h-16">
        <div className="flex items-center gap-2 sm:gap-6">
          <button
            onClick={onOpenMenu}
            aria-label="Menu"
            className="dark:text-[#F2F2F2] text-gray-900 hover:text-[#D10000] transition-colors p-2 md:hidden flex items-center justify-center min-w-[40px] min-h-[40px]"
          >
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 0" }}>
              menu
            </span>
          </button>

          <div className="flex items-center gap-4 sm:gap-12">
            <h1
              onClick={() => {
                setActiveTab('shop');
                onSelectCategory('All Shoes');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-2xl sm:text-3xl font-['Bebas_Neue',sans-serif] tracking-normal dark:text-[#F2F2F2] text-gray-900 cursor-pointer select-none"
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
            
            {/* Desktop Search Bar */}
            <div className="hidden md:flex items-center dark:bg-[#1a1a1a] bg-gray-50 border dark:border-[#262626] border-gray-200 rounded-full px-4 py-1.5 w-64 md:w-80 lg:w-96 focus-within:border-[#D10000] transition-colors relative">
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
                  onClick={() => handleCameraClick(false)}
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

        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Mobile Search Toggle Button */}
          <button
            onClick={() => setIsMobileSearchOpen((prev) => !prev)}
            aria-label="Toggle Search"
            className={`md:hidden flex items-center justify-center p-2 rounded-full min-w-[36px] min-h-[36px] transition-colors ${
              isMobileSearchOpen ? 'text-[#D10000] bg-red-50 dark:bg-red-950/40' : 'dark:text-[#F2F2F2] text-gray-900 hover:text-[#D10000]'
            }`}
          >
            <span className="material-symbols-outlined text-xl">
              {isMobileSearchOpen ? 'close' : 'search'}
            </span>
          </button>

          {/* Language Selector */}
          <LanguageSelector />

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            title="Toggle Dark Mode"
            className="flex items-center justify-center p-2 rounded-full min-w-[36px] min-h-[36px] dark:text-[#F2F2F2] text-gray-900 hover:text-[#D10000]"
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
            className="hidden sm:flex items-center dark:text-[#F2F2F2] text-gray-900 hover:text-[#D10000] p-2 relative min-w-[36px] min-h-[36px] justify-center"
          >
            <span className="material-symbols-outlined text-xl">favorite</span>
            {wishlistCount > 0 && (
              <span className="absolute top-0.5 right-0.5 bg-[#D10000] dark:text-[#F2F2F2] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Shopping Bag */}
          <button
            onClick={onOpenCart}
            aria-label="Shopping Bag"
            className="dark:text-[#F2F2F2] text-gray-900 hover:text-[#D10000] transition-colors relative p-2 flex items-center justify-center min-w-[40px] min-h-[40px]"
          >
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 0" }}>
              shopping_bag
            </span>
            {cartCount > 0 && (
              <span className="absolute top-0.5 right-0.5 bg-[#D10000] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
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
            className="dark:bg-[#F2F2F2] bg-black dark:text-[#0D0D0D] text-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 rounded-full hover:bg-[#D10000] hover:text-white dark:hover:bg-[#D10000] dark:hover:text-white transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-base">person</span>
            <span className="hidden sm:inline">{userRole === 'owner' ? 'Owner' : userRole === 'customer' ? 'You' : 'Sign In'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Search Expandable Bar */}
      {isMobileSearchOpen && (
        <div className="md:hidden px-4 py-2.5 dark:bg-[#141414] bg-gray-50 border-t dark:border-[#262626] border-gray-200 animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 rounded-full px-3.5 py-1.5 focus-within:border-[#D10000] shadow-xs">
            <span className="material-symbols-outlined dark:text-[#868686] text-gray-500 text-lg mr-2">search</span>
            <input
              type="text"
              autoFocus
              placeholder="Search sneakers, apparel..."
              value={searchQuery || ''}
              onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-xs dark:text-[#F2F2F2] text-gray-900 outline-none w-full dark:placeholder:text-[#868686] placeholder:text-gray-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery && setSearchQuery('')}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 mr-1"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            )}
            <div className="flex items-center gap-1 ml-1 border-l dark:border-[#262626] border-gray-200 pl-2">
              <button
                onClick={handleVoiceSearch}
                className={`${isListening ? 'text-[#D10000]' : 'dark:text-[#868686] text-gray-500'} p-1 flex items-center justify-center`}
                aria-label="Voice Search"
              >
                <span className="material-symbols-outlined text-base">mic</span>
              </button>
              <button
                onClick={() => handleCameraClick(true)}
                className="dark:text-[#868686] text-gray-500 p-1 flex items-center justify-center"
                aria-label="Visual Search"
              >
                <span className="material-symbols-outlined text-base">photo_camera</span>
              </button>
              <input 
                type="file" 
                ref={mobileFileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                capture="environment" 
                className="hidden" 
              />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

