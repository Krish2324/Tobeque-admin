import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Search, Filter, ShoppingBag, IndianRupee, RefreshCw } from 'lucide-react';
import axios from 'axios';
import Table from '../components/Table';
import { useNotification } from '../context/NotificationContext';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState('DESC');

  const { showNotification } = useNotification();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/orders', {
        params: {
          page,
          limit,
          search,
          status: statusFilter,
          paymentStatus: paymentFilter,
          sortBy,
          sortDir
        }
      });
      if (res.data.success) {
        setOrders(res.data.data.orders);
        setTotalPages(res.data.data.pagination.pages);
        setTotalOrders(res.data.data.pagination.total);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      showNotification('Failed to retrieve orders list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, search, statusFilter, paymentFilter, sortBy, sortDir]);

  // Status Cell Badging
  const getStatusBadge = (status) => {
    let style = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-350';
    if (status === 'delivered') style = 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-450';
    if (status === 'processing') style = 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-450';
    if (status === 'shipped') style = 'bg-sky-50 text-sky-600 dark:bg-sky-950/20 dark:text-sky-450';
    if (status === 'pending') style = 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-450';
    if (status === 'cancelled' || status === 'returned') style = 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-450';

    return (
      <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold capitalize tracking-wide ${style}`}>
        {status}
      </span>
    );
  };

  // Payment Cell Badging
  const getPaymentBadge = (status) => {
    let style = 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-450';
    if (status === 'paid') style = 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-450';
    if (status === 'refunded') style = 'bg-slate-150 text-slate-600 dark:bg-slate-800 dark:text-slate-400';

    return (
      <span className={`px-2 py-0.5 rounded-lg text-[10px] uppercase font-bold tracking-wider ${style}`}>
        {status}
      </span>
    );
  };

  // Table Columns Map
  const columns = [
    {
      header: 'Order #',
      accessor: 'orderNumber',
      sortable: true,
      cell: (row) => <span className="font-extrabold text-slate-800 dark:text-white">{row.orderNumber}</span>
    },
    {
      header: 'Customer',
      accessor: 'userId',
      cell: (row) => (
        <div className="flex flex-col text-xs">
          <span className="font-bold text-slate-700 dark:text-slate-200">
            {row.user ? `${row.user.firstName} ${row.user.lastName}` : 'Anonymous'}
          </span>
          <span className="text-[10px] text-slate-450 dark:text-slate-450">{row.user?.email || 'No email'}</span>
        </div>
      )
    },
    {
      header: 'Total Cost',
      accessor: 'totalAmount',
      sortable: true,
      cell: (row) => <span className="font-extrabold text-slate-850 dark:text-white">${parseFloat(row.totalAmount).toFixed(2)}</span>
    },
    {
      header: 'Date',
      accessor: 'createdAt',
      sortable: true,
      cell: (row) => (
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          {new Date(row.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
        </span>
      )
    },
    {
      header: 'Fulfillment',
      accessor: 'orderStatus',
      cell: (row) => getStatusBadge(row.orderStatus)
    },
    {
      header: 'Payment',
      accessor: 'paymentStatus',
      cell: (row) => getPaymentBadge(row.paymentStatus)
    },
    {
      header: 'Invoice',
      accessor: 'id',
      cell: (row) => (
        <Link
          to={`/orders/${row.id}`}
          className="btn-secondary text-xs p-2 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-800"
        >
          <Eye className="w-4 h-4" />
          View Details
        </Link>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">Orders Board</h1>
          <p className="text-xs text-slate-450 dark:text-slate-400 font-medium">Process storefront transactions, coordinate trackings, print invoices, and restock catalog returns</p>
        </div>
        <button
          onClick={fetchOrders}
          className="btn-secondary text-xs flex items-center justify-center gap-1.5 py-2.5 px-4 border border-slate-200 dark:border-slate-850"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Orders
        </button>
      </div>

      {/* Advanced Filters */}
      <div className="glass-card p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="form-label text-xs">Search Keywords</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search order #, tracking #..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="form-input pl-9 text-xs"
            />
          </div>
        </div>

        <div>
          <label className="form-label text-xs">Fulfillment status</label>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="form-input text-xs h-[38px] py-1 bg-slate-50 dark:bg-slate-800"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="returned">Returned</option>
          </select>
        </div>

        <div>
          <label className="form-label text-xs">Payment Settlement</label>
          <select
            value={paymentFilter}
            onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
            className="form-input text-xs h-[38px] py-1 bg-slate-50 dark:bg-slate-800"
          >
            <option value="">All Payments</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid / Pending</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass-card p-6">
        <Table
          columns={columns}
          data={orders}
          loading={loading}
          pagination={{
            total: totalOrders,
            page,
            limit,
            pages: totalPages,
            onPageChange: (p) => setPage(p)
          }}
          sorting={{
            sortBy,
            sortDir,
            onSort: (col, dir) => {
              setSortBy(col);
              setSortDir(dir);
            }
          }}
          exportFileName="orders-board"
        />
      </div>
    </div>
  );
};

export default OrderList;
