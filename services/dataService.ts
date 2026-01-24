
import { supabase } from './supabaseClient';
import { Product, Category, Order, Ad, Settings, User } from '../types';

export const dataService = {
  // المستخدمين والحماية
  registerUser: async (username: string, password: string, fullName: string): Promise<User> => {
    const { data: existing } = await supabase.from('users').select('username').eq('username', username).maybeSingle();
    if (existing) throw new Error("اسم المستخدم موجود مسبقاً");

    const createdAt = Date.now();
    const { error } = await supabase.from('users').insert({
      username: username.toLowerCase(),
      password: password, // ملاحظة: يفضل تشفيرها في المستقبل
      full_name: fullName,
      created_at: createdAt
    });
    if (error) throw error;
    return { username: username.toLowerCase(), fullName, createdAt };
  },

  loginUser: async (username: string, password: string): Promise<User> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username.toLowerCase())
      .eq('password', password)
      .maybeSingle();
    
    if (error || !data) throw new Error("خطأ في اسم المستخدم أو كلمة المرور");
    return { 
      username: data.username, 
      fullName: data.full_name,
      createdAt: data.created_at || Date.now()
    } as User;
  },

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

  // التصنيفات
  getCategories: async (): Promise<Category[]> => {
    try {
      const { data, error } = await supabase.from('categories').select('*').order('name', { ascending: true });
      if (error) throw error;
      return data || [];
    } catch (e) {
      return [];
    }
  },
  addCategory: async (category: Category) => {
    const { error } = await supabase.from('categories').insert(category);
    if (error) throw error;
  },
  deleteCategory: async (id: string) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
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
    const { error } = await supabase.from('orders').update({ 
      status: status, 
      cancelReason: reason || "" 
    }).eq('id', id);
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
