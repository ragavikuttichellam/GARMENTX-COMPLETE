/**
 * WhatsApp Integration Utilities
 * Generates WhatsApp share URLs with pre-filled messages
 */

const WHATSAPP_NUMBER = "+919999999999"; // Replace with your WhatsApp Business number
const COMPANY_NAME = "Manisara World";

/**
 * Generate WhatsApp message for product order
 * @param {Object} product - Product object with name, price, etc.
 * @param {number} quantity - Quantity of product
 * @param {string} productUrl - Full URL of product page
 * @returns {string} - Formatted message
 */
export const generateProductMessage = (product, quantity = 1, productUrl = "") => {
  const message = `Hello! 👋 I'm interested in ordering the following product from ${COMPANY_NAME}:

📦 *Product Details*
━━━━━━━━━━━━━━━━━
🏷️  Name: ${product.name}
💰 Price: ₹${product.price?.toLocaleString("en-IN")}
📊 Quantity: ${quantity}
💵 Total: ₹${(product.price * quantity)?.toLocaleString("en-IN")}

${product.description ? `📝 Details: ${product.description.substring(0, 100)}...` : ""}

${productUrl ? `🔗 Product Link: ${productUrl}` : ""}

✅ *Shipping Available*
🚚 Free delivery on orders above ₹999
📍 Pan India Delivery

💳 *Payment Options*
✓ Online Payment
✓ Cash on Delivery (COD)
✓ UPI

Please confirm availability and proceed with the order. Thank you! 🙏`;

  return message;
};

/**
 * Generate WhatsApp URL for sharing product order
 * @param {Object} product - Product object
 * @param {number} quantity - Quantity
 * @param {string} productUrl - Product page URL
 * @returns {string} - WhatsApp URL
 */
export const generateWhatsAppURL = (product, quantity = 1, productUrl = "") => {
  const message = generateProductMessage(product, quantity, productUrl);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, "")}?text=${encodedMessage}`;
};

/**
 * Generate WhatsApp URL for custom inquiry
 * @param {string} message - Custom message
 * @returns {string} - WhatsApp URL
 */
export const generateCustomWhatsAppURL = (message) => {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, "")}?text=${encodedMessage}`;
};

/**
 * Generate WhatsApp URL for general inquiry
 * @returns {string} - WhatsApp URL
 */
export const generateGeneralInquiryURL = () => {
  const message = `Hello! 👋 I'd like to know more about ${COMPANY_NAME} products. Can you help me? 😊`;
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, "")}?text=${encodedMessage}`;
};

/**
 * Format price for display
 * @param {number} price - Price value
 * @returns {string} - Formatted price
 */
export const formatPrice = (price) => {
  return `₹${price?.toLocaleString("en-IN")}`;
};

/**
 * Get WhatsApp business info
 * @returns {Object} - Business info
 */
export const getWhatsAppInfo = () => {
  return {
    number: WHATSAPP_NUMBER,
    company: COMPANY_NAME,
    message: `Chat with ${COMPANY_NAME} on WhatsApp`,
  };
};

/**
 * Share product on WhatsApp Web
 * Opens WhatsApp Web in new window with product message
 * @param {Object} product - Product object
 * @param {number} quantity - Quantity
 * @param {string} productUrl - Product URL
 */
export const openWhatsAppChat = (product, quantity = 1, productUrl = "") => {
  const url = generateWhatsAppURL(product, quantity, productUrl);
  window.open(url, "_blank", "noopener,noreferrer");
};

/**
 * Share on WhatsApp (for mobile and web)
 * @param {Object} product - Product object
 * @param {number} quantity - Quantity
 * @param {string} productUrl - Product URL
 */
export const shareProductOnWhatsApp = (product, quantity = 1, productUrl = "") => {
  const message = generateProductMessage(product, quantity, productUrl);

  // Check if device supports native WhatsApp share
  if (navigator.share) {
    navigator.share({
      title: product.name,
      text: message,
      url: productUrl,
    }).catch((error) => {
      // Fallback to WhatsApp URL
      openWhatsAppChat(product, quantity, productUrl);
    });
  } else {
    // Direct to WhatsApp URL
    openWhatsAppChat(product, quantity, productUrl);
  }
};

export default {
  generateProductMessage,
  generateWhatsAppURL,
  generateCustomWhatsAppURL,
  generateGeneralInquiryURL,
  formatPrice,
  getWhatsAppInfo,
  openWhatsAppChat,
  shareProductOnWhatsApp,
};
