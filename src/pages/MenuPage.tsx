import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  Clock,
  Flame,
  Plus,
  QrCode,
  X,
  Compass,
  ShoppingBag,
  ArrowRight,
  Leaf,
  Check,
  Download,
  Printer,
  Loader2,
  FileText,
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { dataService } from '../services/dataService';
import { MenuItem, DietaryFlag } from '../types';
import {
  downloadBrochurePdf,
  downloadLiveMenuPdf,
  printMenuDirectly,
} from '../services/pdfService';
import { PrintableMenuModal } from '../components/PrintableMenuModal';

interface MenuPageProps {
  onSelectItem: (item: MenuItem) => void;
  onOpenDiscovery: () => void;
}

export const MenuPage: React.FC<MenuPageProps> = ({ onSelectItem, onOpenDiscovery }) => {
  const { settings, formatPrice } = useSettings();
  const { addToCart, tableNumber, totalItemCount, grandTotal, setIsCartOpen } = useCart();
  const { currentLanguage, t, getLocalized } = useLanguage();

  const categories = dataService.getCategories();
  const menuItems = dataService.getMenuItems();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDiet, setSelectedDiet] = useState<DietaryFlag | 'all' | 'bestsellers' | 'under150'>('all');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sortBy, setSortBy] = useState<'popular' | 'priceAsc' | 'priceDesc' | 'rating' | 'prepTime'>('popular');
  const [maxPrice, setMaxPrice] = useState<number>(600);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<string | null>(null);

  const handleDirectDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    setDownloadSuccessToast(null);
    try {
      const success = await downloadBrochurePdf();
      if (!success) {
        downloadLiveMenuPdf(menuItems, categories, settings, selectedCategory);
      }
      setDownloadSuccessToast('Menu PDF saved directly to your desktop/downloads!');
      setTimeout(() => setDownloadSuccessToast(null), 4000);
    } catch (err) {
      console.error('Download PDF error:', err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleDirectPrintMenu = () => {
    printMenuDirectly();
  };

  // Quick filter chips definitions
  const quickFilters = [
    { id: 'all', label: 'All Items', icon: null },
    { id: 'veg', label: 'Veg 🥬', icon: 'veg' },
    { id: 'vegan', label: 'Vegan 🌱', icon: 'vegan' },
    { id: 'spicy', label: 'Spicy 🌶️', icon: 'spicy' },
    { id: 'glutenFree', label: 'Gluten-Free 🌾', icon: 'gf' },
    { id: 'bestsellers', label: 'Bestsellers ⭐', icon: 'star' },
    { id: 'under150', label: 'Under ₹150 🏷️', icon: 'tag' },
  ];

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let result = [...menuItems];

    // Seasonal filter check
    if (!settings.seasonalMenuEnabled) {
      result = result.filter((i) => i.categoryId !== 'cat_seasonal');
    }

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter((i) => i.categoryId === selectedCategory);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((i) => {
        const titleEn = i.title.toLowerCase();
        const titleLoc = (getLocalized(i.titleLocalized, '') || '').toLowerCase();
        const descEn = (i.description || '').toLowerCase();
        const descLoc = (getLocalized(i.descriptionLocalized, '') || '').toLowerCase();
        return (
          titleEn.includes(q) ||
          titleLoc.includes(q) ||
          descEn.includes(q) ||
          descLoc.includes(q) ||
          (i.ingredients && i.ingredients.some((ing) => ing.toLowerCase().includes(q)))
        );
      });
    }

    // Quick filter chip
    if (selectedDiet === 'veg') {
      result = result.filter((i) => i.dietaryFlags.includes('veg'));
    } else if (selectedDiet === 'vegan') {
      result = result.filter((i) => i.dietaryFlags.includes('vegan'));
    } else if (selectedDiet === 'spicy') {
      result = result.filter((i) => i.dietaryFlags.includes('spicy'));
    } else if (selectedDiet === 'glutenFree') {
      result = result.filter((i) => i.dietaryFlags.includes('glutenFree'));
    } else if (selectedDiet === 'bestsellers') {
      result = result.filter((i) => i.rating >= 4.7 || (i.reviewCount && i.reviewCount >= 10) || i.isChefSpecial);
    } else if (selectedDiet === 'under150') {
      result = result.filter((i) => i.price <= 150);
    }

    // Only available filter
    if (onlyAvailable) {
      result = result.filter((i) => i.isAvailable);
    }

    // Price limit
    result = result.filter((i) => i.price <= maxPrice);

    // Sorting
    if (sortBy === 'priceAsc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'priceDesc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'prepTime') {
      result.sort((a, b) => a.prepTimeMinutes - b.prepTimeMinutes);
    } else {
      // popular
      result.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    }

    return result;
  }, [
    menuItems,
    selectedCategory,
    searchQuery,
    selectedDiet,
    onlyAvailable,
    sortBy,
    maxPrice,
    settings.seasonalMenuEnabled,
    currentLanguage,
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-28">
      {/* Table Presence Banner */}
      {tableNumber && (
        <div className="p-3 bg-[#EBF5EE] text-[#2F663C] dark:bg-[#1E2E23] dark:text-[#88C697] rounded-xl border border-[#CBE5D3] dark:border-[#2B4232] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-[#2E7D4F]" />
            <span>
              {t('menu.tableActiveBanner', { tableNumber }) ||
                `Ordering for Table ${tableNumber} • Dishes will be served hot to your seat.`}
            </span>
          </div>
          <span className="text-[11px] font-mono bg-white dark:bg-stone-800 px-2 py-0.5 rounded shadow-2xs font-semibold">
            Dine-In
          </span>
        </div>
      )}

      {/* Seasonal Menu Banner */}
      {settings.seasonalMenuEnabled && (
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#3B2418] via-[#5C2B1F] to-[#8E1B1B] text-white p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[11px] uppercase tracking-wider text-[#F5A623] font-bold flex items-center justify-center sm:justify-start gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Limited Edition Celebration Menu
            </span>
            <h2 className="font-serif text-lg sm:text-xl font-bold">
              {settings.seasonalMenuTitle || 'Golden Hour Bistro & Monsoon Comfort Specials'}
            </h2>
            <p className="text-xs text-stone-200">
              Cardamom spiced mocha, caramelized figs, and chef-curated brunch plates.
            </p>
          </div>
          <button
            onClick={() => setSelectedCategory('cat_seasonal')}
            className="px-4 py-2 rounded-xl bg-[#F5A623] hover:bg-amber-400 text-stone-900 font-bold text-xs transition-colors whitespace-nowrap shadow-xs active:scale-95"
          >
            Explore Specials
          </button>
        </div>
      )}

      {/* Search & Action Bar - Fully Responsive for Mobile, Tablet, & Desktop */}
      <div className="space-y-2.5">
        {/* Top Search & Filter Bar */}
        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('menu.searchPlaceholder') || 'Search coffee, sourdough, dosa, scramble, croissants...'}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#1E1915] text-xs focus:outline-none focus:border-[#8E1B1B] shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filter Modal Button */}
          <button
            onClick={() => setShowFiltersModal((p) => !p)}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-2xs ${
              showFiltersModal || selectedDiet !== 'all' || onlyAvailable || maxPrice < 600
                ? 'border-[#8E1B1B] bg-[#FFF3ED] dark:bg-[#341C15] text-[#8E1B1B] dark:text-[#F5A623]'
                : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-[#1E1915] text-stone-700 dark:text-stone-300'
            }`}
            title="Filter by diet, price, availability"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>

          {/* Taste Discovery Sommelier (Desktop inline) */}
          <button
            type="button"
            onClick={onOpenDiscovery}
            className="hidden lg:inline-flex px-3.5 py-2.5 rounded-xl bg-[#8E1B1B] text-white hover:bg-[#741515] hover:shadow-xs transition-all duration-200 text-xs font-semibold items-center gap-2 shadow-2xs whitespace-nowrap active:scale-95 shrink-0 min-w-0 overflow-hidden cursor-pointer"
            title="Ask AI what you should order"
          >
            <Compass className="w-4 h-4 text-[#F5A623] shrink-0" />
            <span className="truncate">Taste Sommelier</span>
          </button>

          {/* Direct Download PDF to Desktop Button (Desktop inline) */}
          <button
            type="button"
            onClick={handleDirectDownloadPdf}
            disabled={isDownloadingPdf}
            className="hidden sm:inline-flex p-2.5 lg:px-3.5 lg:py-2.5 rounded-xl border border-[#8E1B1B]/30 dark:border-[#F5A623]/30 bg-white dark:bg-[#1E1915] hover:bg-stone-50 dark:hover:bg-stone-800 hover:shadow-xs text-[#8E1B1B] dark:text-[#F5A623] text-xs font-semibold items-center justify-center gap-2 shadow-2xs transition-all duration-200 whitespace-nowrap active:scale-95 disabled:opacity-50 shrink-0 min-w-0 overflow-hidden cursor-pointer"
            title="Directly download printable Menu &amp; Brochure PDF to your desktop"
          >
            {isDownloadingPdf ? (
              <Loader2 className="w-4 h-4 shrink-0 animate-spin text-[#8E1B1B] dark:text-[#F5A623]" />
            ) : (
              <Download className="w-4 h-4 shrink-0 text-[#8E1B1B] dark:text-[#F5A623]" />
            )}
            <span className="truncate">{isDownloadingPdf ? 'Downloading...' : 'Download PDF'}</span>
          </button>

          {/* Direct Print Menu Button (Desktop inline) */}
          <button
            type="button"
            onClick={handleDirectPrintMenu}
            className="hidden sm:inline-flex p-2.5 lg:px-3.5 lg:py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#1E1915] hover:bg-stone-50 dark:hover:bg-stone-800 hover:shadow-xs text-stone-700 dark:text-stone-300 text-xs font-semibold items-center justify-center gap-2 shadow-2xs transition-all duration-200 whitespace-nowrap active:scale-95 shrink-0 min-w-0 overflow-hidden cursor-pointer"
            title="Print restaurant menu directly or save as PDF"
          >
            <Printer className="w-4 h-4 shrink-0 text-stone-600 dark:text-stone-400" />
            <span className="truncate">Print Menu</span>
          </button>

          {/* PDF & Print Studio Modal Trigger */}
          <button
            type="button"
            onClick={() => setShowPrintModal(true)}
            className="hidden md:inline-flex p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-all duration-200 shrink-0 cursor-pointer"
            title="More PDF options (Brochure, Full Live Menu, Print Preview)"
          >
            <FileText className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile & Small Screen Action Row - Smooth, Box-Contained, Zero Font Spill */}
        <div className="sm:hidden grid grid-cols-3 gap-2 w-full">
          {/* Download PDF button directly downloads to desktop/phone */}
          <button
            type="button"
            onClick={handleDirectDownloadPdf}
            disabled={isDownloadingPdf}
            className="py-2.5 px-2 min-w-0 rounded-xl border border-[#8E1B1B]/40 dark:border-[#F5A623]/30 bg-white dark:bg-[#1E1915] text-[#8E1B1B] dark:text-[#F5A623] text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 transition-all duration-200 disabled:opacity-50 text-center overflow-hidden cursor-pointer"
            title="Download PDF directly to file"
          >
            {isDownloadingPdf ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
            ) : (
              <Download className="w-3.5 h-3.5 shrink-0" />
            )}
            <span className="truncate text-[11px] font-semibold">{isDownloadingPdf ? 'Saving...' : 'Download PDF'}</span>
          </button>

          {/* Print button triggers instant print */}
          <button
            type="button"
            onClick={handleDirectPrintMenu}
            className="py-2.5 px-2 min-w-0 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#1E1915] text-stone-800 dark:text-stone-200 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 transition-all duration-200 text-center overflow-hidden cursor-pointer"
            title="Print Menu"
          >
            <Printer className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate text-[11px] font-semibold">Print Menu</span>
          </button>

          {/* Taste Discovery / AI Sommelier */}
          <button
            type="button"
            onClick={onOpenDiscovery}
            className="py-2.5 px-2 min-w-0 rounded-xl bg-[#8E1B1B] text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 transition-all duration-200 text-center overflow-hidden cursor-pointer"
            title="AI Taste Sommelier"
          >
            <Compass className="w-3.5 h-3.5 text-[#F5A623] shrink-0" />
            <span className="truncate text-[11px] font-semibold">AI Sommelier</span>
          </button>
        </div>

        {/* Download Success Confirmation Toast */}
        {downloadSuccessToast && (
          <div className="p-2.5 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs flex items-center justify-between shadow-xs animate-fadeIn">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{downloadSuccessToast}</span>
            </div>
            <button
              onClick={() => setShowPrintModal(true)}
              className="underline text-[11px] font-semibold hover:opacity-80 ml-2 whitespace-nowrap"
            >
              Export Options
            </button>
          </div>
        )}

        {/* Quick Filter Chips Strip */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {quickFilters.map((qf) => (
            <button
              key={qf.id}
              onClick={() => setSelectedDiet(qf.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                selectedDiet === qf.id
                  ? 'bg-[#8E1B1B] text-white shadow-xs'
                  : 'bg-stone-100 dark:bg-[#251E19] text-stone-700 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              {qf.label}
            </button>
          ))}
        </div>

        {/* Collapsible Filter Bar */}
        {showFiltersModal && (
          <div className="p-4 rounded-2xl bg-white dark:bg-[#1E1915] border border-[#EDE8E1] dark:border-[#2E2621] shadow-xs space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Sort By */}
              <div>
                <label className="font-semibold text-stone-700 dark:text-stone-300 block mb-1.5">
                  Sort Dishes By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#221C18] text-xs font-medium"
                >
                  <option value="popular">Most Popular &middot; Review Count</option>
                  <option value="rating">Highest Rated &middot; Stars</option>
                  <option value="prepTime">Fastest Prep Time &middot; Quickest First</option>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                </select>
              </div>

              {/* Price Range & Availability */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-stone-700 dark:text-stone-300">
                    Max Price: {formatPrice(maxPrice)}
                  </span>
                  <label className="flex items-center gap-1.5 cursor-pointer text-stone-600 dark:text-stone-400">
                    <input
                      type="checkbox"
                      checked={onlyAvailable}
                      onChange={(e) => setOnlyAvailable(e.target.checked)}
                      className="rounded accent-[#8E1B1B]"
                    />
                    <span>In-Stock Only</span>
                  </label>
                </div>
                <input
                  type="range"
                  min={100}
                  max={600}
                  step={20}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value, 10))}
                  className="w-full accent-[#8E1B1B]"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex justify-end">
              <button
                onClick={() => {
                  setSelectedDiet('all');
                  setOnlyAvailable(false);
                  setMaxPrice(600);
                  setSortBy('popular');
                }}
                className="text-[11px] text-[#8E1B1B] dark:text-[#F5A623] hover:underline font-semibold"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        )}

        {/* Category Horizontal Sticky Tabs */}
        <div className="sticky top-18 z-30 bg-[#FFFDF9]/95 dark:bg-[#161311]/95 backdrop-blur-md -mx-4 px-4 sm:mx-0 sm:px-0 py-2 border-b border-stone-200/50 dark:border-stone-800/50 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-[#3B2418] text-white dark:bg-white dark:text-[#3B2418] shadow-xs'
                : 'bg-stone-100 dark:bg-[#221C18] text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            All Dishes ({menuItems.length})
          </button>

          {categories.map((cat) => {
            const count = menuItems.filter((i) => i.categoryId === cat.id).length;
            if (cat.id === 'cat_seasonal' && !settings.seasonalMenuEnabled) return null;
            const localizedCatName = getLocalized(cat.nameLocalized, cat.name);
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors shrink-0 flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? 'bg-[#8E1B1B] text-white shadow-xs'
                    : 'bg-stone-100 dark:bg-[#221C18] text-stone-600 dark:text-stone-400 hover:text-stone-900'
                }`}
              >
                {cat.isSeasonal && <Sparkles className="w-3 h-3 text-[#F5A623]" />}
                <span>{localizedCatName}</span>
                <span className="text-[10px] opacity-70 font-mono">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dish Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="py-16 text-center space-y-3">
          <p className="font-serif text-lg text-stone-600 dark:text-stone-400">
            No dishes found matching your current filters.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
              setSelectedDiet('all');
              setOnlyAvailable(false);
              setMaxPrice(600);
            }}
            className="px-4 py-2 rounded-xl bg-[#8E1B1B] text-white text-xs font-semibold"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const localizedTitle = getLocalized(item.titleLocalized, item.title);
            const localizedDesc = getLocalized(item.descriptionLocalized, item.description);
            const isDifferentScript = localizedTitle !== item.title;

            return (
              <div
                key={item.id}
                className={`group bg-white dark:bg-[#1E1915] rounded-2xl border border-[#EDE8E1] dark:border-[#2E2621] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                  !item.isAvailable ? 'opacity-70 grayscale-[20%]' : ''
                }`}
              >
                <div>
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

                    {/* Top badges */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                      {item.isChefSpecial && (
                        <span className="px-2 py-0.5 rounded-md bg-[#F5A623] text-stone-900 text-[10px] font-bold uppercase tracking-wider shadow-xs">
                          Chef Pick
                        </span>
                      )}
                      {item.isSeasonal && (
                        <span className="px-2 py-0.5 rounded-md bg-[#8E1B1B] text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
                          Seasonal
                        </span>
                      )}
                    </div>

                    {/* Dish-Wise Prep Time Pill on Card */}
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1 shadow-xs font-mono">
                      <Clock className="w-3 h-3 text-[#F5A623]" />
                      <span>Ready in ~{item.prepTimeMinutes || 12} min</span>
                    </div>

                    {/* Price Tag */}
                    <span className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-xs text-white text-xs font-bold font-mono">
                      {formatPrice(item.price)}
                    </span>

                    {/* Sold out banner */}
                    {!item.isAvailable && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                        <span className="px-3 py-1 rounded-full bg-stone-800 text-stone-200 text-xs font-bold uppercase tracking-wider">
                          Sold Out
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="p-4 space-y-2">
                    <div onClick={() => onSelectItem(item)} className="cursor-pointer space-y-1">
                      <div className="flex items-center gap-2 text-[11px] text-stone-500">
                        <span>{item.categoryName}</span>
                        <span aria-hidden="true">&middot;</span>
                        <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                          <Star className="w-3 h-3 fill-amber-400" />
                          {item.rating}
                        </span>
                      </div>

                      <h3 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100 group-hover:text-[#8E1B1B] dark:group-hover:text-[#F5A623] transition-colors">
                        {localizedTitle}
                      </h3>
                      {isDifferentScript && (
                        <p className="text-[11px] text-stone-500 italic font-mono -mt-0.5">
                          {item.title}
                        </p>
                      )}

                      <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                        {localizedDesc}
                      </p>
                    </div>

                    {/* Metadata: Calories & Dietary Flags */}
                    <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Flame className="w-3 h-3 text-amber-500" />
                        {item.calories} kcal
                      </span>

                      <div className="flex items-center gap-1">
                        {item.dietaryFlags.includes('veg') && (
                          <span className="w-3.5 h-3.5 rounded-sm border border-[#2E7D4F] flex items-center justify-center p-0.5" title="Vegetarian">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D4F]" />
                          </span>
                        )}
                        {item.dietaryFlags.includes('spicy') && (
                          <span title="Spicy">🌶️</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="p-4 pt-0 flex items-center justify-between border-t border-stone-100 dark:border-stone-800 mt-2 pt-3">
                  <button
                    onClick={() => onSelectItem(item)}
                    className="text-[11px] text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 underline"
                  >
                    Custom options
                  </button>

                  <button
                    onClick={() => addToCart(item, 1)}
                    disabled={!item.isAvailable}
                    className="px-3.5 py-1.5 rounded-xl bg-[#8E1B1B] text-white hover:bg-[#741515] transition-all text-xs font-bold flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{item.isAvailable ? 'Add' : 'Sold Out'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Action Pill: View Cart (when items in bag) */}
      {totalItemCount > 0 && (
        <div className="fixed bottom-16 md:bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in fade-in slide-in-from-bottom-4">
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-3 px-5 py-3 rounded-full bg-[#8E1B1B] text-white shadow-2xl hover:bg-[#741515] active:scale-95 transition-all text-xs font-bold border-2 border-[#F5A623]"
          >
            <div className="flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-[#F5A623]" />
              <span className="bg-[#F5A623] text-[#3B2418] rounded-full px-1.5 py-0.2 font-mono text-[11px]">
                {totalItemCount}
              </span>
            </div>
            <span>View Bag &middot; {formatPrice(grandTotal)}</span>
            <ArrowRight className="w-4 h-4 text-[#F5A623]" />
          </button>
        </div>
      )}

      {/* Menu Download & Print Studio Modal */}
      <PrintableMenuModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        categories={categories}
        menuItems={menuItems}
      />

      {/* Dedicated Clean Restaurant Menu Container - Styled for @media print */}
      <div
        id="printable-menu-container"
        className="hidden print:block font-sans text-black bg-white p-6 max-w-[210mm] mx-auto"
      >
        <div className="text-center pb-4 border-b-2 border-stone-800">
          <h1 className="font-serif text-3xl font-bold tracking-tight text-[#8E1B1B]">
            {settings.name.toUpperCase()}
          </h1>
          <p className="text-xs uppercase tracking-widest font-semibold mt-1 text-stone-700">
            {settings.tagline}
          </p>
          <p className="text-xs text-stone-600 mt-1">
            {settings.address} &bull; Ph: {settings.phone} &bull; {settings.email}
          </p>
          <p className="text-[11px] text-stone-500 mt-0.5">
            Operating Hours: 8:00 AM - 11:00 PM Daily &bull; Free Wi-Fi: CafeFlow_Guest (Pass: brewgreat2025)
          </p>
        </div>

        <div className="mt-6 space-y-6">
          {categories.map((cat) => {
            const catItems = menuItems.filter((i) => i.categoryId === cat.id);
            if (catItems.length === 0) return null;

            return (
              <div key={cat.id} className="print-avoid-break space-y-2">
                <div className="flex items-center justify-between border-b border-stone-400 pb-1">
                  <h2 className="font-serif font-bold text-base text-[#8E1B1B]">
                    {cat.name.toUpperCase()}
                  </h2>
                  <span className="text-xs text-stone-500 font-mono">{catItems.length} items</span>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 pt-1">
                  {catItems.map((item) => (
                    <div key={item.id} className="print-avoid-break space-y-0.5">
                      <div className="flex justify-between items-baseline font-semibold text-xs">
                        <span className="font-bold text-stone-900">
                          {item.title}{' '}
                          <span className="text-[10px] font-normal text-stone-600">
                            {item.dietaryFlags.includes('veg') ? '[VEG]' : '[NON-VEG]'}
                          </span>
                        </span>
                        <span className="font-mono text-[#8E1B1B] font-bold">
                          {formatPrice(item.price)}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-[10px] text-stone-600 leading-tight">
                          {item.description}
                        </p>
                      )}
                      <div className="text-[9px] text-stone-400 font-mono">
                        Prep: ~{item.prepTimeMinutes || 12} min {item.dietaryFlags.includes('spicy') ? '&bull; Spicy' : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 pt-4 border-t-2 border-stone-800 text-center text-xs space-y-1">
          <p className="font-semibold text-stone-800">
            Scan Table QR Code for Contactless Reordering &bull; WhatsAppfloor manager: +91 98765 43210
          </p>
          <p className="text-[10px] text-stone-500">
            All prices in Indian Rupees (₹). GST and service charges applicable. Thank you for dining with CafeFlow!
          </p>
        </div>
      </div>
    </div>
  );
};
export default MenuPage;
