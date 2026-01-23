
import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, 
  Settings as SettingsIcon, 
  Package, 
  BarChart3, 
  ShoppingCart,
  Palette,
  Image as ImageIcon,
  UserCheck,
  Phone,
  Instagram,
  Lock
} from 'lucide-react';
import { Product, Category, Settings, OrderItem, ThemePreset, Ad } from './types';
import { dataService } from './services/dataService';
import { THEME_PRESETS, DEFAULT_SETTINGS } from './constants';
import { supabase } from './services/supabaseClient';

// Import page components
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderStatusPage from './pages/OrderStatusPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import AdminAds from './pages/AdminAds';
import AdminThemes from './pages/AdminThemes';
import AdminSettings from './pages/AdminSettings';
import AdminLoginPage from './pages/AdminLoginPage';

interface AppContextType {
  cart: OrderItem[];
  addToCart: (product: Product, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  settings: Settings;
  categories: Category[];
  products: Product[];
  ads: Ad[];
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
  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const activeTheme = THEME_PRESETS.find(t => t.id === settings.activeThemeId) || THEME_PRESETS[0];

  const refreshData = async () => {
    try {
      const [p, c, s, a] = await Promise.all([
        dataService.getProducts(),
        dataService.getCategories(),
        dataService.getSettings(),
        dataService.getAds()
      ]);
      setProducts(p || []);
      setCategories(c || []);
      setAds(a || []);
      if (s) setSettings(s);
    } catch (err) {
      console.error("فشل المزامنة:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
    const savedCart = localStorage.getItem('nina_cart_v3');
    if (savedCart) setCart(JSON.parse(savedCart));

    const channel = supabase
      .channel('public-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => refreshData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ads' }, () => refreshData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, () => refreshData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => refreshData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('nina_cart_v3', JSON.stringify(cart));
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

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-pink-500"></div>
        <p className="text-pink-500 font-bold animate-pulse text-sm">Nino Care...</p>
      </div>
    </div>
  );

  return (
    <AppContext.Provider value={{ 
      cart, addToCart, removeFromCart, updateCartQty, clearCart, 
      settings, categories, products, ads, refreshData, activeTheme, isLoading
    }}>
      <HashRouter>
        <div className="min-h-screen flex flex-col font-cairo overflow-x-hidden selection:bg-pink-100 selection:text-pink-600">
          <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-pink-50">
            <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
              <Link to="/" className="flex items-center gap-3 active:scale-95 transition-transform">
                <img src="https://i.imgur.com/Wm6GITt.png" className="h-12 w-12 rounded-full border-2 border-pink-500 shadow-sm" alt="Nina Care" />
                <span className="text-2xl font-black pink-primary tracking-tight">Nina Care</span>
              </Link>
              <div className="flex items-center gap-4">
                <Link to="/cart" className="relative p-3 bg-pink-50 rounded-2xl text-pink-600 hover:bg-pink-100 transition-all border border-pink-100 group">
                  <ShoppingCart size={24} className="group-hover:rotate-12 transition-transform" />
                  {cart.length > 0 && <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-[10px] w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-md font-bold animate-bounce">{cart.length}</span>}
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

          {/* النقطة السرية في الزاوية اليمنى السفلية */}
          <Link 
            to="/admin/login" 
            className="fixed bottom-0 right-0 w-[4px] h-[4px] bg-pink-500/10 rounded-full hover:bg-pink-600 hover:w-8 hover:h-8 transition-all duration-700 z-[9999] flex items-center justify-center group opacity-20 hover:opacity-100"
          >
            <Lock size={12} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>

          <footer className="bg-white border-t border-pink-50 py-16 px-4 mt-20">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-right text-gray-400">
               <div>
                <h3 className="text-xl font-black mb-4 pink-primary">Nina Care</h3>
                <p className="text-sm">متجر التجميل الأول - جودة استثنائية.</p>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-700">تواصل اجتماعي</h3>
                <div className="flex justify-center md:justify-start gap-4">
                  <a href={`https://wa.me/${settings.whatsappNumber}`} target="_blank" className="p-4 bg-green-50 text-green-600 rounded-2xl hover:bg-green-600 hover:text-white transition-all"><Phone size={20} /></a>
                  <a href={settings.instagramUrl} target="_blank" className="p-4 bg-pink-50 text-pink-600 rounded-2xl hover:bg-pink-600 hover:text-white transition-all"><Instagram size={20} /></a>
                </div>
              </div>
              <p className="text-[10px] font-bold mt-4 uppercase">© 2026 Nina Care. Built with Supabase.</p>
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row rtl font-cairo">
      <aside className="w-full lg:w-72 bg-white border-l shadow-xl z-40 lg:sticky lg:top-20 lg:h-[calc(100vh-80px)] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center gap-4 mb-12 pb-6 border-b border-pink-50">
            <div className="p-3 pink-primary-bg text-white rounded-2xl shadow-lg">
              <UserCheck size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold">لوحة التحكم</h2>
            </div>
          </div>
          <nav className="space-y-2">
            {[
              { to: "/admin", label: "الرئيسية", icon: BarChart3 },
              { to: "/admin/products", label: "المنتجات", icon: Package },
              { to: "/admin/orders", label: "الطلبيات", icon: ShoppingBag },
              { to: "/admin/ads", label: "الإعلانات", icon: ImageIcon },
              { to: "/admin/themes", label: "المظهر", icon: Palette },
              { to: "/admin/settings", label: "الإعدادات", icon: SettingsIcon },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to || (item.to === "/admin" && location.pathname === "/admin/");
              return (
                <Link 
                  key={item.to}
                  to={item.to} 
                  className={`flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${isActive ? 'pink-primary-bg text-white shadow-lg' : 'text-gray-400 hover:bg-pink-50 hover:text-pink-600'}`}
                >
                  <Icon size={22} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <button 
            onClick={() => { sessionStorage.removeItem('admin_session'); window.location.hash = '/admin/login'; }}
            className="w-full mt-16 py-3 bg-red-50 text-red-500 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-all"
          >
            خروج
          </button>
        </div>
      </aside>
      <main className="flex-1 p-4 lg:p-10">
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
