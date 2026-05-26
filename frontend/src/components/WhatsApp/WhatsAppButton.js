import React from 'react';
import { FiMessageCircle } from 'react-icons/fi';
import { openWhatsAppChat } from '../../utils/whatsappUtils';
import './WhatsAppButton.css';

/**
 * Reusable WhatsApp Button Component
 * Displays a professional button to order product on WhatsApp
 * 
 * @param {Object} props - Component props
 * @param {Object} props.product - Product object with name, price, description, etc.
 * @param {number} props.quantity - Quantity to order (default: 1)
 * @param {string} props.buttonText - Custom button text (default: "Order on WhatsApp")
 * @param {string} props.variant - Button variant: 'primary', 'outline', 'ghost', 'gradient' (default: 'gradient')
 * @param {string} props.size - Button size: 'small', 'medium', 'large' (default: 'medium')
 * @param {boolean} props.fullWidth - Make button full width (default: false)
 * @param {boolean} props.showIcon - Show WhatsApp icon (default: true)
 * @param {function} props.onBeforeClick - Callback before opening WhatsApp
 * @param {function} props.onAfterClick - Callback after opening WhatsApp
 * @param {boolean} props.disabled - Disable button (default: false)
 */
const WhatsAppButton = ({
  product,
  quantity = 1,
  buttonText = "Order on WhatsApp",
  variant = "gradient",
  size = "medium",
  fullWidth = false,
  showIcon = true,
  onBeforeClick,
  onAfterClick,
  disabled = false,
  className = "",
  style = {},
}) => {
  const handleClick = () => {
    if (disabled) return;
    
    // Execute before click callback
    if (onBeforeClick) onBeforeClick();

    // Get current product URL
    const productUrl = typeof window !== "undefined" ? window.location.href : "";

    // Open WhatsApp chat
    openWhatsAppChat(product, quantity, productUrl);

    // Execute after click callback
    if (onAfterClick) onAfterClick();
  };

  // Button class combinations
  const buttonClasses = `
    whatsapp-button 
    whatsapp-button--${variant}
    whatsapp-button--${size}
    ${fullWidth ? "whatsapp-button--full-width" : ""}
    ${disabled ? "whatsapp-button--disabled" : ""}
    ${className}
  `.trim();

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={buttonClasses}
      style={style}
      title="Order this product on WhatsApp"
    >
      {showIcon && (
        <span className="whatsapp-button__icon">
          <FiMessageCircle size={variant === "gradient" ? 18 : 16} />
        </span>
      )}
      <span className="whatsapp-button__text">{buttonText}</span>
    </button>
  );
};

export default WhatsAppButton;
