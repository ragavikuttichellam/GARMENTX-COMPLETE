import React, { useState } from 'react';
import { FiDownload, FiPrinter, FiX, FiCheck, FiAlertCircle, FiCopy } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { adminAPI } from '../../utils/api';

/**
 * Invoice Details Component
 * Displays complete invoice information for admin view
 * Shows customer details, items, pricing, GST, payment status, and allows document download
 */
export default function InvoiceDetails({ order, onClose }) {
  const [loading, setLoading] = useState(false);

  if (!order) return null;

  const handleDownloadInvoice = async () => {
    try {
      setLoading(true);
      const blob = await adminAPI.getInvoice(order._id, false);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${order.orderNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success('Invoice downloaded');
    } catch (err) {
      toast.error('Failed to download invoice');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintInvoice = async () => {
    try {
      setLoading(true);
      const blob = await adminAPI.getInvoice(order._id, true);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const printWindow = window.open(url);
      printWindow.print();
      toast.success('Opening print preview');
    } catch (err) {
      toast.error('Failed to print invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyInvoiceNumber = () => {
    navigator.clipboard.writeText(order.invoiceNumber);
    toast.success('Invoice number copied');
  };

  const ship = order.shippingAddress || {};
  const gstRate = 18; // Default GST rate
  const itemsTotal = order.itemsPrice || 0;
  const gstAmount = order.gstAmount || (itemsTotal * gstRate / 100);
  const deliveryCharges = order.deliveryCharges || 0;
  const totalAmount = order.totalPrice || 0;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: '16px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 25px rgba(0,0,0,0.15)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px',
          borderBottom: '1px solid #E5E7EB',
          position: 'sticky',
          top: 0,
          background: 'white'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#111827' }}>Invoice Details</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6B7280'
            }}
          >
            <FiX />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', display: 'grid', gap: '24px' }}>
          {/* Invoice Number & Status */}
          <div style={{
            background: '#F9FAFB',
            borderRadius: '8px',
            padding: '16px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px'
          }}>
            <div>
              <p style={{ fontSize: '12px', color: '#6B7280', fontWeight: 700, marginBottom: '4px' }}>INVOICE NUMBER</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#111827' }}>{order.invoiceNumber}</span>
                <button
                  onClick={handleCopyInvoiceNumber}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#6B7280',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <FiCopy size={14} />
                </button>
              </div>
            </div>
            <div>
              <p style={{ fontSize: '12px', color: '#6B7280', fontWeight: 700, marginBottom: '4px' }}>PAYMENT STATUS</p>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                background: order.isPaid ? '#ECFDF5' : '#FEF3C7',
                color: order.isPaid ? '#047857' : '#92400E'
              }}>
                {order.isPaid ? <FiCheck size={14} /> : <FiAlertCircle size={14} />}
                <span style={{ fontWeight: 700, fontSize: '13px' }}>
                  {order.isPaid ? 'Paid' : 'Pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Order & Customer Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#6B7280', marginBottom: '12px', textTransform: 'uppercase' }}>
                Order Information
              </h3>
              <div style={{ display: 'grid', gap: '8px' }}>
                <div>
                  <p style={{ fontSize: '12px', color: '#6B7280' }}>Order Number</p>
                  <p style={{ fontWeight: 700, color: '#111827' }}>{order.orderNumber}</p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#6B7280' }}>Order Date</p>
                  <p style={{ fontWeight: 700, color: '#111827' }}>
                    {new Date(order.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#6B7280' }}>Payment Method</p>
                  <p style={{ fontWeight: 700, color: '#111827', textTransform: 'capitalize' }}>
                    {order.paymentMethod}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#6B7280', marginBottom: '12px', textTransform: 'uppercase' }}>
                Customer Information
              </h3>
              <div style={{ display: 'grid', gap: '8px' }}>
                <div>
                  <p style={{ fontSize: '12px', color: '#6B7280' }}>Name</p>
                  <p style={{ fontWeight: 700, color: '#111827' }}>
                    {order.user?.name || ship.fullName}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#6B7280' }}>Email</p>
                  <p style={{ fontWeight: 700, color: '#111827' }}>{order.user?.email}</p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#6B7280' }}>Phone</p>
                  <p style={{ fontWeight: 700, color: '#111827' }}>{order.user?.phone || ship.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div>
            <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#6B7280', marginBottom: '12px', textTransform: 'uppercase' }}>
              Shipping Address
            </h3>
            <div style={{
              background: '#F9FAFB',
              borderRadius: '8px',
              padding: '16px',
              color: '#374151',
              lineHeight: '1.6'
            }}>
              <p style={{ fontWeight: 700 }}>{ship.fullName}</p>
              <p>{ship.street}</p>
              <p>{ship.city}, {ship.state} - {ship.pincode}</p>
              <p>{ship.country}</p>
              <p style={{ marginTop: '8px', fontSize: '13px' }}>Phone: {ship.phone}</p>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#6B7280', marginBottom: '12px', textTransform: 'uppercase' }}>
              Order Items
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F9FAFB' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#6B7280' }}>Product</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: 700, color: '#6B7280' }}>Qty</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: 700, color: '#6B7280' }}>Price</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: 700, color: '#6B7280' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.orderItems?.map((item, idx) => (
                    <tr key={idx} style={{ borderTop: '1px solid #E5E7EB' }}>
                      <td style={{ padding: '12px' }}>
                        <div>
                          <p style={{ fontWeight: 700, color: '#111827' }}>{item.name}</p>
                          <p style={{ fontSize: '12px', color: '#6B7280' }}>
                            {item.size && `Size: ${item.size}`} {item.color && `• Color: ${item.color}`}
                          </p>
                        </div>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', color: '#374151' }}>{item.quantity}</td>
                      <td style={{ padding: '12px', textAlign: 'right', color: '#374151' }}>₹{item.price?.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: 700, color: '#111827' }}>
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div style={{
            background: '#F9FAFB',
            borderRadius: '8px',
            padding: '16px',
            display: 'grid',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6B7280' }}>Subtotal</span>
              <span style={{ fontWeight: 700, color: '#111827' }}>₹{itemsTotal.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6B7280' }}>GST (18%)</span>
              <span style={{ fontWeight: 700, color: '#111827' }}>₹{gstAmount.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6B7280' }}>Delivery Charges</span>
              <span style={{ fontWeight: 700, color: '#111827' }}>₹{deliveryCharges.toLocaleString('en-IN')}</span>
            </div>
            <div style={{
              borderTop: '2px solid #E5E7EB',
              paddingTop: '12px',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontWeight: 800, color: '#111827', fontSize: '16px' }}>Total Amount</span>
              <span style={{ fontWeight: 800, color: '#C8102E', fontSize: '18px' }}>
                ₹{totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Tracking Information */}
          {order.courierDetails && (
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#6B7280', marginBottom: '12px', textTransform: 'uppercase' }}>
                Tracking Information
              </h3>
              <div style={{
                background: '#F9FAFB',
                borderRadius: '8px',
                padding: '16px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px'
              }}>
                <div>
                  <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Courier Provider</p>
                  <p style={{ fontWeight: 700, color: '#111827' }}>{order.courierDetails.provider || 'Not assigned'}</p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Tracking ID</p>
                  <p style={{ fontWeight: 700, color: '#111827', fontSize: '14px' }}>{order.courierDetails.trackingId || 'N/A'}</p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>AWB Number</p>
                  <p style={{ fontWeight: 700, color: '#111827', fontSize: '14px' }}>{order.courierDetails.awbNumber || 'N/A'}</p>
                </div>
                <div>
                  <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Service Type</p>
                  <p style={{ fontWeight: 700, color: '#111827', textTransform: 'capitalize' }}>
                    {order.courierDetails.service || 'Standard'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          padding: '24px',
          borderTop: '1px solid #E5E7EB',
          background: '#F9FAFB',
          position: 'sticky',
          bottom: 0
        }}>
          <button
            onClick={handlePrintInvoice}
            disabled={loading}
            style={{
              flex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 20px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              background: 'white',
              color: '#111827',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1
            }}
          >
            <FiPrinter size={16} /> Print
          </button>
          <button
            onClick={handleDownloadInvoice}
            disabled={loading}
            style={{
              flex: 1,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 20px',
              borderRadius: '8px',
              border: 'none',
              background: '#C8102E',
              color: 'white',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1
            }}
          >
            <FiDownload size={16} /> Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
