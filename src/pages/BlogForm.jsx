import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Image as ImageIcon } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline'],
    ['link'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['clean']
  ]
};

const BlogForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    image: '',
    imageAltTag: '',
    status: 'draft',
    author: 'Tobeque Admin',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    seoSchema: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      fetchBlog();
    }
  }, [id]);

  const fetchBlog = async () => {
    try {
      const res = await api.get(`/api/blogs/${id}`);
      setFormData(res.data.data);
    } catch (err) {
      showNotification('Failed to fetch article details', 'error');
      navigate('/style-journal');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Auto-generate slug from title if not in edit mode (or if slug is empty)
      ...(name === 'title' && (!isEditMode || !prev.slug) 
          ? { slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') } 
          : {})
    }));
  };

  const handleContentChange = (value) => {
    setFormData(prev => ({
      ...prev,
      content: value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('image', file);

    setUploadingImage(true);
    try {
      const res = await api.post('/api/blogs/upload-image', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setFormData(prev => ({ ...prev, image: res.data.data.url }));
      showNotification('Image uploaded successfully', 'success');
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to upload image', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const plainTextContent = formData.content ? formData.content.replace(/<[^>]*>/g, '').trim() : '';
    if (!plainTextContent && !formData.content?.includes('<img')) {
      showNotification('Please enter article content', 'warning');
      return;
    }

    setLoading(true);
    
    try {
      if (isEditMode) {
        await api.put(`/api/blogs/${id}`, formData);
        showNotification('Article updated successfully', 'success');
      } else {
        await api.post('/api/blogs', formData);
        showNotification('Article created successfully', 'success');
      }
      navigate('/style-journal');
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to save article', 'error');
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
        <div className="flex items-center gap-4">
          <Link to="/style-journal" className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              {isEditMode ? 'Edit Article' : 'Write New Article'}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {isEditMode ? 'Update your journal post' : 'Publish a new story to your Style Journal'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 space-y-5">
            <div>
              <label className="form-label">Article Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g. Top 10 Summer Trends for 2026"
                className="form-input text-lg font-medium"
              />
            </div>
            
            <div>
              <label className="form-label">Article Content *</label>
              <ReactQuill
                theme="snow"
                value={formData.content}
                onChange={handleContentChange}
                placeholder="Write your article content here..."
                modules={quillModules}
              />
            </div>
          </div>

          
          {/* SEO Card */}
          <div className="glass-card p-6 space-y-5">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">Search Engine Optimization</h3>
            <div>
              <label className="form-label">SEO Title</label>
              <input
                type="text"
                name="seoTitle"
                value={formData.seoTitle}
                onChange={handleChange}
                placeholder={formData.title || "Meta title for search engines"}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">SEO Description</label>
              <textarea
                name="seoDescription"
                value={formData.seoDescription || ''}
                onChange={handleChange}
                rows="3"
                placeholder="Meta description for search engines"
                className="form-input"
              ></textarea>
            </div>

            <div>
              <label className="form-label text-xs">Meta Keywords</label>
              <input
                type="text"
                name="seoKeywords"
                placeholder="e.g. style guide, summer fashion, outfit ideas"
                value={formData.seoKeywords || ''}
                onChange={handleChange}
                className="form-input text-xs"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Comma separated list of search keywords.</span>
            </div>

            <div>
              <label className="form-label text-xs">Schema Markup (JSON-LD Structured Data)</label>
              <textarea
                name="seoSchema"
                rows={4}
                placeholder='{"@context": "https://schema.org/", "@type": "BlogPosting", "headline": "..."}'
                value={formData.seoSchema || ''}
                onChange={handleChange}
                className="form-input text-xs font-mono resize-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Custom JSON-LD script content inserted directly into HTML &lt;head&gt;.</span>
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          <div className="glass-card p-6 space-y-5">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">Publishing</h3>
            
            <div>
              <label className="form-label">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="form-input"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div>
              <label className="form-label">Author</label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">URL Slug *</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                required
                className="form-input font-mono text-sm"
              />
              <p className="text-[10px] text-slate-400 mt-1">Unique URL identifier (auto-generated from title)</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Save className="w-4.5 h-4.5" />
                  {isEditMode ? 'Update Article' : 'Publish Article'}
                </>
              )}
            </button>
          </div>

          <div className="glass-card p-6 space-y-5">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800">Media & Excerpt</h3>
            
            <div>
              <label className="form-label">Cover Image</label>
              <div className="flex flex-col gap-2 mb-4">
                <div className="relative border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center p-4 h-12 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer overflow-hidden group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
                  />
                  {uploadingImage ? (
                    <div className="flex items-center justify-center text-sm text-slate-500 font-medium">
                      <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                      Uploading...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center text-sm text-slate-600 dark:text-slate-300 font-medium group-hover:text-brand-600 transition-colors">
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Click to upload from your computer
                    </div>
                  )}
                </div>
                <div className="text-center text-xs text-slate-400 font-semibold uppercase tracking-widest my-1">OR</div>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="Paste an external image URL here"
                  className="form-input"
                />
              </div>

              {formData.image ? (
                <img src={formData.image} alt={formData.imageAltTag || "Cover preview"} className="w-full h-40 object-cover rounded-xl border border-slate-200 dark:border-slate-700" />
              ) : (
                <div className="w-full h-40 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400">
                  <ImageIcon className="w-8 h-8 mb-2" />
                  <span className="text-xs">No cover image</span>
                </div>
              )}
            </div>

            <div>
              <label className="form-label text-xs">Image Alt Tag (SEO)</label>
              <input
                type="text"
                name="imageAltTag"
                value={formData.imageAltTag || ''}
                onChange={handleChange}
                placeholder="Descriptive alt text for cover image (e.g. Summer Fashion Trends 2026)"
                className="form-input text-xs"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Improves accessibility and search engine image indexation.</span>
            </div>

            <div>
              <label className="form-label">Short Excerpt</label>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                rows="4"
                placeholder="A brief summary of the article..."
                className="form-input"
              ></textarea>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BlogForm;
