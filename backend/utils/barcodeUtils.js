const bwipjs = require('bwip-js');

/**
 * Generate a barcode image buffer using bwip-js
 * Supports Code128, Code39, QR codes, and other formats
 */
async function generateBarcodeBuffer(value, opts = {}) {
  if (!value) throw new Error('No value provided for barcode generation');
  const options = Object.assign({
    bcid: 'code128',
    text: String(value),
    scale: 3,
    height: 10,
    includetext: true,
    textxalign: 'center',
    backgroundcolor: 'FFFFFF'
  }, opts);

  return new Promise((resolve, reject) => {
    bwipjs.toBuffer(options, (err, png) => {
      if (err) return reject(err);
      resolve(png);
    });
  });
}

/**
 * Generate multiple barcodes in batch
 * Useful for printing labels in bulk
 */
async function generateBarcodeBufferBatch(values, opts = {}) {
  if (!Array.isArray(values) || values.length === 0) {
    throw new Error('Array of values required for batch generation');
  }
  return Promise.all(values.map(val => generateBarcodeBuffer(val, opts)));
}

/**
 * Extract all possible scan codes from an order
 * Used for matching against scanner input
 */
function getOrderScanCodes(order) {
  return [
    order.orderNumber,
    order.barcode,
    order.qrCode,
    order.packageId,
    order.courierDetails?.trackingId,
    order.courierDetails?.awbNumber
  ].filter(Boolean).map(String);
}

/**
 * Generate QR code from data (typically JSON)
 */
async function generateQrCodeBuffer(value, opts = {}) {
  return generateBarcodeBuffer(value, {
    bcid: 'qrcode',
    scale: 5,
    includetext: false,
    ...opts
  });
}

/**
 * Validate a barcode format
 */
function validateBarcodeFormat(barcode, format = 'code128') {
  if (!barcode) return false;
  const str = String(barcode).trim();
  
  const patterns = {
    code128: /^[a-zA-Z0-9\-\.]{1,}$/, // Code128 is very flexible
    code39: /^[A-Z0-9\s\.\-\$\/\+\%]{1,}$/,
    ean13: /^\d{13}$/,
    ean8: /^\d{8}$/,
    upca: /^\d{12}$/
  };
  
  const pattern = patterns[format] || patterns.code128;
  return pattern.test(str);
}

/**
 * Generate comprehensive barcode data for an order
 */
function generateOrderBarcodeData(order) {
  return {
    orderNumber: order.orderNumber,
    invoiceNumber: order.invoiceNumber,
    packageId: order.packageId,
    trackingId: order.courierDetails?.trackingId,
    awbNumber: order.courierDetails?.awbNumber,
    customerName: order.shippingAddress?.fullName,
    destination: `${order.shippingAddress?.city}, ${order.shippingAddress?.state}`,
    weight: 'N/A', // Can be added to order schema
    generatedAt: new Date().toISOString()
  };
}

module.exports = {
  generateBarcodeBuffer,
  generateBarcodeBufferBatch,
  generateQrCodeBuffer,
  getOrderScanCodes,
  validateBarcodeFormat,
  generateOrderBarcodeData
};
