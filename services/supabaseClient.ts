import { createClient } from '@supabase/supabase-js';

// دالة جلب المتغيرات بشكل دفاعي جداً
const getSafeEnv = (key: string): string => {
  try {
    // محاولة الوصول لـ process.env أولاً (شائع في بيئات التطوير والمنصات السحابية)
    if (typeof process !== 'undefined' && process.env && (process.env as any)[key]) {
      return (process.env as any)[key];
    }
    
    // محاولة الوصول لـ import.meta.env (الخاص بـ Vite) بشكل آمن
    const meta = import.meta as any;
    if (meta && meta.env && meta.env[key]) {
      return meta.env[key];
    }
  } catch (e) {
    // تجاهل الأخطاء في حال كان الكود يعمل في بيئة لا تدعم هذه الخصائص
  }
  return '';
};

const supabaseUrl = getSafeEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getSafeEnv('VITE_SUPABASE_ANON_KEY');

// في حال عدم وجود مفاتيح، نستخدم قيم افتراضية لمنع انهيار التطبيق (White Screen)
// ونقوم بطباعة رسالة تنبيه للمطور في الـ Console
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Nino Care: لم يتم العثور على مفاتيح Supabase. يرجى التأكد من إضافة VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY."
  );
}

// إنشاء العميل - نستخدم رابطاً وهمياً صالحاً كبنية في حال غياب الرابط الحقيقي لتجنب الأخطاء الفورية
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);