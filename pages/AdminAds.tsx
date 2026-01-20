import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Eye, EyeOff, Upload, Camera, Image as ImageIcon, X, Check } from 'lucide-react';
import { dataService } from '../services/dataService';
import { Ad } from '../types';

const AdminAds: React.FC = () => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAds(dataService.getAds());
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 2MB for localStorage health)
    if (file.size > 2 * 1024 * 1024) {
      alert("حجم الصورة كبير جداً. يرجى اختيار صورة أقل من 2 ميجابايت.");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
      setIsUploading(false);
    };
    reader.onerror = () => {
      alert("حدث خطأ أثناء تحميل الصورة.");
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleAdd = () => {
    if (!previewImage) return;
    
    const newAd: Ad = { 
      id: `ad_${Date.now()}`, 
      imageUrl: previewImage, 
      active: true 
    };
    
    const updated = [newAd, ...ads];
    dataService.saveAds(updated);
    setAds(updated);
    setPreviewImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  const handleToggle = (id: string) => {
    const updated = ads.map(a => a.id === id ? { ...a, active: !a.active } : a);
    dataService.saveAds(updated);
    setAds(updated);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الإعلان بشكل نهائي؟')) {
      const updated = ads.filter(a => a.id !== id);
      dataService.saveAds(updated);
      setAds([...updated]); // Trigger state update with a new array reference
    }
  };

  return (
    <div className="fade-in space-y-10 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">إدارة الإعلانات</h1>
          <p className="text-gray-500">تحكم في الصور التي تظهر في الواجهة الرئيسية.</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 font-bold pink-primary">
          إجمالي الإعلانات: {ads.length}
        </div>
      </div>

      <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-gray-100 relative overflow-hidden">
        {successMsg && (
          <div className="absolute inset-x-0 top-0 bg-green-500 text-white py-2 text-center text-sm font-bold flex items-center justify-center gap-2 animate-slide-in-top">
            <Check size={16} /> تم إضافة الإعلان بنجاح!
          </div>
        )}
        
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          <div className="w-full lg:w-1/2 space-y-6">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
               رفع إعلان جديد
            </h3>
            <p className="text-gray-500 leading-relaxed">
              ارفعي صوراً عالية الجودة لجذب انتباه الزبائن. يفضل استخدام صور بأبعاد 16:9.
            </p>
            <button 
              onClick={handleAdd}
              disabled={!previewImage || isUploading}
              className="w-full pink-primary-bg text-white px-10 py-5 rounded-[24px] font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-50 hover:shadow-xl transition-all"
            >
              <Upload size={24} /> تأكيد وحفظ الإعلان
            </button>
          </div>

          <div className="w-full lg:w-1/2">
            <input 
              type="file" 
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`relative aspect-[16/9] rounded-[32px] border-4 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${previewImage ? 'border-pink-500 bg-pink-50' : 'border-gray-100 bg-gray-50 hover:border-pink-300'}`}
            >
              {isUploading ? (
                <div className="animate-spin w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full" />
              ) : previewImage ? (
                <>
                  <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    onClick={(e) => { e.stopPropagation(); setPreviewImage(null); }}
                    className="absolute top-4 left-4 bg-red-500 text-white p-2 rounded-full shadow-lg"
                  >
                    <X size={20} />
                  </button>
                </>
              ) : (
                <div className="text-center p-8">
                  <Camera size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-lg font-bold text-gray-600">اضغط لاختيار صورة</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
        {ads.map((ad) => (
          <div 
            key={ad.id} 
            className={`bg-white rounded-[40px] overflow-hidden shadow-sm border-2 transition-all ${ad.active ? 'border-pink-50' : 'border-gray-100 opacity-60'}`}
          >
            <div className="aspect-[16/9] relative">
              <img src={ad.imageUrl} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="p-6 flex justify-between items-center">
              <div className="flex gap-4">
                <button 
                  onClick={() => handleToggle(ad.id)}
                  className={`p-3 rounded-2xl transition-all ${ad.active ? 'bg-pink-50 text-pink-600' : 'bg-gray-100 text-gray-500'}`}
                >
                  {ad.active ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
                <button 
                  onClick={() => handleDelete(ad.id)}
                  className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {ads.length === 0 && (
          <div className="col-span-full py-20 text-center text-gray-400">لا توجد إعلانات حالياً.</div>
        )}
      </div>
    </div>
  );
};

export default AdminAds;