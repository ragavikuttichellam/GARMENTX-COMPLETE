import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Generate Invoice PDF from HTML element
 * @param {HTMLElement} element - Element to convert to PDF
 * @param {string} fileName - Name of the PDF file
 * @param {boolean} download - Whether to download or just return the PDF
 */
export const generateInvoicePDF = async (element, fileName = 'invoice.pdf', download = true) => {
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      allowTaint: false,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= 297; // A4 height in mm

    // Add additional pages if needed
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= 297;
    }

    if (download) {
      pdf.save(fileName);
    }
    return pdf;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

/**
 * Print HTML element
 * @param {HTMLElement} element - Element to print
 */
export const printElement = (element) => {
  const printWindow = window.open('', '', 'height=800,width=900');
  printWindow.document.write(element.innerHTML);
  printWindow.document.close();
  printWindow.print();
};

/**
 * Format currency to INR
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(Number(amount || 0));
};

/**
 * Format date to readable format
 * @param {string} dateString - Date string to format
 * @returns {string} Formatted date
 */
export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Calculate GST amount
 * @param {number} amount - Amount without GST
 * @param {number} rate - GST rate (default 18)
 * @returns {number} GST amount
 */
export const calculateGST = (amount, rate = 18) => {
  return (amount * rate) / 100;
};

/**
 * Generate QR code data (encoded order details)
 * @param {Object} order - Order object
 * @returns {string} QR code data
 */
export const generateQRCodeData = (order) => {
  return JSON.stringify({
    orderNumber: order.orderNumber,
    orderId: order._id,
    invoiceNumber: order.invoiceNumber,
    totalPrice: order.totalPrice,
    status: order.status,
  });
};

/**
 * Get store details
 * @returns {Object} Store information
 */
export const getStoreDetails = () => {
  return {
    name: process.env.REACT_APP_STORE_NAME || 'GarmentX',
    logo: process.env.REACT_APP_STORE_LOGO || '',
    address: process.env.REACT_APP_STORE_ADDRESS || '123 Fashion Street, Mumbai',
    phone: process.env.REACT_APP_STORE_PHONE || '+91-1234567890',
    email: process.env.REACT_APP_STORE_EMAIL || 'support@garmentx.com',
    website: process.env.REACT_APP_STORE_WEBSITE || 'www.garmentx.com',
    gstNumber: process.env.REACT_APP_GST_NUMBER || 'GST12AB3456C789DE',
  };
};
