import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiDownload, FiPrinter, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { adminAPI } from '../../utils/api';
import AdminDashboard from './AdminDashboard';
import AdminOrders from './AdminOrders';
import BarcodeScanner from './BarcodeScanner';
import InvoiceDetails from './InvoiceDetails';
import ShippingLabel from './ShippingLabel';
import OrderTracking from './OrderTracking';

/**
 * Main Admin Panel Component
 * Orchestrates all admin features in a cohesive interface
 * 
 * Features:
 * - Dashboard with analytics
 * - Orders management
 * - Barcode scanning
 * - Invoice management
 * - Shipping label generation
 * - Order tracking and scan history
 */
export default function AdminPanel() {
  const [view, setView] = useState('dashboard'); // dashboard, orders, scanner
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ status: '', page: 1, limit: 20 });

  useEffect(() => {
    if (view === 'orders') {
      fetchOrders();
    }
  }, [view, filters]);

  /**
   * Fetch orders with filters
   */
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v)
      );
      const { data } = await adminAPI.getAllOrders(params);
      setOrders(data.orders);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle order selection
   */
  const handleOpenOrder = async (orderId) => {
    try {
      const { data } = await adminAPI.getOrderById(orderId);
      setSelectedOrder(data.order);
    } catch (err) {
      toast.error('Failed to load order');
    }
  };

  /**
   * Handle scan completion
   */
  const handleScanComplete = async (order) => {
    setSelectedOrder(order);
    if (view === 'orders') {
      await fetchOrders();
    }
  };

  /**
   * Download invoice
   */
  const handleDownloadInvoice = async () => {
    if (!selectedOrder) return;
    try {
      const blob = await adminAPI.getInvoice(selectedOrder._id, false);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${selectedOrder.orderNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      toast.success('Invoice downloaded');
    } catch (err) {
      toast.error('Failed to download invoice');
    }
  };

  /**
   * Download shipping label
   */
  const handleDownloadLabel = async () => {
    if (!selectedOrder) return;
    try {
      const blob = await adminAPI.getShippingLabel(selectedOrder._id, false);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `shipping_label_${selectedOrder.orderNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      toast.success('Shipping label downloaded');
    } catch (err) {
      toast.error('Failed to download label');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F3F4F6' }}>
      {/* Navigation Tabs */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #E5E7EB',
        position: 'sticky',
        top: 0,
        zIndex: 40
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          gap: '32px',
          alignItems: 'center'
        }}>
          {/* Back Button - Show when order is selected */}
          {selectedOrder && (
            <button
              onClick={() => setSelectedOrder(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#6B7280',
                cursor: 'pointer',
                padding: '16px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 700
              }}
            >
              <FiArrowLeft size={18} /> Back
            </button>
          )}

          {/* Navigation Tabs */}
          {!selectedOrder && (
            <>
              {[
                ['dashboard', '📊 Dashboard'],
                ['orders', '📦 Orders'],
                ['scanner', '📱 Scanner']
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setView(key)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '16px 0',
                    borderBottom: view === key ? '3px solid #C8102E' : 'none',
                    color: view === key ? '#C8102E' : '#6B7280',
                    fontWeight: view === key ? 800 : 600,
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {label}
                </button>
              ))}
            </>
          )}

          {/* Order Title - Show when order is selected */}
          {selectedOrder && (
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#111827' }}>
                Order {selectedOrder.orderNumber}
              </h2>
              <p style={{ fontSize: '12px', color: '#6B7280' }}>
                {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN')}
              </p>
            </div>
          )}

          {/* Refresh Button - Show when order is selected */}
          {selectedOrder && (
            <button
              onClick={() => handleOpenOrder(selectedOrder._id)}
              style={{
                marginLeft: 'auto',
                background: 'none',
                border: 'none',
                color: '#6B7280',
                cursor: 'pointer',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                fontSize: '18px'
              }}
            >
              <FiRefreshCw />
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '32px 24px'
      }}>
        {/* Dashboard View */}
        {!selectedOrder && view === 'dashboard' && (
          <AdminDashboard />
        )}

        {/* Orders List View */}
        {!selectedOrder && view === 'orders' && (
          <div style={{ display: 'grid', gap: '24px' }}>
            {/* Filter Bar */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid #E5E7EB',
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              alignItems: 'center'
            }}>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                style={{
                  padding: '10px 12px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600
                }}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="packed">Packed</option>
                <option value="shipped">Shipped</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
              </select>
              <button
                onClick={fetchOrders}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  background: 'white',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                <FiRefreshCw style={{ display: 'inline', marginRight: '6px' }} />
                Refresh
              </button>
            </div>

            {/* Orders Table */}
            <AdminOrders
              orders={orders}
              loading={loading}
              onOpenOrder={handleOpenOrder}
            />
          </div>
        )}

        {/* Barcode Scanner View */}
        {!selectedOrder && view === 'scanner' && (
          <div style={{ display: 'grid', gap: '24px' }}>
            <BarcodeScanner onScanComplete={handleScanComplete} />

            {/* Recent Scans Info */}
            <div style={{
              background: '#F0FDF4',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid #86EFAC'
            }}>
              <h3 style={{ color: '#15803D', fontWeight: 800, marginBottom: '8px' }}>
                ✓ Scanner Ready
              </h3>
              <p style={{ color: '#22C55E', fontSize: '13px' }}>
                Point camera at barcode or paste tracking code to begin scanning
              </p>
            </div>
          </div>
        )}

        {/* Order Detail View */}
        {selectedOrder && (
          <div style={{ display: 'grid', gap: '24px' }}>
            {/* Action Buttons */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '12px'
            }}>
              <button
                onClick={handleDownloadInvoice}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  background: 'white',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                <FiDownload size={16} /> Invoice
              </button>
              <button
                onClick={handleDownloadLabel}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  background: 'white',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                <FiPrinter size={16} /> Label
              </button>
              <button
                onClick={() => setShowInvoiceModal(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#C8102E',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                View Invoice
              </button>
            </div>

            {/* Order Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* Left Column */}
              <div style={{ display: 'grid', gap: '24px' }}>
                <ShippingLabel order={selectedOrder} />
                <OrderTracking order={selectedOrder} />
              </div>

              {/* Right Column */}
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid #E5E7EB',
                height: 'fit-content'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', marginBottom: '16px' }}>
                  Order Summary
                </h3>

                {/* Customer Info */}
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ fontSize: '12px', color: '#6B7280', fontWeight: 700, marginBottom: '4px' }}>
                    CUSTOMER
                  </p>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>
                    {selectedOrder.user?.name || selectedOrder.shippingAddress?.fullName}
                  </p>
                  <p style={{ fontSize: '12px', color: '#6B7280' }}>
                    {selectedOrder.user?.email}
                  </p>
                </div>

                {/* Status Info */}
                <div style={{ marginBottom: '20px' }}>
                  <p style={{ fontSize: '12px', color: '#6B7280', fontWeight: 700, marginBottom: '4px' }}>
                    STATUS
                  </p>
                  <div style={{
                    display: 'inline-block',
                    background: '#FEF2F2',
                    color: '#C8102E',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '12px',
                    textTransform: 'capitalize'
                  }}>
                    {selectedOrder.status?.replace(/_/g, ' ')}
                  </div>
                </div>

                {/* Amount Info */}
                <div style={{
                  borderTop: '1px solid #E5E7EB',
                  paddingTop: '16px'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px'
                  }}>
                    <span style={{ color: '#6B7280' }}>Subtotal</span>
                    <span style={{ fontWeight: 700, color: '#111827' }}>
                      ₹{selectedOrder.itemsPrice?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px'
                  }}>
                    <span style={{ color: '#6B7280' }}>GST (18%)</span>
                    <span style={{ fontWeight: 700, color: '#111827' }}>
                      ₹{selectedOrder.gstAmount?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderTop: '2px solid #E5E7EB',
                    paddingTop: '8px'
                  }}>
                    <span style={{ fontWeight: 800, color: '#111827' }}>Total</span>
                    <span style={{ fontWeight: 800, color: '#C8102E', fontSize: '16px' }}>
                      ₹{selectedOrder.totalPrice?.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Invoice Modal */}
      {showInvoiceModal && (
        <InvoiceDetails
          order={selectedOrder}
          onClose={() => setShowInvoiceModal(false)}
        />
      )}
    </div>
  );
}
