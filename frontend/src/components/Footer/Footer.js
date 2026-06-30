import React from 'react';
import { Link } from 'react-router-dom';
import { FiInstagram, FiFacebook, FiTwitter, FiYoutube, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div className="container" style={styles.grid}>
        {/* Brand */}
        <div>
          <div style={styles.logoWrap}>
            <div style={styles.logoIcon}>MW</div>
            <span style={styles.logoText}>Manisara World</span>
          </div>
          <p style={styles.tagline}>Fashion that speaks your language. Premium garments for every occasion.</p>
          <div style={styles.socials}>
            {[
              { icon: <FiInstagram size={18} />, href: '#' },
              { icon: <FiFacebook size={18} />, href: '#' },
              { icon: <FiTwitter size={18} />, href: '#' },
              { icon: <FiYoutube size={18} />, href: '#' },
            ].map((s, i) => (
              <a key={i} href={s.href} style={styles.socialLink}>{s.icon}</a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={styles.colTitle}>Quick Links</h4>
          {[
            { label: 'Home', to: '/' },
            { label: 'Shop All', to: '/shop' },
            { label: "Men's Collection", to: '/men' },
            { label: "Women's Collection", to: '/women' },
            { label: "Kids' Collection", to: '/kids' },
            { label: 'New Arrivals', to: '/new-arrivals' },
            { label: 'Offers', to: '/offers' },
          ].map(link => (
            <Link key={link.to} to={link.to} style={styles.footerLink}>{link.label}</Link>
          ))}
        </div>

        {/* Help */}
        <div>
          <h4 style={styles.colTitle}>Customer Help</h4>
          {['Track Order', 'Returns & Exchanges', 'Size Guide', 'FAQs', 'Shipping Policy', 'Privacy Policy', 'Terms & Conditions'].map(item => (
            <a key={item} href="#!" style={styles.footerLink}>{item}</a>
          ))}
        </div>

        {/* Contact */}
        <div>
          <h4 style={styles.colTitle}>Contact Us</h4>
          <div style={styles.contactItem}>
            <FiMail size={16} style={{ color: '#FFB800', flexShrink: 0 }} />
            <span>support@manisaraworld.com</span>
          </div>
          <div style={styles.contactItem}>
            <FiPhone size={16} style={{ color: '#FFB800', flexShrink: 0 }} />
            <span>+91 98765 43210</span>
          </div>
          <div style={styles.contactItem}>
            <FiMapPin size={16} style={{ color: '#FFB800', flexShrink: 0 }} />
            <span>123 Fashion Street, Mumbai, Maharashtra 400001</span>
          </div>

          {/* Payment icons */}
          <div style={{ marginTop: '24px' }}>
            <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Secure Payments</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['Razorpay', 'UPI', 'Visa', 'Mastercard'].map(pay => (
                <span key={pay} style={{ padding: '5px 10px', background: 'rgba(255,255,255,0.08)', borderRadius: '6px', fontSize: '12px', color: '#9CA3AF', border: '1px solid rgba(255,255,255,0.1)' }}>{pay}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={styles.bottom}>
        <div className="container" style={styles.bottomInner}>
          <p style={{ color: '#6B7280', fontSize: '14px' }}>
            © {new Date().getFullYear()} Manisara World. All rights reserved.
          </p>
          <p style={{ color: '#6B7280', fontSize: '14px' }}>
            Made with ❤️ in India 🇮🇳
          </p>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    background: '#0F0F1A',
    color: '#E5E7EB',
    paddingTop: '64px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '48px',
    paddingBottom: '48px',
  },
  logoWrap: {
    display: 'flex', alignItems: 'center', gap: '10px',
    marginBottom: '16px',
  },
  logoIcon: {
    width: '40px', height: '40px',
    background: '#C8102E',
    color: 'white',
    borderRadius: '10px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '18px', fontWeight: 900,
    fontFamily: "'Playfair Display', serif",
  },
  logoText: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '22px',
    fontWeight: 700,
    color: 'white',
  },
  tagline: {
    color: '#6B7280',
    fontSize: '14px',
    lineHeight: '1.7',
    marginBottom: '20px',
    maxWidth: '260px',
  },
  socials: { display: 'flex', gap: '10px' },
  socialLink: {
    width: '38px', height: '38px',
    background: 'rgba(255,255,255,0.08)',
    borderRadius: '10px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#9CA3AF',
    transition: 'all 0.2s',
  },
  colTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '16px',
    fontWeight: 700,
    color: 'white',
    marginBottom: '16px',
  },
  footerLink: {
    display: 'block',
    color: '#6B7280',
    fontSize: '14px',
    marginBottom: '10px',
    textDecoration: 'none',
    transition: 'color 0.2s',
  },
  contactItem: {
    display: 'flex', alignItems: 'flex-start', gap: '10px',
    color: '#9CA3AF', fontSize: '14px', marginBottom: '14px', lineHeight: '1.5',
  },
  bottom: {
    borderTop: '1px solid rgba(255,255,255,0.06)',
    padding: '20px 0',
  },
  bottomInner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
  },
};
