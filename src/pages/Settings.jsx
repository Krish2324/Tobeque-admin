import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Mail, CreditCard, Shield, Save, Plus, X, Truck, Info } from 'lucide-react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Settings State
  const [storeName, setStoreName] = useState('');
  const [storeEmail, setStoreEmail] = useState('');
  const [storeCurrency, setStoreCurrency] = useState('INR');
  const [shippingReturnsText, setShippingReturnsText] = useState('');
  const [deliveryEstimateMin, setDeliveryEstimateMin] = useState('3');
  const [deliveryEstimateMax, setDeliveryEstimateMax] = useState('5');
  const [gstBrackets, setGstBrackets] = useState('0, 5, 12, 18, 28');
  const [newGstBracket, setNewGstBracket] = useState('');
  
  // SMTP State
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');

  // Stripe State
  const [stripePublishableKey, setStripePublishableKey] = useState('');
  const [stripeSecretKey, setStripeSecretKey] = useState('');

  // Shipping & COD State
  const [shippingFallbackRate, setShippingFallbackRate] = useState('80');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('999');
  const [codFee, setCodFee] = useState('0');

  // Shiprocket API State
  const [shiprocketEmail, setShiprocketEmail] = useState('');
  const [shiprocketPassword, setShiprocketPassword] = useState('');
  const [shiprocketPickupPincode, setShiprocketPickupPincode] = useState('380015');
  const [shiprocketPickupLocation, setShiprocketPickupLocation] = useState('');
  const [pickupLocations, setPickupLocations] = useState([]);
  const [fetchingPickupLocations, setFetchingPickupLocations] = useState(false);
  const [testingShiprocket, setTestingShiprocket] = useState(false);

  // Profile update state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const { showNotification } = useNotification();
  const { admin, login } = useAuth();

  const fetchPickupLocations = async () => {
    setFetchingPickupLocations(true);
    try {
      const res = await api.get('/api/shipping/pickup-addresses');
      const addresses = res.data?.data?.data?.shipping_address || res.data?.data?.shipping_address || [];
      if (addresses.length > 0) {
        setPickupLocations(addresses);
        // Auto-select if only one or if current selection not in list
        const names = addresses.map((a) => a.pickup_location || a.location_name || String(a.id));
        if (addresses.length === 1) {
          setShiprocketPickupLocation(names[0]);
        } else if (shiprocketPickupLocation && !names.includes(shiprocketPickupLocation)) {
          setShiprocketPickupLocation(names[0]);
        }
        showNotification(`✅ Loaded ${addresses.length} pickup location(s) from Shiprocket`, 'success');
      } else {
        showNotification('No pickup addresses found in your Shiprocket account. Please add one at app.shiprocket.in → Settings → Manage Pickup Addresses.', 'warning');
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Could not fetch pickup locations';
      showNotification(`❌ ${msg}`, 'error');
    } finally {
      setFetchingPickupLocations(false);
    }
  };

  const handleTestShiprocket = async () => {
    setTestingShiprocket(true);
    try {
      // First save settings so backend has latest values
      await api.post('/api/settings', {
        storeName, storeEmail, storeCurrency, shippingReturnsText, deliveryEstimateMin, deliveryEstimateMax,
        gstBrackets, smtpHost, smtpPort, smtpUser, smtpPassword: smtpPass, stripePublishableKey, stripeSecretKey,
        shippingFallbackRate, freeShippingThreshold, codFee, shiprocketEmail, shiprocketPassword,
        shiprocketPickupPincode, shiprocketPickupLocation
      });

      const res = await api.get('/api/shipping/test-connection');
      if (res.data.success) {
        showNotification(`✅ ${res.data.message} (Account: ${res.data.email})`, 'success');
      } else {
        showNotification(res.data.error || 'Shiprocket connection failed', 'error');
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Shiprocket test connection failed';
      showNotification(`❌ ${msg}`, 'error');
    } finally {
      setTestingShiprocket(false);
    }
  };

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/settings');
      if (res.data.success) {
        const settings = res.data.settings;
        setStoreName(settings.storeName || '');
        setStoreEmail(settings.storeEmail || '');
        setStoreCurrency(settings.storeCurrency || 'INR');
        setShippingReturnsText(settings.shippingReturnsText || 'Orders are processed within 1-2 business days. Returns accepted within 14 days of delivery.');
        setDeliveryEstimateMin(settings.deliveryEstimateMin || '3');
        setDeliveryEstimateMax(settings.deliveryEstimateMax || '5');
        setGstBrackets(settings.gstBrackets || '0, 5, 12, 18, 28');
        setSmtpHost(settings.smtpHost || '');
        setSmtpPort(settings.smtpPort || '587');
        setSmtpUser(settings.smtpUser || '');
        setSmtpPass(settings.smtpPassword || '');
        setStripePublishableKey(settings.stripePublishableKey || '');
        setStripeSecretKey(settings.stripeSecretKey || '');
        setShippingFallbackRate(settings.shippingFallbackRate || '80');
        setFreeShippingThreshold(settings.freeShippingThreshold || '999');
        setCodFee(settings.codFee || '0');

        setShiprocketEmail(settings.shiprocketEmail || '');
        setShiprocketPassword(settings.shiprocketPassword || '');
        setShiprocketPickupPincode(settings.shiprocketPickupPincode || '380015');
        setShiprocketPickupLocation(settings.shiprocketPickupLocation || '');
      }

      if (admin) {
        setFirstName(admin.firstName || '');
        setLastName(admin.lastName || '');
        setEmail(admin.email || '');
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      showNotification('Failed to load system settings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [admin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (activeTab === 'profile') {
        // Profile update endpoint
        const payload = { firstName, lastName, email };
        if (newPassword) payload.password = newPassword;

        const res = await api.put(`/api/auth/profile`, payload);
        if (res.data.success) {
          showNotification('Profile updated successfully! Session refreshed.', 'success');
          setNewPassword('');
        }
      } else {
        // System settings payload
        const payload = {
          storeName,
          storeEmail,
          storeCurrency,
          shippingReturnsText,
          deliveryEstimateMin,
          deliveryEstimateMax,
          gstBrackets,
          smtpHost,
          smtpPort,
          smtpUser,
          smtpPassword: smtpPass,
          stripePublishableKey,
          stripeSecretKey,
          shippingFallbackRate,
          freeShippingThreshold,
          codFee,
          shiprocketEmail,
          shiprocketPassword,
          shiprocketPickupPincode,
          shiprocketPickupLocation
        };

        const res = await api.post('/api/settings', payload);
        if (res.data.success) {
          showNotification('System settings saved successfully!', 'success');
        }
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to save settings details.';
      showNotification(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddGstBracket = (e) => {
    e.preventDefault();
    if (!newGstBracket.trim()) return;
    const val = parseFloat(newGstBracket.trim());
    if (isNaN(val)) return;
    
    let brackets = gstBrackets.split(',').map(b => parseFloat(b.trim())).filter(b => !isNaN(b));
    if (!brackets.includes(val)) {
      brackets.push(val);
      brackets.sort((a, b) => a - b);
      setGstBrackets(brackets.join(', '));
    }
    setNewGstBracket('');
  };

  const handleRemoveGstBracket = (valToRemove) => {
    let brackets = gstBrackets.split(',').map(b => parseFloat(b.trim())).filter(b => !isNaN(b));
    brackets = brackets.filter(b => b !== valToRemove);
    setGstBrackets(brackets.join(', '));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold text-slate-400">Loading system settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">System Settings</h1>
        <p className="text-xs text-slate-450 dark:text-slate-400 font-medium">Configure SMTP email templates dispatches, shipping fallback rates, and update profile passwords</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Tabs Navigation */}
        <div className="lg:col-span-1 glass-card p-4 h-fit flex flex-col gap-1.5">
          <button
            onClick={() => setActiveTab('general')}
            className={`w-full text-left text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-2.5 transition-all ${
              activeTab === 'general'
                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                : 'text-slate-650 hover:bg-slate-50 dark:text-slate-350 dark:hover:bg-slate-850'
            }`}
          >
            <SettingsIcon className="w-4.5 h-4.5" />
            General Branding
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`w-full text-left text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-2.5 transition-all ${
              activeTab === 'shipping'
                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                : 'text-slate-650 hover:bg-slate-50 dark:text-slate-350 dark:hover:bg-slate-850'
            }`}
          >
            <Truck className="w-4.5 h-4.5" />
            Shipping & COD
          </button>
          <button
            onClick={() => setActiveTab('smtp')}
            className={`w-full text-left text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-2.5 transition-all ${
              activeTab === 'smtp'
                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                : 'text-slate-650 hover:bg-slate-50 dark:text-slate-350 dark:hover:bg-slate-850'
            }`}
          >
            <Mail className="w-4.5 h-4.5" />
            SMTP Dispatch
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-2.5 transition-all ${
              activeTab === 'profile'
                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                : 'text-slate-650 hover:bg-slate-50 dark:text-slate-350 dark:hover:bg-slate-850'
            }`}
          >
            <Shield className="w-4.5 h-4.5" />
            Admin Profile
          </button>
        </div>

        {/* Right Tab Content View */}
        <div className="lg:col-span-3 glass-card p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {activeTab === 'shipping' && (
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-850">
                  🚚 Shipping & Payment Fee Rules
                </h3>

                {/* Info Banner */}
                <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl">
                  <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                    The checkout page uses <strong>live Shiprocket rates</strong> based on the customer's pincode. If Shiprocket is unavailable or the pincode is not serviceable, the <strong>Fallback Rate</strong> is used automatically so customers can always checkout.
                  </p>
                </div>

                {/* Shipping Rate Settings */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Shipping Charges</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label text-xs">Fallback Shipping Rate (₹)</label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        placeholder="e.g. 80"
                        value={shippingFallbackRate}
                        onChange={(e) => setShippingFallbackRate(e.target.value)}
                        className="form-input text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="text-[10px] text-slate-450 dark:text-slate-500 mt-1 block">Used when Shiprocket cannot calculate a rate for the customer's pincode.</span>
                    </div>
                    <div>
                      <label className="form-label text-xs">Free Shipping Threshold (₹)</label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        placeholder="e.g. 999"
                        value={freeShippingThreshold}
                        onChange={(e) => setFreeShippingThreshold(e.target.value)}
                        className="form-input text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <span className="text-[10px] text-slate-450 dark:text-slate-500 mt-1 block">Orders above this amount get free shipping. Set to 0 to disable free shipping.</span>
                    </div>
                  </div>
                </div>

                {/* COD Fee */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Cash on Delivery (COD) Fee</h4>
                  <div className="max-w-xs">
                    <label className="form-label text-xs">COD Extra Fee (₹)</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      placeholder="e.g. 40"
                      value={codFee}
                      onChange={(e) => setCodFee(e.target.value)}
                      className="form-input text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-[10px] text-slate-450 dark:text-slate-500 mt-1 block">Extra fee added on top of the shipping cost when the customer selects Cash on Delivery. Set to 0 to disable.</span>
                  </div>
                </div>

                {/* Shiprocket API Credentials */}
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-850">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider flex items-center gap-2">
                      <Truck className="w-4 h-4 text-orange-500" />
                      Shiprocket API Credentials & Pickup Address
                    </h4>
                    <button
                      type="button"
                      onClick={handleTestShiprocket}
                      disabled={testingShiprocket}
                      className="py-1.5 px-3 rounded-lg text-xs font-semibold bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-900/40 hover:bg-orange-100 dark:hover:bg-orange-950/50 transition-colors flex items-center justify-center gap-1.5 shrink-0"
                    >
                      {testingShiprocket ? (
                        <>
                          <span className="w-3 h-3 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                          Testing Connection...
                        </>
                      ) : (
                        <>
                          <Truck className="w-3.5 h-3.5" />
                          Test Connection
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Configure your Shiprocket seller account credentials below to enable 1-click order pushing, courier assignment, AWB generation, and shipment tracking.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label text-xs">Shiprocket Account Email</label>
                      <input
                        type="email"
                        placeholder="care@tobeque.com or user@domain.com"
                        value={shiprocketEmail}
                        onChange={(e) => setShiprocketEmail(e.target.value)}
                        className="form-input text-xs"
                      />
                    </div>
                    <div>
                      <label className="form-label text-xs">Shiprocket Account Password</label>
                      <input
                        type="password"
                        placeholder="••••••••••••"
                        value={shiprocketPassword}
                        onChange={(e) => setShiprocketPassword(e.target.value)}
                        className="form-input text-xs"
                      />
                    </div>
                    <div>
                      <label className="form-label text-xs">Pickup Pincode</label>
                      <input
                        type="text"
                        placeholder="e.g. 380015"
                        value={shiprocketPickupPincode}
                        onChange={(e) => setShiprocketPickupPincode(e.target.value)}
                        className="form-input text-xs"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="form-label text-xs">Pickup Location</label>
                      <div className="flex gap-2 items-center">
                        <select
                          value={shiprocketPickupLocation}
                          onChange={(e) => setShiprocketPickupLocation(e.target.value)}
                          className="form-input text-xs flex-1"
                        >
                          {shiprocketPickupLocation && !pickupLocations.find(a => (a.pickup_location || a.location_name) === shiprocketPickupLocation) && (
                            <option value={shiprocketPickupLocation}>{shiprocketPickupLocation}</option>
                          )}
                          {pickupLocations.length === 0 && !shiprocketPickupLocation && (
                            <option value="">— Click "Fetch Locations" to load —</option>
                          )}
                          {pickupLocations.map((addr, i) => {
                            const name = addr.pickup_location || addr.location_name || String(addr.id);
                            return (
                              <option key={i} value={name}>
                                {name}{addr.is_primary_location === 1 ? ' (Primary)' : ''} — {addr.city || addr.address || ''}
                              </option>
                            );
                          })}
                        </select>
                        <button
                          type="button"
                          onClick={fetchPickupLocations}
                          disabled={fetchingPickupLocations}
                          className="btn-secondary text-xs px-3 py-2 whitespace-nowrap flex items-center gap-1.5"
                        >
                          {fetchingPickupLocations ? (
                            <><span className="animate-spin inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full"></span> Fetching…</>
                          ) : (
                            <><Truck className="w-3 h-3" /> Fetch Locations</>
                          )}
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                        Auto-selected if left empty. Click "Fetch Locations" to load your Shiprocket pickup addresses.
                      </p>
                    </div>
                  </div>

                  {/* Lockout Notice & Help */}
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl text-xs text-amber-800 dark:text-amber-300 leading-relaxed space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <Info className="w-4 h-4 text-amber-600 shrink-0" />
                      Shiprocket Lockout Help ("User blocked due to too many failed login attempts"):
                    </p>
                    <p>
                      If you see a <strong>"User blocked"</strong> error, Shiprocket has temporarily locked your API access because of invalid login attempts.
                    </p>
                    <ul className="list-disc list-inside space-y-0.5 pt-0.5 text-[11px] text-amber-700 dark:text-amber-400">
                      <li>Use the exact <strong>API User Email &amp; Password</strong> from <em>Shiprocket Panel &gt; Settings &gt; API</em>.</li>
                      <li>Wait <strong>15–30 minutes</strong> without making API calls for Shiprocket's security timer to expire automatically.</li>
                      <li>Or log in directly to <a href="https://app.shiprocket.in" target="_blank" rel="noreferrer" className="underline font-semibold">app.shiprocket.in</a> to unlock your account or reset your password.</li>
                    </ul>
                  </div>
                </div>

                {/* Live Preview */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-3 uppercase tracking-wider">Preview (Example ₹600 order)</p>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Subtotal</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">₹600.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Shipping (live Shiprocket rate)</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">~₹45–₹120 (varies by pincode)</span>
                    </div>
                    <div className="flex justify-between text-amber-600">
                      <span>COD Fee (if COD selected)</span>
                      <span className="font-semibold">+ ₹{codFee || 0}</span>
                    </div>
                    {parseFloat(freeShippingThreshold) > 0 && (
                      <div className="flex justify-between text-emerald-600 pt-1 border-t border-slate-200 dark:border-slate-700">
                        <span>Free shipping unlocks at</span>
                        <span className="font-bold">₹{freeShippingThreshold}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'general' && (
              <div className="space-y-5">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-850">
                  Storefront Branding Settings
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label text-xs">E-Commerce Brand Name</label>
                    <input
                      type="text"
                      placeholder="EX: Tobeque Inc."
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="form-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="form-label text-xs">Support Contact Email</label>
                    <input
                      type="email"
                      placeholder="EX: support@tobeque.com"
                      value={storeEmail}
                      onChange={(e) => setStoreEmail(e.target.value)}
                      className="form-input text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label text-xs">Global Shipping &amp; Returns Policy</label>
                  <textarea
                    rows={3}
                    placeholder="Global shipping & returns information shown across all product pages..."
                    value={shippingReturnsText}
                    onChange={(e) => setShippingReturnsText(e.target.value)}
                    className="form-input text-xs"
                  />
                  <span className="text-[10px] text-slate-450 dark:text-slate-500 mt-1 block">This text will be displayed in the Shipping &amp; Returns accordion across all product pages on the website.</span>
                </div>
                <div>
                  <label className="form-label text-xs">Store Base Checkout Currency</label>
                  <select
                    value={storeCurrency}
                    onChange={(e) => setStoreCurrency(e.target.value)}
                    className="form-input text-xs h-[38px] py-1 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="USD">USD - US Dollar ($)</option>
                    <option value="EUR">EUR - Euro (€)</option>
                    <option value="GBP">GBP - British Pound Sterling (£)</option>
                    <option value="INR">INR - Indian Rupee (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="form-label text-xs">Available GST Brackets (%)</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {gstBrackets.split(',').map(b => parseFloat(b.trim())).filter(b => !isNaN(b)).map((bracket, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-lg border border-brand-200 dark:border-brand-500/20 text-xs font-semibold">
                        {bracket}%
                        <button type="button" onClick={() => handleRemoveGstBracket(bracket)} className="hover:text-red-500 transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 max-w-sm">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="e.g. 15"
                      value={newGstBracket}
                      onChange={(e) => setNewGstBracket(e.target.value)}
                      onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); handleAddGstBracket(e); } }}
                      className="form-input text-xs h-[38px] py-1 bg-slate-50 dark:bg-slate-800 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddGstBracket}
                      className="btn-primary h-[38px] px-4 rounded-xl flex items-center justify-center text-xs"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-[9px] text-slate-450 dark:text-slate-500 mt-2 block">Add or remove GST rates. The first item in the list will be the default for new products.</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label text-xs">Delivery Estimate Min (Days)</label>
                    <input
                      type="number"
                      value={deliveryEstimateMin}
                      onChange={(e) => setDeliveryEstimateMin(e.target.value)}
                      className="form-input text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                  <div>
                    <label className="form-label text-xs">Delivery Estimate Max (Days)</label>
                    <input
                      type="number"
                      value={deliveryEstimateMax}
                      onChange={(e) => setDeliveryEstimateMax(e.target.value)}
                      className="form-input text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'smtp' && (
              <div className="space-y-5">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-850">
                  SMTP Mail Server Configuration
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="form-label text-xs">SMTP Host Address</label>
                    <input
                      type="text"
                      placeholder="EX: smtp.mailgun.org, smtp.gmail.com"
                      value={smtpHost}
                      onChange={(e) => setSmtpHost(e.target.value)}
                      className="form-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="form-label text-xs">SMTP Port</label>
                    <input
                      type="number"
                      placeholder="587, 465"
                      value={smtpPort}
                      onChange={(e) => setSmtpPort(e.target.value)}
                      className="form-input text-xs"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label text-xs">Mail Username</label>
                    <input
                      type="text"
                      placeholder="EX: postmaster@tobeque.com"
                      value={smtpUser}
                      onChange={(e) => setSmtpUser(e.target.value)}
                      className="form-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="form-label text-xs">Mail Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={smtpPass}
                      onChange={(e) => setSmtpPass(e.target.value)}
                      className="form-input text-xs"
                    />
                  </div>
                </div>
              </div>
            )}



            {activeTab === 'profile' && (
              <div className="space-y-5">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-850">
                  Administrator Profile Credentials
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label text-xs">First Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter first name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="form-input text-xs"
                    />
                  </div>
                  <div>
                    <label className="form-label text-xs">Last Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="form-input text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label text-xs">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="admin@tobeque.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input text-xs"
                  />
                </div>
                <div>
                  <label className="form-label text-xs">Change Password (Leave empty to retain current)</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="form-input text-xs"
                  />
                </div>
              </div>
            )}

            {/* Save Buttons Footer */}
            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-850">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary py-2.5 px-6 rounded-xl text-xs font-semibold shadow-lg shadow-brand-500/20"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Settings Options
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
};

export default Settings;
