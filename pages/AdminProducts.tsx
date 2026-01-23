
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Tag, X, Image as ImageIcon, Upload, Camera, Check, Grid, Lock, Loader2 } from 'lucide-react';
import { dataService } from '../services/dataService';
import { Product, Category } from '../types';
import { useApp } from '../App';

const AdminProducts: React.FC = () => {
  const { refreshData } = useApp();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [authError, setAuthError] = useState(false);
  
  const fileInputRef1 = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    images: ['', ''],
    categoryId: '',
    discountPercent: '0',
    discountActive: false
  });

  const [newCatName, setNewCatName] = useState('');
  const [catLoading, setCatLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [p, c] = await Promise.all([
      dataService.getProducts(),
      dataService.getCategories()
    ]);
    setProducts(p);
    setCategories(c);
    if (c.length > 0 && !form.categoryId) {
      setForm(prev => ({ ...prev, categoryId: c[0].id }));
    }
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '2008' || password.toLowerCase() === 'pass it 2008') {
      setIsAuthorized(true);
      setAuthError(false);
    } else {
      setAuthError(true);
      setPassword('');
      setTimeout(() => setAuthError(false), 2000);
    }
  };

  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
      alert("حجم الصورة كبير جداً");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const newImages = [...form.images];
      newImages[index] = base64String;
      setForm({ ...form, images: newImages });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.images[0]) {
      alert('يرجى إضافة صورة للمنتج');
      return;
    }

    setSaveLoading(true);
    const newProduct: Product = {
      id: editingProduct?.id || `p_${Date.now()}`,
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      images: form.images.filter(img => img),
      categoryId: form.categoryId || (categories[0]?.id || '1'),
      discount: {
        percent: parseInt(form.discountPercent),
        active: form.discountActive
      },
      createdAt: editingProduct?.createdAt || Date.now()
    };

    try {
      await dataService.saveProduct(newProduct);
      await loadData();
      await refreshData();
      setIsModalOpen(false);
      setEditingProduct(null);
      resetForm();
    } catch (err) {
      alert("فشل الحفظ في قاعدة البيانات");
    } finally {
      setSaveLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      price: '',
      images: ['', ''],
      categoryId: categories[0]?.id || '',
      discountPercent: '0',
      discountActive: false
    });
  };

  const handleEdit = (p: Product) => {
    setEditingProduct(p);
    setForm({
      name: p.name,
      description: p.description,
      price: p.price.toString(),
      images: [p.images[0] || '', p.images[1] || ''],
      categoryId: p.categoryId,
      discountPercent: p.discount.percent.toString(),
      discountActive: p.discount.active
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('حذف هذا المنتج؟')) {
      await dataService.deleteProduct(id);
      await loadData();
      await refreshData();
    }
  };

  const handleAddCategory = async () => {
    if (!newCatName) return;
    setCatLoading(true);
    try {
      const newCat: Category = { id: `c_${Date.now()}`, name: newCatName };
      await dataService.addCategory(newCat);
      setNewCatName('');
      await loadData();
      await refreshData();
    } catch (err) {
      alert("فشل إضافة الفئة");
    } finally {
      setCatLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('حذف هذا القسم؟')) {
      try {
        await dataService.deleteCategory(id);
        await loadData();
        await refreshData();
      } catch (err) {
        alert("لا يمكن حذف الفئة لأنها تحتوي على منتجات أو حدث خطأ.");
      }
    }
  };

  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-[40px] shadow-2xl border border-gray-100 text-center fade-in">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner transition-all ${authError ? 'bg-red-100 text-red-600 animate-shake' : 'bg-pink-100 text-pink-600'}`}>
          <Lock size={40} />
        </div>
        <h2 className="text-2xl font-bold mb-2">إدارة المخزون</h2>
        <p className="text-gray-400 mb-8 text-sm font-bold">يرجى إدخال الرمز السري للوصول.</p>
        <form onSubmit={handleAuth} className="space-y-4">
          <input 
            type="password" 
            placeholder="الرمز السري"
            className={`w-full p-5 rounded-2xl outline-none focus:ring-4 text-center text-xl font-mono border ${authError ? 'border-red-300 ring-red-50 bg-red-50' : 'bg-gray-50 border-gray-100 ring-pink-100'}`}
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoFocus
          />
          <button className="w-full pink-primary-bg text-white py-5 rounded-2xl font-bold text-lg shadow-xl active:scale-95 transition-all">دخول</button>
        </form>
      </div>
    );
  }

  return (
    <div className="fade-in space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-800 mb-1">المستودع الرقمي</h1>
          <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">إدارة الفئات والمنتجات</p>
        </div>
        <button 
          onClick={() => { resetForm(); setEditingProduct(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 pink-primary-bg text-white px-8 py-4 rounded-2xl font-bold hover:shadow-xl transition-all shadow-md active:scale-95"
        >
          <Plus size={20} /> إضافة منتج
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* لوحة الفئات */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-pink-50">
            <h3 className="font-bold mb-6 flex items-center gap-2 text-gray-700"><Grid size={18} className="text-pink-500" /> الأقسام (الفئات)</h3>
            <div className="space-y-2 mb-6 max-h-[300px] overflow-y-auto no-scrollbar">
              {categories.map(cat => (
                <div key={cat.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-transparent hover:border-pink-100 transition-all">
                  <span className="font-bold text-sm text-gray-600">{cat.name}</span>
                  <button onClick={() => handleDeleteCategory(cat.id)} className="text-gray-300 hover:text-red-500 p-1"><Trash2 size={14} /></button>
                </div>
              ))}
              {categories.length === 0 && <p className="text-center text-xs text-gray-400 py-4">لا توجد فئات حالياً</p>}
            </div>
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="اسم القسم الجديد..."
                className="w-full p-4 bg-gray-50 rounded-xl outline-none text-xs font-bold border border-transparent focus:border-pink-200"
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
              />
              <button 
                onClick={handleAddCategory} 
                disabled={catLoading || !newCatName}
                className="w-full p-4 bg-pink-50 text-pink-600 rounded-xl hover:bg-pink-600 hover:text-white transition-all font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {catLoading ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                إضافة قسم
              </button>
            </div>
          </div>
        </div>

        {/* قائمة المنتجات */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="p-6 text-gray-400 font-bold text-xs">المنتج</th>
                    <th className="p-6 text-gray-400 font-bold text-xs text-center">السعر</th>
                    <th className="p-6 text-gray-400 font-bold text-xs text-center">القسم</th>
                    <th className="p-6 text-gray-400 font-bold text-xs text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-pink-50/10 transition-colors">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <img src={p.images[0]} className="w-12 h-12 object-cover rounded-xl border border-gray-100" />
                          <span className="font-bold text-gray-800 text-sm">{p.name}</span>
                        </div>
                      </td>
                      <td className="p-6 text-center font-black text-pink-600">₪{p.price}</td>
                      <td className="p-6 text-center">
                        <span className="bg-gray-100 px-3 py-1 rounded-full text-[10px] font-bold text-gray-500 uppercase">
                          {categories.find(c => c.id === p.categoryId)?.name || 'غير مصنف'}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleEdit(p)} className="p-2 text-blue-500 bg-blue-50 hover:bg-blue-500 hover:text-white rounded-lg transition-all"><Edit size={16} /></button>
                          <button onClick={() => handleDelete(p.id)} className="p-2 text-red-500 bg-red-50 hover:bg-red-500 hover:text-white rounded-lg transition-all"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* مودال المنتج */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[40px] p-8 md:p-10 relative animate-scale-up max-h-[90vh] overflow-y-auto no-scrollbar">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 left-8 p-2 hover:bg-gray-100 rounded-full"><X size={24} /></button>
            <h2 className="text-2xl font-black mb-8">{editingProduct ? 'تعديل المنتج' : 'منتج جديد'}</h2>
            
            <form onSubmit={handleSaveProduct} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400">الاسم</label>
                  <input required className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 ring-pink-100" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400">السعر (₪)</label>
                  <input required type="number" step="0.01" className="w-full p-4 bg-gray-50 rounded-2xl outline-none" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400">القسم (الفئة)</label>
                <select 
                  required
                  className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-gray-700"
                  value={form.categoryId}
                  onChange={e => setForm({...form, categoryId: e.target.value})}
                >
                  <option value="" disabled>اختر القسم المناسب</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400">الوصف</label>
                <textarea className="w-full p-4 bg-gray-50 rounded-2xl outline-none h-24 resize-none" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[0, 1].map(idx => (
                  <div key={idx} className="relative aspect-square bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100 flex items-center justify-center overflow-hidden">
                    {form.images[idx] ? (
                      <>
                        <img src={form.images[idx]} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => { const i = [...form.images]; i[idx] = ''; setForm({...form, images: i}); }} className="absolute top-2 left-2 bg-red-500 text-white p-1.5 rounded-full"><Trash2 size={12} /></button>
                      </>
                    ) : (
                      <button type="button" onClick={() => (idx === 0 ? fileInputRef1 : fileInputRef2).current?.click()} className="text-gray-300 flex flex-col items-center gap-2"><Camera size={24} /><span className="text-[10px] font-bold">رفع صورة</span></button>
                    )}
                  </div>
                ))}
              </div>

              <input type="file" ref={fileInputRef1} className="hidden" onChange={e => handleFileChange(0, e)} />
              <input type="file" ref={fileInputRef2} className="hidden" onChange={e => handleFileChange(1, e)} />

              <button 
                disabled={saveLoading}
                className="w-full pink-primary-bg text-white py-5 rounded-[24px] font-bold text-lg shadow-xl hover:shadow-pink-100 transition-all flex items-center justify-center gap-2"
              >
                {saveLoading ? <Loader2 className="animate-spin" /> : <Upload size={20} />}
                {saveLoading ? 'جاري الحفظ...' : 'حفظ المنتج في المتجر'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
