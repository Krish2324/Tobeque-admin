import React, { useState, useEffect } from 'react';
import { Eye, Search, ShieldAlert, Check, X, ShieldCheck, Trash2 } from 'lucide-react';
import api from '../services/api';
import Table from '../components/Table';
import Modal from '../components/Modal';
import DeleteModal from '../components/DeleteModal';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';

const CustomerList = () => {
  const { currencySymbol } = useCurrency();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);

  // History details popup
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const { showNotification } = useNotification();
  const { admin } = useAuth();
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null, email: '' });
  const [statusModal, setStatusModal] = useState({ open: false, id: null, email: '', currentStatus: '' });

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/customers', {
        params: { page, limit, search, status: statusFilter }
      });
      if (res.data.success) {
        setCustomers(res.data.data.customers);
        setTotalPages(res.data.data.pagination.pages);
        setTotalCustomers(res.data.data.pagination.total);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
      showNotification('Failed to load customers catalog.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, search, statusFilter]);

  // Block/unblock toggle
  const toggleStatus = async (id, currentStatus, email) => {
    const nextStatus = currentStatus === 'active' ? 'blocked' : 'active';
    try {
      const res = await api.put(`/api/customers/${id}/status`, { status: nextStatus });
      if (res.data.success) {
        showNotification(`Customer account state changed successfully!`, 'success');
        fetchCustomers();
      }
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to modify customer status.', 'error');
    } finally {
      setStatusModal({ open: false, id: null, email: '', currentStatus: '' });
    }
  };

  // Delete customer
  const deleteCustomer = async (id, email) => {
    try {
      const res = await api.delete(`/api/customers/${id}`);
      if (res.data.success) {
        showNotification(`Customer deleted successfully!`, 'success');
        fetchCustomers();
      }
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to delete customer.', 'error');
    } finally {
      setDeleteModal({ open: false, id: null, email: '' });
    }
  };

  // Open transaction history
  const openHistoryModal = async (cust) => {
    setSelectedCustomer(cust);
    setHistoryOpen(true);
    setLoadingHistory(true);
    try {
      const res = await api.get(`/api/customers/${cust.id}`);
      if (res.data.success) {
        setCustomerOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Error loading history orders:', err);
      showNotification('Failed to load customer transactions.', 'error');
    } finally {
      setLoadingHistory(false);
    }
  };

  const getStatusBadge = (status) => {
    const style = status === 'active' 
      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-450' 
      : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-450';
    return (
      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize tracking-wide ${style}`}>
        {status}
      </span>
    );
  };

  // Table Columns
  const columns = [
    {
      header: 'Customer Name',
      accessor: 'firstName',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-500/10 text-brand-650 flex items-center justify-center font-bold text-sm overflow-hidden shrink-0">
            {row.profilePhoto ? (
              <img src={`${row.profilePhoto}`} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <>{row.firstName?.substring(0, 1).toUpperCase() || ''}{row.lastName?.substring(0, 1).toUpperCase() || ''}</>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-slate-800 dark:text-white">{row.firstName} {row.lastName}</span>
            <span className="text-[10px] text-slate-450 dark:text-slate-450">ID: #{row.id}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Email address',
      accessor: 'email',
      cell: (row) => <span className="text-xs text-slate-700 dark:text-slate-200">{row.email}</span>
    },
    {
      header: 'Phone Number',
      accessor: 'phone',
      cell: (row) => <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{row.phone || 'No phone'}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => getStatusBadge(row.status)
    },
    {
      header: 'Join Date',
      accessor: 'createdAt',
      cell: (row) => (
        <span className="text-xs text-slate-550 dark:text-slate-400">
          {new Date(row.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'id',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openHistoryModal(row)}
            className="btn-secondary text-xs flex items-center justify-center gap-1 py-1.5 px-3 border border-slate-200 dark:border-slate-800"
          >
            <Eye className="w-3.5 h-3.5" />
            History
          </button>
          
          {['superadmin', 'manager'].includes(admin?.role) && (
            <>
              <button
                onClick={() => setStatusModal({ open: true, id: row.id, email: row.email, currentStatus: row.status })}
                className={`p-2 rounded-xl flex items-center justify-center transition-colors ${
                  row.status === 'active'
                    ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/20 dark:text-rose-400'
                    : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400'
                }`}
                title={row.status === 'active' ? 'Block Account' : 'Activate Account'}
              >
                {row.status === 'active' ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
              </button>
              
              <button
                onClick={() => setDeleteModal({ open: true, id: row.id, email: row.email })}
                className="p-2 rounded-xl flex items-center justify-center transition-colors bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400"
                title="Delete Customer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">Customers Management</h1>
        <p className="text-xs text-slate-450 dark:text-slate-400 font-medium">Verify consumer base profiles, trace historic transactions, and configure access settings</p>
      </div>

      {/* Advanced Filters */}
      <div className="glass-card p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="form-label text-xs">Search Keywords</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="form-input pl-9 text-xs"
            />
          </div>
        </div>

        <div>
          <label className="form-label text-xs">Account Access Status</label>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="form-input text-xs h-[38px] py-1 bg-slate-50 dark:bg-slate-800"
          >
            <option value="">All statuses</option>
            <option value="active">Active (Permitted)</option>
            <option value="blocked">Blocked (Deactivated)</option>
          </select>
        </div>
      </div>

      {/* Main Customers table */}
      <div className="glass-card p-6">
        <Table
          columns={columns}
          data={customers}
          loading={loading}
          pagination={{
            total: totalCustomers,
            page,
            limit,
            pages: totalPages,
            onPageChange: (p) => setPage(p)
          }}
          exportFileName="customers-list"
        />
      </div>

      {/* Customer Transactions History Popup Modal */}
      <Modal
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        title={`Customer profile history: ${selectedCustomer?.firstName || ''} ${selectedCustomer?.lastName || ''}`}
        size="lg"
      >
        <div className="space-y-6">
          {/* Customer Metadata details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-850/40 rounded-2xl border border-slate-150 dark:border-slate-800">
            <div className="text-xs space-y-1">
              <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">Contact coordinates</span>
              <p className="font-bold text-slate-700 dark:text-slate-300">{selectedCustomer?.email}</p>
              <p className="font-medium text-slate-505 dark:text-slate-350">{selectedCustomer?.phone || 'No phone number provided'}</p>
            </div>
            <div className="text-xs space-y-1">
              <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">Registry metadata</span>
              <p className="font-medium text-slate-650 dark:text-slate-350">
                Registered: {selectedCustomer ? new Date(selectedCustomer.createdAt).toLocaleString() : ''}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span>Access Status:</span>
                {selectedCustomer && getStatusBadge(selectedCustomer.status)}
              </div>
            </div>
          </div>

          {/* Orders History list */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Purchase History Orders</h4>
            {loadingHistory ? (
              <div className="flex justify-center py-10">
                <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : customerOrders.length === 0 ? (
              <div className="text-center py-8 text-xs font-semibold text-slate-450 border border-dashed border-slate-200 rounded-2xl">
                No purchases recorded for this customer account.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200/50 dark:border-slate-800 bg-white/50 dark:bg-dark-950/20">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/50 dark:bg-slate-850/50 text-slate-400 dark:text-slate-450 font-bold uppercase tracking-wider text-[9px] border-b border-slate-200/40 dark:border-slate-800">
                      <th className="px-4 py-3">Order #</th>
                      <th className="px-4 py-3">Price</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Fulfillment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850/50">
                    {customerOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50/20">
                        <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">{ord.orderNumber}</td>
                        <td className="px-4 py-3 font-extrabold text-slate-800 dark:text-white">{currencySymbol}{parseFloat(ord.totalAmount).toFixed(2)}</td>
                        <td className="px-4 py-3 text-slate-450 font-medium">
                          {new Date(ord.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] uppercase font-bold text-brand-600 bg-brand-500/10 px-2 py-0.5 rounded">
                            {ord.orderStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </Modal>

      <DeleteModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, id: null, email: '' })}
        onConfirm={() => deleteCustomer(deleteModal.id, deleteModal.email)}
        title="Delete Customer"
        message={`Are you absolutely sure you want to delete "${deleteModal.email}"? All their data will be permanently removed.`}
      />

      <DeleteModal
        isOpen={statusModal.open}
        onClose={() => setStatusModal({ open: false, id: null, email: '', currentStatus: '' })}
        onConfirm={() => toggleStatus(statusModal.id, statusModal.currentStatus, statusModal.email)}
        title={statusModal.currentStatus === 'active' ? 'Block Customer Account' : 'Activate Customer Account'}
        message={`Are you sure you want to ${statusModal.currentStatus === 'active' ? 'block' : 'activate'} the account for "${statusModal.email}"?`}
      />
    </div>
  );
};

export default CustomerList;
