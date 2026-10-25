import React, { createContext, useContext, useEffect, useState } from 'react';
import { CafeSettings } from '../types';
import { dataService } from '../services/dataService';

interface SettingsContextType {
  settings: CafeSettings;
  updateSettings: (newSettings: CafeSettings) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  formatPrice: (amount: number) => string;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<CafeSettings>(() => dataService.getSettings());
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cafeflow_dark_mode') === 'true';
    }
    return false;
  });

  useEffect(() => {
    const unsub = dataService.subscribe('cafeflow_settings', () => {
      setSettings(dataService.getSettings());
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('cafeflow_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('cafeflow_dark_mode', 'false');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const updateSettings = (newSettings: CafeSettings) => {
    dataService.updateSettings(newSettings);
    setSettings(newSettings);
  };

  const formatPrice = (amount: number): string => {
    const symbol = settings.currencySymbol || '₹';
    return `${symbol}${amount.toLocaleString('en-IN')}`;
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        isDarkMode,
        toggleDarkMode,
        formatPrice,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return ctx;
};
