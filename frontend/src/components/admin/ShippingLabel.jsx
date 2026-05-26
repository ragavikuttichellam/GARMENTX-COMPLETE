import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { FiPrinter, FiTag, FiDownload, FiTruck, FiPackage } from 'react-icons/fi';
import { adminAPI } from '../../utils/api';

/**
 * Shipping Label Component
 * Allows printing and downloading shipping labels for orders
 * Displays courier information and tracking details
 */
export default function ShippingLabel({ order, onPrint }) {
  const [loading, setLoading] = useState(false);
  const [showCourierForm, setShowCourierForm] = useState(false);
  const [courierData, setCourierData] = useState({
    provider: order.courierDetails?.provider || '',
    service: order.courierDetails?.service || '',
    trackingId: order.courierDetails?.trackingId || '',
    awbNumber: order.courierDetails?.awbNumber || '',
    trackingUrl: order.courierDetails?.trackingUrl || ''
  });

  const handlePrintLabel = async () => {
    try {
      setLoading(true);
      const blob = await adminAPI.getShippingLabel(order._id, true);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const printWindow = window.open(url);
      if (!printWindow) {
        toast.error('Please allow popups to print the label');
        return;
      }
      printWindow.print();
      onPrint?.();
      toast.success('Opening print preview');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to print shipping label');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadLabel = async () => {
    try {
      setLoading(true);
      const blob = await adminAPI.getShippingLabel(order._id, false);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `shipping_label_${order.orderNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success('Shipping label downloaded');
    } catch (err) {
      toast.error('Failed to download shipping label');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCourier = async () => {
    try {
      setLoading(true);
      await adminAPI.updateCourierDetails(order._id, courierData);
      toast.success('Courier details updated');
      setShowCourierForm(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update courier details');
    } finally {
      setLoading(false);
    }
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
          background: '#FFE5E5',
          padding: '10px',
          borderRadius: '8px',
          color: '#C8102E',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <FiTag size={20} />
        </div>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#111827' }}>Shipping Label</h3>
      </div>

      {/* Package Information */}
      <div style={{
        background: '#F9FAFB',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '20px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <FiPackage size={16} style={{ color: '#6B7280' }} />
            <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 700 }}>PACKAGE ID</span>
          </div>
          <p style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>
            {order.packageId || order.orderNumber}
          </p>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <FiTruck size={16} style={{ color: '#6B7280' }} />
            <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 700 }}>COURIER PROVIDER</span>
          </div>
          <p style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>
            {order.courierDetails?.provider || <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>Not assigned</span>}
          </p>
        </div>
      </div>

      {/* Courier Details */}
      {order.courierDetails && (
        <div style={{
          background: '#EEF2FF',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px',
          border: '1px solid #C7D2FE'
        }}>
          <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#4F46E5', marginBottom: '12px', textTransform: 'uppercase' }}>
            Tracking Information
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
            {order.courierDetails.trackingId && (
              <div>
                <span style={{ color: '#6B7280' }}>Tracking ID:</span>
                <p style={{ fontWeight: 700, color: '#111827' }}>{order.courierDetails.trackingId}</p>
              </div>
            )}
            {order.courierDetails.awbNumber && (
              <div>
                <span style={{ color: '#6B7280' }}>AWB Number:</span>
                <p style={{ fontWeight: 700, color: '#111827' }}>{order.courierDetails.awbNumber}</p>
              </div>
            )}
            {order.courierDetails.service && (
              <div>
                <span style={{ color: '#6B7280' }}>Service:</span>
                <p style={{ fontWeight: 700, color: '#111827', textTransform: 'capitalize' }}>
                  {order.courierDetails.service}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Courier Update Form */}
      {showCourierForm && (
        <div style={{
          background: '#F9FAFB',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px',
          border: '1px solid #E5E7EB'
        }}>
          <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#111827', marginBottom: '12px' }}>
            Update Courier Details
          </h4>
          <div style={{ display: 'grid', gap: '12px' }}>
            <input
              type="text"
              placeholder="Courier Provider (e.g., DHL, Fedex, UPS)"
              value={courierData.provider}
              onChange={(e) => setCourierData({ ...courierData, provider: e.target.value })}
              style={{
                padding: '10px 12px',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                fontSize: '13px'
              }}
            />
            <input
              type="text"
              placeholder="Tracking ID"
              value={courierData.trackingId}
              onChange={(e) => setCourierData({ ...courierData, trackingId: e.target.value })}
              style={{
                padding: '10px 12px',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                fontSize: '13px'
              }}
            />
            <input
              type="text"
              placeholder="AWB Number"
              value={courierData.awbNumber}
              onChange={(e) => setCourierData({ ...courierData, awbNumber: e.target.value })}
              style={{
                padding: '10px 12px',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                fontSize: '13px'
              }}
            />
            <input
              type="text"
              placeholder="Service Type (e.g., Standard, Express)"
              value={courierData.service}
              onChange={(e) => setCourierData({ ...courierData, service: e.target.value })}
              style={{
                padding: '10px 12px',
                border: '1px solid #D1D5DB',
                borderRadius: '6px',
                fontSize: '13px'
              }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleUpdateCourier}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#C8102E',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1
                }}
              >
                Save Changes
              </button>
              <button
                onClick={() => setShowCourierForm(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #E5E7EB',
                  background: 'white',
                  color: '#111827',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
        <button
          onClick={handlePrintLabel}
          disabled={loading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid #E5E7EB',
            background: 'white',
            color: '#111827',
            fontWeight: 700,
            fontSize: '13px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          <FiPrinter size={16} /> Print
        </button>

        <button
          onClick={handleDownloadLabel}
          disabled={loading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid #E5E7EB',
            background: 'white',
            color: '#111827',
            fontWeight: 700,
            fontSize: '13px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          <FiDownload size={16} /> Download
        </button>

        <button
          onClick={() => setShowCourierForm(!showCourierForm)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid #E5E7EB',
            background: showCourierForm ? '#EEF2FF' : 'white',
            color: showCourierForm ? '#4F46E5' : '#111827',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          <FiTruck size={16} /> {showCourierForm ? 'Hide' : 'Update Courier'}
        </button>
      </div>
    </section>
  );
}
