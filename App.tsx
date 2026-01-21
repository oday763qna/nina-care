import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, 
  Home as HomeIcon, 
  Grid, 
  Settings as SettingsIcon, 
  Package, 
  BarChart3, 
  ShoppingCart,
  Menu,
  X,
  Instagram,
  MessageCircle,
  Palette
} from 'lucide-react';
import { Product, Category, Settings, OrderItem, ThemePreset } from './types';
import { dataService } from './services/dataService';
import { THEME_PRESETS, DEFAULT_SETTINGS } from './constants';

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
      setSettings(s);
    } catch (err) {
      console.error("خطأ في جلب البيانات:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
    const savedCart = localStorage.getItem('nina_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
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
    <div className="min-h-screen flex items-center justify-center bg-pink-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-pink-500"></div>
    </div>
  );

  return (
    <AppContext.Provider value={{ 
      cart, addToCart, removeFromCart, updateCartQty, clearCart, 
      settings, categories, products, refreshData, activeTheme, isLoading
    }}>
      <HashRouter>
        <div className="min-h-screen flex flex-col font-cairo">
          <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
              <button onClick={() => setIsMenuOpen(true)} className="lg:hidden p-2 text-pink-600"><Menu /></button>
              <Link to="/" className="flex items-center gap-3">
                <img src="https://i.imgur.com/Wm6GITt.png" className="h-12 w-12 rounded-full border-2 border-pink-500" />
                <span className="text-xl font-bold text-pink-600 hidden sm:block">Nino Care</span>
              </Link>
              <div className="flex items-center gap-4">
                <Link to="/cart" className="relative p-2 bg-pink-50 rounded-full text-pink-600">
                  <ShoppingCart size={24} />
                  {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">{cartCount}</span>}
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
        </div>
      </HashRouter>
    </AppContext.Provider>
  );
};

const AdminLayout: React.FC = () => {
  const { activeTheme } = useApp();
  const location = useLocation();
  const isAuth = sessionStorage.getItem('admin_session') === 'true';
  
  if (!isAuth && location.pathname !== '/admin/login') return <AdminLoginPage />;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row rtl font-cairo">
      <aside className="w-full md:w-64 bg-white border-l p-6">
        <nav className="space-y-2">
          <Link to="/admin" className="block p-3 hover:bg-pink-50 rounded-lg font-bold">الإحصائيات</Link>
          <Link to="/admin/products" className="block p-3 hover:bg-pink-50 rounded-lg font-bold">المنتجات</Link>
          <Link to="/admin/orders" className="block p-3 hover:bg-pink-50 rounded-lg font-bold">الطلبات</Link>
          <Link to="/admin/settings" className="block p-3 hover:bg-pink-50 rounded-lg font-bold">الإعدادات</Link>
        </nav>
      </aside>
      <main className="flex-1 p-8">
        <Routes>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="settings" element={<AdminSettings />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;