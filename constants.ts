import { ThemePreset } from './types';

export const THEME_PRESETS: ThemePreset[] = [
  { 
    id: 'default', 
    name: 'الوضع الافتراضي (وردي)', 
    key: 'default', 
    primaryColor: '#db2777', 
    secondaryColor: '#fff5f7', 
    bannerText: 'منتجات العناية والجمال المختارة',
    accentIcon: 'Heart'
  },
  { 
    id: 'eid_fitr', 
    name: 'عيد الفطر', 
    key: 'eid_fitr', 
    primaryColor: '#059669', 
    secondaryColor: '#ecfdf5', 
    bannerText: 'مبارك عليكم العيد - عروض حصرية',
    accentIcon: 'Moon'
  },
  { 
    id: 'black_friday', 
    name: 'الجمعة السوداء', 
    key: 'black_friday', 
    primaryColor: '#111827', 
    secondaryColor: '#f9fafb', 
    bannerText: 'تخفيضات هائلة - الجمعة البيضاء',
    accentIcon: 'Flame'
  }
];

export const INITIAL_ADS = [
  'https://i.imgur.com/9eBXADa.jpeg',
  'https://i.imgur.com/tGM1wB5.jpeg'
];

export const DEFAULT_SETTINGS = {
  whatsappNumber: '972598578893',
  instagramUrl: 'https://www.instagram.com/nina_care33?igsh=MXBkejVrN3o0NGxtcA==',
  adminPassword: '200820102026',
  productMgmtPassword: '2008',
  deliveryTemplate: 'مرحباً، تم قبول طلبك رقم {ORDER_ID} من نينو كير. الإجمالي شامل التوصيل: {TOTAL} شيكل. سيصلك قريباً. شكراً لك!',
  activeThemeId: 'default'
};