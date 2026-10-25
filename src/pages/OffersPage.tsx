import React, { useState } from 'react';
import { Tag, Sparkles, Clock, Copy, Check, ArrowRight, Percent } from 'lucide-react';
import { dataService } from '../services/dataService';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';

interface OffersPageProps {
  onNavigateToMenu: () => void;
}

export const OffersPage: React.FC<OffersPageProps> = ({ onNavigateToMenu }) => {
  const { applyCoupon, setIsCartOpen } = useCart();
  const { formatPrice } = useSettings();
  const offers = dataService.getOffers().filter((o) => o.isActive);

  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleApplyToCart = (code: string) => {
    applyCoupon(code);
    setIsCartOpen(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24">
      {/* Header */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#D9532F]">
          Promotions &amp; Combos
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 dark:text-white">
          Active Café Offers
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300">
          Save on your favorite roasts and brunch pairings with our seasonal promotional codes.
        </p>
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {offers.map((offer) => {
          const daysLeft = Math.max(
            1,
            Math.ceil(
              (new Date(offer.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            )
          );

          return (
            <div
              key={offer.code}
              className="bg-white dark:bg-[#1E1915] rounded-3xl border border-[#EDE8E1] dark:border-[#2E2621] p-6 shadow-xs flex flex-col justify-between space-y-5 hover:border-[#D9532F] transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="w-10 h-10 rounded-xl bg-[#FDF0EC] dark:bg-[#341F18] text-[#D9532F] flex items-center justify-center font-bold">
                    <Percent className="w-5 h-5" />
                  </span>
                  {offer.badge && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                      {offer.badge}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-white">
                    {offer.title}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                    {offer.description}
                  </p>
                </div>

                <div className="p-3 bg-[#FAF7F2] dark:bg-[#25201C] rounded-2xl flex items-center justify-between border border-[#EDE8E1] dark:border-[#2E2621]">
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase font-mono block">
                      Code
                    </span>
                    <span className="font-mono font-bold text-base text-[#D9532F] tracking-wider">
                      {offer.code}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(offer.code)}
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-stone-800 hover:bg-stone-100 border border-stone-200 dark:border-stone-700 text-xs font-medium flex items-center gap-1 transition-colors"
                  >
                    {copiedCode === offer.code ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-600" />
                        <span className="text-green-600 font-semibold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-1 text-[11px] text-stone-400 pt-1">
                  <p>&bull; Min. order value: {formatPrice(offer.minOrderValue)}</p>
                  {offer.maxDiscount && (
                    <p>&bull; Max discount: {formatPrice(offer.maxDiscount)}</p>
                  )}
                  <p className="flex items-center gap-1 text-stone-500">
                    <Clock className="w-3 h-3 text-[#D9532F]" />
                    Expires in {daysLeft} {daysLeft === 1 ? 'day' : 'days'}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
                <button
                  onClick={() => handleApplyToCart(offer.code)}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#2E1C12] dark:bg-white text-white dark:text-[#2E1C12] hover:bg-[#D9532F] dark:hover:bg-[#D9532F] dark:hover:text-white transition-colors text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <span>Apply to Order</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
