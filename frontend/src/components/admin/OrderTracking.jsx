import React, { useEffect, useState } from 'react';
import { FiCheckCircle, FiClock, FiTruck, FiCalendar, FiUser, FiMessageSquare } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { adminAPI } from '../../utils/api';

const TRACKING_STEPS = [
  { status: 'pending', label: 'Pending', description: 'Order received' },
  { status: 'confirmed', label: 'Confirmed', description: 'Order confirmed' },
  { status: 'processing', label: 'Processing', description: 'Preparing order' },
  { status: 'packed', label: 'Packed', description: 'Package ready' },
  { status: 'shipped', label: 'Shipped', description: 'On the way' },
  { status: 'out_for_delivery', label: 'Out for Delivery', description: 'Out for delivery' },
  { status: 'delivered', label: 'Delivered', description: 'Order delivered' },
];

/**
 * Order Tracking Component
 * Displays order status timeline and complete scan history
 * Shows progression from pending to delivered with timestamps
 */
export default function OrderTracking({ order, onRefresh }) {
  const [scanHistory, setScanHistory] = useState(order.scanHistory || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (order._id) {
      fetchScanHistory();
    }
  }, [order._id]);

  const fetchScanHistory = async () => {
    try {
      setLoading(true);
      const { data } = await adminAPI.getOrderScanHistory(order._id);
      setScanHistory(data.scanHistory || []);
    } catch (err) {
      console.error('Failed to fetch scan history:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentIndex = TRACKING_STEPS.findIndex(
    step => step.status === (order.status || order.shippingStatus)
  );

  const getStatusColor = (index) => {
    if (index < currentIndex) return '#10B981';
    if (index === currentIndex) return '#F59E0B';
    return '#D1D5DB';
  };

  const getStatusBackground = (index) => {
    if (index < currentIndex) return '#ECFDF5';
    if (index === currentIndex) return '#FEF3C7';
    return '#F3F4F6';
  };

  return (
    <section style={{
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      border: '1px solid #E5E7EB',
      boxShadow: '0 1px 3px rgba(15,23,42,0.08)'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div style={{
          background: '#FFF7ED',
          padding: '10px',
          borderRadius: '8px',
          color: '#C2410C',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <FiTruck size={20} />
        </div>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#111827' }}>Order Tracking</h3>
      </div>

      {/* Status Timeline */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'grid', gap: '24px' }}>
          {TRACKING_STEPS.map((step, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isNext = index === currentIndex + 1;
            const color = getStatusColor(index);
            const background = getStatusBackground(index);

            return (
              <div key={step.status} style={{ display: 'flex', gap: '16px' }}>
                {/* Timeline Circle */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: background,
                    color: color,
                    fontWeight: 800,
                    fontSize: '18px',
                    border: isCurrent ? `2px solid ${color}` : 'none',
                    transition: 'all 0.3s ease'
                  }}>
                    {isCompleted ? (
                      <FiCheckCircle size={20} />
                    ) : (
                      <span style={{ fontSize: '14px' }}>{index + 1}</span>
                    )}
                  </div>

                  {/* Timeline Line */}
                  {index < TRACKING_STEPS.length - 1 && (
                    <div style={{
                      width: '2px',
                      height: '60px',
                      background: isNext ? '#FCD34D' : (isCompleted ? '#10B981' : '#E5E7EB'),
                      transition: 'all 0.3s ease'
                    }} />
                  )}
                </div>

                {/* Status Content */}
                <div style={{ paddingTop: '4px', flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '4px'
                  }}>
                    <h4 style={{
                      fontSize: '14px',
                      fontWeight: 800,
                      color: color
                    }}>
                      {step.label}
                    </h4>
                    {isCompleted && (
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#10B981',
                        background: '#ECFDF5',
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}>
                        COMPLETED
                      </span>
                    )}
                    {isCurrent && (
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#F59E0B',
                        background: '#FEF3C7',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        animation: 'pulse 2s infinite'
                      }}>
                        IN PROGRESS
                      </span>
                    )}
                  </div>
                  <p style={{
                    fontSize: '13px',
                    color: '#6B7280'
                  }}>
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scan History */}
      {scanHistory && scanHistory.length > 0 && (
        <div style={{
          background: '#F9FAFB',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #E5E7EB'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <FiCalendar size={16} style={{ color: '#6B7280' }} />
            <h4 style={{
              fontSize: '13px',
              fontWeight: 800,
              color: '#6B7280',
              textTransform: 'uppercase'
            }}>
              Scan History ({scanHistory.length})
            </h4>
          </div>

          <div style={{ display: 'grid', gap: '12px' }}>
            {scanHistory
              .slice()
              .reverse()
              .map((scan, idx) => (
                <div
                  key={scan._id || idx}
                  style={{
                    background: 'white',
                    borderRadius: '8px',
                    padding: '12px',
                    border: '1px solid #E5E7EB',
                    display: 'grid',
                    gap: '8px'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start'
                  }}>
                    <div>
                      <div style={{
                        display: 'inline-block',
                        background: '#EEF2FF',
                        color: '#4F46E5',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 700,
                        textTransform: 'capitalize',
                        marginBottom: '6px'
                      }}>
                        {scan.action?.replace(/_/g, ' ')}
                      </div>
                      <p style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: '#111827'
                      }}>
                        Scan Code: <span style={{ fontFamily: 'monospace', color: '#6B7280' }}>
                          {scan.scannedCode}
                        </span>
                      </p>
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#6B7280',
                      textAlign: 'right'
                    }}>
                      {scan.scannedAt
                        ? new Date(scan.scannedAt).toLocaleString('en-IN')
                        : 'N/A'}
                    </div>
                  </div>

                  {scan.scannedBy && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px',
                      color: '#6B7280'
                    }}>
                      <FiUser size={14} />
                      Scanned by: {scan.scannedBy.name || 'Admin'}
                    </div>
                  )}

                  {scan.note && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '6px',
                      fontSize: '12px',
                      color: '#6B7280'
                    }}>
                      <FiMessageSquare size={14} style={{ marginTop: '2px' }} />
                      <span style={{ fontStyle: 'italic' }}>{scan.note}</span>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* No Scan History Message */}
      {(!scanHistory || scanHistory.length === 0) && (
        <div style={{
          background: '#F9FAFB',
          borderRadius: '8px',
          padding: '32px 24px',
          textAlign: 'center',
          color: '#6B7280'
        }}>
          <FiClock size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
          <p style={{ fontSize: '13px' }}>No scans recorded yet</p>
        </div>
      )}

      {/* Refresh Button */}
      <button
        onClick={fetchScanHistory}
        disabled={loading}
        style={{
          marginTop: '20px',
          padding: '10px 16px',
          borderRadius: '8px',
          border: '1px solid #E5E7EB',
          background: 'white',
          color: '#111827',
          fontWeight: 700,
          fontSize: '13px',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
          transition: 'all 0.2s ease'
        }}
      >
        {loading ? 'Refreshing...' : 'Refresh History'}
      </button>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </section>
  );
}
