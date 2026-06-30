import React, { useState, useEffect } from 'react';
import { FiMessageCircle, FiX } from 'react-icons/fi';
import { generateGeneralInquiryURL } from '../../utils/whatsappUtils';
import './FloatingWhatsApp.css';

/**
 * Floating WhatsApp Widget
 * Appears as a floating button on bottom-right of screen
 * Shows tooltip on hover and opens WhatsApp on click
 */
const FloatingWhatsApp = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showMessage, setShowMessage] = useState(true);

  // Auto-hide message after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMessage(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClick = () => {
    if (!isOpen) {
      setIsOpen(true);
      setShowMessage(false);
    } else {
      const url = generateGeneralInquiryURL();
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setShowMessage(false);
  };

  return (
    <>
      {/* Floating Widget */}
      <div className="floating-whatsapp">
        {/* Message Tooltip */}
        {showMessage && !isOpen && (
          <div className="floating-whatsapp__message">
            <div className="floating-whatsapp__message-content">
              <p className="floating-whatsapp__message-text">
                Hi! 👋 Need help? Chat with us on WhatsApp
              </p>
            </div>
            <div className="floating-whatsapp__message-arrow"></div>
          </div>
        )}

        {/* Expanded Chat View */}
        {isOpen && (
          <div className="floating-whatsapp__chat">
            {/* Header */}
            <div className="floating-whatsapp__chat-header">
              <div className="floating-whatsapp__chat-header-content">
                <div className="floating-whatsapp__chat-avatar">
                  <FiMessageCircle size={24} />
                </div>
                <div>
                  <h4 className="floating-whatsapp__chat-title">Manisara World</h4>
                  <p className="floating-whatsapp__chat-subtitle">Usually replies instantly</p>
                </div>
              </div>
              <button
                className="floating-whatsapp__chat-close"
                onClick={handleClose}
                title="Close chat"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Chat Body */}
            <div className="floating-whatsapp__chat-body">
              {/* Bot Message */}
              <div className="floating-whatsapp__message-item bot">
                <div className="floating-whatsapp__message-bubble">
                  <p>Hi! 👋 Welcome to Manisara World</p>
                </div>
                <span className="floating-whatsapp__message-time">just now</span>
              </div>

              <div className="floating-whatsapp__message-item bot">
                <div className="floating-whatsapp__message-bubble">
                  <p>How can we help you today? 😊</p>
                  <ul style={{ marginTop: '8px', fontSize: '12px', paddingLeft: '16px' }}>
                    <li>Product inquiry</li>
                    <li>Order status</li>
                    <li>Delivery info</li>
                    <li>General support</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="floating-whatsapp__chat-footer">
              <p className="floating-whatsapp__chat-disclaimer">
                Typically replies in minutes
              </p>
              <button
                className="floating-whatsapp__chat-cta"
                onClick={handleClick}
              >
                <FiMessageCircle size={16} />
                Chat with us
              </button>
            </div>
          </div>
        )}

        {/* Floating Button */}
        <button
          className={`floating-whatsapp__button ${isOpen ? 'floating-whatsapp__button--active' : ''}`}
          onClick={handleClick}
          title={isOpen ? 'Chat with us' : 'Open WhatsApp'}
          aria-label="Contact us on WhatsApp"
        >
          <FiMessageCircle size={24} />
        </button>
      </div>

      {/* Backdrop when chat is open */}
      {isOpen && (
        <div className="floating-whatsapp__backdrop" onClick={handleClose} />
      )}
    </>
  );
};

export default FloatingWhatsApp;
