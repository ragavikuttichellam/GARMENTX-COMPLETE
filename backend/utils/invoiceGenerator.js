const PDFDocument = require('pdfkit');
const path = require('path');
const http = require('http');
const https = require('https');
const { generateBarcodeBuffer, generateQrCodeBuffer } = require('./barcodeUtils');

function fetchImageBuffer(url) {
  return new Promise((resolve, reject) => {
    try {
      const client = url.startsWith('https') ? https : http;
      client.get(url, (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve(Buffer.concat(chunks)));
        res.on('error', reject);
      }).on('error', reject);
    } catch (err) { reject(err); }
  });
}

// Create an invoice PDF as a Buffer
async function createInvoicePDF(order, options = {}) {
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  const buffers = [];
  doc.on('data', buffers.push.bind(buffers));
  const finalize = new Promise((resolve) => doc.on('end', () => resolve(Buffer.concat(buffers))));

  try {
    // Header: logo & company
    if (options.logoPath) {
      try {
        if (options.logoPath.startsWith('http')) {
          const buf = await fetchImageBuffer(options.logoPath);
          doc.image(buf, 40, 45, { width: 120 });
        } else {
          doc.image(options.logoPath, 40, 45, { width: 120 });
        }
      } catch (e) {
        console.warn('[INVOICE] logo load failed', e.message);
      }
    }
    doc.fontSize(20).text('TAX INVOICE', 380, 50, { align: 'right' });

    // Company
    doc.fontSize(10).text(options.companyName || 'GarmentX Pvt Ltd', 40, 130);
    doc.text(options.companyAddress || '123 Fashion Street, Mumbai, India');
    doc.moveDown();

    // Invoice meta
    doc.fontSize(10).text(`Invoice #: ${order.invoiceNumber || order.orderNumber}`, 380, 130, { align: 'right' });
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, { align: 'right' });

    // Billing / Shipping
    const ship = order.shippingAddress || {};
    doc.moveDown().fontSize(12).text('Bill To:', 40, 200);
    doc.fontSize(10).text(`${ship.fullName || ''}`, 40);
    doc.text(`${ship.street || ''}`);
    doc.text(`${ship.city || ''} ${ship.state || ''} - ${ship.pincode || ''}`);
    doc.text(`${ship.country || ''}`);
    doc.text(`Phone: ${ship.phone || ''}`);

    if (order.user) {
      doc.fontSize(12).text('Customer:', 320, 200);
      doc.fontSize(10).text(order.user.name || '', 320);
      doc.text(order.user.email || '');
      doc.text(order.user.phone || '');
    }

    // Table header
    const tableTop = 300;
    doc.fontSize(10).text('Item', 40, tableTop);
    doc.text('Qty', 320, tableTop, { width: 50, align: 'right' });
    doc.text('Price', 380, tableTop, { width: 80, align: 'right' });
    doc.text('Total', 470, tableTop, { width: 80, align: 'right' });
    doc.moveTo(40, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    let y = tableTop + 25;
    for (const item of order.orderItems) {
      doc.fontSize(10).text(item.name, 40, y);
      doc.text(String(item.quantity), 320, y, { width: 50, align: 'right' });
      doc.text(`₹${(item.price || 0).toLocaleString('en-IN')}`, 380, y, { width: 80, align: 'right' });
      doc.text(`₹${((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}`, 470, y, { width: 80, align: 'right' });
      y += 20;
      if (y > 700) { doc.addPage(); y = 50; }
    }

    // Totals
    const subTotal = order.itemsPrice || order.orderItems.reduce((s, it) => s + ((it.price || 0)*(it.quantity||1)), 0);
    const gst = Math.round((order.gstAmount != null) ? order.gstAmount : (subTotal * 0.18));
    const grand = order.totalPrice || (subTotal + gst + (order.deliveryCharges || 0));

    doc.moveTo(300, y + 6).lineTo(550, y + 6).stroke();
    doc.fontSize(10).text('Subtotal', 380, y + 14, { width: 80, align: 'right' });
    doc.text(`₹${subTotal.toLocaleString('en-IN')}`, 470, y + 14, { width: 80, align: 'right' });
    doc.fontSize(10).text('GST (18%)', 380, y + 34, { width: 80, align: 'right' });
    doc.text(`₹${gst.toLocaleString('en-IN')}`, 470, y + 34, { width: 80, align: 'right' });
    if (order.deliveryCharges) {
      doc.fontSize(10).text('Delivery', 380, y + 54, { width: 80, align: 'right' });
      doc.text(`₹${order.deliveryCharges.toLocaleString('en-IN')}`, 470, y + 54, { width: 80, align: 'right' });
    }
    doc.fontSize(12).text('Total', 380, y + 80, { width: 80, align: 'right' });
    doc.fontSize(12).text(`₹${grand.toLocaleString('en-IN')}`, 470, y + 80, { width: 80, align: 'right' });

    // Payment & order status
    doc.fontSize(10).text(`Payment: ${order.paymentStatus || (order.isPaid ? 'Paid' : 'Pending')}`, 40, y + 40);
    doc.text(`Payment Method: ${order.paymentMethod || 'N/A'}`, 40, y + 50);
    doc.text(`Order Status: ${order.status}`, 40, y + 60);
    doc.text(`Courier: ${order.courierDetails?.provider || 'N/A'}`, 40, y + 70);

    // Barcode for tracking ID or order number
    const tracking = order.courierDetails?.trackingId || order.courierDetails?.awbNumber || order.orderNumber;
    if (tracking) {
      try {
        const code = await generateBarcodeBuffer(tracking, { includetext: true });
        // place barcode near bottom
        doc.image(code, 40, y + 110, { width: 220 });
        doc.fontSize(8).text(`Tracking: ${tracking}`, 40, y + 110 + 80);
      } catch (e) {
        console.warn('[INVOICE] barcode generation failed', e.message);
      }
    }

    try {
      const qrPayload = JSON.stringify({
        orderNumber: order.orderNumber,
        invoiceNumber: order.invoiceNumber || order.orderNumber,
        tracking
      });
      const qr = await generateQrCodeBuffer(qrPayload);
      doc.image(qr, 430, y + 105, { width: 90 });
      doc.fontSize(8).text('Invoice QR', 430, y + 198, { width: 90, align: 'center' });
    } catch (e) {
      console.warn('[INVOICE] QR generation failed', e.message);
    }

    // Footer
    doc.fontSize(10).text(options.footerMessage || 'Thanks for shopping with GarmentX!', 40, 760, { align: 'center', width: 520 });

  } catch (err) {
    console.error('[INVOICE] generation error', err);
    doc.fontSize(10).text('Error generating invoice', 40, 200);
  } finally {
    doc.end();
  }

  return finalize;
}

module.exports = { createInvoicePDF };
