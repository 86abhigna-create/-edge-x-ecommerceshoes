import React, { useState, useEffect, useRef } from 'react';

export interface Language {
  code: string;
  name: string;
  flag: string;
  nativeName: string;
}

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇬🇧', nativeName: 'English' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸', nativeName: 'Español' },
  { code: 'fr', name: 'French', flag: '🇫🇷', nativeName: 'Français' },
  { code: 'de', name: 'German', flag: '🇩🇪', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', flag: '🇮🇹', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹', nativeName: 'Português' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳', nativeName: 'हिन्दी' },
  { code: 'te', name: 'Telugu', flag: '🇮🇳', nativeName: 'తెలుగు' },
  { code: 'ta', name: 'Tamil', flag: '🇮🇳', nativeName: 'தமிழ்' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵', nativeName: '日本語' },
  { code: 'zh-CN', name: 'Chinese', flag: '🇨🇳', nativeName: '中文' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦', nativeName: 'العربية' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺', nativeName: 'Русский' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷', nativeName: '한국어' },
];

export const LanguageSelector: React.FC = () => {
  const [currentLang, setCurrentLang] = useState<string>('en');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Read current language from googtrans cookie if present
    const match = document.cookie.match(/googtrans=\/en\/([a-zA-Z-]+)/);
    if (match && match[1]) {
      setCurrentLang(match[1]);
    }

    // Close dropdown on click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (langCode: string) => {
    setCurrentLang(langCode);
    setIsOpen(false);

    // Set cookie for Google Translate
    const hostname = window.location.hostname;
    const cookieVal = `/en/${langCode}`;
    
    // Write cookies for various domain scopes to guarantee coverage
    document.cookie = `googtrans=${cookieVal}; path=/;`;
    document.cookie = `googtrans=${cookieVal}; path=/; domain=${hostname}`;
    
    // Also write for parent domain if applicable
    const parts = hostname.split('.');
    if (parts.length > 2) {
      const parentDomain = '.' + parts.slice(-2).join('.');
      document.cookie = `googtrans=${cookieVal}; path=/; domain=${parentDomain}`;
    }

    if (langCode === 'en') {
      // Clear translation cookies when resetting to English
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${hostname}`;
    }

    // Trigger Google Translate select combo if present
    const googleCombo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (googleCombo) {
      googleCombo.value = langCode;
      googleCombo.dispatchEvent(new Event('change'));
      
      // Secondary dispatch to ensure browser triggers Google Translate internal listeners
      setTimeout(() => {
        if (googleCombo.value !== langCode) {
          googleCombo.value = langCode;
          googleCombo.dispatchEvent(new Event('change'));
        }
      }, 50);
    } else {
      // Fallback reload so newly set googtrans cookie is read on init
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  };

  const selectedLanguage = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  return (
    <div className="notranslate relative inline-block text-left" translate="no" ref={dropdownRef}>
      {/* Selector Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border dark:border-[#262626] border-gray-200 dark:bg-[#1a1a1a] bg-gray-50 dark:text-[#F2F2F2] text-gray-900 hover:border-[#D10000] transition-colors text-xs font-bold uppercase tracking-wider notranslate"
        translate="no"
        title="Select Language"
        aria-label="Select Language"
      >
        <span className="material-symbols-outlined notranslate text-sm dark:text-[#868686] text-gray-500" translate="no">language</span>
        <span className="text-base leading-none notranslate" translate="no">{selectedLanguage.flag}</span>
        <span className="hidden sm:inline-block font-extrabold notranslate" translate="no">{selectedLanguage.code.split('-')[0].toUpperCase()}</span>
        <span className="material-symbols-outlined notranslate text-xs dark:text-[#868686] text-gray-500" translate="no">
          {isOpen ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="notranslate absolute right-0 mt-2 w-56 rounded-xl shadow-2xl dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 py-2 z-50 max-h-80 overflow-y-auto divide-y dark:divide-[#262626] divide-gray-100" translate="no">
          <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest dark:text-[#868686] text-gray-500 notranslate" translate="no">
            Select Language
          </div>
          <div className="py-1 notranslate" translate="no">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                translate="no"
                className={`notranslate w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors ${
                  currentLang === lang.code
                    ? 'bg-[#D10000] text-white font-bold'
                    : 'dark:text-[#F2F2F2] text-gray-900 hover:dark:bg-[#1a1a1a] hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-2.5 notranslate" translate="no">
                  <span className="text-base notranslate" translate="no">{lang.flag}</span>
                  <div className="flex flex-col notranslate" translate="no">
                    <span className="font-bold notranslate" translate="no">{lang.name}</span>
                    <span className={`text-[10px] notranslate ${currentLang === lang.code ? 'text-white/80' : 'dark:text-[#868686] text-gray-500'}`} translate="no">
                      {lang.nativeName}
                    </span>
                  </div>
                </div>
                {currentLang === lang.code && (
                  <span className="material-symbols-outlined notranslate text-sm text-white" translate="no">check</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
