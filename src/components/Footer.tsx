import React from 'react';
import { MapPin, Phone, Mail, Clock, Send, Heart } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { settings } = useSettings();

  return (
    <footer className="bg-[#23150D] text-[#FFFDF9] pt-14 pb-20 md:pb-12 border-t border-[#3B2518]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand & Bio */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#D9532F] flex items-center justify-center text-white font-serif font-bold text-base">
                C
              </div>
              <span className="font-serif text-xl font-bold tracking-tight text-white">
                {settings.name}
              </span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              {settings.description}
            </p>
            <div className="pt-2">
              <a
                href={`https://wa.me/${(settings.whatsappNumber || '919876543210').replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#25D366] text-white text-xs font-semibold hover:bg-[#1EBE5D] transition-colors shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold text-white tracking-wide uppercase">
              Explore
            </h4>
            <ul className="space-y-2 text-xs text-stone-300">
              <li>
                <button onClick={() => onNavigate('menu')} className="hover:text-white transition-colors">
                  Digital QR Menu &amp; Specials
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('reserve')} className="hover:text-white transition-colors">
                  Reserve a Bistro Table
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('offers')} className="hover:text-white transition-colors">
                  Active Promotions &amp; Combos
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('reviews')} className="hover:text-white transition-colors">
                  Guest Reviews &amp; Stories
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('qr')} className="hover:text-white transition-colors">
                  Print Table QR Codes
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors">
                  Catering &amp; Event Inquiries
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Hours & Address */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold text-white tracking-wide uppercase">
              Location &amp; Hours
            </h4>
            <div className="space-y-2.5 text-xs text-stone-300">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#D9532F] shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#D9532F] shrink-0" />
                <span>{settings.openingHours}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#D9532F] shrink-0" />
                <a href={`tel:${settings.phone}`} className="hover:text-white">
                  {settings.phone}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#D9532F] shrink-0" />
                <a href={`mailto:${settings.email}`} className="hover:text-white">
                  {settings.email}
                </a>
              </p>
            </div>
          </div>

          {/* Col 4: Map Embed */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-semibold text-white tracking-wide uppercase">
              Find Us
            </h4>
            <div className="w-full h-36 rounded-xl overflow-hidden border border-[#3E291C] bg-[#1A100A]">
              <iframe
                title="CafeFlow Location"
                src={settings.mapEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-[#3B2518] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <p>
            &copy; {new Date().getFullYear()} {settings.name}. White-label restaurant engine by{' '}
            <strong className="text-stone-300">CafeFlow</strong>.
          </p>
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('admin')} className="hover:text-white transition-colors">
              Staff Portal
            </button>
            <span aria-hidden="true">&middot;</span>
            <button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors">
              Help &amp; Support
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
