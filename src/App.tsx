import React, { useState, useEffect } from 'react';
import { SettingsProvider } from './context/SettingsContext';
import { LanguageProvider } from './context/LanguageContext';
import { CartProvider } from './context/CartContext';
import { CustomerAuthProvider } from './context/CustomerAuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';

import { DemoBanner } from './components/DemoBanner';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { CartDrawer } from './components/CartDrawer';
import { ItemModal } from './components/ItemModal';
import { TasteDiscoveryDrawer } from './components/TasteDiscoveryDrawer';
import { LanguageWelcomeModal } from './components/LanguageWelcomeModal';
import { CafeChatbot } from './components/CafeChatbot';
import { FloatingWhatsAppButton } from './components/FloatingWhatsAppButton';
import { Footer } from './components/Footer';

import { HomePage } from './pages/HomePage';
import { MenuPage } from './pages/MenuPage';
import { QRMenuPage } from './pages/QRMenuPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { ReservationPage } from './pages/ReservationPage';
import { OffersPage } from './pages/OffersPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { AccountPage } from './pages/AccountPage';
import { ContactPage } from './pages/ContactPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { MenuItem } from './types';

function MainApp() {
  const [currentTab, setCurrentTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab');
      if (tabParam) return tabParam;
    }
    return 'home';
  });

  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string | undefined>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('order') || undefined;
    }
    return undefined;
  });

  const [selectedItemForModal, setSelectedItemForModal] = useState<MenuItem | null>(null);
  const [isDiscoveryOpen, setIsDiscoveryOpen] = useState(false);

  // Sync state to URL without full refresh
  const navigateToTab = (tab: string, extraParams?: Record<string, string>) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      params.set('tab', tab);
      if (extraParams) {
        Object.entries(extraParams).forEach(([k, v]) => params.set(k, v));
      }
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.pushState({}, '', newUrl);
    }
  };

  // Listen to popstate (browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get('tab') || 'home';
      setCurrentTab(tabParam);
      const orderParam = urlParams.get('order') || undefined;
      if (orderParam) setActiveTrackingOrderId(orderParam);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleOrderPlaced = (orderId: string) => {
    setActiveTrackingOrderId(orderId);
    navigateToTab('track', { order: orderId });
  };

  const handleNavigateToTable = (tableNumber: number) => {
    navigateToTab('menu', { table: tableNumber.toString() });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9] dark:bg-[#161311] text-[#2E1C12] dark:text-[#F3EDE6] selection:bg-[#FBE4DD] selection:text-[#D9532F] transition-colors">
      {/* 1. In-App Demo Mode Banner with Quick Login Link */}
      <DemoBanner onNavigateToAdmin={() => navigateToTab('admin')} />

      {/* 2. Top Navigation Bar (Strict 3-zone Top Bar Contract on desktop) */}
      <Navbar
        currentTab={currentTab}
        onNavigate={navigateToTab}
        onOpenDiscovery={() => setIsDiscoveryOpen(true)}
      />

      {/* 3. Main Route Content */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <HomePage
            onNavigate={navigateToTab}
            onOpenDiscovery={() => setIsDiscoveryOpen(true)}
            onSelectItem={(item) => setSelectedItemForModal(item)}
          />
        )}

        {currentTab === 'menu' && (
          <MenuPage
            onSelectItem={(item) => setSelectedItemForModal(item)}
            onOpenDiscovery={() => setIsDiscoveryOpen(true)}
          />
        )}

        {currentTab === 'qr' && (
          <QRMenuPage onNavigateToTable={handleNavigateToTable} />
        )}

        {currentTab === 'track' && (
          <OrderTrackingPage
            initialOrderId={activeTrackingOrderId}
            onNavigateToMenu={() => navigateToTab('menu')}
          />
        )}

        {currentTab === 'reserve' && <ReservationPage />}

        {currentTab === 'offers' && (
          <OffersPage onNavigateToMenu={() => navigateToTab('menu')} />
        )}

        {currentTab === 'reviews' && <ReviewsPage />}

        {currentTab === 'account' && (
          <AccountPage
            onNavigateToOrder={(orderId) => {
              setActiveTrackingOrderId(orderId);
              navigateToTab('track', { order: orderId });
            }}
            onSelectItem={(item) => setSelectedItemForModal(item)}
          />
        )}

        {currentTab === 'contact' && <ContactPage />}

        {currentTab === 'admin' && <AdminDashboard />}
      </main>

      {/* 4. Slide-in Cart Drawer with UPI/Card/Cash & WhatsApp checkout */}
      <CartDrawer onOrderPlaced={handleOrderPlaced} />

      {/* 5. Item Detail Modal with modifiers & special instructions */}
      <ItemModal
        item={selectedItemForModal}
        onClose={() => setSelectedItemForModal(null)}
      />

      {/* 6. Smart Taste Discovery Sommelier Drawer with Gemini AI */}
      <TasteDiscoveryDrawer
        isOpen={isDiscoveryOpen}
        onClose={() => setIsDiscoveryOpen(false)}
        onSelectItem={(item) => setSelectedItemForModal(item)}
      />

      {/* 7. Language Welcome Modal (First Visit) */}
      <LanguageWelcomeModal />

      {/* 8. AI Barista Chatbot Concierge */}
      {currentTab !== 'admin' && <CafeChatbot />}

      {/* 8b. Floating WhatsApp Quick Support (bottom-right, icon-only mobile, text+icon desktop) */}
      {currentTab !== 'admin' && <FloatingWhatsAppButton />}

      {/* 9. Rich Footer with Map, Hours, Socials & WhatsApp */}
      {currentTab !== 'admin' && <Footer onNavigate={navigateToTab} />}

      {/* 10. Mobile Sticky Bottom Nav (<15% height) */}
      {currentTab !== 'admin' && (
        <BottomNav
          currentTab={currentTab}
          onNavigate={navigateToTab}
          onOpenDiscovery={() => setIsDiscoveryOpen(true)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <LanguageProvider>
        <CartProvider>
          <CustomerAuthProvider>
            <AdminAuthProvider>
              <MainApp />
            </AdminAuthProvider>
          </CustomerAuthProvider>
        </CartProvider>
      </LanguageProvider>
    </SettingsProvider>
  );
}
