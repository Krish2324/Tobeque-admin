import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Upload, X } from 'lucide-react';
import axios from 'axios';
import { useNotification } from '../context/NotificationContext';

const CommunityStyleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const fileInputRef = useRef(null);
  
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    altText: '',
    tag: '@tobeque',
    productLink: '/collection',
    status: 'Active'
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);

  useEffect(() => {
    if (isEditMode) {
      fetchStyle();
    }
  }, [id]);

  const fetchStyle = async () => {
    try {
      const res = await axios.get(`/api/community-styles/${id}`);
      const data = res.data.data;
      setFormData({
        altText: data.altText,
        tag: data.tag,
        productLink: data.productLink,
        status: data.status
      });
      setImagePreview(data.image.startsWith('http') ? data.image : `http://localhost:5000${data.image}`);
    } catch (err) {
      showNotification('Failed to fetch style details', 'error');
      navigate('/community-styles');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        showNotification('Image size should be less than 5MB', 'error');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEditMode && !imageFile && !imagePreview) {
      showNotification('Please upload an image', 'error');
      return;
    }

    setLoading(true);
    
    try {
      const data = new FormData();
      data.append('altText', formData.altText);
      data.append('tag', formData.tag);
      data.append('productLink', formData.productLink);
      data.append('status', formData.status);
      if (imageFile) {
        data.append('image', imageFile);
      } else if (isEditMode && !imageFile) {
        // We handle logic differently on backend if no file is sent, or send a flag
      }

      const headers = { 'Content-Type': 'multipart/form-data' };

      if (isEditMode) {
        await axios.put(`/api/community-styles/${id}`, data, { headers });
        showNotification('Style updated successfully', 'success');
      } else {
        await axios.post('/api/community-styles', data, { headers });
        showNotification('Style added successfully', 'success');
      }
      navigate('/community-styles');
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to save style', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to="/community-styles" className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              {isEditMode ? 'Edit Style' : 'Add New Style'}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Upload images for the Steal The Style page.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass-card p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Image Upload Area */}
            <div>
              <label className="form-label block mb-2">Style Image *</label>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
              
              {imagePreview ? (
                <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-primary mr-2"
                    >
                      Change
                    </button>
                    {!isEditMode && (
                      <button
                        type="button"
                        onClick={removeImage}
                        className="btn-secondary text-red-500"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-[3/4] w-full border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <Upload className="w-8 h-8 text-slate-400 mb-2" />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Click to upload image</p>
                  <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 5MB</p>
                  <p className="text-xs text-slate-500 mt-1">Recommended ratio: 3:4</p>
                </div>
              )}
            </div>
            
            {/* Form Fields */}
            <div className="space-y-5">
              <div>
                <label className="form-label">Alt Text / Description *</label>
                <input
                  type="text"
                  name="altText"
                  value={formData.altText}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Casual summer outfit with denim jacket"
                  className="form-input"
                />
                <p className="text-xs text-slate-500 mt-1">Important for accessibility and SEO.</p>
              </div>

              <div>
                <label className="form-label">Tag</label>
                <input
                  type="text"
                  name="tag"
                  value={formData.tag}
                  onChange={handleChange}
                  placeholder="@tobeque"
                  className="form-input"
                />
                <p className="text-xs text-slate-500 mt-1">Instagram handle of the user (e.g., @tobeque).</p>
              </div>

              <div>
                <label className="form-label">Product Link</label>
                <input
                  type="text"
                  name="productLink"
                  value={formData.productLink}
                  onChange={handleChange}
                  placeholder="/collection"
                  className="form-input"
                />
                <p className="text-xs text-slate-500 mt-1">Where should "Shop the Look" button go?</p>
              </div>

              <div>
                <label className="form-label">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link to="/community-styles" className="btn-secondary py-3 px-6">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary py-3 px-8 flex items-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Save className="w-4.5 h-4.5" />
                {isEditMode ? 'Update Style' : 'Save Style'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommunityStyleForm;
