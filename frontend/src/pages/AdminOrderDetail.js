import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import InvoiceDetails from '../components/InvoiceDetails';
import ShippingLabel from '../components/admin/ShippingLabel';
import OrderTracking from '../components/admin/OrderTracking';
import { adminAPI } from '../utils/api';
import { FiArrowLeft, FiCheckCircle, FiClock, FiPackage, FiTruck, FiX, FiMapPin, FiUser, FiMail, FiPhone } from 'react-icons/fi';

const statusConfig = {
  pending:     { color: '#FFB800', bg: '#FFFBEB', icon: <FiClock size={16} />, label: 'Pending' },
  confirmed:   { color: '#3B82F6', bg: '#EFF6FF', icon: <FiPackage size={16} />, label: 'Confirmed' },
  processing:  { color: '#8B5CF6', bg: '#F5F3FF', icon: <FiPackage size={16} />, label: 'Processing' },
  packed:      { color: '#0F766E', bg: '#CCFBF1', icon: <FiPackage size={16} />, label: 'Packed' },
  shipped:     { color: '#F97316', bg: '#FFF7ED', icon: <FiTruck size={16} />, label: 'Shipped' },
  out_for_delivery: { color: '#0369A1', bg: '#E0F2FE', icon: <FiTruck size={16} />, label: 'Out for Delivery' },
  delivered:   { color: '#10B981', bg: '#ECFDF5', icon: <FiCheckCircle size={16} />, label: 'Delivered' },
  cancelled:   { color: '#EF4444', bg: '#FEF2F2', icon: <FiX size={16} />, label: 'Cancelled' },
};

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];

