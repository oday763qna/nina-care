
import React, { useState, useEffect, useRef } from 'react';
/* Added missing 'Package' icon import */
import { Plus, Edit, Trash2, Tag, X, Image as ImageIcon, Upload, Camera, Check, Grid, Lock, Loader2, ChevronDown, ChevronRight, Layers, Package } from 'lucide-react';
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
  const [newCatParentId, setNewCatParentId] = useState('');
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
      const newCat: Category = { 
        id: `cat_${Date.now()}`, 
        name: newCatName,
        parentId: newCatParentId || undefined
      };
      await dataService.addCategory(newCat);
      setNewCatName('');
      setNewCatParentId('');
      await loadData();
      await refreshData();
    } catch (err) {
      alert("فشل إضافة القسم");
    } finally {
      setCatLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('هل تريد حذف هذا القسم؟ (ملاحظة: سيتم فصل جميع المنتجات التابعة له)')) {
      await dataService.deleteCategory(id);
      await loadData();
      await refreshData();
    }
  };

  const getCategoryPath = (catId: string): string => {
    const cat = categories.find(c => c.id === catId);
    if (!cat) return 'غير مصنف';
    if (cat.parentId) {
      const parent = categories.find(c => c.id === cat.parentId);
      return parent ? `${parent.name} > ${cat.name}` : cat.name;
    }
    return cat.name;
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-gray-800 tracking-tight">إدارة المخزون</h1>
          <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">تحديث الأقسام والمنتجات لحظياً</p>
        </div>
        <button 
          onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
          className="pink-primary-bg text-white px-10 py-5 rounded-3xl font-black text-sm uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-pink-100 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Plus size={20} /> إضافة منتج جديد
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* قسم الفئات المطور (أقسام داخل أقسام) */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-50">
            <h3 className="font-black text-gray-800 mb-8 flex items-center gap-3"><Layers size={20} className="text-pink-500" /> إدارة الأقسام</h3>
            
            <div className="space-y-4 mb-10 max-h-[400px] overflow-y-auto no-scrollbar pr-2">
              {categories.filter(c => !c.parentId).map(parent => (
                <div key={parent.id} className="space-y-2">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl group border border-transparent hover:border-pink-100 transition-all">
                    <span className="text-sm font-black text-gray-700">{parent.name}</span>
                    <button onClick={() => handleDeleteCategory(parent.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {/* الأقسام الفرعية */}
                  <div className="mr-6 space-y-2">
                    {categories.filter(sub => sub.parentId === parent.id).map(sub => (
                      <div key={sub.id} className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-xl group hover:border-pink-100 transition-all">
                        <div className="flex items-center gap-2">
                           <ChevronRight size={14} className="text-gray-300" />
                           <span className="text-[11px] font-bold text-gray-500">{sub.name}</span>
                        </div>
                        <button onClick={() => handleDeleteCategory(sub.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-6 border-t border-gray-50">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">إضافة قسم جديد</p>
              <input 
                placeholder="اسم القسم..." 
                className="w-full p-4 bg-gray-50 rounded-2xl outline-none text-xs font-bold border border-transparent focus:border-pink-200"
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
              />
              <select 
                className="w-full p-4 bg-gray-50 rounded-2xl outline-none text-[10px] font-bold text-gray-500"
                value={newCatParentId}
                onChange={e => setNewCatParentId(e.target.value)}
              >
                <option value="">قسم رئيسي (بدون أب)</option>
                {categories.filter(c => !c.parentId).map(c => (
                  <option key={c.id} value={c.id}>داخل قسم: {c.name}</option>
                ))}
              </select>
              <button 
                onClick={handleAddCategory}
                disabled={catLoading || !newCatName}
                className="w-full p-4 bg-pink-50 text-pink-600 rounded-2xl font-black text-xs hover:bg-pink-600 hover:text-white transition-all shadow-sm active:scale-95"
              >
                {catLoading ? <Loader2 className="animate-spin mx-auto" size={16} /> : 'إضافة القسم الآن'}
              </button>
            </div>
          </div>
        </div>

        {/* جدول المنتجات المطور */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-[45px] shadow-sm border border-gray-50 overflow-hidden">
             <div className="overflow-x-auto">
               <table className="w-full text-right">
                 <thead className="bg-gray-50/50">
                   <tr>
                     <th className="p-8 text-xs text-gray-400 font-black uppercase tracking-widest">المنتج</th>
                     <th className="p-8 text-xs text-gray-400 font-black uppercase tracking-widest text-center">المسار (القسم)</th>
                     <th className="p-8 text-xs text-gray-400 font-black uppercase tracking-widest text-center">السعر الصافي</th>
                     <th className="p-8 text-xs text-gray-400 font-black uppercase tracking-widest text-center">الإجراءات</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                   {products.map(p => (
                     <tr key={p.id} className="hover:bg-pink-50/5 transition-all duration-300">
                       <td className="p-8">
                         <div className="flex items-center gap-5">
                           <div className="relative">
                             <img src={p.images[0]} className="w-16 h-16 object-cover rounded-2xl border border-gray-100 shadow-sm" />
                             {p.discount.active && <div className="absolute -top-2 -right-2 bg-pink-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black">%</div>}
                           </div>
                           <div className="flex flex-col">
                             <span className="font-black text-gray-800 text-lg tracking-tight">{p.name}</span>
                             <span className="text-[10px] text-gray-400 font-bold uppercase">ID: {p.id.slice(-5)}</span>
                           </div>
                         </div>
                       </td>
                       <td className="p-8 text-center">
                          <div className="inline-flex items-center gap-2 bg-pink-50 text-pink-600 px-5 py-2 rounded-full text-[10px] font-black border border-pink-100 shadow-sm">
                            <Layers size={12} />
                            {getCategoryPath(p.categoryId)}
                          </div>
                       </td>
                       <td className="p-8 text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-black text-gray-900 text-xl tracking-tighter">₪{p.price.toFixed(2)}</span>
                            {p.discount.active && <span className="text-[10px] text-pink-500 font-bold">خصم {p.discount.percent}%</span>}
                          </div>
                       </td>
                       <td className="p-8">
                          <div className="flex items-center justify-center gap-4">
                            <button 
                              onClick={() => { 
                                setEditingProduct(p); 
                                setForm({ 
                                  name: p.name, 
                                  description: p.description, 
                                  price: p.price.toString(), 
                                  categoryId: p.categoryId, 
                                  images: [p.images[0] || '', p.images[1] || ''],
                                  discountPercent: p.discount.percent.toString(),
                                  discountActive: p.discount.active
                                }); 
                                setIsModalOpen(true); 
                              }} 
                              className="p-3 bg-blue-50 text-blue-500 rounded-2xl hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                            >
                              <Edit size={18} />
                            </button>
                            <button 
                              onClick={() => handleDelete(p.id)} 
                              className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
             {products.length === 0 && (
               <div className="py-40 text-center flex flex-col items-center">
                  <Package size={60} className="text-gray-100 mb-6" />
                  <p className="text-gray-400 font-bold text-lg">لم تقومي بإضافة أي منتجات حتى الآن</p>
               </div>
             )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-2xl rounded-[60px] p-10 md:p-14 relative animate-scale-up max-h-[90vh] overflow-y-auto no-scrollbar shadow-[0_0_100px_rgba(0,0,0,0.3)]">
             <button onClick={() => setIsModalOpen(false)} className="absolute top-12 left-12 p-3 hover:bg-gray-100 rounded-full transition-colors"><X size={28} /></button>
             <h2 className="text-4xl font-black mb-12 tracking-tight">{editingProduct ? 'تعديل بيانات المنتج' : 'إضافة منتج لنينو كير'}</h2>
             
             <form onSubmit={handleSaveProduct} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pr-2">اسم المنتج</label>
                    <input required className="w-full p-5 bg-gray-50 rounded-[25px] outline-none border border-transparent focus:border-pink-300 transition-all font-bold" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pr-2">السعر الأساسي (₪)</label>
                    <input required type="number" className="w-full p-5 bg-gray-50 rounded-[25px] outline-none border border-transparent focus:border-pink-300 transition-all font-bold" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pr-2">القسم المختار</label>
                    <select required className="w-full p-5 bg-gray-50 rounded-[25px] outline-none font-bold text-gray-700" value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})}>
                      <option value="" disabled>اختاري من الأقسام المتاحة</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{getCategoryPath(c.id)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pr-2">نظام الخصم</label>
                    <div className="flex gap-4">
                      <input 
                        type="number" 
                        placeholder="%" 
                        className="w-24 p-5 bg-gray-50 rounded-[25px] outline-none font-bold text-center" 
                        value={form.discountPercent} 
                        onChange={e => setForm({...form, discountPercent: e.target.value})} 
                      />
                      <button 
                        type="button"
                        onClick={() => setForm({...form, discountActive: !form.discountActive})}
                        className={`flex-1 rounded-[25px] font-black text-xs transition-all border-2 ${form.discountActive ? 'bg-pink-600 text-white border-pink-600' : 'bg-white text-gray-400 border-gray-100'}`}
                      >
                        {form.discountActive ? 'الخصم مفعل' : 'تفعيل الخصم؟'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pr-2">وصف المنتج الفني</label>
                  <textarea className="w-full p-5 bg-gray-50 rounded-[30px] outline-none h-32 resize-none font-bold text-sm leading-relaxed" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {[0, 1].map(idx => (
                    <div key={idx} className="relative aspect-square bg-gray-50 rounded-[40px] border-4 border-dashed border-gray-100 flex items-center justify-center overflow-hidden group hover:border-pink-200 transition-all">
                      {form.images[idx] ? (
                        <>
                          <img src={form.images[idx]} className="w-full h-full object-cover" />
                          <button type="button" onClick={() => { const i = [...form.images]; i[idx] = ''; setForm({...form, images: i}); }} className="absolute top-6 left-6 bg-red-500 text-white p-3 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16} /></button>
                        </>
                      ) : (
                        <button type="button" onClick={() => (idx === 0 ? fileInputRef1 : fileInputRef2).current?.click()} className="flex flex-col items-center gap-4 text-gray-300 group-hover:text-pink-300 transition-colors">
                          <Camera size={36} />
                          <span className="text-xs font-black uppercase tracking-widest">رفع صورة المنتج</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <input type="file" ref={fileInputRef1} className="hidden" onChange={e => handleFileChange(0, e)} />
                <input type="file" ref={fileInputRef2} className="hidden" onChange={e => handleFileChange(1, e)} />

                <button 
                  disabled={saveLoading}
                  className="w-full pink-primary-bg text-white py-6 rounded-[30px] font-black text-xl shadow-2xl shadow-pink-100 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                >
                  {saveLoading ? <Loader2 className="animate-spin" /> : <Check size={28} />}
                  {saveLoading ? 'جاري المزامنة...' : (editingProduct ? 'تحديث المنتج الآن' : 'نشر المنتج في المتجر')}
                </button>
             </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
