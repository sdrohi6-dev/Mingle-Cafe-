import {
  Category,
  MenuItem,
  Offer,
  Order,
  OrderStatus,
  OrderType,
  PaymentMethod,
  CartItem,
  Reservation,
  Review,
  Customer,
  Inquiry,
  CafeSettings,
  Table,
} from '../types';
import {
  SEED_CATEGORIES,
  SEED_MENU_ITEMS,
  SEED_OFFERS,
  SEED_REVIEWS,
  SEED_ORDERS,
  SEED_RESERVATIONS,
  DEFAULT_CAFE_SETTINGS,
} from '../data/seedData';

type Listener = () => void;

class DataService {
  private listeners: Map<string, Set<Listener>> = new Map();

  constructor() {
    this.initStorage();
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key && e.key.startsWith('cafeflow_')) {
          this.notify(e.key);
        }
      });
    }
  }

  private initStorage() {
    if (typeof window === 'undefined') return;

    const MENU_VERSION = 'v4_dish_accurate_images_32';
    const storedVersion = localStorage.getItem('cafeflow_menu_version');

    if (storedVersion !== MENU_VERSION) {
      localStorage.setItem('cafeflow_categories', JSON.stringify(SEED_CATEGORIES));
      localStorage.setItem('cafeflow_menu', JSON.stringify(SEED_MENU_ITEMS));
      localStorage.setItem('cafeflow_offers', JSON.stringify(SEED_OFFERS));
      localStorage.setItem('cafeflow_reviews', JSON.stringify(SEED_REVIEWS));
      localStorage.setItem('cafeflow_settings', JSON.stringify(DEFAULT_CAFE_SETTINGS));
      localStorage.setItem('cafeflow_menu_version', MENU_VERSION);
    }

    if (!localStorage.getItem('cafeflow_categories')) {
      localStorage.setItem('cafeflow_categories', JSON.stringify(SEED_CATEGORIES));
    }
    if (!localStorage.getItem('cafeflow_menu')) {
      localStorage.setItem('cafeflow_menu', JSON.stringify(SEED_MENU_ITEMS));
    }
    if (!localStorage.getItem('cafeflow_offers')) {
      localStorage.setItem('cafeflow_offers', JSON.stringify(SEED_OFFERS));
    }
    if (!localStorage.getItem('cafeflow_reviews')) {
      localStorage.setItem('cafeflow_reviews', JSON.stringify(SEED_REVIEWS));
    }
    if (!localStorage.getItem('cafeflow_orders')) {
      localStorage.setItem('cafeflow_orders', JSON.stringify(SEED_ORDERS));
    }
    if (!localStorage.getItem('cafeflow_reservations')) {
      localStorage.setItem('cafeflow_reservations', JSON.stringify(SEED_RESERVATIONS));
    }
    if (!localStorage.getItem('cafeflow_settings')) {
      localStorage.setItem('cafeflow_settings', JSON.stringify(DEFAULT_CAFE_SETTINGS));
    }
    if (!localStorage.getItem('cafeflow_inquiries')) {
      localStorage.setItem(
        'cafeflow_inquiries',
        JSON.stringify([
          {
            id: 'inq_1',
            name: 'Rohit Shenoy',
            email: 'rohit@techcorp.in',
            phone: '+91 98201 99887',
            type: 'catering',
            message: 'Looking to organize a team brunch for 25 people next Friday with specialty coffee station.',
            createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
            isRead: false,
            isResolved: false,
          },
        ])
      );
    }
    if (!localStorage.getItem('cafeflow_customers')) {
      localStorage.setItem(
        'cafeflow_customers',
        JSON.stringify([
          {
            id: 'cust_1',
            phone: '9876543210',
            name: 'Aditi Sharma',
            email: 'aditi@example.com',
            loyaltyPoints: 340,
            tier: 'Silver',
            favoriteItemIds: ['item_cappuccino', 'item_truffle_scramble'],
            totalSpent: 4250,
            ordersCount: 6,
            createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
          },
        ])
      );
    }
  }

  public subscribe(key: string, listener: Listener): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(listener);

    return () => {
      this.listeners.get(key)?.delete(listener);
    };
  }

  private notify(key: string) {
    this.listeners.get(key)?.forEach((fn) => fn());
    this.listeners.get('*')?.forEach((fn) => fn());
  }

  private get<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  }

  private set<T>(key: string, val: T): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(val));
    this.notify(key);
  }

  // --- MENU ITEMS ---
  public getMenuItems(): MenuItem[] {
    return this.get<MenuItem[]>('cafeflow_menu', SEED_MENU_ITEMS);
  }

  public getMenuItem(id: string): MenuItem | undefined {
    return this.getMenuItems().find((item) => item.id === id);
  }

  public saveMenuItem(item: MenuItem): void {
    const items = this.getMenuItems();
    const index = items.findIndex((i) => i.id === item.id);
    if (index >= 0) {
      items[index] = item;
    } else {
      items.unshift(item);
    }
    this.set('cafeflow_menu', items);
  }

  public toggleItemAvailability(id: string): boolean {
    const items = this.getMenuItems();
    const item = items.find((i) => i.id === id);
    if (!item) return false;
    item.isAvailable = !item.isAvailable;
    this.set('cafeflow_menu', items);
    return item.isAvailable;
  }

  public deleteMenuItem(id: string): void {
    const items = this.getMenuItems().filter((i) => i.id !== id);
    this.set('cafeflow_menu', items);
  }

  public reorderMenuItems(orderedIds: string[]): void {
    const items = this.getMenuItems();
    const map = new Map(items.map((i) => [i.id, i]));
    const reordered: MenuItem[] = [];
    orderedIds.forEach((id, index) => {
      const it = map.get(id);
      if (it) {
        it.sortOrder = index + 1;
        reordered.push(it);
        map.delete(id);
      }
    });
    // Append any remaining
    map.forEach((it) => reordered.push(it));
    this.set('cafeflow_menu', reordered);
  }

  // --- CATEGORIES ---
  public getCategories(): Category[] {
    return this.get<Category[]>('cafeflow_categories', SEED_CATEGORIES);
  }

  public saveCategory(category: Category): void {
    const cats = this.getCategories();
    const index = cats.findIndex((c) => c.id === category.id);
    if (index >= 0) {
      cats[index] = category;
    } else {
      cats.push(category);
    }
    this.set('cafeflow_categories', cats);
  }

  public deleteCategory(id: string): void {
    const cats = this.getCategories().filter((c) => c.id !== id);
    this.set('cafeflow_categories', cats);
  }

  // --- TIMING & QUEUE CALCULATIONS ---
  public calculateDishTimings(
    items: CartItem[],
    orderType: OrderType,
    placedAt: Date = new Date()
  ): { dishTimings: import('../types').DishTiming[]; overallEstimatedTime: string; overallMinutes: number } {
    const settings = this.getSettings();
    const activeOrders = this.getOrders().filter(
      (o) => o.status === 'received' || o.status === 'preparing'
    );
    // Dynamic queue load delay: +2 minutes per active order, capped at 16 mins
    const queueDelayMinutes = Math.min(16, activeOrders.length * 2);

    let maxItemReadyMinutes = 0;

    const dishTimings = items.map((ci) => {
      const prepMinutes = ci.item.prepTimeMinutes || 12;
      const totalMinutes = queueDelayMinutes + prepMinutes;
      if (totalMinutes > maxItemReadyMinutes) {
        maxItemReadyMinutes = totalMinutes;
      }
      const readyDate = new Date(placedAt.getTime() + totalMinutes * 60000);
      const readyAtTime = readyDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

      return {
        itemId: ci.item.id,
        title: ci.item.title,
        titleLocalized: ci.item.titleLocalized,
        quantity: ci.quantity,
        prepTimeMinutes: prepMinutes,
        readyAtTime,
      };
    });

    const deliveryExtra = orderType === 'delivery' ? (settings.deliveryTravelMinutes || 25) : 0;
    const overallMinutes = (maxItemReadyMinutes || 15) + deliveryExtra;
    const overallDate = new Date(placedAt.getTime() + overallMinutes * 60000);
    const overallEstimatedTime = overallDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

    return { dishTimings, overallEstimatedTime, overallMinutes };
  }

  // --- ORDERS ---
  public getOrders(): Order[] {
    return this.get<Order[]>('cafeflow_orders', SEED_ORDERS);
  }

  public getOrder(orderId: string): Order | undefined {
    return this.getOrders().find(
      (o) => o.id === orderId || o.orderNumber.toLowerCase() === orderId.toLowerCase() || o.billNumber?.toLowerCase() === orderId.toLowerCase()
    );
  }

  public createOrder(
    order: Partial<Order> & {
      customerName: string;
      customerPhone: string;
      orderType: OrderType;
      items: CartItem[];
      subtotal: number;
      total: number;
      paymentMethod: PaymentMethod;
    }
  ): Order {
    const orders = this.getOrders();
    const orderSeq = 1000 + orders.length + 1;
    const orderNumber = order.orderNumber || `CF-${orderSeq}`;
    const billNumber = order.billNumber || `CF-BILL-${orderSeq}`;
    const now = new Date();
    const nowIso = now.toISOString();

    const settings = this.getSettings();
    const { dishTimings, overallEstimatedTime } = this.calculateDishTimings(
      order.items,
      order.orderType,
      now
    );

    const taxAmount = order.tax !== undefined ? order.tax : Math.round((order.subtotal * (settings.taxPercentage || 5)) / 100);
    const halfTax = Math.round(taxAmount / 2);

    const serviceCharge =
      order.serviceCharge !== undefined
        ? order.serviceCharge
        : order.orderType === 'dineIn'
        ? Math.round((order.subtotal * (settings.serviceChargePercentage || 5)) / 100)
        : 0;

    const packagingCharge =
      order.packagingCharge !== undefined
        ? order.packagingCharge
        : order.orderType === 'takeaway' || order.orderType === 'delivery'
        ? settings.packagingFee || 20
        : 0;

    const newOrder: Order = {
      id: order.id || `ord_${Date.now()}`,
      billNumber,
      orderNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      orderType: order.orderType,
      tableNumber: order.tableNumber,
      pickupTime: order.pickupTime,
      deliveryAddress: order.deliveryAddress,
      items: order.items,
      subtotal: order.subtotal,
      discount: order.discount || 0,
      couponCode: order.couponCode,
      tax: taxAmount,
      cgst: order.cgst !== undefined ? order.cgst : halfTax,
      sgst: order.sgst !== undefined ? order.sgst : (taxAmount - halfTax),
      serviceCharge,
      packagingCharge,
      deliveryFee: order.deliveryFee || 0,
      loyaltyDiscount: order.loyaltyDiscount || 0,
      loyaltyPointsUsed: order.loyaltyPointsUsed || 0,
      loyaltyPointsEarned: Math.floor(order.total / (settings.loyaltyEarnRate * 10)),
      total: order.total,
      status: order.status || 'received',
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus || (order.paymentMethod === 'cash' ? 'pending' : 'paid'),
      specialNotes: order.specialNotes,
      createdAt: nowIso,
      updatedAt: nowIso,
      dishTimings: order.dishTimings && order.dishTimings.length > 0 ? order.dishTimings : dishTimings,
      overallEstimatedTime: order.overallEstimatedTime || overallEstimatedTime,
      language: order.language || 'en',
      timeline: [
        {
          status: 'received',
          timestamp: nowIso,
          note: `Order received via ${order.orderType === 'dineIn' ? `Table ${order.tableNumber}` : order.orderType}`,
        },
      ],
    };

    orders.unshift(newOrder);
    this.set('cafeflow_orders', orders);

    // Update customer spending & points
    if (order.customerPhone) {
      this.recordCustomerOrder(order.customerPhone, order.customerName, order.total);
    }

    return newOrder;
  }

  public updateOrderStatus(orderId: string, status: OrderStatus, note?: string): Order | undefined {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return undefined;

    const now = new Date().toISOString();
    order.status = status;
    order.updatedAt = now;
    order.timeline.push({
      status,
      timestamp: now,
      note: note || `Status updated to ${status}`,
    });

    this.set('cafeflow_orders', orders);
    return order;
  }

  // --- RESERVATIONS ---
  public getReservations(): Reservation[] {
    return this.get<Reservation[]>('cafeflow_reservations', SEED_RESERVATIONS);
  }

  public getReservation(id: string): Reservation | undefined {
    return this.getReservations().find((r) => r.id === id);
  }

  public checkSlotAvailability(date: string, timeSlot: string): { available: boolean; bookedCount: number; maxCapacity: number } {
    const settings = this.getSettings();
    const totalTables = settings.totalTables || 20;
    const reservations = this.getReservations().filter(
      (r) => r.date === date && r.timeSlot === timeSlot && r.status !== 'cancelled'
    );
    // Let's assume maximum 6 reservations per slot for safety and table turns
    const maxCapacity = Math.min(8, Math.floor(totalTables / 2.5));
    const bookedCount = reservations.length;
    return {
      available: bookedCount < maxCapacity,
      bookedCount,
      maxCapacity,
    };
  }

  public createReservation(reservation: Omit<Reservation, 'id' | 'createdAt' | 'status'>): Reservation {
    const reservations = this.getReservations();
    const newRes: Reservation = {
      ...reservation,
      id: `res_${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    reservations.unshift(newRes);
    this.set('cafeflow_reservations', reservations);
    return newRes;
  }

  public updateReservationStatus(id: string, status: Reservation['status'], tableNumber?: number): Reservation | undefined {
    const reservations = this.getReservations();
    const res = reservations.find((r) => r.id === id);
    if (!res) return undefined;

    res.status = status;
    if (tableNumber !== undefined) res.tableNumber = tableNumber;
    this.set('cafeflow_reservations', reservations);
    return res;
  }

  // --- OFFERS & COUPONS ---
  public getOffers(): Offer[] {
    return this.get<Offer[]>('cafeflow_offers', SEED_OFFERS);
  }

  public saveOffer(offer: Offer): void {
    const offers = this.getOffers();
    const index = offers.findIndex((o) => o.code.toUpperCase() === offer.code.toUpperCase());
    if (index >= 0) {
      offers[index] = offer;
    } else {
      offers.push(offer);
    }
    this.set('cafeflow_offers', offers);
  }

  public deleteOffer(code: string): void {
    const offers = this.getOffers().filter((o) => o.code.toUpperCase() !== code.toUpperCase());
    this.set('cafeflow_offers', offers);
  }

  public validateCoupon(code: string, subtotal: number): { valid: boolean; offer?: Offer; discountAmount: number; error?: string } {
    const offers = this.getOffers();
    const offer = offers.find((o) => o.code.toUpperCase() === code.trim().toUpperCase() && o.isActive);

    if (!offer) {
      return { valid: false, discountAmount: 0, error: 'Invalid or inactive promo code.' };
    }

    if (new Date(offer.expiresAt) < new Date()) {
      return { valid: false, discountAmount: 0, error: 'This promo code has expired.' };
    }

    if (subtotal < offer.minOrderValue) {
      return {
        valid: false,
        discountAmount: 0,
        error: `Minimum order of ₹${offer.minOrderValue} required to use this code.`,
      };
    }

    let discountAmount = 0;
    if (offer.discountType === 'percentage') {
      discountAmount = Math.round((subtotal * offer.discountValue) / 100);
      if (offer.maxDiscount && discountAmount > offer.maxDiscount) {
        discountAmount = offer.maxDiscount;
      }
    } else {
      discountAmount = offer.discountValue;
    }

    return { valid: true, offer, discountAmount };
  }

  // --- REVIEWS ---
  public getReviews(): Review[] {
    return this.get<Review[]>('cafeflow_reviews', SEED_REVIEWS);
  }

  public addReview(review: Omit<Review, 'id' | 'createdAt' | 'status'>): Review {
    const reviews = this.getReviews();
    const newRev: Review = {
      ...review,
      id: `rev_${Date.now()}`,
      status: 'published',
      createdAt: new Date().toISOString(),
    };
    reviews.unshift(newRev);
    this.set('cafeflow_reviews', reviews);
    return newRev;
  }

  public moderateReview(id: string, status: Review['status']): void {
    const reviews = this.getReviews();
    const rev = reviews.find((r) => r.id === id);
    if (rev) {
      rev.status = status;
      this.set('cafeflow_reviews', reviews);
    }
  }

  public replyToReview(id: string, comment: string): void {
    const reviews = this.getReviews();
    const rev = reviews.find((r) => r.id === id);
    if (rev) {
      rev.reply = {
        author: 'CafeFlow Management',
        comment,
        createdAt: new Date().toISOString(),
      };
      this.set('cafeflow_reviews', reviews);
    }
  }

  // --- CUSTOMERS & LOYALTY ---
  public getCustomers(): Customer[] {
    return this.get<Customer[]>('cafeflow_customers', []);
  }

  public getCustomer(phone: string): Customer | undefined {
    const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
    return this.getCustomers().find((c) => c.phone.replace(/[^0-9]/g, '').slice(-10) === cleanPhone);
  }

  public recordCustomerOrder(phone: string, name: string, amount: number): Customer {
    const customers = this.getCustomers();
    const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
    let customer = customers.find((c) => c.phone.replace(/[^0-9]/g, '').slice(-10) === cleanPhone);

    const settings = this.getSettings();
    const pointsEarned = Math.floor(amount / (settings.loyaltyEarnRate * 10));

    if (customer) {
      customer.ordersCount += 1;
      customer.totalSpent += amount;
      customer.loyaltyPoints += pointsEarned;
      if (name && !customer.name) customer.name = name;
      customer.tier = this.calculateTier(customer.totalSpent);
    } else {
      customer = {
        id: `cust_${Date.now()}`,
        phone: cleanPhone,
        name: name || 'Valued Guest',
        loyaltyPoints: pointsEarned + 50, // 50 bonus sign-up points
        tier: this.calculateTier(amount),
        favoriteItemIds: [],
        totalSpent: amount,
        ordersCount: 1,
        createdAt: new Date().toISOString(),
      };
      customers.push(customer);
    }

    this.set('cafeflow_customers', customers);
    return customer;
  }

  public adjustCustomerPoints(phone: string, deltaPoints: number): void {
    const customers = this.getCustomers();
    const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
    const customer = customers.find((c) => c.phone.replace(/[^0-9]/g, '').slice(-10) === cleanPhone);
    if (customer) {
      customer.loyaltyPoints = Math.max(0, customer.loyaltyPoints + deltaPoints);
      this.set('cafeflow_customers', customers);
    }
  }

  public saveCustomerProfile(customer: Customer): void {
    const customers = this.getCustomers();
    const index = customers.findIndex((c) => c.id === customer.id || c.phone === customer.phone);
    if (index >= 0) {
      customers[index] = customer;
    } else {
      customers.push(customer);
    }
    this.set('cafeflow_customers', customers);
  }

  public calculateTier(totalSpent: number): Customer['tier'] {
    if (totalSpent >= 10000) return 'Gold';
    if (totalSpent >= 3000) return 'Silver';
    return 'Bronze';
  }

  // --- INQUIRIES ---
  public getInquiries(): Inquiry[] {
    return this.get<Inquiry[]>('cafeflow_inquiries', []);
  }

  public createInquiry(inquiry: Omit<Inquiry, 'id' | 'createdAt' | 'isRead' | 'isResolved'>): Inquiry {
    const inquiries = this.getInquiries();
    const newInq: Inquiry = {
      ...inquiry,
      id: `inq_${Date.now()}`,
      createdAt: new Date().toISOString(),
      isRead: false,
      isResolved: false,
    };
    inquiries.unshift(newInq);
    this.set('cafeflow_inquiries', inquiries);
    return newInq;
  }

  public markInquiry(id: string, updates: Partial<Inquiry>): void {
    const inquiries = this.getInquiries();
    const inq = inquiries.find((i) => i.id === id);
    if (inq) {
      Object.assign(inq, updates);
      this.set('cafeflow_inquiries', inquiries);
    }
  }

  // --- SETTINGS ---
  public getSettings(): CafeSettings {
    return this.get<CafeSettings>('cafeflow_settings', DEFAULT_CAFE_SETTINGS);
  }

  public updateSettings(settings: CafeSettings): void {
    this.set('cafeflow_settings', settings);
  }

  // --- TABLES ---
  public getTables(): Table[] {
    const settings = this.getSettings();
    const orders = this.getOrders().filter((o) => o.orderType === 'dineIn' && o.status !== 'completed' && o.status !== 'cancelled');
    const occupiedMap = new Map<number, string>();
    orders.forEach((o) => {
      if (o.tableNumber) occupiedMap.set(o.tableNumber, o.id);
    });

    const tables: Table[] = [];
    const count = settings.totalTables || 20;

    for (let i = 1; i <= count; i++) {
      let area: Table['area'] = 'indoor';
      let capacity = 4;
      if (i >= 1 && i <= 6) {
        area = 'indoor';
        capacity = i <= 2 ? 2 : 4;
      } else if (i >= 7 && i <= 14) {
        area = 'terrace';
        capacity = i >= 11 ? 6 : 4;
      } else if (i >= 15 && i <= 18) {
        area = 'window';
        capacity = 2;
      } else {
        area = 'bar';
        capacity = 2;
      }

      tables.push({
        number: i,
        capacity,
        area,
        isOccupied: occupiedMap.has(i),
        currentOrderId: occupiedMap.get(i),
      });
    }

    return tables;
  }

  // --- CSV IMPORT / EXPORT ---
  public exportMenuCSV(): string {
    const items = this.getMenuItems();
    const headers = ['id', 'title', 'categoryName', 'price', 'description', 'calories', 'prepTimeMinutes', 'rating', 'isAvailable', 'dietaryFlags'];
    const rows = items.map((i) => [
      i.id,
      `"${i.title.replace(/"/g, '""')}"`,
      `"${(i.categoryName || '').replace(/"/g, '""')}"`,
      i.price,
      `"${(i.description || '').replace(/"/g, '""')}"`,
      i.calories,
      i.prepTimeMinutes,
      i.rating,
      i.isAvailable,
      `"${i.dietaryFlags.join(';')}"`,
    ]);
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  public importMenuCSV(csvText: string): number {
    const lines = csvText.split('\n').filter((l) => l.trim().length > 0);
    if (lines.length <= 1) return 0;

    let importedCount = 0;
    const current = this.getMenuItems();
    const map = new Map(current.map((i) => [i.id, i]));

    for (let idx = 1; idx < lines.length; idx++) {
      const parts = lines[idx].split(',');
      if (parts.length >= 4) {
        const id = parts[0].trim();
        const title = parts[1]?.replace(/^"|"$/g, '').trim();
        const price = parseFloat(parts[3]) || 0;
        if (id && title) {
          const existing = map.get(id);
          if (existing) {
            existing.title = title;
            existing.price = price;
          } else {
            const newItem: MenuItem = {
              id: id || `item_${Date.now()}_${idx}`,
              title,
              categoryId: 'cat_breakfast',
              categoryName: 'All-Day Brunch',
              description: parts[4]?.replace(/^"|"$/g, '').trim() || '',
              price,
              imageUrl: '/src/assets/images/hero_bistro_spread_1792849166772.jpg',
              dietaryFlags: [],
              calories: 350,
              prepTimeMinutes: 10,
              rating: 4.8,
              reviewCount: 1,
              isAvailable: true,
            };
            current.push(newItem);
          }
          importedCount++;
        }
      }
    }

    this.set('cafeflow_menu', current);
    return importedCount;
  }

  // --- RESET ALL DATA ---
  public resetToFactorySeed(): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('cafeflow_categories', JSON.stringify(SEED_CATEGORIES));
    localStorage.setItem('cafeflow_menu', JSON.stringify(SEED_MENU_ITEMS));
    localStorage.setItem('cafeflow_offers', JSON.stringify(SEED_OFFERS));
    localStorage.setItem('cafeflow_reviews', JSON.stringify(SEED_REVIEWS));
    localStorage.setItem('cafeflow_orders', JSON.stringify(SEED_ORDERS));
    localStorage.setItem('cafeflow_reservations', JSON.stringify(SEED_RESERVATIONS));
    localStorage.setItem('cafeflow_settings', JSON.stringify(DEFAULT_CAFE_SETTINGS));
    this.notify('*');
  }
}

export const dataService = new DataService();
