
import { supabase } from './supabaseClient';
import { Product, Category, Order, Ad, Settings } from '../types';

export const dataService = {
  // المنتجات
  getProducts: async (): Promise<Product[]> => {
    const { data, error } = await supabase.from('products').select('*').order('createdAt', { ascending: false });
    if (error) throw error;
    return data || [];
  },
  saveProduct: async (product: Product) => {
    const { error } = await supabase.from('products').upsert(product);
    if (error) throw error;
  },
  // Added plural save method to fix error in AdminProducts.tsx
  saveProducts: async (products: Product[]) => {
    const { error } = await supabase.from('products').upsert(products);
    if (error) throw error;
  },
  deleteProduct: async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  },

  // التصنيفات
  getCategories: async (): Promise<Category[]> => {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) throw error;
    return data || [];
  },
  saveCategory: async (category: Category) => {
    const { error } = await supabase.from('categories').insert(category);
    if (error) throw error;
  },
  // Added plural save method to fix error in AdminProducts.tsx
  saveCategories: async (categories: Category[]) => {
    const { error } = await supabase.from('categories').upsert(categories);
    if (error) throw error;
  },

  // الطلبات
  getOrders: async (): Promise<Order[]> => {
    const { data, error } = await supabase.from('orders').select('*').order('createdAt', { ascending: false });
    if (error) throw error;
    return data || [];
  },
  createOrder: async (order: Order) => {
    const { error } = await supabase.from('orders').insert(order);
    if (error) throw error;
  },
  // Added plural save method to fix error in CheckoutPage.tsx and AdminOrders.tsx
  saveOrders: async (orders: Order[]) => {
    const { error } = await supabase.from('orders').upsert(orders);
    if (error) throw error;
  },
  updateOrderStatus: async (id: string, status: string, reason?: string) => {
    const { error } = await supabase.from('orders').update({ status, cancelReason: reason }).eq('id', id);
    if (error) throw error;
  },

  // الإعدادات والإعلانات
  getSettings: async (): Promise<Settings> => {
    const { data, error } = await supabase.from('settings').select('*').single();
    if (error) throw error;
    return data;
  },
  saveSettings: async (settings: Settings) => {
    const { error } = await supabase.from('settings').update(settings).eq('id', 'global');
    if (error) throw error;
  },
  getAds: async (): Promise<Ad[]> => {
    const { data, error } = await supabase.from('ads').select('*');
    if (error) throw error;
    return data || [];
  },
  // Added plural save method to fix error in AdminAds.tsx
  saveAds: async (ads: Ad[]) => {
    const { error } = await supabase.from('ads').upsert(ads);
    if (error) throw error;
  }
};
