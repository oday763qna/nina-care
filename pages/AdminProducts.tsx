
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

    if (file.size > 1.2 * 1024 * 1024) {
      alert("حجم الصورة كبير، يرجى اختيار صورة أقل من 1 ميجا لسرعة المتجر");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const newImages = [...form.images];
      newImages[index] = reader.result as string;
      setForm({ ...form, images: newImages });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.images[0]) return alert('يرجى رفع صورة واحدة على الأقل');
    if (!form.categoryId) return alert('يرجى اختيار قسم للمنتج');

    setSaveLoading(true);
    const productData: Product = {
      id: editingProduct?.id || `p_${Date.now()}`,
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      images: form.images.filter(img => img),
      categoryId: form.categoryId,
      discount: {
        percent: parseInt(form.discountPercent),
        active: form.discountActive
      },
      createdAt: editingProduct?.createdAt || Date.now()
    };

    try {
      await dataService.saveProduct(productData);
      await loadData();
      await refreshData();
      setIsModalOpen(false);
      setEditingProduct(null);
    } catch (err) {
      alert("حدث خطأ أثناء الحفظ");
    } finally {
      setSaveLoading(false);
    }
  };

  // Fix: Added handleDelete function to handle product deletion
  const handleDelete = async (id: string) => {
    if (window.confirm('هل تريد حذف هذا المنتج نهائياً؟')) {
      try {
        await dataService.deleteProduct(id);
        await loadData();
        await refreshData();
      } catch (err) {
        console.error("Error deleting product:", err);
        alert("فشل حذف المنتج");
      }
    }
  };

  const handleAddCategory = async () => {
    if (!newCatName) return;
    setCatLoading(true);
    try {
      const newCat: Category = { id: `cat_${Date.now()}`, name: newCatName };
      await dataService.addCategory(newCat);
      setNewCatName('');
      await loadData();
      await refreshData();
    } catch (err) {
      alert("فشل إضافة القسم");
    } finally {
      setCatLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('هل تريد حذف هذا القسم؟')) {
      await dataService.deleteCategory(id);
      await loadData();
      await refreshData();
    }
  };

  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto mt-24 p-10 bg-white rounded-[50px] shadow-2xl border border-pink-50 text-center fade-in">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${authError ? 'bg-red-100 text-red-500 animate-shake' : 'bg-pink-100 text-pink-500'}`}>
          <Lock size={32} />
        </div>
        <h2 className="text-2xl font-black mb-2">خزنة المنتجات</h2>
        <p className="text-gray-400 mb-8 text-sm font-bold">أدخل الكود السري للإدارة</p>
        <form onSubmit={handleAuth} className="space-y-4">
          <input 
            type="password" 
            className="w-full p-5 bg-gray-50 rounded-3xl text-center text-2xl font-mono outline-none focus:ring-4 ring-pink-100 border border-gray-100"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="****"
            autoFocus
          />
          <button className="w-full pink-primary-bg text-white py-5 rounded-3xl font-bold text-lg shadow-xl active:scale-95 transition-all">فتح الخزنة</button>
        </form>
      </div>
    );
  }

  return (
    <div className="fade-in space-y-10 pb-32">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-gray-800">إدارة المخزون</h1>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">تحديث الأقسام والمنتجات</p>
        </div>
        <button 
          onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
          className="pink-primary-bg text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-lg hover:shadow-pink-200 transition-all active:scale-95"
        >
          <Plus size={20} /> منتج جديد
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* قسم الفئات */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-[40px] shadow-sm border border-gray-50">
            <h3 className="font-bold text-gray-700 mb-6 flex items-center gap-2"><Grid size={18} /> الأقسام</h3>
            <div className="space-y-2 mb-6 max-h-60 overflow-y-auto no-scrollbar">
              {categories.map(c => (
                <div key={c.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-2xl group transition-all">
                  <span className="text-sm font-bold text-gray-600">{c.name}</span>
                  <button onClick={() => handleDeleteCategory(c.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input 
                placeholder="قسم جديد..." 
                className="flex-1 p-3 bg-gray-50 rounded-xl outline-none text-xs font-bold border border-transparent focus:border-pink-200"
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
              />
              <button 
                onClick={handleAddCategory}
                disabled={catLoading}
                className="p-3 bg-pink-50 text-pink-600 rounded-xl hover:bg-pink-600 hover:text-white transition-all"
              >
                {catLoading ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
              </button>
            </div>
          </div>
        </div>

        {/* جدول المنتجات */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-[40px] shadow-sm border border-gray-50 overflow-hidden">
             <table className="w-full text-right">
               <thead className="bg-gray-50/50">
                 <tr>
                   <th className="p-6 text-xs text-gray-400 font-bold">المنتج</th>
                   <th className="p-6 text-xs text-gray-400 font-bold text-center">القسم</th>
                   <th className="p-6 text-xs text-gray-400 font-bold text-center">السعر</th>
                   <th className="p-6 text-xs text-gray-400 font-bold text-center">الإجراء</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                 {products.map(p => (
                   <tr key={p.id} className="hover:bg-pink-50/5 transition-colors">
                     <td className="p-6">
                       <div className="flex items-center gap-4">
                         <img src={p.images[0]} className="w-12 h-12 object-cover rounded-xl border border-gray-100 shadow-sm" />
                         <span className="font-bold text-gray-700">{p.name}</span>
                       </div>
                     </td>
                     <td className="p-6 text-center">
                        <span className="bg-pink-50 text-pink-600 px-3 py-1 rounded-full text-[10px] font-bold">
                          {categories.find(c => c.id === p.categoryId)?.name || 'غير مصنف'}
                        </span>
                     </td>
                     <td className="p-6 text-center font-black text-pink-600">₪{p.price}</td>
                     <td className="p-6">
                        <div className="flex items-center justify-center gap-3">
                          <button onClick={() => { setEditingProduct(p); setForm({ ...form, name: p.name, description: p.description, price: p.price.toString(), categoryId: p.categoryId, images: [p.images[0] || '', p.images[1] || ''] }); setIsModalOpen(true); }} className="p-2 bg-blue-50 text-blue-500 rounded-lg"><Edit size={16} /></button>
                          <button onClick={() => handleDelete(p.id)} className="p-2 bg-red-50 text-red-500 rounded-lg"><Trash2 size={16} /></button>
                        </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-2xl rounded-[50px] p-10 relative animate-scale-up max-h-[90vh] overflow-y-auto no-scrollbar">
             <button onClick={() => setIsModalOpen(false)} className="absolute top-10 left-10 p-2 hover:bg-gray-100 rounded-full"><X size={24} /></button>
             <h2 className="text-3xl font-black mb-10">{editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h2>
             
             <form onSubmit={handleSaveProduct} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400">اسم المنتج</label>
                    <input required className="w-full p-4 bg-gray-50 rounded-2xl outline-none border border-transparent focus:border-pink-200" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400">السعر (₪)</label>
                    <input required type="number" className="w-full p-4 bg-gray-50 rounded-2xl outline-none" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400">القسم</label>
                  <select required className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold text-gray-600" value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})}>
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
                    <div key={idx} className="relative aspect-square bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-100 flex items-center justify-center overflow-hidden group">
                      {form.images[idx] ? (
                        <>
                          <img src={form.images[idx]} className="w-full h-full object-cover" />
                          <button type="button" onClick={() => { const i = [...form.images]; i[idx] = ''; setForm({...form, images: i}); }} className="absolute top-4 left-4 bg-red-500 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12} /></button>
                        </>
                      ) : (
                        <button type="button" onClick={() => (idx === 0 ? fileInputRef1 : fileInputRef2).current?.click()} className="flex flex-col items-center gap-2 text-gray-300">
                          <Camera size={24} />
                          <span className="text-[10px] font-bold">ارفع صورة</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <input type="file" ref={fileInputRef1} className="hidden" onChange={e => handleFileChange(0, e)} />
                <input type="file" ref={fileInputRef2} className="hidden" onChange={e => handleFileChange(1, e)} />

                <button 
                  disabled={saveLoading}
                  className="w-full pink-primary-bg text-white py-5 rounded-3xl font-bold text-xl shadow-xl hover:shadow-pink-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {saveLoading ? <Loader2 className="animate-spin" /> : <Upload size={22} />}
                  {saveLoading ? 'جاري الرفع...' : 'حفظ ونشر المنتج'}
                </button>
             </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
