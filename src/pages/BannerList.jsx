import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Image, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';
import Table from '../components/Table';
import Modal from '../components/Modal';
import DeleteModal from '../components/DeleteModal';
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
  const [bannerLink, setBannerLink] = useState('');
  const [position, setPosition] = useState('home_slider');
  const [sortOrder, setSortOrder] = useState('0');
  const [status, setStatus] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [mobileImageFile, setMobileImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [backgroundUpload, setBackgroundUpload] = useState({ active: false, progress: 0, title: '' });
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, title: '' });

  const { showNotification } = useNotification();
  const { admin } = useAuth();

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/banners');
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
      setBannerLink(banner.bannerLink || '');
      setPosition(banner.position);
      setSortOrder(banner.sortOrder);
      setStatus(banner.status);
    } else {
      setEditingBanner(null);
      setTitle('');
      setSubtitle('');
      setLinkUrl('');
      setBannerLink('');
      setPosition('home_slider');
      setSortOrder('0');
      setStatus(true);
    }
    setImageFile(null);
    setMobileImageFile(null);
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
      formData.append('bannerLink', bannerLink);
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

      if (mobileImageFile) {
        formData.append('mobileImage', mobileImageFile);
      }

      const token = localStorage.getItem('admin_token');
      const bannerTitle = title || 'Promo Banner';

      // Immediately close modal and show info notification
      setModalOpen(false);
      showNotification(`Uploading "${bannerTitle}" in the background...`, 'info');
      setBackgroundUpload({ active: true, progress: 0, title: bannerTitle });

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        timeout: 300000, // 5 minutes timeout for video processing
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setBackgroundUpload({
              active: true,
              progress: percent,
              title: bannerTitle
            });
          }
        }
      };

      let res;
      if (editingBanner) {
        const bannerId = editingBanner.id || editingBanner._id;
        res = await api.put(`/api/banners/${bannerId}`, formData, config);
      } else {
        res = await api.post('/api/banners', formData, config);
      }

      if (res.data.success) {
        showNotification(`"${bannerTitle}" successfully uploaded!`, 'success');
        fetchBanners();
      }
    } catch (err) {
      showNotification('Failed to upload banner.', 'error');
    } finally {
      setSaving(false);
      setBackgroundUpload({ active: false, progress: 0, title: '' });
    }
  };

  const handleDelete = async (id, titleStr) => {
    try {
      const res = await api.delete(`/api/banners/${id}`);
      if (res.data.success) {
        showNotification(`Banner "${titleStr}" deleted successfully.`, 'success');
        fetchBanners();
      }
    } catch (err) {
      showNotification('Failed to delete banner.', 'error');
    } finally {
      setDeleteModal({ open: false, id: null, title: '' });
    }
  };

  const handleRemoveMedia = async (type) => {
    if (!editingBanner) return;
    const bannerId = editingBanner.id || editingBanner._id;
    if (!window.confirm(`Are you sure you want to delete the ${type} media? This will permanently delete it from Cloudinary.`)) return;

    try {
      const formData = new FormData();
      if (type === 'desktop') {
        formData.append('removeImage', 'true');
      } else {
        formData.append('removeMobileImage', 'true');
      }

      const token = localStorage.getItem('admin_token');
      const res = await api.put(`/api/banners/${bannerId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });

      if (res.data.success) {
        showNotification(`${type === 'desktop' ? 'Desktop' : 'Mobile'} media removed from Cloudinary!`, 'success');
        setEditingBanner((prev) => ({
          ...prev,
          [type === 'desktop' ? 'imageUrl' : 'mobileImageUrl']: ''
        }));
        fetchBanners();
      }
    } catch (err) {
      showNotification('Failed to remove media file.', 'error');
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
      header: 'Destination Link',
      accessor: 'bannerLink',
      cell: (row) => {
        const link = row.bannerLink || row.linkUrl;
        return link ? (
          <span className="text-xs font-mono font-medium text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-lg max-w-[200px] truncate block">
            {link}
          </span>
        ) : (
          <span className="text-xs text-slate-400 font-semibold italic">No link</span>
        );
      }
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
        <span className={`px-2 py-0.5 rounded-lg text-[10px] uppercase font-bold tracking-wider ${row.status
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
              onClick={() => setDeleteModal({ open: true, id: row.id, title: row.title })}
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
                <option value="promo_bottom">Home Bottom Banner</option>
                <option value="mobile_app">Mobile screens popups</option>
                <option value="collection_hero">Collection Page Hero</option>
              </select>
            </div>
            <div>
              <label className="form-label text-xs font-bold text-brand-600 dark:text-brand-400">Button Link (Shop Now URL)</label>
              <input
                type="text"
                placeholder="EX: /collection or /products?category=western-wear"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="form-input text-xs"
              />
            </div>
          </div>

          <div>
            <label className="form-label text-xs font-bold text-indigo-600 dark:text-indigo-400">Banner Link (Clickable Banner URL)</label>
            <input
              type="text"
              placeholder="EX: /collection or /products?category=party-wear"
              value={bannerLink}
              onChange={(e) => setBannerLink(e.target.value)}
              className="form-input text-xs"
            />
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
              <label className="form-label text-xs">Desktop Image/Video file</label>
              {editingBanner && editingBanner.imageUrl && (
                <div className="mb-2 text-[10px] text-slate-500 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  File uploaded
                  <a href={editingBanner.imageUrl.startsWith('http') ? editingBanner.imageUrl : `/${editingBanner.imageUrl.replace(/^\/+/, '')}`} target="_blank" rel="noreferrer" className="text-brand-600 underline">View</a>
                  <button
                    type="button"
                    onClick={() => handleRemoveMedia('desktop')}
                    className="text-red-500 hover:text-red-700 underline font-semibold ml-2"
                  >
                    Delete
                  </button>
                </div>
              )}
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="form-input text-xs"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label text-xs font-bold text-teal-600 dark:text-teal-400">Mobile Image/Video (Optional)</label>
              {editingBanner && editingBanner.mobileImageUrl && (
                <div className="mb-2 text-[10px] text-slate-500 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  File uploaded
                  <a href={editingBanner.mobileImageUrl.startsWith('http') ? editingBanner.mobileImageUrl : `/${editingBanner.mobileImageUrl.replace(/^\/+/, '')}`} target="_blank" rel="noreferrer" className="text-teal-600 underline">View</a>
                  <button
                    type="button"
                    onClick={() => handleRemoveMedia('mobile')}
                    className="text-red-500 hover:text-red-700 underline font-semibold ml-2"
                  >
                    Delete
                  </button>
                </div>
              )}
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => setMobileImageFile(e.target.files[0])}
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

      <DeleteModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null, title: '' })}
        onConfirm={() => handleDelete(deleteModal.id, deleteModal.title)}
        title="Delete Banner"
        message={`Are you sure you want to delete "${deleteModal.title || 'this banner'}"? This action cannot be undone.`}
      />
      {/* Floating Background Upload Progress Widget */}
      {backgroundUpload.active && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-4 rounded-xl shadow-2xl border border-slate-700 w-80 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <svg className="animate-spin h-4 w-4 text-teal-400 shrink-0" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <span className="text-xs font-semibold truncate max-w-[170px]">
                Uploading: {backgroundUpload.title}
              </span>
            </div>
            <span className="text-xs font-bold text-teal-400">{backgroundUpload.progress}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-teal-400 h-2 rounded-full transition-all duration-200 ease-out"
              style={{ width: `${backgroundUpload.progress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerList;
