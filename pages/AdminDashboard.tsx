
import React, { useState, useEffect } from 'react';
import { Package, ShoppingCart, TrendingUp, AlertCircle, TrendingDown } from 'lucide-react';
import { dataService } from '../services/dataService';
import { Order, Product, OrderStatus } from '../types';

const AdminDashboard: React.FC = () => {
  // Fix: Move products and orders to local state instead of calling async functions in component body
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [o, p] = await Promise.all([
          dataService.getOrders(),
          dataService.getProducts()
        ]);
        setOrders(o);
        setProducts(p);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) return <div className="p-8 text-center font-bold">جاري تحميل الإحصائيات...</div>;

  const totalSales = orders
    .filter(o => o.status === OrderStatus.ACCEPTED || o.status === OrderStatus.EXECUTED)
    .reduce((acc, o) => acc + o.totals.grandTotal, 0);

  const pendingCount = orders.filter(o => o.status === OrderStatus.PENDING).length;
  
  // Basic analytics for demo
  const dailyOrders = orders.filter(o => {
    const date = new Date(o.createdAt);
    return date.toDateString() === new Date().toDateString();
  }).length;

  const productStats = products.map(p => {
    const orderCount = orders.reduce((acc, o) => {
      const item = o.items.find(i => i.productId === p.id);
      return acc + (item?.qty || 0);
    }, 0);
    return { name: p.name, count: orderCount };
  }).sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-8 fade-in">
      <h1 className="text-3xl font-bold">نظرة عامة</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">إجمالي المبيعات</p>
            <p className="text-2xl font-bold">₪{totalSales.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
            <ShoppingCart size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">طلبات اليوم</p>
            <p className="text-2xl font-bold">{dailyOrders}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">طلبات معلقة</p>
            <p className="text-2xl font-bold">{pendingCount}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
            <Package size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">إجمالي المنتجات</p>
            <p className="text-2xl font-bold">{products.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-6">المنتجات الأكثر طلباً</h2>
          <div className="space-y-4">
            {productStats.slice(0, 5).map((stat, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="font-bold">{stat.name}</span>
                <span className="bg-pink-100 text-pink-600 px-3 py-1 rounded-full text-sm font-bold">{stat.count} طلب</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-6">المنتجات الأقل طلباً</h2>
          <div className="space-y-4">
            {[...productStats].reverse().slice(0, 5).map((stat, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="font-bold">{stat.name}</span>
                <span className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-sm font-bold">{stat.count} طلب</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
