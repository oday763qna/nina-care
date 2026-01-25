
-- كود إنشاء جداول متجر نينو كير (Nino Care)
-- يرجى نسخ هذا الكود وتشغيله في SQL Editor الخاص بـ Supabase

-- 1. جدول المستخدمين (نظام الحسابات)
CREATE TABLE IF NOT EXISTS users (
  username TEXT PRIMARY KEY,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  created_at BIGINT NOT NULL
);

-- 2. جدول تصنيفات المنتجات (تحديث ليشمل الأقسام الفرعية)
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  "parentId" TEXT REFERENCES categories(id) ON DELETE SET NULL
);

-- 3. جدول المنتجات
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price FLOAT8 NOT NULL,
  images TEXT[] DEFAULT '{}',
  "categoryId" TEXT REFERENCES categories(id),
  discount JSONB DEFAULT '{"percent": 0, "active": false}',
  "createdAt" BIGINT NOT NULL
);

-- 4. جدول إعلانات الواجهة (البنرات)
CREATE TABLE IF NOT EXISTS ads (
  id TEXT PRIMARY KEY,
  "imageUrl" TEXT NOT NULL,
  active BOOLEAN DEFAULT true
);

-- 5. جدول إعدادات المتجر العامة
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY DEFAULT 'global',
  "whatsappNumber" TEXT,
  "instagramUrl" TEXT,
  "adminPassword" TEXT,
  "productMgmtPassword" TEXT,
  "deliveryTemplate" TEXT,
  "activeThemeId" TEXT
);

-- 6. جدول الطلبيات
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  items JSONB NOT NULL,
  totals JSONB NOT NULL,
  customer JSONB NOT NULL,
  status TEXT NOT NULL,
  "cancelReason" TEXT DEFAULT '',
  "createdAt" BIGINT NOT NULL,
  username TEXT REFERENCES users(username)
);

-- إدراج بيانات المسؤول الافتراضي
INSERT INTO users (username, password, full_name, created_at)
VALUES ('odayqutqut55', '200820102026', 'المدير العام', 1700000000000)
ON CONFLICT (username) DO NOTHING;

-- إدراج الإعدادات الافتراضية
INSERT INTO settings (
  id, 
  "whatsappNumber", 
  "instagramUrl", 
  "adminPassword", 
  "productMgmtPassword", 
  "deliveryTemplate", 
  "activeThemeId"
)
VALUES (
  'global', 
  '972598578893', 
  'https://www.instagram.com/nina_care33', 
  '200820102026', 
  '2008', 
  'مرحباً، تم قبول طلبك رقم {ORDER_ID} من نينو كير. الإجمالي شامل التوصيل: {TOTAL} شيكل. سيصلك قريباً. شكراً لك!', 
  'default'
)
ON CONFLICT (id) DO NOTHING;

-- تفعيل ميزة المزامنة اللحظية (Realtime)
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE settings;
ALTER PUBLICATION supabase_realtime ADD TABLE ads;
ALTER PUBLICATION supabase_realtime ADD TABLE categories;
