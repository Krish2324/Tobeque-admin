import React, { useState, useEffect } from 'react';
import { Trash2, Mail, Phone, MapPin, Clock, Settings, MessageSquare, Eye, CheckCheck, RefreshCw } from 'lucide-react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';
import DeleteModal from '../components/DeleteModal';

const SUBJECT_LABELS = {
  order: 'Order Enquiry',
  return: 'Return / Exchange',
  shipping: 'Shipping Issue',
  product: 'Product Question',
  styling: 'Styling Advice',
  wholesale: 'Wholesale / B2B',
  other: 'Other',
};

const STATUS_CYCLE = ['new', 'read', 'replied'];

export default function ContactUsAdmin() {
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState('submissions');

  // ── Submissions state ──
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const [expandedRow, setExpandedRow] = useState(null);

  // ── Settings state ──
  const [settings, setSettings] = useState({
    phone: '',
    whatsapp: '',
    email: '',
    officeAddress: '',
    businessHours: '',
    mapEmbedUrl: '',
    mapAddress: '',
  });
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  // ── Fetch ──
  const fetchSubmissions = async () => {
    try {
      setLoadingSubmissions(true);
      const { data } = await api.get('/api/contact/submissions');
      setSubmissions(data.data || []);
    } catch {
      showNotification('Failed to load contact submissions', 'error');
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const fetchSettings = async () => {
    try {
      setLoadingSettings(true);
      const { data } = await api.get('/api/contact/settings');
      if (data.data) setSettings(data.data);
    } catch {
      showNotification('Failed to load contact settings', 'error');
    } finally {
      setLoadingSettings(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
    fetchSettings();
  }, []);

  // ── Actions ──
  const cycleStatus = async (id, currentStatus) => {
    const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(currentStatus) + 1) % STATUS_CYCLE.length];
    try {
      await api.put(`/api/contact/submissions/${id}/status`, { status: next });
      showNotification(`Marked as ${next}`, 'success');
      fetchSubmissions();
    } catch {
      showNotification('Failed to update status', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/contact/submissions/${id}`);
      showNotification('Submission deleted', 'success');
      fetchSubmissions();
    } catch {
      showNotification('Failed to delete submission', 'error');
    } finally {
      setDeleteModal({ open: false, id: null });
    }
  };

  const handleSettingsChange = (e) => {
    setSettings(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSettingsSave = async (e) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      await api.put('/api/contact/settings', settings);
      showNotification('Contact settings saved successfully!', 'success');
    } catch {
      showNotification('Failed to save settings', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  // ── Stats ──
  const newCount = submissions.filter(s => s.status === 'new').length;
  const readCount = submissions.filter(s => s.status === 'read').length;
  const repliedCount = submissions.filter(s => s.status === 'replied').length;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-headline-sm font-headline-sm text-primary mb-1">Contact Us</h1>
          <p className="text-body-md text-on-surface-variant">View form submissions & manage contact page settings</p>
        </div>
        <button onClick={fetchSubmissions} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-surface rounded-xl border border-outline-variant hover:bg-surface-container transition-colors cursor-pointer">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'New', count: newCount, color: 'rose', icon: <Mail className="w-5 h-5" /> },
          { label: 'Read', count: readCount, color: 'blue', icon: <Eye className="w-5 h-5" /> },
          { label: 'Replied', count: repliedCount, color: 'emerald', icon: <CheckCheck className="w-5 h-5" /> },
        ].map(({ label, count, color, icon }) => (
          <div key={label} className={`bg-${color}-50 dark:bg-${color}-950/20 border border-${color}-200 dark:border-${color}-800/30 rounded-2xl p-5 flex items-center gap-4`}>
            <div className={`w-10 h-10 rounded-xl bg-${color}-100 dark:bg-${color}-900/30 text-${color}-600 dark:text-${color}-400 flex items-center justify-center`}>
              {icon}
            </div>
            <div>
              <div className={`text-2xl font-bold text-${color}-700 dark:text-${color}-300`}>{count}</div>
              <div className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-container-low rounded-xl p-1 mb-6 w-fit border border-outline-variant/50">
        <button
          onClick={() => setActiveTab('submissions')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${activeTab === 'submissions' ? 'bg-white dark:bg-dark-800 text-primary shadow-sm border border-outline-variant/30' : 'text-on-surface-variant hover:text-primary'}`}
        >
          <MessageSquare className="w-4 h-4" />
          Submissions
          {newCount > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">{newCount}</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${activeTab === 'settings' ? 'bg-white dark:bg-dark-800 text-primary shadow-sm border border-outline-variant/30' : 'text-on-surface-variant hover:text-primary'}`}
        >
          <Settings className="w-4 h-4" />
          Page Settings
        </button>
      </div>

      {/* ── SUBMISSIONS TAB ── */}
      {activeTab === 'submissions' && (
        <div className="bg-white dark:bg-dark-800 rounded-2xl border border-outline-variant/50 overflow-hidden">
          {loadingSubmissions ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-20">
              <MessageSquare className="w-12 h-12 text-on-surface-variant/30 mx-auto mb-4" />
              <p className="text-on-surface-variant text-sm">No contact submissions yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/40 bg-surface-container-low">
                    <th className="text-left px-5 py-3.5 text-[11px] uppercase tracking-widest font-semibold text-on-surface-variant">Date</th>
                    <th className="text-left px-5 py-3.5 text-[11px] uppercase tracking-widest font-semibold text-on-surface-variant">Customer</th>
                    <th className="text-left px-5 py-3.5 text-[11px] uppercase tracking-widest font-semibold text-on-surface-variant">Subject</th>
                    <th className="text-left px-5 py-3.5 text-[11px] uppercase tracking-widest font-semibold text-on-surface-variant">Message</th>
                    <th className="text-left px-5 py-3.5 text-[11px] uppercase tracking-widest font-semibold text-on-surface-variant">Status</th>
                    <th className="text-left px-5 py-3.5 text-[11px] uppercase tracking-widest font-semibold text-on-surface-variant">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {submissions.map(sub => (
                    <React.Fragment key={sub._id}>
                      <tr className={`hover:bg-surface-container-low/50 transition-colors ${sub.status === 'new' ? 'bg-rose-50/30 dark:bg-rose-950/10' : ''}`}>
                        <td className="px-5 py-4 text-xs text-on-surface-variant whitespace-nowrap">
                          {new Date(sub.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-semibold text-on-surface">{sub.name}</div>
                          <a href={`mailto:${sub.email}`} className="text-xs text-brand-600 dark:text-brand-400 hover:underline">{sub.email}</a>
                          {sub.phone && <div className="text-xs text-on-surface-variant">{sub.phone}</div>}
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs font-medium text-on-surface-variant bg-surface-container px-2 py-1 rounded-lg border border-outline-variant/30">
                            {SUBJECT_LABELS[sub.subject] || sub.subject || '—'}
                          </span>
                        </td>
                        <td className="px-5 py-4 max-w-[220px]">
                          <div className="truncate text-sm text-on-surface-variant">{sub.message}</div>
                          <button onClick={() => setExpandedRow(expandedRow === sub._id ? null : sub._id)}
                            className="text-[11px] text-brand-600 dark:text-brand-400 mt-0.5 hover:underline cursor-pointer">
                            {expandedRow === sub._id ? 'Collapse ▲' : 'Read more ▼'}
                          </button>
                        </td>
                        <td className="px-5 py-4">
                          <button onClick={() => cycleStatus(sub._id, sub.status)}
                            className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border cursor-pointer hover:opacity-80 transition-opacity whitespace-nowrap ${
                              sub.status === 'new' ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-800/30' :
                              sub.status === 'read' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800/30' :
                              'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800/30'
                            }`}
                          >
                            {sub.status}
                          </button>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <a href={`mailto:${sub.email}?subject=Re: ${sub.subject}`}
                              className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-950/20 dark:hover:bg-blue-950/30 dark:text-blue-400 transition-colors" title="Reply via Email">
                              <Mail className="w-4 h-4" />
                            </a>
                            <button onClick={() => setDeleteModal({ open: true, id: sub._id })}
                              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/20 dark:hover:bg-rose-950/30 dark:text-rose-400 transition-colors cursor-pointer" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {/* Expanded message row */}
                      {expandedRow === sub._id && (
                        <tr>
                          <td colSpan={6} className="px-5 pb-4 pt-0">
                            <div className="bg-surface-container rounded-xl p-4 border border-outline-variant/30 text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                              {sub.message}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── SETTINGS TAB ── */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSettingsSave} className="bg-white dark:bg-dark-800 rounded-2xl border border-outline-variant/50 p-8 space-y-8">
          {loadingSettings ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Contact Info Section */}
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                    <Phone className="w-4 h-4" />
                  </div>
                  <h2 className="text-base font-semibold text-on-surface">Contact Information</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] uppercase tracking-widest font-semibold text-on-surface-variant">Phone Number</label>
                    <input type="text" name="phone" value={settings.phone} onChange={handleSettingsChange}
                      placeholder="+91 XXXXX XXXXX"
                      className="border border-outline-variant rounded-xl px-4 py-2.5 text-sm text-on-surface bg-surface focus:outline-none focus:border-brand-500 transition-colors" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] uppercase tracking-widest font-semibold text-on-surface-variant">WhatsApp Number (with country code, no +)</label>
                    <input type="text" name="whatsapp" value={settings.whatsapp} onChange={handleSettingsChange}
                      placeholder="918447000200"
                      className="border border-outline-variant rounded-xl px-4 py-2.5 text-sm text-on-surface bg-surface focus:outline-none focus:border-brand-500 transition-colors" />
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-[11px] uppercase tracking-widest font-semibold text-on-surface-variant">Email Address</label>
                    <input type="email" name="email" value={settings.email} onChange={handleSettingsChange}
                      placeholder="care@tobeque.com"
                      className="border border-outline-variant rounded-xl px-4 py-2.5 text-sm text-on-surface bg-surface focus:outline-none focus:border-brand-500 transition-colors" />
                  </div>
                </div>
              </div>

              <hr className="border-outline-variant/30" />

              {/* Address & Hours */}
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <h2 className="text-base font-semibold text-on-surface">Office Address & Hours</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] uppercase tracking-widest font-semibold text-on-surface-variant">Office Address (one line per entry)</label>
                    <textarea name="officeAddress" value={settings.officeAddress} onChange={handleSettingsChange} rows={5}
                      placeholder="Company Name&#10;Street Address&#10;City, State – PIN&#10;Country"
                      className="border border-outline-variant rounded-xl px-4 py-2.5 text-sm text-on-surface bg-surface focus:outline-none focus:border-brand-500 transition-colors resize-none" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] uppercase tracking-widest font-semibold text-on-surface-variant">Business Hours (format: Day: Time)</label>
                    <textarea name="businessHours" value={settings.businessHours} onChange={handleSettingsChange} rows={5}
                      placeholder="Mon–Fri: 10:00 AM – 7:00 PM&#10;Saturday: 10:00 AM – 5:00 PM&#10;Sunday: Closed"
                      className="border border-outline-variant rounded-xl px-4 py-2.5 text-sm text-on-surface bg-surface focus:outline-none focus:border-brand-500 transition-colors resize-none" />
                    <p className="text-[11px] text-on-surface-variant">Each line is parsed as "Day: Time". Use a colon (:) separator.</p>
                  </div>
                </div>
              </div>

              <hr className="border-outline-variant/30" />

              {/* Map Section */}
              <div>
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <h2 className="text-base font-semibold text-on-surface">Map Settings</h2>
                </div>
                <div className="grid grid-cols-1 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] uppercase tracking-widest font-semibold text-on-surface-variant">Map Address (shown as label + Google Maps link)</label>
                    <input type="text" name="mapAddress" value={settings.mapAddress} onChange={handleSettingsChange}
                      placeholder="Sector 18, Noida, Uttar Pradesh"
                      className="border border-outline-variant rounded-xl px-4 py-2.5 text-sm text-on-surface bg-surface focus:outline-none focus:border-brand-500 transition-colors" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] uppercase tracking-widest font-semibold text-on-surface-variant">
                      Google Maps Embed URL
                      <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer"
                        className="ml-2 text-brand-600 dark:text-brand-400 font-normal normal-case hover:underline">
                        (Get embed URL from Google Maps → Share → Embed a map)
                      </a>
                    </label>
                    <textarea name="mapEmbedUrl" value={settings.mapEmbedUrl} onChange={handleSettingsChange} rows={3}
                      placeholder="https://www.google.com/maps/embed?pb=..."
                      className="border border-outline-variant rounded-xl px-4 py-2.5 text-sm text-on-surface bg-surface focus:outline-none focus:border-brand-500 transition-colors resize-none font-mono text-xs" />
                  </div>
                  {/* Map preview */}
                  {settings.mapEmbedUrl && (
                    <div className="rounded-xl overflow-hidden border border-outline-variant/30 h-48">
                      <iframe src={settings.mapEmbedUrl} width="100%" height="100%" style={{ border: 0 }} loading="lazy" title="Map Preview" />
                    </div>
                  )}
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-2">
                <button type="submit" disabled={savingSettings}
                  className="flex items-center gap-2 px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer">
                  {savingSettings ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                  ) : (
                    'Save Settings'
                  )}
                </button>
              </div>
            </>
          )}
        </form>
      )}

      <DeleteModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={() => handleDelete(deleteModal.id)}
        title="Delete Submission"
        message="Are you sure you want to delete this contact submission? This action cannot be undone."
      />
    </div>
  );
}
