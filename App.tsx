import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, 
  Home as HomeIcon, 
  Grid, 
  Settings as SettingsIcon, 
  Package, 
  BarChart3, 
  Heart, 
  Search,
  ShoppingCart,
  Menu,
  X,
  Instagram,
  MessageCircle,
  Palette
} from 'lucide-react';
import { Product, Category, Settings, OrderItem, ThemePreset } from './types';
import { dataService } from './services/dataService';
import { THEME_PRESETS } from './constants';

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
  refreshData: () => void;
  activeTheme: ThemePreset;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

const App: React.FC = () => {
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [settings, setSettings] = useState<Settings>(dataService.getSettings());
  const [categories, setCategories] = useState<Category[]>(dataService.getCategories());
  const [products, setProducts] = useState<Product[]>(dataService.getProducts());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [adminTapCount, setAdminTapCount] = useState(0);

  const activeTheme = THEME_PRESETS.find(t => t.id === settings.activeThemeId) || THEME_PRESETS[0];

  useEffect(() => {
    const savedCart = localStorage.getItem('nina_cart');
    if (savedCart) setCart(JSON.parse(savedCart));

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith('nina_')) {
        refreshData();
      }
      if (e.key === 'nina_cart') {
        setCart(e.newValue ? JSON.parse(e.newValue) : []);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    localStorage.setItem('nina_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', activeTheme.primaryColor);
    document.documentElement.style.setProperty('--secondary-color', activeTheme.secondaryColor);
    document.body.style.backgroundColor = activeTheme.secondaryColor;
  }, [activeTheme]);

  const refreshData = () => {
    setSettings(dataService.getSettings());
    setCategories(dataService.getCategories());
    setProducts(dataService.getProducts());
  };

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

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const updateCartQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => item.productId === productId ? { ...item, qty } : item));
  };

  const clearCart = () => setCart([]);

  const handleAdminDotClick = () => {
    setAdminTapCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 3) {
        window.location.hash = '/admin/login';
        return 0;
      }
      return newCount;
    });
    setTimeout(() => setAdminTapCount(0), 2000);
  };

  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);

  return (
    <AppContext.Provider value={{ 
      cart, addToCart, removeFromCart, updateCartQty, clearCart, 
      settings, categories, products, refreshData, activeTheme
    }}>
      <HashRouter>
        <div className="min-h-screen flex flex-col font-cairo overflow-x-hidden">
          <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
              <button 
                onClick={() => setIsMenuOpen(true)}
                className="lg:hidden p-2 rounded-full"
                style={{color: activeTheme.primaryColor}}
              >
                <Menu size={24} />
              </button>

              <Link to="/" className="flex items-center gap-3">
                <img src="https://i.imgur.com/Wm6GITt.png" alt="Nino Care" className="h-14 w-14 rounded-full object-cover border-2 shadow-sm transition-transform hover:scale-105" style={{borderColor: activeTheme.primaryColor}} />
                <span className="text-2xl font-bold hidden sm:inline" style={{color: activeTheme.primaryColor}}>Nino Care</span>
              </Link>

              <div className="hidden lg:flex items-center gap-8 text-gray-600 font-bold">
                <Link to="/" className="hover:opacity-70 transition-colors">الرئيسية</Link>
                {categories.slice(0, 4).map(cat => (
                  <Link key={cat.id} to={`/?cat=${cat.id}`} className="hover:opacity-70 transition-colors">{cat.name}</Link>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Link to="/cart" className="relative p-2 text-gray-600 transition-colors rounded-full" style={{backgroundColor: `${activeTheme.primaryColor}10`}}>
                  <ShoppingCart size={24} style={{color: activeTheme.primaryColor}} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-6 h-6 text-white text-[12px] flex items-center justify-center rounded-full border-2 border-white font-bold animate-bounce" style={{backgroundColor: activeTheme.primaryColor}}>
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </header>

          {isMenuOpen && (
            <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm lg:hidden transition-opacity">
              <div className="absolute top-0 right-0 w-72 h-full bg-white shadow-xl flex flex-col p-8 animate-slide-in-right">
                <div className="flex justify-between items-center mb-8">
                  <img src="https://i.imgur.com/Wm6GITt.png" alt="Logo" className="h-16 w-16 rounded-full object-cover border-2 shadow-md" style={{borderColor: activeTheme.primaryColor}} />
                  <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-full"><X /></button>
                </div>
                <nav className="flex flex-col gap-6 text-xl">
                  <Link onClick={() => setIsMenuOpen(false)} to="/" className="flex items-center gap-4 py-2 border-b border-gray-50 font-bold text-gray-800"><HomeIcon size={24} style={{color: activeTheme.primaryColor}} /> الرئيسية</Link>
                  <Link onClick={() => setIsMenuOpen(false)} to="/cart" className="flex items-center gap-4 py-2 border-b border-gray-50 font-bold text-gray-800"><ShoppingCart size={24} style={{color: activeTheme.primaryColor}} /> سلة المشتريات</Link>
                  <div className="mt-6">
                    <p className="text-sm font-bold mb-4 uppercase tracking-widest" style={{color: activeTheme.primaryColor}}>الأقسام</p>
                    <div className="flex flex-col gap-3">
                      {categories.map(cat => (
                        <Link key={cat.id} onClick={() => setIsMenuOpen(false)} to={`/?cat=${cat.id}`} className="block py-2 text-gray-600 font-medium hover:opacity-70">{cat.name}</Link>
                      ))}
                    </div>
                  </div>
                </nav>
              </div>
            </div>
          )}

          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-status/:id" element={<OrderStatusPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin/*" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="ads" element={<AdminAds />} />
                <Route path="themes" element={<AdminThemes />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
            </Routes>
          </main>

          <footer className="bg-white border-t border-gray-100 mt-12 py-16">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-16 text-center md:text-right">
              <div>
                <img src="https://i.imgur.com/Wm6GITt.png" alt="Nino Care" className="h-24 w-24 rounded-full object-cover mb-6 mx-auto md:mx-0 border-4 shadow-xl" style={{borderColor: activeTheme.primaryColor}} />
                <p className="text-gray-500 leading-relaxed font-medium">أفضل منتجات التجميل والعناية بالبشرة المختارة بعناية لتناسب جمالك الطبيعي وتبرز سحرك الخاص.</p>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold mb-6" style={{color: activeTheme.primaryColor}}>روابط سريعة</h3>
                <ul className="space-y-4 text-gray-600 font-bold">
                  <li><Link to="/" className="hover:opacity-70 transition-all">الصفحة الرئيسية</Link></li>
                  <li><Link to="/cart" className="hover:opacity-70 transition-all">سلة التسوق</Link></li>
                  <li>
                    <button 
                      onClick={handleAdminDotClick}
                      className="w-3 h-3 rounded-full opacity-20 hover:opacity-100 transition-opacity mt-4 cursor-default"
                      style={{backgroundColor: activeTheme.primaryColor}}
                      aria-hidden="true"
                    />
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-6" style={{color: activeTheme.primaryColor}}>تواصل معنا</h3>
                <div className="flex justify-center md:justify-start gap-4 mb-6">
                   <a href={settings.instagramUrl} target="_blank" className="p-3 rounded-full hover:shadow-md transition-all shadow-sm" style={{backgroundColor: `${activeTheme.primaryColor}10`, color: activeTheme.primaryColor}}><Instagram size={24} /></a>
                   <a href={`https://wa.me/${settings.whatsappNumber}`} target="_blank" className="p-3 bg-green-50 text-green-600 rounded-full hover:bg-green-600 hover:text-white transition-all shadow-sm"><MessageCircle size={24} /></a>
                </div>
                <p className="text-gray-500 font-bold mb-2">خدمة العملاء واتساب: {settings.whatsappNumber}</p>
                <p className="font-bold" style={{color: activeTheme.primaryColor}}>متوفرون لخدمتكم 24/7</p>
                <p className="text-gray-400 mt-4 text-sm">الدفع كاش عند الاستلام</p>
              </div>
            </div>
            <div className="mt-16 pt-8 border-t border-gray-50 text-center text-gray-400 text-sm font-bold">
              &copy; {new Date().getFullYear()} Nino Care. جميع الحقوق محفوظة.
            </div>
          </footer>
        </div>
      </HashRouter>
    </AppContext.Provider>
  );
};

const AdminLayout: React.FC = () => {
  const [authorized, setAuthorized] = useState(false);
  const { activeTheme } = useApp();
  const location = useLocation();
  
  useEffect(() => {
    const isAuth = sessionStorage.getItem('admin_session') === 'true';
    if (!isAuth) {
      window.location.hash = '/admin/login';
    } else {
      setAuthorized(true);
    }
  }, []);

  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row rtl">
      <aside className="w-full md:w-72 bg-white border-l border-gray-200 p-8 shadow-sm z-10">
        <div className="mb-10 flex flex-col items-center">
          <img src="https://i.imgur.com/Wm6GITt.png" alt="Admin" className="h-24 w-24 rounded-full object-cover mb-4 border-2 shadow-lg" style={{borderColor: activeTheme.primaryColor}} />
          <h2 className="text-2xl font-bold" style={{color: activeTheme.primaryColor}}>لوحة الإدارة</h2>
          <p className="text-xs text-gray-400 font-bold mt-1">Nino Care Official</p>
        </div>
        <nav className="flex flex-col gap-3">
          {[
            { to: '/admin', icon: BarChart3, label: 'الإحصائيات' },
            { to: '/admin/orders', icon: Package, label: 'الطلبات' },
            { to: '/admin/products', icon: Grid, label: 'المنتجات' },
            { to: '/admin/ads', icon: ShoppingBag, label: 'الإعلانات' },
            { to: '/admin/themes', icon: Palette, label: 'الثيمات' },
            { to: '/admin/settings', icon: SettingsIcon, label: 'الإعدادات' },
          ].map(link => (
            <Link 
              key={link.to}
              to={link.to} 
              className={`flex items-center gap-4 p-4 rounded-2xl transition-all font-bold ${location.pathname === link.to ? 'bg-pink-50 text-pink-600' : 'text-gray-600 hover:bg-gray-50'}`}
              style={location.pathname === link.to ? { backgroundColor: `${activeTheme.primaryColor}10`, color: activeTheme.primaryColor } : {}}
            >
              <link.icon size={24} /> {link.label}
            </Link>
          ))}
          <button 
            onClick={() => {
              sessionStorage.removeItem('admin_session');
              window.location.hash = '/';
            }}
            className="flex items-center gap-4 p-4 rounded-2xl hover:bg-red-50 text-red-600 transition-all mt-10 font-bold border border-transparent hover:border-red-100"
          >
            <X size={24} /> تسجيل الخروج
          </button>
        </nav>
      </aside>
      <main className="flex-1 p-6 md:p-12 overflow-y-auto bg-gray-50/50">
        <Routes>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="ads" element={<AdminAds />} />
          <Route path="themes" element={<AdminThemes />} />
          <Route path="settings" element={<AdminSettings />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;