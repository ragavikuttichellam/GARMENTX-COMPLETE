// Validation utilities for backend
const validator = require('validator');

// Validate product input
exports.validateProductInput = ({name, description, price, category, stock}) => {
  if (!name || name.trim().length < 3) return false;
  if (!description || description.trim().length < 10) return false;
  if (!price || price <= 0) return false;
  if (!category || category.trim().length < 2) return false;
  if (stock === undefined || stock < 0) return false;
  return true;
};

// Validate user input
exports.validateUserInput = ({name, email, password, phone}) => {
  if (!name || name.trim().length < 2) return false;
  if (!email || !validator.isEmail(email)) return false;
  if (!password || password.length < 6) return false;
  if (phone && !validator.isMobilePhone(phone, 'en-IN')) return false;
  return true;
};

// Validate order input
exports.validateOrderInput = ({items, address, paymentMethod}) => {
  if (!items || items.length === 0) return false;
  if (!address || !address._id) return false;
  if (!paymentMethod || !['razorpay', 'upi', 'cod'].includes(paymentMethod)) return false;
  return true;
};

// Validate address input
exports.validateAddressInput = ({fullName, phone, addressLine1, city, pincode}) => {
  if (!fullName || fullName.trim().length < 2) return false;
  if (!phone || !validator.isMobilePhone(phone, 'en-IN')) return false;
  if (!addressLine1 || addressLine1.trim().length < 5) return false;
  if (!city || city.trim().length < 2) return false;
  if (!pincode || !validator.isPostalCode(pincode, 'IN')) return false;
  return true;
};

// Sanitize user input
exports.sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return validator.escape(input.trim());
  }
  return input;
};

// Format price
exports.formatPrice = (price) => {
  return Math.round(price * 100) / 100;
};

// Generate order number
exports.generateOrderNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ORD-${timestamp.slice(-6)}-${random}`;
};

// Generate SKU
exports.generateSKU = (productName) => {
  const timestamp = Date.now().toString();
  const name = productName.substring(0, 3).toUpperCase();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${name}-${timestamp.slice(-4)}-${random}`;
};

// Validate email
exports.isValidEmail = (email) => {
  return validator.isEmail(email);
};

// Validate phone
exports.isValidPhone = (phone) => {
  return validator.isMobilePhone(phone, 'en-IN');
};

// Validate GST
exports.calculateGST = (amount, gstRate = 18) => {
  return Math.round((amount * gstRate) / 100);
};

// Validate payment amount
exports.validatePaymentAmount = (amount) => {
  if (!amount || amount <= 0) return false;
  if (amount > 99999999) return false; // Max 99,99,999
  return true;
};
