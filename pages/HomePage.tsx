import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, ShoppingBag } from 'lucide-react';
import { useApp } from '../App';

const HomePage: React.FC = () => {
  const { products, categories, ads, addToCart, activeTheme } = useApp();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  
  const categoryId = searchParams.get('cat');

  // تصفية الإعلانات النشطة فقط
  const activeAds = ads.filter(a => a.active);

  useEffect(() => {
    if (activeAds.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentAdIndex(prev => (prev + 1) % activeAds.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeAds.length]);

  const filteredProducts = products.filter(p => {
    const matchesCategory = categoryId ? p.categoryId === categoryId : true;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fade-in bg-white">
      {/* Hero Header - عرض الإعلانات */}
      <section className="relative h-[350px] md:h-[500px] overflow-hidden bg-gray-100">
        {activeAds.length > 0 ? (
          activeAds.map((ad, idx) => (
            <div 
              key={ad.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentAdIndex ? 'opacity-100' : 'opacity-0'}`}
            >
              <img src={ad.imageUrl} alt="Ad" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-white/10" />
            </div>
          ))
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
             <img src="https://i.imgur.com/9eBXADa.jpeg" alt="Default Ad" className="w-full h-full object-cover opacity-50" />
          </div>
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pointer-events-none">
           <div className="bg-white/80 backdrop-blur-md px-8 py-4 rounded-[40px] shadow-2xl border-2 border-pink-500 mb-4">
              <h2 className="text-xl md:text-3xl font-black text-pink-600">{activeTheme.bannerText}</h2>
           </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 -mt-10 relative z-30">
        {/* Search & Categories */}
        <div className="bg-white/90 backdrop-blur-xl p-6 rounded-[40px] shadow-2xl border border-pink-50 mb-12">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-pink-400" />
              <input 
                type="text" 
                placeholder="ما الذي تبحثين عنه اليوم؟"
                className="w-full p-5 pr-12 bg-pink-50/50 rounded-3xl outline-none focus:ring-2 ring-pink-200 font-bold transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-3 overflow-x-auto py-6 no-scrollbar mt-4">
            <Link 
              to="/"
              className={`px-8 py-3 rounded-2xl whitespace-nowrap transition-all font-bold text-sm ${!categoryId ? 'bg-pink-600 text-white shadow-lg shadow-pink-200' : 'bg-gray-50 text-gray-500 hover:bg-pink-50'}`}
            >
              الكل
            </Link>
            {categories.map(cat => (
              <Link 
                key={cat.id}
                to={`/?cat=${cat.id}`}
                className={`px-8 py-3 rounded-2xl whitespace-nowrap transition-all font-bold text-sm ${categoryId === cat.id ? 'bg-pink-600 text-white shadow-lg' : 'bg-gray-50 text-gray-500'}`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Product Listing */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-24">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 group border border-gray-50 flex flex-col">
              <Link to={`/product/${product.id}`} className="relative aspect-[4/5] block overflow-hidden">
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                {product.discount.active && (
                  <div className="absolute top-4 right-4 bg-pink-600 text-white px-3 py-1 rounded-xl text-[10px] font-black shadow-lg">
                    خصم {product.discount.percent}%
                  </div>
                )}
              </Link>
              <div className="p-5 flex flex-col flex-grow text-center">
                <h3 className="font-black text-gray-800 mb-2 line-clamp-1">{product.name}</h3>
                <div className="mt-auto">
                  <div className="flex flex-col items-center mb-4">
                    <span className="text-xl font-black text-pink-600">₪{product.discount.active ? (product.price * (1 - product.discount.percent / 100)).toFixed(2) : product.price.toFixed(2)}</span>
                    {product.discount.active && <span className="text-xs text-gray-300 line-through">₪{product.price.toFixed(2)}</span>}
                  </div>
                  <button 
                    onClick={() => addToCart(product)}
                    className="w-full bg-pink-50 text-pink-600 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 group-hover:bg-pink-600 group-hover:text-white transition-all shadow-sm"
                  >
                    إضافة للسلة
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;