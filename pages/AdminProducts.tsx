
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Tag, X, Image as ImageIcon, Upload, Camera, Check, Grid } from 'lucide-react';
import { dataService } from '../services/dataService';
import { Product, Category, Discount } from '../types';
import { useApp } from '../App';

const AdminProducts: React.FC = () => {
  const { refreshData, activeTheme } = useApp();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const fileInputRef1 = useRef<HTMLInputElement>(null);
  const fileInputRef2 = useRef<HTMLInputElement>(null);

  // Form state
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

  // Fix: Await async getProducts and getCategories calls inside useEffect
  useEffect(() => {
    const load = async () => {
      setProducts(await dataService.getProducts());
      setCategories(await dataService.getCategories());
    };
    load();
  }, []);

  // Fix: Make handleAuth async to await settings from dataService
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const settings = await dataService.getSettings();
    if (password === settings.productMgmtPassword) {
      setIsAuthorized(true);
    } else {
      alert('كلمة مرور خاطئة لإدارة المنتجات');
    }
  };

  const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const newImages = [...form.images];
      newImages[index] = base64String;
      setForm({ ...form, images: newImages });
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (index: number) => {
    const newImages = [...form.images];
    newImages[index] = '';
    setForm({ ...form, images: newImages });
  };

  // Fix: Make handleSaveProduct async and use the newly added saveProducts plural method
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.images[0]) {
      alert('يرجى إضافة صورة واحدة على الأقل للمنتج');
      return;
    }

    const newProduct: Product = {
      id: editingProduct?.id || Math.random().toString(36).substr(2, 9),
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      images: form.images.filter(img => img),
      categoryId: form.categoryId || categories[0]?.id || '1',
      discount: {
        percent: parseInt(form.discountPercent),
        active: form.discountActive
      },
      createdAt: editingProduct?.createdAt || Date.now()
    };

    let updated;
    if (editingProduct) {
      updated = products.map(p => p.id === editingProduct.id ? newProduct : p);
    } else {
      updated = [newProduct, ...products];
    }

    // Fix: Await saveProducts
    await dataService.saveProducts(updated);
    setProducts(updated);
    
    setSaveSuccess(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setEditingProduct(null);
      resetForm();
      refreshData();
      setSaveSuccess(false);
    }, 800);
  };

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      price: '',
      images: ['', ''],
      categoryId: categories[0]?.id || '1',
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

  // Fix: Make handleDelete async and use saveProducts plural
  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المنتج؟ التغيير سيطبق فوراً على جميع الأجهزة.')) {
      const updated = products.filter(p => p.id !== id);
      await dataService.saveProducts(updated);
      setProducts(updated);
      refreshData();
    }
  };

  // Fix: Make handleAddCategory async and use saveCategories plural
  const handleAddCategory = async () => {
    if (!newCatName) return;
    const newCat: Category = { id: Math.random().toString(36).substr(2, 5), name: newCatName };
    const updated = [...categories, newCat];
    await dataService.saveCategories(updated);
    setCategories(updated);
    setNewCatName('');
    refreshData();
  };

  // Fix: Make handleDeleteCategory async and use saveCategories plural
  const handleDeleteCategory = async (id: string) => {
    if (id === '1') return;
    if (window.confirm('سيتم حذف التصنيف، هل أنت متأكد؟')) {
      const updated = categories.filter(c => c.id !== id);
      await dataService.saveCategories(updated);
      setCategories(updated);
      refreshData();
    }
  };

  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-[40px] shadow-2xl border border-gray-100 text-center fade-in">
        <div className="w-20 h-20 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <Tag size={40} />
        </div>
        <h2 className="text-2xl font-bold mb-2">إدارة مركزية آمنة</h2>
        <p className="text-gray-400 mb-8 text-sm">هذه المنطقة مخصصة لإدارة المخزون والتعديلات الرسمية فقط.</p>
        <form onSubmit={handleAuth} className="space-y-4">
          <input 
            type="password" 
            placeholder="كلمة مرور الإدارة"
            className="w-full p-5 bg-gray-50 rounded-2xl outline-none focus:ring-4 ring-pink-100 text-center text-xl font-mono transition-all"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoFocus
          />
          <button className="w-full pink-primary-bg text-white py-5 rounded-2xl font-bold text-lg shadow-xl active:scale-95 transition-all">تأكيد الدخول</button>
        </form>
      </div>
    );
  }

  return (
    <div className="fade-in space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">إدارة المنتجات والتصنيفات</h1>
          <p className="text-gray-500 font-bold text-sm">التعديلات المجرية هنا تظهر فوراً لجميع العملاء.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setEditingProduct(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 pink-primary-bg text-white px-8 py-4 rounded-2xl font-bold hover:shadow-xl transition-all shadow-md active:scale-95"
        >
          <Plus size={20} /> إضافة منتج جديد
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Categories Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
            <h3 className="font-bold mb-6 flex items-center gap-2 text-gray-700"><Grid size={18} className="text-pink-500" /> التصنيفات</h3>
            <div className="space-y-3 mb-8 max-h-[400px] overflow-y-auto no-scrollbar">
              {categories.map(cat => (
                <div key={cat.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-pink-100 transition-all group">
                  <span className="font-bold text-gray-700">{cat.name}</span>
                  {cat.id !== '1' && (
                    <button onClick={() => handleDeleteCategory(cat.id)} className="text-gray-300 hover:text-red-500 transition-colors"><X size={18} /></button>
                  )}
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="اسم تصنيف جديد..."
                className="w-full p-4 bg-gray-100 rounded-2xl outline-none text-sm font-bold border border-transparent focus:border-pink-200 focus:bg-white transition-all"
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
              />
              <button onClick={handleAddCategory} className="w-full p-4 bg-pink-100 text-pink-600 rounded-2xl hover:bg-pink-600 hover:text-white transition-all font-bold flex items-center justify-center gap-2"><Plus size={18} /> إضافة</button>
            </div>
          </div>
        </div>

        {/* Products List */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                  <tr>
                    <th className="p-6 text-gray-400 font-bold text-sm">المنتج</th>
                    <th className="p-6 text-gray-400 font-bold text-sm text-center">السعر</th>
                    <th className="p-6 text-gray-400 font-bold text-sm text-center">التصنيف</th>
                    <th className="p-6 text-gray-400 font-bold text-sm text-center">الخصم</th>
                    <th className="p-6 text-gray-400 font-bold text-sm text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-pink-50/30 transition-colors group">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <img src={p.images[0]} alt="" className="w-14 h-14 object-cover rounded-2xl bg-pink-50 border border-gray-100 shadow-sm" />
                          <span className="font-bold text-gray-800 truncate max-w-[200px]">{p.name}</span>
                        </div>
                      </td>
                      <td className="p-6 text-center font-bold text-gray-700">₪{p.price.toFixed(2)}</td>
                      <td className="p-6 text-center">
                        <span className="bg-gray-100 px-4 py-1.5 rounded-full text-xs font-bold text-gray-500">
                          {categories.find(c => c.id === p.categoryId)?.name || 'عام'}
                        </span>
                      </td>
                      <td className="p-6 text-center">
                        {p.discount.active ? (
                          <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-xs font-bold border border-green-200">
                            {p.discount.percent}% فعال
                          </span>
                        ) : (
                          <span className="text-gray-300 font-bold">---</span>
                        )}
                      </td>
                      <td className="p-6">
                        <div className="flex items-center justify-center gap-3">
                          <button onClick={() => handleEdit(p)} className="p-3 text-blue-500 bg-blue-50 hover:bg-blue-500 hover:text-white rounded-2xl transition-all shadow-sm"><Edit size={18} /></button>
                          <button onClick={() => handleDelete(p.id)} className="p-3 text-red-500 bg-red-50 hover:bg-red-500 hover:text-white rounded-2xl transition-all shadow-sm"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-20 text-center text-gray-300 font-bold">المخزن فارغ حالياً. ابدأ بإضافة منتجاتك الرسمية.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-[40px] shadow-2xl p-8 md:p-12 my-8 relative animate-scale-up overflow-hidden">
            {saveSuccess && (
              <div className="absolute inset-0 z-[110] bg-white/95 flex flex-col items-center justify-center fade-in">
                <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-4 animate-bounce">
                  <Check size={40} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">تم الحفظ بنجاح</h3>
                <p className="text-gray-500">جاري تحديث البيانات لجميع العملاء...</p>
              </div>
            )}
            
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 left-8 p-3 hover:bg-gray-100 rounded-full transition-colors"><X size={24} /></button>
            <h2 className="text-3xl font-bold mb-10 text-gray-800">{editingProduct ? 'تحديث بيانات المنتج' : 'إضافة منتج جديد للمتجر'}</h2>
            
            <form onSubmit={handleSaveProduct} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4 md:col-span-2">
                <label className="block text-gray-700 font-bold px-1">اسم المنتج</label>
                <input 
                  required
                  type="text" 
                  className="w-full p-5 bg-gray-50 border border-gray-100 rounded-[24px] outline-none focus:border-pink-300 focus:bg-white transition-all font-bold text-lg"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                />
              </div>
              <div className="space-y-4 md:col-span-2">
                <label className="block text-gray-700 font-bold px-1">وصف المنتج (التفاصيل والمميزات)</label>
                <textarea 
                  required
                  className="w-full p-5 bg-gray-50 border border-gray-100 rounded-[24px] outline-none h-32 focus:border-pink-300 focus:bg-white transition-all resize-none"
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                />
              </div>
              
              <div className="space-y-4">
                <label className="block text-gray-700 font-bold px-1">السعر الرسمي (₪)</label>
                <input 
                  required
                  type="number" 
                  step="0.01"
                  className="w-full p-5 bg-gray-50 border border-gray-100 rounded-[24px] outline-none focus:border-pink-300 focus:bg-white transition-all font-bold"
                  value={form.price}
                  onChange={e => setForm({...form, price: e.target.value})}
                />
              </div>
              <div className="space-y-4">
                <label className="block text-gray-700 font-bold px-1">التصنيف الإداري</label>
                <select 
                  className="w-full p-5 bg-gray-50 border border-gray-100 rounded-[24px] outline-none focus:border-pink-300 focus:bg-white transition-all font-bold"
                  value={form.categoryId}
                  onChange={e => setForm({...form, categoryId: e.target.value})}
                >
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {/* Image Upload Area */}
              <div className="md:col-span-2 space-y-4">
                <label className="block text-gray-700 font-bold px-1">صور المنتج الاحترافية</label>
                <div className="grid grid-cols-2 gap-8">
                  {[0, 1].map(index => (
                    <div key={index} className="relative group">
                      <input 
                        type="file" 
                        accept="image/*"
                        className="hidden"
                        ref={index === 0 ? fileInputRef1 : fileInputRef2}
                        onChange={(e) => handleFileChange(index, e)}
                      />
                      <div 
                        onClick={() => (index === 0 ? fileInputRef1 : fileInputRef2).current?.click()}
                        className={`aspect-square rounded-[32px] border-4 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${form.images[index] ? 'border-pink-500 bg-pink-50' : 'border-gray-100 bg-gray-50 hover:border-pink-300 hover:bg-pink-50/50'}`}
                      >
                        {form.images[index] ? (
                          <div className="relative w-full h-full p-3">
                            <img src={form.images[index]} alt="" className="w-full h-full object-cover rounded-[24px] shadow-sm" />
                            <button 
                              type="button"
                              onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                              className="absolute top-4 left-4 bg-red-500 text-white p-2.5 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                            >
                              <X size={20} />
                            </button>
                          </div>
                        ) : (
                          <div className="text-center p-6">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 text-pink-400 shadow-md">
                              <Camera size={32} />
                            </div>
                            <span className="text-sm font-bold text-gray-500">{index === 0 ? 'الصورة الرئيسية' : 'صورة ثانية'}</span>
                            <p className="text-xs text-gray-300 mt-2">انقر لاختيار صورة بجودة عالية</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 bg-pink-50 p-8 rounded-[32px] border border-pink-100 md:col-span-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-pink-500 text-white rounded-xl shadow-md">
                      <Tag size={20} />
                    </div>
                    <div>
                      <span className="font-bold text-pink-700 block">نظام الخصومات</span>
                      <span className="text-[10px] text-pink-400 font-bold">تفعيل عرض خاص على هذا المنتج</span>
                    </div>
                  </div>
                  <input 
                    type="checkbox" 
                    className="w-8 h-8 accent-pink-500 cursor-pointer rounded-xl"
                    checked={form.discountActive}
                    onChange={e => setForm({...form, discountActive: e.target.checked})}
                  />
                </div>
                {form.discountActive && (
                  <div className="flex items-center gap-6 mt-6 animate-fade-in">
                    <label className="text-sm font-bold text-pink-600 whitespace-nowrap">نسبة الخصم المئوية (%)</label>
                    <input 
                      type="number" 
                      className="w-full p-4 bg-white border border-pink-100 rounded-2xl outline-none focus:border-pink-300 text-center font-bold text-xl text-pink-700 shadow-inner"
                      value={form.discountPercent}
                      onChange={e => setForm({...form, discountPercent: e.target.value})}
                    />
                  </div>
                )}
              </div>
              
              <button 
                className="w-full md:col-span-2 pink-primary-bg text-white py-6 rounded-[28px] font-bold text-2xl hover:shadow-2xl hover:scale-[1.01] active:scale-[0.98] transition-all mt-6 flex items-center justify-center gap-4 shadow-xl"
                style={{ backgroundColor: activeTheme.primaryColor }}
              >
                <Upload size={28} />
                تأكيد الحفظ والمزامنة الفورية
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
