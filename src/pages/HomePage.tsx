import React from 'react';
import {
  ArrowRight,
  Sparkles,
  Calendar,
  UtensilsCrossed,
  QrCode,
  Star,
  Clock,
  ShieldCheck,
  ChevronRight,
  Coffee,
  Download,
  FileText,
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { dataService } from '../services/dataService';
import { MenuItem } from '../types';
import { downloadBrochurePdf } from '../services/pdfService';

interface HomePageProps {
  onNavigate: (tab: string) => void;
  onOpenDiscovery: () => void;
  onSelectItem: (item: MenuItem) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onOpenDiscovery,
  onSelectItem,
}) => {
  const { settings, formatPrice } = useSettings();
  const { addToCart, tableNumber } = useCart();
  const { t, getLocalized } = useLanguage();

  const menuItems = dataService.getMenuItems();
  const chefSpecials = menuItems.filter((i) => i.isChefSpecial && i.isAvailable).slice(0, 4);
  const activeOffers = dataService.getOffers().filter((o) => o.isActive).slice(0, 2);
  const topReviews = dataService.getReviews().filter((r) => r.status === 'published' && r.rating >= 5).slice(0, 3);

  return (
    <div className="space-y-16 pb-28 sm:pb-20 md:pb-16">
      {/* Active Table Notification (if scanned from QR) */}
      {tableNumber && (
        <section aria-label="Table status" className="bg-[#EBF5EE] text-[#2F663C] dark:bg-[#1E2E23] dark:text-[#88C697] border-b border-[#CBE5D3] dark:border-[#2B4232] py-2 px-4 text-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium">
              <QrCode className="w-4 h-4 text-[#2E7D4F]" />
              You are seated at <strong>Table #{tableNumber}</strong> &middot; Orders will be routed directly to your table.
            </span>
            <button
              onClick={() => onNavigate('menu')}
              className="underline font-semibold hover:text-black dark:hover:text-white"
            >
              View Menu
            </button>
          </div>
        </section>
      )}

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          {/* Hero Left Content */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8E1B1B] dark:text-[#F5A623]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Authentic South Indian Tiffins, Roasts &amp; Filter Kaapi</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-[#3B2418] dark:text-[#F3EDE6] leading-[1.15] text-balance">
              Crispy Ghee Roasts, Fragrant Kaapi &amp; Heritage Flavors.
            </h1>

            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed max-w-xl">
              Savor authentic Kumbakonam degree filter coffee in brass dabaras, golden ghee roast dosas, fluffy poori masala, traditional ven pongal, and flaky Malabar parottas crafted with heritage recipes.
            </p>

            {/* CTAs with responsive full-width mobile and auto-width desktop */}
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 pt-2 w-full">
              <button
                type="button"
                onClick={() => onNavigate('menu')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#8E1B1B] text-white hover:bg-[#741515] transition-all duration-200 font-semibold text-sm flex items-center justify-center gap-2 shadow-sm whitespace-nowrap active:scale-95 text-center min-w-0 overflow-hidden cursor-pointer"
              >
                <UtensilsCrossed className="w-4 h-4 text-[#F5A623] shrink-0" />
                <span className="truncate">Explore Digital Menu</span>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('reserve')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-100 transition-all duration-200 font-medium text-sm flex items-center justify-center gap-2 whitespace-nowrap active:scale-95 text-center min-w-0 overflow-hidden cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-[#8E1B1B] shrink-0" />
                <span className="truncate">Book a Table</span>
              </button>

              {/* Download PDF Button (downloads /brochure.pdf, full-width on mobile, auto-width on desktop) */}
              <a
                href="/brochure.pdf"
                download="brochure.pdf"
                onClick={(e) => {
                  e.preventDefault();
                  downloadBrochurePdf();
                }}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl border border-[#8E1B1B]/40 dark:border-[#F5A623]/40 bg-white/90 dark:bg-stone-800/90 hover:bg-[#FFF3ED] dark:hover:bg-[#2A1D17] text-[#8E1B1B] dark:text-[#F5A623] transition-all duration-200 font-semibold text-sm flex items-center justify-center gap-2 shadow-xs whitespace-nowrap active:scale-95 text-center cursor-pointer min-w-0 overflow-hidden"
                title="Download official brochure PDF"
              >
                <Download className="w-4 h-4 text-[#8E1B1B] dark:text-[#F5A623] shrink-0" />
                <span className="truncate">Download PDF</span>
              </a>

              <button
                type="button"
                onClick={onOpenDiscovery}
                className="w-full sm:w-auto px-4 py-3.5 rounded-xl bg-[#FFF3ED] dark:bg-[#341C15] text-[#8E1B1B] dark:text-[#F5A623] hover:bg-[#FFE8DE] transition-all duration-200 font-semibold text-xs flex items-center justify-center gap-1.5 whitespace-nowrap shadow-xs active:scale-95 text-center min-w-0 overflow-hidden cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#F5A623] shrink-0" />
                <span className="truncate">Taste AI Sommelier</span>
              </button>
            </div>

            {/* Trust Points */}
            <div className="pt-2 flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400 font-medium flex-wrap">
              <span>☕ Chikmagalur Peaberry Kaapi</span>
              <span aria-hidden="true">&middot;</span>
              <span>🧈 Pure Desi Cow Ghee</span>
              <span aria-hidden="true">&middot;</span>
              <span>🌿 Stone-Ground Fresh Batter</span>
            </div>
          </div>

          {/* Hero Right Visual Showcase */}
          <div className="lg:col-span-6 relative rounded-3xl overflow-hidden shadow-2xl min-h-[360px] sm:min-h-[460px] bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-800">
            <img
              src="/assets/images/ghee_roast_masala_dosa_1792917036160.jpg"
              alt="Crispy South Indian Ghee Roast Masala Dosa with coconut chutney and sambar"
              className="w-full h-full object-cover lg:absolute lg:inset-0"
            />
            {/* Scrim Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6 sm:p-8 text-white">
              <span className="text-xs uppercase tracking-widest font-mono text-[#F5A623] font-bold">
                Chef's Signature Specialty
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold mt-1 text-white">
                Crispy Ghee Roast Masala Dosa
              </h2>
              <p className="text-xs text-stone-200 mt-1 max-w-md">
                Roasted crisp in golden cow ghee, stuffed with spiced potato mash, accompanied by fresh coconut chutney and piping sambar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Active Promotion Strip */}
      {activeOffers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-4 sm:p-5 rounded-2xl bg-[#FFF6E5]/70 dark:bg-[#221C18] border border-[#EDE8E1] dark:border-[#2E2621] flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#8E1B1B] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="w-5 h-5 text-[#F5A623]" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-[#8E1B1B] dark:text-[#F5A623] font-bold">
                  {activeOffers[0].title}
                </p>
                <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300">
                  {activeOffers[0].description} Use promo code{' '}
                  <strong className="font-mono text-[#8E1B1B] dark:text-[#F5A623] bg-white dark:bg-stone-800 px-2 py-0.5 rounded border border-stone-200 dark:border-stone-700">
                    {activeOffers[0].code}
                  </strong>{' '}
                  at checkout.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('offers')}
              className="text-xs font-semibold text-[#8E1B1B] dark:text-[#F5A623] hover:underline whitespace-nowrap flex items-center gap-1"
            >
              <span>View All Promotions</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}

      {/* Featured Chef Specials Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#8E1B1B] dark:text-[#F5A623]">
              Handcrafted Culinary Selections
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white mt-1">
              Today's Signature Highlights
            </h2>
          </div>
          <button
            onClick={() => onNavigate('menu')}
            className="text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-[#8E1B1B] flex items-center gap-1"
          >
            <span>See full menu (30+ items)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {chefSpecials.map((item) => {
            const localizedTitle = getLocalized(item.titleLocalized, item.title);
            return (
              <div
                key={item.id}
                className="group bg-white dark:bg-[#1E1915] rounded-2xl border border-[#EDE8E1] dark:border-[#2E2621] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Image */}
                <div
                  onClick={() => onSelectItem(item)}
                  className="relative h-48 w-full bg-stone-100 dark:bg-stone-800 overflow-hidden cursor-pointer"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1 shadow-xs font-mono">
                    <Clock className="w-3 h-3 text-[#F5A623]" />
                    <span>~{item.prepTimeMinutes || 12}m</span>
                  </div>
                  <span className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-xs text-white text-xs font-bold font-mono">
                    {formatPrice(item.price)}
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div onClick={() => onSelectItem(item)} className="cursor-pointer space-y-1">
                    <div className="flex items-center gap-2 text-[11px] text-stone-500">
                      <span>{item.categoryName}</span>
                      <span aria-hidden="true">&middot;</span>
                      <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {item.rating}
                      </span>
                    </div>
                    <h3 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100 group-hover:text-[#8E1B1B] dark:group-hover:text-[#F5A623] transition-colors line-clamp-1">
                      {localizedTitle}
                    </h3>
                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-stone-100 dark:border-stone-800 text-xs">
                    <button
                      onClick={() => onSelectItem(item)}
                      className="text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 underline text-[11px]"
                    >
                      Options
                    </button>
                    <button
                      onClick={() => addToCart(item, 1)}
                      className="px-3 py-1.5 rounded-xl bg-[#8E1B1B] text-white hover:bg-[#741515] transition-all font-semibold text-xs shadow-xs active:scale-95"
                    >
                      + Add to Bag
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive Discovery Quiz Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-[#3B2418] text-white p-8 sm:p-12 relative overflow-hidden border border-stone-800 shadow-xl">
          <div className="max-w-2xl relative z-10 space-y-4">
            <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[#F5A623] font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              Smart Dish Recommendation Engine
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-bold leading-tight text-white">
              Undecided on What to Order? Let our Gemini AI Sommelier Match Your Palate.
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Answer 4 quick taste questions or type your current craving in natural prose. We strictly filter by your allergens and in-stock items, then generate personalized culinary reasons and drink pairings.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={onOpenDiscovery}
                className="px-6 py-3 rounded-xl bg-[#8E1B1B] text-white hover:bg-[#741515] transition-all font-bold text-xs flex items-center gap-2 shadow-sm border border-[#F5A623]/30 active:scale-95"
              >
                <span>Launch Taste Discovery Quiz</span>
                <ArrowRight className="w-4 h-4 text-[#F5A623]" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Verified Guest Reviews */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#8E1B1B] dark:text-[#F5A623]">
              Community &amp; Diners
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white mt-1">
              Loved by Foodies &amp; Coffee Purists
            </h2>
          </div>
          <button
            onClick={() => onNavigate('reviews')}
            className="text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-[#8E1B1B] flex items-center gap-1"
          >
            <span>Read all reviews &amp; leave yours</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topReviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#1E1915] border border-[#EDE8E1] dark:border-[#2E2621] shadow-xs space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  {rev.verifiedOrder && (
                    <span className="text-[11px] text-[#2E7D4F] font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified Diner
                    </span>
                  )}
                </div>
                {rev.dishName && (
                  <p className="text-xs font-semibold text-[#8E1B1B] dark:text-[#F5A623]">
                    Ordered: {rev.dishName}
                  </p>
                )}
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-400">
                <span className="font-medium text-stone-700 dark:text-stone-300">
                  {rev.customerName}
                </span>
                <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Official Brochure Showcase Section with Download PDF Button */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#FFF6E5] to-[#FBECE2] dark:from-[#261D18] dark:to-[#1D1714] border border-[#E8DCCF] dark:border-[#3E2F26] flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="space-y-2 text-center md:text-left flex-1">
            <span className="text-xs uppercase font-bold tracking-wider text-[#8E1B1B] dark:text-[#F5A623] flex items-center justify-center md:justify-start gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Official Bistro &amp; Roastery Guide
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#3B2418] dark:text-[#F3EDE6]">
              Looking for Our Complete Menu &amp; Roastery Story?
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 max-w-xl">
              Download our printable full-color PDF brochure featuring single-origin Chikmagalur coffees, all-day brunch specials, dietary charts, chef pairings, and table reservations.
            </p>
          </div>
          <div className="w-full md:w-auto shrink-0">
            <a
              href="/brochure.pdf"
              download="CafeFlow_Brochure.pdf"
              className="w-full md:w-auto px-6 py-3.5 rounded-xl bg-[#8E1B1B] text-white hover:bg-[#741515] transition-all font-semibold text-sm flex items-center justify-center gap-2 shadow-sm text-center active:scale-95 whitespace-nowrap"
            >
              <Download className="w-4 h-4 text-[#F5A623]" />
              <span>Download PDF</span>
            </a>
          </div>
        </div>
      </section>

      {/* QR Code Experience Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-2xl bg-[#FFF6E5]/70 dark:bg-[#221C18] border border-[#EDE8E1] dark:border-[#2E2621] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-bold text-[#8E1B1B] dark:text-[#F5A623] uppercase">
              <QrCode className="w-4 h-4" />
              <span>Smart Table QR Integration</span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-white">
              Generate &amp; Print Table QR Cards
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 max-w-xl">
              Each table has a dedicated QR code that opens the digital menu and ties orders automatically to Table 1–20.
            </p>
          </div>
          <button
            onClick={() => onNavigate('qr')}
            className="px-5 py-3 rounded-xl bg-[#8E1B1B] text-white hover:bg-[#741515] transition-all font-bold text-xs whitespace-nowrap shadow-xs active:scale-95"
          >
            Open QR Generator
          </button>
        </div>
      </section>
    </div>
  );
};
