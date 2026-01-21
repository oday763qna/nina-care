import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// Added ShoppingCart to imports
import { ShoppingBag, Trash2, ArrowRight, Minus, Plus, History, Clock, CheckCircle2, XCircle, ChevronLeft, AlertCircle, ShoppingCart } from 'lucide-react';
import { useApp } from '../App';
import { dataService } from '../services/dataService';
import { Order, OrderStatus } from '../types';

const CartPage: React.FC = () => {
  const { cart, updateCartQty, removeFromCart, activeTheme } = useApp();
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [previousOrders, setPreviousOrders] = useState<Order[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const allOrders = dataService.getOrders();
    setPendingOrders(allOrders.filter(o => o.status === OrderStatus.PENDING).sort((a, b) => b.createdAt - a.createdAt));
    setPreviousOrders(allOrders.filter(o => o.status !== OrderStatus.PENDING).sort((a, b) => b.createdAt - a.createdAt));
  }, []);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return 'text-yellow-500 border-yellow-200 bg-yellow-50';
      case OrderStatus.ACCEPTED: return 'text-green-500 border-green-200 bg-green-50';
      case OrderStatus.REJECTED: return 'text-red-500 border-red-200 bg-red-50';
      case OrderStatus.EXECUTED: return 'text-blue-500 border-blue-200 bg-blue-50';
      default: return 'text-gray-500 border-gray-200 bg-gray-50';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return <Clock size={16} />;
      case OrderStatus.ACCEPTED: return <CheckCircle2 size={16} />;
      case OrderStatus.REJECTED: return <XCircle size={16} />;
      case OrderStatus.EXECUTED: return <CheckCircle2 size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return 'قيد المراجعة';
      case OrderStatus.ACCEPTED: return 'تم القبول';
      case OrderStatus.REJECTED: return 'تم الإلغاء';
      case OrderStatus.EXECUTED: return 'تم التوصيل';
      default: return 'غير معروف';
    }
  };

  const hasAnyActivity = cart.length > 0 || pendingOrders.length > 0 || previousOrders.length > 0;

  if (!hasAnyActivity) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center fade-in">
        <div className="w-32 h-32 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-8 text-pink-200">
          <ShoppingBag size={64} />
        </div>
        <h2 className="text-3xl font-bold mb-4">سلة التسوق فارغة</h2>
        <p className="text-gray-500 text-lg mb-8">ابدأي بإضافة بعض المنتجات الرائعة لجمالك!</p>
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-white px-10 py-4 rounded-full font-bold text-lg hover:shadow-lg transition-all"
          style={{ backgroundColor: activeTheme.primaryColor }}
        >
          <ArrowRight size={20} />
          العودة للتسوق
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        <div className="lg:col-span-2 space-y-16">
          {/* Section 1: Current Shopping Cart Items */}
          <section>
            <div className="flex items-center gap-3 mb-10 pr-4 border-r-4" style={{ borderColor: activeTheme.primaryColor }}>
              <ShoppingCart size={28} className="text-gray-400" />
              <h1 className="text-3xl font-bold text-gray-800">سلة المشتريات</h1>
            </div>
            {cart.length > 0 ? (
              <div className="space-y-6">
                {cart.map(item => (
                  <div key={item.productId} className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-6">
                    <img src={item.image} alt={item.name} className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-2xl border border-gray-50" />
                    <div className="flex-1">
                      <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2">{item.name}</h3>
                      <p className="font-bold mb-4" style={{ color: activeTheme.primaryColor }}>₪{item.price.toFixed(2)}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center bg-gray-50 rounded-full px-4 py-2 gap-4">
                          <button onClick={() => updateCartQty(item.productId, item.qty - 1)} className="p-1 hover:opacity-70"><Minus size={18} /></button>
                          <span className="font-bold w-6 text-center">{item.qty}</span>
                          <button onClick={() => updateCartQty(item.productId, item.qty + 1)} className="p-1 hover:opacity-70"><Plus size={18} /></button>
                        </div>
                        <button onClick={() => removeFromCart(item.productId)} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={20} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-gray-200">
                <ShoppingBag size={48} className="mx-auto text-gray-200 mb-4" />
                <p className="text-gray-400 font-bold">السلة فارغة حالياً</p>
                <Link to="/" className="text-pink-600 font-bold text-sm underline mt-2 inline-block">تصفح المنتجات</Link>
              </div>
            )}
          </section>

          {/* Section 2: Pending Orders */}
          {pendingOrders.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-8 pr-4 border-r-4" style={{ borderColor: activeTheme.primaryColor }}>
                <Clock size={24} className="text-yellow-500" />
                <h2 className="text-2xl font-bold text-gray-800">طلبات قيد المراجعة</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pendingOrders.map(order => (
                  <Link 
                    to={`/order-status/${order.id}`} 
                    key={order.id} 
                    className="bg-white p-6 rounded-[32px] border border-yellow-100 shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">#{order.id}</p>
                        <p className="text-sm font-bold text-gray-700">{new Date(order.createdAt).toLocaleDateString('ar-EG')}</p>
                      </div>
                      <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {getStatusText(order.status)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-50">
                      <div className="flex -space-x-3 rtl:space-x-reverse">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <img key={idx} src={item.image} alt="" className="w-10 h-10 rounded-full border-2 border-white object-cover" />
                        ))}
                      </div>
                      <div className="text-left">
                        <p className="text-xs text-gray-400">الإجمالي</p>
                        <p className="font-bold pink-primary text-lg">₪{order.totals.grandTotal.toFixed(2)}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Section 3: Previous Orders History */}
          {previousOrders.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-8 pr-4 border-r-4" style={{ borderColor: activeTheme.primaryColor }}>
                <History size={24} className="text-gray-400" />
                <h2 className="text-2xl font-bold text-gray-800">سجل الطلبات المكتملة</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {previousOrders.map(order => (
                  <Link 
                    to={`/order-status/${order.id}`} 
                    key={order.id} 
                    className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">#{order.id}</p>
                        <p className="text-sm font-bold text-gray-700">{new Date(order.createdAt).toLocaleDateString('ar-EG')}</p>
                      </div>
                      <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {getStatusText(order.status)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-50">
                      <div className="flex -space-x-3 rtl:space-x-reverse">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <img key={idx} src={item.image} alt="" className="w-10 h-10 rounded-full border-2 border-white object-cover" />
                        ))}
                      </div>
                      <div className="text-left">
                        <p className="text-xs text-gray-400">الإجمالي</p>
                        <p className="font-bold pink-primary text-lg">₪{order.totals.grandTotal.toFixed(2)}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar Summary for Current Cart */}
        {cart.length > 0 && (
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-[40px] shadow-lg border border-gray-50 sticky top-24">
              <h3 className="text-xl font-bold mb-6">ملخص السلة</h3>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-gray-500">
                  <span>المجموع الفرعي</span>
                  <span>₪{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>رسوم التوصيل</span>
                  <span className="text-green-600">سيحدد لاحقاً</span>
                </div>
                <div className="h-px bg-gray-50 my-4" />
                <div className="flex justify-between text-2xl font-bold" style={{ color: activeTheme.primaryColor }}>
                  <span>الإجمالي</span>
                  <span>₪{subtotal.toFixed(2)}</span>
                </div>
              </div>

              <button 
                onClick={() => navigate('/checkout')}
                className="w-full text-white py-4 rounded-2xl font-bold text-xl hover:shadow-xl transition-all shadow-md active:scale-95"
                style={{ backgroundColor: activeTheme.primaryColor }}
              >
                إتمام الطلب
              </button>
              
              <div className="mt-8 flex items-start gap-3 bg-blue-50 p-4 rounded-2xl border border-blue-100">
                <AlertCircle size={20} className="text-blue-500 shrink-0" />
                <p className="text-[11px] text-blue-700 leading-relaxed">
                  بمجرد تقديم طلبك، سيظهر في قسم "قيد المراجعة" حتى يقوم موظفو Nino Care بتأكيده عبر الواتساب.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;