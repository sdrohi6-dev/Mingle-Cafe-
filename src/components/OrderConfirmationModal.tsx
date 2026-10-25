import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  CheckCircle2,
  Clock,
  Printer,
  Download,
  ArrowRight,
  ShieldCheck,
  Send,
  UtensilsCrossed,
  Sparkles,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { useLanguage } from '../context/LanguageContext';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { dataService } from '../services/dataService';
import { ThermalReceipt } from './ThermalReceipt';
import { Order, PaymentMethod } from '../types';

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCompleted: (orderId: string) => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  isOpen,
  onClose,
  onOrderCompleted,
}) => {
  const {
    cartItems,
    orderType,
    tableNumber,
    deliveryAddress,
    customerName,
    customerPhone,
    appliedCoupon,
    subtotal,
    discountAmount,
    loyaltyDiscountAmount,
    taxAmount,
    cgstAmount,
    sgstAmount,
    serviceChargeAmount,
    packagingFeeAmount,
    deliveryFeeAmount,
    grandTotal,
    dishTimings,
    overallEstimatedTime,
    redeemedPoints,
    clearCart,
    buildWhatsAppOrderUrl,
  } = useCart();

  const { settings, formatPrice } = useSettings();
  const { currentLanguage, t, getLocalized } = useLanguage();
  const { customer } = useCustomerAuth();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState<'review' | 'invoice'>('review');

  if (!isOpen) return null;

  // Build temporary draft order object for live Thermal/A4 Receipt preview
  const draftOrder: Order = createdOrder || {
    id: 'draft',
    billNumber: 'CF-BILL-PREVIEW',
    orderNumber: 'CF-PREVIEW',
    customerName: customerName || 'Valued Guest',
    customerPhone: customerPhone || '+91 98765 43210',
    orderType,
    tableNumber: orderType === 'dineIn' ? tableNumber || 1 : undefined,
    deliveryAddress: orderType === 'delivery' ? deliveryAddress : undefined,
    items: cartItems,
    subtotal,
    discount: discountAmount,
    couponCode: appliedCoupon?.code,
    tax: taxAmount,
    cgst: cgstAmount,
    sgst: sgstAmount,
    serviceCharge: serviceChargeAmount,
    packagingCharge: packagingFeeAmount,
    deliveryFee: deliveryFeeAmount,
    loyaltyDiscount: loyaltyDiscountAmount,
    loyaltyPointsUsed: redeemedPoints,
    loyaltyPointsEarned: Math.floor(grandTotal / (settings.loyaltyEarnRate * 10)),
    total: grandTotal,
    status: 'received',
    paymentMethod,
    paymentStatus: paymentMethod === 'cash' ? 'pending' : 'paid',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    timeline: [],
    dishTimings,
    overallEstimatedTime,
    language: currentLanguage,
  };

  const handleConfirmOrder = () => {
    setIsSubmitting(true);
    try {
      const newOrder = dataService.createOrder({
        customerName: customerName || 'Valued Guest',
        customerPhone: customerPhone || '+91 98765 43210',
        orderType,
        tableNumber: orderType === 'dineIn' ? tableNumber || 1 : undefined,
        deliveryAddress: orderType === 'delivery' ? deliveryAddress : undefined,
        items: cartItems,
        subtotal,
        discount: discountAmount,
        couponCode: appliedCoupon?.code,
        tax: taxAmount,
        cgst: cgstAmount,
        sgst: sgstAmount,
        serviceCharge: serviceChargeAmount,
        packagingCharge: packagingFeeAmount,
        deliveryFee: deliveryFeeAmount,
        loyaltyDiscount: loyaltyDiscountAmount,
        loyaltyPointsUsed: redeemedPoints,
        total: grandTotal,
        status: 'received',
        paymentMethod,
        paymentStatus: paymentMethod === 'cash' ? 'pending' : 'paid',
        dishTimings,
        overallEstimatedTime,
        language: currentLanguage,
      });

      if (redeemedPoints > 0 && customer) {
        dataService.adjustCustomerPoints(customer.phone, -redeemedPoints);
      }

      setCreatedOrder(newOrder);
      // Automatically switch to the A4 Tax Invoice tab
      setActiveTab('invoice');

      // Trigger celebratory confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8E1B1B', '#F5A623', '#2E7D4F', '#C27C3E'],
      });

      clearCart();
    } catch (err) {
      console.error('Error confirming order:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppConfirm = () => {
    handleConfirmOrder();
    const url = buildWhatsAppOrderUrl();
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6">
      <div className="relative w-full max-w-4xl bg-[#FFFDF9] dark:bg-[#1A1613] rounded-3xl shadow-2xl border border-[#EDE8E1] dark:border-[#2E2621] overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#EDE8E1] dark:border-[#2E2621] flex items-center justify-between bg-[#FFF6E5]/60 dark:bg-[#251E19]">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="w-9 h-9 rounded-xl bg-[#8E1B1B] text-white flex items-center justify-center shadow-xs shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#F5A623]" />
            </div>
            <div className="min-w-0">
              <h2 className="font-serif text-base sm:text-lg md:text-xl font-bold text-[#3B2418] dark:text-[#F3EDE6] truncate">
                {createdOrder
                  ? (t('orderReview.successTitle') || 'Order Confirmed & Sent to Kitchen!')
                  : (t('orderReview.title') || 'Review Order & Bill Estimate')}
              </h2>
              <p className="text-xs text-stone-600 dark:text-stone-400 truncate">
                {createdOrder
                  ? `Bill #${createdOrder.billNumber} • Official A4 Tax Invoice Generated`
                  : (t('orderReview.subtitle') || 'Verify dish timings and A4 bill summary before placing')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors shrink-0 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Responsive Segmented Tabs */}
        <div className="flex border-b border-[#EDE8E1] dark:border-[#2E2621] bg-white dark:bg-[#1F1916] px-3 sm:px-6 pt-2.5 gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('review')}
            className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'review'
                ? 'border-[#8E1B1B] text-[#8E1B1B] dark:border-[#F5A623] dark:text-[#F5A623]'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4 shrink-0" />
            <span>{t('orderReview.orderTab') || '1. Order Review & Prep Schedule'}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-200 font-mono">
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('invoice')}
            className={`pb-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'invoice'
                ? 'border-[#8E1B1B] text-[#8E1B1B] dark:border-[#F5A623] dark:text-[#F5A623]'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span>{t('orderReview.invoiceTab') || '2. Official A4 Tax Invoice & PDF'}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200 font-mono font-bold">
              A4 Format
            </span>
          </button>
        </div>

        {/* Content Body: Generous full width in each tab */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeTab === 'review' ? (
            /* TAB 1: ORDER REVIEW & PREPARATION TIMETABLE */
            <div className="max-w-3xl mx-auto space-y-5">
              {/* Success Hero State if order placed */}
              {createdOrder ? (
                <div className="p-5 rounded-2xl bg-[#EBF5EE] border border-[#CBE5D3] text-[#2F663C] space-y-3 shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-6 h-6 text-[#2E7D4F] shrink-0" />
                    <span className="font-serif text-base font-bold">
                      Order #{createdOrder.orderNumber} is Live in Kitchen!
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-[#1F4A2A]">
                    The head chef has received your order slip. Your table service or takeaway will be ready
                    according to the dish preparation schedule below.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-2.5">
                    <button
                      type="button"
                      onClick={() => setActiveTab('invoice')}
                      className="py-2.5 px-4 rounded-xl bg-[#8E1B1B] text-white text-xs font-semibold hover:bg-[#741515] transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
                    >
                      <FileText className="w-4 h-4" />
                      <span>View &amp; Download Official A4 Tax Invoice</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOrderCompleted(createdOrder.id);
                      }}
                      className="py-2.5 px-4 rounded-xl bg-[#2E7D4F] text-white text-xs font-semibold hover:bg-[#256841] transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
                    >
                      <span>Track Live Kitchen Progress</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Pre-order review banner */
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-[#282119] border border-amber-200/80 dark:border-amber-900/40 space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-semibold text-xs sm:text-sm">
                    <Clock className="w-4 h-4 text-[#E4572E] shrink-0" />
                    <span>Estimated Total Service Time: {overallEstimatedTime}</span>
                  </div>
                  <p className="text-xs text-amber-800/80 dark:text-amber-300/80 leading-normal">
                    Our kitchen prepares every item fresh to order. Review the readiness time for each dish
                    below before finalizing your order.
                  </p>
                </div>
              )}

              {/* Order Service Meta Summary */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#221C18] border border-[#EDE8E1] dark:border-[#2E2621] shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                    Guest Name
                  </span>
                  <p className="font-bold text-stone-900 dark:text-stone-100">
                    {customerName || 'Valued Guest'}
                  </p>
                  <p className="text-stone-500 font-mono">{customerPhone || 'Contact on file'}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                    Dining Service
                  </span>
                  <p className="font-bold text-stone-900 dark:text-stone-100 uppercase">
                    {orderType} {orderType === 'dineIn' && `(Table #${tableNumber || 1})`}
                  </p>
                  {deliveryAddress && (
                    <p className="text-stone-500 truncate">{deliveryAddress}</p>
                  )}
                </div>
                <div className="sm:text-right">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                    Total Amount
                  </span>
                  <p className="text-base font-bold font-mono text-[#8E1B1B] dark:text-[#F5A623]">
                    {formatPrice(grandTotal)}
                  </p>
                  <span className="text-[10px] text-stone-400 font-mono">Taxes included</span>
                </div>
              </div>

              {/* Dish-by-Dish Preparation Timetable Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#221C18] border border-[#EDE8E1] dark:border-[#2E2621] shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
                  <div className="flex items-center gap-2">
                    <UtensilsCrossed className="w-4 h-4 text-[#8E1B1B]" />
                    <h3 className="font-serif text-sm sm:text-base font-bold text-[#3B2418] dark:text-[#F3EDE6]">
                      {t('dishTimetable.title') || 'Dish Preparation Timetable'}
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-[#E4572E] font-semibold bg-[#FFF3ED] dark:bg-[#341C15] px-2.5 py-1 rounded-full">
                    {cartItems.length} {cartItems.length === 1 ? 'Dish' : 'Dishes'}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {dishTimings.map((dt, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-stone-50 dark:bg-[#2A231F] flex items-center justify-between text-xs sm:text-sm border border-stone-100 dark:border-stone-800"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-3">
                        <span className="w-6 h-6 rounded-lg bg-[#8E1B1B]/10 text-[#8E1B1B] text-xs font-bold flex items-center justify-center shrink-0">
                          {dt.quantity}x
                        </span>
                        <div className="truncate">
                          <p className="font-semibold text-stone-800 dark:text-stone-200 truncate">
                            {dt.title}
                          </p>
                          <p className="text-[11px] text-stone-500 dark:text-stone-400">
                            Kitchen Prep: ~{dt.prepTimeMinutes} mins
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] uppercase text-stone-500 block">Ready by</span>
                        <span className="font-mono font-bold text-[#2E7D4F] text-xs sm:text-sm">
                          {dt.readyAtTime}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Method Selector (if not yet placed) */}
              {!createdOrder && (
                <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#221C18] border border-[#EDE8E1] dark:border-[#2E2621] shadow-xs space-y-3">
                  <h3 className="font-serif text-sm sm:text-base font-bold text-[#3B2418] dark:text-[#F3EDE6]">
                    {t('cart.paymentMethod') || 'Select Payment Method'}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs sm:text-sm">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('upi')}
                      className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                        paymentMethod === 'upi'
                          ? 'border-[#8E1B1B] bg-[#FFF2ED] dark:bg-[#341812] text-[#8E1B1B] font-bold shadow-xs'
                          : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50'
                      }`}
                    >
                      <div className="text-lg mb-1">⚡</div>
                      <div className="font-semibold">UPI / GPay</div>
                      <span className="text-[10px] text-stone-400 block">Instant Pay</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                        paymentMethod === 'card'
                          ? 'border-[#8E1B1B] bg-[#FFF2ED] dark:bg-[#341812] text-[#8E1B1B] font-bold shadow-xs'
                          : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50'
                      }`}
                    >
                      <div className="text-lg mb-1">💳</div>
                      <div className="font-semibold">Credit / Debit</div>
                      <span className="text-[10px] text-stone-400 block">Card Swiped</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cash')}
                      className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                        paymentMethod === 'cash'
                          ? 'border-[#8E1B1B] bg-[#FFF2ED] dark:bg-[#341812] text-[#8E1B1B] font-bold shadow-xs'
                          : 'border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50'
                      }`}
                    >
                      <div className="text-lg mb-1">💵</div>
                      <div className="font-semibold">Pay at Counter</div>
                      <span className="text-[10px] text-stone-400 block">Cash or POS</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Callout to switch to A4 Bill */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('invoice')}
                  className="w-full py-3.5 px-4 rounded-2xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#221C18] hover:bg-stone-50 dark:hover:bg-[#2A231F] text-stone-700 dark:text-stone-200 text-xs sm:text-sm font-semibold flex items-center justify-between transition-all shadow-xs cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#8E1B1B]" />
                    <span>{t('orderReview.viewA4Bill') || 'View Official A4 Tax Invoice & PDF Preview'}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400" />
                </button>
              </div>
            </div>
          ) : (
            /* TAB 2: FULL-WIDTH OFFICIAL A4 TAX INVOICE & PDF */
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="flex items-center justify-between bg-stone-100 dark:bg-[#251E19] p-3 rounded-xl border border-stone-200 dark:border-stone-800 text-xs">
                <span className="font-medium text-stone-600 dark:text-stone-300 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#8E1B1B]" />
                  <span>
                    {createdOrder
                      ? 'Official Tax Invoice (Standard A4 Format)'
                      : 'Live A4 Tax Invoice Preview (Print & PDF Ready)'}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('review')}
                  className="text-[#8E1B1B] dark:text-[#F5A623] hover:underline font-semibold cursor-pointer"
                >
                  &larr; Review Schedule
                </button>
              </div>

              {/* Pristine A4 Invoice Component with Spacious Buttons */}
              <div className="w-full">
                <ThermalReceipt
                  order={draftOrder}
                  showActions={true}
                />
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Sticky Actions */}
        <div className="p-4 sm:p-5 border-t border-[#EDE8E1] dark:border-[#2E2621] bg-[#FAF7F2] dark:bg-[#1A1613] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-left w-full sm:w-auto">
            <p className="text-xs text-stone-500">Payable Total (incl. CGST/SGST)</p>
            <p className="text-lg sm:text-xl font-bold font-mono text-[#8E1B1B] dark:text-[#F5A623]">
              {formatPrice(grandTotal)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {!createdOrder ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 text-xs font-semibold transition-colors cursor-pointer text-center"
                >
                  {t('orderReview.editBag') || 'Edit Bag'}
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppConfirm}
                  className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl bg-[#25D366] text-white hover:bg-[#1EBE5D] text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer text-center"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Order via WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={handleConfirmOrder}
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-initial py-2.5 px-5 rounded-xl bg-[#8E1B1B] text-white hover:bg-[#741515] text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer text-center"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Sending to Kitchen...' : 'Confirm & Place Order'}</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOrderCompleted(createdOrder.id);
                }}
                className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-[#8E1B1B] text-white hover:bg-[#741515] text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer text-center"
              >
                <span>Track Live Order Status</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

