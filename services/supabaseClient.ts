import { createClient } from '@supabase/supabase-js';

// دالة لجلب متغيرات البيئة بأمان لتجنب خطأ "undefined"
const getEnvVar = (key: string): string => {
  try {
    // 1. محاولة الجلب من نظام Vite (import.meta.env)
    const viteEnv = (import.meta as any).env;
    if (viteEnv && viteEnv[key]) {
      return viteEnv[key];
    }

    // 2. محاولة الجلب من نظام Node/Global process (process.env)
    if (typeof process !== 'undefined' && (process as any).env && (process as any).env[key]) {
      return (process as any).env[key];
    }
  } catch (error) {
    console.warn(`فشل الوصول إلى متغير البيئة: ${key}`, error);
  }
  return '';
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

// إذا لم تكن المفاتيح موجودة، سنستخدم قيماً فارغة لمنع انهيار التطبيق بالكامل
// وسنظهر تحذيراً في وحدة التحكم (Console) للمطور
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "خطأ في الاتصال بقاعدة البيانات: مفاتيح Supabase غير معرفة.\n" +
    "يرجى التأكد من إضافة VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY في إعدادات البيئة (Environment Variables)."
  );
}

// تصدير العميل مع قيم افتراضية لمنع توقف التطبيق (White Screen)
export const supabase = createClient(
  supabaseUrl || 'https://missing-url.supabase.co', 
  supabaseAnonKey || 'missing-key'
);