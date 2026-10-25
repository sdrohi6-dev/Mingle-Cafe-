export type DietaryFlag = 'veg' | 'vegan' | 'glutenFree' | 'nutFree' | 'spicy';

export interface LocalizedString {
  en: string;
  ta?: string;
  te?: string;
  hi?: string;
  ml?: string;
}

export interface ModifierOption {
  id: string;
  name: string;
  priceDelta: number;
}

export interface ModifierGroup {
  id: string;
  title: string;
  required: boolean;
  minSelection?: number;
  maxSelection?: number;
  options: ModifierOption[];
}

export interface MenuItem {
  id: string;
  title: string;
  titleLocalized?: LocalizedString;
  categoryId: string;
  categoryName?: string;
  categoryNameLocalized?: LocalizedString;
  description: string;
  descriptionLocalized?: LocalizedString;
  price: number;
  imageUrl: string;
  dietaryFlags: DietaryFlag[];
  calories: number;
  prepTimeMinutes: number;
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
  isSeasonal?: boolean;
  seasonalTag?: string;
  isChefSpecial?: boolean;
  modifierGroups?: ModifierGroup[];
  ingredients?: string[];
  sortOrder?: number;
}

export interface Category {
  id: string;
  name: string;
  nameLocalized?: LocalizedString;
  slug: string;
  description?: string;
  descriptionLocalized?: LocalizedString;
  iconName: string;
  sortOrder: number;
  isSeasonal?: boolean;
}

export interface SelectedModifier {
  groupId: string;
  groupTitle: string;
  optionId: string;
  optionName: string;
  priceDelta: number;
}

export interface CartItem {
  cartItemId: string;
  item: MenuItem;
  quantity: number;
  selectedModifiers: SelectedModifier[];
  specialInstructions?: string;
  totalUnitPrice: number;
  prepTimeMinutes: number;
  estimatedServedAt?: string;
}

export type OrderType = 'dineIn' | 'takeaway' | 'delivery';
export type OrderStatus = 'received' | 'preparing' | 'ready' | 'served_out' | 'completed' | 'cancelled';
export type PaymentMethod = 'upi' | 'card' | 'cash';

export interface OrderTimelineEvent {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface DishTiming {
  itemId: string;
  title: string;
  titleLocalized?: LocalizedString;
  quantity: number;
  prepTimeMinutes: number;
  readyAtTime: string; // HH:MM
}

export interface Order {
  id: string;
  billNumber: string; // e.g. "CF-BILL-1042"
  orderNumber: string; // e.g. "CF-1042"
  customerName: string;
  customerPhone: string;
  orderType: OrderType;
  tableNumber?: number;
  pickupTime?: string;
  deliveryAddress?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  tax: number;
  cgst: number;
  sgst: number;
  serviceCharge: number;
  packagingCharge: number;
  deliveryFee: number;
  loyaltyDiscount: number;
  loyaltyPointsUsed: number;
  loyaltyPointsEarned: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'paid';
  specialNotes?: string;
  createdAt: string;
  updatedAt: string;
  timeline: OrderTimelineEvent[];
  dishTimings: DishTiming[];
  overallEstimatedTime: string; // HH:MM
  language: string;
}

export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
export type SeatingArea = 'indoor' | 'terrace' | 'window' | 'bar';

export interface Reservation {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "12:30 PM"
  partySize: number;
  seatingArea: SeatingArea;
  occasion?: string;
  specialRequests?: string;
  status: ReservationStatus;
  tableNumber?: number;
  createdAt: string;
}

export interface Table {
  number: number;
  capacity: number;
  area: SeatingArea;
  isOccupied: boolean;
  currentOrderId?: string;
}

export interface Offer {
  id?: string;
  code: string;
  title: string;
  titleLocalized?: LocalizedString;
  description: string;
  descriptionLocalized?: LocalizedString;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  expiresAt: string;
  isActive: boolean;
  badge?: string;
}

export interface Review {
  id: string;
  customerName: string;
  rating: number; // 1 to 5
  comment: string;
  menuItemId?: string;
  dishName?: string;
  imageUrl?: string;
  verifiedOrder: boolean;
  createdAt: string;
  status: 'published' | 'hidden' | 'flagged';
  reply?: {
    author: string;
    comment: string;
    createdAt: string;
  };
}

export type LoyaltyTier = 'Bronze' | 'Silver' | 'Gold';

export interface LoyaltyReward {
  id: string;
  title: string;
  titleLocalized?: LocalizedString;
  pointsCost: number;
  description: string;
  discountValue: number; // in INR
}

export interface Customer {
  id: string;
  phone: string;
  name: string;
  email?: string;
  loyaltyPoints: number;
  tier: LoyaltyTier;
  favoriteItemIds: string[];
  tasteProfile?: {
    mood?: string;
    flavor?: string;
    dietary?: string[];
    caffeine?: string;
  };
  totalSpent: number;
  ordersCount: number;
  createdAt: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'general' | 'catering' | 'event' | 'feedback';
  message: string;
  createdAt: string;
  isRead: boolean;
  isResolved: boolean;
}

export interface CafeSettings {
  name: string;
  tagline: string;
  description: string;
  logoUrl?: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  address: string;
  mapEmbedUrl: string;
  currencySymbol: string;
  currencyCode: string;
  taxPercentage: number; // default 5 (2.5% CGST + 2.5% SGST)
  serviceChargePercentage: number; // default 5 for dine-in
  packagingFee: number; // default 20 for takeaway & delivery
  deliveryFee: number; // default 40
  freeDeliveryThreshold: number; // default 799
  deliveryTravelMinutes: number; // default 25
  totalTables: number;
  openingHours: string;
  loyaltyEarnRate: number; // points per ₹10 spent
  loyaltyRedeemValue: number; // ₹ per point
  seasonalMenuEnabled: boolean;
  seasonalMenuTitle: string;
  seasonalMenuBannerUrl?: string;
  gstin: string;
  fssaiLicNo: string;
  receiptWidth: '80mm' | '58mm';
  defaultLanguage: string;
}

export interface DiscoveryPreference {
  mood: string;
  timeOfDay: string;
  weather: string;
  flavor: string;
  allergies: string[];
  caffeine: string;
  budget: string;
  partySize: number;
}

export interface DiscoveryRecommendation {
  id: string;
  matchPercent: number;
  reason: string;
  pairing: string;
}
