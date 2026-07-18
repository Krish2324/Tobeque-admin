import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, GripVertical, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';
import DeleteModal from '../components/DeleteModal';

const EMPTY_FORM = { question: '', answer: '', order: 0, isActive: true };

function FAQModal({ faq, onClose, onSave }) {
  const [form, setForm] = useState(faq || EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const { showNotification } = useNotification();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.question.trim() || !form.answer.trim()) {
      showNotification('Question and answer are required', 'error');
      return;
    }
    setSaving(true);
    try {
      if (faq?._id) {
        await api.put(`/api/faqs/${faq._id}`, form);
        showNotification('FAQ updated successfully', 'success');
      } else {
        await api.post('/api/faqs', form);
        showNotification('FAQ created successfully', 'success');
      }
      onSave();
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to save FAQ', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-[580px] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-800 dark:text-white">
            {faq?._id ? 'Edit FAQ' : 'Add New FAQ'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
            <span className="text-xl">✕</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="form-label text-xs">Question *</label>
            <input
              type="text"
              name="question"
              required
              value={form.question}
              onChange={handleChange}
              className="form-input text-xs"
              placeholder="e.g. What is your return policy?"
            />
          </div>

          <div>
            <label className="form-label text-xs">Answer *</label>
            <textarea
              name="answer"
              required
              value={form.answer}
              onChange={handleChange}
              rows={5}
              className="form-input text-xs resize-y"
              placeholder="Provide a clear, helpful answer..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label text-xs">Display Order</label>
              <input
                type="number"
                name="order"
                value={form.order}
                onChange={handleChange}
                min="0"
                className="form-input text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="0"
              />
              <p className="text-[10px] text-slate-400 mt-1">Lower number = shown first</p>
            </div>

            <div className="flex flex-col justify-center">
              <label className="form-label text-xs mb-3">Status</label>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={form.isActive}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div
                    onClick={() => setForm(prev => ({ ...prev, isActive: !prev.isActive }))}
                    className={`w-10 h-5 rounded-full transition-colors cursor-pointer ${form.isActive ? 'bg-brand-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm absolute top-0.5 transition-transform ${form.isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                </div>
                <span className={`text-xs font-semibold ${form.isActive ? 'text-green-600 dark:text-green-400' : 'text-slate-400'}`}>
                  {form.isActive ? 'Active — Visible on website' : 'Inactive — Hidden from website'}
                </span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                faq?._id ? 'Update FAQ' : 'Create FAQ'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function FAQList() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalFaq, setModalFaq] = useState(null); // null = closed, {} = new, {faq} = edit
  const [modalOpen, setModalOpen] = useState(false);
  const { showNotification } = useNotification();
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });

  const fetchFAQs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/faqs/all');
      setFaqs(data.faqs || []);
    } catch {
      showNotification('Failed to load FAQs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFAQs(); }, []);

  const openAdd = () => { setModalFaq(null); setModalOpen(true); };
  const openEdit = (faq) => { setModalFaq(faq); setModalOpen(true); };
  const closeModal = () => setModalOpen(false);
  const handleSave = () => { closeModal(); fetchFAQs(); };

  const handleToggleActive = async (faq) => {
    try {
      await api.put(`/api/faqs/${faq._id}`, { isActive: !faq.isActive });
      showNotification(`FAQ ${!faq.isActive ? 'activated' : 'deactivated'}`, 'success');
      fetchFAQs();
    } catch {
      showNotification('Failed to update FAQ status', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/faqs/${id}`);
      showNotification('FAQ deleted', 'success');
      fetchFAQs();
    } catch {
      showNotification('Failed to delete FAQ', 'error');
    } finally {
      setDeleteModal({ open: false, id: null });
    }
  };

  const activeCount = faqs.filter(f => f.isActive).length;

  return (
    <div className="w-full space-y-6">
      {/* Modal */}
      {modalOpen && (
        <FAQModal
          faq={modalFaq}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-sm font-headline-sm text-primary mb-1">FAQs</h1>
          <p className="text-body-md text-on-surface-variant">
            Manage frequently asked questions shown on the website ({activeCount} active)
          </p>
        </div>
        <button
          onClick={openAdd}
          className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold"
        >
          <Plus className="w-4 h-4" />
          Add FAQ
        </button>
      </div>

      {/* FAQ List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-card p-5 animate-pulse">
              <div className="h-4 bg-slate-100 dark:bg-slate-700 rounded w-2/3 mb-2" />
              <div className="h-3 bg-slate-50 dark:bg-slate-800 rounded w-full" />
            </div>
          ))}
        </div>
      ) : faqs.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="w-16 h-16 bg-brand-50 dark:bg-brand-950/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❓</span>
          </div>
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">No FAQs yet</h3>
          <p className="text-xs text-slate-400 mb-6">Add your first FAQ to display it on the website</p>
          <button onClick={openAdd} className="btn-primary px-5 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add First FAQ
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={faq._id}
              className={`glass-card p-5 flex items-start gap-4 transition-all ${!faq.isActive ? 'opacity-60' : ''}`}
            >
              {/* Order badge */}
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0 mt-0.5">
                {faq.order || index + 1}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
                    {faq.question}
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    faq.isActive
                      ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400'
                      : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                  }`}>
                    {faq.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                  {faq.answer}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleToggleActive(faq)}
                  className={`p-2 rounded-xl transition-colors ${
                    faq.isActive
                      ? 'bg-green-50 hover:bg-green-100 text-green-600 dark:bg-green-950/20 dark:hover:bg-green-950/30 dark:text-green-400'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-400 dark:bg-slate-800 dark:hover:bg-slate-700'
                  }`}
                  title={faq.isActive ? 'Deactivate (hide from website)' : 'Activate (show on website)'}
                >
                  {faq.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => openEdit(faq)}
                  className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-950/20 dark:hover:bg-blue-950/30 dark:text-blue-400 transition-colors"
                  title="Edit FAQ"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteModal({ open: true, id: faq._id })}
                  className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/20 dark:hover:bg-rose-950/30 dark:text-rose-450 transition-colors"
                  title="Delete FAQ"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <DeleteModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={() => handleDelete(deleteModal.id)}
        title="Delete FAQ"
        message="Are you sure you want to delete this FAQ? It will be removed from the website immediately."
      />
    </div>
  );
}
