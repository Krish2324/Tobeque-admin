import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, Layers, Search, X, CheckCircle2, Eye, EyeOff, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';
import Modal from '../components/Modal';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

const SeasonCollection = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Category Search State (for Add modal)
  const [allCategories, setAllCategories] = useState([]);
  const [categorySearch, setCategorySearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Form state
  const [displayLabel, setDisplayLabel] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [imageOverride, setImageOverride] = useState('');

  // Modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);

  const { showNotification } = useNotification();
  const { admin } = useAuth();

  // ── Fetch current collection and all categories ───────────────────────────
  const fetchCollection = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/season-collection/admin');
      if (res.data.success) {
        setItems(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch season collection:', err);
      showNotification('Failed to load Season Collection.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/categories/public');
      if (res.data.success) {
        setAllCategories(res.data.categories || []);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  useEffect(() => {
    fetchCollection();
    fetchCategories();
  }, []);

  // ── Category Search ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!categorySearch.trim()) {
      setSearchResults([]);
      return;
    }
    const lowerSearch = categorySearch.toLowerCase();
    const filtered = allCategories.filter(cat =>
      cat.name?.toLowerCase().includes(lowerSearch)
    );
    setSearchResults(filtered.slice(0, 10)); // limit to 10 results
  }, [categorySearch, allCategories]);

  // ── Add Item ─────────────────────────────────────────────────────────────
  const openAddModal = () => {
    setSelectedCategory(null);
    setCategorySearch('');
    setSearchResults([]);
    setDisplayLabel('');
    setSortOrder(String(items.length));
    setIsActive(true);
    setImageOverride('');
    setAddModalOpen(true);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!selectedCategory) {
      showNotification('Please select a category first.', 'warning');
      return;
    }
    setSaving(true);
    try {
      const res = await axios.post('/api/season-collection', {
        categoryId: selectedCategory.id || selectedCategory._id,
        displayLabel: displayLabel || selectedCategory.name,
        sortOrder: parseInt(sortOrder) || 0,
        isActive,
        imageOverride: imageOverride.trim() || null
      });
      if (res.data.success) {
        showNotification('Category added to Season Collection!', 'success');
        setAddModalOpen(false);
        fetchCollection();
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to add to Season Collection.';
      showNotification(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Edit Item ─────────────────────────────────────────────────────────────
  const openEditModal = (item) => {
    setEditingItem(item);
    setDisplayLabel(item.displayLabel || '');
    setSortOrder(String(item.sortOrder));
    setIsActive(item.isActive);
    setImageOverride(item.imageOverride || '');
    setEditModalOpen(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    setSaving(true);
    try {
      const res = await axios.put(`/api/season-collection/${editingItem.id}`, {
        displayLabel,
        sortOrder: parseInt(sortOrder) || 0,
        isActive,
        imageOverride: imageOverride.trim() || null
      });
      if (res.data.success) {
        showNotification('Season Collection item updated!', 'success');
        setEditModalOpen(false);
        fetchCollection();
      }
    } catch (err) {
      showNotification('Failed to update item.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete Item ───────────────────────────────────────────────────────────
  const handleDelete = async (id, label) => {
    if (!window.confirm(`Remove "${label}" from the Season Collection?`)) return;
    try {
      const res = await axios.delete(`/api/season-collection/${id}`);
      if (res.data.success) {
        showNotification('Item removed from Season Collection.', 'success');
        fetchCollection();
      }
    } catch {
      showNotification('Failed to remove item.', 'error');
    }
  };

  // ── Toggle Active ─────────────────────────────────────────────────────────
  const handleToggleActive = async (item) => {
    try {
      await axios.put(`/api/season-collection/${item.id}`, { isActive: !item.isActive });
      fetchCollection();
    } catch {
      showNotification('Failed to toggle visibility.', 'error');
    }
  };

  const getImageUrl = (item) => {
    if (item.imageOverride) return item.imageOverride;
    if (item.category?.image) return item.category.image;
    if (item.category?.banner) return item.category.banner;
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-brand-500" />
            Season Collection
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-400 font-medium mt-0.5">
            Manage which Categories appear in the homepage Season Collection section
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="btn-primary py-2.5 px-4 rounded-xl text-sm font-semibold shadow-lg shadow-brand-500/20 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Live Preview Grid */}
      {!loading && items.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            Live Homepage Carousel Preview
          </h3>
          <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
            {items.map((item, idx) => {
              const imgUrl = getImageUrl(item);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`flex-shrink-0 w-40 group relative rounded-xl overflow-hidden border-2 ${item.isActive
                      ? 'border-brand-500/40'
                      : 'border-slate-200 dark:border-slate-700 opacity-50'
                    }`}
                >
                  <div className="aspect-[3/4] bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                    {imgUrl ? (
                      <img
                        src={imgUrl}
                        alt={item.displayLabel || item.category?.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Layers className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                      </div>
                    )}
                    {!item.isActive && (
                      <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                        <span className="text-[9px] font-bold text-white uppercase bg-slate-700 px-2 py-0.5 rounded-full">Hidden</span>
                      </div>
                    )}
                    <div className="absolute top-1.5 left-1.5 bg-brand-600/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                      #{item.sortOrder}
                    </div>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-900">
                    <p className="text-[10px] font-bold text-slate-700 dark:text-white truncate text-center">
                      {item.displayLabel || item.category?.name || 'Untitled'}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Items Table */}
      <div className="glass-card p-6">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
          Collection Categories ({items.length})
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3">
            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-slate-400">Loading collection...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <Layers className="w-12 h-12 text-slate-300 dark:text-slate-600" />
            <p className="font-semibold text-slate-500 dark:text-slate-400">No categories added</p>
            <p className="text-xs text-slate-400 max-w-xs">
              Click "Add Category" to pick categories from your catalog and display them in the Season Collection section on the homepage.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="text-left pb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 w-16">Order</th>
                  <th className="text-left pb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Category</th>
                  <th className="text-left pb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Display Label</th>
                  <th className="text-left pb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</th>
                  <th className="text-right pb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {items.map((item) => {
                  const imgUrl = getImageUrl(item);
                  return (
                    <tr key={item.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="py-3 pr-4">
                        <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                          #{item.sortOrder}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-12 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                            {imgUrl ? (
                              <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Layers className="w-4 h-4 text-slate-300" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-700 dark:text-white">
                              {item.category?.name || 'Deleted Category'}
                            </p>
                            <p className="text-[10px] text-slate-400">ID: {item.categoryId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                          {item.displayLabel || <span className="text-slate-400 italic">uses category name</span>}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <button
                          onClick={() => handleToggleActive(item)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${item.isActive
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
                            }`}
                        >
                          {item.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          {item.isActive ? 'Visible' : 'Hidden'}
                        </button>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors"
                            title="Edit label / order"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {['superadmin', 'manager'].includes(admin?.role) && (
                            <button
                              onClick={() => handleDelete(item.id, item.displayLabel || item.category?.name)}
                              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/20 dark:hover:bg-rose-950/30 dark:text-rose-400 transition-colors"
                              title="Remove from collection"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Add Item Modal ─────────────────────────────────────────────────── */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Category to Season Collection"
      >
        <form onSubmit={handleAdd} className="space-y-5">
          {/* Category Search */}
          <div>
            <label className="form-label text-xs">Search & Select Category</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Type category name to search..."
                value={categorySearch}
                onChange={(e) => { setCategorySearch(e.target.value); setSelectedCategory(null); }}
                className="form-input text-xs pl-9"
                autoComplete="off"
              />
            </div>

            {/* Search Results Dropdown */}
            <AnimatePresence>
              {searchResults.length > 0 && !selectedCategory && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="mt-1 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-xl max-h-56 overflow-y-auto custom-scrollbar"
                >
                  {searchResults.map((category) => (
                    <button
                      key={category.id || category._id}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(category);
                        setCategorySearch(category.name);
                        setSearchResults([]);
                        if (!displayLabel) setDisplayLabel(category.name);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                    >
                      <div className="w-8 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                        {category.image || category.banner ? (
                          <img src={category.image || category.banner} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Layers className="w-3 h-3 text-slate-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-700 dark:text-white truncate">{category.name}</p>
                        <p className="text-[10px] text-slate-400">Slug: {category.slug}</p>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Selected Category Confirmation */}
            {selectedCategory && (
              <div className="mt-2 flex items-center gap-2.5 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 truncate">
                  Selected: {selectedCategory.name}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory(null);
                    setCategorySearch('');
                  }}
                  className="ml-auto text-emerald-500 hover:text-emerald-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Display Label */}
          <div>
            <label className="form-label text-xs">Display Label (shown under the image)</label>
            <input
              type="text"
              placeholder="e.g. Summer Picks, Party Dresses..."
              value={displayLabel}
              onChange={(e) => setDisplayLabel(e.target.value)}
              className="form-input text-xs"
            />
            <p className="text-[10px] text-slate-400 mt-1">Leave blank to use the category name</p>
          </div>

          {/* Image Override */}
          <div>
            <label className="form-label text-xs flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-brand-500" />
              Image URL Override <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="/uploads/categories/custom.jpg"
              value={imageOverride}
              onChange={(e) => setImageOverride(e.target.value)}
              className="form-input text-xs"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Provide an image URL if you want to use a different image than the category's default image.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Sort Order */}
            <div>
              <label className="form-label text-xs">Display Order</label>
              <input
                type="number"
                min="0"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="form-input text-xs"
              />
            </div>
            {/* Active toggle */}
            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer pb-1">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded border-slate-300"
                />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Show on website</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving || !selectedCategory}
            className="btn-primary w-full text-xs py-2.5 font-semibold shadow-lg shadow-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Adding...' : 'Add to Season Collection'}
          </button>
        </form>
      </Modal>

      {/* ── Edit Item Modal ────────────────────────────────────────────────── */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Season Collection Item"
      >
        <form onSubmit={handleEdit} className="space-y-4">
          {editingItem && (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="w-8 h-10 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700 flex-shrink-0">
                {getImageUrl(editingItem) ? (
                  <img src={getImageUrl(editingItem)} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Layers className="w-4 h-4 text-slate-400 m-auto mt-3" />
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-700 dark:text-white">{editingItem.category?.name}</p>
                <p className="text-[10px] text-slate-400">Category ID: {editingItem.categoryId}</p>
              </div>
            </div>
          )}

          <div>
            <label className="form-label text-xs">Display Label</label>
            <input
              type="text"
              placeholder="e.g. Summer Picks..."
              value={displayLabel}
              onChange={(e) => setDisplayLabel(e.target.value)}
              className="form-input text-xs"
            />
          </div>

          <div>
            <label className="form-label text-xs flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-brand-500" />
              Image URL Override <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="/uploads/categories/custom.jpg"
              value={imageOverride}
              onChange={(e) => setImageOverride(e.target.value)}
              className="form-input text-xs"
            />
            <p className="text-[10px] text-slate-400 mt-1">Leave blank to use the category image</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label text-xs">Display Order</label>
              <input
                type="number"
                min="0"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="form-input text-xs"
              />
            </div>
            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer pb-1">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-brand-600 rounded border-slate-300"
                />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Show on website</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary w-full text-xs py-2.5 font-semibold shadow-lg shadow-brand-500/20"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default SeasonCollection;
