import { ThemePreset } from './types';

export const THEME_PRESETS: ThemePreset[] = [
  { 
    id: 'default', 
    name: 'الوضع الافتراضي (وردي)', 
    key: 'default', 
    primaryColor: '#db2777', 
    secondaryColor: '#fff5f7', 
    bannerText: 'شاهد أفضل المنتجات',
    accentIcon: 'Heart'
  },
  { 
    id: 'eid_fitr', 
    name: 'عيد الفطر', 
    key: 'eid_fitr', 
    primaryColor: '#059669', 
    secondaryColor: '#ecfdf5', 
    bannerText: 'مبارك عليكم العيد - عروض عيد الفطر السعيد',
    accentIcon: 'Moon'
  },
  { 
    id: 'eid_adha', 
    name: 'عيد الأضحى', 
    key: 'eid_adha', 
    primaryColor: '#065f46', 
    secondaryColor: '#f0fdf4', 
    bannerText: 'أضحى مبارك - خصومات عيد الأضحى الكبرى',
    accentIcon: 'Star'
  },
  { 
    id: 'christmas', 
    name: 'عيد الميلاد', 
    key: 'christmas', 
    primaryColor: '#dc2626', 
    secondaryColor: '#fef2f2', 
    bannerText: 'ميلاد مجيد - عروض الموسم الشتوي',
    accentIcon: 'Snowflake'
  },
  { 
    id: 'new_year', 
    name: 'رأس السنة', 
    key: 'new_year', 
    primaryColor: '#b45309', 
    secondaryColor: '#fffbeb', 
    bannerText: 'سنة سعيدة 2026 - عروض بداية العام',
    accentIcon: 'Sparkles'
  },
  { 
    id: 'black_friday', 
    name: 'الجمعة السوداء', 
    key: 'black_friday', 
    primaryColor: '#111827', 
    secondaryColor: '#f9fafb', 
    bannerText: 'الجمعة البيضاء - تخفيضات هائلة لفترة محدودة',
    accentIcon: 'Flame'
  }
];

export const INITIAL_ADS = [
  'https://i.imgur.com/9eBXADa.jpeg',
  'https://i.imgur.com/tGM1wB5.jpeg',
  'https://i.imgur.com/5tKCMdj.jpeg',
  'https://i.imgur.com/PMxat6q.jpeg'
];

export const DEFAULT_SETTINGS = {
  whatsappNumber: '972598578893',
  instagramUrl: 'https://www.instagram.com/nina_care33?igsh=MXBkejVrN3o0NGxtcA==',
  adminPassword: '200820102026',
  productMgmtPassword: '2008',
  deliveryTemplate: 'مرحباً، تم قبول طلبك رقم {ORDER_ID} من Nino Care. الإجمالي الكلي شامل التوصيل: {TOTAL} شيكل. سيصلك خلال يوم إلى يومين. شكراً لك!',
  activeThemeId: 'default'
};
