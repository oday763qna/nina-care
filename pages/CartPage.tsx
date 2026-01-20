
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, ArrowLeft, ArrowRight, Minus, Plus } from 'lucide-react';
import { useApp } from '../App';

const CartPage: React.FC = () => {
  const { cart, updateCartQty, removeFromCart } = useApp();
  const navigate = useNavigate();

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center fade-in">
        <div className="w-32 h-32 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-8 text-pink-200">
          <ShoppingBag size={64} />
        </div>
        <h2 className="text-3xl font-bold mb-4">سلة التسوق فارغة</h2>
        <p className="text-gray-500 text-lg mb-8">ابدأي بإضافة بعض المنتجات الرائعة لجمالك!</p>
        <Link to="/" className="inline-flex items-center gap-2 pink-primary-bg text-white px-10 py-4 rounded-full font-bold text-lg hover:shadow-lg transition-all">
          <ArrowRight size={20} />
          العودة للتسوق
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 fade-in">
      <h1 className="text-3xl font-bold mb-10 border-r-4 border-pink-500 pr-4">سلة المشتريات</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          {cart.map(item => (
            <div key={item.productId} className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-pink-50 flex items-center gap-6">
              <img src={item.image} alt={item.name} className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-2xl" />
              <div className="flex-1">
                <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-2">{item.name}</h3>
                <p className="text-pink-600 font-bold mb-4">₪{item.price.toFixed(2)}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center bg-gray-50 rounded-full px-4 py-2 gap-4">
                    <button onClick={() => updateCartQty(item.productId, item.qty - 1)} className="p-1 hover:text-pink-600"><Minus size={18} /></button>
                    <span className="font-bold w-6 text-center">{item.qty}</span>
                    <button onClick={() => updateCartQty(item.productId, item.qty + 1)} className="p-1 hover:text-pink-600"><Plus size={18} /></button>
                  </div>
                  <button onClick={() => removeFromCart(item.productId)} className="text-red-400 hover:text-red-600 p-2"><Trash2 size={20} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-pink-50 sticky top-24">
            <h3 className="text-xl font-bold mb-6">ملخص الطلب</h3>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-gray-500">
                <span>المجموع الفرعي</span>
                <span>₪{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>رسوم التوصيل</span>
                <span className="text-green-600">سيحدد لاحقاً</span>
              </div>
              <div className="h-px bg-pink-100 my-4" />
              <div className="flex justify-between text-2xl font-bold pink-primary">
                <span>الإجمالي</span>
                <span>₪{subtotal.toFixed(2)}</span>
              </div>
            </div>

            <button 
              onClick={() => navigate('/checkout')}
              className="w-full pink-primary-bg text-white py-4 rounded-2xl font-bold text-xl hover:shadow-xl transition-all shadow-md"
            >
              إتمام الطلب
            </button>
            <p className="text-center text-gray-400 text-sm mt-4">الدفع عند الاستلام كاش</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
