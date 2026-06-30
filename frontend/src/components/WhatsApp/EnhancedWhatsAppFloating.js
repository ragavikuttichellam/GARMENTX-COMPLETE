import React, { useState, useEffect } from 'react';
import { FiMessageCircle, FiX } from 'react-icons/fi';
import { generateWhatsAppURL } from '../../utils/whatsappUtils';
import './EnhancedWhatsAppFloating.css';

/**
 * Enhanced WhatsApp Floating Button
 * - Fixed bottom-right position
 * - Hover animation with pulse effect
 * - Notification badge
 * - Tooltip
 * - Quick action buttons
 */
const EnhancedWhatsAppFloating = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [hasNotification, setHasNotification] = useState(true);

  const WHATSAPP_NUMBER = "+919999999999";
  const COMPANY_NAME = "Manisara World";

  const quickMessages = [
    {
      id: 1,
      title: "Product Inquiry",
      message: `Hello! I'd like to know more about your products. Can you help me?`
    },
    {
      id: 2,
      title: "Custom Order",
      message: `Hi! I'm interested in placing a custom order. Can we discuss the details?`
    },
    {
      id: 3,
      title: "Track Order",
      message: `Hello! Can you help me track my order?`
    },
    {
      id: 4,
      title: "Support",
      message: `Hi! I need help with my recent purchase.`
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleQuickMessage = (message) => {
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, "")}?text=${encodedMessage}`;
    window.open(url, '_blank');
    setIsOpen(false);
    setHasNotification(false);
  };

  const handleGeneralChat = () => {
    const message = `Hello ${COMPANY_NAME} Team! 👋`;
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, "")}?text=${encodedMessage}`;
    window.open(url, '_blank');
    setIsOpen(false);
    setHasNotification(false);
  };

  return (
    <div className="whatsapp-floating-container">
      {/* Tooltip */}
      {showTooltip && (
        <div className="whatsapp-tooltip">
          <span>💬 Chat with us on WhatsApp</span>
          <button className="tooltip-close" onClick={() => setShowTooltip(false)}>
            <FiX size={14} />
          </button>
        </div>
      )}

      {/* Quick Action Menu */}
      {isOpen && (
        <div className="whatsapp-menu">
          {quickMessages.map((item, index) => (
            <button
              key={item.id}
              className="menu-item"
              onClick={() => handleQuickMessage(item.message)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <span className="menu-icon">💬</span>
              <span className="menu-label">{item.title}</span>
            </button>
          ))}
          <div className="menu-divider"></div>
          <button className="menu-item" onClick={handleGeneralChat}>
            <span className="menu-icon">👋</span>
            <span className="menu-label">General Chat</span>
          </button>
        </div>
      )}

      {/* Main Button */}
      <button
        className={`whatsapp-floating-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open WhatsApp chat"
      >
        {isOpen ? (
          <FiX size={24} />
        ) : (
          <>
            <FiMessageCircle size={24} />
            {hasNotification && <span className="notification-badge"></span>}
          </>
        )}
      </button>

      {/* Background Overlay */}
      {isOpen && (
        <div className="whatsapp-overlay" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};

export default EnhancedWhatsAppFloating;
