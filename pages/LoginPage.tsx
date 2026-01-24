
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, UserPlus, LogIn, ShieldCheck, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { dataService } from '../services/dataService';
import { useApp } from '../App';

const LoginPage: React.FC = () => {
  const { setCurrentUser } = useApp();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    username: '',
    password: '',
    fullName: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const user = await dataService.loginUser(form.username, form.password);
        setCurrentUser(user);
        if (user.username === 'odayqutqut55') navigate('/admin');
        else navigate('/');
      } else {
        if (!form.fullName) throw new Error("يرجى إدخال الاسم الكامل");
        const user = await dataService.registerUser(form.username, form.password, form.fullName);
        setCurrentUser(user);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 fade-in">
      <div className="bg-white w-full max-w-md p-10 rounded-[50px] shadow-2xl border border-pink-50">
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
            {isLogin ? <ShieldCheck size={36} /> : <UserPlus size={36} />}
          </div>
        </div>

        <h1 className="text-3xl font-black text-center mb-2 text-gray-800 tracking-tight">
          {isLogin ? 'مرحباً بعودتك' : 'انضمي إلينا'}
        </h1>
        <p className="text-gray-400 text-center mb-10 font-bold text-sm">
          {isLogin ? 'سجلي دخولك للوصول لحسابك' : 'أنشئي حسابك الجديد في نينو كير'}
        </p>

        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold border border-red-100 animate-shake">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 pr-2">الاسم الكامل</label>
              <div className="relative">
                <User size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                <input 
                  type="text" 
                  placeholder="مثال: منى أحمد"
                  className="w-full p-4 pr-12 bg-gray-50 rounded-2xl outline-none focus:ring-4 ring-pink-100 transition-all border border-gray-100"
                  value={form.fullName}
                  onChange={e => setForm({...form, fullName: e.target.value})}
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 pr-2">اسم المستخدم</label>
            <div className="relative">
              <User size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
              <input 
                type="text" 
                placeholder="أدخل اسم المستخدم"
                className="w-full p-4 pr-12 bg-gray-50 rounded-2xl outline-none focus:ring-4 ring-pink-100 transition-all border border-gray-100 font-mono"
                value={form.username}
                onChange={e => setForm({...form, username: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 pr-2">كلمة المرور</label>
            <div className="relative">
              <Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full p-4 pr-12 bg-gray-50 rounded-2xl outline-none focus:ring-4 ring-pink-100 transition-all border border-gray-100 font-mono"
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                required
              />
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full pink-primary-bg text-white py-5 rounded-2xl font-bold text-lg shadow-xl hover:shadow-pink-100 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : (isLogin ? <LogIn size={20} /> : <UserPlus size={20} />)}
            {isLogin ? 'تسجيل الدخول' : 'إنشاء الحساب'}
          </button>
        </form>

        <div className="mt-8 text-center space-y-4">
          <p className="text-sm text-gray-400 font-bold">
            {isLogin ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="pink-primary mr-2 underline underline-offset-4"
            >
              {isLogin ? 'أنشئي حساباً الآن' : 'سجلي دخولك'}
            </button>
          </p>
          
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-300 hover:text-gray-600 mx-auto text-xs font-bold transition-colors">
            العودة للمتجر <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
