import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  IndianRupee, ShoppingCart, Users, Package, AlertOctagon,
  ArrowRight, ShoppingBag, Eye, ShieldAlert, Calendar
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell
} from 'recharts';
import axios from 'axios';
import StatsCard from '../components/StatsCard';
import { SkeletonDashboard } from '../components/Skeleton';
import { useNotification } from '../context/NotificationContext';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/dashboard/stats');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching dashboard statistics:', err);
        showNotification('Unable to fetch live analytics data.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [showNotification]);

  if (loading || !stats) {
    return <SkeletonDashboard />;
  }

  const { widgets, lowStock, topProducts, latestOrders, monthlySalesChart, recentActivity } = stats;

  // Custom status badge mapping
  const getStatusBadge = (status) => {
    let style = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-350';
    if (status === 'delivered') style = 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-450';
    if (status === 'processing') style = 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-450';
    if (status === 'shipped') style = 'bg-sky-50 text-sky-600 dark:bg-sky-950/20 dark:text-sky-450';
    if (status === 'pending') style = 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-450';
    if (status === 'cancelled' || status === 'returned') style = 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-450';
    
    return (
      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize tracking-wide ${style}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header with timestamp */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">Dashboard Overview</h1>
          <p className="text-xs text-slate-450 dark:text-slate-400 font-medium">Real-time storefront metrics and logistics audits</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-600 dark:text-emerald-450 text-[10px] font-extrabold uppercase tracking-wider shadow-sm select-none">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Syncing
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3.5 py-2 shadow-sm dark:bg-dark-850 dark:border-slate-800/80">
            <Calendar className="w-4 h-4 text-brand-500" />
            <span>Today: {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Stats Widgets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Gross Revenue"
          value={`₹${widgets.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={IndianRupee}
          trend={{ type: 'up', value: '14.2%' }}
          description="versus past month"
          color="emerald"
        />
        <StatsCard
          title="Total Store Orders"
          value={widgets.totalOrders}
          icon={ShoppingCart}
          trend={{ type: 'up', value: '8.5%' }}
          description="weekly order volume"
          color="brand"
        />
        <StatsCard
          title="Active Customers"
          value={widgets.totalCustomers}
          icon={Users}
          trend={{ type: 'up', value: '11.8%' }}
          description="registered users base"
          color="sky"
        />
        <StatsCard
          title="Catalog Offerings"
          value={widgets.totalProducts}
          icon={Package}
          description="active products catalog"
          color="amber"
        />
      </div>

      {/* Quick Insights Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-5 bg-white dark:bg-dark-850 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl shadow-sm">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Avg Order Value (AOV)</span>
          <span className="text-sm font-extrabold text-slate-800 dark:text-white">₹823.61</span>
          <span className="text-[9px] font-bold text-emerald-500">+1.2% this week</span>
        </div>
        <div className="flex flex-col gap-0.5 border-l border-slate-100 dark:border-slate-800/80 pl-4">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Conversion Ratio</span>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-extrabold text-slate-800 dark:text-white">3.84%</span>
            <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1 py-0.2 rounded">+0.8%</span>
          </div>
          <span className="text-[9px] font-bold text-slate-400">Industry standard: 2.5%</span>
        </div>
        <div className="flex flex-col gap-0.5 border-l border-slate-100 dark:border-slate-800/80 pl-4">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Cart Abandonment</span>
          <span className="text-sm font-extrabold text-slate-800 dark:text-white">12.5%</span>
          <span className="text-[9px] font-bold text-emerald-500">Decreased by 3.2%</span>
        </div>
        <div className="flex flex-col gap-0.5 border-l border-slate-100 dark:border-slate-800/80 pl-4">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Fulfillment SLA</span>
          <span className="text-sm font-extrabold text-brand-600 dark:text-brand-450">99.98%</span>
          <span className="text-[9px] font-bold text-slate-400">Target score: 98%</span>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Revenue spline chart */}
        <div className="glass-card p-6 lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Gross Revenue spline chart</h3>
            <span className="text-[10px] uppercase font-bold text-brand-600 dark:text-brand-450 tracking-wider">Historical monthly aggregation</span>
          </div>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlySalesChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800/40" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }} 
                />
                <Area type="monotone" dataKey="sales" name="Revenue (₹)" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top sold products bar chart */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Popular Catalog Items</h3>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-450 tracking-wider mt-0.5">Top performing products sales volumes</span>
          </div>
          
          <div className="space-y-4.5 my-4.5 flex-1 flex flex-col justify-center">
            {topProducts.length === 0 ? (
              <div className="text-center py-8 text-xs font-semibold text-slate-400">No popular sales catalog items yet.</div>
            ) : (
              topProducts.map((prod, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <img 
                      src={prod.product?.thumbnail || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100'} 
                      alt={prod.productName} 
                      className="w-9 h-9 rounded-xl object-cover border border-slate-100 dark:border-slate-800 flex-shrink-0"
                    />
                    <div className="flex flex-col truncate">
                      <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">{prod.productName}</span>
                      <span className="text-[10px] text-slate-450 dark:text-slate-400 uppercase font-bold tracking-wider">{prod.sku}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end flex-shrink-0">
                    <span className="font-extrabold text-slate-800 dark:text-white">{prod.totalSold} sold</span>
                    <span className="text-[10px] text-slate-450 dark:text-slate-450 font-bold">₹{parseFloat(prod.totalRevenue).toLocaleString()} rev</span>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <Link to="/products" className="btn-secondary text-xs flex items-center justify-center gap-1.5 py-2.5">
            View All Products
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Alerts and Logs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest transactions feed */}
        <div className="glass-card p-6 lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Recent Transactions</h3>
            <Link to="/orders" className="text-xs font-bold text-brand-600 hover:text-brand-700 dark:text-brand-450 dark:hover:text-brand-400 flex items-center gap-1">
              Fulfillment Board
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/60 text-slate-400 dark:text-slate-450 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3.5">Order</th>
                  <th className="pb-3.5">Customer</th>
                  <th className="pb-3.5">Settlement</th>
                  <th className="pb-3.5">Status</th>
                  <th className="pb-3.5 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850/50">
                {latestOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/20 dark:hover:bg-slate-850/10">
                    <td className="py-3 font-semibold text-slate-700 dark:text-slate-200">{ord.orderNumber}</td>
                    <td className="py-3 font-medium">
                      <div className="flex flex-col">
                        <span>{ord.user ? `${ord.user.firstName} ${ord.user.lastName}` : 'Anonymous User'}</span>
                        <span className="text-[10px] text-slate-400">{ord.user?.email}</span>
                      </div>
                    </td>
                    <td className="py-3 font-extrabold text-slate-800 dark:text-white">₹{parseFloat(ord.totalAmount).toFixed(2)}</td>
                    <td className="py-3">{getStatusBadge(ord.orderStatus)}</td>
                    <td className="py-3 text-right">
                      <Link to={`/orders/${ord.id}`} className="inline-flex p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-350 dark:hover:text-white">
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low inventory alerts panel */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Low Inventory Alerts</h3>
            </div>
            <p className="text-[10px] text-slate-450 dark:text-slate-400">Products with stock under threshold units.</p>
          </div>

          <div className="space-y-4 my-4 flex-1">
            {lowStock.length === 0 ? (
              <div className="text-center py-8 text-xs font-semibold text-slate-450">All products catalog fully stocked.</div>
            ) : (
              lowStock.map((prod) => (
                <div key={prod.id} className="flex items-center justify-between gap-3 text-xs p-2 rounded-xl bg-rose-500/5 border border-rose-500/10">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <img 
                      src={prod.thumbnail || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'} 
                      alt={prod.name} 
                      className="w-9 h-9 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="flex flex-col truncate">
                      <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">{prod.name}</span>
                      <span className="text-[10px] text-slate-450 dark:text-slate-450 uppercase font-bold tracking-wider">{prod.sku}</span>
                    </div>
                  </div>
                  <span className="flex-shrink-0 font-extrabold text-rose-650 dark:text-rose-450 bg-rose-50 dark:bg-rose-950/20 px-2 py-0.5 rounded-lg border border-rose-500/10">
                    {prod.stockQuantity} left
                  </span>
                </div>
              ))
            )}
          </div>

          <Link to="/inventory" className="btn-secondary text-rose-500 dark:text-rose-400 hover:bg-rose-500/5 active:bg-rose-500/10 text-xs flex items-center justify-center gap-1.5 py-2.5">
            Audit Stock Levels
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
      
      {/* Activity Logs row */}
      <div className="glass-card p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">Recent Operator logs</h3>
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-450 tracking-wider">Live audits stream</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentActivity.map((log) => (
            <div key={log.id} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50/50 hover:bg-white dark:bg-dark-850/30 dark:hover:bg-dark-850 border border-slate-100 hover:border-brand-500/20 dark:border-slate-800/40 dark:hover:border-brand-500/20 text-xs shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-300 group cursor-default">
              <span className="px-2 py-0.5 rounded-lg bg-brand-500/10 text-brand-600 font-bold uppercase tracking-wider text-[8px] flex-shrink-0 mt-0.5 group-hover:bg-brand-500 group-hover:text-white transition-all duration-300">
                {log.entityType}
              </span>
              <div className="flex-grow flex flex-col gap-1 overflow-hidden">
                <span className="font-semibold text-slate-700 dark:text-slate-200 leading-normal truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-all duration-300">{log.action}</span>
                <span className="text-[10px] text-slate-400">{new Date(log.createdAt).toLocaleTimeString()} - {new Date(log.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
