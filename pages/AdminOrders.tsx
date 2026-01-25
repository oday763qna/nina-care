
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
  Truck,
  AlertTriangle
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { Order, OrderStatus } from '../types';

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [cancelReason, setCancelReason] = useState('');
  const [activeCancelId, setActiveCancelId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setOrders(await dataService.getOrders());
  };

  const handleStatusUpdate = async (id: string, status: OrderStatus, reason?: string) => {
    const updated = orders.map(o => {
      if (o.id === id) {
        const order = { ...o, status, cancelReason: reason || o.cancelReason, updatedAt: Date.now() };
        
        if (status === OrderStatus.ACCEPTED) sendWhatsApp(order, 'accept');
        if (status === OrderStatus.REJECTED) sendWhatsApp(order, 'reject', reason);

        return order;
      }
      return o;
    });
    await dataService.saveOrders(updated);
    setOrders(updated);
    setActiveCancelId(null);
    setCancelReason('');
  };

  const sendWhatsApp = async (order: Order, type: 'accept' | 'reject', reason?: string) => {
    const settings = await dataService.getSettings();
    let message = '';
    
    if (type === 'accept') {
      message = (settings?.deliveryTemplate || '')
        .replace('{ORDER_ID}', order.id)
        .replace('{TOTAL}', order.totals.grandTotal.toString())
        .replace('{ETA}', 'يوم إلى يومين');
    } else {
      message = `نأسف لإبلاغك بإلغاء طلبك رقم ${order.id} من Nino Care. السبب: ${reason}. لمزيد من الاستفسار تواصل معنا على واتساب.`;
    }

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${order.customer.phoneOrWhatsApp.replace('+', '').replace('-', '')}?text=${encoded}`, '_blank');
  };

  const handleDelete = async (id: string) => {
    try {
      await dataService.deleteOrder(id);
      setOrders(prev => prev.filter(o => o.id !== id));
      setConfirmDeleteId(null);
    } catch (err) {
      alert("فشل حذف الطلب من قاعدة البيانات.");
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
        <h1 className="text-3xl font-black text-gray-800 tracking-tight">إدارة الطلبات</h1>
        <div className="flex bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5">
          {['ALL', OrderStatus.PENDING, OrderStatus.ACCEPTED, OrderStatus.REJECTED].map((f) => (
            <button 
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${filter === f ? 'bg-pink-600 text-white shadow-lg' : 'text-gray-400 hover:text-pink-600'}`}
            >
              {f === 'ALL' ? 'الكل' : (f === OrderStatus.PENDING ? 'الجديدة' : (f === OrderStatus.ACCEPTED ? 'المقبولة' : 'الملغية'))}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-8">
        {filteredOrders.map(order => (
          <div key={order.id} className="bg-white rounded-[40px] shadow-sm border border-gray-50 overflow-hidden group transition-all hover:border-pink-100">
            <div className="p-8 md:p-10 flex flex-col lg:flex-row gap-10">
              {/* Customer Info */}
              <div className="lg:w-1/3 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-black text-gray-800 mb-1 flex items-center gap-3">
                      <div className="w-10 h-10 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center shrink-0">
                        <User size={20} />
                      </div>
                      {order.customer.name}
                    </h3>
                    <p className="text-gray-400 text-xs font-bold tracking-widest uppercase">#{order.id} • {new Date(order.createdAt).toLocaleString('ar-EG')}</p>
                  </div>
                  {getStatusBadge(order.status)}
                </div>
                
                <div className="bg-gray-50/50 p-6 rounded-3xl space-y-3 text-sm border border-gray-50">
                  <p className="flex items-center gap-3 text-gray-600"><MapPin size={18} className="text-pink-400" /> {order.customer.city}، {order.customer.address}</p>
                  <p className="flex items-center gap-3 font-bold text-pink-700"><Truck size={18} className="text-pink-400" /> {order.customer.deliveryArea}</p>
                  <p className="flex items-center gap-3 font-mono font-bold text-gray-500"><Phone size={18} className="text-pink-400" /> {order.customer.phoneOrWhatsApp}</p>
                </div>

                <div className="flex gap-3">
                   <button 
                    onClick={() => handleStatusUpdate(order.id, OrderStatus.ACCEPTED)}
                    disabled={order.status === OrderStatus.ACCEPTED || order.status === OrderStatus.EXECUTED}
                    className="flex-1 bg-green-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-green-600 transition-all shadow-md active:scale-95"
                   >
                     <Check size={20} /> قبول
                   </button>
                   <button 
                    onClick={() => setActiveCancelId(order.id)}
                    disabled={order.status === OrderStatus.REJECTED}
                    className="flex-1 bg-red-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 hover:bg-red-600 transition-all shadow-md active:scale-95"
                   >
                     <X size={20} /> إلغاء
                   </button>
                </div>
              </div>

              {/* Order Items */}
              <div className="flex-1 border-r border-gray-50 pr-0 lg:pr-10">
                <h4 className="font-black text-gray-800 mb-6 flex items-center gap-3">
                  <ShoppingCart size={20} className="text-pink-400" /> المنتجات ({order.items.length})
                </h4>
                <div className="space-y-5 mb-8">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-5 p-3 hover:bg-pink-50/30 rounded-2xl transition-all">
                      <img src={item.image} alt="" className="w-16 h-16 object-cover rounded-2xl border border-gray-100 shadow-sm" />
                      <div className="flex-1">
                        <p className="font-bold text-gray-800">{item.name}</p>
                        <p className="text-xs font-bold text-gray-400">₪{item.price} × {item.qty}</p>
                      </div>
                      <span className="font-black text-pink-600 text-lg">₪{(item.price * item.qty).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-6 border-t border-gray-100 space-y-2">
                   <div className="flex justify-between text-sm text-gray-400 font-bold">
                     <span>المجموع الفرعي:</span>
                     <span>₪{order.totals.subtotal.toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between text-sm text-gray-400 font-bold">
                     <span>رسوم التوصيل:</span>
                     <span>₪{order.totals.deliveryCost.toFixed(2)}</span>
                   </div>
                   <div className="flex justify-between items-center pt-4">
                     <span className="text-gray-800 font-black text-xl tracking-tight">الإجمالي النهائي:</span>
                     <span className="text-3xl font-black pink-primary">₪{order.totals.grandTotal.toFixed(2)}</span>
                   </div>
                </div>
              </div>

              {/* Admin Actions */}
              <div className="lg:w-auto flex lg:flex-col gap-3 justify-center">
                 <button 
                  onClick={() => handleStatusUpdate(order.id, OrderStatus.EXECUTED)}
                  className="p-4 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                  title="تحديد كمنفذ"
                 >
                   <Check size={24} />
                 </button>
                 <button 
                  onClick={() => setConfirmDeleteId(order.id)}
                  className="p-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                  title="حذف الطلب"
                 >
                   <Trash2 size={24} />
                 </button>
                 <a 
                  href={`https://wa.me/${order.customer.phoneOrWhatsApp}`}
                  target="_blank"
                  className="p-4 bg-green-50 text-green-600 rounded-2xl hover:bg-green-600 hover:text-white transition-all shadow-sm"
                  title="مراسلة العميل"
                 >
                   <MessageCircle size={24} />
                 </a>
              </div>
            </div>

            {/* Cancel Reason Modal-like Overlay */}
            {activeCancelId === order.id && (
              <div className="p-8 bg-red-50 border-t border-red-100 flex flex-col md:flex-row gap-6 items-center animate-slide-in-top">
                <input 
                  type="text" 
                  placeholder="أدخل سبب الإلغاء بدقة..."
                  className="flex-1 p-5 bg-white rounded-3xl outline-none focus:ring-4 ring-red-200 border border-red-100 font-bold text-gray-700"
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                />
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleStatusUpdate(order.id, OrderStatus.REJECTED, cancelReason)}
                    className="bg-red-600 text-white px-10 py-5 rounded-3xl font-bold shadow-xl shadow-red-100 active:scale-95"
                  >
                    تأكيد الإلغاء
                  </button>
                  <button onClick={() => setActiveCancelId(null)} className="text-gray-400 font-bold px-6 py-5 hover:text-gray-600">تراجع</button>
                </div>
              </div>
            )}

            {/* Custom Delete Confirmation */}
            {confirmDeleteId === order.id && (
              <div className="p-10 bg-gray-900 text-white flex flex-col md:flex-row items-center justify-between gap-8 border-t border-black/50 animate-in fade-in zoom-in duration-300">
                <div className="flex items-center gap-6">
                  <div className="p-5 bg-red-600 rounded-full animate-bounce">
                    <AlertTriangle size={40} />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black mb-1">هل أنت متأكد من الحذف؟</h4>
                    <p className="text-gray-400 text-lg">سيتم مسح طلب العميل <span className="text-white font-bold">{order.customer.name}</span> نهائياً من النظام.</p>
                  </div>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                  <button 
                    onClick={() => handleDelete(order.id)}
                    className="flex-1 md:flex-none bg-red-600 hover:bg-red-700 text-white px-12 py-5 rounded-3xl font-black text-xl transition-all shadow-2xl shadow-red-900/50"
                  >
                    نعم، احذف نهائياً
                  </button>
                  <button 
                    onClick={() => setConfirmDeleteId(null)}
                    className="flex-1 md:flex-none bg-white/10 hover:bg-white/20 text-white px-12 py-5 rounded-3xl font-black text-xl transition-all"
                  >
                    تراجع
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {filteredOrders.length === 0 && (
          <div className="text-center py-40 bg-white rounded-[50px] border-4 border-dashed border-gray-100 flex flex-col items-center">
             <ShoppingCart size={80} className="text-gray-100 mb-6" />
             <p className="text-gray-400 font-bold text-xl">لا توجد طلبات في هذا القسم حالياً</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
