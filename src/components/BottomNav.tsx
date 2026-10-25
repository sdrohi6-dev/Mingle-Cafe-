import React from 'react';
import { UtensilsCrossed, Calendar, Tag, Compass, ShoppingBag, User, Home } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

interface BottomNavProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenDiscovery: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onNavigate, onOpenDiscovery }) => {
  const { totalItemCount, setIsCartOpen } = useCart();
  const { t } = useLanguage();

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFFDF9]/95 dark:bg-[#161311]/95 backdrop-blur-md border-t border-[#EDE8E1] dark:border-[#2E2621] px-1 py-1 transition-colors"
      style={{ maxHeight: '12vh' }}
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        <button
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] py-1 text-[10px] font-medium transition-colors ${
            currentTab === 'home' ? 'text-[#8E1B1B] dark:text-[#F5A623] font-bold' : 'text-stone-500 dark:text-stone-400'
          }`}
        >
          <Home className="w-4 h-4 mb-0.5" />
          <span>{t('nav.home') || 'Home'}</span>
        </button>

        <button
          onClick={() => onNavigate('menu')}
          className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] py-1 text-[10px] font-medium transition-colors ${
            currentTab === 'menu' ? 'text-[#8E1B1B] dark:text-[#F5A623] font-bold' : 'text-stone-500 dark:text-stone-400'
          }`}
        >
          <UtensilsCrossed className="w-4 h-4 mb-0.5" />
          <span>{t('nav.menu') || 'Menu'}</span>
        </button>

        <button
          onClick={() => onNavigate('reserve')}
          className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] py-1 text-[10px] font-medium transition-colors ${
            currentTab === 'reserve' ? 'text-[#8E1B1B] dark:text-[#F5A623] font-bold' : 'text-stone-500 dark:text-stone-400'
          }`}
        >
          <Calendar className="w-4 h-4 mb-0.5" />
          <span>{t('nav.reserve') || 'Book'}</span>
        </button>

        <button
          onClick={onOpenDiscovery}
          className="flex flex-col items-center justify-center min-w-[44px] min-h-[44px] py-1 text-[10px] font-medium text-[#8E1B1B] dark:text-[#F5A623]"
        >
          <div className="w-5 h-5 rounded-full bg-[#FFF3ED] dark:bg-[#341C15] flex items-center justify-center mb-0.5">
            <Compass className="w-3.5 h-3.5 text-[#8E1B1B] dark:text-[#F5A623]" />
          </div>
          <span>Discover</span>
        </button>

        <button
          onClick={() => onNavigate('offers')}
          className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] py-1 text-[10px] font-medium transition-colors ${
            currentTab === 'offers' ? 'text-[#8E1B1B] dark:text-[#F5A623] font-bold' : 'text-stone-500 dark:text-stone-400'
          }`}
        >
          <Tag className="w-4 h-4 mb-0.5" />
          <span>{t('nav.offers') || 'Offers'}</span>
        </button>

        <button
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center justify-center min-w-[44px] min-h-[44px] py-1 text-[10px] font-medium text-stone-700 dark:text-stone-200"
        >
          <div className="relative">
            <ShoppingBag className="w-4 h-4 mb-0.5" />
            {totalItemCount > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-[#8E1B1B] text-white text-[9px] font-bold flex items-center justify-center">
                {totalItemCount}
              </span>
            )}
          </div>
          <span>{t('nav.bag') || 'Bag'}</span>
        </button>

        <button
          onClick={() => onNavigate('account')}
          className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] py-1 text-[10px] font-medium transition-colors ${
            currentTab === 'account' ? 'text-[#8E1B1B] dark:text-[#F5A623] font-bold' : 'text-stone-500 dark:text-stone-400'
          }`}
        >
          <User className="w-4 h-4 mb-0.5" />
          <span>{t('nav.account') || 'Profile'}</span>
        </button>
      </div>
    </nav>
  );
};
