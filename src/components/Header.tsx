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
    <header className="w-full fixed top-0 left-0 right-0 z-40 dark:bg-[#0D0D0D]/95 bg-white/95 backdrop-blur-md border-b dark:border-[#222] border-gray-200">
      <div className="flex items-center justify-between w-full px-4 sm:px-8 md:px-16 h-16 gap-4">
        
        {/* Left Section: Menu & Brand Logo */}
        <div className="flex items-center gap-4 sm:gap-8 shrink-0">
          <button
            onClick={onOpenMenu}
            aria-label="Open Side Menu"
            title="Open Menu"
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider dark:text-white text-black hover:text-[#D10000] transition-colors cursor-pointer p-1"
          >
            <span className="material-symbols-outlined notranslate text-2xl" translate="no">menu</span>
            <span className="hidden sm:inline">Menu</span>
          </button>

          <h1
            onClick={() => {
              setActiveTab('shop');
              onSelectCategory('All Shoes');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-2xl sm:text-3xl font-['Bebas_Neue',sans-serif] tracking-wider dark:text-white text-black cursor-pointer select-none notranslate hover:text-[#D10000] transition-colors"
            translate="no"
          >
            EDGEX
          </h1>
        </div>

        {/* Center Section: Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-sm mx-4">
          <div className="w-full flex items-center dark:bg-[#161616] bg-gray-100 border dark:border-[#262626] border-gray-200 rounded-full px-4 py-2 focus-within:border-[#D10000] transition-all">
            <span className="material-symbols-outlined notranslate text-gray-400 text-lg mr-2" translate="no">search</span>
            <input
              type="text"
              placeholder="Search catalog..."
              value={searchQuery || ''}
              onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-xs dark:text-white text-black outline-none w-full placeholder:text-gray-400 font-medium"
            />
          </div>
        </div>

        {/* Right Section: Actions (Search, Brightness/Dark Mode, Account/You, Shopping Bag) */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {/* Mobile Search Toggle */}
          <button
            onClick={() => setIsMobileSearchOpen((prev) => !prev)}
            aria-label="Toggle Search"
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-full dark:text-white text-black hover:text-[#D10000] transition-colors"
          >
            <span className="material-symbols-outlined notranslate text-xl" translate="no">
              {isMobileSearchOpen ? 'close' : 'search'}
            </span>
          </button>

          {/* Brightness / Dark Mode Toggle Button */}
          <button
            onClick={toggleDarkMode}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Brightness / Dark Mode"
            className="flex items-center justify-center w-9 h-9 rounded-full dark:text-white text-black hover:text-[#D10000] transition-all cursor-pointer notranslate"
            translate="no"
          >
            <span className="material-symbols-outlined notranslate text-xl transition-transform hover:rotate-45 duration-300" translate="no">
              {isDarkMode ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {/* Shopping Bag Button with Badge (Placed right beside brightness option) */}
          <button
            onClick={onOpenCart}
            aria-label="Shopping Bag"
            title="Shopping Bag"
            className="flex items-center justify-center relative w-9 h-9 rounded-full dark:text-white text-black hover:text-[#D10000] transition-all cursor-pointer notranslate"
            translate="no"
          >
            <span className="material-symbols-outlined notranslate text-xl" translate="no" style={{ fontVariationSettings: "'FILL' 0" }}>
              shopping_bag
            </span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#D10000] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs notranslate" translate="no">
                {cartCount}
              </span>
            )}
          </button>

          {/* Account / You Tab */}
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
            title="Account"
            aria-label="Account"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'customer-dashboard' || activeTab === 'owner-dashboard'
                ? 'bg-[#D10000] text-white shadow-xs'
                : 'dark:text-white text-black hover:text-[#D10000]'
            }`}
          >
            <span className="material-symbols-outlined notranslate text-lg" translate="no">account_circle</span>
            <span className="hidden sm:inline">{userRole === 'owner' ? 'Admin' : 'You'}</span>
          </button>

          {/* Shopping Bag Button with Badge */}
          <button
            onClick={onOpenCart}
            aria-label="Shopping Bag"
            title="Shopping Bag"
            className="flex items-center justify-center relative w-9 h-9 rounded-full dark:text-white text-black hover:text-[#D10000] transition-all cursor-pointer notranslate"
            translate="no"
          >
            <span className="material-symbols-outlined notranslate text-xl" translate="no" style={{ fontVariationSettings: "'FILL' 0" }}>
              shopping_bag
            </span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#D10000] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs notranslate" translate="no">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Search Expandable Bar */}
      {isMobileSearchOpen && (
        <div className="md:hidden px-4 py-3 dark:bg-[#121212] bg-gray-50 border-t dark:border-[#262626] border-gray-200 animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 rounded-full px-3.5 py-1.5 focus-within:border-[#D10000] shadow-xs">
            <span className="material-symbols-outlined notranslate dark:text-[#868686] text-gray-500 text-lg mr-2" translate="no">search</span>
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
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 mr-1 notranslate"
                translate="no"
              >
                <span className="material-symbols-outlined notranslate text-sm" translate="no">close</span>
              </button>
            )}
            <div className="flex items-center gap-1 ml-1 border-l dark:border-[#262626] border-gray-200 pl-2 notranslate" translate="no">
              <button
                onClick={handleVoiceSearch}
                className={`${isListening ? 'text-[#D10000]' : 'dark:text-[#868686] text-gray-500'} p-1 flex items-center justify-center notranslate`}
                aria-label="Voice Search"
                translate="no"
              >
                <span className="material-symbols-outlined notranslate text-base" translate="no">mic</span>
              </button>
              <button
                onClick={() => handleCameraClick(true)}
                className="dark:text-[#868686] text-gray-500 p-1 flex items-center justify-center notranslate"
                aria-label="Visual Search"
                translate="no"
              >
                <span className="material-symbols-outlined notranslate text-base" translate="no">photo_camera</span>
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

