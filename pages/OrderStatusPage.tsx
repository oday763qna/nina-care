import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Clock, XCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { dataService } from '../services/dataService';
import { Order, OrderStatus } from '../types';
import { supabase } from '../services/supabaseClient';

const OrderStatusPage: React.FC = () => {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);

  const fetchOrder = async () => {
    const orders = await dataService.getOrders();
    const found = orders.find(o => o.id === id);
    if (found) setOrder(found);
  };

  useEffect(() => {
    fetchOrder();

    // استماع لحظي لتحديثات هذا الطلب فقط
    const channel = supabase
      .channel(`order-sync-${id}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'orders',
        filter: `id=eq.${id}` 
      }, (payload) => {
        setOrder(payload.new as Order);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  if (!order) return <div className="text-center py-20 font-bold text-gray-400">جاري تحميل بيانات الطلب...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 fade-in text-center">
      <div className="bg-white p-12 rounded-[40px] shadow-2xl border border-pink-50">
        {order.status === OrderStatus.PENDING && (
          <>
            <div className="w-24 h-24 bg-yellow-50 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
              <Clock size={48} />
            </div>
            <h1 className="text-3xl font-bold mb-4 text-gray-800">طلبك قيد المراجعة</h1>
            <p className="text-gray-500 text-lg mb-2">شكراً لثقتك بنا، {order.customer.name}!</p>
            <p className="text-gray-400">نقوم الآن بمراجعة طلبك وسنتواصل معك قريباً عبر واتساب.</p>
          </>
        )}

        {order.status === OrderStatus.ACCEPTED && (
          <>
            <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <CheckCircle size={48} />
            </div>
            <h1 className="text-3xl font-bold mb-4 text-green-600">تم قبول الطلب</h1>
            <p className="text-gray-600 text-lg mb-4">يسعدنا إبلاغك بأن طلبك رقم <span className="font-bold">#{order.id}</span> جاهز للتوصيل.</p>
            <div className="bg-green-50 p-6 rounded-2xl border border-green-100 text-green-700 mb-8">
              <p className="font-bold">وقت التوصيل المتوقع:</p>
              <p className="text-xl">يوم إلى يومين عمل</p>
            </div>
          </>
        )}

        {order.status === OrderStatus.REJECTED && (
          <>
            <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <XCircle size={48} />
            </div>
            <h1 className="text-3xl font-bold mb-4 text-red-600">تم إلغاء الطلب</h1>
            <div className="bg-red-50 p-6 rounded-2xl border border-red-100 text-red-700 mb-8">
              <p className="font-bold">السبب:</p>
              <p className="text-lg">{order.cancelReason || 'غير محدد'}</p>
            </div>
            <p className="text-gray-500">لمزيد من الاستفسار، يرجى التواصل معنا عبر واتساب.</p>
          </>
        )}

        {order.status === OrderStatus.EXECUTED && (
          <>
            <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle size={48} />
            </div>
            <h1 className="text-3xl font-bold mb-4 text-blue-600">تم التوصيل بنجاح</h1>
            <p className="text-gray-500 text-lg mb-8">شكراً لتسوقك من Nino Care. نتمنى أن تنال منتجاتنا إعجابك!</p>
          </>
        )}

        <div className="mt-12 pt-12 border-t border-gray-50 text-right">
          <h3 className="font-bold text-lg mb-4">تفاصيل الطلب:</h3>
          <div className="space-y-2 text-gray-600">
            <div className="flex justify-between">
              <span>رقم الطلب:</span>
              <span className="font-mono font-bold">#{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span>المنطقة:</span>
              <span>{order.customer.deliveryArea}</span>
            </div>
            <div className="flex justify-between">
              <span>المجموع الفرعي:</span>
              <span>₪{order.totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>رسوم التوصيل:</span>
              <span>₪{order.totals.deliveryCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg pt-2 border-t border-dashed border-gray-100">
              <span className="font-bold">الإجمالي الكلي:</span>
              <span className="font-bold pink-primary">₪{order.totals.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <Link to="/" className="mt-12 inline-flex items-center gap-2 text-pink-600 font-bold hover:gap-4 transition-all">
          <ArrowRight size={20} />
          العودة للتسوق
        </Link>
      </div>
    </div>
  );
};

export default OrderStatusPage;