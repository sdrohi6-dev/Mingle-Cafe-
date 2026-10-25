import React, { useState } from 'react';
import { X, Plus, Minus, Clock, Flame, Star, ShieldCheck, Heart } from 'lucide-react';
import { MenuItem, SelectedModifier } from '../types';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { useCustomerAuth } from '../context/CustomerAuthContext';

interface ItemModalProps {
  item: MenuItem | null;
  onClose: () => void;
}

export const ItemModal: React.FC<ItemModalProps> = ({ item, onClose }) => {
  const { addToCart } = useCart();
  const { formatPrice } = useSettings();
  const { isFavorite, toggleFavorite } = useCustomerAuth();

  const [quantity, setQuantity] = useState(1);
  const [selectedModifiers, setSelectedModifiers] = useState<SelectedModifier[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');

  if (!item) return null;

  const handleModifierChange = (
    groupId: string,
    groupTitle: string,
    optionId: string,
    optionName: string,
    priceDelta: number
  ) => {
    setSelectedModifiers((prev) => {
      // Single selection per group for radio style
      const filtered = prev.filter((m) => m.groupId !== groupId);
      return [...filtered, { groupId, groupTitle, optionId, optionName, priceDelta }];
    });
  };

  const modDelta = selectedModifiers.reduce((acc, m) => acc + m.priceDelta, 0);
  const unitPrice = item.price + modDelta;
  const totalPrice = unitPrice * quantity;

  const handleAdd = () => {
    addToCart(item, quantity, selectedModifiers, specialInstructions);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity" />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-[#FFFDF9] dark:bg-[#1A1613] text-[#2E1C12] dark:text-[#F3EDE6] rounded-2xl shadow-2xl overflow-hidden border border-[#EDE8E1] dark:border-[#2E2621] my-8 z-10">
        {/* Dish Photo */}
        <div className="relative h-56 sm:h-64 w-full bg-stone-100 dark:bg-stone-800">
          <img
            src={item.imageUrl}
            alt={item.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80';
            }}
          />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <button
            onClick={() => toggleFavorite(item.id)}
            className="absolute top-3 left-3 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
            aria-label="Save to favorites"
          >
            <Heart
              className={`w-5 h-5 ${
                isFavorite(item.id) ? 'fill-[#D9532F] text-[#D9532F]' : 'text-white'
              }`}
            />
          </button>

          {!item.isAvailable && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
              <span className="px-4 py-1.5 rounded-full bg-red-600 text-white text-xs font-bold uppercase tracking-wider">
                Sold Out Today
              </span>
            </div>
          )}
        </div>

        {/* Details Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs uppercase tracking-wider text-stone-500 font-medium">
                {item.categoryName || 'Bistro Selection'}
              </span>
              <span className="text-lg font-serif font-bold text-[#D9532F] font-mono tabular-nums">
                {formatPrice(unitPrice)}
              </span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-white mt-1">
              {item.title}
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
            {item.description}
          </p>

          {/* Clean Unboxed Metadata Line (Zero-Pill discipline) */}
          <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400 py-1 border-y border-stone-200/60 dark:border-stone-800">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#D9532F]" />
              {item.prepTimeMinutes} mins prep
            </span>
            <span aria-hidden="true">&middot;</span>
            <span className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              {item.calories} kcal
            </span>
            <span aria-hidden="true">&middot;</span>
            <span className="flex items-center gap-1 font-semibold text-stone-700 dark:text-stone-200">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {item.rating} ({item.reviewCount || 12})
            </span>
          </div>

          {/* Dietary Flags */}
          {item.dietaryFlags.length > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-stone-500 font-medium">Dietary:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {item.dietaryFlags.map((flag) => (
                  <span
                    key={flag}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-[#EBF5EE] text-[#2F663C] dark:bg-[#1E2E23] dark:text-[#88C697] font-medium"
                  >
                    {flag === 'veg' && 'Vegetarian'}
                    {flag === 'vegan' && '100% Plant-Based'}
                    {flag === 'glutenFree' && 'Gluten-Free'}
                    {flag === 'nutFree' && 'Nut-Free'}
                    {flag === 'spicy' && 'Spicy'}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Ingredients */}
          {item.ingredients && item.ingredients.length > 0 && (
            <div className="text-xs text-stone-500 dark:text-stone-400">
              <span className="font-medium text-stone-700 dark:text-stone-300">Key Ingredients: </span>
              {item.ingredients.join(', ')}
            </div>
          )}

          {/* Modifiers Selection */}
          {item.modifierGroups && item.modifierGroups.length > 0 && (
            <div className="space-y-4 pt-2">
              {item.modifierGroups.map((group) => (
                <div key={group.id} className="space-y-2">
                  <label className="text-xs font-semibold text-stone-800 dark:text-stone-200 block">
                    {group.title}
                  </label>
                  <div className="space-y-1.5">
                    {group.options.map((opt) => {
                      const isSelected = selectedModifiers.some(
                        (m) => m.groupId === group.id && m.optionId === opt.id
                      );
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() =>
                            handleModifierChange(group.id, group.title, opt.id, opt.name, opt.priceDelta)
                          }
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs text-left transition-colors ${
                            isSelected
                              ? 'border-[#D9532F] bg-[#FDF0EC] dark:bg-[#341F18] font-medium text-[#D9532F]'
                              : 'border-stone-200 dark:border-stone-700 hover:border-stone-400 text-stone-700 dark:text-stone-300'
                          }`}
                        >
                          <span>{opt.name}</span>
                          <span className="font-mono text-stone-500">
                            {opt.priceDelta > 0 ? `+${formatPrice(opt.priceDelta)}` : 'Included'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Special Instructions */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-semibold text-stone-800 dark:text-stone-200 block">
              Special Preparation Notes
            </label>
            <input
              type="text"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Less ice, extra hot, dressing on the side..."
              className="w-full text-xs p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#221C18] focus:outline-none focus:border-[#D9532F]"
            />
          </div>
        </div>

        {/* Footer Add Bar */}
        <div className="p-4 sm:p-5 border-t border-[#EDE8E1] dark:border-[#2E2621] bg-[#FAF7F2] dark:bg-[#1A1613] flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white dark:bg-[#25201C] border border-stone-200 dark:border-stone-700 rounded-xl p-1">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1 || !item.isAvailable}
              className="w-8 h-8 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-center text-stone-600 dark:text-stone-300 disabled:opacity-40"
              aria-label="Decrease quantity"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-6 text-center font-mono font-bold text-sm">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              disabled={!item.isAvailable}
              className="w-8 h-8 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-center text-stone-600 dark:text-stone-300 disabled:opacity-40"
              aria-label="Increase quantity"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleAdd}
            disabled={!item.isAvailable}
            className="flex-1 py-3 px-4 rounded-xl bg-[#D9532F] text-white hover:bg-[#C24522] transition-colors font-medium text-sm flex items-center justify-center gap-2 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>{item.isAvailable ? `Add to Order &middot; ${formatPrice(totalPrice)}` : 'Item Unavailable'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
