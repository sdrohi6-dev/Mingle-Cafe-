import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Compass,
  ArrowRight,
  Check,
  RefreshCw,
  Plus,
  AlertTriangle,
  BookmarkCheck,
  Smile,
  Coffee,
  Sun,
  CloudRain,
  Flame,
} from 'lucide-react';
import { MenuItem, DiscoveryRecommendation, DiscoveryPreference } from '../types';
import { dataService } from '../services/dataService';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { useCustomerAuth } from '../context/CustomerAuthContext';

interface TasteDiscoveryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectItem?: (item: MenuItem) => void;
}

export const TasteDiscoveryDrawer: React.FC<TasteDiscoveryDrawerProps> = ({
  isOpen,
  onClose,
  onSelectItem,
}) => {
  const { addToCart } = useCart();
  const { formatPrice } = useSettings();
  const { customer, saveTasteProfile } = useCustomerAuth();

  const [mode, setMode] = useState<'quiz' | 'freetext'>('quiz');
  const [freeText, setFreeText] = useState('');
  const [preferences, setPreferences] = useState<DiscoveryPreference>({
    mood: 'cozy',
    timeOfDay: 'Morning',
    weather: 'Sunny',
    flavor: 'Savory',
    allergies: [],
    caffeine: 'Light Lift',
    budget: 'Any',
    partySize: 1,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<
    { item: MenuItem; matchPercent: number; reason: string; pairing: string }[]
  >([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  if (!isOpen) return null;

  const toggleAllergy = (allergy: string) => {
    setPreferences((prev) => {
      const exists = prev.allergies.includes(allergy);
      return {
        ...prev,
        allergies: exists
          ? prev.allergies.filter((a) => a !== allergy)
          : [...prev.allergies, allergy],
      };
    });
  };

  // Rule-based fallback scorer
  const runLocalRuleScorer = (
    availableItems: MenuItem[],
    userPrefs: DiscoveryPreference,
    queryText: string
  ) => {
    const scored = availableItems.map((item) => {
      let score = 70;
      const desc = (item.title + ' ' + item.description + ' ' + (item.ingredients || []).join(' ')).toLowerCase();
      const q = queryText.toLowerCase();

      // Query text match
      if (q) {
        const words = q.split(/\s+/).filter((w) => w.length > 2);
        words.forEach((w) => {
          if (desc.includes(w)) score += 8;
        });
      }

      // Mood matches
      if (userPrefs.mood === 'energetic' && (item.categoryId === 'cat_coffee' || item.categoryId === 'cat_juices')) {
        score += 15;
      }
      if (userPrefs.mood === 'cozy' && (item.categoryId === 'cat_tea' || item.categoryId === 'cat_bakery' || item.isSeasonal)) {
        score += 14;
      }
      if (userPrefs.mood === 'light' && (item.calories < 400 || item.categoryId === 'cat_juices')) {
        score += 14;
      }
      if (userPrefs.mood === 'indulgent' && (item.categoryId === 'cat_desserts' || item.title.includes('Burger') || item.title.includes('Truffle'))) {
        score += 16;
      }

      // Flavor matches
      if (userPrefs.flavor === 'Savory' && (item.categoryId === 'cat_breakfast' || item.categoryId === 'cat_mains')) {
        score += 12;
      }
      if (userPrefs.flavor === 'Sweet' && (item.categoryId === 'cat_bakery' || item.categoryId === 'cat_desserts')) {
        score += 12;
      }

      // Special bonus for chef specials
      if (item.isChefSpecial) score += 6;

      const matchPercent = Math.min(99, Math.max(82, score));
      return {
        item,
        matchPercent,
        reason: `Hand-selected by our chef for its ${item.calories < 350 ? 'refreshingly light profile' : 'rich comforting flavors'} and perfectly balanced ingredients.`,
        pairing: item.categoryId === 'cat_coffee' ? 'Pair with Almond Croissant' : 'Pair with Single Origin Cortado',
      };
    });

    scored.sort((a, b) => b.matchPercent - a.matchPercent);
    return scored.slice(0, 3);
  };

  const executeDiscovery = async (overridePrompt?: string) => {
    setIsLoading(true);
    setHasSearched(true);

    // 1. Strict pre-filtering: CURRENT AVAILABILITY (never sold out) & strict allergies
    const allItems = dataService.getMenuItems();
    let eligibleItems = allItems.filter((i) => i.isAvailable);

    if (preferences.allergies.includes('vegan')) {
      eligibleItems = eligibleItems.filter((i) => i.dietaryFlags.includes('vegan'));
    } else if (preferences.allergies.includes('veg')) {
      eligibleItems = eligibleItems.filter((i) => i.dietaryFlags.includes('veg') || i.dietaryFlags.includes('vegan'));
    }

    if (preferences.allergies.includes('glutenFree')) {
      eligibleItems = eligibleItems.filter((i) => i.dietaryFlags.includes('glutenFree'));
    }

    if (eligibleItems.length === 0) {
      eligibleItems = allItems.filter((i) => i.isAvailable);
    }

    const promptText = overridePrompt !== undefined ? overridePrompt : freeText;

    try {
      const response = await fetch('/api/discovery/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences,
          freeText: promptText,
          availableItems: eligibleItems,
        }),
      });

      if (!response.ok) {
        throw new Error('Server discovery failed');
      }

      const data = await response.json();
      if (data.recommendations && Array.isArray(data.recommendations) && data.recommendations.length > 0) {
        const itemMap = new Map(eligibleItems.map((i) => [i.id, i]));
        const formatted = data.recommendations
          .map((rec: DiscoveryRecommendation) => {
            const item = itemMap.get(rec.id);
            if (!item) return null;
            return {
              item,
              matchPercent: rec.matchPercent || 92,
              reason: rec.reason || 'Curated to match your taste profile.',
              pairing: rec.pairing || 'Pair with specialty espresso.',
            };
          })
          .filter(Boolean) as { item: MenuItem; matchPercent: number; reason: string; pairing: string }[];

        if (formatted.length > 0) {
          setRecommendations(formatted);
          setIsLoading(false);
          return;
        }
      }

      // If response was empty or fallback
      const fallback = runLocalRuleScorer(eligibleItems, preferences, promptText);
      setRecommendations(fallback);
    } catch {
      // Local rule scorer fallback
      const fallback = runLocalRuleScorer(eligibleItems, preferences, promptText);
      setRecommendations(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSurpriseMe = () => {
    const surprises = [
      'Surprise me with your most decadent chef special!',
      'Give me something rejuvenating, high protein, and great with a silky flat white.',
      'A cozy sweet treat and comforting warm brew for a cloudy afternoon.',
    ];
    const picked = surprises[Math.floor(Math.random() * surprises.length)];
    setFreeText(picked);
    executeDiscovery(picked);
  };

  const handleSaveProfile = () => {
    saveTasteProfile({
      mood: preferences.mood,
      flavor: preferences.flavor,
      dietary: preferences.allergies,
      caffeine: preferences.caffeine,
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div onClick={onClose} className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity" />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-8">
        <div className="w-screen max-w-lg bg-[#FFFDF9] dark:bg-[#1A1613] text-[#2E1C12] dark:text-[#F3EDE6] shadow-2xl flex flex-col border-l border-[#EDE8E1] dark:border-[#2E2621]">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#EDE8E1] dark:border-[#2E2621] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#FDF0EC] dark:bg-[#341F18] flex items-center justify-center text-[#D9532F]">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-bold">Taste Sommelier</h2>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  AI-powered dish discovery &amp; personalized pairing
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
              aria-label="Close taste drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="px-5 pt-4 flex gap-2">
            <button
              onClick={() => setMode('quiz')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors ${
                mode === 'quiz'
                  ? 'bg-[#2E1C12] text-white dark:bg-white dark:text-[#2E1C12]'
                  : 'bg-stone-100 dark:bg-[#25201C] text-stone-600 dark:text-stone-400'
              }`}
            >
              Step-by-Step Quiz
            </button>
            <button
              onClick={() => setMode('freetext')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
                mode === 'freetext'
                  ? 'bg-[#2E1C12] text-white dark:bg-white dark:text-[#2E1C12]'
                  : 'bg-stone-100 dark:bg-[#25201C] text-stone-600 dark:text-stone-400'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D9532F]" />
              Natural Language (Gemini)
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {mode === 'quiz' ? (
              <div className="space-y-4 text-xs">
                {/* Mood */}
                <div>
                  <label className="font-semibold text-stone-800 dark:text-stone-200 block mb-1.5">
                    1. What is your mood right now?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'energetic', label: 'Energetic & Focused' },
                      { id: 'cozy', label: 'Warm & Cozy Comfort' },
                      { id: 'light', label: 'Fresh & Clean Slate' },
                      { id: 'indulgent', label: 'Decadent Weekend Treat' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setPreferences((p) => ({ ...p, mood: m.id }))}
                        className={`p-2.5 rounded-xl border text-left transition-colors ${
                          preferences.mood === m.id
                            ? 'border-[#D9532F] bg-[#FDF0EC] dark:bg-[#341F18] font-semibold text-[#D9532F]'
                            : 'border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Flavor Profile */}
                <div>
                  <label className="font-semibold text-stone-800 dark:text-stone-200 block mb-1.5">
                    2. Primary Craving / Flavor
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Savory & Rich', 'Sweet & Fruity', 'Tangy & Citrus', 'Spicy Kick', 'Bitter & Bold'].map((f) => (
                      <button
                        key={f}
                        onClick={() => setPreferences((p) => ({ ...p, flavor: f.split(' ')[0] }))}
                        className={`p-2 rounded-xl border text-center transition-colors ${
                          preferences.flavor === f.split(' ')[0]
                            ? 'border-[#D9532F] bg-[#FDF0EC] dark:bg-[#341F18] font-semibold text-[#D9532F]'
                            : 'border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dietary Filter */}
                <div>
                  <label className="font-semibold text-stone-800 dark:text-stone-200 block mb-1.5">
                    3. Dietary &amp; Allergies (Strictly filtered)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { id: 'veg', label: 'Vegetarian' },
                      { id: 'vegan', label: '100% Plant-Based' },
                      { id: 'glutenFree', label: 'Gluten-Free' },
                    ].map((d) => {
                      const active = preferences.allergies.includes(d.id);
                      return (
                        <button
                          key={d.id}
                          onClick={() => toggleAllergy(d.id)}
                          className={`px-3 py-1.5 rounded-lg border text-xs transition-colors flex items-center gap-1 ${
                            active
                              ? 'border-[#5B8266] bg-[#EBF5EE] text-[#2F663C] dark:bg-[#1E2E23] dark:text-[#88C697] font-semibold'
                              : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                          }`}
                        >
                          {active && <Check className="w-3 h-3" />}
                          {d.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Caffeine Preference */}
                <div>
                  <label className="font-semibold text-stone-800 dark:text-stone-200 block mb-1.5">
                    4. Caffeine Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['High Boost', 'Light Lift', 'Zero Caffeine'].map((c) => (
                      <button
                        key={c}
                        onClick={() => setPreferences((p) => ({ ...p, caffeine: c }))}
                        className={`p-2 rounded-xl border text-center transition-colors ${
                          preferences.caffeine === c
                            ? 'border-[#D9532F] bg-[#FDF0EC] dark:bg-[#341F18] font-semibold text-[#D9532F]'
                            : 'border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Free-text Mode */
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-stone-800 dark:text-stone-200 block mb-1">
                    Describe your craving in your own words:
                  </label>
                  <textarea
                    rows={3}
                    value={freeText}
                    onChange={(e) => setFreeText(e.target.value)}
                    placeholder="e.g. I need something refreshing and not too sweet for a rainy morning, with high protein..."
                    className="w-full p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#221C18] focus:outline-none focus:border-[#D9532F] text-xs"
                  />
                </div>

                {/* Dietary Quick Toggles in Free-text */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] text-stone-500">Must be:</span>
                  {[
                    { id: 'veg', label: 'Vegetarian' },
                    { id: 'vegan', label: 'Plant-Based' },
                    { id: 'glutenFree', label: 'Gluten-Free' },
                  ].map((d) => (
                    <button
                      key={d.id}
                      onClick={() => toggleAllergy(d.id)}
                      className={`text-[11px] px-2 py-0.5 rounded-md border ${
                        preferences.allergies.includes(d.id)
                          ? 'border-[#5B8266] bg-[#EBF5EE] text-[#2F663C]'
                          : 'border-stone-200 dark:border-stone-700 text-stone-500'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => executeDiscovery()}
                disabled={isLoading}
                className="flex-1 py-3 px-4 rounded-xl bg-[#D9532F] text-white hover:bg-[#C24522] transition-colors font-medium text-xs flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing Menu with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Find My Matches</span>
                  </>
                )}
              </button>

              <button
                onClick={handleSurpriseMe}
                disabled={isLoading}
                className="py-3 px-3.5 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-medium transition-colors"
                title="Random Chef Surprise"
              >
                Surprise Me
              </button>
            </div>

            {/* Results Section */}
            {hasSearched && !isLoading && (
              <div className="space-y-4 pt-4 border-t border-[#EDE8E1] dark:border-[#2E2621]">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-sm text-stone-900 dark:text-white">
                    Top 3 Recommendations
                  </h3>
                  {customer && (
                    <button
                      onClick={handleSaveProfile}
                      className="text-[11px] text-[#D9532F] flex items-center gap-1 hover:underline font-medium"
                    >
                      <BookmarkCheck className="w-3.5 h-3.5" />
                      {profileSaved ? 'Profile Saved!' : 'Save Taste Profile'}
                    </button>
                  )}
                </div>

                {recommendations.length === 0 ? (
                  <p className="text-xs text-stone-500">
                    No dishes matched these strict dietary filters. Try broadening your criteria.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recommendations.map((rec) => (
                      <div
                        key={rec.item.id}
                        className="p-3.5 rounded-xl bg-white dark:bg-[#221C18] border border-[#EDE8E1] dark:border-[#2E2621] shadow-xs space-y-2.5 transition-all hover:border-[#D9532F]"
                      >
                        <div className="flex gap-3">
                          <img
                            src={rec.item.imageUrl}
                            alt={rec.item.title}
                            referrerPolicy="no-referrer"
                            className="w-16 h-16 rounded-lg object-cover shrink-0 bg-stone-100"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                '/src/assets/images/hero_bistro_spread_1792849166772.jpg';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[11px] font-bold text-[#D9532F] font-mono">
                                {rec.matchPercent}% Match
                              </span>
                              <span className="text-xs font-mono font-bold">
                                {formatPrice(rec.item.price)}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 truncate">
                              {rec.item.title}
                            </h4>
                            <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                              {rec.item.description}
                            </p>
                          </div>
                        </div>

                        {/* Chef's Reason & Pairing */}
                        <div className="bg-[#FAF7F2] dark:bg-[#2A2318] p-2.5 rounded-lg text-[11px] space-y-1">
                          <p className="text-stone-700 dark:text-stone-300">
                            <strong>Why this?</strong> {rec.reason}
                          </p>
                          <p className="text-[#D9532F] font-medium">
                            <strong>Suggested Pairing:</strong> {rec.pairing}
                          </p>
                        </div>

                        {/* One-tap Add To Cart */}
                        <div className="flex items-center justify-between pt-1">
                          <button
                            onClick={() => {
                              onClose();
                              if (onSelectItem) onSelectItem(rec.item);
                            }}
                            className="text-[11px] text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 underline"
                          >
                            Customize options
                          </button>
                          <button
                            onClick={() => addToCart(rec.item, 1)}
                            className="px-3 py-1.5 rounded-lg bg-[#2E1C12] dark:bg-white text-white dark:text-[#2E1C12] hover:bg-[#D9532F] dark:hover:bg-[#D9532F] dark:hover:text-white transition-colors text-xs font-medium flex items-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add to Cart</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Allergen Disclaimer */}
                <div className="p-3 bg-stone-100 dark:bg-[#25201C] rounded-xl text-[11px] text-stone-500 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Allergen Notice:</strong> Our kitchen prepares nuts, dairy, and gluten products. Please notify your server if you have severe anaphylactic allergies.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
