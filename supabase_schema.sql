
-- يرجى تنفيذ هذه الأوامر في SQL Editor الخاص بـ Supabase

-- 1. جدول الفئات
create table if not exists categories (
  id text primary key,
  name text not null
);

-- 2. جدول المنتجات
create table if not exists products (
  id text primary key,
  name text not null,
  description text,
  price float8 not null,
  images text[] default '{}',
  "categoryId" text references categories(id),
  discount jsonb default '{"percent": 0, "active": false}',
  "createdAt" bigint not null
);

-- 3. جدول الإعلانات (البنرات)
create table if not exists ads (
  id text primary key,
  "imageUrl" text not null,
  active boolean default true
);

-- 4. جدول الإعدادات
create table if not exists settings (
  id text primary key default 'global',
  "whatsappNumber" text,
  "instagramUrl" text,
  "adminPassword" text,
  "productMgmtPassword" text,
  "deliveryTemplate" text,
  "activeThemeId" text
);

-- 5. جدول الطلبات
create table if not exists orders (
  id text primary key,
  items jsonb not null,
  totals jsonb not null,
  customer jsonb not null,
  status text not null,
  "cancelReason" text,
  "createdAt" bigint not null
);
