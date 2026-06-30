import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api, { orderAPI } from '../utils/api';
import {
  FiArrowLeft,
  FiCheckCircle,
  FiClock,
  FiHeadphones,
  FiMap,
  FiMapPin,
  FiPackage,
  FiTruck,
  FiX,
} from 'react-icons/fi';

const statusConfig = {
  pending: { color: '#FFB800', bg: '#FFFBEB', icon: <FiClock size={16} />, label: 'Pending' },
  confirmed: { color: '#3B82F6', bg: '#EFF6FF', icon: <FiPackage size={16} />, label: 'Confirmed' },
  processing: { color: '#8B5CF6', bg: '#F5F3FF', icon: <FiPackage size={16} />, label: 'Processing' },
  shipped: { color: '#F97316', bg: '#FFF7ED', icon: <FiTruck size={16} />, label: 'Shipped' },
  delivered: { color: '#10B981', bg: '#ECFDF5', icon: <FiCheckCircle size={16} />, label: 'Delivered' },
  cancelled: { color: '#EF4444', bg: '#FEF2F2', icon: <FiX size={16} />, label: 'Cancelled' },
};

const timelineSteps = [
  { status: 'pending', label: 'Order Placed' },
  { status: 'confirmed', label: 'Confirmed' },
  { status: 'processing', label: 'Processing' },
  { status: 'shipped', label: 'Shipped' },
  { status: 'delivered', label: 'Delivered' },
];

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0);

