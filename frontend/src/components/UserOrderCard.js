import React from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight, FiClock, FiTruck, FiCheckCircle, FiXCircle, FiPackage } from 'react-icons/fi';

/**
 * UserOrderCard Component
 * Displays a single order card in user's My Orders page
 * Shows only user-relevant information:
 * - Product image, name, quantity, price
 * - Order status
 * - Delivery status
 * Does NOT show:
 * - Invoice details
 * - GST
 * - Barcode
 * - Payment management details
 */
const statusConfig = {
  pending:     { color: '#FFB800', bg: '#FFFBEB', icon: <FiClock size={14} />, label: 'Pending' },
  confirmed:   { color: '#3B82F6', bg: '#EFF6FF', icon: <FiPackage size={14} />, label: 'Confirmed' },
  processing:  { color: '#8B5CF6', bg: '#F5F3FF', icon: <FiPackage size={14} />, label: 'Processing' },
  shipped:     { color: '#F97316', bg: '#FFF7ED', icon: <FiTruck size={14} />, label: 'Shipped' },
  delivered:   { color: '#10B981', bg: '#ECFDF5', icon: <FiCheckCircle size={14} />, label: 'Delivered' },
  cancelled:   { color: '#EF4444', bg: '#FEF2F2', icon: <FiXCircle size={14} />, label: 'Cancelled' },
};

export default function UserOrderCard({ order }) {
  const sc = statusConfig[order.status] || statusConfig.pending;

  return (
    <div style={{
      background: 'white',
      borderRadius: '20px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      overflow: 'hidden',
      transition: 'all 0.3s ease'
    }}>
      {/* Order Header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid #F0F0F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <p style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '4px' }}>
            Order #{order.orderNumber}
          </p>
          <p style={{ fontSize: '13px', color: '#6B7280' }}>
            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '20px',
            background: sc.bg,
            color: sc.color,
            fontSize: '13px',
            fontWeight: 600,
          }}>
            {sc.icon} {sc.label}
          </span>
          <span style={{
            fontWeight: 800,
            fontSize: '18px',
            color: '#C8102E',
            minWidth: '80px',
            textAlign: 'right'
          }}>
            ₹{order.totalPrice?.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Order Items Preview */}
      <div style={{ padding: '16px 24px' }}>
        {order.orderItems?.slice(0, 2).map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
            <img
              src={item.image || 'https://via.placeholder.com/60'}
              alt={item.name}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '10px',
                objectFit: 'cover',
                flexShrink: 0
              }}
            />
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, marginBottom: '4px', fontSize: '15px' }}>
                {item.name}
              </p>
              <p style={{ fontSize: '13px', color: '#9CA3AF' }}>
                Qty: {item.quantity}
                {item.size && ` • Size: ${item.size}`}
                {item.color && ` • ${item.color}`}
              </p>
            </div>
            <span style={{ fontWeight: 700, color: '#1A1A2E' }}>
              ₹{(item.price * item.quantity).toLocaleString('en-IN')}
            </span>
          </div>
        ))}
        {order.orderItems?.length > 2 && (
          <p style={{ color: '#9CA3AF', fontSize: '13px' }}>
            +{order.orderItems.length - 2} more items
          </p>
        )}
      </div>

      {/* Order Footer */}
      <div style={{
        padding: '16px 24px',
        background: '#F9FAFB',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ fontSize: '13px', color: '#6B7280' }}>
          {order.isPaid ? '✓ Paid' : '⏳ Payment Pending'} •
          {order.isDelivered ? ` Delivered ${new Date(order.deliveredAt).toLocaleDateString('en-IN')}` : ' Delivery Pending'}
        </div>
        <Link
          to={'/order/' + order._id}
          style={{
            color: '#C8102E',
            fontWeight: 600,
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            textDecoration: 'none',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
          onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
        >
          View Details <FiChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
}
