import React, { useState } from 'react';
import {
  User,
  Sparkles,
  Award,
  Phone,
  Gift,
  History,
  Heart,
  Calendar,
  LogOut,
  ChevronRight,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { useSettings } from '../context/SettingsContext';
import { dataService } from '../services/dataService';
import { SEED_LOYALTY_REWARDS } from '../data/seedData';
import { MenuItem } from '../types';

interface AccountPageProps {
  onNavigateToOrder: (orderId: string) => void;
  onSelectItem: (item: MenuItem) => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({
  onNavigateToOrder,
  onSelectItem,
}) => {
  const { customer, isLoggedIn, login, logout, redeemPointsForDiscount } = useCustomerAuth();
  const { settings, formatPrice } = useSettings();

  const [inputPhone, setInputPhone] = useState('9876543210');
  const [inputName, setInputName] = useState('Aditi Sharma');
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('1234');
  const [redeemedNotice, setRedeemedNotice] = useState<string | null>(null);

  const customerOrders = dataService
    .getOrders()
    .filter(
      (o) =>
        customer &&
        o.customerPhone.replace(/[^0-9]/g, '').slice(-10) ===
          customer.phone.replace(/[^0-9]/g, '').slice(-10)
    );

  const customerReservations = dataService
    .getReservations()
    .filter(
      (r) =>
        customer &&
        r.phone.replace(/[^0-9]/g, '').slice(-10) ===
          customer.phone.replace(/[^0-9]/g, '').slice(-10)
    );

  const menuItems = dataService.getMenuItems();
  const favoriteItems = menuItems.filter((i) => customer?.favoriteItemIds.includes(i.id));

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPhone.trim().length >= 10) {
      setOtpStep(true);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.trim().length >= 4) {
      await login(inputPhone, inputName);
      setOtpStep(false);
    }
  };

  const handleRedeemReward = (title: string, cost: number) => {
    if (!customer) return;
    if (customer.loyaltyPoints < cost) {
      alert(`You need ${cost} points to redeem this reward.`);
      return;
    }
    const ok = redeemPointsForDiscount(cost);
    if (ok) {
      setRedeemedNotice(`Redeemed "${title}"! Voucher added to your account.`);
      setTimeout(() => setRedeemedNotice(null), 3000);
    }
  };

  // Tier progress calculation
  const totalSpent = customer?.totalSpent || 0;
  let nextTierName = 'Silver';
  let targetSpend = 3000;
  let currentTier = customer?.tier || 'Bronze';

  if (currentTier === 'Silver') {
    nextTierName = 'Gold';
    targetSpend = 10000;
  } else if (currentTier === 'Gold') {
    nextTierName = 'VIP Crown';
    targetSpend = 25000;
  }

  const tierProgressPct = Math.min(100, Math.round((totalSpent / targetSpend) * 100));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 pb-24">
      {/* Login Screen if not logged in */}
      {!isLoggedIn || !customer ? (
        <div className="max-w-md mx-auto bg-white dark:bg-[#1E1915] p-6 sm:p-8 rounded-3xl border border-[#EDE8E1] dark:border-[#2E2621] shadow-xl space-y-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#FDF0EC] dark:bg-[#341F18] text-[#D9532F] flex items-center justify-center mx-auto">
            <Sparkles className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h1 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">
              Bistro Rewards &amp; Profile
            </h1>
            <p className="text-xs text-stone-500">
              Sign in with your mobile number to view loyalty points, orders, and saved dishes.
            </p>
          </div>

          {!otpStep ? (
            <form onSubmit={handleSendOtp} className="space-y-3 text-xs text-left">
              <div>
                <label className="text-stone-500 block mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  placeholder="e.g. Aditi Sharma"
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#221C18]"
                />
              </div>

              <div>
                <label className="text-stone-500 block mb-1">Mobile Phone Number</label>
                <input
                  type="tel"
                  required
                  value={inputPhone}
                  onChange={(e) => setInputPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#221C18] font-mono text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#D9532F] text-white hover:bg-[#C24522] transition-colors font-semibold text-xs mt-2"
              >
                Send Verification OTP
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs text-left">
              <div className="p-3 bg-amber-50 text-amber-800 rounded-xl text-xs flex items-center gap-2">
                <Lock className="w-4 h-4 shrink-0 text-amber-600" />
                <span>
                  Demo Mode: Any 4-digit code (e.g. <code>1234</code>) will verify instantly.
                </span>
              </div>

              <div>
                <label className="text-stone-500 block mb-1">Enter 4-Digit OTP</label>
                <input
                  type="text"
                  maxLength={4}
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full p-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#221C18] font-mono text-center text-lg tracking-widest"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOtpStep(false)}
                  className="py-2.5 px-3 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 text-xs"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#D9532F] text-white font-semibold text-xs hover:bg-[#C24522]"
                >
                  Verify &amp; Continue
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        /* Logged In Dashboard */
        <div className="space-y-8">
          {/* User Profile Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1E1915] border border-[#EDE8E1] dark:border-[#2E2621] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#D9532F] text-white flex items-center justify-center font-serif text-2xl font-bold shadow-sm">
                {customer.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-white">
                    {customer.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 text-xs font-bold font-mono">
                    {customer.tier} Tier
                  </span>
                </div>
                <p className="text-xs text-stone-500 font-mono mt-0.5">+91 {customer.phone}</p>
                <p className="text-xs text-stone-400 mt-1">
                  Member since {new Date(customer.createdAt).toLocaleDateString()} &middot; {customer.ordersCount} orders placed
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#25201C] border border-[#EDE8E1] dark:border-[#2E2621]">
                <span className="text-[10px] uppercase tracking-wider text-stone-500 block">
                  Loyalty Balance
                </span>
                <span className="font-mono text-2xl font-bold text-[#D9532F]">
                  {customer.loyaltyPoints}
                </span>
                <span className="text-xs text-stone-500 block">points</span>
              </div>
              <button
                onClick={logout}
                className="p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-500 hover:text-red-500 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>

          {redeemedNotice && (
            <div className="p-3 bg-[#EBF5EE] text-[#2F663C] rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{redeemedNotice}</span>
            </div>
          )}

          {/* Tier Progress */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#1E1915] border border-[#EDE8E1] dark:border-[#2E2621] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                Tier Progress: {customer.tier} &rarr; {nextTierName}
              </span>
              <span className="text-stone-500 font-mono">
                {formatPrice(totalSpent)} / {formatPrice(targetSpend)}
              </span>
            </div>
            <div className="w-full h-2.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-[#D9532F] rounded-full transition-all"
                style={{ width: `${tierProgressPct}%` }}
              />
            </div>
            <p className="text-[11px] text-stone-400">
              Spend {formatPrice(Math.max(0, targetSpend - totalSpent))} more to unlock {nextTierName} perks (exclusive invitations &amp; double points on weekends).
            </p>
          </div>

          {/* Rewards Catalog */}
          <div className="space-y-4">
            <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-white">
              Redeemable Rewards Catalog
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {SEED_LOYALTY_REWARDS.map((rew) => (
                <div
                  key={rew.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#1E1915] border border-[#EDE8E1] dark:border-[#2E2621] shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <span className="font-mono text-xs font-bold text-[#D9532F] bg-[#FDF0EC] dark:bg-[#341F18] px-2 py-0.5 rounded">
                      {rew.pointsCost} Points
                    </span>
                    <h3 className="font-serif font-bold text-sm text-stone-900 dark:text-white">
                      {rew.title}
                    </h3>
                    <p className="text-xs text-stone-500 leading-relaxed">
                      {rew.description}
                    </p>
                  </div>

                  <button
                    onClick={() => handleRedeemReward(rew.title, rew.pointsCost)}
                    disabled={customer.loyaltyPoints < rew.pointsCost}
                    className="w-full py-2 rounded-xl bg-[#2E1C12] dark:bg-white text-white dark:text-[#2E1C12] hover:bg-[#D9532F] dark:hover:bg-[#D9532F] dark:hover:text-white transition-colors text-xs font-semibold disabled:opacity-40"
                  >
                    Redeem Reward
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Past Orders & Reservations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Orders */}
            <div className="space-y-4">
              <h2 className="font-serif text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <History className="w-4 h-4 text-[#D9532F]" />
                Recent Orders ({customerOrders.length})
              </h2>

              {customerOrders.length === 0 ? (
                <p className="text-xs text-stone-400">No orders recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {customerOrders.slice(0, 3).map((ord) => (
                    <div
                      key={ord.id}
                      onClick={() => onNavigateToOrder(ord.id)}
                      className="p-4 rounded-xl bg-white dark:bg-[#1E1915] border border-[#EDE8E1] dark:border-[#2E2621] hover:border-[#D9532F] cursor-pointer transition-colors space-y-2 text-xs"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-bold text-[#D9532F]">
                          {ord.orderNumber}
                        </span>
                        <span className="font-bold capitalize text-stone-700 dark:text-stone-300">
                          {ord.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex justify-between text-stone-500">
                        <span>{ord.items.length} items &middot; {ord.orderType}</span>
                        <span className="font-mono font-semibold">{formatPrice(ord.total)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reservations */}
            <div className="space-y-4">
              <h2 className="font-serif text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#D9532F]" />
                Table Bookings ({customerReservations.length})
              </h2>

              {customerReservations.length === 0 ? (
                <p className="text-xs text-stone-400">No table bookings recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {customerReservations.slice(0, 3).map((res) => (
                    <div
                      key={res.id}
                      className="p-4 rounded-xl bg-white dark:bg-[#1E1915] border border-[#EDE8E1] dark:border-[#2E2621] space-y-1 text-xs"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">{res.date} at {res.timeSlot}</span>
                        <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600">
                          {res.status}
                        </span>
                      </div>
                      <p className="text-stone-500">
                        Party of {res.partySize} &middot; {res.seatingArea}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
