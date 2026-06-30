const PDFDocument = require('pdfkit');
const { generateBarcodeBuffer, generateQrCodeBuffer } = require('./barcodeUtils');

async function createShippingLabelPDF(order, options = {}) {
  const doc = new PDFDocument({ size: [288, 432], margin: 18 });
  const buffers = [];
  doc.on('data', buffers.push.bind(buffers));
  const finalize = new Promise((resolve) => doc.on('end', () => resolve(Buffer.concat(buffers))));

  const ship = order.shippingAddress || {};
  const courier = order.courierDetails || {};
  const tracking = courier.trackingId || courier.awbNumber || order.packageId || order.orderNumber;

  try {
    doc.fontSize(16).font('Helvetica-Bold').text(options.companyName || 'Manisara World', 18, 18);
    doc.fontSize(9).font('Helvetica').text('Shipping Label', 18, 38);
    doc.moveTo(18, 56).lineTo(270, 56).stroke();

    doc.fontSize(8).text('SHIP TO', 18, 70);
    doc.fontSize(12).font('Helvetica-Bold').text(ship.fullName || '', 18, 84);
    doc.fontSize(10).font('Helvetica').text(ship.street || '', 18, 104, { width: 245 });
    doc.text(`${ship.city || ''}, ${ship.state || ''} - ${ship.pincode || ''}`, { width: 245 });
    doc.text(ship.country || 'India');
    doc.text(`Phone: ${ship.phone || ''}`);

    doc.moveTo(18, 168).lineTo(270, 168).stroke();
    doc.fontSize(9).text(`Order: ${order.orderNumber}`, 18, 182);
    doc.text(`Package: ${order.packageId || order.orderNumber}`);
    doc.text(`Courier: ${courier.provider || 'Not assigned'}`);
    doc.text(`Service: ${courier.service || 'Standard'}`);
    doc.text(`AWB: ${courier.awbNumber || tracking}`);

    const barcode = await generateBarcodeBuffer(tracking, { scale: 2, height: 12, includetext: true });
    doc.image(barcode, 24, 250, { width: 235 });

    const qr = await generateQrCodeBuffer(JSON.stringify({
      orderNumber: order.orderNumber,
      packageId: order.packageId,
      tracking
    }), { scale: 4 });
    doc.image(qr, 96, 342, { width: 80 });
    doc.fontSize(7).text('Scan to verify package', 18, 410, { width: 252, align: 'center' });
  } catch (err) {
    doc.fontSize(10).text(`Unable to generate shipping label: ${err.message}`, 18, 80);
  } finally {
    doc.end();
  }

  return finalize;
}

module.exports = { createShippingLabelPDF };
