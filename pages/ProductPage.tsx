
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, ChevronRight, ChevronLeft, Heart, Share2, ArrowRight } from 'lucide-react';
import { useApp } from '../App';

const ProductPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addToCart, categories } = useApp();
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);

  const product = products.find(p => p.id === id);
  if (!product) return <div className="text-center py-20">المنتج غير موجود</div>;

  const category = categories.find(c => c.id === product.categoryId);
  const discountedPrice = product.discount.active 
    ? product.price * (1 - product.discount.percent / 100) 
    : product.price;

  const handleAddToCart = () => {
    addToCart(product, qty);
    navigate('/cart');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 fade-in">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-pink-600 mb-8 hover:translate-x-2 transition-transform"
      >
        <ArrowRight size={20} />
        <span>العودة للتسوق</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-white rounded-3xl overflow-hidden shadow-lg border border-pink-50 relative group">
            <img 
              src={product.images[activeImage]} 
              alt={product.name} 
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
            {product.discount.active && (
              <div className="absolute top-6 right-6 bg-pink-500 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                خصم {product.discount.percent}%
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-4">
              {product.images.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-pink-500 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col">
          <span className="text-pink-600 font-medium mb-2">{category?.name}</span>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{product.name}</h1>
          
          <div className="flex items-center gap-4 mb-8">
            <span className="text-3xl font-bold text-pink-600">₪{discountedPrice.toFixed(2)}</span>
            {product.discount.active && (
              <span className="text-xl text-gray-400 line-through">₪{product.price.toFixed(2)}</span>
            )}
          </div>

          <p className="text-gray-600 leading-relaxed mb-8 text-lg whitespace-pre-wrap">
            {product.description}
          </p>

          <div className="mt-auto space-y-6">
            <div className="flex items-center gap-6">
              <span className="font-bold text-gray-700">الكمية:</span>
              <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 gap-6 shadow-inner">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="text-xl font-bold text-gray-600">-</button>
                <span className="text-xl font-bold w-4 text-center">{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className="text-xl font-bold text-gray-600">+</button>
              </div>
            </div>

            <button 
              onClick={handleAddToCart}
              className="w-full pink-primary-bg text-white py-5 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              <ShoppingCart size={24} />
              إضافة إلى السلة
            </button>
            
            <div className="bg-pink-50 p-6 rounded-2xl border border-pink-100 space-y-3">
               <p className="flex items-center gap-3 text-pink-700">
                  <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                  توصيل سريع خلال 24-48 ساعة
               </p>
               <p className="flex items-center gap-3 text-pink-700">
                  <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                  الدفع عند الاستلام كاش
               </p>
               <p className="flex items-center gap-3 text-pink-700">
                  <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                  منتج أصلي 100%
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
