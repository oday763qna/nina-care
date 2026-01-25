
import React, { useState, useEffect, createContext, useContext, useMemo } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
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
  Lock,
  ClipboardList,
  User as UserIcon,
  LogOut,
  CheckCircle,
  XCircle,
  ChevronLeft,
  LayoutGrid,
  Zap
} from 'lucide-react';
import { Product, Category, Settings, OrderItem, ThemePreset, Ad, User, OrderStatus, Order } from './types';
import { dataService } from './services/dataService';
import { THEME_PRESETS, DEFAULT_SETTINGS } from './constants';
import { supabase } from './services/supabaseClient';

import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderStatusPage from './pages/OrderStatusPage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import AdminAds from './pages/AdminAds';
import AdminThemes from './pages/AdminThemes';
import AdminSettings from './pages/AdminSettings';
import ThemeDecorations from './components/ThemeDecorations';

interface Toast {
  message: string;
  type: 'success' | 'error';
  id: number;
}

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
  orders: Order[];
  myOrderIds: string[];
  addOrderId: (id: string) => void;
  removeOrderId: (id: string) => void;
  refreshData: () => Promise<void>;
  activeTheme: ThemePreset;
  isLoading: boolean;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  logout: () => void;
  notify: (message: string, type?: 'success' | 'error') => void;
}

const AppContext = createContext<AppContextType | null>(null);
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

