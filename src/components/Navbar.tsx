import React, { useState } from 'react';
import {
  ShoppingBag,
  Moon,
  Sun,
  Sparkles,
  QrCode,
  User,
  Shield,
  Globe2,
  ChevronDown,
  Download,
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useCart } from '../context/CartContext';
import { useLanguage, LANGUAGES, SupportedLanguage } from '../context/LanguageContext';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import { CafeLogo } from './CafeLogo';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenDiscovery: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate, onOpenDiscovery }) => {
  const { settings, isDarkMode, toggleDarkMode } = useSettings();
  const { totalItemCount, setIsCartOpen, tableNumber, grandTotal } = useCart();
  const { language, setLanguage, t } = useLanguage();
  const { customer } = useCustomerAuth();
  const { isAuthenticated } = useAdminAuth();

  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const currentLangObj = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <header className="sticky top-0 z-40 bg-[#FFFDF9]/95 dark:bg-[#161311]/95 backdrop-blur-md border-b border-[#EDE8E1] dark:border-[#2E2621] transition-colors w-full">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 h-16 sm:h-18 flex items-center justify-between gap-2 sm:gap-3 w-full">
        {/* Brand Logo & Name - Compact and strictly shrink-0 */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onNavigate('home')}
            className="text-left group flex items-center gap-1.5 sm:gap-2 focus-visible:outline-none"
            aria-label="CafeFlow Home"
          >
            <CafeLogo size="sm" showText={false} />
            <div>
              <span className="font-serif text-base sm:text-xl lg:text-2xl font-bold tracking-tight text-[#3B2418] dark:text-[#F3EDE6] whitespace-nowrap block">
                {settings.name.split(' ')[0] || 'CafeFlow'}
                <span className="text-[#8E1B1B] dark:text-[#F5A623] font-normal italic ml-1 font-sans text-xs sm:text-base">
                  Bistro
                </span>
              </span>
            </div>
          </button>

          {tableNumber && (
            <div className="hidden xl:flex items-center gap-1.5 text-xs text-stone-600 dark:text-stone-400 pl-2 border-l border-stone-200 dark:border-stone-800 shrink-0">
              <span className="w-2 h-2 rounded-full bg-[#2E7D4F] animate-pulse" />
              <span className="font-semibold text-[#2E7D4F]">{t('menu.table') || 'Table'} #{tableNumber}</span>
            </div>
          )}
        </div>

        {/* Navigation Links - Horizontally scrollable in a single row without pushing Language or Cart off-screen */}
        <nav className="flex items-center gap-1 sm:gap-1.5 lg:gap-2 text-xs font-semibold text-stone-600 dark:text-stone-300 overflow-x-auto no-scrollbar scroll-smooth flex-1 min-w-0 py-1 px-1">
          <button
            type="button"
            onClick={() => onNavigate('menu')}
            className={`whitespace-nowrap shrink-0 px-2.5 sm:px-3 py-1.5 rounded-xl transition-all duration-200 active:scale-95 ${
              currentTab === 'menu'
                ? 'text-[#8E1B1B] dark:text-[#F5A623] font-bold bg-[#FFF3ED] dark:bg-[#341C15]'
                : 'hover:text-[#3B2418] dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            {t('nav.menu') || 'Digital Menu'}
          </button>
          <button
            type="button"
            onClick={() => onNavigate('reserve')}
            className={`whitespace-nowrap shrink-0 px-2.5 sm:px-3 py-1.5 rounded-xl transition-all duration-200 active:scale-95 ${
              currentTab === 'reserve'
                ? 'text-[#8E1B1B] dark:text-[#F5A623] font-bold bg-[#FFF3ED] dark:bg-[#341C15]'
                : 'hover:text-[#3B2418] dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            {t('nav.reserve') || 'Reservations'}
          </button>
          <button
            type="button"
            onClick={() => onNavigate('offers')}
            className={`whitespace-nowrap shrink-0 px-2.5 sm:px-3 py-1.5 rounded-xl transition-all duration-200 active:scale-95 ${
              currentTab === 'offers'
                ? 'text-[#8E1B1B] dark:text-[#F5A623] font-bold bg-[#FFF3ED] dark:bg-[#341C15]'
                : 'hover:text-[#3B2418] dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            {t('nav.offers') || 'Offers & Deals'}
          </button>
          <button
            type="button"
            onClick={() => onNavigate('reviews')}
            className={`whitespace-nowrap shrink-0 px-2.5 sm:px-3 py-1.5 rounded-xl transition-all duration-200 active:scale-95 ${
              currentTab === 'reviews'
                ? 'text-[#8E1B1B] dark:text-[#F5A623] font-bold bg-[#FFF3ED] dark:bg-[#341C15]'
                : 'hover:text-[#3B2418] dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            {t('nav.reviews') || 'Guest Reviews'}
          </button>
          <button
            type="button"
            onClick={() => onNavigate('track')}
            className={`whitespace-nowrap shrink-0 px-2.5 sm:px-3 py-1.5 rounded-xl transition-all duration-200 active:scale-95 ${
              currentTab === 'track'
                ? 'text-[#8E1B1B] dark:text-[#F5A623] font-bold bg-[#FFF3ED] dark:bg-[#341C15]'
                : 'hover:text-[#3B2418] dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            {t('nav.track') || 'Track Order'}
          </button>
          <button
            type="button"
            onClick={() => onNavigate('qr')}
            className={`whitespace-nowrap shrink-0 px-2.5 sm:px-3 py-1.5 rounded-xl transition-all duration-200 active:scale-95 flex items-center gap-1.5 ${
              currentTab === 'qr'
                ? 'text-[#8E1B1B] dark:text-[#F5A623] font-bold bg-[#FFF3ED] dark:bg-[#341C15]'
                : 'hover:text-[#3B2418] dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
          >
            <QrCode className="w-3.5 h-3.5 shrink-0" />
            <span>QR Tables</span>
          </button>
        </nav>

        {/* Right Actions - Always strictly anchored inside viewport with shrink-0 */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-auto z-20">
          {/* AI Taste Discovery */}
          <button
            type="button"
            onClick={onOpenDiscovery}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold text-[#8E1B1B] bg-[#FFF3ED] dark:bg-[#341C15] dark:text-[#F5A623] rounded-xl hover:bg-[#FFE6DC] transition-all duration-200 whitespace-nowrap shadow-2xs active:scale-95 shrink-0"
            title="Taste Discovery Sommelier"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#F5A623] shrink-0" />
            <span className="hidden xl:inline">{t('nav.discovery') || 'Taste Discovery'}</span>
          </button>

          {/* 5-Language Dropdown Switcher */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-[#1E1915]/80 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-[#251E19] text-xs font-medium transition-all duration-200 shadow-2xs shrink-0 whitespace-nowrap active:scale-95"
              aria-label="Change language"
            >
              <Globe2 className="w-3.5 h-3.5 text-[#8E1B1B] dark:text-[#F5A623] shrink-0" />
              <span className="font-sans font-semibold truncate max-w-[70px] sm:max-w-none">
                {currentLangObj.nativeName}
              </span>
              <ChevronDown className="w-3 h-3 text-stone-400 shrink-0" />
            </button>

            {langDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-44 bg-white dark:bg-[#1E1915] rounded-2xl shadow-xl border border-stone-200 dark:border-stone-800 py-1.5 z-50 animate-in fade-in"
                onMouseLeave={() => setLangDropdownOpen(false)}
              >
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => {
                      setLanguage(l.code);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full px-3.5 py-2 text-left text-xs flex items-center justify-between transition-colors ${
                      language === l.code
                        ? 'font-bold text-[#8E1B1B] dark:text-[#F5A623] bg-[#FFF3ED] dark:bg-[#341C15]'
                        : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-[#28211C]'
                    }`}
                  >
                    <span className="font-serif text-sm truncate">{l.nativeName}</span>
                    <span className="text-[10px] text-stone-400 font-sans shrink-0">{l.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleDarkMode}
            className="p-2 text-stone-600 dark:text-stone-300 hover:text-[#3B2418] dark:hover:text-white rounded-xl transition-all duration-200 hover:bg-stone-100 dark:hover:bg-stone-800 shrink-0"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-300 shrink-0" /> : <Moon className="w-4 h-4 shrink-0" />}
          </button>

          {/* Account Profile */}
          <button
            type="button"
            onClick={() => onNavigate('account')}
            className={`p-2 rounded-xl transition-all duration-200 flex items-center gap-1 text-xs font-medium shrink-0 ${
              currentTab === 'account'
                ? 'text-[#8E1B1B] bg-[#FFF3ED] dark:bg-[#341C15]'
                : 'text-stone-600 dark:text-stone-300 hover:text-[#3B2418] dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
            title="Customer Account"
          >
            <User className="w-4 h-4 shrink-0" />
            {customer && (
              <span className="hidden xl:inline text-[11px] text-[#2E7D4F] font-bold">
                {customer.loyaltyPoints}p
              </span>
            )}
          </button>

          {/* Admin link */}
          <button
            type="button"
            onClick={() => onNavigate('admin')}
            className={`p-2 rounded-xl transition-all duration-200 shrink-0 ${
              currentTab === 'admin'
                ? 'text-[#8E1B1B] bg-[#FFF3ED] dark:bg-[#341C15]'
                : 'text-stone-400 hover:text-stone-700 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800'
            }`}
            title="Admin Console"
          >
            <Shield className="w-4 h-4 shrink-0" />
          </button>

          {/* Cart Bag Button - Smooth, cleanly styled, zero overflow */}
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl bg-[#8E1B1B] text-white hover:bg-[#741515] transition-all duration-200 shadow-sm font-semibold text-xs whitespace-nowrap active:scale-95 shrink-0"
            aria-label={`Open Cart (${totalItemCount} items)`}
          >
            <ShoppingBag className="w-4 h-4 text-[#F5A623] shrink-0" />
            <span className="hidden sm:inline truncate">{t('nav.bag') || 'Bag'}</span>
            {totalItemCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#F5A623] text-[#3B2418] text-[11px] font-bold flex items-center justify-center shrink-0">
                {totalItemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
