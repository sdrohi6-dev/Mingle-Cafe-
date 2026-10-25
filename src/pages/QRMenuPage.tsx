import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import {
  Download,
  Printer,
  ExternalLink,
  QrCode,
  Sparkles,
  Check,
  ChevronRight,
  Layers,
  FileText,
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { triggerDirectDownload } from '../services/pdfService';

interface QRMenuPageProps {
  onNavigateToTable: (tableNumber: number) => void;
}

export const QRMenuPage: React.FC<QRMenuPageProps> = ({ onNavigateToTable }) => {
  const { settings } = useSettings();
  const [selectedTable, setSelectedTable] = useState<number>(4);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const totalTables = settings.totalTables || 20;
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://cafeflow.app';
  const tableUrl = `${baseUrl}/?table=${selectedTable}&tab=menu`;

  useEffect(() => {
    QRCode.toDataURL(
      tableUrl,
      {
        width: 320,
        margin: 2,
        color: {
          dark: '#2E1C12',
          light: '#FFFDF9',
        },
      },
      (err, url) => {
        if (!err && url) {
          setQrDataUrl(url);
        }
      }
    );
  }, [tableUrl, selectedTable]);

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `CafeFlow-Table-${selectedTable}-QR.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const handleDownloadCardPdf = () => {
    if (!qrDataUrl) return;
    setIsExportingPdf(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [105, 148], // A6 size table tent card
      });

      // Background border
      doc.setDrawColor(217, 83, 47); // #D9532F
      doc.setLineWidth(1);
      doc.roundedRect(5, 5, 95, 138, 4, 4, 'S');

      // Top Header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(46, 28, 18);
      doc.text(settings.name.toUpperCase(), 52.5, 18, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(140, 100, 80);
      doc.text('MODERN ALL-DAY BISTRO & ROASTERY', 52.5, 23, { align: 'center' });

      // Table Number Badge
      doc.setFillColor(46, 28, 18);
      doc.roundedRect(26, 28, 53, 9, 3, 3, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text(`TABLE #${selectedTable}`, 52.5, 34, { align: 'center' });

      // QR Code Image
      doc.addImage(qrDataUrl, 'PNG', 22.5, 42, 60, 60);

      // Scanning Instructions
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(46, 28, 18);
      doc.text('SCAN WITH PHONE CAMERA TO ORDER', 52.5, 109, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 90, 85);
      doc.text('1. Browse digital menu & dietary tags', 52.5, 115, { align: 'center' });
      doc.text('2. Order & pay via UPI, Card, or WhatsApp', 52.5, 119.5, { align: 'center' });
      doc.text('3. Freshly prepared & served to your seat', 52.5, 124, { align: 'center' });

      // Footer
      doc.setFontSize(6.5);
      doc.setTextColor(150, 140, 130);
      doc.text('Free High-Speed Wi-Fi: CafeFlow_Guest (brewgreat2025)', 52.5, 135, { align: 'center' });

      const fileName = `CafeFlow_Table_${selectedTable}_StandCard.pdf`;
      const pdfBlob = doc.output('blob');
      triggerDirectDownload(pdfBlob, fileName);
    } catch (err) {
      console.error('Failed to generate Table Card PDF:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(tableUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24">
      {/* Page Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#D9532F]">
          <QrCode className="w-3.5 h-3.5" />
          Contactless Dining Technology
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 dark:text-white">
          Table QR Code Generator
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300">
          Generate, preview, and download custom QR codes for Tables 1 to {totalTables}. When scanned, customers are automatically attached to their table for instant ordering and kitchen routing.
        </p>
      </div>

      {/* Main Grid: Selector on Left, Printable Tent Card Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Table Selection & Action Buttons */}
        <div className="lg:col-span-5 space-y-5 bg-white dark:bg-[#1E1915] p-5 sm:p-6 rounded-2xl border border-[#EDE8E1] dark:border-[#2E2621] shadow-xs">
          <div>
            <label className="text-xs font-semibold text-stone-800 dark:text-stone-200 block mb-2">
              Select Table Number (1 - {totalTables}):
            </label>
            <div className="grid grid-cols-5 gap-2 max-h-60 overflow-y-auto p-1">
              {Array.from({ length: totalTables }, (_, i) => i + 1).map((tNum) => (
                <button
                  key={tNum}
                  onClick={() => setSelectedTable(tNum)}
                  className={`py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                    selectedTable === tNum
                      ? 'bg-[#D9532F] text-white shadow-xs scale-105'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200'
                  }`}
                >
                  #{tNum}
                </button>
              ))}
            </div>
          </div>

          {/* Generated URL Info */}
          <div className="p-3 bg-stone-50 dark:bg-[#25201C] rounded-xl space-y-1.5 text-xs">
            <span className="text-stone-500 font-medium block">Target Menu Destination:</span>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-white dark:bg-stone-900 p-2 rounded-lg font-mono text-[11px] text-stone-700 dark:text-stone-300 truncate border border-stone-200 dark:border-stone-700">
                {tableUrl}
              </code>
              <button
                onClick={handleCopyLink}
                className="px-2.5 py-2 rounded-lg bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 text-stone-800 dark:text-stone-200 text-xs font-medium shrink-0"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-green-600" /> : 'Copy'}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={() => onNavigateToTable(selectedTable)}
              className="w-full py-3 px-4 rounded-xl bg-[#D9532F] text-white hover:bg-[#C24522] transition-colors font-medium text-xs flex items-center justify-center gap-2 shadow-sm"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Test Table #{selectedTable} Experience in App</span>
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                onClick={handleDownloadCardPdf}
                disabled={isExportingPdf}
                className="py-2.5 px-3 rounded-xl bg-[#8E1B1B] text-white hover:bg-[#741515] font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs disabled:opacity-50"
                title="Download ready-to-print PDF card directly to desktop"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{isExportingPdf ? 'Saving...' : 'Download PDF'}</span>
              </button>

              <button
                onClick={handleDownloadQR}
                className="py-2.5 px-3 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-100 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
                title="Download QR image PNG"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PNG Image</span>
              </button>

              <button
                onClick={handlePrint}
                className="py-2.5 px-3 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-100 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
                title="Print stand card directly"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Card</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Physical Table Tent Stand Preview (Ready to print) */}
        <div className="lg:col-span-7 flex justify-center">
          <div
            id="table-tent-card"
            className="w-full max-w-sm bg-[#FFFDF9] text-[#2E1C12] rounded-3xl p-8 border-2 border-[#EDE8E1] shadow-xl text-center space-y-6 relative overflow-hidden"
          >
            {/* Top Branding */}
            <div className="space-y-1">
              <div className="w-10 h-10 rounded-2xl bg-[#D9532F] text-white font-serif font-bold text-xl flex items-center justify-center mx-auto shadow-sm">
                C
              </div>
              <h2 className="font-serif text-2xl font-bold tracking-tight text-[#2E1C12]">
                {settings.name}
              </h2>
              <p className="text-[11px] text-stone-500 uppercase tracking-widest font-medium">
                Modern All-Day Bistro &amp; Roastery
              </p>
            </div>

            {/* Table Badge */}
            <div className="inline-block px-5 py-1.5 rounded-full bg-[#2E1C12] text-white font-serif text-sm font-bold tracking-wider">
              TABLE #{selectedTable}
            </div>

            {/* QR Code Canvas Frame */}
            <div className="p-4 bg-white rounded-2xl shadow-inner border border-stone-200 inline-block mx-auto">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR code for Table ${selectedTable}`}
                  className="w-48 h-48 mx-auto"
                />
              ) : (
                <div className="w-48 h-48 bg-stone-100 animate-pulse rounded-lg" />
              )}
            </div>

            {/* Scanning Instructions */}
            <div className="space-y-1 text-xs text-stone-600">
              <p className="font-semibold text-stone-900">Scan with your phone camera</p>
              <p className="text-[11px] text-stone-500">
                1. Browse live digital menu &amp; dietary tags
              </p>
              <p className="text-[11px] text-stone-500">
                2. Order directly &amp; pay via UPI, Card, or WhatsApp
              </p>
              <p className="text-[11px] text-stone-500">
                3. Your meal is prepared &amp; served fresh to this seat
              </p>
            </div>

            <div className="pt-2 border-t border-stone-200 text-[10px] text-stone-400 font-mono">
              High-Speed Guest WiFi &middot; Free Charging at Bar
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