const App: React.FC = () => {
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [myOrderIds, setMyOrderIds] = useState<string[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const activeTheme = useMemo(() => 
    THEME_PRESETS.find(t => t.id === settings.activeThemeId) || THEME_PRESETS[0]
  , [settings.activeThemeId]);

  const refreshData = async () => {
    try {
      const [p, c, s, a, o] = await Promise.all([
        dataService.getProducts(),
        dataService.getCategories(),
        dataService.getSettings(),
        dataService.getAds(),
        dataService.getOrders()
      ]);
      setProducts(p || []);
      setCategories(c || []);
      setAds(a || []);
      setOrders(o || []);
      if (s) setSettings(s);
    } catch (err) {
      console.error("Sync failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
    
    const savedUser = localStorage.getItem('nina_user_v7');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));

    const savedCart = localStorage.getItem('nina_cart_v7');
    if (savedCart) setCart(JSON.parse(savedCart));

    const savedOrders = localStorage.getItem('nina_my_orders_v7');
    if (savedOrders) setMyOrderIds(JSON.parse(savedOrders));

    const channel = supabase
      .channel('nina-global-sync-v9')
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
    if (currentUser) localStorage.setItem('nina_user_v7', JSON.stringify(currentUser));
    else localStorage.removeItem('nina_user_v7');
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('nina_cart_v7', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('nina_my_orders_v7', JSON.stringify(myOrderIds));
  }, [myOrderIds]);

  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', activeTheme.primaryColor);
    document.documentElement.style.setProperty('--secondary-color', activeTheme.secondaryColor);
    document.body.style.backgroundColor = activeTheme.secondaryColor;
  }, [activeTheme]);

  const notify = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { message, type, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const logout = () => {
    setCurrentUser(null);
    setCart([]);
    setMyOrderIds([]);
  };

  const addToCart = (product: Product, qty = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => item.productId === product.id ? { ...item, qty: item.qty + qty } : item);
      }
      const price = product.discount.active ? product.price * (1 - product.discount.percent / 100) : product.price;
      return [...prev, {
        productId: product.id,
        name: product.name,
        price,
        qty,
        image: product.images[0]
      }];
    });
    notify('تم إضافة المنتج إلى السلة بنجاح! لمشاهدة معلومات الطلب اضغطي على السلة 🛒');
  };

  const removeFromCart = (productId: string) => setCart(prev => prev.filter(item => item.productId !== productId));
  const updateCartQty = (productId: string, qty: number) => {
    if (qty <= 0) { removeFromCart(productId); return; }
    setCart(prev => prev.map(item => item.productId === productId ? { ...item, qty } : item));
  };
  const clearCart = () => setCart([]);
  
  const addOrderId = (id: string) => {
    setMyOrderIds(prev => {
      if (prev.includes(id)) return prev;
      return [id, ...prev];
    });
  };

  const removeOrderId = (id: string) => {
    setMyOrderIds(prev => prev.filter(orderId => orderId !== id));
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-pink-500"></div>
        <p className="text-pink-500 font-bold animate-pulse text-xs tracking-widest uppercase">Nino Care Syncing...</p>
      </div>
    </div>
  );

  return (
    <AppContext.Provider value={{ 
      cart, addToCart, removeFromCart, updateCartQty, clearCart, 
      settings, categories, products, ads, orders, myOrderIds, addOrderId, removeOrderId, refreshData, activeTheme, isLoading,
      currentUser, setCurrentUser, logout, notify
    }}>
      <HashRouter>
        <div className="min-h-screen flex flex-col font-cairo overflow-x-hidden relative">
          <ThemeDecorations />
          
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-3 pointer-events-none w-full max-w-sm px-4">
            {toasts.map(toast => (
              <div 
                key={toast.id} 
                className={`flex items-center gap-3 p-4 rounded-3xl shadow-2xl border-2 animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-auto ${
                  toast.type === 'success' ? 'bg-white border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'
                }`}
              >
                {toast.type === 'success' ? <CheckCircle className="shrink-0" /> : <XCircle className="shrink-0" />}
                <p className="text-sm font-black leading-tight">{toast.message}</p>
              </div>
            ))}
          </div>

          <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-pink-50">
            <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
              <Link to="/" className="flex items-center gap-3 active:scale-95 transition-transform">
                <img src="https://i.imgur.com/Wm6GITt.png" className="h-10 w-10 md:h-12 md:w-12 rounded-full border-2 border-pink-500 shadow-sm" alt="Nina Care" />
                <span className="text-xl md:text-2xl font-black pink-primary tracking-tight">Nina Care</span>
              </Link>
              <div className="flex items-center gap-3 md:gap-4">
                {currentUser ? (
                  <div className="hidden md:flex items-center gap-2 bg-pink-50 px-4 py-2 rounded-2xl border border-pink-100">
                    <UserIcon size={18} className="text-pink-500" />
                    <span className="text-sm font-bold text-pink-700">{currentUser.fullName}</span>
                    {currentUser.username === 'odayqutqut55' && <span className="text-[10px] bg-pink-500 text-white px-2 py-0.5 rounded-full font-bold">إدارة</span>}
                  </div>
                ) : (
                  <Link to="/login" className="flex items-center gap-2 text-gray-400 hover:text-pink-600 font-bold text-sm transition-colors">
                    <UserIcon size={20} /> <span className="hidden sm:inline">دخول</span>
                  </Link>
                )}
                
                <Link to="/cart" className="relative p-3 bg-pink-50 rounded-2xl text-pink-600 hover:bg-pink-100 transition-all border border-pink-100 group">
                  <ShoppingCart size={24} className="group-hover:rotate-12 transition-transform" />
                  {cart.length > 0 && <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-[10px] w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-md font-bold animate-bounce">{cart.length}</span>}
                </Link>

                {currentUser && (
                  <button onClick={logout} className="p-3 bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all border border-gray-100">
                    <LogOut size={22} />
                  </button>
                )}
              </div>
            </div>
          </header>

          <main className="flex-grow relative z-10">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-status/:id" element={<OrderStatusPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/admin/*" element={<AdminGuard><AdminLayout /></AdminGuard>} />
            </Routes>
          </main>

          <footer className="bg-white border-t border-pink-50 py-16 px-4 mt-20 relative z-10">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-right">
              <div>
                <h3 className="text-xl font-black mb-4 pink-primary uppercase">Nina Care</h3>
                <p className="text-gray-400 text-sm font-bold">عالم الجمال والعناية المتكامل بين يديك.</p>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-700">تواصل اجتماعي</h3>
                <div className="flex justify-center md:justify-start gap-4">
                  <a href={`https://wa.me/${settings.whatsappNumber}`} target="_blank" className="p-4 bg-green-50 text-green-600 rounded-2xl hover:bg-green-600 hover:text-white transition-all shadow-sm"><Phone size={20} /></a>
                  <a href={settings.instagramUrl} target="_blank" className="p-4 bg-pink-50 text-pink-600 rounded-2xl hover:bg-pink-600 hover:text-white transition-all shadow-sm"><Instagram size={20} /></a>
                </div>
              </div>
              <div className="col-span-full border-t border-gray-100 pt-8 mt-4">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-2">
                  © 2026 Nina Care. Account Security by Oday.
                </p>
                <p className="text-xs font-black text-pink-600 uppercase tracking-widest">
                  Engineered by Nina care
                </p>
              </div>
            </div>
          </footer>
        </div>
      </HashRouter>
    </AppContext.Provider>
  );
};

