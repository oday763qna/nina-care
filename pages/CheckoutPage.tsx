
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { dataService } from '../services/dataService';
import { Order, OrderStatus } from '../types';
import { AlertCircle, CheckCircle2, Truck, MapPin } from 'lucide-react';

const DELIVERY_OPTIONS = [
  { id: 'west_bank', name: 'الضفة الغربية', price: 20 },
  { id: 'jerusalem', name: 'القدس', price: 30 },
  { id: 'israel', name: 'داخل الخط الأخضر', price: 70 }
];

const CheckoutPage: React.FC = () => {
  const { cart, clearCart } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    city: '',
    phone: '',
    address: '',
    deliveryAreaId: 'west_bank'
  });

  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + item.price * item.qty, 0), [cart]);
  const deliveryCost = useMemo(() => {
    const option = DELIVERY_OPTIONS.find(opt => opt.id === form.deliveryAreaId);
    return option ? option.price : 0;
  }, [form.deliveryAreaId]);
  
  const grandTotal = subtotal + deliveryCost;

  const validatePhone = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length >= 9;
  };

  // Fix: Make handleSubmit async to support awaiting dataService.getOrders and saveOrders
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name || !form.city || !form.phone || !form.address) {
      setError('يرجى ملء جميع الحقول المطلوبة للمتابعة');
      return;
    }

    if (!validatePhone(form.phone)) {
      setError('يرجى إدخال رقم واتساب صحيح (9 أرقام على الأقل)');
      return;
    }

    setLoading(true);
    
    const selectedArea = DELIVERY_OPTIONS.find(opt => opt.id === form.deliveryAreaId);

    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      items: [...cart],
      totals: {
        subtotal,
        deliveryCost,
        discountTotal: 0,
        grandTotal
      },
      customer: {
        name: form.name,
        city: form.city,
        phoneOrWhatsApp: form.phone,
        address: form.address,
        deliveryArea: selectedArea ? selectedArea.name : ''
      },
      status: OrderStatus.PENDING,
      createdAt: Date.now()
    };

    try {
      // Fix: Await async getOrders call and use the newly added saveOrders plural method
      const existingOrders = await dataService.getOrders();
      await dataService.saveOrders([newOrder, ...existingOrders]);

      setTimeout(() => {
        clearCart();
        navigate(`/order-status/${newOrder.id}`);
      }, 1500);
    } catch (err) {
      console.error(err);
      setError('حدث خطأ أثناء إتمام الطلب، يرجى المحاولة لاحقاً');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 fade-in">
      <h1 className="text-3xl font-bold mb-10 text-center">إتمام عملية الشراء</h1>

      {error && (
        <div className="mb-8 bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl flex items-center gap-3 animate-shake">
          <AlertCircle size={20} />
          <p className="font-bold">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-pink-50 space-y-5">
            <h2 className="text-xl font-bold mb-2 text-gray-700">معلومات التوصيل</h2>
            
            <div className="space-y-4 mb-6">
              <label className="block text-gray-700 font-bold mb-2 flex items-center gap-2">
                <Truck size={20} className="pink-primary" /> منطقة التوصيل
              </label>
              <div className="grid grid-cols-1 gap-3">
                {DELIVERY_OPTIONS.map((option) => (
                  <label 
                    key={option.id}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${form.deliveryAreaId === option.id ? 'border-pink-500 bg-pink-50' : 'border-gray-100 bg-gray-50 hover:border-pink-200'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${form.deliveryAreaId === option.id ? 'border-pink-500 bg-pink-500' : 'border-gray-300'}`}>
                        {form.deliveryAreaId === option.id && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <span className={`font-bold ${form.deliveryAreaId === option.id ? 'text-pink-700' : 'text-gray-600'}`}>{option.name}</span>
                    </div>
                    <span className={`font-bold ${form.deliveryAreaId === option.id ? 'text-pink-600' : 'text-gray-500'}`}>₪{option.price}</span>
                    <input 
                      type="radio" 
                      name="deliveryArea" 
                      className="hidden" 
                      value={option.id}
                      checked={form.deliveryAreaId === option.id}
                      onChange={() => setForm({...form, deliveryAreaId: option.id})}
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="h-px bg-pink-50 my-6" />

            <div>
              <label className="block text-gray-600 mb-2 font-medium">
                الاسم الكامل <span className="text-pink-500">*</span>
              </label>
              <input 
                type="text" 
                required
                placeholder="أدخل اسمك الثلاثي"
                className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 outline-none focus:border-pink-300 focus:bg-white transition-all"
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
              />
            </div>

            <div className="bg-pink-50/50 p-4 rounded-2xl border border-pink-100">
              <label className="block text-pink-700 mb-2 font-bold flex items-center gap-2">
                رقم الواتساب <span className="text-pink-500">*</span>
                <span className="text-[10px] bg-pink-500 text-white px-2 py-0.5 rounded-full font-normal">ضروري جداً</span>
              </label>
              <input 
                type="tel" 
                required
                dir="ltr"
                className="w-full bg-white border border-pink-200 rounded-xl p-4 outline-none focus:border-pink-500 transition-all text-right font-bold text-lg"
                placeholder="05x-xxxxxxx"
                value={form.phone}
                onChange={e => setForm({...form, phone: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-gray-600 mb-2 font-medium">
                المدينة / القرية <span className="text-pink-500">*</span>
              </label>
              <input 
                type="text" 
                required
                placeholder="اسم المدينة أو القرية"
                className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 outline-none focus:border-pink-300 focus:bg-white transition-all"
                value={form.city}
                onChange={e => setForm({...form, city: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-gray-600 mb-2 font-medium">
                العنوان التفصيلي <span className="text-pink-500">*</span>
              </label>
              <textarea 
                required
                placeholder="مثال: شارع القدس، بجانب مسجد عمر"
                className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 outline-none focus:border-pink-300 focus:bg-white transition-all h-28 resize-none"
                value={form.address}
                onChange={e => setForm({...form, address: e.target.value})}
              ></textarea>
            </div>
          </div>
        </form>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-pink-50">
            <h2 className="text-xl font-bold mb-6">ملخص الطلبية</h2>
            <div className="space-y-4 max-h-60 overflow-y-auto no-scrollbar mb-6">
              {cart.map(item => (
                <div key={item.productId} className="flex justify-between items-center text-sm border-b border-gray-50 pb-3">
                  <div className="flex items-center gap-3">
                    <img src={item.image} alt="" className="w-12 h-12 object-cover rounded-lg border border-pink-50" />
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-800">{item.name}</span>
                      <span className="text-gray-400 text-xs">الكمية: {item.qty}</span>
                    </div>
                  </div>
                  <span className="font-bold text-gray-700">₪{(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="space-y-3 pt-2">
              <div className="flex justify-between text-gray-500">
                <span>المجموع الفرعي</span>
                <span>₪{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>التوصيل ({DELIVERY_OPTIONS.find(o => o.id === form.deliveryAreaId)?.name})</span>
                <span className="text-pink-600 font-bold">₪{deliveryCost}</span>
              </div>
              <div className="h-px bg-pink-100 my-2" />
              <div className="flex justify-between font-bold text-2xl pink-primary">
                <span>الإجمالي النهائي</span>
                <span>₪{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-3 bg-green-50 p-4 rounded-2xl border border-green-100 text-green-700">
              <CheckCircle2 size={24} className="shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-sm">الدفع عند الاستلام</p>
                <p>شامل سعر التوصيل الموضح أعلاه</p>
              </div>
            </div>
          </div>

          <button 
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full py-5 rounded-2xl font-bold text-xl text-white shadow-xl transition-all flex items-center justify-center gap-3 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'pink-primary-bg hover:scale-[1.02] active:scale-[0.98]'}`}
          >
            {loading ? (
              <>
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                جاري إرسال الطلب...
              </>
            ) : (
              'تأكيد الطلب الآن'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
