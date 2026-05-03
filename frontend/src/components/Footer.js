import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer" id="contact">
      <div className="footer-top container">
        <div className="footer-brand">
          <div className="footer-logo">
            <span className="logo-icon">GX</span>
            <span>GarmentX</span>
          </div>
          <p>Premium garments crafted for every occasion. Style meets quality in every stitch.</p>
          <div className="social-links">
            <a href="#!" aria-label="Instagram">📷</a>
            <a href="#!" aria-label="Facebook">📘</a>
            <a href="#!" aria-label="Twitter">🐦</a>
            <a href="#!" aria-label="YouTube">▶️</a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/shop">Shop All</Link></li>
            <li><Link to="/shop/men">Men</Link></li>
            <li><Link to="/shop/women">Women</Link></li>
            <li><Link to="/shop/kids">Kids</Link></li>
            <li><Link to="/shop?isOnOffer=true">Offers</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Customer Care</h4>
          <ul>
            <li><Link to="/my-orders">Track Order</Link></li>
            <li><a href="#!">Return & Exchange</a></li>
            <li><a href="#!">Size Guide</a></li>
            <li><a href="#!">FAQs</a></li>
            <li><a href="#!">Privacy Policy</a></li>
            <li><a href="#!">Terms of Service</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Contact Us</h4>
          <div className="contact-info">
            <p>📍 123 Fashion Street, Mumbai, Maharashtra 400001</p>
            <p>📞 +91 98765 43210</p>
            <p>✉️ support@garmentx.com</p>
            <p>⏰ Mon–Sat, 9AM–6PM IST</p>
          </div>
          <div className="newsletter">
            <h5>Subscribe for Offers</h5>
            <form onSubmit={e => e.preventDefault()} className="newsletter-form">
              <input type="email" placeholder="Your email address" />
              <button type="submit">→</button>
            </form>
          </div>
        </div>
      </div>

      <div className="footer-bottom container">
        <p>© {new Date().getFullYear()} GarmentX. All rights reserved. Made with ❤️ in India.</p>
        <div className="payment-badges">
          <span>💳 Visa</span>
          <span>💳 Mastercard</span>
          <span>📱 UPI</span>
          <span>🏦 Net Banking</span>
          <span>💰 COD</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
