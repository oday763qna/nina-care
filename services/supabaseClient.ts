
import { createClient } from '@supabase/supabase-js';

// بيانات مشروع Supabase الخاصة بالعميل
const supabaseUrl = 'https://ntomjveiknykxmjtlrug.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50b21qdmVpa255a3htanRscnVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxNjUxMTYsImV4cCI6MjA4NDc0MTExNn0.SDeMq_3eJ6Y54RyzDOGlbcP7ycphT5umXd-TYUpf50I';

// إنشاء العميل للاتصال بقاعدة البيانات والخدمات السحابية
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// التحقق من حالة الاتصال في وحدة التحكم للمطورين
if (supabaseUrl && supabaseAnonKey) {
  console.log("Nino Care: Connected successfully to Supabase Project [ntomjveiknykxmjtlrug]");
}
