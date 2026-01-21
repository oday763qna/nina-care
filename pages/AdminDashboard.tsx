import React, { useState, useEffect } from 'react';
import { Package, ShoppingCart, TrendingUp, AlertCircle, Clock, Zap, Users, ArrowUpRight, Bell, Smartphone, Monitor } from 'lucide-react';
import { dataService } from '../services/dataService';
import { Order, Product, OrderStatus } from '../types';
import { supabase } from '../services/supabaseClient';

const AdminDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastEvent, setLastEvent] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [o, p] = await Promise.all([
        dataService.getOrders(),
        dataService.getProducts()
      ]);
      setOrders(o);
      setProducts(p);
    } catch (err) {
      console.error("خطأ في جلب البيانات الحية:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // الاستماع الحصري لأحداث الطلبات الجديدة لإظهار تنبيه لحظي
    const channel = supabase
      .channel('dashboard-live-updates')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        setLastEvent(`طلب جديد من ${payload.new.customer.name}`);
        fetchData();
        // إخفاء التنبيه بعد 5 ثوانٍ
        setTimeout(() => setLastEvent(null), 5000);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center p-20 text-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-pink-500"></div>
      <p className="font-bold text-gray-400">جاري الاتصال بالنظام المركزي...</p>
    </div>
  );

  const totalSales = orders
    .filter(o => o.status === OrderStatus.ACCEPTED || o.status === OrderStatus.EXECUTED)
    .reduce((acc, o) => acc + o.totals.grandTotal, 0);

  const pendingCount = orders.filter(o => o.status === OrderStatus.PENDING).length;
  
  const dailyOrders = orders.filter(o => {
    const date = new Date(o.createdAt);
    return date.toDateString() === new Date().toDateString();
  });

  const productStats = products.map(p => {
    const orderCount = orders.reduce((acc, o) => {
      const item = o.items.find(i => i.productId === p.id);
      return acc + (item?.qty || 0);
    }, 0);
    return { name: p.name, count: orderCount, image: p.images[0] };
  }).sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-10 fade-in pb-20 relative">
      {/* Real-time Notification Overlay */}
      {lastEvent && (
        <div className="fixed top-24 right-6 left-6 z-[100] md:left-auto md:w-96 animate-slide-in-top">
          <div className="bg-gray-900 text-white p-5 rounded-[24px] shadow-2xl border border-gray-800 flex items-center gap-4">
            <div className="bg-pink-500 p-2 rounded-xl">
              <Bell className="animate-ring" size={20} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-pink-400 font-bold uppercase">تحديث لحظي</p>
              <p className="font-bold">{lastEvent}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-900 mb-2">النظام المركزي</h1>
          <div className="flex items-center gap-2 text-green-500 font-bold text-sm bg-green-50 px-4 py-1.5 rounded-full w-fit border border-green-100 shadow-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
            بث مباشر للبيانات
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
            <Smartphone size={18} className="text-gray-400" />
            <div className="w-px h-4 bg-gray-100"></div>
            <Monitor size={18} className="text-gray-400" />
            <span className="text-xs font-bold text-gray-500">متصل الآن</span>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'إجمالي المبيعات', value: `₪${totalSales.toLocaleString()}`, icon: TrendingUp, color: 'pink' },
          { label: 'طلبات اليوم', value: dailyOrders.length, icon: ShoppingCart, color: 'blue' },
          { label: 'بانتظار التأكيد', value: pendingCount, icon: AlertCircle, color: 'yellow', urgent: pendingCount > 0 },
          { label: 'المخزون', value: products.length, icon: Package, color: 'green' },
        ].map((stat, i) => (
          <div key={i} className={`bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 transition-all hover:shadow-lg group ${stat.urgent ? 'ring-2 ring-yellow-400 animate-pulse' : ''}`}>
             <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md ${
                  stat.color === 'pink' ? 'bg-pink-100 text-pink-600' : 
                  stat.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                  stat.color === 'yellow' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'
                }`}>
                  <stat.icon size={24} />
                </div>
                {stat.urgent && <span className="text-[10px] font-black bg-yellow-500 text-white px-2 py-1 rounded-lg">عاجل</span>}
             </div>
             <p className="text-gray-400 font-bold text-xs mb-1 uppercase tracking-wider">{stat.label}</p>
             <p className="text-2xl font-black text-gray-800">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Most Ordered Products */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
          <h2 className="text-xl font-black text-gray-800 mb-8 flex items-center gap-3">
            <Zap size={22} className="text-yellow-500" />
            الأكثر مبيعاً حالياً
          </h2>
          <div className="space-y-4">
            {productStats.slice(0, 5).map((stat, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-transparent hover:border-pink-100 transition-all">
                <div className="flex items-center gap-4">
                  <img src={stat.image} alt="" className="w-12 h-12 rounded-xl object-cover shadow-sm" />
                  <div>
                    <span className="font-bold text-gray-800 block">{stat.name}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">{stat.count} وحدة مباعة</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-pink-500 rounded-full" style={{width: `${(stat.count / (productStats[0]?.count || 1)) * 100}%`}}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Feed Activity */}
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 flex flex-col">
          <h2 className="text-xl font-black text-gray-800 mb-8 flex items-center gap-3">
            <Users size={22} className="text-blue-500" />
            النشاط الأخير
          </h2>
          <div className="flex-1 space-y-6 overflow-y-auto pr-2 no-scrollbar max-h-[400px]">
            {orders.slice(0, 10).map((order) => (
              <div key={order.id} className="relative pr-6 border-r-2 border-pink-50 pb-1">
                <div className={`absolute top-0 -right-[7px] w-3 h-3 rounded-full border-2 border-white shadow-sm ${
                  order.status === OrderStatus.PENDING ? 'bg-yellow-400' : 
                  order.status === OrderStatus.ACCEPTED ? 'bg-green-500' : 'bg-gray-300'
                }`}></div>
                <div className="flex flex-col">
                   <p className="text-[10px] text-gray-400 font-bold mb-1">{new Date(order.createdAt).toLocaleTimeString('ar-EG')}</p>
                   <p className="text-sm font-bold text-gray-700">طلب جديد: {order.customer.name}</p>
                   <p className="text-[10px] text-pink-500 font-black">₪{order.totals.grandTotal}</p>
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={() => window.location.hash = '/admin/orders'}
            className="w-full mt-8 py-4 bg-pink-50 text-pink-600 rounded-2xl font-bold text-sm hover:bg-pink-600 hover:text-white transition-all shadow-inner border border-pink-100"
          >
            مشاهدة جميع الطلبات
          </button>
        </div>
      </div>
      <style>{`
        @keyframes ring {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(15deg); }
          75% { transform: rotate(-15deg); }
        }
        .animate-ring {
          animation: ring 0.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;