
import React, { useState, useRef } from 'react';
import { Plus, Trash2, Eye, EyeOff, Camera, X, Check, ImageIcon } from 'lucide-react';
import { dataService } from '../services/dataService';
import { useApp } from '../App';
import { Ad } from '../types';

const AdminAds: React.FC = () => {
  const { ads, refreshData } = useApp();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
      alert("حجم الصورة كبير جداً. يرجى اختيار صورة أقل من 1.5 ميجا.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAdd = async () => {
    if (!previewImage) {
      alert("يرجى اختيار صورة أولاً.");
      return;
    }
    
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
      alert("حدث خطأ أثناء حفظ الإعلان في Supabase.");
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
    if (window.confirm('هل أنت متأكد من حذف هذا الإعلان نهائياً؟')) {
      try {
        await dataService.deleteAd(id);
        await refreshData();
      } catch (err) {
        alert("فشل في حذف الإعلان.");
      }
    }
  };

  return (
    <div className="fade-in space-y-10 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">إدارة بنرات الصفحة الرئيسية</h1>
          <p className="text-gray-500 text-sm">أضيفي عروضك الجديدة هنا لتظهر فوراً لزبائنك.</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 overflow-hidden relative">
        {successMsg && (
          <div className="absolute top-0 inset-x-0 bg-green-500 text-white py-2 text-center text-xs font-bold animate-slide-in-top">
            تمت الإضافة بنجاح!
          </div>
        )}
        <div className="flex flex-col md:flex-row gap-10 items-center">
          <div className="flex-1 space-y-6">
            <h3 className="text-xl font-bold">إضافة إعلان جديد</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              يفضل استخدام صور بمقاسات عرضية للحصول على أفضل جودة عرض.
            </p>
            <button 
              onClick={handleAdd}
              disabled={!previewImage || isUploading}
              className={`w-full pink-primary-bg text-white py-4 rounded-2xl font-bold transition-all shadow-lg ${isUploading ? 'opacity-50' : 'hover:scale-[1.02] active:scale-95'}`}
            >
              {isUploading ? 'جاري الحفظ...' : 'حفظ ونشر الإعلان'}
            </button>
          </div>
          <div className="w-full md:w-1/2">
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`aspect-[16/8] rounded-[32px] border-4 border-dashed cursor-pointer transition-all flex flex-col items-center justify-center overflow-hidden ${previewImage ? 'border-pink-200' : 'border-gray-100 bg-gray-50'}`}
            >
              {previewImage ? (
                <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-gray-400">
                  <Camera size={48} className="mx-auto mb-2 opacity-20" />
                  <span className="font-bold text-sm">اضغطي لرفع الصورة</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {ads.map((ad) => (
          <div key={ad.id} className={`bg-white rounded-[32px] overflow-hidden border-2 transition-all ${ad.active ? 'border-pink-50 shadow-md' : 'border-gray-100 grayscale'}`}>
            <div className="aspect-[16/7] relative">
              <img src={ad.imageUrl} alt="" className="w-full h-full object-cover" />
              {!ad.active && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <span className="bg-white px-4 py-1 rounded-full font-bold text-xs">مخفي</span>
                </div>
              )}
            </div>
            <div className="p-4 flex justify-between items-center">
              <div className="flex gap-2">
                <button onClick={() => handleToggle(ad)} className="p-3 bg-gray-50 rounded-xl hover:bg-pink-100 text-pink-600 transition-all">
                  {ad.active ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                <button onClick={() => handleDelete(ad.id)} className="p-3 bg-red-50 rounded-xl hover:bg-red-500 hover:text-white text-red-500 transition-all">
                  <Trash2 size={20} />
                </button>
              </div>
              <span className="text-[10px] font-mono text-gray-300">{ad.id}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminAds;
