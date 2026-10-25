import React, { useState } from 'react';
import {
  Printer,
  Download,
  X,
  FileText,
  Sparkles,
  Check,
  Loader2,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { MenuItem, Category, CafeSettings } from '../types';
import { useSettings } from '../context/SettingsContext';
import { useLanguage } from '../context/LanguageContext';
import {
  downloadBrochurePdf,
  downloadLiveMenuPdf,
  printMenuDirectly,
} from '../services/pdfService';

interface PrintableMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  menuItems: MenuItem[];
}

export const PrintableMenuModal: React.FC<PrintableMenuModalProps> = ({
  isOpen,
  onClose,
  categories,
  menuItems,
}) => {
  const { settings, formatPrice } = useSettings();
  const { getLocalized } = useLanguage();

  const [downloadMode, setDownloadMode] = useState<'brochure' | 'live'>('brochure');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadSuccessMessage(null);

    try {
      if (downloadMode === 'brochure') {
        const success = await downloadBrochurePdf();
        if (!success) {
          // Fallback to dynamic menu generation if static asset fetch is unavailable
          downloadLiveMenuPdf(menuItems, categories, settings, 'all');
        }
        setDownloadSuccessMessage('Official Brochure PDF downloaded to desktop!');
      } else {
        downloadLiveMenuPdf(menuItems, categories, settings, 'all');
        setDownloadSuccessMessage('Live Menu PDF downloaded to desktop!');
      }
      setTimeout(() => setDownloadSuccessMessage(null), 4000);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    printMenuDirectly();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#1C1713] rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between bg-[#FFF6E5]/70 dark:bg-[#251E19]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#8E1B1B] text-white flex items-center justify-center shadow-xs">
              <FileText className="w-5 h-5 text-[#F5A623]" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
                Menu Download &amp; Print Studio
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Save directly as PDF to desktop or print high-contrast dine-in menu sheets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Action Choice Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-1.5 bg-stone-100 dark:bg-stone-900/60 rounded-2xl">
            {/* Option 1: Official Brochure PDF */}
            <div
              onClick={() => setDownloadMode('brochure')}
              className={`p-3.5 rounded-xl cursor-pointer border transition-all ${
                downloadMode === 'brochure'
                  ? 'bg-white dark:bg-stone-800 border-[#8E1B1B] shadow-xs'
                  : 'bg-transparent border-transparent hover:bg-white/50 text-stone-600 dark:text-stone-400'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#F5A623]" />
                  Official Bistro Brochure PDF
                </span>
                {downloadMode === 'brochure' && (
                  <span className="w-4 h-4 rounded-full bg-[#8E1B1B] text-white flex items-center justify-center text-[10px]">
                    ✓
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Artisanal typography, roastery philosophy, single-origin highlights, and guest amenities.
              </p>
            </div>

            {/* Option 2: Live Menu PDF with current items & prices */}
            <div
              onClick={() => setDownloadMode('live')}
              className={`p-3.5 rounded-xl cursor-pointer border transition-all ${
                downloadMode === 'live'
                  ? 'bg-white dark:bg-stone-800 border-[#8E1B1B] shadow-xs'
                  : 'bg-transparent border-transparent hover:bg-white/50 text-stone-600 dark:text-stone-400'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#8E1B1B]" />
                  Full Live Menu PDF ({menuItems.length} Dishes)
                </span>
                {downloadMode === 'live' && (
                  <span className="w-4 h-4 rounded-full bg-[#8E1B1B] text-white flex items-center justify-center text-[10px]">
                    ✓
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Complete catalog of current dishes with ingredient lists, dietary flags, prep times, and prices.
              </p>
            </div>
          </div>

          {/* Download & Print Execution Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#8E1B1B] hover:bg-[#741515] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>
                {isDownloading
                  ? 'Generating PDF File...'
                  : downloadMode === 'brochure'
                  ? 'Download Brochure PDF to Desktop'
                  : 'Download Live Menu PDF to Desktop'}
              </span>
            </button>

            <button
              onClick={handlePrint}
              className="w-full sm:w-auto py-3 px-6 rounded-xl bg-stone-900 hover:bg-black text-white dark:bg-stone-100 dark:text-stone-900 font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Print Menu (A4 / Letter)</span>
            </button>
          </div>

          {/* Success Notification Alert */}
          {downloadSuccessMessage && (
            <div className="p-3 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs flex items-center gap-2 animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{downloadSuccessMessage} Check your browser downloads folder.</span>
            </div>
          )}

          {/* Live Printable Preview Card */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-stone-500 uppercase tracking-wider">
              <span>Print &amp; PDF Layout Preview</span>
              <span className="text-[11px] font-normal lowercase">Formatted for A4 Sheet</span>
            </div>

            <div className="border border-stone-200 dark:border-stone-800 rounded-2xl p-6 bg-white text-stone-900 shadow-inner max-h-[360px] overflow-y-auto font-sans">
              {/* Header */}
              <div className="text-center pb-4 border-b border-stone-300">
                <h1 className="font-serif text-2xl font-bold tracking-tight text-[#8E1B1B]">
                  {settings.name}
                </h1>
                <p className="text-xs text-stone-600 uppercase tracking-widest mt-0.5">
                  {settings.tagline}
                </p>
                <p className="text-[11px] text-stone-500 mt-1">
                  {settings.address} &bull; Ph: {settings.phone}
                </p>
              </div>

              {/* Sample Categories */}
              <div className="mt-4 space-y-6">
                {categories.slice(0, 3).map((cat) => {
                  const catItems = menuItems.filter((it) => it.categoryId === cat.id).slice(0, 3);
                  return (
                    <div key={cat.id} className="space-y-2">
                      <div className="flex items-center gap-2 pb-1 border-b border-stone-200">
                        <span className="font-serif font-bold text-sm text-[#8E1B1B]">
                          {cat.name}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        {catItems.map((item) => (
                          <div key={item.id} className="space-y-0.5">
                            <div className="flex justify-between font-semibold">
                              <span>
                                {item.title}{' '}
                                {item.dietaryFlags.includes('veg') ? '🥬' : '🍗'}
                              </span>
                              <span className="font-mono text-[#8E1B1B]">{formatPrice(item.price)}</span>
                            </div>
                            <p className="text-[11px] text-stone-500 line-clamp-1">{item.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-3 border-t border-dashed border-stone-300 text-center text-[10px] text-stone-400">
                Free Guest Wi-Fi: CafeFlow_Guest &bull; Scan Table QR Code for Contact-free Ordering
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-stone-100 dark:border-stone-800 bg-stone-50 dark:bg-[#181412] flex items-center justify-between text-xs text-stone-500">
          <span>Files are generated in high-resolution vector PDF</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
