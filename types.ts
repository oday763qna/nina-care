
export enum OrderStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXECUTED = 'executed'
}

export interface User {
  username: string;
  fullName: string;
  createdAt: number;
}

export interface Discount {
  percent: number;
  active: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  categoryId: string;
  discount: Discount;
  createdAt: number;
}

export interface Category {
  id: string;
  name: string;
  parentId?: string; // لتمكين الأقسام الفرعية
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  image: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  totals: {
    subtotal: number;
    deliveryCost: number;
    discountTotal: number;
    grandTotal: number;
  };
  customer: {
    name: string;
    city: string;
    phoneOrWhatsApp: string;
    address: string;
    deliveryArea: string;
  };
  status: OrderStatus;
  cancelReason?: string;
  createdAt: number;
  username?: string;
}

export interface Ad {
  id: string;
  imageUrl: string;
  active: boolean;
}

export interface ThemePreset {
  id: string;
  name: string;
  key: string;
  primaryColor: string;
  secondaryColor: string;
  bannerText: string;
  accentIcon: string;
  overlayType?: 'none' | 'snow' | 'lanterns' | 'sparkles' | 'hearts' | 'stars';
  welcomeMessage?: string;
}

export interface Settings {
  whatsappNumber: string;
  instagramUrl: string;
  adminPassword: string;
  productMgmtPassword: string;
  deliveryTemplate: string;
  activeThemeId: string;
}
