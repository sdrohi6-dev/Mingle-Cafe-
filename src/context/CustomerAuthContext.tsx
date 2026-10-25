import React, { createContext, useContext, useEffect, useState } from 'react';
import { Customer } from '../types';
import { dataService } from '../services/dataService';

interface CustomerAuthContextType {
  customer: Customer | null;
  isLoggedIn: boolean;
  login: (phone: string, name?: string) => Promise<boolean>;
  logout: () => void;
  toggleFavorite: (itemId: string) => void;
  isFavorite: (itemId: string) => boolean;
  saveTasteProfile: (profile: NonNullable<Customer['tasteProfile']>) => void;
  redeemPointsForDiscount: (points: number) => boolean;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | null>(null);

export const CustomerAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customer, setCustomer] = useState<Customer | null>(() => {
    if (typeof window !== 'undefined') {
      const savedPhone = localStorage.getItem('cafeflow_logged_in_phone');
      if (savedPhone) {
        return dataService.getCustomer(savedPhone) || null;
      }
    }
    return null;
  });

  useEffect(() => {
    const unsub = dataService.subscribe('cafeflow_customers', () => {
      if (customer?.phone) {
        setCustomer(dataService.getCustomer(customer.phone) || null);
      }
    });
    return unsub;
  }, [customer?.phone]);

  const login = async (phone: string, name = 'Guest'): Promise<boolean> => {
    const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
    if (cleanPhone.length < 10) return false;

    let cust = dataService.getCustomer(cleanPhone);
    if (!cust) {
      cust = {
        id: `cust_${Date.now()}`,
        phone: cleanPhone,
        name,
        loyaltyPoints: 100, // 100 Welcome bonus points
        tier: 'Bronze',
        favoriteItemIds: [],
        totalSpent: 0,
        ordersCount: 0,
        createdAt: new Date().toISOString(),
      };
      dataService.saveCustomerProfile(cust);
    }

    setCustomer(cust);
    localStorage.setItem('cafeflow_logged_in_phone', cleanPhone);
    return true;
  };

  const logout = () => {
    setCustomer(null);
    localStorage.removeItem('cafeflow_logged_in_phone');
  };

  const toggleFavorite = (itemId: string) => {
    if (!customer) return;
    const favorites = [...customer.favoriteItemIds];
    const index = favorites.indexOf(itemId);
    if (index >= 0) {
      favorites.splice(index, 1);
    } else {
      favorites.push(itemId);
    }
    const updated = { ...customer, favoriteItemIds: favorites };
    setCustomer(updated);
    dataService.saveCustomerProfile(updated);
  };

  const isFavorite = (itemId: string): boolean => {
    return !!customer?.favoriteItemIds.includes(itemId);
  };

  const saveTasteProfile = (profile: NonNullable<Customer['tasteProfile']>) => {
    if (!customer) return;
    const updated = { ...customer, tasteProfile: profile };
    setCustomer(updated);
    dataService.saveCustomerProfile(updated);
  };

  const redeemPointsForDiscount = (points: number): boolean => {
    if (!customer || customer.loyaltyPoints < points) return false;
    dataService.adjustCustomerPoints(customer.phone, -points);
    return true;
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customer,
        isLoggedIn: !!customer,
        login,
        logout,
        toggleFavorite,
        isFavorite,
        saveTasteProfile,
        redeemPointsForDiscount,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = (): CustomerAuthContextType => {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return ctx;
};