const AdminGuard: React.FC<{children: React.ReactNode}> = ({children}) => {
  const { currentUser } = useApp();
  if (!currentUser || currentUser.username !== 'odayqutqut55') {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const { orders } = useApp();

  const pendingCount = useMemo(() => 
    orders.filter(o => o.status === OrderStatus.PENDING).length
  , [orders]);

  const menuSections = [
    {
      title: 'العمليات الأساسية',
      items: [
        { to: "/admin", label: "لوحة التحكم", icon: BarChart3 },
        { to: "/admin/orders", label: "طلبات العملاء", icon: ShoppingBag, badge: pendingCount },
      ]
    },
    {
      title: 'إدارة المحتوى',
      items: [
        { to: "/admin/products", label: "المنتجات والأقسام", icon: Package },
        { to: "/admin/ads", label: "بنرات العروض", icon: ImageIcon },
      ]
    },
    {
      title: 'تخصيص النظام',
      items: [
        { to: "/admin/themes", label: "المظهر والمواسم", icon: Palette },
        { to: "/admin/settings", label: "إعدادات المتجر", icon: SettingsIcon },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row rtl font-cairo">
      <aside className="w-full lg:w-80 bg-white border-l shadow-2xl z-40 lg:sticky lg:top-20 lg:h-[calc(100vh-80px)] overflow-y-auto no-scrollbar">
        <div className="p-8">
          <div className="flex items-center gap-4 mb-10 pb-6 border-b border-pink-50">
            <div className="p-3 pink-primary-bg text-white rounded-2xl shadow-lg">
              <UserCheck size={28} />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-800">المدير العام</h2>
              <p className="text-[10px] text-green-500 font-bold tracking-widest uppercase">Oday Auth System</p>
            </div>
          </div>
          
          <div className="space-y-10">
            {menuSections.map((section, idx) => (
              <div key={idx} className="space-y-3">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-4">{section.title}</h3>
                <nav className="space-y-1.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.to || (item.to === "/admin" && location.pathname === "/admin/");
                    return (
                      <Link 
                        key={item.to}
                        to={item.to} 
                        className={`flex items-center gap-4 p-4 rounded-2xl font-bold transition-all relative group ${isActive ? 'bg-pink-600 text-white shadow-xl shadow-pink-100' : 'text-gray-400 hover:bg-pink-50 hover:text-pink-600'}`}
                      >
                        <Icon size={20} className={`${isActive ? 'scale-110' : 'group-hover:rotate-12'} transition-transform`} />
                        <span className="text-sm flex-1">{item.label}</span>
                        {item.badge && item.badge > 0 && (
                          <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse">
                            {item.badge}
                          </span>
                        )}
                        {isActive && <div className="absolute left-3 w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>
          
          <div className="mt-12 p-6 bg-gray-50 rounded-[30px] border border-gray-100">
             <div className="flex items-center gap-3 mb-3">
                <Zap size={16} className="text-yellow-500" />
                <span className="text-xs font-black text-gray-800">نظام نينا الذكي</span>
             </div>
             <p className="text-[10px] text-gray-400 font-bold leading-relaxed">
               تتم مزامنة جميع التغييرات لحظياً مع قاعدة البيانات السحابية لضمان أفضل تجربة للمستخدم.
             </p>
          </div>
        </div>
      </aside>
      <main className="flex-1 p-4 lg:p-12 overflow-x-hidden">
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
