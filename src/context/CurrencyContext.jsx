import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const CurrencyContext = createContext({
  currencySymbol: '₹',
  storeCurrency: 'INR'
});

export const useCurrency = () => useContext(CurrencyContext);

const getSymbol = (currency) => {
  switch (currency) {
    case 'USD': return '$';
    case 'EUR': return '€';
    case 'GBP': return '£';
    case 'INR': return '₹';
    default: return '₹';
  }
};

export const CurrencyProvider = ({ children }) => {
  const [storeCurrency, setStoreCurrency] = useState('INR');
  const [currencySymbol, setCurrencySymbol] = useState('₹');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get('/api/settings/public');
        if (res.data.success && res.data.settings?.storeCurrency) {
          const curr = res.data.settings.storeCurrency;
          setStoreCurrency(curr);
          setCurrencySymbol(getSymbol(curr));
        }
      } catch (error) {
        console.error('Failed to fetch currency settings:', error);
      }
    };
    fetchSettings();
  }, []);

  return (
    <CurrencyContext.Provider value={{ storeCurrency, currencySymbol }}>
      {children}
    </CurrencyContext.Provider>
  );
};
