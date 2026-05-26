import React, { useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FiDownload, FiPrinter, FiBox } from 'react-icons/fi';

export default function InvoiceDetails({ order, onRefresh }) {
  const [downloading, setDownloading] = useState(false);
  const [printing, setPrinting] = useState(false);

  const downloadInvoice = async () => {
    if (downloading) return;
    try {
      setDownloading(true);
      const res = await api.get(`/admin/orders/${order._id}/invoice`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice_${order.orderNumber || order._id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Invoice downloaded');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to download invoice');
    } finally {
      setDownloading(false);
    }
  };

  const printInvoice = async () => {
    if (printing) return;
    try {
      setPrinting(true);
      const res = await api.get(`/admin/orders/${order._id}/invoice?inline=true`, { responseType: 'blob' });
      const file = new Blob([res.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      const w = window.open(fileURL);
      if (!w) {
        toast.error('Popup blocked by browser');
        return;
      }
      w.focus();
      setTimeout(() => {
        w.print();
      }, 250);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to print invoice');
    } finally {
      setPrinting(false);
    }
  };

  const viewBarcode = async () => {
    try {
      const res = await api.get(`/admin/orders/${order._id}/barcode`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'image/png' });
      const url = window.URL.createObjectURL(blob);
      const w = window.open('about:blank');
      if (!w) {
        toast.error('Popup blocked by browser');
        return;
      }
      w.document.write(
        `<html><head><title>Tracking Barcode - ${order.orderNumber}</title><style>body{margin:0;display:flex;flex-direction:column;justify-content:center;align-items:center;height:100vh;background:#f9fafb;font-family:sans-serif;}img{max-width:90%;height:auto;}</style></head><body><img src="${url}"/><p style="margin-top:20px;color:#666;">Order: ${order.orderNumber}</p></body></html>`
      );
      w.focus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load barcode');
    }
  };

  return (
    <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button
          onClick={downloadInvoice}
          disabled={downloading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            background: '#C8102E',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '13px',
            opacity: downloading ? 0.7 : 1,
          }}
        >
          <FiDownload size={16} /> {downloading ? 'Downloading...' : 'Download Invoice'}
        </button>
        <button
          onClick={printInvoice}
          disabled={printing}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            background: '#111827',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '13px',
            opacity: printing ? 0.7 : 1,
          }}
        >
          <FiPrinter size={16} /> {printing ? 'Loading...' : 'Print Invoice'}
        </button>
        <button
          onClick={viewBarcode}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            background: '#F3F4F6',
            color: '#1A1A2E',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '13px',
          }}
        >
          <FiBox size={16} /> View Barcode
        </button>
      </div>

      {/* Invoice Details */}
      <div style={{ borderTop: '1px solid #F0F0F0', paddingTop: '24px' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '16px', color: '#1A1A2E' }}>Invoice Details</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          {/* Left Column */}
          <div>
            <p style={{ fontSize: '12px', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
              Invoice Number
            </p>
            <p style={{ fontWeight: 600, color: '#1A1A2E', marginBottom: '16px' }}>{order.orderNumber}</p>

            <p style={{ fontSize: '12px', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
              Order Date
            </p>
            <p style={{ fontWeight: 600, color: '#1A1A2E', marginBottom: '16px' }}>
              {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>

            <p style={{ fontSize: '12px', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
              Payment Status
            </p>
            <p style={{ fontWeight: 600, color: order.isPaid ? '#10B981' : '#F97316', marginBottom: '16px' }}>
              {order.isPaid ? '✓ Paid' : '⏳ Pending'} {order.paidAt && `on ${new Date(order.paidAt).toLocaleDateString('en-IN')}`}
            </p>
          </div>

          {/* Right Column */}
          <div>
            <p style={{ fontSize: '12px', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
              Delivery Status
            </p>
            <p style={{ fontWeight: 600, color: order.isDelivered ? '#10B981' : '#F97316', marginBottom: '16px' }}>
              {order.isDelivered ? '✓ Delivered' : '⏳ Pending'} {order.deliveredAt && `on ${new Date(order.deliveredAt).toLocaleDateString('en-IN')}`}
            </p>

            <p style={{ fontSize: '12px', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
              Payment Method
            </p>
            <p style={{ fontWeight: 600, color: '#1A1A2E', marginBottom: '16px', textTransform: 'capitalize' }}>
              {order.paymentMethod}
            </p>
          </div>
        </div>

        {/* Pricing Breakdown */}
        <div style={{ background: '#F9FAFB', borderRadius: '12px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '13px' }}>
            <span style={{ color: '#6B7280' }}>Subtotal</span>
            <span style={{ fontWeight: 600, color: '#1A1A2E' }}>₹{order.itemsPrice?.toLocaleString('en-IN')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '13px' }}>
            <span style={{ color: '#6B7280' }}>
              GST (18%)
            </span>
            <span style={{ fontWeight: 600, color: '#1A1A2E' }}>₹{order.gstAmount?.toLocaleString('en-IN')}</span>
          </div>
          {order.deliveryCharges > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '13px' }}>
              <span style={{ color: '#6B7280' }}>Delivery Charges</span>
              <span style={{ fontWeight: 600, color: '#1A1A2E' }}>₹{order.deliveryCharges?.toLocaleString('en-IN')}</span>
            </div>
          )}
          <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '15px' }}>
            <span style={{ color: '#1A1A2E' }}>Total</span>
            <span style={{ color: '#C8102E' }}>₹{order.totalPrice?.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
