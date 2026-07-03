import React, { useState, useEffect } from 'react';
import { Trash2, Download, ChevronDown } from 'lucide-react';
import api from '../services/api';
import Table from '../components/Table';
import { useNotification } from '../context/NotificationContext';

const STATUS_STYLES = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  reviewed: 'bg-blue-50 text-blue-700 border-blue-200',
  accepted: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
};

const ALL_STATUSES = ['pending', 'reviewed', 'accepted', 'rejected'];

export default function JobApplicationList() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const { showNotification } = useNotification();

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const { data } = await api.get('/api/job-applications', { params });
      setApplications(data.applications || []);
    } catch (error) {
      showNotification('Failed to load job applications', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/api/job-applications/${id}/status`, { status: newStatus });
      showNotification(`Status updated to ${newStatus}`, 'success');
      fetchApplications();
    } catch {
      showNotification('Failed to update status', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this application? This cannot be undone.')) return;
    try {
      await api.delete(`/api/job-applications/${id}`);
      showNotification('Application deleted', 'success');
      fetchApplications();
    } catch {
      showNotification('Failed to delete application', 'error');
    }
  };

  const handleDownload = async (url, originalName, applicantName) => {
    try {
      // Fetch the file as a blob so we can force a local download
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = objectUrl;
      // Provide a nice filename fallback
      link.download = originalName || `${applicantName.replace(/\s+/g, '_')}_CV.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);
    } catch (error) {
      // Fallback to opening in new tab if fetch fails (e.g., CORS)
      window.open(url, '_blank');
    }
  };

  const columns = [
    {
      header: 'Date',
      accessor: (row) => new Date(row.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    },
    {
      header: 'Applicant',
      accessor: (row) => (
        <div>
          <div className="font-medium text-on-surface text-sm">{row.fullName}</div>
          <div className="text-xs text-on-surface-variant">{row.email}</div>
          <div className="text-xs text-on-surface-variant">{row.phone}</div>
        </div>
      )
    },
    {
      header: 'Position',
      accessor: (row) => (
        <span className="text-sm font-medium text-on-surface">{row.jobTitle}</span>
      )
    },
    {
      header: 'Bio',
      accessor: (row) => (
        <div className="max-w-[200px] text-xs text-on-surface-variant truncate" title={row.bio}>
          {row.bio}
        </div>
      )
    },
    {
      header: 'CV',
      accessor: (row) => (
        row.cvUrl ? (
          <button
            onClick={() => handleDownload(row.cvUrl, 'cv.pdf', row.fullName)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-950/20 dark:text-brand-300 text-xs font-medium hover:bg-brand-100 dark:hover:bg-brand-950/30 transition-colors"
          >
            <Download className="w-3 h-3" />
            Download CV
          </button>
        ) : (
          <span className="text-xs text-on-surface-variant">No file</span>
        )
      )
    },
    {
      header: 'Status',
      accessor: (row) => (
        <div className="relative group inline-block">
          <select
            value={row.status}
            onChange={(e) => handleStatusChange(row._id, e.target.value)}
            className={`px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full border cursor-pointer appearance-none pr-6 ${STATUS_STYLES[row.status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}
          >
            {ALL_STATUSES.map(s => (
              <option key={s} value={s} className="text-slate-800 bg-white normal-case text-xs font-normal">
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
      )
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <button
          onClick={() => handleDelete(row._id)}
          className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/20 dark:hover:bg-rose-950/30 dark:text-rose-450 transition-colors"
          title="Delete Application"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )
    }
  ];

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-sm font-headline-sm text-primary mb-1">Job Applications</h1>
          <p className="text-body-md text-on-surface-variant">
            Review and manage career applications submitted via the website
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-on-surface-variant">Filter by status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500/30 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            {ALL_STATUSES.map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Pills */}
      <div className="flex flex-wrap gap-3">
        {ALL_STATUSES.map(s => {
          const count = applications.filter(a => a.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(statusFilter === s ? 'all' : s)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                statusFilter === s
                  ? STATUS_STYLES[s] + ' shadow-sm'
                  : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)} ({count})
            </button>
          );
        })}
      </div>

      <Table
        columns={columns}
        data={applications}
        loading={loading}
        emptyMessage="No applications found."
      />
    </div>
  );
}
