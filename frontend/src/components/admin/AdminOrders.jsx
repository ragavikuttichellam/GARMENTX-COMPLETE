import React, { useState } from 'react';
import { FiChevronRight, FiDownload, FiFileText, FiPackage, FiPrinter } from 'react-icons/fi';
import BarcodeComponent from './BarcodeComponent';
import InvoiceModal from './InvoiceModal';
import { formatCurrency } from '../../utils/invoiceUtils';

const statusStyles = {
  pending: ['#92400e', '#fef3c7'],
  confirmed: ['#1d4ed8', '#dbeafe'],
  processing: ['#6d28d9', '#ede9fe'],
  packed: ['#0f766e', '#ccfbf1'],
  shipped: ['#c2410c', '#ffedd5'],
  out_for_delivery: ['#0369a1', '#e0f2fe'],
  delivered: ['#047857', '#d1fae5'],
  paid: ['#047857', '#d1fae5'],
  failed: ['#b91c1c', '#fee2e2'],
  refunded: ['#374151', '#f3f4f6'],
  cancelled: ['#b91c1c', '#fee2e2'],
};

function StatusBadge({ status }) {
  const normalized = status || 'pending';
  const [color, background] = statusStyles[normalized] || statusStyles.pending;
  return (
    <span style={{ display: 'inline-flex', padding: '5px 10px', borderRadius: '999px', color, background, fontSize: '12px', fontWeight: 800, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>
      {String(normalized).replaceAll('_', ' ')}
    </span>
  );
}

const actionButtonBase = {
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '8px 10px',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  fontWeight: 800,
  fontSize: '12px',
  whiteSpace: 'nowrap',
};

export default function AdminOrders({ orders = [], loading, onOpenOrder }) {
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceAction, setInvoiceAction] = useState(null);

  const handleInvoiceAction = (order, action = null) => {
    setSelectedInvoice(order);
    setInvoiceAction(action);
    setShowInvoiceModal(true);
  };

  const closeInvoice = () => {
    setShowInvoiceModal(false);
    setInvoiceAction(null);
  };

  if (loading) {
    return <div style={{ background: 'white', borderRadius: '12px', padding: '32px', textAlign: 'center', color: '#6b7280' }}>Loading orders...</div>;
  }

  if (!orders.length) {
    return (
      <div style={{ background: 'white', borderRadius: '12px', padding: '48px 24px', textAlign: 'center', border: '1px solid #e5e7eb' }}>
        <FiPackage size={42} style={{ color: '#9ca3af', marginBottom: '12px' }} />
        <h3 style={{ color: '#111827', marginBottom: '6px' }}>No orders found</h3>
        <p style={{ color: '#6b7280' }}>New customer orders will appear here.</p>
      </div>
    );
  }

  return (
    <>
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 8px 24px rgba(15,23,42,0.06)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1220px' }}>
            <thead>
              <tr style={{ background: '#fff1f2', borderBottom: '1px solid #fecdd3' }}>
                {['Order', 'Customer', 'Package', 'Amount', 'Status', 'Payment', 'Invoice', 'Barcode', ''].map((heading) => (
                  <th key={heading} style={{ padding: '14px 16px', textAlign: 'left', color: '#7f1d1d', fontSize: '12px', fontWeight: 900, textTransform: 'uppercase' }}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const orderCode = order.orderNumber || order.barcode || order._id;
                return (
                  <tr key={order._id} style={{ borderTop: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '16px', fontWeight: 900, color: '#111827' }}>{orderCode}</td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 800, color: '#111827' }}>{order.user?.name || order.shippingAddress?.fullName || 'Customer'}</div>
                      <div style={{ color: '#6b7280', fontSize: '12px' }}>{order.user?.email || order.shippingAddress?.phone || 'No email'}</div>
                    </td>
                    <td style={{ padding: '16px', color: '#374151', fontSize: '13px' }}>{order.courierDetails?.provider || order.packageId || '-'}</td>
                    <td style={{ padding: '16px', fontWeight: 900, color: '#c8102e' }}>{formatCurrency(order.totalPrice)}</td>
                    <td style={{ padding: '16px' }}><StatusBadge status={order.status} /></td>
                    <td style={{ padding: '16px' }}><StatusBadge status={order.paymentStatus || (order.isPaid ? 'paid' : 'pending')} /></td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button onClick={() => handleInvoiceAction(order)} style={{ ...actionButtonBase, background: '#fff1f2', color: '#c8102e', borderColor: '#fecdd3' }} title="View invoice">
                          <FiFileText size={14} /> View Invoice
                        </button>
                        <button onClick={() => handleInvoiceAction(order, 'download')} style={{ ...actionButtonBase, background: '#c8102e', color: 'white', borderColor: '#c8102e' }} title="Download invoice PDF">
                          <FiDownload size={14} /> Download PDF
                        </button>
                        <button onClick={() => handleInvoiceAction(order, 'print')} style={{ ...actionButtonBase, background: '#111827', color: 'white', borderColor: '#111827' }} title="Print invoice">
                          <FiPrinter size={14} /> Print Invoice
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', justifyContent: 'center', padding: '6px', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#fff' }}>
                        <BarcodeComponent value={orderCode} size="sm" />
                      </div>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      {onOpenOrder && (
                        <button onClick={() => onOpenOrder(order._id)} style={{ border: 'none', background: 'transparent', color: '#c8102e', fontWeight: 900, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '14px' }}>
                          More <FiChevronRight size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <InvoiceModal
        order={selectedInvoice}
        isOpen={showInvoiceModal}
        onClose={closeInvoice}
        autoAction={invoiceAction}
        onAutoActionDone={() => setInvoiceAction(null)}
      />
    </>
  );
}
