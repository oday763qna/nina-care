
import { supabase } from './supabaseClient';
import { Product, Category, Order, Ad, Settings } from '../types';

export const dataService = {
  // المنتجات
  getProducts: async (): Promise<Product[]> => {
    const { data, error } = await supabase.from('products').select('*').order('createdAt', { ascending: false });
    return error ? [] : data || [];
  },
  saveProduct: async (product: Product) => {
    const { error } = await supabase.from('products').upsert(product);
    if (error) throw error;
  },
  deleteProduct: async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  },

  // التصنيفات
  getCategories: async (): Promise<Category[]> => {
    const { data, error } = await supabase.from('categories').select('*');
    return error ? [] : data || [];
  },
  saveCategories: async (categories: Category[]) => {
    const { error } = await supabase.from('categories').upsert(categories);
    if (error) throw error;
  },

  // الطلبات
  getOrders: async (): Promise<Order[]> => {
    const { data, error } = await supabase.from('orders').select('*').order('createdAt', { ascending: false });
    return error ? [] : data || [];
  },
  saveOrders: async (orders: Order[]) => {
    const { error } = await supabase.from('orders').upsert(orders);
    if (error) throw error;
  },
  updateOrderStatus: async (id: string, status: string, reason?: string) => {
    const { error } = await supabase.from('orders').update({ status, cancelReason: reason }).eq('id', id);
    if (error) throw error;
  },

  // الإعدادات
  getSettings: async (): Promise<Settings | null> => {
    const { data, error } = await supabase.from('settings').select('*').eq('id', 'global').maybeSingle();
    return error ? null : data;
  },
  saveSettings: async (settings: Settings) => {
    const { error } = await supabase.from('settings').upsert({ id: 'global', ...settings });
    if (error) throw error;
  },

  // الإعلانات (البنرات)
  getAds: async (): Promise<Ad[]> => {
    const { data, error } = await supabase.from('ads').select('*').order('id', { ascending: false });
    return error ? [] : data || [];
  },
  saveAds: async (ads: Ad[]) => {
    const { error } = await supabase.from('ads').upsert(ads);
    if (error) throw error;
  },
  deleteAd: async (id: string) => {
    const { error } = await supabase.from('ads').delete().eq('id', id);
    if (error) throw error;
  }
};
