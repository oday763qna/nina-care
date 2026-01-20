
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

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
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
    if (window.confirm('هل أنت متأكد من حذف هذا الإعلان بشكل نهائي؟ لن تتمكن من التراجع عن هذه الخطوة.')) {
      const updated = ads.filter(a => a.id !== id);
      dataService.saveAds(updated);
      setAds(updated);
    }
  };

  return (
    <div className="fade-in space-y-10 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">إدارة الإعلانات المميزة</h1>
          <p className="text-gray-500">تحكم في الصور التي تظهر في الواجهة الرئيسية للمتجر.</p>
        </div>
        <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-pink-50 font-bold pink-primary">
          إجمالي الإعلانات: {ads.length}
        </div>
      </div>

      {/* Add New Ad Section */}
      <div className="bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-pink-50 relative overflow-hidden">
        {successMsg && (
          <div className="absolute inset-x-0 top-0 bg-green-500 text-white py-2 text-center text-sm font-bold flex items-center justify-center gap-2 animate-slide-in-top">
            <Check size={16} /> تم إضافة الإعلان بنجاح وتفعيل العرض!
          </div>
        )}
        
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          <div className="w-full lg:w-1/2 space-y-6">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
               <div className="w-10 h-10 pink-primary-bg text-white rounded-full flex items-center justify-center">
                 <Plus size={24} />
               </div>
               رفع إعلان جديد
            </h3>
            
            <p className="text-gray-500 leading-relaxed">
              ارفعي صوراً عالية الجودة لجذب انتباه الزبائن. الإعلانات المرفوعة تظهر بشكل عشوائي في الصفحة الرئيسية لضمان تجربة متجددة لكل زائر. يفضل استخدام صور بأبعاد <span className="font-bold">16:9</span>.
            </p>

            <button 
              onClick={handleAdd}
              disabled={!previewImage || isUploading}
              className="w-full pink-primary-bg text-white px-10 py-5 rounded-[24px] font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95"
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
              className={`relative aspect-[16/9] rounded-[32px] border-4 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${previewImage ? 'border-pink-500 bg-pink-50' : 'border-gray-100 bg-gray-50 hover:border-pink-300 hover:bg-pink-50/50'}`}
            >
              {isUploading ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
                  <p className="text-pink-500 font-bold">جاري معالجة الصورة...</p>
                </div>
              ) : previewImage ? (
                <>
                  <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                     <p className="text-white font-bold bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">تغيير الصورة</p>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setPreviewImage(null); }}
                    className="absolute top-6 left-6 bg-red-500 text-white p-2 rounded-full shadow-2xl hover:bg-red-600 transition-all hover:rotate-90"
                  >
                    <X size={20} />
                  </button>
                </>
              ) : (
                <div className="text-center p-8">
                  <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 text-pink-400 shadow-xl">
                    <Camera size={36} />
                  </div>
                  <p className="text-lg font-bold text-gray-600">اضغط هنا لاختيار صورة</p>
                  <p className="text-sm text-gray-400 mt-2">يمكنك الاختيار من معرض الصور أو الكاميرا</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ads List Title */}
      <div className="pt-8 border-t border-gray-100">
        <h2 className="text-2xl font-bold mb-8">المعرض الحالي للإعلانات</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8">
          {ads.map((ad, idx) => (
            <div 
              key={ad.id} 
              className={`group bg-white rounded-[40px] overflow-hidden shadow-sm hover:shadow-2xl border-2 transition-all duration-500 ${ad.active ? 'border-pink-50' : 'border-gray-100 opacity-70 grayscale'}`}
            >
              <div className="aspect-[16/9] relative">
                <img src={ad.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute top-6 right-6 flex gap-3">
                  <div className="bg-white/90 backdrop-blur-sm px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                    ترتيب: {idx + 1}
                  </div>
                  {!ad.active && (
                    <div className="bg-red-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg">
                      معطل حالياً
                    </div>
                  )}
                </div>
              </div>
              <div className="p-6 flex justify-between items-center bg-white border-t border-gray-50">
                <div className="flex gap-4">
                  <button 
                    onClick={() => handleToggle(ad.id)}
                    title={ad.active ? "إخفاء الإعلان" : "إظهار الإعلان"}
                    className={`p-4 rounded-2xl transition-all shadow-sm ${ad.active ? 'bg-pink-50 text-pink-600 hover:bg-pink-600 hover:text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-800 hover:text-white'}`}
                  >
                    {ad.active ? <Eye size={24} /> : <EyeOff size={24} />}
                  </button>
                  <button 
                    onClick={() => handleDelete(ad.id)}
                    title="حذف الإعلان نهائياً"
                    className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                  >
                    <Trash2 size={24} />
                  </button>
                </div>
                <div className="text-left">
                   <p className="text-[10px] text-gray-300 font-mono select-all bg-gray-50 px-3 py-1 rounded-full">{ad.id}</p>
                </div>
              </div>
            </div>
          ))}
          
          {ads.length === 0 && (
            <div className="col-span-full py-32 text-center bg-white rounded-[40px] border-4 border-dashed border-gray-100">
               <ImageIcon size={80} className="mx-auto text-pink-100 mb-6" />
               <p className="text-2xl font-bold text-gray-400">لا توجد إعلانات معروضة حالياً</p>
               <p className="text-gray-300 mt-2">ابدأي بإضافة إعلانك الأول لجعل المتجر أكثر حيوية!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAds;
