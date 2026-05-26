import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FiCopy, FiDownload, FiPrinter, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import BarcodeComponent from './BarcodeComponent';
import { formatCurrency, formatDate, generateInvoicePDF, getStoreDetails } from '../../utils/invoiceUtils';

const statusColor = {
  pending: ['#92400e', '#fef3c7'],
  paid: ['#047857', '#d1fae5'],
  failed: ['#b91c1c', '#fee2e2'],
  refunded: ['#374151', '#f3f4f6'],
  delivered: ['#047857', '#d1fae5'],
  cancelled: ['#b91c1c', '#fee2e2'],
};

function getAddress(address = {}) {
  return [
    address.street || address.address,
    [address.city, address.state, address.pincode || address.postalCode].filter(Boolean).join(', '),
    address.country,
  ].filter(Boolean);
}

function getItemImage(item) {
  return item.image || item.product?.image || item.product?.images?.[0] || '';
}

export default function InvoiceModal({ order, isOpen, onClose, autoAction = null, onAutoActionDone }) {
  const invoiceRef = useRef(null);
  const autoRanRef = useRef(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const storeDetails = getStoreDetails();

  const invoiceId = order?.invoiceNumber || order?.orderNumber || order?._id;
  const barcodeValue = order?.orderNumber || order?.barcode || order?._id;
  const items = useMemo(() => order?.orderItems || order?.items || [], [order]);
  const subtotal = Number(order?.itemsPrice || items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0));
  const gstAmount = Number(order?.gstAmount || 0);
  const delivery = Number(order?.deliveryCharges || order?.shippingPrice || 0);
  const total = Number(order?.totalPrice || subtotal + gstAmount + delivery);
  const paymentStatus = order?.paymentStatus || (order?.isPaid ? 'paid' : 'pending');
  const orderStatus = order?.status || order?.shippingStatus || 'pending';
  const customerName = order?.user?.name || order?.shippingAddress?.fullName || 'Customer';
  const customerEmail = order?.user?.email || order?.email || 'Not provided';
  const addressLines = getAddress(order?.shippingAddress);

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current || !order) return;

    try {
      setIsGenerating(true);
      await generateInvoicePDF(invoiceRef.current, `Invoice-${invoiceId}.pdf`, true);
      toast.success('Invoice downloaded');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate invoice PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    if (!invoiceRef.current || !order) return;

    const printWindow = window.open('', '', 'height=900,width=1000');
    if (!printWindow) {
      toast.error('Popup blocked by browser');
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${invoiceId}</title>
          <style>
            body { margin: 0; background: #fff; font-family: Arial, sans-serif; }
            img { max-width: 100%; }
            @page { margin: 16mm; }
          </style>
        </head>
        <body>${invoiceRef.current.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 300);
    toast.success('Opening print preview');
  };

  useEffect(() => {
    autoRanRef.current = false;
  }, [autoAction, order?._id]);

  useEffect(() => {
    if (!isOpen || !order || !autoAction || autoRanRef.current) return;
    autoRanRef.current = true;
    const timer = setTimeout(async () => {
      if (autoAction === 'download') await handleDownloadPDF();
      if (autoAction === 'print') handlePrint();
      onAutoActionDone?.();
    }, 350);
    return () => clearTimeout(timer);
  }, [autoAction, isOpen, order]);

  if (!isOpen || !order) return null;

  const copyInvoiceNumber = async () => {
    try {
      await navigator.clipboard.writeText(invoiceId);
      toast.success('Invoice number copied');
    } catch {
      toast.error('Unable to copy invoice number');
    }
  };

  const [paymentTextColor, paymentBg] = statusColor[paymentStatus] || statusColor.pending;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(17,24,39,0.62)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '18px' }}>
      <div style={{ background: 'white', borderRadius: '10px', width: '100%', maxWidth: '980px', maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 80px rgba(15,23,42,0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', padding: '16px 20px', borderBottom: '1px solid #e5e7eb' }}>
          <div>
            <h2 style={{ color: '#111827', margin: '0 0 4px', fontSize: '20px' }}>Invoice</h2>
            <button onClick={copyInvoiceNumber} style={{ border: 'none', background: 'transparent', color: '#c8102e', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: 0, fontWeight: 700 }}>
              <span>{invoiceId}</span>
              <FiCopy size={14} />
            </button>
          </div>
          <button onClick={onClose} aria-label="Close invoice" style={{ border: '1px solid #e5e7eb', background: '#fff', borderRadius: '8px', width: '36px', height: '36px', cursor: 'pointer', display: 'grid', placeItems: 'center', color: '#374151' }}>
            <FiX size={18} />
          </button>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '24px', background: '#f8fafc' }}>
          <div ref={invoiceRef} style={{ background: 'white', color: '#111827', maxWidth: '860px', margin: '0 auto', padding: '30px', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '24px', borderBottom: '3px solid #c8102e', paddingBottom: '20px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                {storeDetails.logo ? (
                  <img src={storeDetails.logo} alt={storeDetails.name} style={{ width: '58px', height: '58px', objectFit: 'contain' }} crossOrigin="anonymous" />
                ) : (
                  <div style={{ width: '58px', height: '58px', background: '#c8102e', color: 'white', borderRadius: '8px', display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: '18px' }}>GX</div>
                )}
                <div>
                  <h1 style={{ color: '#c8102e', fontSize: '28px', margin: '0 0 6px' }}>{storeDetails.name}</h1>
                  <p style={{ color: '#4b5563', fontSize: '12px', lineHeight: 1.6, margin: 0 }}>
                    {storeDetails.address}<br />
                    Phone: {storeDetails.phone}<br />
                    Email: {storeDetails.email}<br />
                    Website: {storeDetails.website}<br />
                    GST: {storeDetails.gstNumber}
                  </p>
                </div>
              </div>
              <div style={{ textAlign: 'right', minWidth: '220px' }}>
                <p style={{ margin: '0 0 6px', color: '#6b7280', fontSize: '12px', fontWeight: 800 }}>ORDER ID</p>
                <p style={{ margin: '0 0 14px', fontWeight: 900 }}>{order.orderNumber || order._id}</p>
                <p style={{ margin: '0 0 6px', color: '#6b7280', fontSize: '12px', fontWeight: 800 }}>DATE</p>
                <p style={{ margin: 0 }}>{formatDate(order.createdAt || new Date())}</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '26px' }}>
              <div>
                <h3 style={{ color: '#6b7280', fontSize: '12px', fontWeight: 900, margin: '0 0 10px' }}>CUSTOMER</h3>
                <p style={{ margin: '0 0 4px', fontWeight: 800 }}>{customerName}</p>
                <p style={{ margin: '0 0 4px', color: '#4b5563', fontSize: '13px' }}>{customerEmail}</p>
                <p style={{ margin: 0, color: '#4b5563', fontSize: '13px' }}>{order.shippingAddress?.phone}</p>
              </div>
              <div>
                <h3 style={{ color: '#6b7280', fontSize: '12px', fontWeight: 900, margin: '0 0 10px' }}>SHIPPING ADDRESS</h3>
                {addressLines.length ? addressLines.map((line) => (
                  <p key={line} style={{ margin: '0 0 4px', color: '#374151', fontSize: '13px' }}>{line}</p>
                )) : <p style={{ margin: 0, color: '#6b7280' }}>Not provided</p>}
              </div>
              <div>
                <h3 style={{ color: '#6b7280', fontSize: '12px', fontWeight: 900, margin: '0 0 10px' }}>PAYMENT</h3>
                <p style={{ margin: '0 0 8px', textTransform: 'capitalize', fontWeight: 800 }}>{order.paymentMethod || 'Not provided'}</p>
                <span style={{ background: paymentBg, color: paymentTextColor, borderRadius: '999px', padding: '5px 10px', fontSize: '12px', fontWeight: 900, textTransform: 'capitalize' }}>{paymentStatus}</span>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#fff1f2', borderBottom: '1px solid #fecdd3' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Product</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Qty</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Price</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => {
                  const image = getItemImage(item);
                  const quantity = Number(item.quantity || item.qty || 0);
                  const price = Number(item.price || 0);
                  return (
                    <tr key={`${item._id || item.product?._id || index}`} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          {image ? (
                            <img src={image} alt={item.name || item.product?.name || 'Product'} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e5e7eb' }} crossOrigin="anonymous" />
                          ) : (
                            <div style={{ width: '48px', height: '48px', borderRadius: '6px', background: '#f3f4f6', border: '1px solid #e5e7eb' }} />
                          )}
                          <div>
                            <div style={{ fontWeight: 800 }}>{item.name || item.product?.name || 'Product'}</div>
                            <div style={{ color: '#6b7280', fontSize: '12px' }}>{[item.size && `Size: ${item.size}`, item.color && `Color: ${item.color}`].filter(Boolean).join(' | ')}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>{quantity}</td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>{formatCurrency(price)}</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: 800 }}>{formatCurrency(price * quantity)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(240px, 340px)', gap: '24px', alignItems: 'start' }}>
              <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                <BarcodeComponent value={barcodeValue} size="lg" />
                <p style={{ margin: '8px 0 0', color: '#6b7280', fontSize: '12px' }}>Barcode generated from order ID</p>
              </div>
              <div style={{ borderTop: '2px solid #111827' }}>
                {[
                  ['Subtotal', subtotal],
                  ['GST', gstAmount],
                  ['Delivery', delivery],
                ].map(([label, value]) => value > 0 && (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #e5e7eb' }}>
                    <span style={{ color: '#4b5563', fontWeight: 700 }}>{label}</span>
                    <span>{formatCurrency(value)}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0', color: '#c8102e', fontSize: '18px', fontWeight: 900 }}>
                  <span>Total Amount</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', color: '#374151', fontSize: '13px' }}>
                  <span>Order Status</span>
                  <span style={{ fontWeight: 800, textTransform: 'capitalize' }}>{String(orderStatus).replaceAll('_', ' ')}</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '28px', paddingTop: '18px', borderTop: '1px solid #e5e7eb', textAlign: 'center', color: '#6b7280', fontSize: '12px', lineHeight: 1.6 }}>
              <p style={{ margin: 0 }}>Thank you for shopping with {storeDetails.name}.</p>
              <p style={{ margin: '6px 0 0' }}>This is a computer-generated invoice.</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', padding: '16px 20px', borderTop: '1px solid #e5e7eb', background: '#fff', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button onClick={handlePrint} style={{ padding: '10px 16px', border: '1px solid #e5e7eb', background: '#111827', color: 'white', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <FiPrinter size={16} /> Print Invoice
          </button>
          <button onClick={handleDownloadPDF} disabled={isGenerating} style={{ padding: '10px 16px', border: 'none', background: isGenerating ? '#9ca3af' : '#c8102e', color: 'white', borderRadius: '8px', fontWeight: 800, cursor: isGenerating ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <FiDownload size={16} /> {isGenerating ? 'Generating...' : 'Download PDF'}
          </button>
        </div>
      </div>
    </div>
  );
}
