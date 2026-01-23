
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, ShoppingBag, ArrowLeft, ArrowRight } from 'lucide-react';
import { useApp } from '../App';

const HomePage: React.FC = () => {
  const { products, categories, ads, addToCart, activeTheme } = useApp();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  
  const categoryId = searchParams.get('cat');
  const activeAds = ads.filter(a => a.active);

  useEffect(() => {
    if (activeAds.length <= 1) {
      setCurrentAdIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setCurrentAdIndex(prev => (prev + 1) % activeAds.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [activeAds.length]);

  const filteredProducts = products.filter(p => {
    const matchesCategory = categoryId ? p.categoryId === categoryId : true;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fade-in bg-white">
      {/* Hero Header - عرض الإعلانات بتصميم احترافي */}
      <section className="relative h-[300px] md:h-[550px] overflow-hidden bg-pink-50">
        {activeAds.length > 0 ? (
          activeAds.map((ad, idx) => (
            <div 
              key={ad.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentAdIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            >
              <img src={ad.imageUrl} alt="Sale Banner" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            </div>
          ))
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-pink-100">
             <img src="https://i.imgur.com/9eBXADa.jpeg" alt="Default" className="w-full h-full object-cover opacity-50" />
          </div>
        )}
        
        {/* Slider Indicators */}
        {activeAds.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {activeAds.map((_, i) => (
              <button 
                key={i} 
                onClick={() => setCurrentAdIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-500 ${currentAdIndex === i ? 'w-8 bg-pink-600' : 'w-2 bg-white/50 hover:bg-white'}`}
              />
            ))}
          </div>
        )}
      </section>

      <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-30">
        {/* Search & Categories Bar */}
        <div className="bg-white/90 backdrop-blur-2xl p-6 rounded-[40px] shadow-2xl border border-white mb-12">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 relative group">
              <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-pink-400 group-focus-within:scale-110 transition-transform" />
              <input 
                type="text" 
                placeholder="ابحثي عن منتجات نينو..."
                className="w-full p-5 pr-14 bg-gray-50/50 rounded-3xl outline-none focus:ring-4 ring-pink-100 font-bold transition-all border border-transparent focus:border-pink-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-3 overflow-x-auto py-6 no-scrollbar mt-4 border-t border-gray-50">
            <Link 
              to="/"
              className={`px-10 py-3 rounded-2xl whitespace-nowrap transition-all font-black text-sm uppercase tracking-tighter ${!categoryId ? 'bg-pink-600 text-white shadow-xl shadow-pink-100 scale-105' : 'bg-gray-50 text-gray-400 hover:bg-pink-50 hover:text-pink-600'}`}
            >
              كل الأقسام
            </Link>
            {categories.map(cat => (
              <Link 
                key={cat.id}
                to={`/?cat=${cat.id}`}
                className={`px-10 py-3 rounded-2xl whitespace-nowrap transition-all font-black text-sm uppercase tracking-tighter ${categoryId === cat.id ? 'bg-pink-600 text-white shadow-xl scale-105' : 'bg-gray-50 text-gray-400 hover:bg-pink-50'}`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 mb-32">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white rounded-[38px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-700 group border border-gray-50 flex flex-col relative">
              <Link to={`/product/${product.id}`} className="relative aspect-[1/1.2] block overflow-hidden bg-gray-50">
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                {product.discount.active && (
                  <div className="absolute top-4 right-4 bg-pink-600 text-white px-3 py-1.5 rounded-2xl text-[10px] font-black shadow-xl animate-pulse">
                    وفر {product.discount.percent}%
                  </div>
                )}
              </Link>
              <div className="p-5 flex flex-col flex-grow text-center">
                <h3 className="font-bold text-gray-800 mb-3 line-clamp-1 group-hover:text-pink-600 transition-colors">{product.name}</h3>
                <div className="mt-auto">
                  <div className="flex items-center justify-center gap-3 mb-5">
                    <span className="text-xl font-black text-pink-600">₪{product.discount.active ? (product.price * (1 - product.discount.percent / 100)).toFixed(2) : product.price.toFixed(2)}</span>
                    {product.discount.active && <span className="text-xs text-gray-300 line-through font-bold">₪{product.price.toFixed(2)}</span>}
                  </div>
                  <button 
                    onClick={() => addToCart(product)}
                    className="w-full bg-pink-50 text-pink-600 py-4 rounded-[22px] font-black text-xs uppercase tracking-widest hover:bg-pink-600 hover:text-white transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
                  >
                    <ShoppingBag size={16} /> أضف للسلة
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full py-32 text-center text-gray-300 font-bold italic">
              عذراً، لم نجد نتائج لطلباتك...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
