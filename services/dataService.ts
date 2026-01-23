
import { supabase } from './supabaseClient';
import { Product, Category, Order, Ad, Settings } from '../types';

export const dataService = {
  // المنتجات
  getProducts: async (): Promise<Product[]> => {
    try {
      const { data, error } = await supabase.from('products').select('*').order('createdAt', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error("Error fetching products:", e);
      return [];
    }
  },
  saveProduct: async (product: Product) => {
    const { error } = await supabase.from('products').upsert(product);
    if (error) throw error;
  },
  deleteProduct: async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  },

  // التصنيفات (الفئات) - إدارة مستقلة
  getCategories: async (): Promise<Category[]> => {
    try {
      const { data, error } = await supabase.from('categories').select('*').order('id', { ascending: true });
      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error("Error fetching categories:", e);
      return [];
    }
  },
  saveCategories: async (categories: Category[]) => {
    // نقوم بحذف الفئات القديمة أو تحديثها - هنا نستخدم نظام التبديل الكامل لتبسيط الواجهة للادمن
    // ملاحظة: في Supabase يفضل استخدام upsert لكل فئة على حدة
    const { error } = await supabase.from('categories').upsert(categories);
    if (error) throw error;
  },
  deleteCategory: async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
  },
  addCategory: async (category: Category) => {
    const { error } = await supabase.from('categories').insert(category);
    if (error) throw error;
  },

  // الطلبات
  getOrders: async (): Promise<Order[]> => {
    try {
      const { data, error } = await supabase.from('orders').select('*').order('createdAt', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) {
      return [];
    }
  },
  saveOrders: async (orders: Order[]) => {
    const { error } = await supabase.from('orders').upsert(orders);
    if (error) throw error;
  },
  updateOrderStatus: async (id: string, status: string, reason?: string) => {
    const { error } = await supabase.from('orders').update({ status, cancelReason: reason || "" }).eq('id', id);
    if (error) throw error;
  },

  // الإعدادات
  getSettings: async (): Promise<Settings | null> => {
    try {
      const { data, error } = await supabase.from('settings').select('*').eq('id', 'global').maybeSingle();
      if (error) throw error;
      return data;
    } catch (e) {
      return null;
    }
  },
  saveSettings: async (settings: Settings) => {
    const { error } = await supabase.from('settings').upsert({ id: 'global', ...settings });
    if (error) throw error;
  },

  // الإعلانات
  getAds: async (): Promise<Ad[]> => {
    try {
      const { data, error } = await supabase.from('ads').select('*').order('id', { ascending: false });
      if (error) throw error;
      return data || [];
    } catch (e) {
      return [];
    }
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
