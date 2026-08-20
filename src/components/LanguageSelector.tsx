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
    const domain = window.location.hostname;
    document.cookie = `googtrans=/en/${langCode}; path=/; domain=${domain}`;
    document.cookie = `googtrans=/en/${langCode}; path=/;`;

    // Trigger Google Translate element if rendered
    const googleCombo = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (googleCombo) {
      googleCombo.value = langCode;
      googleCombo.dispatchEvent(new Event('change'));
    } else {
      // Reload page to apply translation cookie
      window.location.reload();
    }
  };

  const selectedLanguage = LANGUAGES.find((l) => l.code === currentLang) || LANGUAGES[0];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Selector Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border dark:border-[#262626] border-gray-200 dark:bg-[#1a1a1a] bg-gray-50 dark:text-[#F2F2F2] text-gray-900 hover:border-[#D10000] transition-colors text-xs font-bold uppercase tracking-wider"
        title="Select Language"
        aria-label="Select Language"
      >
        <span className="material-symbols-outlined text-sm dark:text-[#868686] text-gray-500">language</span>
        <span className="text-base leading-none">{selectedLanguage.flag}</span>
        <span className="hidden sm:inline-block font-extrabold">{selectedLanguage.code.split('-')[0].toUpperCase()}</span>
        <span className="material-symbols-outlined text-xs dark:text-[#868686] text-gray-500">
          {isOpen ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-2xl dark:bg-[#0D0D0D] bg-white border dark:border-[#262626] border-gray-200 py-2 z-50 max-h-80 overflow-y-auto divide-y dark:divide-[#262626] divide-gray-100">
          <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest dark:text-[#868686] text-gray-500">
            Select Language
          </div>
          <div className="py-1">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition-colors ${
                  currentLang === lang.code
                    ? 'bg-[#D10000] text-white font-bold'
                    : 'dark:text-[#F2F2F2] text-gray-900 hover:dark:bg-[#1a1a1a] hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{lang.flag}</span>
                  <div className="flex flex-col">
                    <span className="font-bold">{lang.name}</span>
                    <span className={`text-[10px] ${currentLang === lang.code ? 'text-white/80' : 'dark:text-[#868686] text-gray-500'}`}>
                      {lang.nativeName}
                    </span>
                  </div>
                </div>
                {currentLang === lang.code && (
                  <span className="material-symbols-outlined text-sm text-white">check</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
