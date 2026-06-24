import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Image, Sparkles, Settings, Layers, Truck, MessageSquare } from 'lucide-react';
import axios from 'axios';
import { useNotification } from '../context/NotificationContext';
import RichTextEditor from '../components/RichTextEditor';

const isVideo = (url) => url && typeof url === 'string' && url.match(/\.(mp4|webm|ogg|mov)$/i);

const ProductForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  // Categories & Brands Dropdowns
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // Product Fields
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [taxRate, setTaxRate] = useState('0');
  const [stockQuantity, setStockQuantity] = useState('0');
  const [weight, setWeight] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [status, setStatus] = useState('draft');
  const [isFeatured, setIsFeatured] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');

  // File Upload State
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryColors, setGalleryColors] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  // SEO Fields
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  // Settings Tab Navigation State
  const [activeSettingsTab, setActiveSettingsTab] = useState('general');

  // Advanced WooCommerce specifications fields
  const [countdownEvergreen, setCountdownEvergreen] = useState(false);
  const [restartCountdownAfter, setRestartCountdownAfter] = useState('');
  const [countdownTimerProfile, setCountdownTimerProfile] = useState('Minimog Box');
  const [enableProgressBar, setEnableProgressBar] = useState(false);
  const [whenAchievingGoal, setWhenAchievingGoal] = useState('Back to regular price');
  const [goal, setGoal] = useState('');
  const [initialQuantity, setInitialQuantity] = useState('');
  const [taxStatus, setTaxStatus] = useState('Taxable');
  const [taxClass, setTaxClass] = useState('Standard');
  const [hsnSacCode, setHsnSacCode] = useState('');
  const [whatsAppNumber, setWhatsAppNumber] = useState('');
  const [callToAction, setCallToAction] = useState('WhatsApp us');
  const [preFilledMessage, setPreFilledMessage] = useState('');
  const [displaySettings, setDisplaySettings] = useState('Default');

  // Dynamic Options/Variants State (e.g. Size: [M, L], Color: [Red, Blue])
  const [variantsList, setVariantsList] = useState([]); // [{ size: 'M', color: 'Black', stock: 10, price: 99.00, sku: 'TSH-M-BLK' }]
  const [optionsList, setOptionsList] = useState([]); // [{ name: "Color", values: ["Red", "Blue"] }]
  const [variantOptName, setVariantOptName] = useState('');
  const [variantOptVals, setVariantOptVals] = useState('');

  // Fetch options lists
  const fetchDropdowns = async () => {
    try {
      const [catRes, brandRes] = await Promise.all([
        axios.get('/api/categories'),
        axios.get('/api/categories/brands/all')
      ]);
      if (catRes.data.success) setCategories(catRes.data.categories);
      if (brandRes.data.success) setBrands(brandRes.data.brands);
    } catch (err) {
      console.error('Error loading dropdown lists:', err);
    }
  };

  // Load existing product if Edit mode
  const fetchProduct = async () => {
    try {
      const res = await axios.get(`/api/products/${id}`);
      if (res.data.success) {
        const prod = res.data.product;
        setName(prod.name);
        setSku(prod.sku);
        setBarcode(prod.barcode || '');
        setShortDescription(prod.shortDescription || '');
        setFullDescription(prod.fullDescription || '');
        setPrice(prod.price);
        setDiscountPrice(prod.discountPrice || '');
        setTaxRate(prod.taxRate);
        setStockQuantity(prod.stockQuantity);
        setWeight(prod.weight || '');
        setDimensions(prod.dimensions || '');
        setStatus(prod.status);
        setIsFeatured(prod.isFeatured);
        setCategoryId(prod.categoryId || '');
        setBrandId(prod.brandId || '');
        setThumbnailPreview(prod.thumbnail || '');
        setExistingImages(prod.images || []);
        setSeoTitle(prod.seoTitle || '');
        setSeoDescription(prod.seoDescription || '');

        setCountdownEvergreen(prod.countdownEvergreen || false);
        setRestartCountdownAfter(prod.restartCountdownAfter || '');
        setCountdownTimerProfile(prod.countdownTimerProfile || 'Minimog Box');
        setEnableProgressBar(prod.enableProgressBar || false);
        setWhenAchievingGoal(prod.whenAchievingGoal || 'Back to regular price');
        setGoal(prod.goal || '');
        setInitialQuantity(prod.initialQuantity || '');
        setTaxStatus(prod.taxStatus || 'Taxable');
        setTaxClass(prod.taxClass || 'Standard');
        setHsnSacCode(prod.hsnSacCode || '');
        setWhatsAppNumber(prod.whatsAppNumber || '');
        setCallToAction(prod.callToAction || 'WhatsApp us');
        setPreFilledMessage(prod.preFilledMessage || '');
        setDisplaySettings(prod.displaySettings || 'Default');

        if (prod.variants && Array.isArray(prod.variants) && prod.variants.length > 0) {
          setVariantsList(prod.variants);

          // Re-build options list from variants keys
          const firstCombo = prod.variants[0];
          const keys = Object.keys(firstCombo).filter(k => !['sku', 'price', 'stock', 'id', 'productId'].includes(k));
          const rebuiltOptions = keys.map(k => {
            // Get unique values for this key across all variants
            const uniqueVals = [...new Set(prod.variants.map(v => v[k]).filter(Boolean))];
            return {
              name: k.charAt(0).toUpperCase() + k.slice(1),
              values: uniqueVals
            };
          });
          setOptionsList(rebuiltOptions);
        }
      }
    } catch (err) {
      console.error('Error fetching product record:', err);
      showNotification('Failed to load product details.', 'error');
      navigate('/products');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchDropdowns();
    if (isEdit) fetchProduct();
  }, [id]);

  // Handle local thumbnail preview
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveExistingImage = async (imageId) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    try {
      const res = await axios.delete(`/api/products/${id}/images/${imageId}`);
      if (res.data.success) {
        setExistingImages(existingImages.filter(img => img.id !== imageId));
        showNotification('Image deleted successfully.', 'success');
      }
    } catch (err) {
      console.error('Error deleting image:', err);
      showNotification('Failed to delete image.', 'error');
    }
  };

  const handleRemoveGalleryFile = (indexToRemove) => {
    setGalleryFiles(galleryFiles.filter((_, idx) => idx !== indexToRemove));
    setGalleryColors(galleryColors.filter((_, idx) => idx !== indexToRemove));
  };

  // Helper to generate Cartesian product of variants options
  const generateCombinations = (options) => {
    if (options.length === 0) return [];

    let results = [{}];
    for (let i = 0; i < options.length; i++) {
      const opt = options[i];
      const key = opt.name.toLowerCase();
      const newResults = [];

      for (let r = 0; r < results.length; r++) {
        const current = results[r];
        for (let v = 0; v < opt.values.length; v++) {
          const val = opt.values[v];
          newResults.push({
            ...current,
            [key]: val
          });
        }
      }
      results = newResults;
    }
    return results;
  };

  // Add Variant option parameter
  const handleAddOption = () => {
    if (!variantOptName || !variantOptVals) {
      showNotification('Please specify both option name and comma separated values.', 'warning');
      return;
    }
    const optionNameTrimmed = variantOptName.trim();
    const vals = variantOptVals.split(',').map(v => v.trim()).filter(v => v.length > 0);

    if (optionsList.some(o => o.name.toLowerCase() === optionNameTrimmed.toLowerCase())) {
      showNotification('This option name already exists.', 'warning');
      return;
    }

    const newOptions = [...optionsList, { name: optionNameTrimmed, values: vals }];
    setOptionsList(newOptions);
    setVariantOptName('');
    setVariantOptVals('');

    // Regenerate combinations
    const combos = generateCombinations(newOptions);
    const newVariants = combos.map((combo) => {
      const suffix = Object.values(combo).map(val => val.toString().toUpperCase().substring(0, 3)).join('-');
      return {
        ...combo,
        sku: sku ? `${sku}-${suffix}` : `SKU-${suffix}`,
        price: price ? parseFloat(price) : 0.00,
        stock: 0
      };
    });
    setVariantsList(newVariants);
  };

  const handleRemoveOption = (idx) => {
    const newOptions = optionsList.filter((_, i) => i !== idx);
    setOptionsList(newOptions);

    const combos = generateCombinations(newOptions);
    const newVariants = combos.map((combo) => {
      const suffix = Object.values(combo).map(val => val.toString().toUpperCase().substring(0, 3)).join('-');
      return {
        ...combo,
        sku: sku ? `${sku}-${suffix}` : `SKU-${suffix}`,
        price: price ? parseFloat(price) : 0.00,
        stock: 0
      };
    });
    setVariantsList(newVariants);
  };

  // Submit Handler using Multi-part Form Data
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !sku || !price) {
      showNotification('Please enter name, SKU and base price.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('sku', sku);
      formData.append('barcode', barcode);
      formData.append('shortDescription', shortDescription);
      formData.append('fullDescription', fullDescription);
      formData.append('price', price);
      formData.append('discountPrice', discountPrice);
      formData.append('taxRate', taxRate);
      formData.append('stockQuantity', stockQuantity);
      formData.append('weight', weight);
      formData.append('dimensions', dimensions);
      formData.append('status', status);
      formData.append('isFeatured', isFeatured);
      formData.append('categoryId', categoryId);
      formData.append('brandId', brandId);
      formData.append('seoTitle', seoTitle);
      formData.append('seoDescription', seoDescription);
      formData.append('countdownEvergreen', countdownEvergreen);
      formData.append('restartCountdownAfter', restartCountdownAfter);
      formData.append('countdownTimerProfile', countdownTimerProfile);
      formData.append('enableProgressBar', enableProgressBar);
      formData.append('whenAchievingGoal', whenAchievingGoal);
      formData.append('goal', goal);
      formData.append('initialQuantity', initialQuantity);
      formData.append('taxStatus', taxStatus);
      formData.append('taxClass', taxClass);
      formData.append('hsnSacCode', hsnSacCode);
      formData.append('whatsAppNumber', whatsAppNumber);
      formData.append('callToAction', callToAction);
      formData.append('preFilledMessage', preFilledMessage);
      formData.append('displaySettings', displaySettings);
      formData.append('variants', JSON.stringify(variantsList));

      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }

      for (let i = 0; i < galleryFiles.length; i++) {
        formData.append('images', galleryFiles[i]);
        formData.append('imageColors', galleryColors[i] || '');
      }

      let res;
      if (isEdit) {
        res = await axios.put(`/api/products/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        res = await axios.post('/api/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      if (res.data.success) {
        showNotification(`Product successfully ${isEdit ? 'updated' : 'cataloged'}!`, 'success');
        navigate('/products');
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to save product.';
      showNotification(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold text-slate-400">Fetching product details...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex items-center gap-4">
        <Link
          to="/products"
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-350 transition-colors"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">
            {isEdit ? `Edit Product: ${name}` : 'Create New Product'}
          </h1>
          <p className="text-xs text-slate-450 dark:text-slate-400 font-medium">Define metadata, visual previews, SEO features, and catalog tags</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Double Columns */}
        <div className="lg:col-span-2 space-y-6">

          {/* General Information Card */}
          <div className="glass-card p-6 space-y-5">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-850">
              General Specifications
            </h3>

            <div>
              <label className="form-label">Product Name *</label>
              <input
                type="text"
                required
                placeholder="Example: Over Sized T-shirt"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">SKU ID *</label>
                <input
                  type="text"
                  required
                  placeholder="EX: MOUSE-WRLS-01"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Barcode (UPC/EAN)</label>
                <input
                  type="text"
                  placeholder="EX: 123456789012"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            <div>
              <label className="form-label">Short Summary Description</label>
              <input
                type="text"
                placeholder="A brief 1-sentence sales pitch"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Full HTML Product Description Details</label>
              <RichTextEditor
                value={fullDescription}
                onChange={setFullDescription}
                placeholder="Include detailed specifications, dimensions, materials, or visual features..."
              />
            </div>
          </div>

          {/* WooCommerce style Product Data tabbed layout */}
          <div className="glass-card overflow-hidden">
            {/* Header tab section */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-850 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Product Data —</span>
                <select className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-lg px-2.5 py-1 text-slate-700 dark:text-slate-200 focus:outline-none">
                  <option>Simple product</option>
                </select>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <label className="flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-350 cursor-pointer">
                  <input type="checkbox" className="rounded text-brand-600 focus:ring-brand-500 w-3.5 h-3.5" />
                  <span>Virtual</span>
                </label>
                <label className="flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-350 cursor-pointer">
                  <input type="checkbox" className="rounded text-brand-600 focus:ring-brand-500 w-3.5 h-3.5" />
                  <span>Downloadable</span>
                </label>
              </div>
            </div>

            {/* Sidebar + Content layout */}
            <div className="grid grid-cols-1 md:grid-cols-4 min-h-[360px]">
              {/* Sidebar Menu */}
              <div className="md:col-span-1 bg-slate-50/50 dark:bg-slate-855/20 border-r border-slate-100 dark:border-slate-850 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible">
                <button
                  type="button"
                  onClick={() => setActiveSettingsTab('general')}
                  className={`flex items-center gap-2.5 px-4.5 py-3.5 text-xs font-bold tracking-wide border-b md:border-b-0 md:border-l-2 transition-all w-full text-left whitespace-nowrap ${activeSettingsTab === 'general'
                      ? 'border-brand-600 bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400'
                      : 'border-transparent text-slate-550 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/20'
                    }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>General</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSettingsTab('inventory')}
                  className={`flex items-center gap-2.5 px-4.5 py-3.5 text-xs font-bold tracking-wide border-b md:border-b-0 md:border-l-2 transition-all w-full text-left whitespace-nowrap ${activeSettingsTab === 'inventory'
                      ? 'border-brand-600 bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400'
                      : 'border-transparent text-slate-550 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/20'
                    }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>Inventory</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSettingsTab('shipping')}
                  className={`flex items-center gap-2.5 px-4.5 py-3.5 text-xs font-bold tracking-wide border-b md:border-b-0 md:border-l-2 transition-all w-full text-left whitespace-nowrap ${activeSettingsTab === 'shipping'
                      ? 'border-brand-600 bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400'
                      : 'border-transparent text-slate-550 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/20'
                    }`}
                >
                  <Truck className="w-4 h-4" />
                  <span>Shipping</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSettingsTab('chat')}
                  className={`flex items-center gap-2.5 px-4.5 py-3.5 text-xs font-bold tracking-wide border-b md:border-b-0 md:border-l-2 transition-all w-full text-left whitespace-nowrap ${activeSettingsTab === 'chat'
                      ? 'border-brand-600 bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400'
                      : 'border-transparent text-slate-550 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/20'
                    }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Click to Chat</span>
                </button>
              </div>

              {/* Content Main Area */}
              <div className="md:col-span-3 p-6">

                {/* General Settings Tab Content */}
                {activeSettingsTab === 'general' && (
                  <div className="space-y-5">
                    {/* Prices */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="form-label text-xs">Regular price (₹) *</label>
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          placeholder="99.99"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          className="form-input text-xs"
                        />
                      </div>
                      <div>
                        <label className="form-label text-xs">Sale price (₹)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="79.99"
                          value={discountPrice}
                          onChange={(e) => setDiscountPrice(e.target.value)}
                          className="form-input text-xs"
                        />
                      </div>
                    </div>

                    {/* Tax Settings */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 dark:border-slate-850 pt-4">
                      <div>
                        <label className="form-label text-xs">Tax status</label>
                        <select
                          value={taxStatus}
                          onChange={(e) => setTaxStatus(e.target.value)}
                          className="form-input text-xs h-[38px] py-1 bg-slate-50 dark:bg-slate-800"
                        >
                          <option value="Taxable">Taxable</option>
                          <option value="Shipping only">Shipping only</option>
                          <option value="None">None</option>
                        </select>
                      </div>
                      <div>
                        <label className="form-label text-xs">Tax class</label>
                        <select
                          value={taxClass}
                          onChange={(e) => setTaxClass(e.target.value)}
                          className="form-input text-xs h-[38px] py-1 bg-slate-50 dark:bg-slate-800"
                        >
                          <option value="Standard">Standard</option>
                          <option value="Reduced rate">Reduced rate</option>
                          <option value="Zero rate">Zero rate</option>
                        </select>
                      </div>
                      <div>
                        <label className="form-label text-xs">HSN/SAC Code</label>
                        <input
                          type="text"
                          placeholder="GST HSN Code"
                          value={hsnSacCode}
                          onChange={(e) => setHsnSacCode(e.target.value)}
                          className="form-input text-xs"
                        />
                        <span className="text-[9px] text-slate-450 dark:text-slate-500 mt-1 block">Mandatory for GST.</span>
                      </div>
                    </div>

                    {/* Countdown Settings */}
                    <div className="border-t border-slate-100 dark:border-slate-850 pt-4 space-y-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="countdownEvergreen"
                          checked={countdownEvergreen}
                          onChange={(e) => setCountdownEvergreen(e.target.checked)}
                          className="w-4 h-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500"
                        />
                        <label htmlFor="countdownEvergreen" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          Countdown evergreen
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="form-label text-xs">Restart countdown after</label>
                          <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                            <input
                              type="number"
                              placeholder="e.g. 5"
                              value={restartCountdownAfter}
                              onChange={(e) => setRestartCountdownAfter(e.target.value)}
                              className="form-input border-0 rounded-none text-xs flex-1"
                            />
                            <span className="bg-slate-150 dark:bg-slate-800 text-slate-600 dark:text-slate-350 px-3 py-1.5 text-xs font-bold flex items-center border-l border-slate-200 dark:border-slate-700">
                              Days
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="form-label text-xs">Countdown timer profile</label>
                          <select
                            value={countdownTimerProfile}
                            onChange={(e) => setCountdownTimerProfile(e.target.value)}
                            className="form-input text-xs h-[38px] py-1 bg-slate-50 dark:bg-slate-800"
                          >
                            <option value="Minimog Box">Minimog Box</option>
                            <option value="Minimalist">Minimalist</option>
                            <option value="Modern Bold">Modern Bold</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar Campaign Goal */}
                    <div className="border-t border-slate-100 dark:border-slate-850 pt-4 space-y-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="enableProgressBar"
                          checked={enableProgressBar}
                          onChange={(e) => setEnableProgressBar(e.target.checked)}
                          className="w-4 h-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500"
                        />
                        <label htmlFor="enableProgressBar" className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          Enable progress bar
                        </label>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="form-label text-xs">When achieving the goal</label>
                          <select
                            value={whenAchievingGoal}
                            onChange={(e) => setWhenAchievingGoal(e.target.value)}
                            className="form-input text-xs h-[38px] py-1 bg-slate-50 dark:bg-slate-800"
                          >
                            <option value="Back to regular price">Back to regular price</option>
                            <option value="Do nothing">Do nothing</option>
                            <option value="Hide timer">Hide timer</option>
                          </select>
                        </div>

                        <div>
                          <label className="form-label text-xs">Goal</label>
                          <input
                            type="number"
                            placeholder="e.g. 100"
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            className="form-input text-xs"
                          />
                        </div>

                        <div>
                          <label className="form-label text-xs">Initial quantity</label>
                          <input
                            type="number"
                            placeholder="e.g. 200"
                            value={initialQuantity}
                            onChange={(e) => setInitialQuantity(e.target.value)}
                            className="form-input text-xs"
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {/* Inventory Tab Content */}
                {activeSettingsTab === 'inventory' && (
                  <div className="space-y-5">
                    <div>
                      <label className="form-label text-xs">Stock Units count *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        placeholder="100"
                        value={stockQuantity}
                        onChange={(e) => setStockQuantity(e.target.value)}
                        className="form-input text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-850 pt-4">
                      <div>
                        <label className="form-label text-xs">SKU ID *</label>
                        <input
                          type="text"
                          required
                          placeholder="EX: MOUSE-WRLS-01"
                          value={sku}
                          onChange={(e) => setSku(e.target.value)}
                          className="form-input text-xs"
                        />
                      </div>
                      <div>
                        <label className="form-label text-xs">Barcode (UPC/EAN)</label>
                        <input
                          type="text"
                          placeholder="EX: 123456789012"
                          value={barcode}
                          onChange={(e) => setBarcode(e.target.value)}
                          className="form-input text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Shipping Tab Content */}
                {activeSettingsTab === 'shipping' && (
                  <div className="space-y-5">
                    <div>
                      <label className="form-label text-xs">Weight (kg)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.25"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        className="form-input text-xs"
                      />
                    </div>
                    <div>
                      <label className="form-label text-xs">Dimensions (LxWxH cm)</label>
                      <input
                        type="text"
                        placeholder="EX: 12x6x4"
                        value={dimensions}
                        onChange={(e) => setDimensions(e.target.value)}
                        className="form-input text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* Click to Chat Tab Content */}
                {activeSettingsTab === 'chat' && (
                  <div className="space-y-5">
                    <div className="text-xs font-bold text-slate-850 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-850">
                      Chat Settings
                    </div>

                    <div>
                      <label className="form-label text-xs">WhatsApp Number</label>
                      <input
                        type="text"
                        placeholder="EX: +918447000200"
                        value={whatsAppNumber}
                        onChange={(e) => setWhatsAppNumber(e.target.value)}
                        className="form-input text-xs"
                      />
                      <span className="text-[9px] text-slate-450 dark:text-slate-500 mt-1 block">Include country code (e.g. +91)</span>
                    </div>

                    <div>
                      <label className="form-label text-xs">Call to Action</label>
                      <input
                        type="text"
                        placeholder="EX: WhatsApp us"
                        value={callToAction}
                        onChange={(e) => setCallToAction(e.target.value)}
                        className="form-input text-xs"
                      />
                    </div>

                    <div>
                      <label className="form-label text-xs">Pre-filled Message</label>
                      <textarea
                        rows={3}
                        placeholder="EX: Hello, I would like to know more about this product..."
                        value={preFilledMessage}
                        onChange={(e) => setPreFilledMessage(e.target.value)}
                        className="form-input text-xs resize-none"
                      />
                    </div>

                    <div className="pt-2">
                      <label className="form-label text-xs block mb-2">Display Settings</label>
                      <div className="flex gap-4">
                        {['Show', 'Hide', 'Default'].map((opt) => (
                          <label key={opt} className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer">
                            <input
                              type="radio"
                              name="displaySettings"
                              value={opt}
                              checked={displaySettings === opt}
                              onChange={(e) => setDisplaySettings(e.target.value)}
                              className="text-brand-600 focus:ring-brand-500 w-3.5 h-3.5"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* dynamic Options Variants selector */}
          <div className="glass-card p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-850">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Product Variants Selector</h3>
              <span className="text-[10px] bg-brand-500/10 text-brand-600 px-2 py-0.5 rounded-lg font-bold uppercase tracking-wider">Dynamic Option Attributes</span>
            </div>

            {/* Existing custom options list */}
            {optionsList.length > 0 && (
              <div className="space-y-3 p-3.5 bg-slate-50 dark:bg-dark-850/40 rounded-2xl border border-slate-150 dark:border-slate-800">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Variant Options</div>
                {optionsList.map((opt, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-850 dark:text-white uppercase tracking-wider">{opt.name}:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {opt.values.map((val, vIdx) => (
                          <span key={vIdx} className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 shadow-sm border border-slate-200/50 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-200">
                            {val}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      className="p-1 rounded bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Inputs form */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div className="sm:col-span-1">
                <label className="form-label text-xs">Option Name (e.g. Size, Color)</label>
                <input
                  type="text"
                  placeholder="EX: Size"
                  value={variantOptName}
                  onChange={(e) => setVariantOptName(e.target.value)}
                  className="form-input text-xs"
                />
              </div>
              <div className="sm:col-span-1">
                <label className="form-label text-xs">Values (Comma Separated)</label>
                <input
                  type="text"
                  placeholder="EX: S, M, L"
                  value={variantOptVals}
                  onChange={(e) => setVariantOptVals(e.target.value)}
                  className="form-input text-xs"
                />
              </div>
              <button
                type="button"
                onClick={handleAddOption}
                className="btn-secondary text-xs h-[38px] flex items-center justify-center gap-1.5 py-1 px-4 border border-slate-200 dark:border-slate-850"
              >
                <Plus className="w-4 h-4" />
                Add Parameter Option
              </button>
            </div>

            {/* Generated Variations List */}
            {variantsList.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-850">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Configure Price & Stock per Variation</div>
                <div className="overflow-x-auto border border-slate-200/60 dark:border-slate-800 rounded-xl">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-dark-850/50 border-b border-slate-200/60 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                        <th className="p-3">Variation</th>
                        <th className="p-3">Variant SKU</th>
                        <th className="p-3">Price (₹)</th>
                        <th className="p-3">Stock Quantity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850/50">
                      {variantsList.map((variant, idx) => {
                        const label = Object.entries(variant)
                          .filter(([k]) => !['sku', 'price', 'stock', 'id', 'productId'].includes(k))
                          .map(([k, v]) => `${k.toUpperCase()}: ${v}`)
                          .join(' | ');

                        return (
                          <tr key={idx} className="hover:bg-slate-50/20 dark:hover:bg-slate-850/10">
                            <td className="p-3 font-semibold text-slate-700 dark:text-slate-200">
                              {label || "Default Variant"}
                            </td>
                            <td className="p-3">
                              <input
                                type="text"
                                value={variant.sku || ''}
                                onChange={(e) => {
                                  const updated = [...variantsList];
                                  updated[idx].sku = e.target.value;
                                  setVariantsList(updated);
                                }}
                                className="form-input text-xs py-1 px-2 max-w-[160px]"
                                placeholder="Variant SKU"
                              />
                            </td>
                            <td className="p-3">
                              <input
                                type="number"
                                step="0.01"
                                value={variant.price !== undefined ? variant.price : ''}
                                onChange={(e) => {
                                  const updated = [...variantsList];
                                  updated[idx].price = e.target.value === '' ? '' : parseFloat(e.target.value);
                                  setVariantsList(updated);
                                }}
                                className="form-input text-xs py-1 px-2 max-w-[100px]"
                                placeholder="Price"
                              />
                            </td>
                            <td className="p-3">
                              <input
                                type="number"
                                value={variant.stock !== undefined ? variant.stock : ''}
                                onChange={(e) => {
                                  const updated = [...variantsList];
                                  updated[idx].stock = e.target.value === '' ? '' : parseInt(e.target.value, 10);
                                  setVariantsList(updated);
                                }}
                                className="form-input text-xs py-1 px-2 max-w-[100px]"
                                placeholder="Stock"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar Column */}
        <div className="space-y-6">

          {/* Status & Catalog Placement */}
          <div className="glass-card p-6 space-y-5">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-850">
              Visibility & Catalog Placement
            </h3>

            <div>
              <label className="form-label">Catalog Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="form-input h-[38px] py-1 bg-slate-50 dark:bg-slate-800"
              >
                <option value="draft">Draft (Hidden)</option>
                <option value="published">Published (Visible)</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="form-label">Placement Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="form-input h-[38px] py-1 bg-slate-50 dark:bg-slate-800"
              >
                <option value="">Select placement category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Brand/Manufacturer</label>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="form-input h-[38px] py-1 bg-slate-50 dark:bg-slate-800"
              >
                <option value="">Select brand manufacturer</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 py-2">
              <input
                type="checkbox"
                id="featured"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500"
              />
              <label htmlFor="featured" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Mark as Featured Product
              </label>
            </div>
          </div>

          {/* Media Images upload */}
          <div className="glass-card p-6 space-y-5">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-850">
              Media Gallery Upload
            </h3>

            {/* Primary Thumbnail */}
            <div>
              <label className="form-label">Primary Thumbnail Image</label>
              <div className="flex items-center gap-4 mt-2">
                {thumbnailPreview ? (
                  <div className="relative">
                    {isVideo(thumbnailPreview) ? (
                      <video
                        src={thumbnailPreview}
                        className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-800"
                        autoPlay loop muted playsInline
                      />
                    ) : (
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail Preview"
                        className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-800"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => { setThumbnailFile(null); setThumbnailPreview(''); }}
                      className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-0.5 shadow-sm hover:bg-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400">
                    <Image className="w-6 h-6" />
                  </div>
                )}
                <label className="btn-secondary text-xs cursor-pointer py-2 px-3 border border-slate-200 dark:border-slate-700">
                  Choose Photo
                  <input
                    type="file"
                    accept="image/*,video/mp4,video/webm,video/ogg,video/quicktime"
                    onChange={handleThumbnailChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Multi Gallery Images */}
            <div>
              <label className="form-label">Gallery Slides Images</label>
              <input
                type="file"
                multiple
                accept="image/*,video/mp4,video/webm,video/ogg,video/quicktime"
                onChange={(e) => {
                  const files = [...e.target.files];
                  setGalleryFiles(prev => [...prev, ...files]);
                  setGalleryColors(prev => [...prev, ...files.map(() => '')]);
                }}
                className="form-input text-xs"
              />
              {galleryFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  <span className="text-[10px] text-slate-450 dark:text-slate-450 font-bold block">
                    {galleryFiles.length} file(s) selected for gallery uploads.
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {galleryFiles.map((file, idx) => (
                      <div key={idx} className="relative">
                        {isVideo(file.name) ? (
                          <video
                            src={URL.createObjectURL(file)}
                            className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-slate-850"
                            autoPlay loop muted playsInline
                          />
                        ) : (
                          <img
                            src={URL.createObjectURL(file)}
                            alt="New Gallery"
                            className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-slate-850"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryFile(idx)}
                          className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full p-0.5 shadow-sm hover:bg-rose-600 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <input
                          type="text"
                          placeholder="Color name"
                          value={galleryColors[idx] || ''}
                          onChange={(e) => {
                            const newCols = [...galleryColors];
                            newCols[idx] = e.target.value;
                            setGalleryColors(newCols);
                          }}
                          className="mt-1 form-input text-[9px] py-0.5 px-1 w-full text-center"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Edit mode existing pictures lists */}
              {isEdit && existingImages.length > 0 && (
                <div className="mt-4.5 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Existing Gallery:</span>
                  <div className="flex flex-wrap gap-2">
                    {existingImages.map((img) => (
                      <div key={img.id} className="relative">
                        {isVideo(img.imageUrl) ? (
                          <video
                            src={img.imageUrl}
                            className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-slate-850"
                            autoPlay loop muted playsInline
                          />
                        ) : (
                          <img
                            src={img.imageUrl}
                            alt="Gallery"
                            className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-slate-850"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingImage(img.id)}
                          className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full p-0.5 shadow-sm hover:bg-rose-600 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search Engine Optimization */}
          <div className="glass-card p-6 space-y-4.5">
            <div className="flex items-center gap-1.5 text-brand-650 dark:text-brand-400 pb-3 border-b border-slate-100 dark:border-slate-850">
              <Sparkles className="w-4 h-4" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">SEO configurations</h3>
            </div>

            <div>
              <label className="form-label text-xs">Meta title tag</label>
              <input
                type="text"
                placeholder="Google Search title headline"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className="form-input text-xs"
              />
            </div>

            <div>
              <label className="form-label text-xs">Meta description tag</label>
              <textarea
                rows={3}
                placeholder="Google search descriptive snippet"
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                className="form-input text-xs resize-none"
              />
            </div>
          </div>

          {/* Save Action Row */}
          <div className="flex items-center gap-3">
            <Link to="/products" className="btn-secondary w-1/3 text-xs py-3 border border-slate-200 dark:border-slate-800">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-2/3 text-xs py-3 font-semibold shadow-lg shadow-brand-500/20"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4.5 h-4.5" />
                  Save Changes
                </>
              )}
            </button>
          </div>

        </div>
      </form>
    </div>
  );
};

export default ProductForm;
