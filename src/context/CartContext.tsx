import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, MenuItem, Offer, OrderType, SelectedModifier } from '../types';
import { dataService } from '../services/dataService';
import { useSettings } from './SettingsContext';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (
    item: MenuItem,
    quantity?: number,
    selectedModifiers?: SelectedModifier[],
    specialInstructions?: string
  ) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;
  tableNumber: number | null;
  setTableNumber: (table: number | null) => void;
  deliveryAddress: string;
  setDeliveryAddress: (addr: string) => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  customerPhone: string;
  setCustomerPhone: (phone: string) => void;
  appliedCoupon: Offer | null;
  couponError: string | null;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  redeemedPoints: number;
  setRedeemedPoints: (points: number) => void;
  subtotal: number;
  discountAmount: number;
  loyaltyDiscountAmount: number;
  taxAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  serviceChargeAmount: number;
  packagingFeeAmount: number;
  deliveryFeeAmount: number;
  grandTotal: number;
  dishTimings: import('../types').DishTiming[];
  overallEstimatedTime: string;
  totalItemCount: number;
  buildWhatsAppOrderUrl: () => string;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings, formatPrice } = useSettings();

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('cafeflow_cart');
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderType, setOrderType] = useState<OrderType>('dineIn');
  const [tableNumber, setTableNumber] = useState<number | null>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const tableParam = urlParams.get('table');
      if (tableParam) {
        const num = parseInt(tableParam, 10);
        if (!isNaN(num) && num > 0) return num;
      }
      const saved = localStorage.getItem('cafeflow_table_number');
      return saved ? parseInt(saved, 10) : 4; // Default to Table 4 for interactive demo
    }
    return 4;
  });

  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [customerName, setCustomerName] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cafeflow_customer_name') || 'Aditi Sharma';
    }
    return 'Aditi Sharma';
  });

  const [customerPhone, setCustomerPhone] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cafeflow_customer_phone') || '+91 98765 43210';
    }
    return '+91 98765 43210';
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Offer | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [redeemedPoints, setRedeemedPoints] = useState(0);

  // Sync cart to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cafeflow_cart', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (tableNumber) {
        localStorage.setItem('cafeflow_table_number', tableNumber.toString());
      }
      localStorage.setItem('cafeflow_customer_name', customerName);
      localStorage.setItem('cafeflow_customer_phone', customerPhone);
    }
  }, [tableNumber, customerName, customerPhone]);

  // Check URL table param whenever window changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkParams = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const tableParam = urlParams.get('table');
        if (tableParam) {
          const num = parseInt(tableParam, 10);
          if (!isNaN(num) && num > 0) {
            setTableNumber(num);
            setOrderType('dineIn');
          }
        }
      };
      checkParams();
      window.addEventListener('popstate', checkParams);
      return () => window.removeEventListener('popstate', checkParams);
    }
  }, []);

  const addToCart = (
    item: MenuItem,
    quantity = 1,
    selectedModifiers: SelectedModifier[] = [],
    specialInstructions = ''
  ) => {
    const modDelta = selectedModifiers.reduce((acc, m) => acc + m.priceDelta, 0);
    const unitPrice = item.price + modDelta;

    const modifierKey = selectedModifiers
      .map((m) => m.optionId)
      .sort()
      .join('-');
    const cartItemId = `${item.id}_${modifierKey}_${specialInstructions ? encodeURIComponent(specialInstructions) : 'none'}`;

    setCartItems((prev) => {
      const existingIndex = prev.findIndex((c) => c.cartItemId === cartItemId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [
        ...prev,
        {
          cartItemId,
          item,
          quantity,
          selectedModifiers,
          specialInstructions,
          totalUnitPrice: unitPrice,
          prepTimeMinutes: item.prepTimeMinutes || 12,
        },
      ];
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((i) => (i.cartItemId === cartItemId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
    setCouponError(null);
    setRedeemedPoints(0);
  };

  const subtotal = cartItems.reduce((acc, i) => acc + i.totalUnitPrice * i.quantity, 0);

  // Validate coupon whenever subtotal changes
  useEffect(() => {
    if (appliedCoupon) {
      const result = dataService.validateCoupon(appliedCoupon.code, subtotal);
      if (!result.valid) {
        setCouponError(result.error || 'Coupon no longer valid for this subtotal');
      } else {
        setCouponError(null);
      }
    }
  }, [subtotal, appliedCoupon]);

  const applyCoupon = (code: string): boolean => {
    setCouponError(null);
    const result = dataService.validateCoupon(code, subtotal);
    if (!result.valid) {
      setCouponError(result.error || 'Invalid promo code');
      return false;
    }
    setAppliedCoupon(result.offer || null);
    return true;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  let discountAmount = 0;
  if (appliedCoupon && !couponError) {
    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = Math.round((subtotal * appliedCoupon.discountValue) / 100);
      if (appliedCoupon.maxDiscount && discountAmount > appliedCoupon.maxDiscount) {
        discountAmount = appliedCoupon.maxDiscount;
      }
    } else {
      discountAmount = appliedCoupon.discountValue;
    }
  }

  const loyaltyDiscountAmount = Math.min(
    Math.round(redeemedPoints * (settings.loyaltyRedeemValue || 1)),
    Math.max(0, subtotal - discountAmount)
  );

  const taxableAmount = Math.max(0, subtotal - discountAmount - loyaltyDiscountAmount);
  const taxAmount = Math.round((taxableAmount * (settings.taxPercentage || 5)) / 100);
  const cgstAmount = Math.round(taxAmount / 2);
  const sgstAmount = taxAmount - cgstAmount;

  const serviceChargeAmount =
    orderType === 'dineIn' ? Math.round((subtotal * (settings.serviceChargePercentage || 5)) / 100) : 0;

  const packagingFeeAmount =
    orderType === 'takeaway' || orderType === 'delivery' ? settings.packagingFee || 20 : 0;

  const deliveryFeeAmount =
    orderType === 'delivery' && subtotal < (settings.freeDeliveryThreshold || 799)
      ? settings.deliveryFee || 40
      : 0;

  const grandTotal = Math.max(
    0,
    taxableAmount + taxAmount + serviceChargeAmount + packagingFeeAmount + deliveryFeeAmount
  );
  const totalItemCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  const { dishTimings, overallEstimatedTime } = dataService.calculateDishTimings(cartItems, orderType);

  // Format pre-filled WhatsApp Order Link
  const buildWhatsAppOrderUrl = (): string => {
    const rawNumber = (settings.whatsappNumber || '919876543210').replace(/[^0-9]/g, '');

    const lines: string[] = [
      `*NEW ORDER - ${settings.name.toUpperCase()}*`,
      `---------------------------------`,
      `*Customer:* ${customerName || 'Guest'} (${customerPhone || 'Not provided'})`,
      `*Order Type:* ${orderType.toUpperCase()}`,
    ];

    if (orderType === 'dineIn') {
      lines.push(`*Table Number:* Table ${tableNumber || 1}`);
    } else if (orderType === 'delivery') {
      lines.push(`*Delivery Address:* ${deliveryAddress || 'Not specified'}`);
    }

    lines.push(`---------------------------------`);
    lines.push(`*ITEMS ORDERED:*`);

    cartItems.forEach((ci, idx) => {
      let itemLine = `${idx + 1}. ${ci.item.title} x ${ci.quantity} - ${formatPrice(ci.totalUnitPrice * ci.quantity)}`;
      if (ci.selectedModifiers.length > 0) {
        const mods = ci.selectedModifiers.map((m) => m.optionName).join(', ');
        itemLine += `\n   ↳ _Options: ${mods}_`;
      }
      if (ci.specialInstructions) {
        itemLine += `\n   ↳ _Note: ${ci.specialInstructions}_`;
      }
      lines.push(itemLine);
    });

    lines.push(`---------------------------------`);
    lines.push(`*Subtotal:* ${formatPrice(subtotal)}`);
    if (discountAmount > 0) {
      lines.push(`*Discount (${appliedCoupon?.code}):* -${formatPrice(discountAmount)}`);
    }
    if (loyaltyDiscountAmount > 0) {
      lines.push(`*Loyalty Points:* -${formatPrice(loyaltyDiscountAmount)}`);
    }
    lines.push(`*CGST (2.5%):* ${formatPrice(cgstAmount)}`);
    lines.push(`*SGST (2.5%):* ${formatPrice(sgstAmount)}`);
    if (serviceChargeAmount > 0) {
      lines.push(`*Service Charge (${settings.serviceChargePercentage}%):* ${formatPrice(serviceChargeAmount)}`);
    }
    if (packagingFeeAmount > 0) {
      lines.push(`*Packaging Charge:* ${formatPrice(packagingFeeAmount)}`);
    }
    if (deliveryFeeAmount > 0) {
      lines.push(`*Delivery Fee:* ${formatPrice(deliveryFeeAmount)}`);
    }
    lines.push(`*TOTAL PAYABLE:* ${formatPrice(grandTotal)}`);
    lines.push(`*Est. Ready / Served By:* ${overallEstimatedTime}`);
    lines.push(`---------------------------------`);
    lines.push(`Please confirm and process this order. Thank you!`);

    const fullMessage = lines.join('\n');
    return `https://wa.me/${rawNumber}?text=${encodeURIComponent(fullMessage)}`;
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
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
        totalItemCount,
        buildWhatsAppOrderUrl,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
};
