
import React from 'react';
import { useApp } from '../App';
import { Moon, Star, Heart, Snowflake, Sparkles, Gift } from 'lucide-react';

const ThemeDecorations: React.FC = () => {
  const { activeTheme } = useApp();
  const type = activeTheme.overlayType || 'none';

  if (type === 'none') return null;

  const renderFloatingElements = () => {
    const elements = [];
    const count = 20;

    for (let i = 0; i < count; i++) {
      const style: React.CSSProperties = {
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 10}s`,
        animationDuration: `${15 + Math.random() * 25}s`,
        opacity: 0.2 + Math.random() * 0.5,
        transform: `scale(${0.6 + Math.random() * 0.8})`,
      };

      let icon;
      switch (type) {
        case 'snow': icon = <Snowflake size={32} />; break;
        case 'lanterns': icon = <Moon size={32} />; break;
        case 'hearts': icon = <Heart size={32} />; break;
        case 'sparkles': icon = <Sparkles size={32} />; break;
        case 'stars': icon = <Star size={32} />; break;
        default: icon = null;
      }

      elements.push(
        <div 
          key={i} 
          className="fixed pointer-events-none z-[5] animate-float-slow" 
          style={{
            ...style,
            top: '-60px',
            color: activeTheme.primaryColor
          }}
        >
          {icon}
        </div>
      );
    }
    return elements;
  };

  const renderFixedDecor = () => {
    switch (type) {
      case 'lanterns': // Ramadan Theme
        return (
          <>
            <div className="fixed top-0 left-0 w-48 h-48 pointer-events-none z-10 opacity-30 select-none">
              <Moon className="w-full h-full text-purple-600 rotate-12" />
            </div>
            <div className="fixed top-4 right-4 bg-purple-600 text-white px-8 py-3 rounded-full font-black shadow-2xl z-[60] animate-bounce">
              رمضان كريم 🌙
            </div>
          </>
        );
      case 'snow': // Christmas Theme
        return (
          <>
             <div className="fixed top-0 right-0 w-64 h-64 pointer-events-none z-10 opacity-20 select-none">
              <Gift className="w-full h-full text-red-600 -rotate-12" />
            </div>
            <div className="fixed top-4 right-4 bg-red-600 text-white px-8 py-3 rounded-full font-black shadow-2xl z-[60] animate-bounce">
              هدايا الكريسماس 🎄
            </div>
          </>
        );
      case 'sparkles': // Eid / New Year Theme
        return (
          <div className="fixed top-4 right-4 bg-emerald-600 text-white px-8 py-3 rounded-full font-black shadow-2xl z-[60] animate-bounce">
             كل عام وأنتم بخير ✨
          </div>
        );
      case 'stars': // Eid Adha Theme
        return (
          <div className="fixed top-4 right-4 bg-amber-600 text-white px-8 py-3 rounded-full font-black shadow-2xl z-[60] animate-bounce">
             أضحى مبارك 🐏
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {renderFloatingElements()}
      {renderFixedDecor()}
      <style>{`
        @keyframes floatSlow {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(115vh) rotate(720deg); opacity: 0; }
        }
        .animate-float-slow {
          animation: floatSlow linear infinite;
        }
      `}</style>
    </div>
  );
};

export default ThemeDecorations;
