import React from 'react';
import { Globe2, Sparkles, Check } from 'lucide-react';
import { useLanguage, LANGUAGES, SupportedLanguage } from '../context/LanguageContext';
import { CafeLogo } from './CafeLogo';

export const LanguageWelcomeModal: React.FC = () => {
  const { language, setLanguage, showWelcomeModal, setShowWelcomeModal } = useLanguage();

  if (!showWelcomeModal) return null;

  const handleSelectLanguage = (code: SupportedLanguage) => {
    setLanguage(code);
    setShowWelcomeModal(false);
  };

  const greetings: Record<SupportedLanguage, { greeting: string; sub: string }> = {
    en: { greeting: 'Welcome to CafeFlow', sub: 'Choose your language to begin' },
    ta: { greeting: 'கேஃப்ஃப்ளோவுக்கு நல்வரவு', sub: 'தொடர உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்' },
    te: { greeting: 'కేఫ్‌ఫ్లో కు స్వాగతం', sub: 'కొనసాగడానికి మీ భాషను ఎంచుకోండి' },
    hi: { greeting: 'कैफ़ेफ़्लो में आपका स्वागत है', sub: 'आरंभ करने के लिए अपनी भाषा चुनें' },
    ml: { greeting: 'കഫേഫ്ലോയിലേക്ക് സ്വാഗതം', sub: 'ആരംഭിക്കാൻ നിങ്ങളുടെ ഭാഷ തിരഞ്ഞെടുക്കൂ' },
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-[#FFFDF9] dark:bg-[#1A1613] rounded-3xl shadow-2xl border border-[#EDE8E1] dark:border-[#2E2621] p-6 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-center">
          <CafeLogo size="md" showText={false} />
        </div>

        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF3ED] dark:bg-[#341C15] text-[#8E1B1B] dark:text-[#F5A623] text-xs font-semibold">
            <Globe2 className="w-3.5 h-3.5" />
            <span>Multilingual Bistro Menu</span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#3B2418] dark:text-[#F3EDE6]">
            {greetings[language]?.greeting || 'Welcome to CafeFlow'}
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400">
            {greetings[language]?.sub || 'Select your preferred language'}
          </p>
        </div>

        {/* 5 Language Buttons with native scripts */}
        <div className="grid grid-cols-1 gap-2.5">
          {LANGUAGES.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => handleSelectLanguage(lang.code)}
                className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  isSelected
                    ? 'border-[#8E1B1B] bg-[#FFF3ED] dark:bg-[#341C15] shadow-xs'
                    : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-[#221C18] hover:border-[#8E1B1B]/40 hover:bg-stone-50 dark:hover:bg-[#28211C]'
                }`}
              >
                <div>
                  <span className="font-serif text-base font-bold text-[#3B2418] dark:text-[#F3EDE6] block">
                    {lang.nativeName}
                  </span>
                  <span className="text-xs text-stone-500 dark:text-stone-400">
                    {lang.name}
                  </span>
                </div>
                {isSelected ? (
                  <div className="w-6 h-6 rounded-full bg-[#8E1B1B] text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                ) : (
                  <span className="text-xs text-stone-400 group-hover:text-stone-600">Select</span>
                )}
              </button>
            );
          })}
        </div>

        <p className="text-[11px] text-stone-400 dark:text-stone-500">
          You can change the language anytime from the top bar.
        </p>
      </div>
    </div>
  );
};
