import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Coffee,
  RotateCcw,
  Plus,
  Clock,
  Check,
  ChevronDown,
  Bot,
  User,
  Globe2,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';
import { dataService } from '../services/dataService';
import { MenuItem } from '../types';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  suggestedItemIds?: string[];
  quickReplies?: string[];
}

export const CafeChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [addedItemNotification, setAddedItemNotification] = useState<string | null>(null);

  const { addToCart, setIsCartOpen } = useCart();
  const { language, t, getLocalized } = useLanguage();
  const { settings, formatPrice } = useSettings();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const allMenuItems = dataService.getMenuItems();

  const initialGreeting: Record<string, string> = {
    en: "Hello! I'm Barista Bot, your culinary concierge at CafeFlow. How can I delight your palate today? Ask about our single-origin coffees, chef specials, vegan options, or table timings!",
    ta: "வணக்கம்! நான் கேஃப்ஃப்ளோவின் பாரிஸ்டா போட் (Barista Bot). காபி, சிறப்பு உணவுகள், சைவ விருப்பங்கள் அல்லது நேரங்கள் பற்றி எது வேண்டுமானாலும் கேளுங்கள்!",
    te: "నమస్కారం! నేను కేఫ్‌ఫ్లో బారిస్టా బాట్ (Barista Bot). మా కాఫీలు, ప్రత్యేక వంటకాలు, శాఖాహార రుచులు లేదా సమయాల గురించి ఏదైనా అడగండి!",
    hi: "नमस्ते! मैं कैफ़ेफ़्लो का बरिस्ता बॉट (Barista Bot) हूँ। हमारी कॉफ़ी, शेफ़ स्पेशल, वीगन विकल्प या समय के बारे में कुछ भी पूछें!",
    ml: "നമസ്കാരം! ഞാൻ കഫേഫ്ലോയുടെ ബാരിസ്റ്റാ ബോട്ട് (Barista Bot) ആണ്. കാപ്പി, പ്രത്യേക വിഭവങ്ങൾ, വെഗൻ ഓപ്ഷനുകൾ എന്നിവയെക്കുറിച്ച് ചോദിക്കൂ!",
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome',
      sender: 'bot',
      text: initialGreeting[language] || initialGreeting.en,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickReplies: [
        '☕ Best morning coffee',
        '🍳 Today Chef Specials',
        '🌱 Vegan & Gluten-Free',
        '📶 Wi-Fi & Timings',
      ],
    },
  ]);

  // Update welcome greeting when language changes if no user messages
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length <= 1 && prev[0]?.id === 'welcome') {
        return [
          {
            id: 'welcome',
            sender: 'bot',
            text: initialGreeting[language] || initialGreeting.en,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            quickReplies: [
              '☕ Best morning coffee',
              '🍳 Today Chef Specials',
              '🌱 Vegan & Gluten-Free',
              '📶 Wi-Fi & Timings',
            ],
          },
        ];
      }
      return prev;
    });
  }, [language]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const history = messages.slice(-6).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversationHistory: history,
          language,
          menuItems: allMenuItems,
        }),
      });

      if (!res.ok) throw new Error('Chat API returned error');

      const data = await res.json();

      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'bot',
        text: data.reply || "I'd love to help! Our baristas are crafting fresh pour-overs and brunch items right now.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedItemIds: data.suggestedItemIds || [],
        quickReplies: data.quickReplies || [],
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      // Graceful offline fallback
      let fallbackText = "I'm right at your service! Our Chikmagalur single-origin coffees, Truffle Scramble, and Avocado Tartine are popular today. How else may I assist you?";
      if (text.toLowerCase().includes('wifi') || text.toLowerCase().includes('password')) {
        fallbackText = "Our complimentary high-speed Wi-Fi is 'CafeFlow_Guest' with password 'brewgreat2025'. Enjoy your session!";
      } else if (text.toLowerCase().includes('hours') || text.toLowerCase().includes('timing')) {
        fallbackText = "We are open daily from 8:00 AM to 11:00 PM for breakfast, brunch, golden-hour coffee, and dinner.";
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `bot_${Date.now()}`,
          sender: 'bot',
          text: fallbackText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          quickReplies: ['View Full Menu', 'Book a Table'],
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleAddItemToBag = (item: MenuItem) => {
    addToCart(item, 1);
    setAddedItemNotification(`Added ${item.title} to bag!`);
    setTimeout(() => setAddedItemNotification(null), 2500);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'bot',
        text: initialGreeting[language] || initialGreeting.en,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickReplies: [
          '☕ Best morning coffee',
          '🍳 Today Chef Specials',
          '🌱 Vegan & Gluten-Free',
          '📶 Wi-Fi & Timings',
        ],
      },
    ]);
  };

  return (
    <>
      {/* Floating Launcher Button - Stacks cleanly above WhatsApp button */}
      <div className="fixed bottom-36 md:bottom-22 right-4 sm:right-6 z-40 no-print flex flex-col items-end gap-2">
        {/* Floating Bubble Hint if not open */}
        {!isOpen && (
          <div
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#1E1915] text-[#3B2418] dark:text-[#F3EDE6] shadow-lg border border-[#EDE8E1] dark:border-[#2E2621] text-xs font-semibold cursor-pointer hover:scale-105 transition-all animate-bounce"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#F5A623]" />
            <span>Ask Barista AI</span>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-[#8E1B1B] to-[#C24522] text-white flex items-center justify-center shadow-2xl hover:scale-108 active:scale-95 transition-all border-2 border-[#F5A623]/80 group"
          aria-label={isOpen ? 'Close Barista AI Chat' : 'Open Barista AI Chat'}
        >
          {isOpen ? (
            <X className="w-6 h-6 transition-transform group-hover:rotate-90" />
          ) : (
            <>
              <Coffee className="w-6 h-6 text-[#FFF6E5]" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F5A623] opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-[#F5A623] text-[#3B2418] text-[9px] font-bold items-center justify-center">
                  AI
                </span>
              </span>
            </>
          )}
        </button>
      </div>

      {/* Responsive Chat Window */}
      {isOpen && (
        <div className="fixed bottom-0 sm:bottom-24 right-0 sm:right-6 z-50 no-print w-full sm:w-[400px] h-[85vh] sm:h-[560px] max-h-[85vh] bg-[#FFFDF9] dark:bg-[#1A1613] text-[#3B2418] dark:text-[#F3EDE6] sm:rounded-3xl shadow-2xl border border-[#EDE8E1] dark:border-[#2E2621] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          {/* Header */}
          <div className="p-3.5 sm:p-4 bg-gradient-to-r from-[#8E1B1B] via-[#741515] to-[#3B2418] text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-xs flex items-center justify-center border border-white/20">
                  <Coffee className="w-5 h-5 text-[#F5A623]" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#2E7D4F] border-2 border-[#8E1B1B]" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-serif font-bold text-sm sm:text-base leading-tight">
                    Barista Bot AI
                  </h3>
                  <span className="px-1.5 py-0.2 rounded-full bg-[#F5A623] text-stone-900 font-bold text-[9px] uppercase tracking-wider">
                    Concierge
                  </span>
                </div>
                <p className="text-[10px] text-stone-300 font-sans">
                  Specialty Coffee &bull; Menu Guide &bull; 5 Languages
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
                title="Restart conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close chat"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Notification Pill */}
          {addedItemNotification && (
            <div className="bg-[#EBF5EE] text-[#2F663C] px-3 py-1.5 text-xs font-semibold flex items-center justify-between border-b border-[#CBE5D3] animate-in fade-in">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#2E7D4F]" />
                {addedItemNotification}
              </span>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsCartOpen(true);
                }}
                className="underline text-[11px] font-bold"
              >
                View Bag
              </button>
            </div>
          )}

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-4 text-xs">
            {messages.map((m) => {
              const isBot = m.sender === 'bot';

              // Resolve suggested items
              const suggestedDishes = isBot && m.suggestedItemIds
                ? allMenuItems.filter((it) => m.suggestedItemIds?.includes(it.id))
                : [];

              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isBot ? 'items-start' : 'items-end'} space-y-1.5`}
                >
                  <div className="flex items-end gap-1.5 max-w-[88%]">
                    {isBot && (
                      <div className="w-6 h-6 rounded-full bg-[#8E1B1B] text-white flex items-center justify-center shrink-0 mb-0.5">
                        <Bot className="w-3.5 h-3.5 text-[#F5A623]" />
                      </div>
                    )}

                    <div
                      className={`p-3 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                        isBot
                          ? 'bg-white dark:bg-[#221C18] text-[#3B2418] dark:text-[#F3EDE6] rounded-bl-xs border border-stone-200/80 dark:border-stone-800 shadow-xs'
                          : 'bg-[#8E1B1B] text-white rounded-br-xs shadow-xs'
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>

                  <span className="text-[9px] text-stone-400 font-mono px-1">
                    {m.timestamp}
                  </span>

                  {/* Render Suggested Menu Item Cards inside bot message */}
                  {suggestedDishes.length > 0 && (
                    <div className="w-full pl-7 pt-1 space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E1B1B] dark:text-[#F5A623]">
                        Recommended by Chef &amp; Barista:
                      </span>
                      <div className="grid grid-cols-1 gap-2">
                        {suggestedDishes.map((dish) => {
                          const localizedTitle = getLocalized(dish.titleLocalized, dish.title);
                          return (
                            <div
                              key={dish.id}
                              className="p-2.5 rounded-xl bg-white dark:bg-[#241D19] border border-[#F6D2C4] dark:border-[#3E251C] flex items-center justify-between gap-3 shadow-2xs hover:border-[#8E1B1B] transition-colors"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <img
                                  src={dish.imageUrl}
                                  alt={dish.title}
                                  className="w-11 h-11 rounded-lg object-cover bg-stone-100 shrink-0"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      '/src/assets/images/hero_bistro_spread_1792849166772.jpg';
                                  }}
                                />
                                <div className="min-w-0">
                                  <p className="font-semibold text-xs text-stone-900 dark:text-stone-100 truncate">
                                    {localizedTitle}
                                  </p>
                                  <div className="flex items-center gap-2 text-[10px] text-stone-500">
                                    <span className="font-bold text-[#8E1B1B] dark:text-[#F5A623] font-mono">
                                      {formatPrice(dish.price)}
                                    </span>
                                    <span>&bull;</span>
                                    <span className="flex items-center gap-0.5">
                                      <Clock className="w-2.5 h-2.5 text-stone-400" />
                                      ~{dish.prepTimeMinutes || 10}m
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <button
                                onClick={() => handleAddItemToBag(dish)}
                                disabled={!dish.isAvailable}
                                className="px-2.5 py-1.5 rounded-lg bg-[#8E1B1B] text-white hover:bg-[#741515] text-[11px] font-bold flex items-center gap-1 shrink-0 active:scale-95 shadow-xs disabled:opacity-50"
                              >
                                <Plus className="w-3 h-3" />
                                <span>{dish.isAvailable ? 'Add' : 'Sold Out'}</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Quick Action Replies */}
                  {isBot && m.quickReplies && m.quickReplies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pl-7 pt-1">
                      {m.quickReplies.map((qr, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(qr)}
                          className="px-2.5 py-1 rounded-full bg-[#FFF3ED] dark:bg-[#2B1F19] text-[#8E1B1B] dark:text-[#F5A623] border border-[#F6D2C4] dark:border-[#3E251C] hover:bg-[#FFE6DC] text-[10px] font-semibold transition-all hover:scale-102"
                        >
                          {qr}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 text-stone-500 text-xs pl-7">
                <div className="flex items-center gap-1 p-2 rounded-xl bg-white dark:bg-[#221C18] border border-stone-200 dark:border-stone-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8E1B1B] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8E1B1B] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8E1B1B] animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-[10px] font-mono text-stone-400 ml-1">Barista is typing...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Input Form */}
          <div className="p-3 bg-white dark:bg-[#1E1915] border-t border-[#EDE8E1] dark:border-[#2E2621]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about coffee, ingredients, vegan dishes..."
                className="flex-1 text-xs p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-[#221C18] text-[#3B2418] dark:text-[#F3EDE6] focus:outline-none focus:border-[#8E1B1B]"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isTyping}
                className="p-2.5 rounded-xl bg-[#8E1B1B] text-white hover:bg-[#741515] transition-colors disabled:opacity-40 shadow-xs"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <p className="text-[9px] text-center text-stone-400 mt-1.5">
              Powered by CafeFlow Gemini AI &bull; Speaks English, தமிழ், తెలుగు, हिन्दी, മലയാളം
            </p>
          </div>
        </div>
      )}
    </>
  );
};
