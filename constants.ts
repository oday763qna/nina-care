
import { ThemePreset } from './types';

export const THEME_PRESETS: ThemePreset[] = [
  { 
    id: 'default', 
    name: 'الوضع الافتراضي (نينا الوردي)', 
    key: 'default', 
    primaryColor: '#db2777', 
    secondaryColor: '#fff5f7', 
    bannerText: 'منتجات العناية والجمال المختارة',
    accentIcon: 'Heart',
    overlayType: 'hearts',
    welcomeMessage: 'مرحباً بكِ في عالم نينا كير'
  },
  { 
    id: 'ramadan', 
    name: 'شهر رمضان المبارك', 
    key: 'ramadan', 
    primaryColor: '#7c3aed', 
    secondaryColor: '#f5f3ff', 
    bannerText: 'رمضان كريم - عروض الخير',
    accentIcon: 'Moon',
    overlayType: 'lanterns',
    welcomeMessage: 'مبارك عليكم الشهر الفضيل'
  },
  { 
    id: 'eid_fitr', 
    name: 'عيد الفطر السعيد', 
    key: 'eid_fitr', 
    primaryColor: '#059669', 
    secondaryColor: '#ecfdf5', 
    bannerText: 'عيدكم مبارك - تألقي في العيد',
    accentIcon: 'Sparkles',
    overlayType: 'sparkles',
    welcomeMessage: 'كل عام وأنتم بخير'
  },
  { 
    id: 'eid_adha', 
    name: 'عيد الأضحى المبارك', 
    key: 'eid_adha', 
    primaryColor: '#b45309', 
    secondaryColor: '#fffbeb', 
    bannerText: 'أضحى مبارك - أجمل الهدايا',
    accentIcon: 'Sun',
    overlayType: 'stars',
    welcomeMessage: 'أضحى مبارك وعساكم من عواده'
  },
  { 
    id: 'christmas', 
    name: 'أجواء الكريسماس', 
    key: 'christmas', 
    primaryColor: '#dc2626', 
    secondaryColor: '#fef2f2', 
    bannerText: 'هدايا الموسم - عروض الشتاء',
    accentIcon: 'Gift',
    overlayType: 'snow',
    welcomeMessage: 'أجواء دافئة وعروض مميزة'
  },
  { 
    id: 'new_year', 
    name: 'رأس السنة الميلادية', 
    key: 'new_year', 
    primaryColor: '#1e293b', 
    secondaryColor: '#f8fafc', 
    bannerText: 'سنة سعيدة - تخفيضات 2026',
    accentIcon: 'Sparkles',
    overlayType: 'sparkles',
    welcomeMessage: 'انطلاقة جديدة لجمالكِ'
  },
  { 
    id: 'black_friday', 
    name: 'الجمعة البيضاء', 
    key: 'black_friday', 
    primaryColor: '#111827', 
    secondaryColor: '#f9fafb', 
    bannerText: 'تخفيضات هائلة - الجمعة البيضاء',
    accentIcon: 'Flame',
    overlayType: 'stars',
    welcomeMessage: 'أكبر عروض السنة بدأت الآن'
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
