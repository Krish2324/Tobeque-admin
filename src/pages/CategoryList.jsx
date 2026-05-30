import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Folder, Image, ShieldAlert } from 'lucide-react';
import axios from 'axios';
import Modal from '../components/Modal';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  // Category Form Modals
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catDescription, setCatDescription] = useState('');
  const [catParentId, setCatParentId] = useState('');
  const [catDisplayType, setCatDisplayType] = useState('Default');
  const [catGoogleProductCategory, setCatGoogleProductCategory] = useState('');
  const [catImageFile, setCatImageFile] = useState(null);
  const [catBannerFile, setCatBannerFile] = useState(null);
  const [catSeoTitle, setCatSeoTitle] = useState('');
  const [catSeoDesc, setCatSeoDesc] = useState('');
  const [catSaving, setCatSaving] = useState(false);

  // Brand Form Modals
  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [brandName, setBrandName] = useState('');
  const [brandDesc, setBrandDesc] = useState('');
  const [brandLogoFile, setBrandLogoFile] = useState(null);
  const [brandSaving, setBrandSaving] = useState(false);

  const { showNotification } = useNotification();
  const { admin } = useAuth();

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [catRes, brandRes] = await Promise.all([
        axios.get('/api/categories'),
        axios.get('/api/categories/brands/all')
      ]);
      if (catRes.data.success) setCategories(catRes.data.categories);
      if (brandRes.data.success) setBrands(brandRes.data.brands);
    } catch (err) {
      console.error('Error fetching categories & brands:', err);
      showNotification('Failed to load categories/brands data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Category Open Form
  const openCatModal = (cat = null) => {
    if (cat) {
      setEditingCategory(cat);
      setCatName(cat.name);
      setCatSlug(cat.slug || '');
      setCatDescription(cat.description || '');
      setCatParentId(cat.parentId || '');
      setCatDisplayType(cat.displayType || 'Default');
      setCatGoogleProductCategory(cat.googleProductCategory || '');
      setCatSeoTitle(cat.seoTitle || '');
      setCatSeoDesc(cat.seoDescription || '');
    } else {
      setEditingCategory(null);
      setCatName('');
      setCatSlug('');
      setCatDescription('');
      setCatParentId('');
      setCatDisplayType('Default');
      setCatGoogleProductCategory('');
      setCatSeoTitle('');
      setCatSeoDesc('');
    }
    setCatImageFile(null);
    setCatBannerFile(null);
    setCatModalOpen(true);
  };

  // Category Submit
  const handleCatSubmit = async (e) => {
    e.preventDefault();
    if (!catName) {
      showNotification('Please enter a category name.', 'warning');
      return;
    }

    setCatSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', catName);
      formData.append('slug', catSlug);
      formData.append('description', catDescription);
      formData.append('parentId', catParentId);
      formData.append('displayType', catDisplayType);
      formData.append('googleProductCategory', catGoogleProductCategory);
      formData.append('seoTitle', catSeoTitle);
      formData.append('seoDescription', catSeoDesc);

      if (catImageFile) formData.append('image', catImageFile);
      if (catBannerFile) formData.append('banner', catBannerFile);

      let res;
      if (editingCategory) {
        res = await axios.put(`/api/categories/${editingCategory.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        res = await axios.post('/api/categories', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (res.data.success) {
        showNotification(`Category successfully ${editingCategory ? 'updated' : 'created'}!`, 'success');
        setCatModalOpen(false);
        fetchAllData();
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to save category.';
      showNotification(msg, 'error');
    } finally {
      setCatSaving(false);
    }
  };

  const handleCatDelete = async (id, name) => {
    if (!window.confirm(`Are you absolutely sure you want to delete category "${name}"? It cascades!`)) return;

    try {
      const res = await axios.delete(`/api/categories/${id}`);
      if (res.data.success) {
        showNotification(`Category "${name}" deleted successfully.`, 'success');
        fetchAllData();
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to delete category.';
      showNotification(msg, 'error');
    }
  };

  // Brand Open Form
  const openBrandModal = (brand = null) => {
    if (brand) {
      setEditingBrand(brand);
      setBrandName(brand.name);
      setBrandDesc(brand.description || '');
    } else {
      setEditingBrand(null);
      setBrandName('');
      setBrandDesc('');
    }
    setBrandLogoFile(null);
    setBrandModalOpen(true);
  };

  // Brand Submit
  const handleBrandSubmit = async (e) => {
    e.preventDefault();
    if (!brandName) {
      showNotification('Please enter a brand name.', 'warning');
      return;
    }

    setBrandSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', brandName);
      formData.append('description', brandDesc);
      if (brandLogoFile) formData.append('logo', brandLogoFile);

      let res;
      if (editingBrand) {
        res = await axios.put(`/api/categories/brands/${editingBrand.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        res = await axios.post('/api/categories/brands', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (res.data.success) {
        showNotification(`Brand successfully ${editingBrand ? 'updated' : 'registered'}!`, 'success');
        setBrandModalOpen(false);
        fetchAllData();
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to save brand.';
      showNotification(msg, 'error');
    } finally {
      setBrandSaving(false);
    }
  };

  const handleBrandDelete = async (id, name) => {
    if (!window.confirm(`Are you absolutely sure you want to delete brand "${name}"?`)) return;

    try {
      const res = await axios.delete(`/api/categories/brands/${id}`);
      if (res.data.success) {
        showNotification(`Brand "${name}" deleted successfully.`, 'success');
        fetchAllData();
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to delete brand.';
      showNotification(msg, 'error');
    }
  };

  // Compile parent options list (flattens tree to exclude self)
  const getParentOptions = () => {
    const list = [];
    const recurse = (cats, prefix = '') => {
      cats.forEach(c => {
        if (editingCategory && c.id === editingCategory.id) return;
        list.push({ id: c.id, name: `${prefix}${c.name}` });
        if (c.subcategories && c.subcategories.length > 0) {
          recurse(c.subcategories, `${prefix}${c.name} > `);
        }
      });
    };
    recurse(categories);
    return list;
  };

  // Render recursive category tree list items
  const renderCategoryTree = (cats, depth = 0) => {
    return cats.map(cat => (
      <div key={cat.id} className="space-y-2">
        <div 
          className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200/50 hover:border-brand-500/25 shadow-sm dark:bg-slate-900 dark:border-slate-800/80 transition-all"
          style={{ marginLeft: `${depth * 28}px` }}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            {cat.image ? (
              <img src={cat.image} alt={cat.name} className="w-9 h-9 rounded-lg object-cover border border-slate-100 dark:border-slate-800 flex-shrink-0" />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-brand-500/10 text-brand-650 flex items-center justify-center flex-shrink-0">
                <Folder className="w-4.5 h-4.5" />
              </div>
            )}
            <div className="flex flex-col truncate">
              <span className="text-xs font-bold text-slate-800 dark:text-white truncate">{cat.name}</span>
              <span className="text-[10px] text-slate-450 dark:text-slate-450 truncate">slug: {cat.slug}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => openCatModal(cat)}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-350 dark:hover:text-white"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
            {['superadmin', 'manager'].includes(admin?.role) && (
              <button
                onClick={() => handleCatDelete(cat.id, cat.name)}
                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/20 dark:hover:bg-rose-950/30 dark:text-rose-450"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
        {cat.subcategories && cat.subcategories.length > 0 && renderCategoryTree(cat.subcategories, depth + 1)}
      </div>
    ));
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">Categories & Brands</h1>
        <p className="text-xs text-slate-450 dark:text-slate-400 font-medium">Manage nested product categories hierarchies and catalog brands lists</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Categories Tree Grid (Left Double Column) */}
        <div className="lg:col-span-2 glass-card p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-850">
            <div className="flex items-center gap-2">
              <Folder className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Categories Tree Map</h3>
            </div>
            <button
              onClick={() => openCatModal()}
              className="btn-primary py-1.5 px-3 rounded-lg text-xs font-semibold"
            >
              <Plus className="w-4 h-4" />
              New Category
            </button>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[70vh] pr-2 custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-12 text-xs font-semibold text-slate-450">No categories registered in database.</div>
            ) : (
              renderCategoryTree(categories)
            )}
          </div>
        </div>

        {/* Brands Panel Grid (Right Sidebar Column) */}
        <div className="glass-card p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-850">
            <div className="flex items-center gap-2">
              <Image className="w-5 h-5 text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Catalog Brands</h3>
            </div>
            <button
              onClick={() => openBrandModal()}
              className="btn-secondary text-xs flex items-center justify-center gap-1 py-1.5 px-3 border border-slate-200 dark:border-slate-800"
            >
              <Plus className="w-4 h-4" />
              Add Brand
            </button>
          </div>

          <div className="space-y-4 overflow-y-auto max-h-[70vh] pr-2 custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : brands.length === 0 ? (
              <div className="text-center py-12 text-xs font-semibold text-slate-450">No brands registered in database.</div>
            ) : (
              brands.map((b) => (
                <div key={b.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-slate-200/50 hover:border-indigo-500/25 shadow-sm dark:bg-slate-900 dark:border-slate-800/80 transition-all">
                  <div className="flex items-center gap-3 overflow-hidden">
                    {b.logo ? (
                      <img src={b.logo} alt={b.name} className="w-9 h-9 rounded-lg object-cover border border-slate-100 dark:border-slate-800 flex-shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-650 flex items-center justify-center font-extrabold text-[10px] flex-shrink-0">
                        {b.name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="flex flex-col truncate text-xs">
                      <span className="font-bold text-slate-800 dark:text-white truncate">{b.name}</span>
                      <span className="text-[10px] text-slate-450 dark:text-slate-400 truncate leading-relaxed">{b.description || 'No description'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => openBrandModal(b)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-350 dark:hover:text-white"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    {['superadmin', 'manager'].includes(admin?.role) && (
                      <button
                        onClick={() => handleBrandDelete(b.id, b.name)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/20 dark:hover:bg-rose-950/30 dark:text-rose-450"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Category Editor Popup Modal */}
      <Modal
        isOpen={catModalOpen}
        onClose={() => setCatModalOpen(false)}
        title={editingCategory ? 'Edit Placement Category' : 'Create Placement Category'}
      >
        <form onSubmit={handleCatSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="form-label text-xs">Category Name *</label>
              <input
                type="text"
                required
                placeholder="EX: Computers, Smart Home"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                className="form-input text-xs"
              />
            </div>
            <div>
              <label className="form-label text-xs">Slug</label>
              <input
                type="text"
                placeholder="auto-generated if empty"
                value={catSlug}
                onChange={(e) => setCatSlug(e.target.value)}
                className="form-input text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="form-label text-xs">Parent Placement Hierarchy</label>
              <select
                value={catParentId}
                onChange={(e) => setCatParentId(e.target.value)}
                className="form-input text-xs h-[38px] py-1 bg-slate-50 dark:bg-slate-800"
              >
                <option value="">Root Category (No Parent)</option>
                {getParentOptions().map((opt) => (
                  <option key={opt.id} value={opt.id}>{opt.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label text-xs">Display Type</label>
              <select
                value={catDisplayType}
                onChange={(e) => setCatDisplayType(e.target.value)}
                className="form-input text-xs h-[38px] py-1 bg-slate-50 dark:bg-slate-800"
              >
                <option value="Default">Default</option>
                <option value="Products">Products</option>
                <option value="Subcategories">Subcategories</option>
                <option value="Both">Both</option>
              </select>
            </div>
          </div>

          <div>
            <label className="form-label text-xs">Description details</label>
            <textarea
              rows={3}
              placeholder="Short description..."
              value={catDescription}
              onChange={(e) => setCatDescription(e.target.value)}
              className="form-input text-xs resize-none"
            />
          </div>

          <div>
            <label className="form-label text-xs">Default Google product category</label>
            <input
              type="text"
              placeholder="E.g. Electronics > Computers > Desktop PCs"
              value={catGoogleProductCategory}
              onChange={(e) => setCatGoogleProductCategory(e.target.value)}
              className="form-input text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="form-label text-xs">Icon/Thumbnail Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCatImageFile(e.target.files[0])}
                className="form-input text-xs"
              />
            </div>
            <div>
              <label className="form-label text-xs">Placement Banner Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCatBannerFile(e.target.files[0])}
                className="form-input text-xs"
              />
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-850 pt-3 space-y-3">
            <span className="text-[10px] text-brand-600 font-bold uppercase tracking-wider block">SEO parameters</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="form-label text-xs">Meta title</label>
                <input
                  type="text"
                  placeholder="EX: Desktop PCs"
                  value={catSeoTitle}
                  onChange={(e) => setCatSeoTitle(e.target.value)}
                  className="form-input text-xs"
                />
              </div>
              <div>
                <label className="form-label text-xs">Meta desc</label>
                <input
                  type="text"
                  placeholder="EX: Shop desktops..."
                  value={catSeoDesc}
                  onChange={(e) => setCatSeoDesc(e.target.value)}
                  className="form-input text-xs"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={catSaving}
            className="btn-primary w-full text-xs py-2.5 mt-2 font-semibold shadow-lg shadow-brand-500/20"
          >
            {catSaving ? 'Saving parameters...' : 'Save Placement Category'}
          </button>
        </form>
      </Modal>

      {/* Brand Editor Popup Modal */}
      <Modal
        isOpen={brandModalOpen}
        onClose={() => setBrandModalOpen(false)}
        title={editingBrand ? 'Edit Brand Details' : 'Register Brand'}
      >
        <form onSubmit={handleBrandSubmit} className="space-y-4">
          <div>
            <label className="form-label text-xs">Brand Name *</label>
            <input
              type="text"
              required
              placeholder="EX: Apple, Sony, Dell"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="form-input text-xs"
            />
          </div>

          <div>
            <label className="form-label text-xs">Description</label>
            <textarea
              rows={3}
              placeholder="Short brand description..."
              value={brandDesc}
              onChange={(e) => setBrandDesc(e.target.value)}
              className="form-input text-xs resize-none"
            />
          </div>

          <div>
            <label className="form-label text-xs">Brand Logo Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setBrandLogoFile(e.target.files[0])}
              className="form-input text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={brandSaving}
            className="btn-primary w-full text-xs py-2.5 mt-2 font-semibold shadow-lg shadow-brand-500/20"
          >
            {brandSaving ? 'Saving brand...' : 'Save Brand details'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default CategoryList;
