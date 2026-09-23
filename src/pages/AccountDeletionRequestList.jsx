import React, { useState, useEffect } from 'react';
import {
  Trash2, UserX, Clock, CheckCircle, Package,
  RefreshCcw, ShieldAlert, ChevronDown, ChevronUp
} from 'lucide-react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';
import DeleteModal from '../components/DeleteModal';

// ── helpers ───────────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  pending:   'bg-yellow-50 text-yellow-700 border-yellow-200',
  processed: 'bg-green-50  text-green-700  border-green-200',
  rejected:  'bg-red-50    text-red-700    border-red-200',
};
const STATUS_LABELS = { pending: 'Pending', processed: 'Processed', rejected: 'Rejected' };
const ALL_STATUSES  = ['pending', 'processed', 'rejected'];

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : '—';

// ─────────────────────────────────────────────────────────────────────────────
export default function AccountDeletionRequestList() {
  const [activeTab, setActiveTab]       = useState('history');
  const [records, setRecords]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteModal, setDeleteModal]   = useState({ open: false, id: null });
  const [expandedId, setExpandedId]     = useState(null);
  const [total, setTotal]               = useState(0);
  const { showNotification }            = useNotification();

  // ── fetch ─────────────────────────────────────────────────────────────────
  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = { limit: 100, type: activeTab === 'history' ? 'otp' : 'manual' };
      if (statusFilter !== 'all') params.status = statusFilter;
      const { data } = await api.get('/api/account-deletion/requests', { params });
      setRecords(data.data || []);
      setTotal(data.total || 0);
    } catch {
      showNotification('Failed to load records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecords(); }, [activeTab, statusFilter]);

  // ── actions ───────────────────────────────────────────────────────────────
  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/api/account-deletion/requests/${id}/status`, { status: newStatus });
      showNotification(`Status updated to "${STATUS_LABELS[newStatus]}"`, 'success');
      fetchRecords();
    } catch {
      showNotification('Failed to update status', 'error');
    }
  };

  const handleDismiss = async (id) => {
    try {
      await api.put(`/api/account-deletion/requests/${id}/status`, { status: 'rejected' });
      showNotification('Request dismissed', 'success');
      fetchRecords();
    } catch {
      showNotification('Failed to dismiss', 'error');
    } finally {
      setDeleteModal({ open: false, id: null });
    }
  };

  // ── derived counts ────────────────────────────────────────────────────────
  const pendingCount   = records.filter((r) => r.status === 'pending').length;
  const processedCount = records.filter((r) => r.status === 'processed').length;
  const rejectedCount  = records.filter((r) => r.status === 'rejected').length;

  const filteredRecords =
    statusFilter === 'all' ? records : records.filter((r) => r.status === statusFilter);

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="w-full space-y-6">

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-headline-sm font-headline-sm text-primary mb-1 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-500" />
          Account Deletions
        </h1>
        <p className="text-body-md text-on-surface-variant">
          Track users who deleted their accounts and manage pending manual requests.{' '}
          <a
            href="https://tobeque.com/delete-account"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-brand-600 hover:text-brand-700"
          >
            tobeque.com/delete-account
          </a>
        </p>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700">
        {[
          { id: 'history', label: 'Deletion History', Icon: UserX  },
          { id: 'manual',  label: 'Manual Requests',  Icon: Clock  },
        ].map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => {
              setActiveTab(id);
              setStatusFilter('all');
              setExpandedId(null);
            }}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === id
                ? 'border-rose-500 text-rose-600 dark:text-rose-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ── Summary Pills ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        {[
          { key: 'all', label: 'All', count: records.length,
            style: 'bg-slate-50 text-slate-600 border-slate-200' },
          { key: 'processed',
            label: activeTab === 'history' ? 'Deleted' : 'Processed',
            count: processedCount, style: STATUS_STYLES.processed },
          ...(activeTab === 'manual' ? [
            { key: 'pending',  label: 'Pending',  count: pendingCount,
              style: STATUS_STYLES.pending },
            { key: 'rejected', label: 'Rejected', count: rejectedCount,
              style: STATUS_STYLES.rejected },
          ] : []),
        ].map((pill) => (
          <button
            key={pill.key}
            onClick={() => setStatusFilter(statusFilter === pill.key ? 'all' : pill.key)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              statusFilter === pill.key
                ? pill.style + ' shadow-sm'
                : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300'
            }`}
          >
            {pill.label} ({pill.count})
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-400">{total} total records</span>
      </div>

      {/* ── Info banners ──────────────────────────────────────────────────── */}
      {activeTab === 'history' && (
        <div className="border border-rose-100 bg-rose-50 rounded-xl px-5 py-4 text-xs text-rose-800 leading-relaxed flex items-start gap-3">
          <UserX className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
          <span>
            These accounts were <strong>permanently deleted</strong> by users via OTP verification
            at tobeque.com/delete-account. The user document no longer exists. Order records have
            been anonymized. Click <strong>View</strong> on any row for the full audit detail.
          </span>
        </div>
      )}
      {activeTab === 'manual' && pendingCount > 0 && (
        <div className="border border-amber-200 bg-amber-50 rounded-xl px-5 py-4 text-xs text-amber-800 leading-relaxed flex items-start gap-3">
          <Clock className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
          <span>
            <strong>{pendingCount} pending request{pendingCount !== 1 ? 's' : ''}.</strong>{' '}
            Go to <strong>Customers</strong>, find the user, delete them, then mark as{' '}
            <strong>Processed</strong>. Google Play requires deletion within{' '}
            <strong>30 days</strong>.
          </span>
        </div>
      )}

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200/50 dark:border-slate-800/80 bg-white/50 dark:bg-dark-950/20 backdrop-blur-md">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-slate-100/70 dark:bg-slate-850/50 text-slate-600 dark:text-slate-350 border-b border-slate-200/50 dark:border-slate-800/60 uppercase font-bold tracking-wider text-[10px]">
            <tr>
              {activeTab === 'history' ? (
                <>
                  <th className="px-6 py-4">Deleted At</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Data Cleaned</th>
                  <th className="px-6 py-4">Account Created</th>
                  <th className="px-6 py-4">Last Active</th>
                  <th className="px-6 py-4">Details</th>
                </>
              ) : (
                <>
                  <th className="px-6 py-4">Date Submitted</th>
                  <th className="px-6 py-4">Email / Phone</th>
                  <th className="px-6 py-4">Reason</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-150 dark:divide-slate-800/50">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-14 text-center text-slate-400 font-semibold text-sm">
                  {activeTab === 'history'
                    ? 'No accounts have been deleted yet via the OTP-verified flow.'
                    : 'No manual deletion requests found.'}
                </td>
              </tr>
            ) : activeTab === 'history' ? (
              filteredRecords.map((row) => (
                <React.Fragment key={row._id}>
                  {/* ── History Row ─────────────────────────────────── */}
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-dark-850/30 transition-colors">
                    {/* Deleted At */}
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300 whitespace-nowrap text-xs">
                      {fmtDate(row.deletedAt || row.createdAt)}
                    </td>

                    {/* User */}
                    <td className="px-6 py-4">
                      <p className="font-semibold text-on-surface text-sm">
                        {row.userSnapshot?.name || '—'}
                      </p>
                      <p className="text-xs text-on-surface-variant font-mono">
                        {row.userSnapshot?.phone || row.identifier}
                      </p>
                      {row.userSnapshot?.email && (
                        <p className="text-xs text-on-surface-variant font-mono">
                          {row.userSnapshot.email}
                        </p>
                      )}
                    </td>

                    {/* Data cleaned */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1 text-xs text-rose-600 font-medium">
                          <UserX className="w-3.5 h-3.5" /> Account deleted
                        </span>
                        {(row.ordersAnonymized > 0) && (
                          <span className="flex items-center gap-1 text-xs text-amber-600">
                            <Package className="w-3.5 h-3.5" />
                            {row.ordersAnonymized} order{row.ordersAnonymized !== 1 ? 's' : ''} anonymized
                          </span>
                        )}
                        {(row.refundsAnonymized > 0) && (
                          <span className="flex items-center gap-1 text-xs text-blue-600">
                            <RefreshCcw className="w-3.5 h-3.5" />
                            {row.refundsAnonymized} refund{row.refundsAnonymized !== 1 ? 's' : ''} anonymized
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Account created */}
                    <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                      {fmtDate(row.userSnapshot?.createdAt)}
                    </td>

                    {/* Last active */}
                    <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                      {fmtDate(row.userSnapshot?.lastActiveAt)}
                    </td>

                    {/* Expand toggle */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setExpandedId(expandedId === row._id ? null : row._id)}
                        className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 underline underline-offset-2 whitespace-nowrap"
                      >
                        {expandedId === row._id
                          ? <><ChevronUp className="w-3.5 h-3.5" /> Hide</>
                          : <><ChevronDown className="w-3.5 h-3.5" /> View Audit</>
                        }
                      </button>
                    </td>
                  </tr>

                  {/* ── Expanded Audit Row ───────────────────────────── */}
                  {expandedId === row._id && (
                    <tr>
                      <td colSpan={6} className="px-0 py-0">
                        <div className="bg-slate-50 dark:bg-slate-800/40 border-t border-b border-slate-100 dark:border-slate-700 px-8 py-5">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                            Full Deletion Audit
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-5 text-xs">
                            {[
                              { label: 'Full Name',         value: row.userSnapshot?.name || '—' },
                              { label: 'Phone',             value: row.userSnapshot?.phone || '—', mono: true },
                              { label: 'Email',             value: row.userSnapshot?.email || '—', mono: true },
                              { label: 'Gender',            value: row.userSnapshot?.gender || '—', capitalize: true },
                              { label: 'Account Status',    value: row.userSnapshot?.status || '—', capitalize: true },
                              { label: 'Account Created',   value: fmtDate(row.userSnapshot?.createdAt) },
                              { label: 'Last Active',       value: fmtDate(row.userSnapshot?.lastActiveAt) },
                              { label: 'Deleted At',        value: fmtDate(row.deletedAt) },
                              { label: 'Orders Anonymized', value: row.ordersAnonymized ?? 0 },
                              { label: 'Refunds Anonymized',value: row.refundsAnonymized ?? 0 },
                            ].map(({ label, value, mono, capitalize }) => (
                              <div key={label}>
                                <p className="text-slate-400 mb-0.5">{label}</p>
                                <p className={`text-slate-700 dark:text-slate-200 font-medium ${mono ? 'font-mono' : ''} ${capitalize ? 'capitalize' : ''}`}>
                                  {value}
                                </p>
                              </div>
                            ))}
                            <div>
                              <p className="text-slate-400 mb-1">Deletion Method</p>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 text-[10px] font-semibold">
                                <CheckCircle className="w-3 h-3" /> OTP Verified
                              </span>
                            </div>
                            <div>
                              <p className="text-slate-400 mb-0.5">IP Address</p>
                              <p className="text-slate-700 dark:text-slate-200 font-medium font-mono">
                                {row.ipAddress || '—'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              // ── Manual Requests rows ─────────────────────────────────────
              filteredRecords.map((row) => (
                <tr
                  key={row._id}
                  className="hover:bg-slate-50/50 dark:hover:bg-dark-850/30 transition-colors"
                >
                  <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                    {fmtDate(row.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-on-surface font-mono">
                      {row.identifier}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-[260px]">
                      {row.reason ? (
                        <span className="text-xs text-on-surface-variant" title={row.reason}>
                          {row.reason.length > 80 ? row.reason.slice(0, 80) + '…' : row.reason}
                        </span>
                      ) : (
                        <span className="italic text-xs text-gray-400">No reason</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={row.status}
                      onChange={(e) => handleStatusChange(row._id, e.target.value)}
                      className={`px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full border cursor-pointer appearance-none ${
                        STATUS_STYLES[row.status] || 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {ALL_STATUSES.map((s) => (
                        <option key={s} value={s} className="text-slate-800 bg-white normal-case text-xs font-normal">
                          {STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setDeleteModal({ open: true, id: row._id })}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Dismiss Request"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <DeleteModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={() => handleDismiss(deleteModal.id)}
        title="Dismiss Request"
        message="This will mark the request as Rejected. Are you sure?"
      />
    </div>
  );
}
