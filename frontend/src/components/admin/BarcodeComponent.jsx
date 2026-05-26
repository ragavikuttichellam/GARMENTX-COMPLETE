import React from 'react';
import Barcode from 'react-barcode';

export default function BarcodeComponent({ value, format = 'CODE128', size = 'md', className = '' }) {
  if (!value) {
    return (
      <div style={{ padding: '10px', background: '#f3f4f6', borderRadius: '6px', textAlign: 'center', color: '#6b7280' }}>
        No barcode data available
      </div>
    );
  }

  const sizeStyles = {
    sm: { barWidth: 1, height: 28, fontSize: 8, margin: 2 },
    md: { barWidth: 1.4, height: 46, fontSize: 11, margin: 4 },
    lg: { barWidth: 1.8, height: 62, fontSize: 13, margin: 6 },
    xl: { barWidth: 2.2, height: 90, fontSize: 15, margin: 8 },
  };

  const config = sizeStyles[size] || sizeStyles.md;

  return (
    <div
      className={className}
      style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', maxWidth: '100%', overflow: 'hidden' }}
      title={`Barcode: ${value}`}
    >
      <Barcode
        value={String(value)}
        format={format}
        width={config.barWidth}
        height={config.height}
        displayValue={true}
        fontSize={config.fontSize}
        margin={config.margin}
      />
    </div>
  );
}
