import React, { useState } from 'react';
import Barcode from 'react-barcode';
import { FiEye, FiX } from 'react-icons/fi';

/**
 * BarcodeComponent
 * Displays order barcode with preview modal
 */
export default function BarcodeComponent({ orderNumber, size = 'small' }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: size === 'small' ? '6px 12px' : '10px 16px',
          background: '#f3f4f6',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          fontWeight: 600,
          cursor: 'pointer',
          fontSize: size === 'small' ? '12px' : '14px',
          color: '#1a1a2e',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.target.style.background = '#e5e7eb';
          e.target.style.borderColor = '#9ca3af';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = '#f3f4f6';
          e.target.style.borderColor = '#d1d5db';
        }}
      >
        <FiEye size={size === 'small' ? 14 : 16} />
        {size === 'large' && 'View Barcode'}
      </button>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(17, 24, 39, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 40,
          padding: '20px',
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '40px',
            maxWidth: '400px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 24px 80px rgba(15, 23, 42, 0.25)',
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '30px',
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: 700,
                color: '#1a1a2e',
              }}>
                Order Barcode
              </h3>
              <button
                onClick={() => setShowModal(false)}
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

            {/* Barcode */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '30px',
              padding: '30px',
              background: '#f9fafb',
              borderRadius: '12px',
            }}>
              <Barcode
                value={orderNumber}
                width={2}
                height={60}
                fontSize={18}
                margin={15}
              />
            </div>

            {/* Order Number */}
            <p style={{
              margin: '0 0 20px 0',
              fontSize: '14px',
              color: '#6b7280',
              fontWeight: 600,
            }}>
              Order #{orderNumber}
            </p>

            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              style={{
                width: '100%',
                padding: '12px',
                background: '#c8102e',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
