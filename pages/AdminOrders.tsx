
import React, { useState, useEffect } from 'react';
import { 
  Check, 
  X, 
  Trash2, 
  MessageCircle, 
  User, 
  MapPin, 
  Phone, 
  Clock,
  ExternalLink,
  ChevronDown,
  ShoppingCart,
  Truck
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { Order, OrderStatus } from '../types';

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [cancelReason, setCancelReason] = useState('');
  const [activeCancelId, setActiveCancelId] = useState<string | null>(null);

  useEffect(() => {
    setOrders(dataService.getOrders());
  }, []);

  const handleStatusUpdate = (id: string, status: OrderStatus, reason?: string) => {
    const updated = orders.map(o => {
      if (o.id === id) {
        const order = { ...o, status, cancelReason: reason || o.cancelReason, updatedAt: Date.now() };
        
        // Trigger WhatsApp
        if (status === OrderStatus.ACCEPTED) sendWhatsApp(order, 'accept');
        if (status === OrderStatus.REJECTED) sendWhatsApp(order, 'reject', reason);

        return order;
      }
      return o;
    });
    dataService.saveOrders(updated);
    setOrders(updated);
    setActiveCancelId(null);
    setCancelReason('');
  };

  const sendWhatsApp = (order: Order, type: 'accept' | 'reject', reason?: string) => {
    const settings = dataService.getSettings();
    let message = '';
    
    if (type === 'accept') {
      message = settings.deliveryTemplate
        .replace('{ORDER_ID}', order.id)
        .replace('{TOTAL}', order.totals.grandTotal.toString())
        .replace('{ETA}', 'يوم إلى يومين');
    } else {
      message = `نأسف لإبلاغك بإلغاء طلبك رقم ${order.id} من Nino Care. السبب: ${reason}. لمزيد من الاستفسار تواصل معنا على واتساب.`;
    }

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${order.customer.phoneOrWhatsApp.replace('+', '').replace('-', '')}?text=${encoded}`, '_blank');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الطلب نهائياً؟')) {
      const updated = orders.filter(o => o.id !== id);
      dataService.saveOrders(updated);
      setOrders(updated);
    }
  };

  const filteredOrders = filter === 'ALL' ? orders : orders.filter(o => o.status === filter);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return <span className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full text-sm font-bold">قيد الانتظار</span>;
      case OrderStatus.ACCEPTED: return <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-bold">مقبول</span>;
      case OrderStatus.REJECTED: return <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-bold">ملغي</span>;
      case OrderStatus.EXECUTED: return <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-bold">تم التنفيذ</span>;
    }
  };

  return (
    <div className="fade-in space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">إدارة الطلبات</h1>
        <div className="flex bg-white rounded-xl shadow-sm border border-gray-100 p-1">
          {['ALL', OrderStatus.PENDING, OrderStatus.ACCEPTED, OrderStatus.REJECTED].map((f) => (
            <button 
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${filter === f ? 'pink-primary-bg text-white' : 'text-gray-500 hover:text-pink-600'}`}
            >
              {f === 'ALL' ? 'الكل' : getStatusBadge(f as OrderStatus)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {filteredOrders.map(order => (
          <div key={order.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 md:p-8 flex flex-col lg:flex-row gap-8">
              {/* Customer Info */}
              <div className="lg:w-1/3 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold flex items-center gap-2"><User size={20} className="text-pink-400" /> {order.customer.name}</h3>
                    <p className="text-gray-400 text-sm">#{order.id} • {new Date(order.createdAt).toLocaleString('ar-EG')}</p>
                  </div>
                  {getStatusBadge(order.status)}
                </div>
                
                <div className="bg-gray-50 p-4 rounded-2xl space-y-2 text-sm">
                  <p className="flex items-center gap-2"><MapPin size={16} className="text-gray-400" /> {order.customer.city}، {order.customer.address}</p>
                  <p className="flex items-center gap-2 font-bold text-pink-600"><Truck size={16} className="text-pink-400" /> {order.customer.deliveryArea}</p>
                  <p className="flex items-center gap-2 font-mono"><Phone size={16} className="text-gray-400" /> {order.customer.phoneOrWhatsApp}</p>
                </div>

                <div className="flex gap-2">
                   <button 
                    onClick={() => handleStatusUpdate(order.id, OrderStatus.ACCEPTED)}
                    disabled={order.status === OrderStatus.ACCEPTED || order.status === OrderStatus.EXECUTED}
                    className="flex-1 bg-green-500 text-white py-2 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-green-600 transition-colors"
                   >
                     <Check size={18} /> قبول
                   </button>
                   <button 
                    onClick={() => setActiveCancelId(order.id)}
                    disabled={order.status === OrderStatus.REJECTED}
                    className="flex-1 bg-red-500 text-white py-2 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-red-600 transition-colors"
                   >
                     <X size={18} /> إلغاء
                   </button>
                </div>
              </div>

              {/* Order Items */}
              <div className="flex-1 border-r border-gray-50 pr-0 lg:pr-8">
                <h4 className="font-bold mb-4 flex items-center gap-2"><ShoppingCart size={18} className="text-pink-400" /> المنتجات ({order.items.length})</h4>
                <div className="space-y-4 mb-6">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <img src={item.image} alt="" className="w-12 h-12 object-cover rounded-lg" />
                      <div className="flex-1">
                        <p className="font-bold text-sm">{item.name}</p>
                        <p className="text-xs text-gray-400">₪{item.price} × {item.qty}</p>
                      </div>
                      <span className="font-bold text-pink-600">₪{(item.price * item.qty).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-gray-50 space-y-1">
                   <div className="flex justify-between text-sm text-gray-500">
                     <span>المجموع الفرعي:</span>
                     <span>₪{order.totals.subtotal.toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between text-sm text-gray-500">
                     <span>رسوم التوصيل:</span>
                     <span>₪{order.totals.deliveryCost.toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between items-center pt-2">
                     <span className="text-gray-800 font-bold text-lg">الإجمالي النهائي:</span>
                     <span className="text-2xl font-bold pink-primary">₪{order.totals.grandTotal.toFixed(2)}</span>
                   </div>
                </div>
              </div>

              {/* Admin Actions */}
              <div className="lg:w-auto flex lg:flex-col gap-2 justify-center">
                 <button 
                  onClick={() => handleStatusUpdate(order.id, OrderStatus.EXECUTED)}
                  className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                  title="تحديد كمنفذ"
                 >
                   <Check size={20} />
                 </button>
                 <button 
                  onClick={() => handleDelete(order.id)}
                  className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                  title="حذف الطلب"
                 >
                   <Trash2 size={20} />
                 </button>
                 <a 
                  href={`https://wa.me/${order.customer.phoneOrWhatsApp}`}
                  target="_blank"
                  className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors"
                  title="مراسلة العميل"
                 >
                   <MessageCircle size={20} />
                 </a>
              </div>
            </div>

            {activeCancelId === order.id && (
              <div className="p-6 bg-red-50 border-t border-red-100 flex flex-col md:flex-row gap-4 items-center animate-slide-in-top">
                <input 
                  type="text" 
                  placeholder="أدخل سبب الإلغاء..."
                  className="flex-1 p-4 bg-white rounded-2xl outline-none focus:ring-2 ring-red-200"
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                />
                <button 
                  onClick={() => handleStatusUpdate(order.id, OrderStatus.REJECTED, cancelReason)}
                  className="bg-red-600 text-white px-8 py-4 rounded-2xl font-bold"
                >
                  تأكيد الإلغاء
                </button>
                <button onClick={() => setActiveCancelId(null)} className="text-gray-400 font-bold p-4">إغلاق</button>
              </div>
            )}
          </div>
        ))}
        
        {filteredOrders.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 text-gray-400">
            لا توجد طلبات في هذا القسم
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;