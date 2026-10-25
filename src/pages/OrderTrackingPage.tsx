import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  ChefHat,
  PackageCheck,
  Bike,
  UtensilsCrossed,
  Send,
  AlertCircle,
  Printer,
  Download,
  Receipt,
  Sparkles,
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { dataService } from '../services/dataService';
import { useSettings } from '../context/SettingsContext';
import { useLanguage } from '../context/LanguageContext';
import { ThermalReceipt } from '../components/ThermalReceipt';

interface OrderTrackingPageProps {
  initialOrderId?: string;
  onNavigateToMenu: () => void;
}

const STEPS: { status: OrderStatus; labelKey: string; defaultLabel: string; icon: any }[] = [
  { status: 'received', labelKey: 'tracking.received', defaultLabel: 'Order Received', icon: Clock },
  { status: 'preparing', labelKey: 'tracking.preparing', defaultLabel: 'Kitchen Preparing', icon: ChefHat },
  { status: 'ready', labelKey: 'tracking.ready', defaultLabel: 'Ready at Counter', icon: PackageCheck },
  { status: 'served_out', labelKey: 'tracking.servedOut', defaultLabel: 'Served / Out for Delivery', icon: Bike },
  { status: 'completed', labelKey: 'tracking.completed', defaultLabel: 'Completed', icon: CheckCircle2 },
];

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({
  initialOrderId,
  onNavigateToMenu,
}) => {
  const { settings, formatPrice } = useSettings();
  const { t, getLocalized } = useLanguage();

  const [searchId, setSearchId] = useState(initialOrderId || '');
  const [currentOrder, setCurrentOrder] = useState<Order | null>(() => {
    if (initialOrderId) {
      return dataService.getOrder(initialOrderId) || null;
    }
    const orders = dataService.getOrders();
    return orders.length > 0 ? orders[0] : null;
  });

  const [showThermalModal, setShowThermalModal] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Live subscription to order updates
  useEffect(() => {
    const unsub = dataService.subscribe('cafeflow_orders', () => {
      if (currentOrder) {
        const fresh = dataService.getOrder(currentOrder.id);
        if (fresh) setCurrentOrder(fresh);
      }
    });
    return unsub;
  }, [currentOrder?.id]);

  useEffect(() => {
    if (initialOrderId) {
      const ord = dataService.getOrder(initialOrderId);
      if (ord) {
        setCurrentOrder(ord);
        setSearchId(ord.orderNumber);
      }
    }
  }, [initialOrderId]);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError(null);
    if (!searchId.trim()) return;

    const ord = dataService.getOrder(searchId.trim());
    if (ord) {
      setCurrentOrder(ord);
    } else {
      setLookupError(`No order found matching "${searchId}". Please check your Order ID or Bill Number.`);
    }
  };

  const getStepIndex = (status: OrderStatus): number => {
    switch (status) {
      case 'received':
        return 0;
      case 'preparing':
        return 1;
      case 'ready':
        return 2;
      case 'served_out':
        return 3;
      case 'completed':
        return 4;
      default:
        return 0;
    }
  };

  const currentStepIdx = currentOrder ? getStepIndex(currentOrder.status) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-28">
      {/* Header & Search Bar */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-[#8E1B1B] dark:text-[#F5A623]">
          Live Kitchen &amp; Dish Readiness
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 dark:text-white">
          {t('tracking.title') || 'Track Your Order'}
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300">
          Inspect dish-wise preparation schedules, chef updates, and official 80mm thermal bill receipts.
        </p>
      </div>

      {/* Search Input */}
      <form onSubmit={handleLookup} className="flex gap-2 max-w-md mx-auto">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value.toUpperCase())}
            placeholder="e.g. CF-1001 or CF-BILL-1001"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#1E1915] text-xs font-mono uppercase focus:outline-none focus:border-[#8E1B1B]"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-[#8E1B1B] text-white hover:bg-[#741515] transition-colors text-xs font-bold"
        >
          Lookup
        </button>
      </form>

      {lookupError && (
        <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center justify-center gap-1.5 max-w-md mx-auto border border-red-200">
          <AlertCircle className="w-4 h-4" />
          <span>{lookupError}</span>
        </div>
      )}

      {/* Order Status Display */}
      {currentOrder ? (
        <div className="bg-white dark:bg-[#1E1915] rounded-3xl border border-[#EDE8E1] dark:border-[#2E2621] p-6 sm:p-8 shadow-sm space-y-8">
          {/* Top Status Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100 dark:border-stone-800">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xl sm:text-2xl font-bold text-[#8E1B1B] dark:text-[#F5A623]">
                  {currentOrder.orderNumber}
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                  {currentOrder.billNumber}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FFF3ED] dark:bg-[#341C15] text-[#8E1B1B] dark:text-[#F5A623] font-semibold capitalize">
                  {currentOrder.orderType === 'dineIn'
                    ? `Dine-In (Table #${currentOrder.tableNumber})`
                    : currentOrder.orderType}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Placed at {new Date(currentOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} &middot; Guest: {currentOrder.customerName}
              </p>
            </div>

            {/* Action Buttons: Thermal Receipt & Live Status */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setShowThermalModal(true)}
                className="py-2 px-3 rounded-xl bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900 text-xs font-semibold flex items-center gap-1.5 shadow-xs hover:opacity-90 active:scale-95 transition-all"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>View Thermal Bill (80mm)</span>
              </button>

              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EBF5EE] text-[#2F663C] dark:bg-[#1E2E23] dark:text-[#88C697] text-xs font-bold border border-[#CBE5D3]">
                <span className="w-2 h-2 rounded-full bg-[#2E7D4F] animate-ping" />
                <span>{currentOrder.status.replace('_', ' ').toUpperCase()}</span>
              </span>
            </div>
          </div>

          {/* Visual Progress Stepper */}
          <div className="py-4">
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-1 bg-stone-200 dark:bg-stone-800 z-0" />
              <div
                className="absolute top-1/2 left-0 -translate-y-1/2 h-1 bg-[#8E1B1B] z-0 transition-all duration-500"
                style={{
                  width: `${(currentStepIdx / (STEPS.length - 1)) * 100}%`,
                }}
              />

              {/* Steps */}
              <div className="relative z-10 flex justify-between items-center">
                {STEPS.map((step, idx) => {
                  const Icon = step.icon;
                  const isCompleted = idx <= currentStepIdx;
                  const isCurrent = idx === currentStepIdx;

                  return (
                    <div key={step.status} className="flex flex-col items-center text-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-xs ${
                          isCurrent
                            ? 'bg-[#8E1B1B] text-white ring-4 ring-[#FFF3ED] dark:ring-[#341C15]'
                            : isCompleted
                            ? 'bg-[#3B2418] text-white dark:bg-white dark:text-[#3B2418]'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span
                        className={`text-[11px] font-medium mt-2 max-w-[80px] sm:max-w-none ${
                          isCurrent
                            ? 'text-[#8E1B1B] dark:text-[#F5A623] font-bold'
                            : isCompleted
                            ? 'text-stone-800 dark:text-stone-200'
                            : 'text-stone-400'
                        }`}
                      >
                        {step.defaultLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Dish-by-Dish Preparation Schedule (Mandatory Timing Requirement) */}
          <div className="p-5 rounded-2xl bg-[#FFF6E5]/60 dark:bg-[#251E19] border border-[#F6D2C4] dark:border-[#3D251C] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/60 dark:border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#8E1B1B] dark:text-[#F5A623]" />
                <h3 className="font-serif text-sm sm:text-base font-bold text-[#3B2418] dark:text-[#F3EDE6]">
                  Dish-by-Dish Preparation &amp; Readiness Timetable
                </h3>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#2E7D4F]">
                <span>All Items Ready By:</span>
                <span className="bg-[#EBF5EE] text-[#2F663C] px-2 py-0.5 rounded-md border border-[#CBE5D3]">
                  {currentOrder.overallEstimatedTime || 'In ~15-20 min'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(currentOrder.dishTimings && currentOrder.dishTimings.length > 0
                ? currentOrder.dishTimings
                : currentOrder.items.map((it) => ({
                    itemId: it.item.id,
                    title: it.item.title,
                    quantity: it.quantity,
                    prepTimeMinutes: it.item.prepTimeMinutes || 12,
                    readyAtTime: currentOrder.overallEstimatedTime || 'In ~15 min',
                  }))
              ).map((dt, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white dark:bg-[#1E1915] rounded-xl border border-stone-200/80 dark:border-stone-800 flex items-center justify-between text-xs shadow-2xs"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-stone-800 dark:text-stone-200 truncate">
                      {dt.quantity}x {dt.title}
                    </p>
                    <p className="text-[10px] text-stone-500">
                      Standard prep: ~{dt.prepTimeMinutes} mins
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-stone-400 block uppercase">Ready / Served</span>
                    <span className="font-mono font-bold text-[#2E7D4F] text-xs">
                      {dt.readyAtTime}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Events Log */}
          <div className="p-4 bg-[#FAF7F2] dark:bg-[#25201C] rounded-2xl border border-[#EDE8E1] dark:border-[#2E2621] space-y-3">
            <h3 className="text-xs font-semibold text-stone-800 dark:text-stone-200 uppercase tracking-wider">
              Kitchen Activity Log
            </h3>
            <div className="space-y-2 text-xs">
              {currentOrder.timeline.map((ev, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#8E1B1B] mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <span className="font-semibold capitalize text-stone-800 dark:text-stone-200">
                      {ev.status.replace('_', ' ')}
                    </span>
                    {ev.note && <span className="text-stone-500 ml-1.5">&mdash; {ev.note}</span>}
                  </div>
                  <span className="text-[11px] text-stone-400 font-mono">
                    {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Itemized Bill Summary */}
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-stone-800 dark:text-stone-200 uppercase tracking-wider">
                Items In This Order
              </h3>
              <button
                onClick={() => setShowThermalModal(true)}
                className="text-[#8E1B1B] dark:text-[#F5A623] hover:underline font-semibold"
              >
                Print / Download Thermal Bill
              </button>
            </div>

            <div className="divide-y divide-stone-100 dark:divide-stone-800">
              {currentOrder.items.map((it) => (
                <div key={it.cartItemId} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-medium text-stone-800 dark:text-stone-200">
                      {it.item.title}
                    </span>{' '}
                    <span className="text-stone-400 font-mono">x {it.quantity}</span>
                    {it.selectedModifiers.length > 0 && (
                      <p className="text-[11px] text-stone-500">
                        {it.selectedModifiers.map((m) => m.optionName).join(', ')}
                      </p>
                    )}
                  </div>
                  <span className="font-mono font-semibold">
                    {formatPrice(it.totalUnitPrice * it.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-stone-200 dark:border-stone-700 flex justify-between font-bold text-sm">
              <span>Grand Total</span>
              <span className="font-mono text-[#8E1B1B] dark:text-[#F5A623]">
                {formatPrice(currentOrder.total)}
              </span>
            </div>
          </div>

          {/* WhatsApp Direct Help */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border-t border-stone-100 dark:border-stone-800">
            <span className="text-stone-500">
              Need to add items or adjust order instructions? Reach our counter staff directly.
            </span>
            <a
              href={`https://wa.me/${(settings.whatsappNumber || '919876543210').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi CafeFlow, inquiry regarding Order #${currentOrder.orderNumber}`)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366] text-white font-medium hover:bg-[#1EBE5D] transition-colors shadow-2xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>WhatsApp Floor Manager</span>
            </a>
          </div>
        </div>
      ) : (
        <div className="py-16 text-center space-y-4">
          <p className="text-stone-500 text-xs">Enter an Order ID to start tracking.</p>
          <button
            onClick={onNavigateToMenu}
            className="px-5 py-2.5 rounded-xl bg-[#8E1B1B] text-white text-xs font-semibold"
          >
            Browse Menu to Place an Order
          </button>
        </div>
      )}

      {/* A4 Tax Invoice & Dining Bill Modal */}
      {showThermalModal && currentOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="relative bg-white dark:bg-[#1E1915] rounded-3xl p-4 sm:p-6 shadow-2xl max-w-4xl w-full flex flex-col items-center overflow-x-hidden my-6">
            <div className="w-full flex justify-between items-center mb-4 pb-3 border-b border-stone-200 dark:border-stone-800">
              <span className="font-bold text-xs uppercase tracking-wider text-stone-700 dark:text-stone-300">
                Official Tax Invoice &amp; Dining Bill (A4 Format)
              </span>
              <button
                type="button"
                onClick={() => setShowThermalModal(false)}
                className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                ✕ Close
              </button>
            </div>

            <div className="w-full flex justify-center overflow-x-auto py-1">
              <ThermalReceipt order={currentOrder} showActions={true} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
