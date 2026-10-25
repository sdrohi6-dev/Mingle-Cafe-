import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import {
  Download,
  Printer,
  Check,
  Copy,
  Send,
  Loader2,
  FileText,
  Clock,
  ShieldCheck,
  Sparkles,
  Utensils,
  QrCode,
} from 'lucide-react';
import { Order } from '../types';
import { useSettings } from '../context/SettingsContext';
import { useLanguage } from '../context/LanguageContext';
import { CafeLogo } from './CafeLogo';
import { triggerDirectDownload, downloadOrderInvoicePdf } from '../services/pdfService';

interface ThermalReceiptProps {
  order: Order;
  showActions?: boolean;
  onPrinted?: () => void;
  width?: '80mm' | '58mm';
  compact?: boolean;
}

export const ThermalReceipt: React.FC<ThermalReceiptProps> = ({
  order,
  showActions = true,
  onPrinted,
}) => {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const { settings, formatPrice } = useSettings();
  const { currentLanguage, getLocalized, t } = useLanguage();
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Format date and time
  const orderDate = new Date(order.createdAt || Date.now());
  const dateStr = orderDate.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const timeStr = orderDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const handlePrint = () => {
    // Triggers print dialog formatted specifically for full A4 sheet
    window.print();
    if (onPrinted) onPrinted();
  };

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    setDownloadSuccess(false);

    const fileName = `${order.billNumber || order.orderNumber}_A4_Invoice.pdf`;

    try {
      if (invoiceRef.current) {
        const element = invoiceRef.current;

        // High-resolution rendering targeting standard A4 proportions (210mm wide)
        const canvas = await html2canvas(element, {
          scale: 2, // High resolution for crisp, professional print-ready fonts
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#FFFFFF',
          logging: false,
          scrollX: 0,
          scrollY: 0,
          windowWidth: 1024,
          onclone: (clonedDoc) => {
            // Sanitize any modern CSS color functions to safe hex
            const allEls = clonedDoc.querySelectorAll('*');
            allEls.forEach((el) => {
              if (el instanceof HTMLElement) {
                const comp = window.getComputedStyle(el);
                ['color', 'backgroundColor', 'borderColor', 'outlineColor'].forEach((prop) => {
                  const val = comp.getPropertyValue(prop);
                  if (val && val.includes('oklch')) {
                    (el.style as any)[prop] = '#222222';
                  }
                });
              }
            });
          },
        });

        const imgData = canvas.toDataURL('image/png');
        const a4WidthMm = 210;
        const a4HeightMm = 297;
        const marginMm = 10;
        const maxContentWidthMm = a4WidthMm - marginMm * 2; // 190mm
        const maxContentHeightMm = a4HeightMm - marginMm * 2; // 277mm

        let printWidthMm = maxContentWidthMm;
        let printHeightMm = (canvas.height * printWidthMm) / canvas.width;

        // If height exceeds printable A4 area, scale proportionally so it stays cleanly on 1 single A4 sheet
        if (printHeightMm > maxContentHeightMm) {
          const ratio = maxContentHeightMm / printHeightMm;
          printHeightMm = maxContentHeightMm;
          printWidthMm = printWidthMm * ratio;
        }

        // Center horizontally on the A4 page
        const xOffset = (a4WidthMm - printWidthMm) / 2;
        const yOffset = marginMm;

        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });

        pdf.addImage(imgData, 'PNG', xOffset, yOffset, printWidthMm, printHeightMm, undefined, 'FAST');
        
        // Direct browser save
        pdf.save(fileName);

        // Also trigger direct blob download helper for stubborn pop-up blockers
        try {
          const pdfBlob = pdf.output('blob');
          triggerDirectDownload(pdfBlob, fileName);
        } catch {
          // ignore
        }
      } else {
        downloadOrderInvoicePdf(order, settings);
      }

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    } catch (err) {
      console.warn('Canvas export encountered error, falling back to direct jsPDF invoice generator:', err);
      try {
        downloadOrderInvoicePdf(order, settings);
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 3500);
      } catch (fallbackErr) {
        console.error('Failed to generate A4 Invoice PDF:', fallbackErr);
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyOrderInfo = () => {
    const text = `CafeFlow A4 Tax Invoice #${order.billNumber || order.orderNumber} | Total: ${formatPrice(order.total)} | Table #${order.tableNumber || 1} | Est. Ready: ${order.overallEstimatedTime || '15-20 min'}`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const lines: string[] = [
      `*${settings.name.toUpperCase()} - TAX INVOICE & DINING BILL*`,
      `-----------------------------------------`,
      `*Bill No:* ${order.billNumber || order.orderNumber}`,
      `*Date:* ${dateStr} at ${timeStr}`,
      `*Order Type:* ${order.orderType.toUpperCase()} ${order.tableNumber ? `(Table #${order.tableNumber})` : ''}`,
      `*Guest:* ${order.customerName || 'Valued Guest'}`,
      `*Payment Status:* ${order.paymentStatus === 'paid' ? 'PAID (Online/POS)' : 'PAYMENT AT COUNTER'}`,
      `-----------------------------------------`,
      `*ITEMIZED CHARGES:*`,
    ];

    order.items.forEach((it, idx) => {
      lines.push(`${idx + 1}. ${it.quantity}x ${it.item.title} - ${formatPrice(it.totalUnitPrice * it.quantity)}`);
    });

    lines.push(`-----------------------------------------`);
    lines.push(`*Subtotal:* ${formatPrice(order.subtotal)}`);
    if (order.discount > 0) lines.push(`*Discount:* -${formatPrice(order.discount)}`);
    if (order.loyaltyDiscount > 0) lines.push(`*Loyalty Points:* -${formatPrice(order.loyaltyDiscount)}`);
    lines.push(`*CGST (2.5%):* ${formatPrice(order.cgst || Math.round(order.tax / 2))}`);
    lines.push(`*SGST (2.5%):* ${formatPrice(order.sgst || Math.round(order.tax / 2))}`);
    if (order.serviceCharge > 0) lines.push(`*Service Charge:* ${formatPrice(order.serviceCharge)}`);
    if (order.packagingCharge > 0) lines.push(`*Packaging Fee:* ${formatPrice(order.packagingCharge)}`);
    if (order.deliveryFee > 0) lines.push(`*Delivery Fee:* ${formatPrice(order.deliveryFee)}`);
    lines.push(`*TOTAL PAYABLE:* ${formatPrice(order.total)}`);
    lines.push(`*Estimated Service:* ${order.overallEstimatedTime || 'In ~15 min'}`);
    lines.push(`-----------------------------------------`);
    lines.push(`Thank you for dining with us! Savor the story in every sip.`);

    const url = `https://wa.me/?text=${encodeURIComponent(lines.join('\n'))}`;
    window.open(url, '_blank');
  };

  return (
    <div className="flex flex-col items-center w-full max-w-full">
      {/* Action Buttons Toolbar - Smooth, Box-Contained, Zero Font Truncation */}
      {showActions && (
        <div className="w-full max-w-3xl mb-4 no-print px-1">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 w-full">
            {/* 1. Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="py-2.5 px-3 min-w-0 rounded-xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-xs hover:opacity-90 hover:shadow-sm active:scale-95 transition-all duration-200 cursor-pointer"
              title="Print standard A4 format dining bill"
            >
              <Printer className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">Print A4 Bill</span>
            </button>

            {/* 2. Download A4 PDF Button */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className={`py-2.5 px-3 min-w-0 rounded-xl text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-xs transition-all duration-200 disabled:opacity-50 cursor-pointer ${
                downloadSuccess
                  ? 'bg-[#2E7D4F] hover:bg-[#256841]'
                  : 'bg-[#8E1B1B] hover:bg-[#721515] hover:shadow-sm active:scale-95'
              }`}
              title="Download standard A4 size PDF directly to desktop"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
              ) : downloadSuccess ? (
                <Check className="w-4 h-4 shrink-0" />
              ) : (
                <Download className="w-4 h-4 shrink-0" />
              )}
              <span className="whitespace-nowrap">
                {isExporting
                  ? 'Generating...'
                  : downloadSuccess
                  ? 'Saved to Desktop'
                  : 'Download A4 PDF'}
              </span>
            </button>

            {/* 3. WhatsApp Bill Share */}
            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="py-2.5 px-3 min-w-0 rounded-xl bg-[#25D366] text-white hover:bg-[#1EBE5D] font-semibold text-xs sm:text-sm transition-all duration-200 shadow-xs hover:shadow-sm flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              title="Share Bill via WhatsApp"
            >
              <Send className="w-4 h-4 shrink-0" />
              <span className="whitespace-nowrap">WhatsApp Bill</span>
            </button>

            {/* 4. Copy Order Info */}
            <button
              type="button"
              onClick={handleCopyOrderInfo}
              className="py-2.5 px-3 min-w-0 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-700 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-xs hover:shadow-sm active:scale-95 cursor-pointer"
              title="Copy bill details"
            >
              {copiedLink ? (
                <Check className="w-4 h-4 shrink-0 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 shrink-0" />
              )}
              <span className="whitespace-nowrap">{copiedLink ? 'Copied!' : 'Copy Info'}</span>
            </button>
          </div>
        </div>
      )}

      {/* A4 FORMAT INVOICE & DINING BILL (Replaces thermal slip format) */}
      <div className="w-full flex justify-center overflow-x-auto px-1 py-1">
        <div
          ref={invoiceRef}
          id="a4-bill-container"
          className="w-full max-w-3xl bg-white text-stone-900 p-6 sm:p-8 rounded-2xl shadow-xl border border-stone-200 select-text printable-invoice box-border mx-auto font-sans"
          style={{ color: '#1A1A1A' }}
        >
          {/* Top Header Banner */}
          <div className="pb-5 border-b-2 border-stone-800 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            {/* Left: Cafe Branding & Contacts */}
            <div className="space-y-1 sm:max-w-md">
              <div className="flex items-center gap-2.5 mb-1.5">
                <CafeLogo size="sm" showText={false} />
                <div>
                  <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#8E1B1B] uppercase">
                    {settings.name}
                  </h1>
                  <p className="text-[11px] text-stone-600 font-medium tracking-wide">
                    {settings.tagline || 'Modern All-Day Brunch & Specialty Roastery'}
                  </p>
                </div>
              </div>
              <p className="text-xs text-stone-600 leading-snug">{settings.address}</p>
              <div className="flex flex-wrap gap-x-4 text-xs text-stone-500 pt-0.5 font-mono">
                <span>Ph: {settings.phone}</span>
                <span>Email: {settings.email || 'info@cafeflow.com'}</span>
              </div>
              <div className="flex flex-wrap gap-x-4 text-[11px] text-stone-500 font-mono">
                {settings.gstin && <span className="font-semibold text-stone-700">GSTIN: {settings.gstin}</span>}
                {settings.fssaiLicNo && <span>FSSAI Lic: {settings.fssaiLicNo}</span>}
              </div>
            </div>

            {/* Right: Invoice Type Badge & Numbers */}
            <div className="sm:text-right space-y-1.5 shrink-0 bg-stone-50 sm:bg-transparent p-3 sm:p-0 rounded-xl sm:rounded-none">
              <div className="inline-block px-3 py-1 rounded-md bg-[#8E1B1B] text-white font-bold text-xs uppercase tracking-wider">
                TAX INVOICE &amp; DINING BILL
              </div>
              <div className="space-y-0.5 text-xs font-mono">
                <p className="text-sm font-bold text-stone-900">
                  {t('receipt.billNo') || 'BILL NO'}: {order.billNumber || order.orderNumber}
                </p>
                <p className="text-stone-600">Order ID: #{order.orderNumber}</p>
                <p className="text-stone-600">
                  Date: {dateStr} &bull; {timeStr}
                </p>
              </div>
            </div>
          </div>

          {/* Guest & Service Meta Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-3.5 border-b border-stone-200 text-xs">
            {/* Customer Details */}
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                Billed To (Guest)
              </span>
              <p className="font-bold text-stone-900">{order.customerName || 'Valued Guest'}</p>
              <p className="text-stone-500 font-mono">{order.customerPhone || 'Contact on file'}</p>
            </div>

            {/* Dining Format / Table */}
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                Service Type
              </span>
              <div className="flex items-center gap-1.5 font-bold text-stone-900">
                <span className="uppercase">{order.orderType}</span>
                {order.orderType === 'dineIn' && (
                  <span className="px-2 py-0.5 rounded bg-stone-900 text-white font-mono text-[11px]">
                    Table #{order.tableNumber || 1}
                  </span>
                )}
              </div>
              {order.deliveryAddress && (
                <p className="text-[11px] text-stone-600 truncate">{order.deliveryAddress}</p>
              )}
            </div>

            {/* Payment & Order Status */}
            <div className="space-y-0.5 sm:text-right">
              <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                Payment Status
              </span>
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold font-mono uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span>{order.paymentStatus === 'paid' ? '✔ PAID' : '⚠ PENDING AT COUNTER'}</span>
                <span>({order.paymentMethod.toUpperCase()})</span>
              </div>
            </div>
          </div>

          {/* Full-Width Itemized Table */}
          <div className="py-4 border-b border-stone-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-stone-300 text-stone-500 uppercase text-[10px] tracking-wider font-semibold">
                  <th className="py-2 w-10 text-center">#</th>
                  <th className="py-2">Item Description &amp; Customizations</th>
                  <th className="py-2 w-20 text-center">Diet</th>
                  <th className="py-2 w-16 text-center">Qty</th>
                  <th className="py-2 w-24 text-right">Rate</th>
                  <th className="py-2 w-28 text-right font-bold text-stone-800">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {order.items.map((ci, index) => {
                  const localizedTitle = getLocalized(ci.item.titleLocalized, ci.item.title);
                  const isDifferentScript = localizedTitle !== ci.item.title;
                  const isVeg = ci.item.dietaryFlags?.includes('veg');
                  const isVegan = ci.item.dietaryFlags?.includes('vegan');

                  return (
                    <tr key={ci.cartItemId || index} className="align-top py-2.5">
                      <td className="py-2.5 text-center text-stone-400 font-mono text-[11px]">
                        {index + 1}
                      </td>
                      <td className="py-2.5 pr-2">
                        <div className="font-bold text-stone-900 text-xs sm:text-sm">
                          {ci.item.title}
                        </div>
                        {isDifferentScript && (
                          <div className="text-[11px] text-stone-500 italic">{localizedTitle}</div>
                        )}
                        {/* Modifiers / Add-ons */}
                        {ci.selectedModifiers && ci.selectedModifiers.length > 0 && (
                          <div className="text-[10px] text-stone-600 mt-0.5">
                            + {ci.selectedModifiers.map((m) => m.optionName).join(', ')}
                          </div>
                        )}
                        {/* Kitchen Note */}
                        {ci.specialInstructions && (
                          <div className="text-[10px] text-amber-800 italic mt-0.5">
                            *Note: {ci.specialInstructions}
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 text-center">
                        <span className="text-[11px]">
                          {isVegan ? '🌱 Vegan' : isVeg ? '🥬 Veg' : '🍗 Non-Veg'}
                        </span>
                      </td>
                      <td className="py-2.5 text-center font-mono font-bold text-stone-800 text-xs sm:text-sm">
                        {ci.quantity}
                      </td>
                      <td className="py-2.5 text-right font-mono text-stone-600 text-xs">
                        {formatPrice(ci.totalUnitPrice)}
                      </td>
                      <td className="py-2.5 text-right font-mono font-bold text-stone-900 text-xs sm:text-sm">
                        {formatPrice(ci.totalUnitPrice * ci.quantity)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Lower Two-Column Section: Dish Timetable on Left, Financial Breakdown on Right */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 py-5 border-b-2 border-stone-800 items-start">
            {/* Left 6 columns: Dish Readiness Schedule & Wi-Fi */}
            <div className="md:col-span-6 space-y-3 bg-stone-50 p-4 rounded-xl border border-stone-200">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-stone-800 border-b border-stone-200 pb-1.5">
                <Clock className="w-4 h-4 text-[#8E1B1B]" />
                <span>Kitchen Readiness &amp; Timetable</span>
              </div>

              <div className="space-y-1.5 text-xs">
                {(order.dishTimings && order.dishTimings.length > 0
                  ? order.dishTimings
                  : order.items.map((ci) => ({
                      itemId: ci.item.id,
                      title: ci.item.title,
                      quantity: ci.quantity,
                      prepTimeMinutes: ci.item.prepTimeMinutes || 12,
                      readyAtTime: order.overallEstimatedTime || 'In ~15 min',
                    }))
                ).map((dt, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[11px]">
                    <span className="text-stone-700 truncate pr-2">
                      {dt.quantity}x {dt.title}
                    </span>
                    <span className="font-mono font-semibold bg-white px-2 py-0.5 rounded border border-stone-200 whitespace-nowrap">
                      {dt.readyAtTime}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-stone-200 flex justify-between font-bold text-xs">
                <span className="text-stone-700">All Dishes Served By:</span>
                <span className="text-[#8E1B1B] font-mono underline">
                  {order.overallEstimatedTime || 'In ~20 min'}
                </span>
              </div>

              {/* Guest Wi-Fi & Support info */}
              <div className="pt-2 border-t border-dashed border-stone-200 text-[10px] text-stone-500 space-y-0.5">
                <p>Guest Wi-Fi: <strong className="text-stone-800">CafeFlow_Guest</strong> (Password: <strong className="text-stone-800">brewgreat2025</strong>)</p>
                <p>Floor Concierge: +91 98765 43210 &bull; Tag us @CafeFlowBistro</p>
              </div>
            </div>

            {/* Right 6 columns: Financial Breakdown Ledger */}
            <div className="md:col-span-6 space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal (Items Total):</span>
                <span className="font-mono font-semibold">{formatPrice(order.subtotal)}</span>
              </div>

              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Discount ({order.couponCode || 'PROMO'}):</span>
                  <span className="font-mono">-{formatPrice(order.discount)}</span>
                </div>
              )}

              {order.loyaltyDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Loyalty Points Discount:</span>
                  <span className="font-mono">-{formatPrice(order.loyaltyDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between text-stone-500 text-[11px] pt-1 border-t border-stone-100">
                <span>CGST (2.5%):</span>
                <span className="font-mono">{formatPrice(order.cgst || Math.round(order.tax / 2))}</span>
              </div>

              <div className="flex justify-between text-stone-500 text-[11px]">
                <span>SGST (2.5%):</span>
                <span className="font-mono">{formatPrice(order.sgst || Math.round(order.tax / 2))}</span>
              </div>

              {order.serviceCharge > 0 && (
                <div className="flex justify-between text-stone-500 text-[11px]">
                  <span>Service Charge ({settings.serviceChargePercentage || 5}%):</span>
                  <span className="font-mono">{formatPrice(order.serviceCharge)}</span>
                </div>
              )}

              {order.packagingCharge > 0 && (
                <div className="flex justify-between text-stone-500 text-[11px]">
                  <span>Packaging Fee:</span>
                  <span className="font-mono">{formatPrice(order.packagingCharge)}</span>
                </div>
              )}

              {order.deliveryFee > 0 && (
                <div className="flex justify-between text-stone-500 text-[11px]">
                  <span>Delivery Fee:</span>
                  <span className="font-mono">{formatPrice(order.deliveryFee)}</span>
                </div>
              )}

              {/* Grand Total Banner */}
              <div className="mt-3 p-3 rounded-xl bg-[#8E1B1B] text-white flex justify-between items-center shadow-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-200 block">
                    Total Amount Due
                  </span>
                  <span className="text-sm font-bold">GRAND TOTAL</span>
                </div>
                <span className="font-serif text-2xl font-bold tracking-tight">
                  {formatPrice(order.total)}
                </span>
              </div>

              <p className="text-[10px] text-stone-400 text-right pt-1 font-mono">
                Payment Method: {order.paymentMethod.toUpperCase()} &bull; All taxes included
              </p>
            </div>
          </div>

          {/* Footer Notes & Legal */}
          <div className="pt-4 text-center space-y-1 text-xs text-stone-500">
            <p className="font-bold text-stone-800 text-sm font-serif">
              {t('receipt.thankYou') || 'Thank You for Dining at CafeFlow!'}
            </p>
            <p className="text-[11px] text-stone-600">
              {t('receipt.visitAgain') || 'Fresh farm ingredients baked dawn daily. Please visit again soon.'}
            </p>
            <p className="text-[9px] text-stone-400 font-mono pt-1">
              This is a computer-generated Tax Invoice and Dining Bill. Powered by CafeFlow Smart POS &bull; www.cafeflow.app
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThermalReceipt;
