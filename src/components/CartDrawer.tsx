import React, { useState } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  Send,
  CreditCard,
  QrCode,
  MapPin,
  UtensilsCrossed,
  Package,
  Bike,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { useLanguage } from '../context/LanguageContext';
import { OrderConfirmationModal } from './OrderConfirmationModal';

interface CartDrawerProps {
  onOrderPlaced: (orderId: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onOrderPlaced }) => {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    clearCart,
    orderType,
    setOrderType,
    tableNumber,
    setTableNumber,
    deliveryAddress,
    setDeliveryAddress,
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    appliedCoupon,
    couponError,
    applyCoupon,
    removeCoupon,
    redeemedPoints,
    setRedeemedPoints,
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
    buildWhatsAppOrderUrl,
  } = useCart();

  const { settings, formatPrice } = useSettings();
  const { customer } = useCustomerAuth();
  const { t, getLocalized } = useLanguage();

  const [couponInput, setCouponInput] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponInput.trim()) {
      applyCoupon(couponInput.trim());
    }
  };

  const handleOpenReview = () => {
    if (cartItems.length === 0) return;
    if (orderType === 'delivery' && !deliveryAddress.trim()) {
      alert('Please enter your delivery address.');
      return;
    }
    setShowReviewModal(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <div
          onClick={() => setIsCartOpen(false)}
          className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        />

        {/* Drawer */}
        <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
          <div className="w-screen max-w-md bg-[#FFFDF9] dark:bg-[#1A1613] text-[#3B2418] dark:text-[#F3EDE6] shadow-2xl flex flex-col border-l border-[#EDE8E1] dark:border-[#2E2621]">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-[#EDE8E1] dark:border-[#2E2621] flex items-center justify-between bg-[#FFF6E5]/40 dark:bg-[#251E19]">
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg sm:text-xl font-bold">
                  {t('cart.title') || 'Your Order Bag'}
                </h2>
                <span className="text-xs text-stone-500 dark:text-stone-400">
                  ({cartItems.reduce((a, b) => a + b.quantity, 0)} items)
                </span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
              {/* Order Type Selector */}
              <div className="bg-stone-100 dark:bg-[#25201C] p-1 rounded-xl flex items-center gap-1">
                <button
                  onClick={() => setOrderType('dineIn')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    orderType === 'dineIn'
                      ? 'bg-white dark:bg-[#342D27] text-[#8E1B1B] dark:text-[#F5A623] shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                >
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                  <span>{t('cart.dineIn') || 'Dine-In'}</span>
                </button>
                <button
                  onClick={() => setOrderType('takeaway')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    orderType === 'takeaway'
                      ? 'bg-white dark:bg-[#342D27] text-[#8E1B1B] dark:text-[#F5A623] shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>{t('cart.takeaway') || 'Takeaway'}</span>
                </button>
                <button
                  onClick={() => setOrderType('delivery')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    orderType === 'delivery'
                      ? 'bg-white dark:bg-[#342D27] text-[#8E1B1B] dark:text-[#F5A623] shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                >
                  <Bike className="w-3.5 h-3.5" />
                  <span>{t('cart.delivery') || 'Delivery'}</span>
                </button>
              </div>

              {/* Context Fields */}
              {orderType === 'dineIn' && (
                <div className="p-3 bg-[#FFF3ED] dark:bg-[#2A1E18] rounded-xl border border-[#F6D2C4] dark:border-[#3D251C] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-[#8E1B1B]" />
                    <span className="font-medium">{t('cart.tableAssignment') || 'Table Assignment'}:</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-stone-500">{t('menu.table') || 'Table'}</span>
                    <select
                      value={tableNumber || 1}
                      onChange={(e) => setTableNumber(parseInt(e.target.value, 10))}
                      className="bg-white dark:bg-[#342D27] border border-stone-200 dark:border-stone-700 rounded-lg px-2 py-1 text-xs font-bold font-mono"
                    >
                      {Array.from({ length: settings.totalTables || 20 }, (_, idx) => idx + 1).map((n) => (
                        <option key={n} value={n}>
                          #{n}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {orderType === 'delivery' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#8E1B1B]" />
                    {t('cart.deliveryAddress') || 'Delivery Address'}:
                  </label>
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Flat / house number, street, landmark, area, city..."
                    rows={2}
                    className="w-full text-xs p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#221C18] focus:outline-none focus:border-[#8E1B1B]"
                  />
                </div>
              )}

              {/* Customer Details */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[11px] text-stone-500 block mb-1">
                    {t('cart.yourName') || 'Your Name'}
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Aditi Sharma"
                    className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#221C18]"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-stone-500 block mb-1">
                    {t('cart.phone') || 'Phone Number'}
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#221C18]"
                  />
                </div>
              </div>

              {/* Ready Time Preview Badge */}
              {cartItems.length > 0 && (
                <div className="p-3 bg-[#EBF5EE] text-[#2F663C] rounded-xl flex items-center justify-between text-xs border border-[#CBE5D3]">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#2E7D4F]" />
                    <span>Est. Service / Pickup:</span>
                  </div>
                  <span className="font-mono font-bold">{overallEstimatedTime}</span>
                </div>
              )}

              {/* Empty State */}
              {cartItems.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto text-stone-400">
                    <UtensilsCrossed className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="font-serif font-medium text-stone-700 dark:text-stone-300">
                      {t('cart.emptyTitle') || 'Your bag is empty'}
                    </p>
                    <p className="text-xs text-stone-400 mt-1">
                      {t('cart.emptySub') || 'Explore our bistro menu to add your cravings.'}
                    </p>
                  </div>
                </div>
              ) : (
                /* Itemized List */
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-stone-500">
                    <span>{t('cart.selectedItems') || 'Selected Dishes'}</span>
                    <button onClick={clearCart} className="text-[#8E1B1B] hover:underline">
                      {t('cart.clearAll') || 'Clear all'}
                    </button>
                  </div>

                  {cartItems.map((ci) => {
                    const localizedTitle = getLocalized(ci.item.titleLocalized, ci.item.title);
                    return (
                      <div
                        key={ci.cartItemId}
                        className="p-3 rounded-xl bg-white dark:bg-[#221C18] border border-[#EDE8E1] dark:border-[#2E2621] space-y-2 shadow-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-stone-800 dark:text-stone-100 truncate">
                              {ci.item.title}
                            </p>
                            {localizedTitle !== ci.item.title && (
                              <p className="text-[10px] text-stone-500 italic">{localizedTitle}</p>
                            )}
                            {ci.selectedModifiers.length > 0 && (
                              <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 space-x-1">
                                {ci.selectedModifiers.map((m) => (
                                  <span key={m.optionId}>
                                    {m.optionName} {m.priceDelta > 0 && `(+${formatPrice(m.priceDelta)})`}
                                  </span>
                                ))}
                              </div>
                            )}
                            {ci.specialInstructions && (
                              <p className="text-[11px] text-amber-700 dark:text-amber-300 italic mt-0.5">
                                "{ci.specialInstructions}"
                              </p>
                            )}
                          </div>
                          <span className="text-xs font-bold font-mono whitespace-nowrap">
                            {formatPrice(ci.totalUnitPrice * ci.quantity)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-stone-100 dark:border-stone-800">
                          <span className="text-[11px] text-stone-400 font-mono">
                            ⏱ ~{ci.item.prepTimeMinutes || 12}m
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(ci.cartItemId, ci.quantity - 1)}
                              className="w-6 h-6 rounded-md bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 flex items-center justify-center text-stone-600 dark:text-stone-300"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-semibold font-mono w-4 text-center">
                              {ci.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(ci.cartItemId, ci.quantity + 1)}
                              className="w-6 h-6 rounded-md bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 flex items-center justify-center text-stone-600 dark:text-stone-300"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => removeFromCart(ci.cartItemId)}
                              className="text-stone-400 hover:text-red-500 p-1 ml-1"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Coupons & Promo Codes */}
              {cartItems.length > 0 && (
                <div className="space-y-2 pt-2">
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder={t('cart.couponPlaceholder') || 'Enter promo code (e.g. BRUNCH20)'}
                      className="flex-1 text-xs p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#221C18] uppercase tracking-wider font-mono"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 hover:bg-stone-900 transition-colors"
                    >
                      {t('cart.apply') || 'Apply'}
                    </button>
                  </form>

                  {couponError && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {couponError}
                    </p>
                  )}

                  {appliedCoupon && !couponError && (
                    <div className="p-2.5 bg-[#EBF5EE] text-[#2F663C] rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>
                          <strong>{appliedCoupon.code}</strong> applied ({formatPrice(discountAmount)} off)
                        </span>
                      </div>
                      <button onClick={removeCoupon} className="text-xs hover:underline text-red-600">
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Loyalty Points Redemption */}
              {cartItems.length > 0 && customer && customer.loyaltyPoints > 0 && (
                <div className="p-3 bg-amber-50 dark:bg-[#2A2318] rounded-xl border border-amber-200 dark:border-amber-900/50 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#F5A623]" />
                      {t('cart.redeemLoyalty') || 'Redeem Loyalty Points'}
                    </span>
                    <span className="text-[11px] text-amber-700 dark:text-amber-400 font-mono">
                      Available: {customer.loyaltyPoints} pts
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={Math.min(customer.loyaltyPoints, subtotal)}
                      step={10}
                      value={redeemedPoints}
                      onChange={(e) => setRedeemedPoints(parseInt(e.target.value, 10))}
                      className="flex-1 accent-[#8E1B1B]"
                    />
                    <span className="font-mono font-bold text-amber-900 dark:text-amber-200 min-w-[50px] text-right">
                      -{formatPrice(loyaltyDiscountAmount)}
                    </span>
                  </div>
                </div>
              )}

              {/* Bill Breakdown */}
              {cartItems.length > 0 && (
                <div className="p-4 bg-white dark:bg-[#221C18] rounded-xl border border-[#EDE8E1] dark:border-[#2E2621] space-y-2 text-xs">
                  <h3 className="font-semibold text-stone-800 dark:text-stone-200 mb-2">
                    {t('cart.orderBreakdown') || 'Order Breakdown'}
                  </h3>
                  <div className="flex justify-between text-stone-600 dark:text-stone-400">
                    <span>{t('cart.subtotal') || 'Subtotal'}</span>
                    <span className="font-mono tabular-nums">{formatPrice(subtotal)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-[#2E7D4F]">
                      <span>Discount</span>
                      <span className="font-mono tabular-nums">-{formatPrice(discountAmount)}</span>
                    </div>
                  )}

                  {loyaltyDiscountAmount > 0 && (
                    <div className="flex justify-between text-amber-700 dark:text-amber-400">
                      <span>Loyalty Points</span>
                      <span className="font-mono tabular-nums">-{formatPrice(loyaltyDiscountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-stone-600 dark:text-stone-400 text-[11px]">
                    <span>CGST (2.5%)</span>
                    <span className="font-mono tabular-nums">{formatPrice(cgstAmount)}</span>
                  </div>
                  <div className="flex justify-between text-stone-600 dark:text-stone-400 text-[11px]">
                    <span>SGST (2.5%)</span>
                    <span className="font-mono tabular-nums">{formatPrice(sgstAmount)}</span>
                  </div>

                  {serviceChargeAmount > 0 && (
                    <div className="flex justify-between text-stone-600 dark:text-stone-400 text-[11px]">
                      <span>Service Charge ({settings.serviceChargePercentage}%)</span>
                      <span className="font-mono tabular-nums">{formatPrice(serviceChargeAmount)}</span>
                    </div>
                  )}

                  {packagingFeeAmount > 0 && (
                    <div className="flex justify-between text-stone-600 dark:text-stone-400 text-[11px]">
                      <span>Packaging Fee</span>
                      <span className="font-mono tabular-nums">{formatPrice(packagingFeeAmount)}</span>
                    </div>
                  )}

                  {deliveryFeeAmount > 0 && (
                    <div className="flex justify-between text-stone-600 dark:text-stone-400 text-[11px]">
                      <span>Delivery Fee</span>
                      <span className="font-mono tabular-nums">{formatPrice(deliveryFeeAmount)}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-stone-200 dark:border-stone-700 flex justify-between items-baseline font-bold text-sm">
                    <span>{t('cart.grandTotal') || 'Grand Total'}</span>
                    <span className="text-[#8E1B1B] dark:text-[#F5A623] font-mono tabular-nums text-base">
                      {formatPrice(grandTotal)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Mandatory Review & Confirmation Opener */}
            {cartItems.length > 0 && (
              <div className="p-4 sm:p-5 border-t border-[#EDE8E1] dark:border-[#2E2621] space-y-2 bg-[#FFF6E5]/40 dark:bg-[#1A1613]">
                <button
                  onClick={handleOpenReview}
                  className="w-full py-3 px-4 rounded-xl bg-[#8E1B1B] text-white hover:bg-[#741515] transition-all font-bold text-sm flex items-center justify-center gap-2 shadow-sm active:scale-95"
                >
                  <span>{t('cart.reviewOrder') || 'Review Order & Bill'} &middot; {formatPrice(grandTotal)}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-[10px] text-center text-stone-500">
                  You can inspect the 80mm thermal receipt & timings before confirming.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mandatory Order Review & Confirmation Modal */}
      <OrderConfirmationModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onOrderCompleted={(orderId) => {
          setShowReviewModal(false);
          setIsCartOpen(false);
          onOrderPlaced(orderId);
        }}
      />
    </>
  );
};
