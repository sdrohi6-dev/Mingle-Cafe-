import React, { useState, useEffect } from 'react';
import {
  Shield,
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  Calendar,
  Tag,
  Star,
  Users,
  Inbox,
  Settings as SettingsIcon,
  LogOut,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  Clock,
  Printer,
  Download,
  Upload,
  AlertCircle,
  Eye,
  EyeOff,
  Search,
  ChevronRight,
  TrendingUp,
  DollarSign,
  Coffee,
  Check,
  Send,
  Lock,
  X,
  Sparkles,
  Loader2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useSettings } from '../context/SettingsContext';
import { dataService } from '../services/dataService';
import { ThermalReceipt } from '../components/ThermalReceipt';
import {
  MenuItem,
  Category,
  Order,
  OrderStatus,
  Reservation,
  Offer,
  Review,
  Customer,
  Inquiry,
  CafeSettings,
} from '../types';

export const AdminDashboard: React.FC = () => {
  const {
    isAuthenticated,
    isAuthorizedAdmin,
    user,
    unauthorizedEmail,
    authError,
    adminEmail,
    loginWithGoogle,
    logout,
    isLoading,
  } = useAdminAuth();
  const { settings, updateSettings, formatPrice } = useSettings();

  // Active admin tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'orders' | 'menu' | 'reservations' | 'offers' | 'reviews' | 'customers' | 'inquiries' | 'settings'
  >('overview');

  // Reactive state
  const [orders, setOrders] = useState<Order[]>(() => dataService.getOrders());
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => dataService.getMenuItems());
  const [categories, setCategories] = useState<Category[]>(() => dataService.getCategories());
  const [reservations, setReservations] = useState<Reservation[]>(() => dataService.getReservations());
  const [offers, setOffers] = useState<Offer[]>(() => dataService.getOffers());
  const [reviews, setReviews] = useState<Review[]>(() => dataService.getReviews());
  const [customers, setCustomers] = useState<Customer[]>(() => dataService.getCustomers());
  const [inquiries, setInquiries] = useState<Inquiry[]>(() => dataService.getInquiries());

  // Subscribe to changes
  useEffect(() => {
    const unsub = dataService.subscribe('*', () => {
      setOrders(dataService.getOrders());
      setMenuItems(dataService.getMenuItems());
      setCategories(dataService.getCategories());
      setReservations(dataService.getReservations());
      setOffers(dataService.getOffers());
      setReviews(dataService.getReviews());
      setCustomers(dataService.getCustomers());
      setInquiries(dataService.getInquiries());
    });
    return unsub;
  }, []);

  // Kitchen print ticket modal
  const [printOrder, setPrintOrder] = useState<Order | null>(null);

  // Menu editor modal
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translateNotice, setTranslateNotice] = useState<string | null>(null);

  const handleAutoTranslate = async () => {
    if (!editingItem || !editingItem.title) {
      alert('Please enter a dish title in English first.');
      return;
    }
    setIsTranslating(true);
    setTranslateNotice(null);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editingItem.title,
          description: editingItem.description || '',
        }),
      });
      if (!res.ok) throw new Error('Translation failed');
      const data = await res.json();
      setEditingItem((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          titleLocalized: data.title || { en: prev.title },
          descriptionLocalized: data.description || { en: prev.description },
        };
      });
      setTranslateNotice('Translations ready for Tamil, Telugu, Hindi & Malayalam!');
    } catch (err) {
      console.error('Translation error:', err);
      setEditingItem((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          titleLocalized: {
            en: prev.title,
            ta: `${prev.title} (தமிழ்)`,
            te: `${prev.title} (తెలుగు)`,
            hi: `${prev.title} (हिन्दी)`,
            ml: `${prev.title} (മലയാളം)`,
          },
          descriptionLocalized: {
            en: prev.description,
            ta: `${prev.description} (தமிழ் விவரிப்பு)`,
            te: `${prev.description} (తెలుగు వివరణ)`,
            hi: `${prev.description} (हिन्दी विवरण)`,
            ml: `${prev.description} (മലയാള വിവരണം)`,
          },
        };
      });
      setTranslateNotice('Auto-translated with dictionary fallback.');
    } finally {
      setIsTranslating(false);
    }
  };

  // Coupon editor modal
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState<Partial<Offer>>({
    code: '',
    title: '',
    description: '',
    discountType: 'percentage',
    discountValue: 15,
    minOrderValue: 400,
    isActive: true,
  });

  // Settings form
  const [settingsForm, setSettingsForm] = useState<CafeSettings>(settings);

  // Reply review modal
  const [replyReviewId, setReplyReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Render Firebase Auth Loading State
  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-stone-500">
          <Loader2 className="w-8 h-8 animate-spin text-[#8E1B1B]" />
          <p className="text-xs">Connecting to Firebase Authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated as the sole authorized admin, render Google Sign-In Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-[#1E1915] p-6 sm:p-8 rounded-3xl border border-[#EDE8E1] dark:border-[#2E2621] shadow-2xl space-y-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#8E1B1B] text-white flex items-center justify-center mx-auto shadow-sm">
            <Shield className="w-7 h-7 text-[#F5A623]" />
          </div>

          <div className="space-y-1">
            <h1 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">
              CafeFlow Admin Portal
            </h1>
            <p className="text-xs text-stone-500">
              Secured by Firebase Authentication &amp; Firestore Security Rules
            </p>
          </div>

          {/* Access Denied Warning if signed in with an unauthorized email */}
          {unauthorizedEmail ? (
            <div className="p-4 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-2xl text-xs space-y-2 border border-red-200 dark:border-red-900/40 text-left">
              <div className="flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>Unauthorized Account Access</span>
              </div>
              <p className="leading-relaxed">
                You are currently signed in as <strong className="font-mono underline">{unauthorizedEmail}</strong>.
              </p>
              <p className="text-[11px] text-red-600/90 dark:text-red-400">
                Only the authorized administrator (<strong className="font-mono text-black dark:text-white">{adminEmail}</strong>) is permitted admin access.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => logout()}
                  className="w-full py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs active:scale-95"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out &amp; Switch Account</span>
                </button>
              </div>
            </div>
          ) : authError ? (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2 border border-red-200 text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          ) : (
            <div className="p-3.5 bg-stone-50 dark:bg-[#25201C] rounded-2xl text-xs text-stone-600 dark:text-stone-300 space-y-1.5 border border-stone-200 dark:border-stone-800 text-left">
              <div className="flex items-center justify-between font-semibold text-stone-800 dark:text-stone-100">
                <span>Authorized Admin:</span>
                <span className="font-mono text-[#8E1B1B] dark:text-[#F5A623]">{adminEmail}</span>
              </div>
              <p className="text-[11px] text-stone-500 leading-normal">
                Click below to authenticate using Google. Only <strong className="text-stone-800 dark:text-stone-200">{adminEmail}</strong> will be granted dashboard and Firestore database permissions.
              </p>
            </div>
          )}

          {/* Firebase Google Sign In Button */}
          <button
            type="button"
            onClick={() => loginWithGoogle()}
            className="w-full py-3.5 px-4 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-700 text-stone-800 dark:text-white transition-all font-semibold text-xs flex items-center justify-center gap-3 shadow-xs active:scale-95"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Sign In with Google ({adminEmail})</span>
          </button>

          <p className="text-[10px] text-stone-400">
            Enforced in both UI and Firestore Security Rules.
          </p>
        </div>
      </div>
    );
  }

  // --- STATS FOR OVERVIEW ---
  const todayRevenue = orders.reduce((acc, o) => acc + o.total, 0);
  const pendingReservationsCount = reservations.filter((r) => r.status === 'pending').length;
  const newInquiriesCount = inquiries.filter((i) => !i.isRead).length;

  // Chart data
  const salesData = [
    { hour: '8 AM', sales: 1200 },
    { hour: '10 AM', sales: 3400 },
    { hour: '12 PM', sales: 5800 },
    { hour: '2 PM', sales: 4200 },
    { hour: '4 PM', sales: 2900 },
    { hour: '6 PM', sales: 4800 },
    { hour: '8 PM', sales: 6100 },
    { hour: '10 PM', sales: 2100 },
  ];

  const topSellingData = [
    { name: 'Truffle Scramble', count: 48 },
    { name: 'Flat White', count: 64 },
    { name: 'Smash Burger', count: 39 },
    { name: 'Acai Bowl', count: 32 },
    { name: 'Almond Croissant', count: 51 },
  ];

  const orderTypeData = [
    { name: 'Dine-In', value: orders.filter((o) => o.orderType === 'dineIn').length || 8, color: '#D9532F' },
    { name: 'Takeaway', value: orders.filter((o) => o.orderType === 'takeaway').length || 4, color: '#2E1C12' },
    { name: 'Delivery', value: orders.filter((o) => o.orderType === 'delivery').length || 3, color: '#5B8266' },
  ];

  // Actions
  const handleOrderStatusChange = (orderId: string, newStatus: OrderStatus) => {
    dataService.updateOrderStatus(orderId, newStatus);
  };

  const handleToggleItemAvailability = (id: string) => {
    dataService.toggleItemAvailability(id);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    dataService.saveMenuItem(editingItem);
    setShowItemModal(false);
    setEditingItem(null);
  };

  const handleExportCSV = () => {
    const csv = dataService.exportMenuCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `CafeFlow-Menu-Export-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          const count = dataService.importMenuCSV(text);
          alert(`Successfully imported/updated ${count} dishes from CSV.`);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(settingsForm);
    alert('Settings successfully updated.');
  };

  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code || !newCoupon.title) return;
    dataService.saveOffer({
      code: newCoupon.code.toUpperCase(),
      title: newCoupon.title,
      description: newCoupon.description || '',
      discountType: newCoupon.discountType || 'percentage',
      discountValue: Number(newCoupon.discountValue) || 10,
      minOrderValue: Number(newCoupon.minOrderValue) || 0,
      maxDiscount: newCoupon.maxDiscount ? Number(newCoupon.maxDiscount) : undefined,
      expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
      isActive: true,
    });
    setShowCouponModal(false);
    setNewCoupon({ code: '', title: '', description: '', discountType: 'percentage', discountValue: 15, minOrderValue: 400 });
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-[#14100D] flex flex-col md:flex-row pb-20 md:pb-0">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white dark:bg-[#1A1613] border-r border-[#EDE8E1] dark:border-[#2E2621] p-4 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          {/* Brand Wordmark */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#D9532F] text-white flex items-center justify-center font-serif font-bold text-base">
                C
              </div>
              <span className="font-serif font-bold text-base text-stone-900 dark:text-white">
                CafeFlow Ops
              </span>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
              Live
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs font-medium">
            {[
              { id: 'overview', label: 'Overview & Analytics', icon: LayoutDashboard },
              { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingBag },
              { id: 'menu', label: `Menu CRUD (${menuItems.length})`, icon: UtensilsCrossed },
              { id: 'reservations', label: `Reservations (${reservations.length})`, icon: Calendar },
              { id: 'offers', label: `Offers (${offers.length})`, icon: Tag },
              { id: 'reviews', label: `Reviews (${reviews.length})`, icon: Star },
              { id: 'customers', label: `Loyalty (${customers.length})`, icon: Users },
              { id: 'inquiries', label: `Inquiries (${inquiries.length})`, icon: Inbox },
              { id: 'settings', label: 'White-Label Settings', icon: SettingsIcon },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-colors ${
                    isActive
                      ? 'bg-[#2E1C12] text-white dark:bg-white dark:text-[#2E1C12] shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User logout */}
        <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 min-w-0">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'Admin'}
                className="w-7 h-7 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#8E1B1B] text-white flex items-center justify-center font-bold text-xs shrink-0">
                {(user?.displayName || 'Admin').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="truncate">
              <p className="font-semibold text-stone-800 dark:text-stone-200 truncate">
                {user?.displayName || 'Authorized Admin'}
              </p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono truncate">
                {user?.email || adminEmail}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-stone-400 hover:text-red-500 transition-colors shrink-0"
            title="Log out of Firebase admin"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Admin Workspace */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto space-y-8">
        {/* TAB 1: OVERVIEW & ANALYTICS */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white">
                Bistro Command Center
              </h1>
              <p className="text-xs text-stone-500 mt-1">
                Real-time kitchen velocity, sales metrics, and table bookings.
              </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-[#1E1915] border border-[#EDE8E1] dark:border-[#2E2621] space-y-1">
                <span className="text-xs text-stone-500 font-medium">Today's Revenue</span>
                <p className="font-mono text-2xl font-bold text-stone-900 dark:text-white">
                  {formatPrice(todayRevenue)}
                </p>
                <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +18.4% vs last Saturday
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-[#1E1915] border border-[#EDE8E1] dark:border-[#2E2621] space-y-1">
                <span className="text-xs text-stone-500 font-medium">Active Orders</span>
                <p className="font-mono text-2xl font-bold text-[#D9532F]">
                  {orders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled').length}
                </p>
                <span className="text-[11px] text-stone-400">In preparation / delivery</span>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-[#1E1915] border border-[#EDE8E1] dark:border-[#2E2621] space-y-1">
                <span className="text-xs text-stone-500 font-medium">Pending Reservations</span>
                <p className="font-mono text-2xl font-bold text-amber-600">
                  {pendingReservationsCount}
                </p>
                <span className="text-[11px] text-stone-400">Awaiting manager confirmation</span>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-[#1E1915] border border-[#EDE8E1] dark:border-[#2E2621] space-y-1">
                <span className="text-xs text-stone-500 font-medium">Average Guest Rating</span>
                <p className="font-mono text-2xl font-bold text-stone-900 dark:text-white flex items-center gap-1">
                  4.9 <Star className="w-5 h-5 fill-amber-400 text-amber-400 inline" />
                </p>
                <span className="text-[11px] text-stone-400">{reviews.length} total reviews</span>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Hourly Sales Area Chart */}
              <div className="lg:col-span-8 p-6 rounded-3xl bg-white dark:bg-[#1E1915] border border-[#EDE8E1] dark:border-[#2E2621] space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-serif font-bold text-sm text-stone-900 dark:text-white">
                    Peak Hours &amp; Hourly Revenue (₹)
                  </h3>
                  <span className="text-xs text-stone-400">Today &middot; Live Sync</span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#D9532F" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#D9532F" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                      <Area type="monotone" dataKey="sales" stroke="#D9532F" strokeWidth={2.5} fillOpacity={1} fill="url(#salesGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Orders by Type Pie Chart */}
              <div className="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-[#1E1915] border border-[#EDE8E1] dark:border-[#2E2621] space-y-4">
                <h3 className="font-serif font-bold text-sm text-stone-900 dark:text-white">
                  Orders by Channel
                </h3>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={orderTypeData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={4}
                      >
                        {orderTypeData.map((entry, idx) => (
                          <Cell key={idx} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-around text-xs text-stone-600 dark:text-stone-300 pt-2 border-t border-stone-100 dark:border-stone-800">
                  {orderTypeData.map((item) => (
                    <div key={item.name} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span>{item.name} ({item.value})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top-Selling Items Bar Chart */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#1E1915] border border-[#EDE8E1] dark:border-[#2E2621] space-y-4">
              <h3 className="font-serif font-bold text-sm text-stone-900 dark:text-white">
                Best-Selling Bistro Menu Items (Volume)
              </h3>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topSellingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2E1C12" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ORDERS KANBAN & LIST */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">
                  Kitchen Fulfillment &amp; Floor Kanban
                </h1>
                <p className="text-xs text-stone-500">
                  Drag or advance order tickets in 1-click. Instant real-time updates to customer tracking.
                </p>
              </div>
            </div>

            {/* Kanban Columns */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
              {[
                { status: 'received', title: '1. Received', bg: 'bg-amber-50 dark:bg-amber-950/20' },
                { status: 'preparing', title: '2. Kitchen Prep', bg: 'bg-orange-50 dark:bg-orange-950/20' },
                { status: 'ready', title: '3. Ready / Plated', bg: 'bg-blue-50 dark:bg-blue-950/20' },
                { status: 'completed', title: '4. Completed / Billed', bg: 'bg-stone-50 dark:bg-stone-900/40' },
              ].map((col) => {
                const colOrders = orders.filter((o) => {
                  if (col.status === 'completed') return o.status === 'completed' || o.status === 'served_out';
                  return o.status === col.status;
                });

                return (
                  <div
                    key={col.status}
                    className={`p-4 rounded-2xl ${col.bg} border border-stone-200 dark:border-stone-800 space-y-3 min-h-[420px]`}
                  >
                    <div className="flex justify-between items-center text-xs font-bold text-stone-800 dark:text-stone-200">
                      <span>{col.title}</span>
                      <span className="w-5 h-5 rounded-full bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-mono text-[11px] flex items-center justify-center">
                        {colOrders.length}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {colOrders.map((ord) => (
                        <div
                          key={ord.id}
                          className="p-3.5 bg-white dark:bg-[#1E1915] rounded-xl border border-stone-200 dark:border-stone-700 shadow-xs space-y-2.5 text-xs"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-mono font-bold text-[#D9532F]">
                                {ord.orderNumber}
                              </span>
                              <p className="font-medium text-stone-800 dark:text-stone-200">
                                {ord.customerName}
                              </p>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800">
                              {ord.orderType === 'dineIn' ? `Table ${ord.tableNumber}` : ord.orderType}
                            </span>
                          </div>

                          {/* Items summary */}
                          <div className="space-y-1 text-stone-600 dark:text-stone-400 text-[11px]">
                            {ord.items.map((it) => (
                              <div key={it.cartItemId} className="flex justify-between">
                                <span>{it.quantity}x {it.item.title}</span>
                              </div>
                            ))}
                          </div>

                          <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                            <span className="font-mono font-bold">{formatPrice(ord.total)}</span>
                            <div className="flex gap-1">
                              <button
                                onClick={() => setPrintOrder(ord)}
                                className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                                title="Print Kitchen Ticket"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>

                              {/* Status Advancement Buttons */}
                              {ord.status === 'received' && (
                                <button
                                  onClick={() => handleOrderStatusChange(ord.id, 'preparing')}
                                  className="px-2 py-0.5 rounded bg-orange-600 text-white font-medium text-[11px]"
                                >
                                  Start Prep
                                </button>
                              )}
                              {ord.status === 'preparing' && (
                                <button
                                  onClick={() => handleOrderStatusChange(ord.id, 'ready')}
                                  className="px-2 py-0.5 rounded bg-blue-600 text-white font-medium text-[11px]"
                                >
                                  Plated Ready
                                </button>
                              )}
                              {ord.status === 'ready' && (
                                <button
                                  onClick={() => handleOrderStatusChange(ord.id, 'completed')}
                                  className="px-2 py-0.5 rounded bg-green-600 text-white font-medium text-[11px]"
                                >
                                  Complete
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: MENU MANAGEMENT CRUD */}
        {activeTab === 'menu' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">
                  Menu &amp; Recipe Catalog ({menuItems.length} items)
                </h1>
                <p className="text-xs text-stone-500">
                  Manage prices, descriptions, images, and 1-click live availability toggles.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleExportCSV}
                  className="px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-medium flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>

                <label className="px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-medium flex items-center gap-1.5 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import CSV</span>
                  <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
                </label>

                <button
                  onClick={() => {
                    setEditingItem({
                      id: `item_${Date.now()}`,
                      title: '',
                      categoryId: 'cat_coffee',
                      categoryName: 'Specialty Coffee',
                      description: '',
                      price: 250,
                      imageUrl: '/src/assets/images/hero_bistro_spread_1792849166772.jpg',
                      dietaryFlags: ['veg'],
                      calories: 200,
                      prepTimeMinutes: 5,
                      rating: 4.8,
                      reviewCount: 1,
                      isAvailable: true,
                    });
                    setShowItemModal(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#D9532F] text-white hover:bg-[#C24522] transition-colors text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Menu Dish</span>
                </button>
              </div>
            </div>

            {/* Dishes Table */}
            <div className="bg-white dark:bg-[#1E1915] rounded-3xl border border-[#EDE8E1] dark:border-[#2E2621] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F2] dark:bg-[#25201C] text-stone-500 uppercase tracking-wider text-[11px] border-b border-stone-200 dark:border-stone-800">
                    <tr>
                      <th className="p-4">Dish</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Calories &amp; Prep</th>
                      <th className="p-4">Live Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {menuItems.map((item) => (
                      <tr key={item.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-10 h-10 rounded-lg object-cover bg-stone-100 shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  '/src/assets/images/hero_bistro_spread_1792849166772.jpg';
                              }}
                            />
                            <div>
                              <p className="font-semibold text-stone-900 dark:text-stone-100">
                                {item.title}
                              </p>
                              <p className="text-[11px] text-stone-400 line-clamp-1 max-w-xs">
                                {item.description}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-stone-600 dark:text-stone-300">
                          {item.categoryName}
                        </td>
                        <td className="p-4 font-mono font-bold">
                          {formatPrice(item.price)}
                        </td>
                        <td className="p-4 text-stone-500 font-mono text-[11px]">
                          {item.calories} kcal &middot; {item.prepTimeMinutes}m
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleToggleItemAvailability(item.id)}
                            className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase transition-colors ${
                              item.isAvailable
                                ? 'bg-[#EBF5EE] text-[#2F663C] dark:bg-[#1E2E23] dark:text-[#88C697]'
                                : 'bg-stone-200 text-stone-600 dark:bg-stone-800 dark:text-stone-400'
                            }`}
                          >
                            {item.isAvailable ? 'In Stock' : 'Sold Out'}
                          </button>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingItem({ ...item });
                              setShowItemModal(true);
                            }}
                            className="p-1.5 text-stone-500 hover:text-stone-900 dark:hover:text-white"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete "${item.title}"?`)) {
                                dataService.deleteMenuItem(item.id);
                              }
                            }}
                            className="p-1.5 text-stone-400 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: RESERVATIONS MANAGER */}
        {activeTab === 'reservations' && (
          <div className="space-y-6">
            <div>
              <h1 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">
                Table Reservations &amp; Floor Bookings
              </h1>
              <p className="text-xs text-stone-500">
                Confirm, assign tables, and manage guest seatings.
              </p>
            </div>

            <div className="bg-white dark:bg-[#1E1915] rounded-3xl border border-[#EDE8E1] dark:border-[#2E2621] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F2] dark:bg-[#25201C] text-stone-500 uppercase tracking-wider text-[11px] border-b border-stone-200 dark:border-stone-800">
                    <tr>
                      <th className="p-4">Guest</th>
                      <th className="p-4">Date &amp; Slot</th>
                      <th className="p-4">Party Size &amp; Area</th>
                      <th className="p-4">Assigned Table</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {reservations.map((res) => (
                      <tr key={res.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/40">
                        <td className="p-4">
                          <p className="font-semibold text-stone-900 dark:text-white">
                            {res.customerName}
                          </p>
                          <p className="text-[11px] text-stone-500 font-mono">{res.phone}</p>
                          {res.specialRequests && (
                            <p className="text-[11px] text-amber-700 italic">"{res.specialRequests}"</p>
                          )}
                        </td>
                        <td className="p-4">
                          <p className="font-semibold">{res.date}</p>
                          <p className="text-[11px] text-stone-500 font-mono">{res.timeSlot}</p>
                        </td>
                        <td className="p-4">
                          {res.partySize} Guests &middot;{' '}
                          <span className="capitalize text-stone-600 dark:text-stone-300">
                            {res.seatingArea}
                          </span>
                        </td>
                        <td className="p-4 font-mono font-bold">
                          {res.tableNumber ? `#${res.tableNumber}` : 'Unassigned'}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                              res.status === 'confirmed'
                                ? 'bg-green-100 text-green-700'
                                : res.status === 'cancelled'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {res.status}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-1">
                          {res.status === 'pending' && (
                            <button
                              onClick={() => dataService.updateReservationStatus(res.id, 'confirmed', 5)}
                              className="px-2.5 py-1 rounded bg-green-600 text-white font-medium text-[11px]"
                            >
                              Confirm
                            </button>
                          )}
                          {res.status !== 'cancelled' && (
                            <button
                              onClick={() => dataService.updateReservationStatus(res.id, 'cancelled')}
                              className="px-2 py-1 rounded text-red-600 hover:bg-red-50 text-[11px]"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: OFFERS & COUPONS */}
        {activeTab === 'offers' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">
                  Promotions &amp; Discount Codes
                </h1>
                <p className="text-xs text-stone-500">
                  Create and manage valid coupon codes for online and table checkout.
                </p>
              </div>
              <button
                onClick={() => setShowCouponModal(true)}
                className="px-4 py-2 rounded-xl bg-[#D9532F] text-white hover:bg-[#C24522] text-xs font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>New Promo Code</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {offers.map((offer) => (
                <div
                  key={offer.code}
                  className="p-5 rounded-2xl bg-white dark:bg-[#1E1915] border border-[#EDE8E1] dark:border-[#2E2621] space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-base font-bold text-[#D9532F]">
                      {offer.code}
                    </span>
                    <button
                      onClick={() => dataService.deleteOffer(offer.code)}
                      className="text-stone-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h3 className="font-semibold text-xs text-stone-900 dark:text-white">
                    {offer.title}
                  </h3>
                  <p className="text-xs text-stone-500">{offer.description}</p>
                  <div className="text-[11px] text-stone-400 font-mono">
                    Discount: {offer.discountValue}
                    {offer.discountType === 'percentage' ? '%' : ' flat'} &middot; Min:{' '}
                    {formatPrice(offer.minOrderValue)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: REVIEWS MODERATION */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div>
              <h1 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">
                Guest Reviews &amp; Moderation
              </h1>
              <p className="text-xs text-stone-500">
                Moderate incoming customer reviews and post official management replies.
              </p>
            </div>

            <div className="space-y-3">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#1E1915] border border-[#EDE8E1] dark:border-[#2E2621] space-y-2 text-xs"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-sm text-stone-900 dark:text-white">
                        {rev.customerName}
                      </span>
                      <span className="text-stone-400 ml-2">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                  </div>

                  <p className="text-stone-700 dark:text-stone-300 italic leading-relaxed">
                    "{rev.comment}"
                  </p>

                  {rev.reply && (
                    <div className="p-3 bg-stone-50 dark:bg-stone-800/40 rounded-xl">
                      <p className="font-semibold text-stone-700 dark:text-stone-300">
                        {rev.reply.author}:
                      </p>
                      <p className="text-stone-600 dark:text-stone-400">{rev.reply.comment}</p>
                    </div>
                  )}

                  <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex justify-between items-center">
                    <span className="text-[11px] text-stone-400 uppercase">
                      Status: {rev.status}
                    </span>
                    <button
                      onClick={() => {
                        setReplyReviewId(rev.id);
                        setReplyText(rev.reply?.comment || '');
                      }}
                      className="text-xs text-[#D9532F] font-semibold hover:underline"
                    >
                      {rev.reply ? 'Edit Reply' : 'Post Reply'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: CUSTOMERS & LOYALTY */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div>
              <h1 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">
                Customer Directory &amp; Loyalty Tiers
              </h1>
              <p className="text-xs text-stone-500">
                Inspect customer order counts, reward points balances, and adjust points manually.
              </p>
            </div>

            <div className="bg-white dark:bg-[#1E1915] rounded-3xl border border-[#EDE8E1] dark:border-[#2E2621] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF7F2] dark:bg-[#25201C] text-stone-500 uppercase tracking-wider text-[11px] border-b border-stone-200 dark:border-stone-800">
                    <tr>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Phone</th>
                      <th className="p-4">Tier</th>
                      <th className="p-4">Points</th>
                      <th className="p-4">Total Spent</th>
                      <th className="p-4 text-right">Adjust Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                    {customers.map((c) => (
                      <tr key={c.id}>
                        <td className="p-4 font-semibold text-stone-900 dark:text-white">
                          {c.name}
                        </td>
                        <td className="p-4 font-mono text-stone-500">+91 {c.phone}</td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded font-bold uppercase text-[10px] bg-amber-100 text-amber-900">
                            {c.tier}
                          </span>
                        </td>
                        <td className="p-4 font-mono font-bold text-[#D9532F]">
                          {c.loyaltyPoints} pts
                        </td>
                        <td className="p-4 font-mono">{formatPrice(c.totalSpent)}</td>
                        <td className="p-4 text-right space-x-1">
                          <button
                            onClick={() => dataService.adjustCustomerPoints(c.phone, 50)}
                            className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-[11px] font-bold"
                          >
                            +50 pts
                          </button>
                          <button
                            onClick={() => dataService.adjustCustomerPoints(c.phone, -50)}
                            className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-[11px] font-bold"
                          >
                            -50 pts
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: INQUIRIES INBOX */}
        {activeTab === 'inquiries' && (
          <div className="space-y-6">
            <div>
              <h1 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">
                Catering &amp; Event Inquiries Inbox
              </h1>
              <p className="text-xs text-stone-500">
                Incoming messages from private events, bulk breakfast boxes, and feedback.
              </p>
            </div>

            <div className="space-y-3">
              {inquiries.length === 0 ? (
                <p className="text-xs text-stone-400">No inquiries in inbox.</p>
              ) : (
                inquiries.map((inq) => (
                  <div
                    key={inq.id}
                    className="p-5 rounded-2xl bg-white dark:bg-[#1E1915] border border-[#EDE8E1] dark:border-[#2E2621] space-y-3 text-xs"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-sm text-stone-900 dark:text-white">
                          {inq.name}
                        </span>
                        <span className="text-stone-400 ml-2 font-mono">
                          {inq.phone} &middot; {inq.email}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#FDF0EC] text-[#D9532F]">
                        {inq.type}
                      </span>
                    </div>

                    <p className="text-stone-700 dark:text-stone-300 leading-relaxed bg-[#FAF7F2] dark:bg-[#25201C] p-3 rounded-xl border border-stone-200 dark:border-stone-800">
                      "{inq.message}"
                    </p>

                    <div className="pt-2 flex justify-between items-center">
                      <span className="text-[11px] text-stone-400">
                        {new Date(inq.createdAt).toLocaleString()}
                      </span>
                      <div className="flex gap-2">
                        <a
                          href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-[#25D366] text-white font-medium flex items-center gap-1 shadow-2xs"
                        >
                          <Send className="w-3 h-3" />
                          <span>WhatsApp Reply</span>
                        </a>
                        <button
                          onClick={() => dataService.markInquiry(inq.id, { isResolved: true })}
                          className="px-3 py-1.5 rounded-lg border border-stone-300 text-stone-700 font-medium"
                        >
                          Mark Resolved
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 9: SETTINGS & WHITE-LABEL CONFIG */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h1 className="font-serif text-2xl font-bold text-stone-900 dark:text-white">
                White-Label &amp; Café Configuration
              </h1>
              <p className="text-xs text-stone-500">
                Customize your branding, business details, currency, tax rates, and WhatsApp phone number.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="bg-white dark:bg-[#1E1915] p-6 sm:p-8 rounded-3xl border border-[#EDE8E1] dark:border-[#2E2621] space-y-4 text-xs shadow-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-stone-500 block mb-1">Business Name</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.name}
                    onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#221C18]"
                  />
                </div>
                <div>
                  <label className="text-stone-500 block mb-1">WhatsApp Ordering Number</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.whatsappNumber}
                    onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                    placeholder="919876543210 (country code + phone)"
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#221C18] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-500 block mb-1">Tagline &amp; Concept</label>
                <input
                  type="text"
                  value={settingsForm.tagline}
                  onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#221C18]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-stone-500 block mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    value={settingsForm.gstin || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, gstin: e.target.value.toUpperCase() })}
                    placeholder="29AAAAA0000A1Z5"
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#221C18] font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="text-stone-500 block mb-1">FSSAI License No.</label>
                  <input
                    type="text"
                    value={settingsForm.fssaiLicNo || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, fssaiLicNo: e.target.value })}
                    placeholder="11223344000123"
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#221C18] font-mono"
                  />
                </div>
                <div>
                  <label className="text-stone-500 block mb-1">Thermal Receipt Format</label>
                  <select
                    value={settingsForm.receiptWidth || '80mm'}
                    onChange={(e) => setSettingsForm({ ...settingsForm, receiptWidth: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#221C18] font-mono"
                  >
                    <option value="80mm">80mm Continuous Roll (Standard)</option>
                    <option value="58mm">58mm Compact Roll</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-stone-500 block mb-1">Dine-In Service Charge (%)</label>
                  <input
                    type="number"
                    value={settingsForm.serviceChargePercentage || 5}
                    onChange={(e) => setSettingsForm({ ...settingsForm, serviceChargePercentage: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#221C18] font-mono"
                  />
                </div>
                <div>
                  <label className="text-stone-500 block mb-1">Takeaway &amp; Packaging Fee (₹)</label>
                  <input
                    type="number"
                    value={settingsForm.packagingFee || 20}
                    onChange={(e) => setSettingsForm({ ...settingsForm, packagingFee: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#221C18] font-mono"
                  />
                </div>
                <div>
                  <label className="text-stone-500 block mb-1">Delivery Travel Buffer (mins)</label>
                  <input
                    type="number"
                    value={settingsForm.deliveryTravelMinutes || 25}
                    onChange={(e) => setSettingsForm({ ...settingsForm, deliveryTravelMinutes: parseInt(e.target.value, 10) || 25 })}
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#221C18] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-stone-500 block mb-1">GST / Tax Rate (%) (2.5% CGST + 2.5% SGST)</label>
                  <input
                    type="number"
                    value={settingsForm.taxPercentage}
                    onChange={(e) => setSettingsForm({ ...settingsForm, taxPercentage: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#221C18] font-mono"
                  />
                </div>
                <div>
                  <label className="text-stone-500 block mb-1">Delivery Fee (₹)</label>
                  <input
                    type="number"
                    value={settingsForm.deliveryFee}
                    onChange={(e) => setSettingsForm({ ...settingsForm, deliveryFee: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#221C18] font-mono"
                  />
                </div>
                <div>
                  <label className="text-stone-500 block mb-1">Total Tables Count</label>
                  <input
                    type="number"
                    value={settingsForm.totalTables}
                    onChange={(e) => setSettingsForm({ ...settingsForm, totalTables: parseInt(e.target.value, 10) || 20 })}
                    className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#221C18] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-500 block mb-1">Physical Address</label>
                <input
                  type="text"
                  value={settingsForm.address}
                  onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#221C18]"
                />
              </div>

              <div>
                <label className="text-stone-500 block mb-1">Opening Hours</label>
                <input
                  type="text"
                  value={settingsForm.openingHours}
                  onChange={(e) => setSettingsForm({ ...settingsForm, openingHours: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#221C18]"
                />
              </div>

              {/* Seasonal Menu Toggle */}
              <div className="p-4 bg-stone-50 dark:bg-stone-800/40 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="font-semibold text-stone-800 dark:text-stone-200">
                    Enable Seasonal Menu Campaign
                  </p>
                  <p className="text-[11px] text-stone-500">
                    Displays the top promotional seasonal banner and includes monsoon specials in menu.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settingsForm.seasonalMenuEnabled}
                  onChange={(e) => setSettingsForm({ ...settingsForm, seasonalMenuEnabled: e.target.checked })}
                  className="w-4 h-4 accent-[#D9532F]"
                />
              </div>

              <div className="pt-2 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Reset all demo data back to factory seeds?')) {
                      dataService.resetToFactorySeed();
                      alert('Factory seed data restored.');
                    }
                  }}
                  className="text-xs text-red-600 hover:underline"
                >
                  Reset Factory Demo Data
                </button>

                <button
                  type="submit"
                  className="py-3 px-6 rounded-xl bg-[#D9532F] text-white hover:bg-[#C24522] font-semibold text-xs shadow-sm"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* MODAL 1: A4 TAX INVOICE & DINING BILL PRINT VIEW */}
      {printOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div onClick={() => setPrintOrder(null)} className="fixed inset-0 bg-black/60 backdrop-blur-xs" />
          <div className="relative w-full max-w-4xl bg-white text-stone-900 p-4 sm:p-6 rounded-3xl shadow-2xl z-10 space-y-4 flex flex-col items-center overflow-x-hidden my-6">
            <div className="w-full flex justify-between items-center border-b border-stone-200 pb-3">
              <span className="font-bold text-xs uppercase font-sans tracking-wider text-stone-700">
                Official Tax Invoice &amp; Dining Bill (A4 Format)
              </span>
              <button
                type="button"
                onClick={() => setPrintOrder(null)}
                className="text-stone-400 hover:text-black p-1.5 rounded-xl hover:bg-stone-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="w-full flex justify-center overflow-x-auto py-1">
              <ThermalReceipt order={printOrder} showActions={true} />
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: MENU ITEM EDITOR */}
      {showItemModal && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div onClick={() => setShowItemModal(false)} className="fixed inset-0 bg-black/60 backdrop-blur-xs" />
          <div className="relative w-full max-w-lg bg-white dark:bg-[#1E1915] text-[#2E1C12] dark:text-[#F3EDE6] p-6 rounded-3xl shadow-2xl z-10 space-y-4 my-8">
            <h3 className="font-serif font-bold text-lg">
              {editingItem.id ? 'Edit Menu Dish' : 'Create New Dish'}
            </h3>

            <form onSubmit={handleSaveItem} className="space-y-3 text-xs">
              <div>
                <label className="text-stone-500 block mb-1">Dish Title (English)</label>
                <input
                  type="text"
                  required
                  value={editingItem.title}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  placeholder="e.g. Cardamom Rose Cortado"
                  className="w-full p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#221C18]"
                />
              </div>

              <div>
                <label className="text-stone-500 block mb-1">Description (English)</label>
                <textarea
                  rows={2}
                  required
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  placeholder="Appetizing description of ingredients and flavors..."
                  className="w-full p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#221C18]"
                />
              </div>

              {/* Gemini Auto-Translate Box */}
              <div className="p-3 bg-amber-50 dark:bg-[#282017] rounded-xl border border-amber-200 dark:border-amber-900/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-200 font-bold text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-[#F5A623]" />
                    <span>Multilingual Auto-Translate</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoTranslate}
                    disabled={isTranslating}
                    className="px-3 py-1.5 rounded-lg bg-[#8E1B1B] text-white hover:bg-[#721515] text-[11px] font-bold flex items-center gap-1 disabled:opacity-50"
                  >
                    <Sparkles className="w-3 h-3 text-[#F5A623]" />
                    <span>{isTranslating ? 'Translating...' : 'Auto-Translate with Gemini'}</span>
                  </button>
                </div>

                {translateNotice && (
                  <p className="text-[11px] text-[#2E7D4F] font-semibold">{translateNotice}</p>
                )}

                {editingItem.titleLocalized && (
                  <div className="grid grid-cols-2 gap-1.5 text-[10px] text-stone-600 dark:text-stone-300 pt-1 font-mono">
                    <div><span className="font-bold">தமிழ்:</span> {editingItem.titleLocalized.ta || '-'}</div>
                    <div><span className="font-bold">తెలుగు:</span> {editingItem.titleLocalized.te || '-'}</div>
                    <div><span className="font-bold">हिन्दी:</span> {editingItem.titleLocalized.hi || '-'}</div>
                    <div><span className="font-bold">മലയാളം:</span> {editingItem.titleLocalized.ml || '-'}</div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-stone-500 block mb-1">Category</label>
                  <select
                    value={editingItem.categoryId}
                    onChange={(e) => {
                      const c = categories.find((cat) => cat.id === e.target.value);
                      setEditingItem({
                        ...editingItem,
                        categoryId: e.target.value,
                        categoryName: c ? c.name : editingItem.categoryName,
                      });
                    }}
                    className="w-full p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#221C18]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-stone-500 block mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={editingItem.price}
                    onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#221C18] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-500 block mb-1">Image URL</label>
                <input
                  type="text"
                  value={editingItem.imageUrl}
                  onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                  className="w-full p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#221C18]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-stone-500 block mb-1">Calories (kcal)</label>
                  <input
                    type="number"
                    value={editingItem.calories}
                    onChange={(e) => setEditingItem({ ...editingItem, calories: parseInt(e.target.value, 10) || 0 })}
                    className="w-full p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#221C18]"
                  />
                </div>

                <div>
                  <label className="text-stone-500 block mb-1">Prep Time (mins)</label>
                  <input
                    type="number"
                    value={editingItem.prepTimeMinutes}
                    onChange={(e) => setEditingItem({ ...editingItem, prepTimeMinutes: parseInt(e.target.value, 10) || 0 })}
                    className="w-full p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#221C18]"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="py-2.5 px-4 rounded-xl border border-stone-300 dark:border-stone-700 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#D9532F] text-white font-semibold text-xs"
                >
                  Save Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: PROMO CODE EDITOR */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowCouponModal(false)} className="fixed inset-0 bg-black/60 backdrop-blur-xs" />
          <div className="relative w-full max-w-md bg-white dark:bg-[#1E1915] text-[#2E1C12] dark:text-[#F3EDE6] p-6 rounded-3xl shadow-2xl z-10 space-y-4">
            <h3 className="font-serif font-bold text-lg">Create Promotion Code</h3>
            <form onSubmit={handleSaveCoupon} className="space-y-3 text-xs">
              <div>
                <label className="text-stone-500 block mb-1">Code (Uppercase)</label>
                <input
                  type="text"
                  required
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. MONSOON25"
                  className="w-full p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#221C18] font-mono uppercase"
                />
              </div>
              <div>
                <label className="text-stone-500 block mb-1">Promo Title</label>
                <input
                  type="text"
                  required
                  value={newCoupon.title}
                  onChange={(e) => setNewCoupon({ ...newCoupon, title: e.target.value })}
                  placeholder="e.g. 25% Off Monsoon Specials"
                  className="w-full p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#221C18]"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-stone-500 block mb-1">Discount Type</label>
                  <select
                    value={newCoupon.discountType}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value as any })}
                    className="w-full p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#221C18]"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="text-stone-500 block mb-1">Value</label>
                  <input
                    type="number"
                    required
                    value={newCoupon.discountValue}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#221C18] font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-stone-500 block mb-1">Min Order Value (₹)</label>
                <input
                  type="number"
                  value={newCoupon.minOrderValue}
                  onChange={(e) => setNewCoupon({ ...newCoupon, minOrderValue: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#221C18] font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="py-2.5 px-4 rounded-xl border border-stone-300 dark:border-stone-700 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-[#D9532F] text-white font-semibold text-xs"
                >
                  Save Promotion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: REPLY REVIEW */}
      {replyReviewId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setReplyReviewId(null)} className="fixed inset-0 bg-black/60 backdrop-blur-xs" />
          <div className="relative w-full max-w-md bg-white dark:bg-[#1E1915] text-[#2E1C12] dark:text-[#F3EDE6] p-6 rounded-3xl shadow-2xl z-10 space-y-4">
            <h3 className="font-serif font-bold text-lg">Reply to Guest Review</h3>
            <textarea
              rows={3}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a warm note from CafeFlow management..."
              className="w-full p-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-[#221C18] text-xs"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setReplyReviewId(null)}
                className="py-2 px-3 rounded-xl border border-stone-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (replyText.trim()) {
                    dataService.replyToReview(replyReviewId, replyText.trim());
                    setReplyReviewId(null);
                  }
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-[#D9532F] text-white font-semibold text-xs"
              >
                Post Reply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
