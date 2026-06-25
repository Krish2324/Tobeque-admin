import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Table from '../components/Table';
import { useNotification } from '../context/NotificationContext';

export default function InquiryList() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  const fetchInquiries = async () => {
    try {
      const { data } = await api.get('/inquiries');
      setInquiries(data.data);
    } catch (error) {
      showNotification('Failed to load inquiries', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleStatusChange = async (id, currentStatus) => {
    // simple toggle: new -> read -> replied -> new
    const statuses = ['new', 'read', 'replied'];
    const nextStatus = statuses[(statuses.indexOf(currentStatus) + 1) % statuses.length];
    
    try {
      await api.put(`/inquiries/${id}/status`, { status: nextStatus });
      showNotification(`Marked as ${nextStatus}`, 'success');
      fetchInquiries();
    } catch (error) {
      showNotification('Failed to update status', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this inquiry?')) return;
    try {
      await api.delete(`/inquiries/${id}`);
      showNotification('Inquiry deleted', 'success');
      fetchInquiries();
    } catch (error) {
      showNotification('Failed to delete inquiry', 'error');
    }
  };

  const columns = [
    {
      header: 'Date',
      accessor: (row) => new Date(row.createdAt).toLocaleDateString()
    },
    {
      header: 'Customer',
      accessor: (row) => (
        <div>
          <div className="font-medium text-on-surface">{row.name}</div>
          <div className="text-xs text-on-surface-variant">{row.email}</div>
        </div>
      )
    },
    {
      header: 'Product',
      accessor: 'productName'
    },
    {
      header: 'Message',
      accessor: (row) => (
        <div className="max-w-xs truncate" title={row.message}>
          {row.message}
        </div>
      )
    },
    {
      header: 'Status',
      accessor: (row) => (
        <button
          onClick={() => handleStatusChange(row._id, row.status)}
          className={`px-2 py-1 text-[10px] font-label-caps uppercase tracking-wider rounded-full border cursor-pointer hover:opacity-80 transition-opacity ${
            row.status === 'new' ? 'bg-red-50 text-red-700 border-red-200' :
            row.status === 'read' ? 'bg-blue-50 text-blue-700 border-blue-200' :
            'bg-green-50 text-green-700 border-green-200'
          }`}
        >
          {row.status}
        </button>
      )
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleDelete(row._id)}
            className="w-8 h-8 rounded-full hover:bg-red-50 text-red-600 flex items-center justify-center transition-colors"
            title="Delete Inquiry"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-headline-sm font-headline-sm text-primary mb-1">Inquiries</h1>
          <p className="text-body-md text-on-surface-variant">
            Manage customer questions from the product pages
          </p>
        </div>
      </div>

      <Table
        columns={columns}
        data={inquiries}
        loading={loading}
        emptyMessage="No inquiries found."
      />
    </div>
  );
}
