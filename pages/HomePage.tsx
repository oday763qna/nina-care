
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, ShoppingBag, ArrowLeft, ArrowRight, Sparkles, ChevronRight, Layers } from 'lucide-react';
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

  // تحديد القسم النشط وأبنائه
  const activeCategory = categories.find(c => c.id === categoryId);
  const parentCategories = categories.filter(c => !c.parentId);
  const childCategories = categoryId ? categories.filter(c => c.parentId === categoryId) : [];

  return (
    <div className="fade-in bg-white/50 backdrop-blur-sm">
      {/* Hero Header */}
      <section className="relative h-[400px] md:h-[650px] overflow-hidden">
        {activeAds.length > 0 ? (
          activeAds.map((ad, idx) => (
            <div 
              key={ad.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentAdIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            >
              <img src={ad.imageUrl} alt="Sale Banner" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
            </div>
          ))
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-pink-100">
             <img src="https://i.imgur.com/9eBXADa.jpeg" alt="Default" className="w-full h-full object-cover opacity-50" />
          </div>
        )}
        
        {/* Welcome Text Overlay */}
        <div className="absolute inset-0 z-20 flex items-center justify-center text-center p-4">
           <div className="bg-black/20 backdrop-blur-xl p-8 md:p-16 rounded-[60px] border border-white/30 animate-in fade-in zoom-in duration-1000 shadow-[0_0_50px_rgba(0,0,0,0.3)]">
             <div className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-white text-gray-900 font-black text-xs uppercase tracking-[0.4em] mb-6 shadow-xl">
               <Sparkles size={16} className="text-pink-500 animate-pulse" /> NINA CARE
             </div>
             <h2 className="text-5xl md:text-8xl font-black text-white mb-8 drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] leading-tight tracking-tighter">
               {activeTheme.welcomeMessage || 'نينا كير'}
             </h2>
             <p className="text-white/95 font-black md:text-2xl max-w-2xl mx-auto leading-relaxed drop-shadow-md">
               {activeTheme.bannerText}
             </p>
           </div>
        </div>

        {activeAds.length > 1 && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-3">
            {activeAds.map((_, i) => (
              <button 
                key={i} 
                onClick={() => setCurrentAdIndex(i)}
                className={`h-2.5 rounded-full transition-all duration-500 ${currentAdIndex === i ? 'w-16 bg-white shadow-lg' : 'w-2.5 bg-white/40 hover:bg-white/60'}`}
              />
            ))}
          </div>
        )}
      </section>

      <div className="max-w-7xl mx-auto px-4 -mt-20 relative z-30">
        {/* Search & Categories Bar */}
        <div className="bg-white/90 backdrop-blur-3xl p-10 rounded-[55px] shadow-2xl border border-white/60 mb-20">
          <div className="flex flex-col md:flex-row gap-6 mb-10">
            <div className="flex-1 relative group">
              <Search className="absolute right-8 top-1/2 -translate-y-1/2 text-pink-500 group-focus-within:scale-125 transition-transform duration-500" />
              <input 
                type="text" 
                placeholder="ابحثي عن سر جمالكِ الخفي..."
                className="w-full p-7 pr-20 bg-gray-50/70 rounded-[35px] outline-none focus:ring-8 ring-pink-100 font-black transition-all border border-transparent focus:border-pink-300 text-xl shadow-inner"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="flex gap-5 overflow-x-auto py-2 no-scrollbar">
              <Link 
                to="/"
                className={`px-14 py-5 rounded-[28px] whitespace-nowrap transition-all font-black text-sm uppercase tracking-tighter shadow-sm border ${!categoryId ? 'bg-pink-600 text-white border-pink-600 shadow-2xl shadow-pink-200 scale-105' : 'bg-white text-gray-500 border-gray-100 hover:border-pink-300 hover:text-pink-600'}`}
              >
                جميع المنتجات
              </Link>
              {parentCategories.map(cat => (
                <Link 
                  key={cat.id}
                  to={`/?cat=${cat.id}`}
                  className={`px-14 py-5 rounded-[28px] whitespace-nowrap transition-all font-black text-sm uppercase tracking-tighter shadow-sm border ${categoryId === cat.id ? 'bg-pink-600 text-white border-pink-600 shadow-2xl scale-105' : 'bg-white text-gray-500 border-gray-100 hover:border-pink-300 hover:text-pink-600'}`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>

            {/* عرض الأقسام الفرعية (أقسام داخل القسم) */}
            {childCategories.length > 0 && (
              <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center gap-2 text-pink-600 font-black text-[10px] uppercase tracking-widest shrink-0">
                  <Layers size={14} /> أقسام فرعية
                </div>
                <div className="flex gap-3 overflow-x-auto py-2 no-scrollbar">
                  {childCategories.map(sub => (
                    <Link 
                      key={sub.id}
                      to={`/?cat=${sub.id}`}
                      className="px-8 py-3 bg-pink-50 text-pink-600 border border-pink-100 rounded-full text-xs font-bold hover:bg-pink-100 transition-all whitespace-nowrap"
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 md:gap-12 mb-40">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white rounded-[50px] overflow-hidden shadow-sm hover:shadow-[0_30px_60px_-15px_rgba(219,39,119,0.2)] transition-all duration-700 group border border-white flex flex-col relative translate-y-0 hover:-translate-y-4">
              <Link to={`/product/${product.id}`} className="relative aspect-[1/1.2] block overflow-hidden bg-gray-50">
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                {product.discount.active && (
                  <div className="absolute top-6 right-6 bg-pink-600 text-white px-6 py-2.5 rounded-full text-[12px] font-black shadow-2xl animate-pulse z-10">
                    وفر {product.discount.percent}%
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-700" />
              </Link>
              <div className="p-10 flex flex-col flex-grow text-center">
                <h3 className="font-black text-gray-900 text-xl mb-5 line-clamp-1 group-hover:text-pink-600 transition-colors">{product.name}</h3>
                <div className="mt-auto">
                  <div className="flex items-center justify-center gap-5 mb-10">
                    <span className="text-3xl font-black text-pink-600">₪{product.discount.active ? (product.price * (1 - product.discount.percent / 100)).toFixed(2) : product.price.toFixed(2)}</span>
                    {product.discount.active && <span className="text-sm text-gray-400 line-through font-bold">₪{product.price.toFixed(2)}</span>}
                  </div>
                  <button 
                    onClick={() => addToCart(product)}
                    className="w-full bg-pink-50 text-pink-600 py-6 rounded-[30px] font-black text-xs uppercase tracking-[0.2em] hover:bg-pink-600 hover:text-white transition-all shadow-sm active:scale-90 flex items-center justify-center gap-4 group/btn"
                  >
                    <ShoppingBag size={20} className="group-hover/btn:rotate-12 transition-transform" /> أضيفي للحقيبة
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full py-60 text-center">
              <div className="text-gray-100 mb-8 flex justify-center"><Search size={100} /></div>
              <p className="text-gray-400 font-black text-2xl tracking-tight">عذراً عزيزتي، لا توجد نتائج لهذا البحث...</p>
              <Link to="/" className="text-pink-500 font-bold mt-4 inline-block underline">عرض كل المنتجات</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
