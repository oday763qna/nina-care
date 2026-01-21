import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, 
  Settings as SettingsIcon, 
  Package, 
  BarChart3, 
  ShoppingCart,
  Palette,
  Layout,
  Image as ImageIcon,
  UserCheck,
  Phone,
  Instagram,
  Lock,
  Zap,
  Globe,
  Bell
} from 'lucide-react';
import { Product, Category, Settings, OrderItem, ThemePreset } from './types';
import { dataService } from './services/dataService';
import { THEME_PRESETS, DEFAULT_SETTINGS } from './constants';
import { supabase } from './services/supabaseClient';

// Pages
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderStatusPage from './pages/OrderStatusPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import AdminSettings from './pages/AdminSettings';
import AdminAds from './pages/AdminAds';
import AdminThemes from './pages/AdminThemes';

interface AppContextType {
  cart: OrderItem[];
  addToCart: (product: Product, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  settings: Settings;
  categories: Category[];
  products: Product[];
  refreshData: () => Promise<void>;
  activeTheme: ThemePreset;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | null>(null);
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

const App: React.FC = () => {
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const activeTheme = THEME_PRESETS.find(t => t.id === settings.activeThemeId) || THEME_PRESETS[0];

  const refreshData = async () => {
    try {
      const [p, c, s] = await Promise.all([
        dataService.getProducts(),
        dataService.getCategories(),
        dataService.getSettings()
      ]);
      setProducts(p);
      setCategories(c);
      if (s) setSettings(s);
    } catch (err) {
      console.error("خطأ في مزامنة البيانات:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
    const savedCart = localStorage.getItem('nina_cart');
    if (savedCart) setCart(JSON.parse(savedCart));

    // القناة المركزية للمزامنة الفورية (Real-time Broadcast)
    // أي تعديل في أي جهاز يظهر فوراً في الأجهزة الأخرى
    const channel = supabase
      .channel('nina-sync-all')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => refreshData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => refreshData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, () => refreshData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ads' }, () => refreshData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => refreshData())
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') console.log('متصل بنظام المزامنة اللحظية');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('nina_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', activeTheme.primaryColor);
    document.documentElement.style.setProperty('--secondary-color', activeTheme.secondaryColor);
    document.body.style.backgroundColor = activeTheme.secondaryColor;
  }, [activeTheme]);

  const addToCart = (product: Product, qty = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => item.productId === product.id ? { ...item, qty: item.qty + qty } : item);
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        price: product.discount.active ? product.price * (1 - product.discount.percent / 100) : product.price,
        qty,
        image: product.images[0]
      }];
    });
  };

  const removeFromCart = (productId: string) => setCart(prev => prev.filter(item => item.productId !== productId));
  const updateCartQty = (productId: string, qty: number) => {
    if (qty <= 0) { removeFromCart(productId); return; }
    setCart(prev => prev.map(item => item.productId === productId ? { ...item, qty } : item));
  };
  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-pink-500"></div>
    </div>
  );

  return (
    <AppContext.Provider value={{ 
      cart, addToCart, removeFromCart, updateCartQty, clearCart, 
      settings, categories, products, refreshData, activeTheme, isLoading
    }}>
      <HashRouter>
        <div className="min-h-screen flex flex-col font-cairo overflow-x-hidden">
          <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
              <Link to="/" className="flex items-center gap-3">
                <img src="https://i.imgur.com/Wm6GITt.png" className="h-12 w-12 rounded-full border-2 border-pink-500 shadow-sm" />
                <span className="text-2xl font-bold pink-primary tracking-tight">Nino Care</span>
              </Link>
              <div className="flex items-center gap-4">
                <Link to="/cart" className="relative p-3 bg-pink-50 rounded-2xl text-pink-600 hover:bg-pink-100 transition-all border border-pink-100">
                  <ShoppingCart size={24} />
                  {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-[10px] w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-md font-bold">{cartCount}</span>}
                </Link>
              </div>
            </div>
          </header>

          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-status/:id" element={<OrderStatusPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin/*" element={<AdminLayout />} />
            </Routes>
          </main>

          {/* Admin Point - النقطة الذكية للدخول */}
          <Link 
            to="/admin/login" 
            className="fixed bottom-4 right-4 w-4 h-4 bg-pink-500/10 rounded-full hover:bg-pink-500/80 hover:w-8 hover:h-8 hover:shadow-lg hover:shadow-pink-200 transition-all z-[9999] cursor-pointer flex items-center justify-center overflow-hidden text-[0px] hover:text-[10px] text-white font-bold"
            title="لوحة التحكم"
          >ADMIN</Link>

          <footer className="bg-white border-t py-12 px-4 mt-20">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-right">
              <div>
                <h3 className="text-xl font-bold mb-4 pink-primary">Nino Care</h3>
                <p className="text-gray-500 text-sm leading-relaxed">متجرك المفضل لمنتجات العناية والجمال. نوفر لك أفضل الماركات العالمية والمحلية بجودة عالية وأسعار منافسة.</p>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-bold">روابط سريعة</h3>
                <div className="flex flex-col gap-2 text-gray-400">
                  <Link to="/" className="hover:text-pink-600 transition-colors">الرئيسية</Link>
                  <Link to="/cart" className="hover:text-pink-600 transition-colors">سلة المشتريات</Link>
                  <Link to="/admin/login" className="hover:text-pink-600 transition-colors flex items-center justify-center md:justify-start gap-2"><Lock size={14}/> دخول الإدارة</Link>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-bold">تواصل معنا</h3>
                <div className="flex justify-center md:justify-start gap-4">
                  <a href={`https://wa.me/${settings.whatsappNumber}`} className="p-3 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-all"><Phone size={20} /></a>
                  <a href={settings.instagramUrl} target="_blank" className="p-3 bg-pink-50 text-pink-600 rounded-full hover:bg-pink-100 transition-all"><Instagram size={20} /></a>
                </div>
                <p className="text-xs text-gray-300">جميع الحقوق محفوظة &copy; 2026 Nino Care</p>
              </div>
            </div>
          </footer>
        </div>
      </HashRouter>
    </AppContext.Provider>
  );
};

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const isAuth = sessionStorage.getItem('admin_session') === 'true';
  
  if (!isAuth && location.pathname !== '/admin/login') return <AdminLoginPage />;

  const navItems = [
    { to: "/admin", label: "الرئيسية", icon: BarChart3 },
    { to: "/admin/products", label: "المنتجات", icon: Package },
    { to: "/admin/orders", label: "الطلبات", icon: ShoppingBag },
    { to: "/admin/ads", label: "الإعلانات", icon: ImageIcon },
    { to: "/admin/themes", label: "الثيمات", icon: Palette },
    { to: "/admin/settings", label: "الإعدادات", icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row rtl font-cairo">
      <aside className="w-full lg:w-72 bg-white border-l shadow-xl z-40 lg:sticky lg:top-20 lg:h-[calc(100vh-80px)] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center gap-4 mb-12 pb-6 border-b border-pink-50">
            <div className="p-3 pink-primary-bg text-white rounded-2xl shadow-lg shadow-pink-200">
              <UserCheck size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">إدارة نينو</h2>
              <p className="text-[10px] text-green-500 font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                مزامنة حية
              </p>
            </div>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to || (item.to === "/admin" && location.pathname === "/admin/");
              return (
                <Link 
                  key={item.to}
                  to={item.to} 
                  className={`flex items-center gap-4 p-4 rounded-2xl font-bold transition-all duration-300 ${isActive ? 'pink-primary-bg text-white shadow-lg shadow-pink-100 translate-x-1' : 'text-gray-400 hover:bg-pink-50 hover:text-pink-600'}`}
                >
                  <Icon size={22} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          
          <div className="mt-16 p-6 bg-pink-50/50 rounded-[32px] border border-pink-100 text-center">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-pink-100">
               <Globe size={18} className="text-pink-400 mx-auto" />
            </div>
            <p className="text-[10px] text-pink-600 font-bold mb-4 uppercase">نظام مشفر ومزامن</p>
            <button 
              onClick={() => { sessionStorage.removeItem('admin_session'); window.location.hash = '/admin/login'; }}
              className="w-full py-3 bg-white text-red-500 rounded-xl font-bold text-sm hover:bg-red-500 hover:text-white transition-all shadow-sm border border-red-50"
            >
              خروج
            </button>
          </div>
        </div>
      </aside>
      
      <main className="flex-1 p-4 lg:p-10 overflow-x-hidden">
        <div className="max-w-6xl mx-auto">
          <Routes>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="ads" element={<AdminAds />} />
            <Route path="themes" element={<AdminThemes />} />
            <Route path="settings" element={<AdminSettings />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default App;