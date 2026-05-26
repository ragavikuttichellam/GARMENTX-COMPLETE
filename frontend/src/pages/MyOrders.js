import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiPackage, FiChevronRight, FiClock, FiTruck, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const statusConfig = {
  pending:     { color: '#FFB800', bg: '#FFFBEB', icon: <FiClock size={14} />, label: 'Pending' },
  confirmed:   { color: '#3B82F6', bg: '#EFF6FF', icon: <FiPackage size={14} />, label: 'Confirmed' },
  processing:  { color: '#8B5CF6', bg: '#F5F3FF', icon: <FiPackage size={14} />, label: 'Processing' },
  shipped:     { color: '#F97316', bg: '#FFF7ED', icon: <FiTruck size={14} />, label: 'Shipped' },
  delivered:   { color: '#10B981', bg: '#ECFDF5', icon: <FiCheckCircle size={14} />, label: 'Delivered' },
  cancelled:   { color: '#EF4444', bg: '#FEF2F2', icon: <FiXCircle size={14} />, label: 'Cancelled' },
};

/**
 * User My Orders Page
 * Shows only user-relevant order information:
 * - Product image, name, quantity, price
 * - Order status and delivery status
 * - Does NOT show: invoice details, GST, barcode, payment details
 */
export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/orders/myorders')
      .then(({ data }) => setOrders(data.orders || []))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '80px' }}>
      <div className="spinner"></div>
    </div>
  );

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', background: '#FAFAFA' }}>
      <div className="container" style={{ padding: '40px 24px', maxWidth: '900px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '36px', color: '#1A1A2E', marginBottom: '8px' }}>My Orders</h1>
          <p style={{ color: '#6B7280' }}>Track and manage all your GarmentX orders</p>
        </div>

        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <FiPackage size={64} color="#D1D5DB" style={{ marginBottom: '20px' }} />
            <h2 style={{ fontFamily: "'Playfair Display', serif", color: '#1A1A2E', marginBottom: '12px' }}>No orders yet</h2>
            <p style={{ color: '#6B7280', marginBottom: '24px' }}>Looks like you haven't placed any orders yet.</p>
            <Link to="/shop" style={{ padding: '13px 28px', background: '#C8102E', color: 'white', borderRadius: '12px', fontWeight: 700 }}>
              Start Shopping
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {orders.map(order => {
              const sc = statusConfig[order.status] || statusConfig.pending;
              return (
                <div key={order._id} style={{ background: 'white', borderRadius: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                  {/* Order Header */}
                  <div style={{ padding: '20px 24px', borderBottom: '1px solid #F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <p style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '4px' }}>Order #{order.orderNumber}</p>
                      <p style={{ fontSize: '13px', color: '#6B7280' }}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '6px 14px', borderRadius: '20px',
                        background: sc.bg, color: sc.color,
                        fontSize: '13px', fontWeight: 600,
                      }}>
                        {sc.icon} {sc.label}
                      </span>
                      <span style={{ fontWeight: 800, fontSize: '18px', color: '#C8102E' }}>
                        ₹{order.totalPrice?.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div style={{ padding: '16px 24px' }}>
                    {order.orderItems?.slice(0, 2).map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                        <img
                          src={item.image || 'https://via.placeholder.com/60'}
                          alt={item.name}
                          style={{ width: '64px', height: '64px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }}
                        />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: 600, marginBottom: '4px', fontSize: '15px' }}>{item.name}</p>
                          <p style={{ fontSize: '13px', color: '#9CA3AF' }}>
                            Qty: {item.quantity}
                            {item.size && ` • Size: ${item.size}`}
                            {item.color && ` • ${item.color}`}
                          </p>
                        </div>
                        <span style={{ fontWeight: 700, color: '#1A1A2E' }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                    {order.orderItems?.length > 2 && (
                      <p style={{ color: '#9CA3AF', fontSize: '13px' }}>+{order.orderItems.length - 2} more items</p>
                    )}
                  </div>

                  {/* Footer */}
                  <div style={{ padding: '16px 24px', background: '#F9FAFB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '13px', color: '#6B7280' }}>
                      {order.isPaid ? '✓ Paid' : '⏳ Payment Pending'} •
                      {order.isDelivered ? ` Delivered ${new Date(order.deliveredAt).toLocaleDateString('en-IN')}` : ' Delivery Pending'}
                    </div>
                    <Link to={'/order/' + order._id} style={{ color: '#C8102E', fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      View Details <FiChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
