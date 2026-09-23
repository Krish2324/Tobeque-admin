import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import api from '../services/api';
import Table from '../components/Table';
import { useNotification } from '../context/NotificationContext';
import DeleteModal from '../components/DeleteModal';

const STATUS_STYLES = {
  pending:   'bg-yellow-50 text-yellow-700 border-yellow-200',
  processed: 'bg-green-50 text-green-700 border-green-200',
  rejected:  'bg-red-50 text-red-700 border-red-200',
};

const STATUS_LABELS = {
  pending:   'Pending',
  processed: 'Processed',
  rejected:  'Rejected',
};

const ALL_STATUSES = ['pending', 'processed', 'rejected'];

export default function AccountDeletionRequestList() {
  const [requests, setRequests]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const [total, setTotal]             = useState(0);
  const { showNotification }          = useNotification();

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (statusFilter !== 'all') params.status = statusFilter;
      const { data } = await api.get('/api/account-deletion/requests', { params });
      setRequests(data.data || []);
      setTotal(data.total || 0);
    } catch {
      showNotification('Failed to load deletion requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/api/account-deletion/requests/${id}/status`, { status: newStatus });
      showNotification(`Status updated to "${STATUS_LABELS[newStatus]}"`, 'success');
      fetchRequests();
    } catch {
      showNotification('Failed to update status', 'error');
    }
  };

  // Note: Backend does not have a DELETE endpoint yet; we mark as rejected instead.
  // If you add DELETE later, swap this out.
  const handleDelete = async (id) => {
    try {
      await api.put(`/api/account-deletion/requests/${id}/status`, { status: 'rejected' });
      showNotification('Request dismissed (marked as Rejected)', 'success');
      fetchRequests();
    } catch {
      showNotification('Failed to dismiss request', 'error');
    } finally {
      setDeleteModal({ open: false, id: null });
    }
  };

  const pendingCount   = requests.filter(r => r.status === 'pending').length;
  const processedCount = requests.filter(r => r.status === 'processed').length;
  const rejectedCount  = requests.filter(r => r.status === 'rejected').length;

  const columns = [
    {
      header: 'Date Submitted',
      accessor: (row) =>
        new Date(row.createdAt).toLocaleDateString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        }),
    },
    {
      header: 'Email / Phone',
      accessor: (row) => (
        <span className="text-sm font-medium text-on-surface font-mono">{row.identifier}</span>
      ),
    },
    {
      header: 'Reason',
      accessor: (row) => (
        <div className="max-w-[260px]">
          {row.reason ? (
            <span className="text-xs text-on-surface-variant" title={row.reason}>
              {row.reason.length > 80 ? row.reason.slice(0, 80) + '…' : row.reason}
            </span>
          ) : (
            <span className="italic text-xs text-gray-400">No reason provided</span>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => (
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
      ),
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <button
          onClick={() => setDeleteModal({ open: true, id: row._id })}
          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
          title="Dismiss Request"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-sm font-headline-sm text-primary mb-1">
            Account Deletion Requests
          </h1>
          <p className="text-body-md text-on-surface-variant">
            Requests submitted via{' '}
            <a
              href="https://tobeque.com/delete-account"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-brand-600 hover:text-brand-700"
            >
              tobeque.com/delete-account
            </a>{' '}
            · {total} total request{total !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Summary Pills */}
      <div className="flex flex-wrap gap-3">
        {[
          { key: 'all',       label: 'All',       count: requests.length, style: 'bg-slate-50 text-slate-600 border-slate-200' },
          { key: 'pending',   label: 'Pending',   count: pendingCount,    style: STATUS_STYLES.pending },
          { key: 'processed', label: 'Processed', count: processedCount,  style: STATUS_STYLES.processed },
          { key: 'rejected',  label: 'Rejected',  count: rejectedCount,   style: STATUS_STYLES.rejected },
        ].map((pill) => (
          <button
            key={pill.key}
            onClick={() => setStatusFilter(statusFilter === pill.key ? 'all' : pill.key)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              statusFilter === pill.key ? pill.style + ' shadow-sm' : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300'
            }`}
          >
            {pill.label} ({pill.count})
          </button>
        ))}
      </div>

      {/* Info Banner */}
      <div className="border border-amber-200 bg-amber-50 rounded-xl px-5 py-4 text-xs text-amber-800 leading-relaxed">
        <strong>Action required:</strong> For each <em>Pending</em> request, manually delete the user's
        account from the Customers section, then mark the request as <strong>Processed</strong>.
        Google Play requires deletion within <strong>30 days</strong>.
      </div>

      <Table
        columns={columns}
        data={requests}
        loading={loading}
        emptyMessage="No account deletion requests found."
      />

      <DeleteModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null })}
        onConfirm={() => handleDelete(deleteModal.id)}
        title="Dismiss Request"
        message="This will mark the request as Rejected and remove it from your pending list. Are you sure?"
      />
    </div>
  );
}
