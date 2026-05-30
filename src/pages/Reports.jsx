import React, { useState, useEffect } from 'react';
import { FileBarChart, Calendar, Download, TrendingUp, IndianRupee, Tag, Truck } from 'lucide-react';
import axios from 'axios';
import Table from '../components/Table';
import StatsCard from '../components/StatsCard';
import { useNotification } from '../context/NotificationContext';

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [orders, setOrders] = useState([]);
  const [productSales, setProductSales] = useState([]);
  
  // Date states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { showNotification } = useNotification();

  // Set default date range to last 30 days
  useEffect(() => {
    const end = new Date().toISOString().substring(0, 10);
    const start = new Date();
    start.setDate(start.getDate() - 30);
    setStartDate(start.toISOString().substring(0, 10));
    setEndDate(end);
  }, []);

  const handleGenerateReport = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.get('/api/reports/sales', {
        params: { startDate, endDate }
      });
      if (res.data.success) {
        setSummary(res.data.data.summary);
        setOrders(res.data.data.orders);
        setProductSales(res.data.data.productSales);
        showNotification('Financial report generated successfully!', 'success');
      }
    } catch (err) {
      console.error('Error compiling reports:', err);
      showNotification('Failed to generate sales report.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      handleGenerateReport();
    }
  }, [startDate, endDate]);

  const columns = [
    {
      header: 'Order #',
      accessor: 'orderNumber',
      cell: (row) => <span className="font-extrabold text-slate-800 dark:text-white">{row.orderNumber}</span>
    },
    {
      header: 'Customer Email',
      accessor: 'userId',
      cell: (row) => <span className="text-xs text-slate-500">{row.user?.email || 'Guest checkout'}</span>
    },
    {
      header: 'Tax Amount',
      accessor: 'taxAmount',
      cell: (row) => <span className="text-xs text-slate-650">₹{parseFloat(row.taxAmount).toFixed(2)}</span>
    },
    {
      header: 'Shipping Fee',
      accessor: 'shippingCost',
      cell: (row) => <span className="text-xs text-slate-600">₹{parseFloat(row.shippingCost).toFixed(2)}</span>
    },
    {
      header: 'Promo Discount',
      accessor: 'discountAmount',
      cell: (row) => <span className="text-xs text-rose-500">-₹{parseFloat(row.discountAmount).toFixed(2)}</span>
    },
    {
      header: 'Settlement Amount',
      accessor: 'totalAmount',
      cell: (row) => <span className="font-extrabold text-slate-800 dark:text-white">₹{parseFloat(row.totalAmount).toFixed(2)}</span>
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">Reports & Financial Analytics</h1>
        <p className="text-xs text-slate-450 dark:text-slate-400 font-medium">Verify tax summaries, promotions values, shipping rates, and download sales spreadsheets</p>
      </div>

      {/* Date filter pickers */}
      <div className="glass-card p-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <form onSubmit={handleGenerateReport} className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-grow md:max-w-xl">
          <div>
            <label className="form-label text-xs">Start Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="form-input pl-9 text-xs"
              />
            </div>
          </div>
          <div>
            <label className="form-label text-xs">End Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="form-input pl-9 text-xs"
              />
            </div>
          </div>
        </form>

        <button
          onClick={handleGenerateReport}
          disabled={loading}
          className="btn-primary py-2.5 px-6 rounded-xl text-xs font-semibold shadow-lg shadow-brand-500/20"
        >
          {loading ? 'Compiling figures...' : 'Update Custom Range'}
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Settle Revenue Amount"
            value={`₹${summary.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            icon={IndianRupee}
            description="gross settlement in range"
            color="emerald"
          />
          <StatsCard
            title="Average Ticket Sales"
            value={`₹${summary.averageOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            icon={TrendingUp}
            description="order checkout mean size"
            color="brand"
          />
          <StatsCard
            title="Total Tax Collected"
            value={`₹${summary.totalTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            icon={FileBarChart}
            description="sales and regional VAT tax"
            color="sky"
          />
          <StatsCard
            title="Coupons Discount values"
            value={`₹${summary.totalDiscounts.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            icon={Tag}
            description="promo codes deductions"
            color="rose"
          />
        </div>
      )}

      {/* Main itemized listings */}
      <div className="glass-card p-6 flex flex-col gap-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-850">
          Itemized Settled Sales
        </h3>
        <Table
          columns={columns}
          data={orders}
          loading={loading}
          exportFileName={`sales-financial-report-${startDate}-to-${endDate}`}
        />
      </div>
    </div>
  );
};

export default Reports;
