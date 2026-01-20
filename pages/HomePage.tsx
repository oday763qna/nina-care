import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, ShoppingBag, Heart, Moon, Star, Snowflake, Sparkles, Flame } from 'lucide-react';
import { useApp } from '../App';
import { dataService } from '../services/dataService';
import { Product, Ad } from '../types';

const HomePage: React.FC = () => {
  const { products, categories, addToCart, activeTheme } = useApp();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [ads, setAds] = useState<Ad[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  
  const categoryId = searchParams.get('cat');

  useEffect(() => {
    const fetchedAds = dataService.getAds().filter(a => a.active);
    // Shuffle ads
    setAds([...fetchedAds].sort(() => Math.random() - 0.5));
  }, []);

  useEffect(() => {
    if (ads.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentAdIndex(prev => (prev + 1) % ads.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [ads]);

  const filteredProducts = products.filter(p => {
    const matchesCategory = categoryId ? p.categoryId === categoryId : true;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderAccentIcon = () => {
    switch (activeTheme.accentIcon) {
      case 'Moon': return <Moon className="animate-pulse" />;
      case 'Star': return <Star className="animate-pulse" />;
      case 'Snowflake': return <Snowflake className="animate-spin-slow" />;
      case 'Sparkles': return <Sparkles className="animate-bounce" />;
      case 'Flame': return <Flame className="animate-bounce" />;
      default: return <Heart className="animate-bounce" />;
    }
  };

  return (
    <div className="fade-in">
      {/* Hero Ads */}
      <section className="relative h-[400px] md:h-[500px] overflow-hidden">
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10 text-center w-full px-4">
           <div 
             className="inline-flex items-center gap-3 bg-white/95 px-8 py-3 rounded-full font-bold text-lg md:text-2xl shadow-2xl transition-all border-2"
             style={{borderColor: activeTheme.primaryColor, color: activeTheme.primaryColor}}
           >
             {renderAccentIcon()}
             {activeTheme.bannerText}
             {renderAccentIcon()}
           </div>
        </div>
        
        {ads.map((ad, idx) => (
          <div 
            key={ad.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentAdIndex ? 'opacity-100' : 'opacity-0'}`}
          >
            <img src={ad.imageUrl} alt="Ad" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        ))}
        
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {ads.map((_, idx) => (
            <button 
              key={idx}
              onClick={() => setCurrentAdIndex(idx)}
              className={`w-3 h-3 rounded-full transition-all ${idx === currentAdIndex ? 'bg-white w-8' : 'bg-white/50'}`}
            />
          ))}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-20">
        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4">
          <Search className="text-gray-400" />
          <input 
            type="text" 
            placeholder="ابحثي عن منتجك المفضل..."
            className="w-full outline-none text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Categories Bar */}
        <div className="flex gap-4 overflow-x-auto py-8 no-scrollbar">
          <Link 
            to="/"
            className={`px-6 py-3 rounded-full whitespace-nowrap transition-all font-bold ${!categoryId ? 'text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-opacity-50'}`}
            style={{backgroundColor: !categoryId ? activeTheme.primaryColor : undefined}}
          >
            جميع المنتجات
          </Link>
          {categories.filter(c => c.id !== '1').map(cat => (
            <Link 
              key={cat.id}
              to={`/?cat=${cat.id}`}
              className={`px-6 py-3 rounded-full whitespace-nowrap transition-all font-bold ${categoryId === cat.id ? 'text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-opacity-50'}`}
              style={{backgroundColor: categoryId === cat.id ? activeTheme.primaryColor : undefined}}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Product Grid */}
        <section className="mb-20">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">
              {categoryId ? categories.find(c => c.id === categoryId)?.name : 'أحدث المنتجات'}
            </h2>
            <span className="text-gray-400">{filteredProducts.length} منتج</span>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
              {filteredProducts.map(product => (
                <div key={product.id} className="bg-white rounded-3xl overflow-hidden group shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col">
                  <Link to={`/product/${product.id}`} className="relative aspect-square overflow-hidden block">
                    <img 
                      src={product.images[0]} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {product.discount.active && (
                      <div className="absolute top-4 right-4 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse shadow-md" style={{backgroundColor: activeTheme.primaryColor}}>
                        وفر {product.discount.percent}%
                      </div>
                    )}
                  </Link>
                  <div className="p-4 flex flex-col flex-grow">
                    <Link to={`/product/${product.id}`} className="text-gray-800 font-bold mb-2 line-clamp-1 hover:opacity-70 transition-colors">
                      {product.name}
                    </Link>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex flex-col">
                        {product.discount.active ? (
                          <>
                            <span className="font-bold text-lg" style={{color: activeTheme.primaryColor}}>₪{(product.price * (1 - product.discount.percent / 100)).toFixed(2)}</span>
                            <span className="text-gray-400 text-sm line-through">₪{product.price.toFixed(2)}</span>
                          </>
                        ) : (
                          <span className="text-gray-800 font-bold text-lg">₪{product.price.toFixed(2)}</span>
                        )}
                      </div>
                      <button 
                        onClick={() => addToCart(product)}
                        className="w-10 h-10 rounded-full flex items-center justify-center hover:opacity-80 transition-all shadow-sm"
                        style={{backgroundColor: `${activeTheme.primaryColor}10`, color: activeTheme.primaryColor}}
                      >
                        <ShoppingBag size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                <Search size={40} />
              </div>
              <p className="text-gray-500 text-lg">لم يتم العثور على منتجات في هذا التصنيف.</p>
            </div>
          )}
        </section>
      </div>
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default HomePage;
