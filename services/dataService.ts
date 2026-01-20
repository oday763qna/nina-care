
import { Product, Category, Order, Ad, Settings, OrderStatus } from '../types';
import { DEFAULT_SETTINGS, INITIAL_ADS } from '../constants';

const STORAGE_KEYS = {
  PRODUCTS: 'nina_products',
  CATEGORIES: 'nina_categories',
  ORDERS: 'nina_orders',
  ADS: 'nina_ads',
  SETTINGS: 'nina_settings'
};

export const dataService = {
  getProducts: (): Product[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return data ? JSON.parse(data) : [];
  },
  saveProducts: (products: Product[]) => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },
  getCategories: (): Category[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return data ? JSON.parse(data) : [{ id: '1', name: 'جميع المنتجات' }];
  },
  saveCategories: (categories: Category[]) => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  },
  getOrders: (): Order[] => {
    const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return data ? JSON.parse(data) : [];
  },
  saveOrders: (orders: Order[]) => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  },
  getSettings: (): Settings => {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : DEFAULT_SETTINGS;
  },
  saveSettings: (settings: Settings) => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },
  getAds: (): Ad[] => {
    const data = localStorage.getItem(STORAGE_KEYS.ADS);
    if (!data) {
      const initial = INITIAL_ADS.map((url, i) => ({ id: String(i), imageUrl: url, active: true }));
      localStorage.setItem(STORAGE_KEYS.ADS, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  },
  saveAds: (ads: Ad[]) => {
    localStorage.setItem(STORAGE_KEYS.ADS, JSON.stringify(ads));
  }
};
