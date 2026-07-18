import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Truck, FileText, User, ShoppingBag, CreditCard, ChevronRight, Trash2, Package, Tag, MapPin, Calendar, RefreshCw, X, ExternalLink, CheckCircle2, Clock, AlertCircle, Zap } from 'lucide-react';
import axios from 'axios';
import { useNotification } from '../context/NotificationContext';
import { useCurrency } from '../context/CurrencyContext';
import DeleteModal from '../components/DeleteModal';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currencySymbol } = useCurrency();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Status controls state
  const [orderStatus, setOrderStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [shippingStatus, setShippingStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  // ── Shiprocket state ────────────────────────────────────────────────────────
  const [srStatus, setSrStatus] = useState(null);         // Shiprocket status object
  const [srLoading, setSrLoading] = useState(false);       // General SR loading
  const [srActionLoading, setSrActionLoading] = useState(null); // Which action is loading
  const [pickupDate, setPickupDate] = useState('');         // For schedule pickup
  const [tracking, setTracking] = useState(null);          // Live tracking data
  const [showTracking, setShowTracking] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, type: null }); // type: 'order' | 'cancel'

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
        setAdminNotes(ord.adminNotes || '');
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
      showNotification('Failed to load order record details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ── Fetch Shiprocket Status ─────────────────────────────────────────────────
  const fetchSrStatus = useCallback(async () => {
    setSrLoading(true);
    try {
      const res = await axios.get(`/api/shipping/orders/${id}/status`);
      if (res.data.success) {
        setSrStatus(res.data.shiprocket);
      }
    } catch (err) {
      // If 404 or error, SR is just not configured yet — not a user-facing error
      console.warn('Shiprocket status fetch failed:', err.response?.data?.error || err.message);
    } finally {
      setSrLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrderDetails();
    fetchSrStatus();
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
        adminNotes
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

  // ── Shiprocket Action Handler ───────────────────────────────────────────────
  const handleSrAction = async (actionKey, requestFn) => {
    setSrActionLoading(actionKey);
    try {
      await requestFn();
      await fetchSrStatus(); // Refresh SR status after action
    } catch (err) {
      // errors shown by individual functions
    } finally {
      setSrActionLoading(null);
    }
  };

  const pushToShiprocket = () => handleSrAction('push', async () => {
    const res = await axios.post(`/api/shipping/orders/${id}/push`);
    if (res.data.success) showNotification(res.data.message, 'success');
    else showNotification(res.data.error || 'Push failed', 'error');
  });

  const assignCourier = () => handleSrAction('assign', async () => {
    try {
      const res = await axios.post(`/api/shipping/orders/${id}/assign-courier`);
      if (res.data.success) showNotification(`AWB generated: ${res.data.awbCode} via ${res.data.courierName}`, 'success');
      else showNotification(res.data.error || 'Courier assignment failed', 'error');
    } catch (err) {
      showNotification(err.response?.data?.error || 'Courier assignment failed', 'error');
    }
  });

  const doSchedulePickup = () => {
    if (!pickupDate) { showNotification('Please select a pickup date', 'error'); return; }
    handleSrAction('pickup', async () => {
      try {
        const res = await axios.post(`/api/shipping/orders/${id}/schedule-pickup`, { pickupDate });
        if (res.data.success) showNotification(res.data.message, 'success');
        else showNotification(res.data.error || 'Pickup scheduling failed', 'error');
      } catch (err) {
        showNotification(err.response?.data?.error || 'Pickup scheduling failed', 'error');
      }
    });
  };

  const generateLabel = () => handleSrAction('label', async () => {
    try {
      const res = await axios.post(`/api/shipping/orders/${id}/generate-label`);
      if (res.data.success) {
        showNotification('Shipping label generated!', 'success');
        if (res.data.labelUrl) window.open(res.data.labelUrl, '_blank');
      } else showNotification(res.data.error || 'Label generation failed', 'error');
    } catch (err) {
      showNotification(err.response?.data?.error || 'Label generation failed', 'error');
    }
  });

  const generateManifest = () => handleSrAction('manifest', async () => {
    try {
      const res = await axios.post(`/api/shipping/orders/${id}/generate-manifest`);
      if (res.data.success) {
        showNotification('Manifest generated!', 'success');
        if (res.data.manifestUrl) window.open(res.data.manifestUrl, '_blank');
      } else showNotification(res.data.error || 'Manifest generation failed', 'error');
    } catch (err) {
      showNotification(err.response?.data?.error || 'Manifest generation failed', 'error');
    }
  });

  const fetchTracking = () => handleSrAction('track', async () => {
    try {
      const res = await axios.get(`/api/shipping/orders/${id}/track`);
      if (res.data.success) {
        setTracking(res.data);
        setShowTracking(true);
      } else showNotification(res.data.error || 'Tracking failed', 'error');
    } catch (err) {
      showNotification(err.response?.data?.error || 'Tracking failed', 'error');
    }
  });

  const cancelSrOrder = () => {
    setDeleteModal({ open: true, type: 'cancel' });
  };

  const confirmCancelSrOrder = () => {
    setDeleteModal({ open: false, type: null });
    handleSrAction('cancel', async () => {
      try {
        const res = await axios.post(`/api/shipping/orders/${id}/cancel`);
        if (res.data.success) showNotification('Shiprocket shipment cancelled.', 'success');
        else showNotification(res.data.error || 'Cancellation failed', 'error');
      } catch (err) {
        showNotification(err.response?.data?.error || 'Cancellation failed', 'error');
      }
    });
  };

  const handleDeleteOrder = async () => {
    try {
      const res = await axios.delete(`/api/orders/${id}`);
      if (res.data.success) {
        showNotification('Order deleted successfully', 'success');
        navigate('/orders');
      }
    } catch (err) {
      showNotification('Failed to delete order', 'error');
    } finally {
      setDeleteModal({ open: false, type: null });
    }
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

        <div className="flex gap-2">
          <button
            onClick={() => setDeleteModal({ open: true, type: 'order' })}
            className="bg-rose-500 hover:bg-rose-600 text-white py-2.5 px-4 rounded-xl text-sm font-semibold shadow-lg shadow-rose-500/20 flex items-center gap-2 transition-colors"
          >
            <Trash2 className="w-4.5 h-4.5" />
            Delete Order
          </button>
          <button
            onClick={handlePrint}
            className="btn-primary py-2.5 px-4 rounded-xl text-sm font-semibold shadow-lg shadow-brand-500/20 flex items-center gap-2"
          >
            <Printer className="w-4.5 h-4.5" />
            Print / Save Receipt
          </button>
        </div>
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
                            {item.variantDetails && (
                              <span className="text-[10px] text-slate-400 font-bold">
                                {Object.entries(item.variantDetails).map(([k, v]) => `${k}: ${v}`).join(', ')}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 font-semibold text-slate-500 dark:text-slate-400 uppercase">{item.sku}</td>
                      <td className="py-4 text-center font-bold text-slate-700 dark:text-slate-200">{currencySymbol}{parseFloat(item.price).toFixed(2)}</td>
                      <td className="py-4 text-center font-semibold text-slate-800 dark:text-white">{item.quantity}</td>
                      <td className="py-4 text-right font-extrabold text-slate-850 dark:text-white">
                        {currencySymbol}{(parseFloat(item.price) * item.quantity).toFixed(2)}
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
                <span className="font-semibold text-slate-750 dark:text-slate-300">{currencySymbol}{parseFloat(order.subtotal).toFixed(2)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between w-64 text-rose-500">
                  <span>Discounts Applied {order.couponCode && `(${order.couponCode})`}:</span>
                  <span className="font-semibold">-{currencySymbol}{parseFloat(order.discountAmount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between w-64 text-slate-450 dark:text-slate-400">
                <span>Sales Tax:</span>
                <span className="font-semibold text-slate-750 dark:text-slate-300">{currencySymbol}{parseFloat(order.taxAmount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-64 text-slate-450 dark:text-slate-400">
                <span>Shipping cost:</span>
                <span className="font-semibold text-slate-750 dark:text-slate-300">{currencySymbol}{parseFloat(order.shippingCost).toFixed(2)}</span>
              </div>
              <div className="flex justify-between w-64 text-sm font-extrabold text-slate-850 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span>Grand Total:</span>
                <span>{currencySymbol}{parseFloat(order.totalAmount).toFixed(2)}</span>
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
          
          {/* Customer Order Notes */}
          {order.notes && (
            <div className="glass-card p-6 space-y-3 print-full">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-850">
                <FileText className="w-4 h-4 text-amber-500" />
                <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Customer Order Notes</h4>
              </div>
              <div className="text-xs text-slate-650 dark:text-slate-350 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30">
                <p className="italic">"{order.notes}"</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar Column - Management Tools */}
        <div className="space-y-6 no-print">

          {/* ── Shiprocket Shipping Panel ───────────────────────────────────── */}
          <div className="glass-card p-6 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-850">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-orange-500 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-white" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Shiprocket Shipping</h3>
              </div>
              {srStatus?.isPushed && (
                <button
                  onClick={fetchSrStatus}
                  disabled={srLoading}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Refresh Shiprocket status"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${srLoading ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>

            {/* SR Status Badge */}
            {srStatus?.isPushed && srStatus.status && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/30">
                <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                <span className="text-xs font-semibold text-orange-700 dark:text-orange-400 uppercase tracking-wide">
                  {srStatus.status}
                </span>
              </div>
            )}

            {/* SR IDs + AWB Info */}
            {srStatus?.isPushed && (
              <div className="space-y-2 text-[11px] text-slate-550 dark:text-slate-400">
                {srStatus.orderId && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">SR Order ID</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-200">#{srStatus.orderId}</span>
                  </div>
                )}
                {srStatus.shipmentId && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Shipment ID</span>
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{srStatus.shipmentId}</span>
                  </div>
                )}
                {srStatus.awb && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">AWB Number</span>
                    <span className="font-mono font-bold text-sky-600 dark:text-sky-400">{srStatus.awb}</span>
                  </div>
                )}
                {srStatus.courierName && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Courier</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{srStatus.courierName}</span>
                  </div>
                )}
                {srStatus.pickupDate && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Pickup Date</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{srStatus.pickupDate}</span>
                  </div>
                )}
              </div>
            )}

            {/* ── Action Buttons ── */}
            <div className="space-y-2.5 pt-1">

              {/* Step 1: Push to Shiprocket */}
              {!srStatus?.isPushed ? (
                <button
                  onClick={pushToShiprocket}
                  disabled={srActionLoading === 'push'}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white transition-colors shadow-lg shadow-orange-500/25 disabled:opacity-60"
                >
                  {srActionLoading === 'push' ? (
                    <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Pushing to Shiprocket...</>
                  ) : (
                    <><Package className="w-3.5 h-3.5" />Push Order to Shiprocket</>
                  )}
                </button>
              ) : (
                <>
                  {/* Step 2: Assign Courier */}
                  {!srStatus?.awb && (
                    <button
                      onClick={assignCourier}
                      disabled={!!srActionLoading}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold bg-indigo-500 hover:bg-indigo-600 text-white transition-colors shadow-lg shadow-indigo-500/25 disabled:opacity-60"
                    >
                      {srActionLoading === 'assign' ? (
                        <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Assigning Courier...</>
                      ) : (
                        <><Tag className="w-3.5 h-3.5" />Assign Courier & Generate AWB</>
                      )}
                    </button>
                  )}

                  {/* Step 3: Schedule Pickup */}
                  {srStatus?.awb && !srStatus?.pickupDate && (
                    <div className="space-y-2">
                      <label className="form-label text-[11px]">Pickup Date</label>
                      <input
                        type="date"
                        value={pickupDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setPickupDate(e.target.value)}
                        className="form-input text-xs h-[36px] py-1 bg-slate-50 dark:bg-slate-800"
                      />
                      <button
                        onClick={doSchedulePickup}
                        disabled={!!srActionLoading}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-600 text-white transition-colors shadow-lg shadow-sky-500/25 disabled:opacity-60"
                      >
                        {srActionLoading === 'pickup' ? (
                          <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Scheduling...</>
                        ) : (
                          <><Calendar className="w-3.5 h-3.5" />Schedule Pickup</>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Utility Actions Row */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={generateLabel}
                      disabled={!!srActionLoading}
                      className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors disabled:opacity-60"
                    >
                      {srActionLoading === 'label' ? (
                        <span className="w-3 h-3 border-2 border-emerald-400/30 border-t-emerald-500 rounded-full animate-spin" />
                      ) : (
                        <FileText className="w-3.5 h-3.5" />
                      )}
                      Label
                    </button>
                    <button
                      onClick={generateManifest}
                      disabled={!!srActionLoading}
                      className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-[11px] font-semibold bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-800 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors disabled:opacity-60"
                    >
                      {srActionLoading === 'manifest' ? (
                        <span className="w-3 h-3 border-2 border-violet-400/30 border-t-violet-500 rounded-full animate-spin" />
                      ) : (
                        <Package className="w-3.5 h-3.5" />
                      )}
                      Manifest
                    </button>
                  </div>

                  {/* Label Direct Link */}
                  {srStatus?.labelUrl && (
                    <a
                      href={srStatus.labelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open Shipping Label PDF
                    </a>
                  )}

                  {/* Track */}
                  {srStatus?.awb && (
                    <button
                      onClick={fetchTracking}
                      disabled={!!srActionLoading}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors disabled:opacity-60"
                    >
                      {srActionLoading === 'track' ? (
                        <><span className="w-3.5 h-3.5 border-2 border-amber-400/30 border-t-amber-500 rounded-full animate-spin" />Fetching...</>
                      ) : (
                        <><Truck className="w-3.5 h-3.5" />Live Track Shipment</>
                      )}
                    </button>
                  )}

                  {/* Cancel */}
                  {srStatus?.status !== 'CANCELLED' && (
                    <button
                      onClick={cancelSrOrder}
                      disabled={!!srActionLoading}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-[11px] font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-900/30 transition-colors disabled:opacity-60"
                    >
                      {srActionLoading === 'cancel' ? (
                        <><span className="w-3 h-3 border-2 border-red-400/30 border-t-red-500 rounded-full animate-spin" />Cancelling...</>
                      ) : (
                        <><X className="w-3.5 h-3.5" />Cancel Shiprocket Shipment</>
                      )}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* ── Live Tracking Modal / Panel ──────────────────────────────────── */}
          {showTracking && tracking && (
            <div className="glass-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-sky-500" />
                  Live Tracking — {tracking.awb}
                </h4>
                <button
                  onClick={() => setShowTracking(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              {tracking.courier && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{tracking.courier}</p>
              )}
              {/* Show raw status if available */}
              {tracking.tracking?.tracking_data?.shipment_track?.[0] && (
                <div className="space-y-1.5">
                  {[
                    ['Status', tracking.tracking?.tracking_data?.shipment_track?.[0]?.current_status],
                    ['EDD', tracking.tracking?.tracking_data?.shipment_track?.[0]?.etd],
                    ['AWB Date', tracking.tracking?.tracking_data?.shipment_track?.[0]?.awb_assign_date]
                  ].map(([label, val]) => val ? (
                    <div key={label} className="flex justify-between text-[11px]">
                      <span className="text-slate-400">{label}</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{val}</span>
                    </div>
                  ) : null)}
                </div>
              )}
              {/* Scans timeline */}
              {tracking.tracking?.tracking_data?.shipment_track_activities?.length > 0 && (
                <div className="space-y-2 pt-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Activity Log</p>
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                    {tracking.tracking.tracking_data.shipment_track_activities.slice(0, 8).map((scan, i) => (
                      <div key={i} className="flex gap-2 text-[10px]">
                        <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-sky-400 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-slate-700 dark:text-slate-200">{scan['sr-status-label'] || scan.status}</p>
                          <p className="text-slate-400">{scan.location} · {scan.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

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

      <DeleteModal
        isOpen={deleteModal.open && deleteModal.type === 'order'}
        onClose={() => setDeleteModal({ open: false, type: null })}
        onConfirm={handleDeleteOrder}
        title="Delete Order"
        message="Are you sure you want to permanently delete this order? This action cannot be undone."
      />

      <DeleteModal
        isOpen={deleteModal.open && deleteModal.type === 'cancel'}
        onClose={() => setDeleteModal({ open: false, type: null })}
        onConfirm={confirmCancelSrOrder}
        title="Cancel Shiprocket Shipment"
        message="Are you sure you want to cancel this shipment on Shiprocket? This action cannot be undone and the AWB will be released."
      />
    </div>
  );
};

export default OrderDetail;
