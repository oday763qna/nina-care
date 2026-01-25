
import React, { useState } from 'react';
import { Palette, Check, Moon, Star, Snowflake, Sparkles, Flame, Heart, Gift, Sun } from 'lucide-react';
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
      case 'Gift': return <Gift size={24} />;
      case 'Sun': return <Sun size={24} />;
      default: return <Heart size={24} />;
    }
  };

  return (
    <div className="fade-in space-y-12 pb-32">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-gray-800 tracking-tight">مدير المظهر والاحتفالات</h1>
          <p className="text-gray-500 font-bold mt-2">خصصي متجر نينو كير بما يتناسب مع المواسم والأعياد بأجمل الأشكال.</p>
        </div>
        {saveStatus && (
          <div className="bg-green-100 text-green-700 px-8 py-3 rounded-full font-black animate-bounce flex items-center gap-3 shadow-sm border border-green-200">
            <Check size={24} /> تم تغيير مظهر المتجر!
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {THEME_PRESETS.map((theme) => (
          <div 
            key={theme.id}
            onClick={() => handleApply(theme.id)}
            className={`group relative overflow-hidden bg-white rounded-[50px] border-4 transition-all duration-700 cursor-pointer hover:shadow-2xl ${activeId === theme.id ? 'shadow-2xl scale-105 z-10' : 'border-gray-50 opacity-80 hover:opacity-100'}`}
            style={{borderColor: activeId === theme.id ? theme.primaryColor : undefined}}
          >
            <div className="p-10 space-y-8">
              <div className="flex justify-between items-start">
                <div 
                  className="w-20 h-20 rounded-[30px] flex items-center justify-center shadow-inner transition-transform group-hover:rotate-12 duration-500"
                  style={{backgroundColor: theme.secondaryColor, color: theme.primaryColor}}
                >
                  {getIcon(theme.accentIcon)}
                </div>
                {activeId === theme.id && (
                  <div className="bg-green-500 text-white p-3 rounded-full shadow-xl">
                    <Check size={24} />
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-2xl font-black text-gray-800 mb-3 tracking-tight">{theme.name}</h3>
                <p className="text-gray-400 text-sm font-bold leading-relaxed">
                  يغير الألوان، يضيف {theme.overlayType === 'snow' ? 'الثلوج' : (theme.overlayType === 'lanterns' ? 'الفوانيس' : 'الزينة التفاعلية')} ويحدث الرسائل الترحيبية.
                </p>
              </div>

              {/* Theme Preview Box */}
              <div className="rounded-[35px] border border-gray-50 p-6 space-y-4" style={{backgroundColor: theme.secondaryColor}}>
                 <div className="flex gap-3">
                   <div className="w-6 h-6 rounded-full shadow-sm" style={{backgroundColor: theme.primaryColor}} />
                   <div className="w-full h-6 bg-white rounded-full border border-gray-100" />
                 </div>
                 <div className="w-3/4 h-6 bg-white rounded-full border border-gray-100" />
                 <div 
                   className="w-full py-3 rounded-2xl text-xs text-center font-black text-white shadow-lg"
                   style={{backgroundColor: theme.primaryColor}}
                 >
                   {theme.bannerText}
                 </div>
              </div>

              <button 
                className={`w-full py-5 rounded-[25px] font-black text-lg transition-all ${activeId === theme.id ? 'opacity-50 cursor-default' : 'hover:scale-[1.02] active:scale-95 shadow-xl'}`}
                style={{
                  backgroundColor: activeId === theme.id ? '#f3f4f6' : theme.primaryColor,
                  color: activeId === theme.id ? '#9ca3af' : 'white'
                }}
              >
                {activeId === theme.id ? 'المظهر النشط' : 'تفعيل المظهر الآن'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminThemes;
