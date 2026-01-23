
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Eye, EyeOff, Camera, X, Check, ImageIcon, Loader2 } from 'lucide-react';
import { dataService } from '../services/dataService';
import { useApp } from '../App';
import { Ad } from '../types';

const AdminAds: React.FC = () => {
  const { ads, refreshData } = useApp();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // تحديد الحد الأقصى بـ 1.5 ميجا لضمان سرعة البناء والتصفح
    if (file.size > 1.5 * 1024 * 1024) {
      alert("حجم الصورة كبير جداً. يرجى اختيار صورة أصغر من 1.5 ميجا لضمان سرعة المتجر.");
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAdd = async () => {
    if (!previewImage) return;
    
    setIsUploading(true);
    const newAd: Ad = { 
      id: `ad_${Date.now()}`, 
      imageUrl: previewImage, 
      active: true 
    };
    
    try {
      await dataService.saveAds([newAd]);
      await refreshData();
      setPreviewImage(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (err) {
      alert("حدث خطأ في المزامنة السحابية.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleToggle = async (ad: Ad) => {
    try {
      const updatedAd = { ...ad, active: !ad.active };
      await dataService.saveAds([updatedAd]);
      await refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('هل تريد حذف هذا البنر نهائياً؟')) {
      setDeletingId(id);
      try {
        await dataService.deleteAd(id);
        await refreshData();
      } catch (err) {
        alert("فشل الحذف. يرجى المحاولة لاحقاً.");
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="fade-in space-y-10 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-800 mb-2">إدارة بنرات العروض</h1>
          <p className="text-gray-500 font-bold text-sm">أضيفي إعلاناتك لتظهر في واجهة المتجر الرئيسية.</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-pink-50 overflow-hidden relative">
        <div className="flex flex-col md:flex-row gap-10 items-center">
          <div className="flex-1 space-y-6 text-right">
            <h3 className="text-xl font-bold flex items-center gap-2 justify-end">
              <Plus size={24} className="text-pink-500" /> إضافة إعلان جديد
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              ارفعي صوراً عرضية بمقاسات (1200x600) للحصول على أفضل مظهر.
            </p>
            <button 
              onClick={handleAdd}
              disabled={!previewImage || isUploading}
              className={`w-full pink-primary-bg text-white py-4 rounded-2xl font-bold transition-all shadow-lg flex items-center justify-center gap-3 ${isUploading || !previewImage ? 'opacity-50' : 'hover:scale-[1.01] active:scale-95'}`}
            >
              {isUploading ? <Loader2 className="animate-spin" /> : <ImageIcon size={20} />}
              {isUploading ? 'جاري الحفظ...' : 'حفظ ونشر الآن'}
            </button>
          </div>

          <div className="w-full md:w-1/2">
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`aspect-[16/8] rounded-[32px] border-4 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center overflow-hidden relative ${previewImage ? 'border-pink-200' : 'border-gray-100 bg-gray-50 hover:bg-pink-50/30'}`}
            >
              {previewImage ? (
                <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-gray-400">
                  <Camera size={48} className="mx-auto mb-2 opacity-10" />
                  <span className="font-bold text-xs">اضغطي لرفع البنر</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {ads.map((ad) => (
          <div key={ad.id} className={`bg-white rounded-[32px] overflow-hidden border-2 transition-all relative group ${ad.active ? 'border-pink-50 shadow-md' : 'border-gray-100 grayscale opacity-60'}`}>
            <div className="aspect-[16/7] relative">
              <img src={ad.imageUrl} alt="" className="w-full h-full object-cover" />
              {!ad.active && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="bg-white px-6 py-2 rounded-full font-bold text-xs tracking-widest">مخفي حالياً</span>
                </div>
              )}
            </div>
            <div className="p-5 flex justify-between items-center bg-white">
              <div className="flex gap-3">
                <button 
                  onClick={() => handleToggle(ad)} 
                  className={`p-3 rounded-2xl transition-all ${ad.active ? 'bg-pink-50 text-pink-600' : 'bg-gray-100 text-gray-400'}`}
                >
                  {ad.active ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                <button 
                  onClick={() => handleDelete(ad.id)} 
                  disabled={deletingId === ad.id}
                  className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                >
                  {deletingId === ad.id ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={20} />}
                </button>
              </div>
              <span className="text-[10px] font-mono text-gray-300 uppercase">BANNER: {ad.id.slice(-5)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminAds;
