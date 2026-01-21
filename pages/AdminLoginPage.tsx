
import React, { useState } from 'react';
import { Lock, ArrowRight } from 'lucide-react';
import { dataService } from '../services/dataService';

const AdminLoginPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  // Fix: Make handleSubmit async and await settings from dataService
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const settings = await dataService.getSettings();
      if (password === settings.adminPassword) {
        sessionStorage.setItem('admin_session', 'true');
        window.location.hash = '/admin';
      } else {
        setError(true);
        setTimeout(() => setError(false), 2000);
      }
    } catch (err) {
      console.error(err);
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className={`bg-white w-full max-w-md p-10 rounded-[50px] shadow-2xl border border-pink-50 text-center transition-all ${error ? 'animate-shake' : ''}`}>
        <div className="w-20 h-20 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
          <Lock size={40} />
        </div>
        <h1 className="text-3xl font-bold mb-4">منطقة الإدارة</h1>
        <p className="text-gray-400 mb-10">يرجى إدخال كلمة المرور للمتابعة</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <input 
            type="password" 
            placeholder="كلمة المرور"
            className="w-full p-5 bg-gray-50 rounded-2xl outline-none focus:ring-4 ring-pink-100 text-center text-2xl font-mono transition-all"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoFocus
          />
          <button className="w-full pink-primary-bg text-white py-5 rounded-2xl font-bold text-xl hover:shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
             دخول <ArrowRight size={24} />
          </button>
          {error && <p className="text-red-500 font-bold animate-pulse">كلمة المرور غير صحيحة!</p>}
        </form>

        <button 
          onClick={() => window.location.hash = '/'}
          className="mt-8 text-gray-400 hover:text-pink-600 transition-colors"
        >
          العودة للمتجر
        </button>
      </div>
    </div>
  );
};

export default AdminLoginPage;
