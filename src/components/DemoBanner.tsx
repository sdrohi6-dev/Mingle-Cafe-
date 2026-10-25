import React from 'react';
import { Sparkles, Shield, X } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

interface DemoBannerProps {
  onNavigateToAdmin?: () => void;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({ onNavigateToAdmin }) => {
  const [dismissed, setDismissed] = React.useState(false);
  const { isAuthenticated, login } = useAdminAuth();

  if (dismissed) return null;

  const handleQuickAdminLogin = () => {
    if (!isAuthenticated) {
      login('admin', 'admin123');
    }
    if (onNavigateToAdmin) {
      onNavigateToAdmin();
    }
  };

  return (
    <aside aria-label="Demo mode announcement" className="bg-[#2E1C12] text-[#FFFDF9] text-xs py-1.5 px-4 flex items-center justify-between border-b border-[#4A3222] z-50">
      <div className="flex items-center gap-2 max-w-5xl mx-auto flex-wrap justify-center text-center">
        <span className="flex items-center gap-1 font-semibold text-[#D9532F]">
          <Sparkles className="w-3.5 h-3.5" />
          Demo Mode
        </span>
        <span className="text-stone-300">
          Local persistence active &middot; Table 4 auto-detected &middot; WhatsApp &amp; In-App checkout enabled
        </span>
        <span className="hidden sm:inline text-stone-400">|</span>
        <div className="flex items-center gap-1.5">
          <span className="text-stone-300">Admin Portal:</span>
          <span className="text-amber-200 font-mono text-[11px] bg-[#4A3222] px-1.5 py-0.5 rounded">
            roha005018@gmail.com
          </span>
          <button
            onClick={() => onNavigateToAdmin && onNavigateToAdmin()}
            className="ml-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#8E1B1B] text-white hover:bg-[#741515] transition-colors font-medium text-[11px]"
          >
            <Shield className="w-3 h-3 text-[#F5A623]" />
            {isAuthenticated ? 'Admin Dashboard' : 'Google Admin Login'}
          </button>
        </div>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-stone-400 hover:text-stone-200 p-1"
        aria-label="Dismiss banner"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </aside>
  );
};