export default function AdminOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [savingCourier, setSavingCourier] = useState(false);
  const [barcodeLoading, setBarcodeLoading] = useState('');
  const [courierForm, setCourierForm] = useState({
    provider: '',
    service: '',
    trackingId: '',
    awbNumber: '',
    trackingUrl: '',
    expectedDeliveryAt: '',
  });

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/orders/admin/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (data.order) {
        setOrder(data.order);
        setUser(data.order.user);
        const courier = data.order.courierDetails || {};
        setCourierForm({
          provider: courier.provider || '',
          service: courier.service || '',
          trackingId: courier.trackingId || '',
          awbNumber: courier.awbNumber || '',
          trackingUrl: courier.trackingUrl || '',
          expectedDeliveryAt: courier.expectedDeliveryAt ? courier.expectedDeliveryAt.slice(0, 10) : '',
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load order');
      navigate('/admin');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus) => {
    if (updating) return;
    try {
      setUpdating(true);
      const { data } = await axios.put(`/api/orders/${id}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setOrder(data.order);
      toast.success('Order status updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const updateCourierDetails = async () => {
    if (savingCourier) return;
    try {
      setSavingCourier(true);
      const courierDetails = {
        ...courierForm,
        expectedDeliveryAt: courierForm.expectedDeliveryAt || undefined,
      };
      const { data } = await axios.put(`/api/orders/${id}/status`, { courierDetails }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setOrder(data.order);
      toast.success('Courier details updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update courier details');
    } finally {
      setSavingCourier(false);
    }
  };

  const openBarcode = async (type) => {
    try {
      setBarcodeLoading(type);
      const res = await adminAPI.getBarcode(order._id, { type });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'image/png' }));
      const win = window.open('about:blank');
      if (!win) {
        toast.error('Popup blocked');
        return;
      }
      win.document.write(`<html><head><title>${type} barcode</title></head><body style="margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f8fafc;"><img src="${url}" style="max-width:90%;height:auto;"/></body></html>`);
      win.focus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate barcode');
    } finally {
      setBarcodeLoading('');
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '80px' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ paddingTop: '80px', minHeight: '100vh', background: '#FAFAFA' }}>
        <div className="container" style={{ padding: '40px 24px', maxWidth: '900px', textAlign: 'center' }}>
          <h2>Order not found</h2>
        </div>
      </div>
    );
  }

  const sc = statusConfig[order.status] || statusConfig.pending;

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', background: '#FAFAFA' }}>
      <div className="container" style={{ padding: '40px 24px', maxWidth: '1200px' }}>
        {/* Header */}
        <button
          onClick={() => navigate('/admin/orders')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'none',
            border: 'none',
            color: '#C8102E',
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: '24px',
          }}
        >
          <FiArrowLeft size={18} /> Back to Orders
        </button>

        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '36px', color: '#1A1A2E', marginBottom: '8px' }}>
            Order #{order.orderNumber}
          </h1>
          <p style={{ color: '#6B7280', fontSize: '14px' }}>
            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px' }}>
          {/* Main Content */}
          <div>
            {/* Status Management */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '16px', color: '#1A1A2E' }}>Order Status</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 18px',
                    borderRadius: '24px',
                    background: sc.bg,
                    color: sc.color,
                    fontWeight: 600,
                    fontSize: '15px',
                  }}
                >
                  {sc.icon} {sc.label}
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {ORDER_STATUSES.map((status) => (
                  <button
                    key={status}
                    onClick={() => updateOrderStatus(status)}
                    disabled={updating || order.status === status}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                      background: order.status === status ? '#C8102E' : 'white',
                      color: order.status === status ? 'white' : '#6B7280',
                      fontWeight: 500,
                      cursor: 'pointer',
                      fontSize: '12px',
                      textTransform: 'capitalize',
                      opacity: updating ? 0.7 : 1,
                    }}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Customer Information */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '16px', color: '#1A1A2E' }}>Customer Information</h3>
              {user && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#4B5563' }}>
                    <FiUser size={18} style={{ color: '#6B7280' }} />
                    <div>
                      <p style={{ fontSize: '12px', color: '#9CA3AF' }}>Customer Name</p>
                      <p style={{ fontWeight: 600, color: '#1A1A2E' }}>{user.name}</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#4B5563' }}>
                    <FiMail size={18} style={{ color: '#6B7280' }} />
                    <div>
                      <p style={{ fontSize: '12px', color: '#9CA3AF' }}>Email</p>
                      <p style={{ fontWeight: 600, color: '#1A1A2E' }}>{user.email}</p>
                    </div>
                  </div>
                  {user.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#4B5563' }}>
                      <FiPhone size={18} style={{ color: '#6B7280' }} />
                      <div>
                        <p style={{ fontSize: '12px', color: '#9CA3AF' }}>Phone</p>
                        <p style={{ fontWeight: 600, color: '#1A1A2E' }}>{user.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Shipping Address */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '16px', color: '#1A1A2E', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiMapPin size={18} /> Shipping Address
              </h3>
              <div style={{ color: '#4B5563', lineHeight: '1.8', fontSize: '14px' }}>
                <p style={{ fontWeight: 600, marginBottom: '4px' }}>{order.shippingAddress?.fullName}</p>
                <p>{order.shippingAddress?.street}</p>
                <p>
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                </p>
                <p>{order.shippingAddress?.country}</p>
                {order.shippingAddress?.phone && <p style={{ marginTop: '12px', fontSize: '13px' }}>Phone: {order.shippingAddress.phone}</p>}
              </div>
            </div>

            {/* Order Items */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '16px', color: '#1A1A2E' }}>Order Items</h3>
              {order.orderItems?.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    gap: '16px',
                    paddingBottom: '16px',
                    marginBottom: '16px',
                    borderBottom: i < order.orderItems.length - 1 ? '1px solid #F0F0F0' : 'none',
                  }}
                >
                  <img
                    src={item.image || 'https://via.placeholder.com/100'}
                    alt={item.name}
                    style={{ width: '100px', height: '100px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0 }}
                  />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, marginBottom: '8px', color: '#1A1A2E' }}>{item.name}</p>
                    <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>
                      Quantity: {item.quantity}
                      {item.size && ` • Size: ${item.size}`}
                      {item.color && ` • Color: ${item.color}`}
                    </p>
                    <p style={{ fontWeight: 600, color: '#C8102E' }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Invoice Details Component */}
            <InvoiceDetails order={order} onRefresh={fetchOrder} />
          </div>

          {/* Sidebar */}
          <div>
            <div style={{ marginBottom: '24px' }}>
              <OrderTracking order={order} />
            </div>

            {/* Courier Details */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '24px' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '16px', color: '#1A1A2E', fontSize: '15px' }}>Courier Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  ['provider', 'Courier Provider'],
                  ['service', 'Service Type'],
                  ['trackingId', 'Tracking ID'],
                  ['awbNumber', 'AWB Number'],
                  ['trackingUrl', 'Tracking URL'],
                ].map(([key, label]) => (
                  <input
                    key={key}
                    value={courierForm[key]}
                    onChange={(e) => setCourierForm((prev) => ({ ...prev, [key]: e.target.value }))}
                    placeholder={label}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                ))}
                <input
                  type="date"
                  value={courierForm.expectedDeliveryAt}
                  onChange={(e) => setCourierForm((prev) => ({ ...prev, expectedDeliveryAt: e.target.value }))}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box' }}
                />
                <button
                  onClick={updateCourierDetails}
                  disabled={savingCourier}
                  style={{ padding: '10px 14px', background: '#1A1A2E', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '13px', opacity: savingCourier ? 0.7 : 1 }}
                >
                  {savingCourier ? 'Saving...' : 'Save Courier Details'}
                </button>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '24px' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '16px', color: '#1A1A2E', fontSize: '15px' }}>Barcode Generation</h3>
              <div style={{ display: 'grid', gap: '8px' }}>
                {[
                  ['order', 'Order Code128'],
                  ['tracking', 'Tracking Barcode'],
                  ['courier', 'Courier Barcode'],
                  ['package', 'Package Barcode'],
                  ['qr', 'QR Code'],
                ].map(([type, label]) => (
                  <button key={type} onClick={() => openBarcode(type)} disabled={barcodeLoading === type} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', background: '#F9FAFB', color: '#111827', fontWeight: 700, cursor: 'pointer', textAlign: 'left', opacity: barcodeLoading === type ? 0.7 : 1 }}>
                    {barcodeLoading === type ? 'Generating...' : label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <ShippingLabel order={order} />
            </div>

            {/* Quick Summary */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', position: 'sticky', top: '120px' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '16px', color: '#1A1A2E', fontSize: '15px' }}>Order Summary</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6B7280' }}>
                  <span>Subtotal</span>
                  <span style={{ fontWeight: 600 }}>₹{order.itemsPrice?.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6B7280' }}>
                  <span>GST (18%)</span>
                  <span style={{ fontWeight: 600 }}>₹{order.gstAmount?.toLocaleString('en-IN')}</span>
                </div>
                {order.deliveryCharges > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6B7280' }}>
                    <span>Delivery</span>
                    <span style={{ fontWeight: 600 }}>₹{order.deliveryCharges?.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px solid #F0F0F0', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '14px' }}>
                <span style={{ color: '#1A1A2E' }}>Total</span>
                <span style={{ color: '#C8102E' }}>₹{order.totalPrice?.toLocaleString('en-IN')}</span>
              </div>

              {/* Status Badges */}
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #F0F0F0', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#6B7280' }}>Payment</span>
                  <span style={{ color: order.isPaid ? '#10B981' : '#F97316', fontWeight: 600 }}>
                    {order.isPaid ? '✓ Paid' : '⏳ Pending'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#6B7280' }}>Delivery</span>
                  <span style={{ color: order.isDelivered ? '#10B981' : '#F97316', fontWeight: 600 }}>
                    {order.isDelivered ? '✓ Delivered' : '⏳ Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
