import React, { useState } from 'react';
import { Palette, Check, Moon, Star, Snowflake, Sparkles, Flame, Heart } from 'lucide-react';
import { useApp } from '../App';
import { dataService } from '../services/dataService';
import { THEME_PRESETS } from '../constants';

const AdminThemes: React.FC = () => {
  const { settings, refreshData } = useApp();
  const [activeId, setActiveId] = useState(settings.activeThemeId);
  const [saveStatus, setSaveStatus] = useState(false);

  const handleApply = (id: string) => {
    setActiveId(id);
    const updatedSettings = { ...settings, activeThemeId: id };
    dataService.saveSettings(updatedSettings);
    setSaveStatus(true);
    refreshData();
    setTimeout(() => setSaveStatus(false), 3000);
  };

  const getIcon = (name: string) => {
    switch (name) {
      case 'Moon': return <Moon size={24} />;
      case 'Star': return <Star size={24} />;
      case 'Snowflake': return <Snowflake size={24} />;
      case 'Sparkles': return <Sparkles size={24} />;
      case 'Flame': return <Flame size={24} />;
      default: return <Heart size={24} />;
    }
  };

  return (
    <div className="fade-in space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">مدير الثيمات والمناسبات</h1>
          <p className="text-gray-500">تغيير مظهر المتجر بما يتناسب مع المناسبات والأعياد.</p>
        </div>
        {saveStatus && (
          <div className="bg-green-100 text-green-700 px-6 py-2 rounded-full font-bold animate-bounce flex items-center gap-2">
            <Check size={20} /> تم تفعيل الثيم بنجاح!
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {THEME_PRESETS.map((theme) => (
          <div 
            key={theme.id}
            onClick={() => handleApply(theme.id)}
            className={`group relative overflow-hidden bg-white rounded-[40px] border-4 transition-all duration-500 cursor-pointer hover:shadow-2xl ${activeId === theme.id ? 'shadow-xl' : 'border-gray-100'}`}
            style={{borderColor: activeId === theme.id ? theme.primaryColor : undefined}}
          >
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div 
                  className="w-16 h-16 rounded-3xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-110"
                  style={{backgroundColor: theme.secondaryColor, color: theme.primaryColor}}
                >
                  {getIcon(theme.accentIcon)}
                </div>
                {activeId === theme.id && (
                  <div className="bg-green-500 text-white p-2 rounded-full shadow-lg">
                    <Check size={20} />
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-2">{theme.name}</h3>
                <p className="text-gray-400 text-sm mb-4">يغير الألوان والنصوص لتناسب الأجواء.</p>
              </div>

              {/* Theme Preview Box */}
              <div className="rounded-2xl border border-gray-50 p-4 space-y-3" style={{backgroundColor: theme.secondaryColor}}>
                 <div className="flex gap-2">
                   <div className="w-4 h-4 rounded-full" style={{backgroundColor: theme.primaryColor}} />
                   <div className="w-full h-4 bg-white rounded-full border border-gray-100" />
                 </div>
                 <div className="w-3/4 h-4 bg-white rounded-full border border-gray-100" />
                 <div 
                   className="w-full py-2 rounded-xl text-[10px] text-center font-bold text-white shadow-sm"
                   style={{backgroundColor: theme.primaryColor}}
                 >
                   {theme.bannerText}
                 </div>
              </div>

              <button 
                className={`w-full py-4 rounded-2xl font-bold transition-all ${activeId === theme.id ? 'opacity-50 cursor-default' : 'hover:scale-105 shadow-md'}`}
                style={{
                  backgroundColor: activeId === theme.id ? '#f3f4f6' : theme.primaryColor,
                  color: activeId === theme.id ? '#9ca3af' : 'white'
                }}
              >
                {activeId === theme.id ? 'مفعل حالياً' : 'تفعيل الثيم الآن'}
              </button>
            </div>
            
            {/* Color accent strip */}
            <div className="absolute top-0 right-0 w-1 h-full" style={{backgroundColor: theme.primaryColor}} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminThemes;
