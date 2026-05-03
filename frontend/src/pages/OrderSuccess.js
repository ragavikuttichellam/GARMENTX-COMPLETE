import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FiCheckCircle, FiPackage, FiArrowRight, FiDownload } from 'react-icons/fi';

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    axios.get('/api/orders/' + id)
      .then(({ data }) => setOrder(data.order))
      .catch(console.error);
  }, [id]);

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Success Icon */}
        <div style={styles.iconWrap}>
          <FiCheckCircle size={64} color="#10B981" />
        </div>

        <h1 style={styles.title}>Payment Successful! 🎉</h1>
        <p style={styles.subtitle}>
          Thank you for shopping with GarmentX! Your order has been confirmed and will be delivered soon.
        </p>

        {order && (
          <div style={styles.orderBox}>
            <div style={styles.orderHeader}>
              <FiPackage size={20} color="#C8102E" />
              <span style={{ fontWeight: 700 }}>Order Details</span>
            </div>

            <div style={styles.orderGrid}>
              <div style={styles.orderDetail}>
                <span style={styles.detailLabel}>Order Number</span>
                <span style={styles.detailValue}>{order.orderNumber}</span>
              </div>
              <div style={styles.orderDetail}>
                <span style={styles.detailLabel}>Status</span>
                <span style={{ ...styles.detailValue, color: '#10B981', fontWeight: 700 }}>✓ Confirmed</span>
              </div>
              <div style={styles.orderDetail}>
                <span style={styles.detailLabel}>Total Amount</span>
                <span style={{ ...styles.detailValue, color: '#C8102E', fontWeight: 800 }}>
                  ₹{order.totalPrice?.toLocaleString('en-IN')}
                </span>
              </div>
              <div style={styles.orderDetail}>
                <span style={styles.detailLabel}>Payment</span>
                <span style={styles.detailValue}>Razorpay ✓</span>
              </div>
            </div>

            {/* Items */}
            <div style={{ marginTop: '20px' }}>
              <p style={{ fontWeight: 600, marginBottom: '12px', color: '#374151' }}>Items Ordered</p>
              {order.orderItems?.map((item, i) => (
                <div key={i} style={styles.orderItem}>
                  <img
                    src={item.image || 'https://via.placeholder.com/60'}
                    alt={item.name}
                    style={{ width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 600, marginBottom: '4px' }}>{item.name}</p>
                    <p style={{ fontSize: '13px', color: '#6B7280' }}>
                      Qty: {item.quantity} {item.size && `• Size: ${item.size}`} {item.color && `• Color: ${item.color}`}
                    </p>
                  </div>
                  <span style={{ fontWeight: 700, color: '#1A1A2E' }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>

            {/* Shipping */}
            {order.shippingAddress && (
              <div style={{ marginTop: '20px', padding: '16px', background: '#F9FAFB', borderRadius: '12px' }}>
                <p style={{ fontWeight: 600, marginBottom: '6px', color: '#374151' }}>🚚 Shipping To</p>
                <p style={{ color: '#6B7280', fontSize: '14px', lineHeight: '1.6' }}>
                  {order.shippingAddress.fullName}<br />
                  {order.shippingAddress.street}, {order.shippingAddress.city}<br />
                  {order.shippingAddress.state} - {order.shippingAddress.pincode}
                </p>
              </div>
            )}
          </div>
        )}

        <div style={styles.actions}>
          <Link to="/my-orders" style={styles.secondaryBtn}>
            <FiPackage size={16} /> Track Order
          </Link>
          <Link to="/shop" style={styles.primaryBtn}>
            Continue Shopping <FiArrowRight size={16} />
          </Link>
        </div>

        <p style={styles.note}>
          📧 An order confirmation has been noted in your account. Happy Shopping!
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #F0FDF4 0%, #FFFFFF 60%)',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: '100px 24px 60px',
  },
  card: {
    background: 'white',
    borderRadius: '24px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
    padding: '48px 40px',
    maxWidth: '600px',
    width: '100%',
    textAlign: 'center',
  },
  iconWrap: {
    width: '100px', height: '100px',
    background: 'linear-gradient(135deg, #D1FAE5, #A7F3D0)',
    borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 24px',
  },
  title: { fontFamily: "'Playfair Display', serif", fontSize: '32px', color: '#1A1A2E', marginBottom: '12px' },
  subtitle: { color: '#6B7280', fontSize: '16px', lineHeight: '1.6', marginBottom: '32px' },
  orderBox: {
    background: '#F9FAFB',
    border: '1px solid #E5E7EB',
    borderRadius: '16px',
    padding: '24px',
    textAlign: 'left',
    marginBottom: '32px',
  },
  orderHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', fontSize: '16px', fontFamily: "'Playfair Display', serif" },
  orderGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  orderDetail: { display: 'flex', flexDirection: 'column', gap: '4px' },
  detailLabel: { fontSize: '12px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px' },
  detailValue: { fontSize: '15px', color: '#1A1A2E' },
  orderItem: {
    display: 'flex', alignItems: 'center', gap: '14px',
    padding: '12px 0',
    borderBottom: '1px solid #F0F0F0',
  },
  actions: { display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' },
  primaryBtn: {
    padding: '13px 28px',
    background: 'linear-gradient(135deg, #C8102E, #E31837)',
    color: 'white',
    borderRadius: '12px',
    fontWeight: 700,
    display: 'flex', alignItems: 'center', gap: '8px',
    fontSize: '15px',
  },
  secondaryBtn: {
    padding: '13px 28px',
    border: '2px solid #C8102E',
    color: '#C8102E',
    borderRadius: '12px',
    fontWeight: 700,
    display: 'flex', alignItems: 'center', gap: '8px',
    fontSize: '15px',
  },
  note: { color: '#9CA3AF', fontSize: '13px', marginTop: '24px', lineHeight: '1.6' },
};
