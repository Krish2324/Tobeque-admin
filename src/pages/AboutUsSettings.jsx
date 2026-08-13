import React, { useState, useEffect, useRef } from 'react';
import { Save, Upload, Plus, Trash2, Camera } from 'lucide-react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';

const AboutUsSettings = () => {
  const { showNotification } = useNotification();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [formData, setFormData] = useState({
    heroTitle: 'About Tobeque',
    heroSubtitle: 'We are passionate about fashion.',
    missionStatement: 'Our mission is to bring you the best styles.',
    visionStatement: 'To be the leading fashion destination for youth.',
    ourStoryTitle: 'Our Story',
    ourStoryText: 'Founded with a love for street style, Tobeque has grown into a community.',
    ourStoryText2: '',
    extraSections: [
      { title: 'Our Story Section 2', description: '' },
      { title: 'Our Story Section 3', description: '' }
    ],
    stats: [
      { label: 'Happy Customers', value: '10K+' },
      { label: 'Products', value: '500+' }
    ]
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchAboutUs();
  }, []);

  const fetchAboutUs = async () => {
    try {
      const res = await api.get('/api/about-us');
      if (res.data.data) {
        const data = res.data.data;
        const extraSectionsData = (data.extraSections && data.extraSections.length > 0)
          ? data.extraSections
          : [
              { title: 'Our Story Section 2', description: data.ourStoryText2 || '' },
              { title: 'Our Story Section 3', description: '' }
            ];

        setFormData({
          heroTitle: data.heroTitle || '',
          heroSubtitle: data.heroSubtitle || '',
          missionStatement: data.missionStatement || '',
          visionStatement: data.visionStatement || '',
          ourStoryTitle: data.ourStoryTitle || 'Our Story',
          ourStoryText: data.ourStoryText || '',
          ourStoryText2: data.ourStoryText2 || '',
          extraSections: extraSectionsData,
          stats: data.stats || []
        });
        if (data.missionImage) {
          setImagePreview(data.missionImage.startsWith('http') ? data.missionImage : `http://localhost:5000${data.missionImage}`);
        }
      }
    } catch (err) {
      showNotification('Failed to fetch About Us content', 'error');
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

  const handleStatChange = (index, field, value) => {
    const newStats = [...formData.stats];
    newStats[index][field] = value;
    setFormData(prev => ({ ...prev, stats: newStats }));
  };

  const addStat = () => {
    setFormData(prev => ({
      ...prev,
      stats: [...prev.stats, { label: '', value: '' }]
    }));
  };

  const removeStat = (index) => {
    const newStats = [...formData.stats];
    newStats.splice(index, 1);
    setFormData(prev => ({ ...prev, stats: newStats }));
  };

  const handleExtraSectionChange = (index, field, value) => {
    const newSections = [...formData.extraSections];
    newSections[index][field] = value;
    setFormData(prev => ({ ...prev, extraSections: newSections }));
  };

  const addExtraSection = () => {
    setFormData(prev => ({
      ...prev,
      extraSections: [...prev.extraSections, { title: '', description: '' }]
    }));
  };

  const removeExtraSection = (index) => {
    const newSections = [...formData.extraSections];
    newSections.splice(index, 1);
    setFormData(prev => ({ ...prev, extraSections: newSections }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
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
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('heroTitle', formData.heroTitle);
      data.append('heroSubtitle', formData.heroSubtitle);
      data.append('missionStatement', formData.missionStatement);
      data.append('visionStatement', formData.visionStatement);
      data.append('ourStoryTitle', formData.ourStoryTitle || 'Our Story');
      data.append('ourStoryText', formData.ourStoryText);
      data.append('ourStoryText2', formData.ourStoryText2 || '');
      data.append('extraSections', JSON.stringify(formData.extraSections));
      data.append('stats', JSON.stringify(formData.stats));

      if (imageFile) {
        data.append('missionImage', imageFile);
      }

      await api.put('/api/about-us', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showNotification('About Us updated successfully', 'success');
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to update About Us', 'error');
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
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">About Us Content</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage the content specifically for your structured About Us page layout.
          </p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-primary py-2.5 px-6 flex items-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <Save className="w-4.5 h-4.5" />
              Save Changes
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Hero Section</h3>
            <div className="space-y-4">
              <div>
                <label className="form-label">Hero Title</label>
                <input
                  type="text"
                  name="heroTitle"
                  value={formData.heroTitle}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Hero Subtitle</label>
                <input
                  type="text"
                  name="heroSubtitle"
                  value={formData.heroSubtitle}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Mission & Vision</h3>
            <div className="space-y-4">
              <div>
                <label className="form-label">Mission Statement</label>
                <textarea
                  name="missionStatement"
                  value={formData.missionStatement}
                  onChange={handleChange}
                  rows={3}
                  className="form-input resize-y"
                />
              </div>
              <div>
                <label className="form-label">Vision Statement</label>
                <textarea
                  name="visionStatement"
                  value={formData.visionStatement}
                  onChange={handleChange}
                  rows={3}
                  className="form-input resize-y"
                />
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Our Story Section 1</h3>
            <div className="space-y-4">
              <div>
                <label className="form-label">Section Title</label>
                <input
                  type="text"
                  name="ourStoryTitle"
                  value={formData.ourStoryTitle}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g. Our Story"
                />
              </div>
              <div>
                <label className="form-label">Our Story Content</label>
                <textarea
                  name="ourStoryText"
                  value={formData.ourStoryText}
                  onChange={handleChange}
                  rows={6}
                  className="form-input resize-y"
                  placeholder="Enter Our Story content..."
                />
              </div>
            </div>
          </div>

          {formData.extraSections.map((sec, index) => (
            <div key={index} className="glass-card p-6">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                {sec.title ? sec.title : `Our Story Section ${index + 2}`}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="form-label">Section Title</label>
                  <input
                    type="text"
                    placeholder={`e.g. Our Story Section ${index + 2}`}
                    value={sec.title}
                    onChange={(e) => handleExtraSectionChange(index, 'title', e.target.value)}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Section Content</label>
                  <textarea
                    rows={6}
                    placeholder="Enter content for this section..."
                    value={sec.description}
                    onChange={(e) => handleExtraSectionChange(index, 'description', e.target.value)}
                    className="form-input resize-y"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Mission Image</h3>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
            {imagePreview ? (
              <div className="relative aspect-[4/3] w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-primary text-sm py-1.5 px-4">
                    Change
                  </button>
                  <button type="button" onClick={removeImage} className="bg-red-500 text-white text-sm py-1.5 px-4 rounded-lg font-medium">
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="aspect-[4/3] w-full border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <Camera className="w-8 h-8 text-slate-400 mb-2" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Upload Image</p>
              </div>
            )}
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Stats</h3>
              <button type="button" onClick={addStat} className="text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 p-1.5 rounded-lg transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {formData.stats.map((stat, index) => (
                <div key={index} className="flex gap-2 items-start relative group p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      placeholder="Label (e.g. Happy Customers)"
                      value={stat.label}
                      onChange={(e) => handleStatChange(index, 'label', e.target.value)}
                      className="form-input py-1.5 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Value (e.g. 10K+)"
                      value={stat.value}
                      onChange={(e) => handleStatChange(index, 'value', e.target.value)}
                      className="form-input py-1.5 text-sm font-semibold"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeStat(index)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {formData.stats.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">No stats added yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUsSettings;
