import React, { useRef, useState } from 'react';
import Barcode from 'react-barcode';
import { FiDownload, FiPrinter, FiX } from 'react-icons/fi';
import { generateInvoicePDF, formatCurrency, formatDate, getStoreDetails } from '../utils/invoiceUtils';
import toast from 'react-hot-toast';

/**
 * InvoiceModal Component
 * Displays order invoice with details, barcode, and download/print options
 */
export default function InvoiceModal({ isOpen, order, onClose }) {
  const invoiceRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [printing, setPrinting] = useState(false);

  if (!isOpen || !order) return null;

  const store = getStoreDetails();
  const orderDate = formatDate(order.createdAt);
  const deliveryDate = order.deliveredAt ? formatDate(order.deliveredAt) : 'N/A';

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await generateInvoicePDF(
        invoiceRef.current,
        `Invoice_${order.orderNumber}.pdf`,
        true
      );
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      toast.error('Failed to download invoice');
      console.error(error);
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    try {
      setPrinting(true);
      const printWindow = window.open('', '', 'height=800,width=900');
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice - ${order.orderNumber}</title>
            <style>
              body { font-family: 'Segoe UI', Tahoma, sans-serif; margin: 0; padding: 20px; }
              @media print {
                body { margin: 0; padding: 0; }
              }
            </style>
          </head>
          <body>
            ${invoiceRef.current?.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        setPrinting(false);
      }, 250);
    } catch (error) {
      toast.error('Failed to print invoice');
      console.error(error);
      setPrinting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(17, 24, 39, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: '20px',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '900px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 24px 80px rgba(15, 23, 42, 0.25)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px',
          borderBottom: '1px solid #e5e7eb',
          flexShrink: 0,
        }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#1a1a2e' }}>
            Invoice - {order.orderNumber}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '8px',
            }}
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
        }}>
          <div ref={invoiceRef} style={{
            background: 'white',
            padding: '40px',
            fontFamily: "'Segoe UI', Tahoma, Geneva, sans-serif",
          }}>
            {/* Invoice Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '40px',
              paddingBottom: '20px',
              borderBottom: '3px solid #c8102e',
            }}>
              <div>
                <h1 style={{
                  margin: 0,
                  fontSize: '32px',
                  fontWeight: 800,
                  color: '#c8102e',
                }}>
                  INVOICE
                </h1>
                <p style={{
                  margin: '5px 0 0 0',
                  fontSize: '14px',
                  color: '#6b7280',
                }}>
                  Order #{order.orderNumber}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h2 style={{
                  margin: 0,
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#1a1a2e',
                }}>
                  {store.name}
                </h2>
                <p style={{ margin: '5px 0', fontSize: '13px', color: '#6b7280' }}>
                  {store.email}
                </p>
                <p style={{ margin: '5px 0', fontSize: '13px', color: '#6b7280' }}>
                  {store.phone}
                </p>
              </div>
            </div>

            {/* Bill To & Ship To */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '40px',
              marginBottom: '40px',
            }}>
              <div>
                <h4 style={{
                  margin: '0 0 15px 0',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#1a1a2e',
                  textTransform: 'uppercase',
                }}>
                  Bill To
                </h4>
                <p style={{
                  margin: '8px 0',
                  fontWeight: 600,
                  color: '#1a1a2e',
                }}>
                  {order.user?.name || 'N/A'}
                </p>
                <p style={{
                  margin: '8px 0',
                  fontSize: '14px',
                  color: '#6b7280',
                }}>
                  {order.user?.email || 'N/A'}
                </p>
                <p style={{
                  margin: '8px 0',
                  fontSize: '14px',
                  color: '#6b7280',
                }}>
                  {order.user?.phone || 'N/A'}
                </p>
              </div>

              <div>
                <h4 style={{
                  margin: '0 0 15px 0',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#1a1a2e',
                  textTransform: 'uppercase',
                }}>
                  Ship To
                </h4>
                <p style={{
                  margin: '8px 0',
                  fontWeight: 600,
                  color: '#1a1a2e',
                }}>
                  {order.shippingAddress?.fullName || 'N/A'}
                </p>
                <p style={{
                  margin: '8px 0',
                  fontSize: '14px',
                  color: '#6b7280',
                }}>
                  {order.shippingAddress?.street || 'N/A'}
                </p>
                <p style={{
                  margin: '8px 0',
                  fontSize: '14px',
                  color: '#6b7280',
                }}>
                  {order.shippingAddress?.city}, {order.shippingAddress?.state}{' '}
                  {order.shippingAddress?.pincode}
                </p>
              </div>
            </div>

            {/* Order Info */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '20px',
              marginBottom: '40px',
              padding: '20px',
              background: '#f9fafb',
              borderRadius: '12px',
            }}>
              <div>
                <p style={{
                  margin: 0,
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#9ca3af',
                }}>
                  ORDER DATE
                </p>
                <p style={{
                  margin: '8px 0 0 0',
                  fontWeight: 700,
                  color: '#1a1a2e',
                }}>
                  {orderDate}
                </p>
              </div>
              <div>
                <p style={{
                  margin: 0,
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#9ca3af',
                }}>
                  STATUS
                </p>
                <p style={{
                  margin: '8px 0 0 0',
                  fontWeight: 700,
                  color: '#1a1a2e',
                  textTransform: 'capitalize',
                }}>
                  {order.status}
                </p>
              </div>
              <div>
                <p style={{
                  margin: 0,
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#9ca3af',
                }}>
                  PAYMENT
                </p>
                <p style={{
                  margin: '8px 0 0 0',
                  fontWeight: 700,
                  color: order.isPaid ? '#10b981' : '#f97316',
                }}>
                  {order.isPaid ? '✓ PAID' : '⏳ PENDING'}
                </p>
              </div>
              <div>
                <p style={{
                  margin: 0,
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#9ca3af',
                }}>
                  DELIVERY
                </p>
                <p style={{
                  margin: '8px 0 0 0',
                  fontWeight: 700,
                  color: order.isDelivered ? '#10b981' : '#f97316',
                }}>
                  {order.isDelivered ? '✓ Delivered' : '⏳ Pending'}
                </p>
              </div>
            </div>

            {/* Products Table */}
            <div style={{ marginBottom: '40px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#1a1a2e', color: 'white' }}>
                    <th style={{
                      padding: '15px',
                      textAlign: 'left',
                      fontWeight: 700,
                      border: 'none',
                    }}>
                      Product
                    </th>
                    <th style={{
                      padding: '15px',
                      textAlign: 'center',
                      fontWeight: 700,
                      border: 'none',
                    }}>
                      Qty
                    </th>
                    <th style={{
                      padding: '15px',
                      textAlign: 'center',
                      fontWeight: 700,
                      border: 'none',
                    }}>
                      Size
                    </th>
                    <th style={{
                      padding: '15px',
                      textAlign: 'center',
                      fontWeight: 700,
                      border: 'none',
                    }}>
                      Color
                    </th>
                    <th style={{
                      padding: '15px',
                      textAlign: 'right',
                      fontWeight: 700,
                      border: 'none',
                    }}>
                      Price
                    </th>
                    <th style={{
                      padding: '15px',
                      textAlign: 'right',
                      fontWeight: 700,
                      border: 'none',
                    }}>
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.orderItems?.map((item, index) => (
                    <tr
                      key={index}
                      style={{
                        borderBottom: '1px solid #e5e7eb',
                        background: index % 2 === 0 ? '#f9fafb' : 'white',
                      }}
                    >
                      <td style={{
                        padding: '15px',
                        textAlign: 'left',
                        color: '#1a1a2e',
                        fontWeight: 600,
                      }}>
                        {item.name}
                      </td>
                      <td style={{
                        padding: '15px',
                        textAlign: 'center',
                        color: '#6b7280',
                      }}>
                        {item.quantity}
                      </td>
                      <td style={{
                        padding: '15px',
                        textAlign: 'center',
                        color: '#6b7280',
                      }}>
                        {item.size || 'N/A'}
                      </td>
                      <td style={{
                        padding: '15px',
                        textAlign: 'center',
                        color: '#6b7280',
                      }}>
                        {item.color || 'N/A'}
                      </td>
                      <td style={{
                        padding: '15px',
                        textAlign: 'right',
                        color: '#6b7280',
                      }}>
                        {formatCurrency(item.price)}
                      </td>
                      <td style={{
                        padding: '15px',
                        textAlign: 'right',
                        color: '#1a1a2e',
                        fontWeight: 700,
                      }}>
                        {formatCurrency(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginBottom: '40px',
            }}>
              <div style={{ width: '100%', maxWidth: '350px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: '1px solid #e5e7eb',
                }}>
                  <span style={{ color: '#6b7280' }}>Subtotal:</span>
                  <span style={{
                    color: '#1a1a2e',
                    fontWeight: 700,
                  }}>
                    {formatCurrency(order.itemsPrice)}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '12px 0',
                  borderBottom: '1px solid #e5e7eb',
                }}>
                  <span style={{ color: '#6b7280' }}>GST (18%):</span>
                  <span style={{
                    color: '#1a1a2e',
                    fontWeight: 700,
                  }}>
                    {formatCurrency(order.gstAmount)}
                  </span>
                </div>
                {order.deliveryCharges > 0 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '12px 0',
                    borderBottom: '1px solid #e5e7eb',
                  }}>
                    <span style={{ color: '#6b7280' }}>Delivery:</span>
                    <span style={{
                      color: '#1a1a2e',
                      fontWeight: 700,
                    }}>
                      {formatCurrency(order.deliveryCharges)}
                    </span>
                  </div>
                )}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '15px',
                  marginTop: '15px',
                  background: '#c8102e',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '18px',
                  borderRadius: '8px',
                }}>
                  <span>Total:</span>
                  <span>{formatCurrency(order.totalPrice)}</span>
                </div>
              </div>
            </div>

            {/* Barcode */}
            <div style={{
              textAlign: 'center',
              padding: '30px',
              background: '#f9fafb',
              borderRadius: '12px',
              marginBottom: '30px',
            }}>
              <p style={{
                margin: '0 0 15px 0',
                fontSize: '14px',
                fontWeight: 600,
                color: '#6b7280',
                textTransform: 'uppercase',
              }}>
                Tracking Barcode
              </p>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Barcode
                  value={order.orderNumber}
                  width={2}
                  height={50}
                  fontSize={16}
                  margin={10}
                />
              </div>
            </div>

            {/* Footer */}
            <div style={{
              textAlign: 'center',
              paddingTop: '40px',
              borderTop: '2px solid #e5e7eb',
              color: '#9ca3af',
              fontSize: '12px',
            }}>
              <p style={{ margin: '10px 0' }}>Thank you for your purchase!</p>
              <p style={{ margin: '10px 0' }}>{store.address}</p>
              <p style={{ margin: '10px 0' }}>
                Email: {store.email} | Website: {store.website}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          padding: '24px',
          borderTop: '1px solid #e5e7eb',
          background: '#f9fafb',
          flexShrink: 0,
          flexWrap: 'wrap',
        }}>
          <button
            onClick={handleDownload}
            disabled={downloading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: '#c8102e',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '14px',
              opacity: downloading ? 0.7 : 1,
            }}
          >
            <FiDownload size={18} /> {downloading ? 'Downloading...' : 'Download PDF'}
          </button>
          <button
            onClick={handlePrint}
            disabled={printing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '14px',
              opacity: printing ? 0.7 : 1,
            }}
          >
            <FiPrinter size={18} /> {printing ? 'Printing...' : 'Print'}
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '12px 20px',
              background: 'white',
              color: '#1a1a2e',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '14px',
              marginLeft: 'auto',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
