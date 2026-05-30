import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Printer, Truck, FileText, User, ShoppingBag, CreditCard, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { useNotification } from '../context/NotificationContext';

const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Status controls state
  const [orderStatus, setOrderStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [shippingStatus, setShippingStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const { showNotification } = useNotification();

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/orders/${id}`);
      if (res.data.success) {
        const ord = res.data.order;
        setOrder(ord);
        setOrderStatus(ord.orderStatus);
        setPaymentStatus(ord.paymentStatus);
        setShippingStatus(ord.shippingStatus || 'pending');
        setTrackingNumber(ord.trackingNumber || '');
        setAdminNotes(ord.notes || '');
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
      showNotification('Failed to load order record details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  // Submit Order updates
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await axios.put(`/api/orders/${id}/status`, {
        orderStatus,
        paymentStatus,
        shippingStatus,
        trackingNumber,
        notes: adminNotes
      });
      if (res.data.success) {
        showNotification('Order status and logs successfully processed!', 'success');
        fetchOrderDetails(); // Reload details to show dynamic stocks replenishment
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to update order status.';
      showNotification(msg, 'error');
    } finally {
      setUpdating(false);
    }
  };

  // Open system print dialog
  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold text-slate-400">Loading order parameters...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <h3 className="text-sm font-bold text-slate-400">Order not found.</h3>
        <Link to="/orders" className="btn-primary text-xs mt-3 inline-flex">Go back</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Printable CSS Page Overrides */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          header, aside, .no-print {
            display: none !important;
          }
          .print-full {
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-4">
          <Link
            to="/orders"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-650 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-350 transition-colors"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">
              Order Details: {order.orderNumber}
            </h1>
            <p className="text-xs text-slate-450 dark:text-slate-400 font-medium">
              Registered on: {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="btn-primary py-2.5 px-4 rounded-xl text-sm font-semibold shadow-lg shadow-brand-500/20"
        >
          <Printer className="w-4.5 h-4.5" />
          Print / Save Receipt
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print-full">
        {/* Left Double Columns */}
        <div className="lg:col-span-2 space-y-6 print-full">
          
          {/* Purchased Items List */}
          <div className="glass-card p-6 space-y-4 print-full">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-850">
              <ShoppingBag className="w-5 h-5 text-brand-600 dark:text-brand-450" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">Purchased Products list</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-850 text-slate-400 dark:text-slate-450 font-bold uppercase tracking-wider text-[9px] pb-2">
                    <th className="pb-3">Product</th>
                    <th className="pb-3">SKU</th>
                    <th className="pb-3 text-center">Unit Price</th>
                    <th className="pb-3 text-center">Qty</th>
                    <th className="pb-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850/50">
                  {order.items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/10">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.product?.thumbnail || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100'}
                            alt={item.productName}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-800 no-print flex-shrink-0"
                          />
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-800 dark:text-white">{item.productName}</span>
                            {item.variants && (
                              <span className="text-[10px] text-slate-400 font-bold">
                                {Object.entries(item.variants).map(([k, v]) => `${k}: ${v}`).join(', ')}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 font-semibold text-slate-500 dark:text-slate-400 uppercase">{item.sku}</td>
                      <td className="py-4 text-center font-bold text-slate-700 dark:text-slate-200">₹{parseFloat(item.price).toFixed(2)}</td>
                      <td className="py-4 text-center font-semibold text-slate-800 dark:text-white">{item.quantity}</td>
                      <td className="py-4 text-right font-extrabold text-slate-850 dark:text-white">
                        ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Subtotals and totals column */}
            <div className="border-t border-slate-100 dark:border-slate-850 pt-4 flex flex-col items-end gap-2 text-xs">
              <div className="flex justify-between w-64 text-slate-450 dark:text-slate-400">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-750 dark:text-slate-300">₹{parseFloat(order.subtotal).toFixed(2)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between w-64 text-rose-500">
                  <span>Discounts Applied:</span>
                  <span className="font-semibold">-₹{parseFloat(order.discountAmount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between w-64 text-slate-450 dark:text-slate-400">
                <span>Sales Tax:</span>
                <span className="font-semibold text-slate-750 dark:text-slate-300">₹{parseFloat(order.taxAmount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-64 text-slate-450 dark:text-slate-400">
                <span>Shipping cost:</span>
                <span className="font-semibold text-slate-750 dark:text-slate-300">₹{parseFloat(order.shippingCost).toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-64 text-sm font-extrabold text-slate-850 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span>Grand Total:</span>
                <span>₹{parseFloat(order.totalAmount).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Addresses and invoice meta columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 print-full">
            {/* Billing */}
            <div className="glass-card p-6 space-y-3">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-850">
                <FileText className="w-4 h-4 text-indigo-500" />
                <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Billing Coordinates</h4>
              </div>
              {order.billingAddress ? (
                <div className="text-xs text-slate-650 dark:text-slate-350 space-y-1 leading-relaxed">
                  <p className="font-bold text-slate-800 dark:text-white">{order.billingAddress.name}</p>
                  <p>{order.billingAddress.street}</p>
                  <p>{order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.zip}</p>
                  <p>{order.billingAddress.country}</p>
                </div>
              ) : (
                <span className="text-xs text-slate-400">No Billing Address provided.</span>
              )}
            </div>

            {/* Shipping */}
            <div className="glass-card p-6 space-y-3">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-850">
                <Truck className="w-4 h-4 text-sky-500" />
                <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Shipping Destination</h4>
              </div>
              {order.shippingAddress ? (
                <div className="text-xs text-slate-650 dark:text-slate-350 space-y-1 leading-relaxed">
                  <p className="font-bold text-slate-800 dark:text-white">{order.shippingAddress.name}</p>
                  <p>{order.shippingAddress.street}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              ) : (
                <span className="text-xs text-slate-400">No Shipping Address provided.</span>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar Column - Management Tools */}
        <div className="space-y-6 no-print">
          
          {/* Order Fulfilment Actions */}
          <div className="glass-card p-6 space-y-5">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-850">
              Fulfilment Controls
            </h3>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="form-label text-xs">Fulfillment status</label>
                <select
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                  className="form-input text-xs h-[38px] py-1 bg-slate-50 dark:bg-slate-800"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled (Triggers Restock)</option>
                  <option value="returned">Returned (Triggers Restock)</option>
                </select>
              </div>

              <div>
                <label className="form-label text-xs">Payment Settlement</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="form-input text-xs h-[38px] py-1 bg-slate-50 dark:bg-slate-800"
                >
                  <option value="pending">Pending / Unpaid</option>
                  <option value="paid">Paid</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              <div>
                <label className="form-label text-xs">Logistics status</label>
                <select
                  value={shippingStatus}
                  onChange={(e) => setShippingStatus(e.target.value)}
                  className="form-input text-xs h-[38px] py-1 bg-slate-50 dark:bg-slate-800"
                >
                  <option value="pending">Pending</option>
                  <option value="packing">Packing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="returned">Returned</option>
                </select>
              </div>

              <div>
                <label className="form-label text-xs">Logistics Tracking Number</label>
                <input
                  type="text"
                  placeholder="EX: UPS-98234823"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="form-input text-xs"
                />
              </div>

              <div>
                <label className="form-label text-xs">Fulfillment Notes (Admin private logs)</label>
                <textarea
                  rows={3}
                  placeholder="Private comments on order history..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="form-input text-xs resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={updating}
                className="btn-primary w-full text-xs py-2.5 font-semibold shadow-lg shadow-brand-500/20"
              >
                {updating ? 'Processing logistics...' : 'Process Order Fulfilment'}
              </button>
            </form>
          </div>

          {/* Customer Metadata Card */}
          <div className="glass-card p-6 space-y-4.5">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-850">
              Customer Profile
            </h3>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-500/10 text-brand-650 flex items-center justify-center font-bold text-sm">
                {order.user?.firstName ? order.user.firstName.substring(0, 1).toUpperCase() : 'C'}
              </div>
              <div className="flex flex-col text-xs overflow-hidden">
                <span className="font-bold text-slate-850 dark:text-white">
                  {order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Guest checkout'}
                </span>
                <span className="text-[10px] text-slate-450 dark:text-slate-450 truncate">{order.user?.email}</span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-650 dark:text-slate-350 border-t border-slate-100 dark:border-slate-850 pt-3">
              <div className="flex justify-between">
                <span>Phone:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-300">{order.user?.phone || 'No phone'}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment method:</span>
                <span className="font-bold text-brand-600 dark:text-brand-450 uppercase">{order.paymentMethod || 'Stripe'}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
