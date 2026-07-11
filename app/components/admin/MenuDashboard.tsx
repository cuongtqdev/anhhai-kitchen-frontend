"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import Cookies from "js-cookie";
import { 
  CircleNotch, WarningCircle, CheckCircle, Plus, 
  PencilSimple, X, Image as ImageIcon, MagnifyingGlass
} from "@phosphor-icons/react";
import Image from "next/image";
import { AdminNav } from "./AdminNav";

interface MenuItem {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string | null;
  imageUrl: string | null;
  isAvailable: boolean;
  stockCount: number;
  menuItemCategory: number;
}

export function MenuDashboard() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Tất cả");
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    description: "",
    menuItemCategory: 1, // 1: MainDish, 2: OptionalSide, 3: MandatorySide
    imageUrl: ""
  });
  
  // Image Upload State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5130";
  const getToken = () => Cookies.get("anhhai_access_token") || "";

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${apiUrl}/api/menu?showAll=true`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error("Không thể tải danh sách món ăn");
      const data = await res.json();
      setItems(data?.value || data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const toggleAvailability = async (id: number, currentStatus: boolean) => {
    try {
      const res = await fetch(`${apiUrl}/api/menu/${id}/availability`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ isAvailable: !currentStatus }),
      });
      
      if (!res.ok) throw new Error("Cập nhật trạng thái thất bại");
      
      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, isAvailable: !currentStatus } : item
      ));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const openModal = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        category: item.category,
        price: item.price.toString(),
        description: item.description || "",
        menuItemCategory: item.menuItemCategory,
        imageUrl: item.imageUrl || ""
      });
      setImagePreview(item.imageUrl);
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        category: "Cơm gà",
        price: "",
        description: "",
        menuItemCategory: 1,
        imageUrl: ""
      });
      setImagePreview(null);
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${apiUrl}/api/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Lỗi khi tải ảnh lên");
    }

    const data = await res.json();
    return data.value;
  };

  const saveMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.category) {
      alert("Vui lòng điền đầy đủ Tên, Danh mục và Giá.");
      return;
    }

    try {
      setSaving(true);
      
      let finalImageUrl = formData.imageUrl;
      
      if (imageFile) {
        setUploadingImage(true);
        finalImageUrl = await uploadImage(imageFile);
        setUploadingImage(false);
      }

      const payload = {
        name: formData.name,
        category: formData.category,
        price: Number(formData.price),
        description: formData.description || null,
        imageUrl: finalImageUrl || null,
        menuItemCategory: Number(formData.menuItemCategory)
      };

      const url = editingItem 
        ? `${apiUrl}/api/menu/${editingItem.id}` 
        : `${apiUrl}/api/menu`;
        
      const method = editingItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(editingItem ? "Cập nhật thất bại" : "Thêm mới thất bại");

      await fetchMenu();
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message);
      setUploadingImage(false);
    } finally {
      setSaving(false);
    }
  };

  // Lọc và Nhóm
  const categories = ["Tất cả", ...Array.from(new Set(items.map(i => i.category)))];

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "Tất cả" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading && items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <CircleNotch size={32} className="animate-spin text-amber-500" weight="bold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 font-sans pb-24">
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-white p-4 rounded-2xl shadow-sm border border-slate-200/60 sticky top-4 z-10">
          <div className="flex items-center gap-3">
            <AdminNav />
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">Quản lý Thực đơn</h1>
              <p className="text-[13px] font-medium text-slate-500">
                Thêm/sửa món ăn và cập nhật trạng thái kho
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => openModal()}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-md shadow-amber-500/20 text-sm"
            >
              <Plus size={16} weight="bold" /> Thêm món mới
            </button>
          </div>
        </header>

        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl font-medium flex items-center gap-2 border border-red-100">
            <WarningCircle size={20} weight="fill" />
            {error}
          </div>
        )}

        <div className="mb-6 flex flex-col gap-4">
          <div className="bg-white p-2 rounded-xl border border-slate-200 flex items-center gap-2 shadow-sm">
            <div className="pl-3 text-slate-400">
              <MagnifyingGlass size={20} />
            </div>
            <input 
              type="text" 
              placeholder="Tìm kiếm món ăn..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none py-2 text-slate-900 text-sm font-medium"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                  selectedCategory === cat 
                    ? 'bg-slate-800 text-white shadow-md' 
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 shadow-sm'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
            <div className="divide-y divide-slate-100">
              {filteredItems.map(item => (
                <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-4">
                    {item.imageUrl ? (
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 relative bg-slate-100 border border-slate-200">
                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                        <ImageIcon size={24} className="text-slate-400" />
                      </div>
                    )}
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className={`font-bold text-base ${!item.isAvailable ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                          {item.name}
                        </h3>
                        {!item.isAvailable && (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-red-100 text-red-700">Hết hàng</span>
                        )}
                      </div>
                      <div className="text-emerald-700 font-bold text-sm mt-0.5 flex items-center gap-2">
                        {item.price.toLocaleString('vi-VN')}đ
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-500">{item.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-auto shrink-0">
                    <button 
                      onClick={() => openModal(item)}
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                    >
                      <PencilSimple size={18} weight="fill" />
                    </button>

                    {/* Custom Toggle Switch */}
                    <button 
                      onClick={() => toggleAvailability(item.id, item.isAvailable)}
                      className={`relative w-14 h-8 rounded-full transition-colors flex items-center p-1 cursor-pointer focus:outline-none border border-black/5 shadow-inner ${
                        item.isAvailable ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                    >
                      <motion.div 
                        layout
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className={`w-6 h-6 rounded-full shadow-sm flex items-center justify-center ${
                          item.isAvailable ? 'bg-white ml-auto' : 'bg-white mr-auto'
                        }`}
                      >
                        {item.isAvailable ? <CheckCircle size={14} className="text-emerald-500" weight="bold" /> : <X size={14} className="text-slate-400" weight="bold" />}
                      </motion.div>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {filteredItems.length === 0 && (
            <div className="text-center py-20 text-slate-500 font-medium bg-white rounded-3xl border border-slate-200 border-dashed">
              Không tìm thấy món ăn nào.
            </div>
          )}
        </div>
      </div>

      {/* Modal Edit / Create */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !saving && setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-900">
                  {editingItem ? 'Chỉnh sửa món ăn' : 'Thêm món mới'}
                </h3>
                <button
                  onClick={() => !saving && setIsModalOpen(false)}
                  disabled={saving}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors disabled:opacity-50"
                >
                  <X size={16} weight="bold" />
                </button>
              </div>

              <div className="p-5 overflow-y-auto flex-1">
                <form id="menuForm" onSubmit={saveMenu} className="space-y-5">
                  {/* Image Upload Area */}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Hình ảnh</label>
                    <div 
                      onClick={() => !saving && fileInputRef.current?.click()}
                      className={`relative w-full h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors overflow-hidden ${saving ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      {imagePreview ? (
                        <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                      ) : (
                        <>
                          <ImageIcon size={32} className="text-slate-400 mb-2" />
                          <span className="text-sm font-medium text-slate-500">Bấm để tải ảnh lên</span>
                          <span className="text-xs text-slate-400 mt-1">JPG, PNG, WebP (Tối đa 5MB)</span>
                        </>
                      )}
                      {imagePreview && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <span className="text-white font-bold text-sm bg-black/50 px-3 py-1.5 rounded-lg backdrop-blur-md">Đổi ảnh</span>
                        </div>
                      )}
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept=".jpg,.jpeg,.png,.webp"
                      onChange={handleImageChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Tên món</label>
                    <input
                      required
                      type="text"
                      disabled={saving}
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all disabled:opacity-50"
                      placeholder="VD: Cơm gà đùi xối mỡ"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Giá bán (VNĐ)</label>
                      <input
                        required
                        type="number"
                        min="0"
                        step="1000"
                        disabled={saving}
                        value={formData.price}
                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all disabled:opacity-50"
                        placeholder="VD: 45000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Phân loại</label>
                      <select
                        disabled={saving}
                        value={formData.menuItemCategory}
                        onChange={e => setFormData({ ...formData, menuItemCategory: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all disabled:opacity-50"
                      >
                        <option value={1}>Món chính (Main Dish)</option>
                        <option value={2}>Món phụ (Optional Side)</option>
                        <option value={3}>Món đi kèm (Mandatory Side)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Danh mục hiển thị (Tự do)</label>
                    <input
                      required
                      type="text"
                      disabled={saving}
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all disabled:opacity-50"
                      placeholder="VD: Cơm gà, Nước uống, Đồ ăn thêm..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Mô tả (Tuỳ chọn)</label>
                    <textarea
                      disabled={saving}
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all resize-none disabled:opacity-50"
                      placeholder="Mô tả ngắn gọn về món ăn..."
                      rows={3}
                    />
                  </div>
                </form>
              </div>

              <div className="p-5 border-t border-slate-100 bg-slate-50">
                <button
                  type="submit"
                  form="menuForm"
                  disabled={saving}
                  className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-70 text-sm shadow-md shadow-amber-500/20"
                >
                  {saving ? (
                    <>
                      <CircleNotch size={18} className="animate-spin" />
                      {uploadingImage ? 'Đang tải ảnh lên...' : 'Đang lưu...'}
                    </>
                  ) : (
                    'Lưu thông tin'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