export default function OrderDetailUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    orderAPI
      .getById(id)
      .then(({ data }) => setOrder(data.order))
      .catch((err) => {
        toast.error(err.response?.data?.message || 'Failed to load order');
        navigate('/my-orders');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleCancelOrder = async () => {
    try {
      setCancelling(true);
      const { data } = await api.put(`/orders/${order._id}/cancel`);
      setOrder(data.order);
      setShowCancelConfirm(false);
      toast.success('Order cancelled successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const handleTrackOrder = () => {
    toast.success('Tracking updates are shown in your delivery timeline');
  };

  const handleContactSupport = () => {
    window.location.href = `mailto:support@manisaraworld.com?subject=Support for order ${order.orderNumber || order._id}`;
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

  const currentStatus = statusConfig[order.status] || statusConfig.pending;
  const currentStepIndex = timelineSteps.findIndex((step) => step.status === order.status);
  const canCancel = ['pending', 'confirmed', 'processing'].includes(order.status);

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', background: '#FAFAFA' }}>
      <div className="container" style={{ padding: '40px 24px', maxWidth: '900px' }}>
        <button
          onClick={() => navigate('/my-orders')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#C8102E', fontWeight: 600, cursor: 'pointer', marginBottom: '24px' }}
        >
          <FiArrowLeft size={18} /> Back to Orders
        </button>

        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '36px', color: '#1A1A2E', marginBottom: '8px' }}>
            Order #{order.orderNumber}
          </h1>
          <p style={{ color: '#6B7280', fontSize: '14px' }}>
            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <section style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '16px', color: '#1A1A2E' }}>Order Status</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '24px', background: currentStatus.bg, color: currentStatus.color, fontWeight: 600, fontSize: '15px' }}>
              {currentStatus.icon} {currentStatus.label}
            </span>
            {order.isDelivered && order.deliveredAt && (
              <span style={{ color: '#10B981', fontWeight: 500, fontSize: '14px' }}>
                Delivered on {new Date(order.deliveredAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}
              </span>
            )}
          </div>

          {order.status !== 'cancelled' && (
            <div style={{ paddingTop: '24px', borderTop: '1px solid #F0F0F0' }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#6B7280', marginBottom: '16px' }}>DELIVERY TIMELINE</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                {timelineSteps.map((step, index) => {
                  const isCompleted = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  return (
                    <div key={step.status} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: isCompleted ? '#10B981' : '#F0F0F0', color: isCompleted ? 'white' : '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center', border: isCurrent ? '3px solid #C8102E' : 'none', marginBottom: '8px' }}>
                        <FiCheckCircle size={16} />
                      </div>
                      <p style={{ fontSize: '12px', color: isCompleted ? '#10B981' : '#9CA3AF', fontWeight: 500, textAlign: 'center' }}>
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #F0F0F0', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button onClick={handleTrackOrder} disabled={order.status === 'cancelled'} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 18px', background: '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '13px', opacity: order.status === 'cancelled' ? 0.5 : 1 }}>
              <FiMap size={16} /> Track Order
            </button>
            {canCancel && (
              <button onClick={() => setShowCancelConfirm(true)} disabled={cancelling} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 18px', background: '#FEF2F2', color: '#EF4444', border: '1px solid #FECACA', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '13px', opacity: cancelling ? 0.7 : 1 }}>
                <FiX size={16} /> {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
            <button onClick={handleContactSupport} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 18px', background: 'white', color: '#1A1A2E', border: '1px solid #E5E7EB', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>
              <FiHeadphones size={16} /> Contact Support
            </button>
          </div>
        </section>

        {showCancelConfirm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(17, 24, 39, 0.45)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ width: '100%', maxWidth: '420px', background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 24px 80px rgba(15, 23, 42, 0.25)' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1A1A2E', marginBottom: '8px' }}>Cancel Order?</h3>
              <p style={{ color: '#6B7280', fontSize: '14px', lineHeight: 1.6, marginBottom: '22px' }}>
                This will cancel order #{order.orderNumber}. You can only cancel orders before they are shipped.
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setShowCancelConfirm(false)}
                  disabled={cancelling}
                  style={{ padding: '11px 16px', background: 'white', color: '#374151', border: '1px solid #E5E7EB', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Keep Order
                </button>
                <button
                  type="button"
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  style={{ padding: '11px 16px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', opacity: cancelling ? 0.75 : 1 }}
                >
                  {cancelling ? 'Cancelling...' : 'Cancel Order'}
                </button>
              </div>
            </div>
          </div>
        )}

        <section style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '16px', color: '#1A1A2E', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiMapPin size={18} /> Shipping Address
          </h3>
          <div style={{ color: '#4B5563', lineHeight: '1.8' }}>
            <p style={{ fontWeight: 600, marginBottom: '4px' }}>{order.shippingAddress?.fullName}</p>
            <p>{order.shippingAddress?.street}</p>
            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
            <p>{order.shippingAddress?.country}</p>
            {order.shippingAddress?.phone && <p style={{ marginTop: '12px', fontSize: '14px' }}>Phone: {order.shippingAddress.phone}</p>}
          </div>
        </section>

        <section style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '16px', color: '#1A1A2E' }}>Ordered Products</h3>
          {order.orderItems?.map((item, index) => (
            <div key={item._id || index} style={{ display: 'flex', gap: '16px', paddingBottom: '16px', marginBottom: '16px', borderBottom: index < order.orderItems.length - 1 ? '1px solid #F0F0F0' : 'none' }}>
              <img src={item.image || 'https://via.placeholder.com/100'} alt={item.name} style={{ width: '100px', height: '100px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, marginBottom: '8px', color: '#1A1A2E' }}>{item.name}</p>
                <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>
                  Quantity: {item.quantity}
                  {item.size && ` | Size: ${item.size}`}
                  {item.color && ` | Color: ${item.color}`}
                </p>
                <p style={{ fontWeight: 600, color: '#C8102E' }}>{formatCurrency(item.price * item.quantity)}</p>
              </div>
            </div>
          ))}
        </section>

        <section style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '16px', color: '#1A1A2E' }}>Payment Status</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '16px', color: '#1A1A2E' }}>
              <span>Total Amount</span>
              <span style={{ color: '#C8102E' }}>{formatCurrency(order.totalPrice)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#6B7280' }}>
              <span>Payment Status</span>
              <span style={{ color: order.isPaid ? '#10B981' : '#F97316', fontWeight: 600 }}>
                {order.isPaid ? 'Paid' : 'Pending'}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
