
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Tag, X, Image as ImageIcon, Upload, Camera } from 'lucide-react';
import { dataService } from '../services/dataService';
import { Product, Category, Discount } from '../types';
import { useApp } from '../App';

const AdminProducts: React.FC = () => {
  const { refreshData } = useApp();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
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

  useEffect(() => {
    setProducts(dataService.getProducts());
    setCategories(dataService.getCategories());
  }, []);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === dataService.getSettings().productMgmtPassword) {
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

  const handleSaveProduct = (e: React.FormEvent) => {
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
      categoryId: form.categoryId || categories[0]?.id,
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

    dataService.saveProducts(updated);
    setProducts(updated);
    setIsModalOpen(false);
    setEditingProduct(null);
    resetForm();
    refreshData();
  };

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      price: '',
      images: ['', ''],
      categoryId: '',
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

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      const updated = products.filter(p => p.id !== id);
      dataService.saveProducts(updated);
      setProducts(updated);
      refreshData();
    }
  };

  const handleAddCategory = () => {
    if (!newCatName) return;
    const newCat: Category = { id: Math.random().toString(36).substr(2, 5), name: newCatName };
    const updated = [...categories, newCat];
    dataService.saveCategories(updated);
    setCategories(updated);
    setNewCatName('');
    refreshData();
  };

  const handleDeleteCategory = (id: string) => {
    if (id === '1') return;
    if (window.confirm('سيتم حذف التصنيف، هل أنت متأكد؟')) {
      const updated = categories.filter(c => c.id !== id);
      dataService.saveCategories(updated);
      setCategories(updated);
      refreshData();
    }
  };

  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl shadow-xl border border-pink-50 text-center">
        <Tag className="mx-auto mb-6 text-pink-500" size={48} />
        <h2 className="text-2xl font-bold mb-6">إدارة المنتجات مقفلة</h2>
        <form onSubmit={handleAuth} className="space-y-4">
          <input 
            type="password" 
            placeholder="أدخل كلمة مرور إدارة المنتجات"
            className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 ring-pink-300 text-center"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button className="w-full pink-primary-bg text-white py-4 rounded-xl font-bold">دخول</button>
        </form>
      </div>
    );
  }

  return (
    <div className="fade-in space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">إدارة المنتجات والتصنيفات</h1>
        <button 
          onClick={() => { resetForm(); setEditingProduct(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 pink-primary-bg text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
        >
          <Plus size={20} /> إضافة منتج جديد
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Categories Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-bold mb-4">التصنيفات</h3>
            <div className="space-y-2 mb-6">
              {categories.map(cat => (
                <div key={cat.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span>{cat.name}</span>
                  {cat.id !== '1' && (
                    <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-400 hover:text-red-600"><X size={16} /></button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="تصنيف جديد..."
                className="flex-1 p-3 bg-gray-50 rounded-xl outline-none text-sm"
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
              />
              <button onClick={handleAddCategory} className="p-3 bg-pink-100 text-pink-600 rounded-xl hover:bg-pink-200 transition-colors"><Plus size={20} /></button>
            </div>
          </div>
        </div>

        {/* Products List */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="p-6">المنتج</th>
                    <th className="p-6">السعر</th>
                    <th className="p-6">التصنيف</th>
                    <th className="p-6">الخصم</th>
                    <th className="p-6">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-pink-50/30 transition-colors">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <img src={p.images[0]} alt="" className="w-12 h-12 object-cover rounded-lg bg-pink-50" />
                          <span className="font-bold truncate max-w-[150px]">{p.name}</span>
                        </div>
                      </td>
                      <td className="p-6">₪{p.price}</td>
                      <td className="p-6">{categories.find(c => c.id === p.categoryId)?.name}</td>
                      <td className="p-6">
                        {p.discount.active ? (
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">{p.discount.percent}% فعال</span>
                        ) : (
                          <span className="text-gray-400">---</span>
                        )}
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleEdit(p)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit size={18} /></button>
                          <button onClick={() => handleDelete(p.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-gray-400">لا يوجد منتجات حالياً.</td>
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
          <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl p-8 my-8 relative animate-scale-up">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 left-6 p-2 hover:bg-gray-100 rounded-full transition-colors"><X /></button>
            <h2 className="text-2xl font-bold mb-8">{editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h2>
            
            <form onSubmit={handleSaveProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 md:col-span-2">
                <label className="block text-gray-700 font-bold">اسم المنتج</label>
                <input 
                  required
                  type="text" 
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-pink-300 transition-colors"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                />
              </div>
              <div className="space-y-4 md:col-span-2">
                <label className="block text-gray-700 font-bold">وصف المنتج</label>
                <textarea 
                  required
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none h-32 focus:border-pink-300 transition-colors"
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                />
              </div>
              
              <div className="space-y-4">
                <label className="block text-gray-700 font-bold">السعر (₪)</label>
                <input 
                  required
                  type="number" 
                  step="0.01"
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-pink-300 transition-colors"
                  value={form.price}
                  onChange={e => setForm({...form, price: e.target.value})}
                />
              </div>
              <div className="space-y-4">
                <label className="block text-gray-700 font-bold">التصنيف</label>
                <select 
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-pink-300 transition-colors"
                  value={form.categoryId}
                  onChange={e => setForm({...form, categoryId: e.target.value})}
                >
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {/* Image Upload Area */}
              <div className="md:col-span-2 space-y-4">
                <label className="block text-gray-700 font-bold">صور المنتج (صورتان كحد أقصى)</label>
                <div className="grid grid-cols-2 gap-6">
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
                        className={`aspect-square rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${form.images[index] ? 'border-pink-500 bg-pink-50' : 'border-gray-200 bg-gray-50 hover:border-pink-300 hover:bg-pink-50/50'}`}
                      >
                        {form.images[index] ? (
                          <div className="relative w-full h-full p-2">
                            <img src={form.images[index]} alt="" className="w-full h-full object-cover rounded-2xl" />
                            <button 
                              type="button"
                              onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                              className="absolute -top-2 -left-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <div className="text-center p-4">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 text-pink-400 shadow-sm">
                              <Camera size={24} />
                            </div>
                            <span className="text-xs font-bold text-gray-400">{index === 0 ? 'الصورة الرئيسية' : 'صورة إضافية'}</span>
                            <p className="text-[10px] text-gray-300 mt-1">اضغطي للاختيار من المعرض</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 bg-pink-50 p-6 rounded-3xl border border-pink-100 md:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Tag size={20} className="text-pink-500" />
                    <span className="font-bold text-pink-700">تفعيل خصم مؤقت</span>
                  </div>
                  <input 
                    type="checkbox" 
                    className="w-6 h-6 accent-pink-500 cursor-pointer"
                    checked={form.discountActive}
                    onChange={e => setForm({...form, discountActive: e.target.checked})}
                  />
                </div>
                {form.discountActive && (
                  <div className="flex items-center gap-4 animate-fade-in">
                    <label className="text-sm font-bold text-pink-600">نسبة الخصم (%)</label>
                    <input 
                      type="number" 
                      className="w-full p-3 bg-white border border-pink-100 rounded-xl outline-none focus:border-pink-300 text-center font-bold"
                      value={form.discountPercent}
                      onChange={e => setForm({...form, discountPercent: e.target.value})}
                    />
                  </div>
                )}
              </div>
              
              <button className="w-full md:col-span-2 pink-primary-bg text-white py-5 rounded-2xl font-bold text-xl hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all mt-4 flex items-center justify-center gap-2">
                <Upload size={24} />
                حفظ المنتج
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
