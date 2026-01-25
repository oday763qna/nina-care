
import React, { useState } from 'react';
import { Save, Lock, Phone, Instagram as InstagramIcon, MessageSquare, Video } from 'lucide-react';
import { dataService } from '../services/dataService';
import { Settings } from '../types';
import { useApp } from '../App';

const AdminSettings: React.FC = () => {
  const { settings, refreshData } = useApp();
  const [form, setForm] = useState<Settings>(settings);
  const [saveStatus, setSaveStatus] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    dataService.saveSettings(form);
    setSaveStatus(true);
    refreshData();
    setTimeout(() => setSaveStatus(false), 3000);
  };

  return (
    <div className="fade-in max-w-4xl space-y-8">
      <h1 className="text-3xl font-bold">إعدادات المتجر</h1>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="font-bold flex items-center gap-2 text-pink-600"><Phone size={20} /> أرقام التواصل والروابط</h3>
            <div>
              <label className="block text-gray-600 mb-2">رقم واتساب للمتجر</label>
              <input 
                type="text" 
                className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none"
                value={form.whatsappNumber}
                onChange={e => setForm({...form, whatsappNumber: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-2">رابط إنستغرام</label>
              <input 
                type="text" 
                className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none"
                value={form.instagramUrl}
                onChange={e => setForm({...form, instagramUrl: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="font-bold flex items-center gap-2 text-pink-600"><Lock size={20} /> كلمات المرور</h3>
            <div>
              <label className="block text-gray-600 mb-2">كلمة مرور لوحة التحكم الرئيسية</label>
              <input 
                type="password" 
                className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none"
                value={form.adminPassword}
                onChange={e => setForm({...form, adminPassword: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-2">كلمة مرور إدارة المنتجات</label>
              <input 
                type="password" 
                className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none"
                value={form.productMgmtPassword}
                onChange={e => setForm({...form, productMgmtPassword: e.target.value})}
              />
            </div>
          </div>

          <div className="md:col-span-2 space-y-4">
            <h3 className="font-bold flex items-center gap-2 text-pink-600"><MessageSquare size={20} /> قالب رسالة تأكيد الطلب</h3>
            <textarea 
              className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none h-32"
              value={form.deliveryTemplate}
              onChange={e => setForm({...form, deliveryTemplate: e.target.value})}
            />
            <p className="text-xs text-gray-400">ملاحظة: استخدم {'{ORDER_ID}'} لرقم الطلب، و {'{TOTAL}'} للإجمالي، و {'{ETA}'} لوقت التوصيل.</p>
          </div>
        </div>

        <div className="flex justify-end gap-4">
           {saveStatus && <span className="text-green-600 font-bold flex items-center">تم الحفظ بنجاح!</span>}
           <button className="pink-primary-bg text-white px-10 py-4 rounded-2xl font-bold text-xl hover:shadow-xl transition-all flex items-center gap-2">
             <Save size={24} /> حفظ الإعدادات
           </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
