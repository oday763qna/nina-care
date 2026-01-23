import React, { useState } from 'react';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { dataService } from '../services/dataService';

const AdminLoginPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    
    setLoading(true);
    try {
      const settings = await dataService.getSettings();
      // يتم جلب كلمة المرور من الإعدادات أو استخدام القيمة الافتراضية بأمان
      const validPassword = settings?.adminPassword || '200820102026';
      
      if (password === validPassword) {
        sessionStorage.setItem('admin_session', 'true');
        window.location.hash = '/admin';
      } else {
        setError(true);
        setPassword('');
        setTimeout(() => setError(false), 2000);
      }
    } catch (err) {
      console.error(err);
      // كود احتياطي في حال فشل الاتصال بقاعدة البيانات
      if (password === '200820102026') {
        sessionStorage.setItem('admin_session', 'true');
        window.location.hash = '/admin';
      } else {
        setError(true);
        setPassword('');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 fade-in">
      <div className={`bg-white w-full max-w-md p-10 rounded-[50px] shadow-2xl border border-pink-50 text-center transition-all duration-300 ${error ? 'animate-shake border-red-200' : 'border-pink-50'}`}>
        <div className="w-20 h-20 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border-4 border-white">
          <ShieldCheck size={40} />
        </div>
        <h1 className="text-3xl font-black mb-2 text-gray-800 tracking-tight">بوابة الإدارة</h1>
        <p className="text-gray-400 mb-10 font-bold">يرجى إدخال الرمز السري للمتابعة</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input 
              type="password" 
              placeholder="الرمز السري"
              className={`w-full p-6 bg-gray-50 rounded-3xl outline-none focus:ring-4 ring-pink-100 text-center text-2xl font-mono transition-all border ${error ? 'border-red-300 bg-red-50' : 'border-gray-100'}`}
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoFocus
            />
          </div>
          <button 
            disabled={loading || !password}
            className="w-full bg-pink-600 text-white py-6 rounded-3xl font-bold text-xl hover:bg-pink-700 shadow-xl shadow-pink-100 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                دخول النظام <ArrowRight size={24} />
              </>
            )}
          </button>
          {error && <p className="text-red-500 font-bold animate-pulse text-sm mt-2">عذراً، الرمز السري غير صحيح</p>}
        </form>

        <button 
          onClick={() => window.location.hash = '/'}
          className="mt-12 text-gray-300 hover:text-pink-600 transition-colors font-bold text-sm underline decoration-dotted underline-offset-4"
        >
          العودة للمتجر
        </button>
      </div>
    </div>
  );
};

export default AdminLoginPage;