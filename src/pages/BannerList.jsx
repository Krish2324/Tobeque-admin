import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Image, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import Table from '../components/Table';
import Modal from '../components/Modal';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

const BannerList = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Live Carousel Preview index
  const [previewIdx, setPreviewIdx] = useState(0);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [position, setPosition] = useState('home_slider');
  const [sortOrder, setSortOrder] = useState('0');
  const [status, setStatus] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const { showNotification } = useNotification();
  const { admin } = useAuth();

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/banners');
      if (res.data.success) {
        setBanners(res.data.banners);
      }
    } catch (err) {
      console.error('Error fetching marketing banners:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Automatic Carousel Preview rotation timer
  useEffect(() => {
    if (banners.length === 0) return;
    const timer = setInterval(() => {
      setPreviewIdx((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners]);

  const openModal = (banner = null) => {
    if (banner) {
      setEditingBanner(banner);
      setTitle(banner.title || '');
      setSubtitle(banner.subtitle || '');
      setLinkUrl(banner.linkUrl || '');
      setPosition(banner.position);
      setSortOrder(banner.sortOrder);
      setStatus(banner.status);
    } else {
      setEditingBanner(null);
      setTitle('');
      setSubtitle('');
      setLinkUrl('');
      setPosition('home_slider');
      setSortOrder('0');
      setStatus(true);
    }
    setImageFile(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('subtitle', subtitle);
      formData.append('linkUrl', linkUrl);
      formData.append('position', position);
      formData.append('sortOrder', sortOrder);
      formData.append('status', status);

      if (imageFile) {
        formData.append('image', imageFile);
      } else if (!editingBanner) {
        showNotification('Please select a slide image file.', 'warning');
        setSaving(false);
        return;
      }

      let res;
      if (editingBanner) {
        res = await axios.put(`/api/banners/${editingBanner.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        res = await axios.post('/api/banners', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (res.data.success) {
        showNotification(`Promo banner successfully saved!`, 'success');
        setModalOpen(false);
        fetchBanners();
      }
    } catch (err) {
      showNotification('Failed to upload banner.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, titleStr) => {
    if (!window.confirm(`Are you absolutely sure you want to delete banner "${titleStr || 'Untitled'}"?`)) return;

    try {
      const res = await axios.delete(`/api/banners/${id}`);
      if (res.data.success) {
        showNotification('Promo banner deleted successfully.', 'success');
        fetchBanners();
      }
    } catch (err) {
      showNotification('Failed to delete banner.', 'error');
    }
  };

  const columns = [
    {
      header: 'Slide Preview',
      cell: (row) => {
        const rawUrl = row.imageUrl ? row.imageUrl.replace(/\\/g, '/') : '';
        const mediaUrl = rawUrl.startsWith('http') ? rawUrl : `/${rawUrl.replace(/^\/+/, '')}`;
        const isVideo = mediaUrl.match(/\.(mp4|webm|ogg|mov|m4v)(?:[?#].*)?$/i) || mediaUrl.includes('/video/upload/');
        
        return isVideo ? (
          <video
            src={mediaUrl}
            className="w-20 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-800"
            muted playsInline
          />
        ) : (
          <img
            src={mediaUrl}
            alt={row.title || 'Banner Slide'}
            className="w-20 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-800"
          />
        );
      }
    },
    {
      header: 'Headline Info',
      accessor: 'title',
      cell: (row) => (
        <div className="flex flex-col text-xs">
          <span className="font-bold text-slate-805 dark:text-white">{row.title || 'Untitled Banner'}</span>
          <span className="text-[10px] text-slate-400 font-semibold">{row.subtitle || 'No sub-header'}</span>
        </div>
      )
    },
    {
      header: 'Slot Position',
      accessor: 'position',
      cell: (row) => (
        <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-650 bg-indigo-500/10 px-2.5 py-1 rounded-lg">
          {row.position}
        </span>
      )
    },
    {
      header: 'Sort Order',
      accessor: 'sortOrder',
      cell: (row) => <span className="font-semibold text-slate-600 dark:text-slate-400">Rank: #{row.sortOrder}</span>
    },
    {
      header: 'Visibility',
      accessor: 'status',
      cell: (row) => (
        <span className={`px-2 py-0.5 rounded-lg text-[10px] uppercase font-bold tracking-wider ${
          row.status 
            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-450' 
            : 'bg-slate-100 text-slate-450 dark:bg-slate-800 dark:text-slate-500'
        }`}>
          {row.status ? 'Published' : 'Hidden'}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'id',
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => openModal(row)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300"
          >
            <Edit className="w-4 h-4" />
          </button>
          {['superadmin', 'manager'].includes(admin?.role) && (
            <button
              onClick={() => handleDelete(row.id, row.title)}
              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/20 dark:hover:bg-rose-950/30 dark:text-rose-450"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">Promo Banners</h1>
          <p className="text-xs text-slate-450 dark:text-slate-400 font-medium">Design storefront marketing slides and manage homepage banner carousels</p>
        </div>
        <button
          onClick={() => openModal()}
          className="btn-primary py-2.5 px-4 rounded-xl text-sm font-semibold shadow-lg shadow-brand-500/20"
        >
          <Plus className="w-4.5 h-4.5" />
          Add Slide
        </button>
      </div>

      {/* Dynamic Swiper Carousel Preview Panel */}
      {banners.length > 0 && (
        <div className="glass-card p-6 flex flex-col gap-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Storefront Carousel Mockup Simulator</h3>
          <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800">
            {/* Slide */}
            <AnimatePresence mode="wait">
              <motion.div
                key={previewIdx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 w-full h-full flex flex-col justify-end p-8 md:p-12 text-white overflow-hidden"
                style={{ 
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundImage: (() => {
                    const rawUrl = banners[previewIdx].imageUrl ? banners[previewIdx].imageUrl.replace(/\\/g, '/') : '';
                    const mediaUrl = rawUrl.startsWith('http') ? rawUrl : `/${rawUrl.replace(/^\/+/, '')}`;
                    const isVideo = mediaUrl.match(/\.(mp4|webm|ogg|mov|m4v)(?:[?#].*)?$/i) || mediaUrl.includes('/video/upload/');
                    return isVideo 
                      ? 'linear-gradient(to top, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.3))' 
                      : `linear-gradient(to top, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.3)), url(${mediaUrl})`;
                  })()
                }}
              >
                {(() => {
                  const rawUrl = banners[previewIdx].imageUrl ? banners[previewIdx].imageUrl.replace(/\\/g, '/') : '';
                  const mediaUrl = rawUrl.startsWith('http') ? rawUrl : `/${rawUrl.replace(/^\/+/, '')}`;
                  const isVideo = mediaUrl.match(/\.(mp4|webm|ogg|mov|m4v)(?:[?#].*)?$/i) || mediaUrl.includes('/video/upload/');
                  return isVideo ? (
                    <video 
                      src={mediaUrl} 
                      muted playsInline 
                      className="absolute inset-0 w-full h-full object-cover -z-10" 
                    />
                  ) : null;
                })()}
                <div className="max-w-md space-y-1 md:space-y-2">
                  <span className="text-[10px] bg-brand-600 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider self-start">
                    {banners[previewIdx].position}
                  </span>
                  <h2 className="text-xl md:text-3xl font-extrabold tracking-tight leading-none text-white">
                    {banners[previewIdx].title || 'Special Collections'}
                  </h2>
                  <p className="text-xs md:text-sm text-slate-200">
                    {banners[previewIdx].subtitle || 'Explore luxury selections up to 50% discount.'}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Slider triggers */}
            <button
              onClick={() => setPreviewIdx((prev) => (prev === 0 ? banners.length - 1 : prev - 1))}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/60 backdrop-blur-md text-white hover:bg-slate-800 transition-colors z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setPreviewIdx((prev) => (prev + 1) % banners.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/60 backdrop-blur-md text-white hover:bg-slate-800 transition-colors z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="glass-card p-6">
        <Table
          columns={columns}
          data={banners}
          loading={loading}
          exportFileName="storefront-marketing-banners"
        />
      </div>

      {/* Editor Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingBanner ? 'Edit Promo Banner' : 'Create Promo Banner Slide'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label text-xs">Slide Title / Headline</label>
            <input
              type="text"
              placeholder="EX: Winter Clearance sale, New Arrivals"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input text-xs"
            />
          </div>

          <div>
            <label className="form-label text-xs">Slide Subtitle / Description</label>
            <input
              type="text"
              placeholder="EX: Save up to 50% on all tech accessories"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="form-input text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label text-xs">Placement Slot</label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="form-input text-xs h-[38px] py-1 bg-slate-50 dark:bg-slate-800"
              >
                <option value="home_slider">Home Main Carousel Slider</option>
                <option value="promo_top">Top Promotional slot</option>
                <option value="promo_bottom">Bottom Grid banner</option>
                <option value="mobile_app">Mobile screens popups</option>
              </select>
            </div>
            <div>
              <label className="form-label text-xs">Link Destination URL</label>
              <input
                type="text"
                placeholder="EX: /collections/winter-sale"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="form-input text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label text-xs">Rank Sort Order</label>
              <input
                type="number"
                placeholder="0, 1, 2"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="form-input text-xs"
              />
            </div>
            <div>
              <label className="form-label text-xs">Upload Slide Image/Video file</label>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="form-input text-xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 py-1.5">
            <input
              type="checkbox"
              id="bannerStatus"
              checked={status}
              onChange={(e) => setStatus(e.target.checked)}
              className="w-4 h-4 text-brand-600 border-slate-300 rounded"
            />
            <label htmlFor="bannerStatus" className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Banner is Published immediately
            </label>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary w-full text-xs py-2.5 mt-2 font-semibold shadow-lg shadow-brand-500/20"
          >
            {saving ? 'Uploading slides...' : 'Save Promo Slide'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default BannerList;
