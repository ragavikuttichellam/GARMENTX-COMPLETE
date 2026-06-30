import React, { useState } from 'react';
import { FiMail, FiPhone, FiMapPin, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.success('Message sent! We\'ll get back to you within 24 hours. 😊');
      setForm({ name: '', email: '', subject: '', message: '' });
      setLoading(false);
    }, 1500);
  };

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', background: '#FAFAFA' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1A1A2E 0%, #C8102E 100%)', padding: '60px 24px', textAlign: 'center', color: 'white' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '42px', marginBottom: '12px' }}>Get In Touch</h1>
        <p style={{ fontSize: '16px', opacity: 0.8, maxWidth: '500px', margin: '0 auto' }}>Have a question? We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
      </div>

      <div className="container" style={{ padding: '60px 24px', maxWidth: '1100px', display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '48px', alignItems: 'start' }}>
        {/* Info */}
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', marginBottom: '24px', color: '#1A1A2E' }}>Contact Information</h2>
          {[
            { icon: <FiMail size={20} />, title: 'Email Us', value: 'support@manisaraworld.com' },
            { icon: <FiPhone size={20} />, title: 'Call Us', value: '+91 98765 43210' },
            { icon: <FiMapPin size={20} />, title: 'Visit Us', value: '123 Fashion Street, Mumbai, Maharashtra 400001' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '28px' }}>
              <div style={{ width: '48px', height: '48px', background: '#FEF2F2', color: '#C8102E', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {item.icon}
              </div>
              <div>
                <p style={{ fontWeight: 700, color: '#1A1A2E', marginBottom: '4px' }}>{item.title}</p>
                <p style={{ color: '#6B7280', fontSize: '15px' }}>{item.value}</p>
              </div>
            </div>
          ))}

          <div style={{ background: 'linear-gradient(135deg, #1A1A2E, #2D2D4E)', borderRadius: '20px', padding: '24px', color: 'white', marginTop: '8px' }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", marginBottom: '8px' }}>Business Hours</h3>
            <p style={{ opacity: 0.8, fontSize: '14px', lineHeight: '1.8' }}>
              Monday – Saturday: 9:00 AM – 8:00 PM IST<br />
              Sunday: 10:00 AM – 6:00 PM IST
            </p>
          </div>
        </div>

        {/* Form */}
        <div style={{ background: 'white', borderRadius: '24px', padding: '40px', boxShadow: '0 8px 32px rgba(0,0,0,0.06)' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', marginBottom: '28px', color: '#1A1A2E' }}>Send a Message</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[{ key: 'name', label: 'Your Name', placeholder: 'John Doe' }, { key: 'email', label: 'Email Address', placeholder: 'john@example.com' }].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '8px' }}>{f.label}</label>
                  <input
                    type={f.key === 'email' ? 'email' : 'text'}
                    value={form[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    required
                    style={{ width: '100%', padding: '12px 14px', border: '2px solid #F0F0F0', borderRadius: '12px', fontSize: '15px', fontFamily: "'DM Sans', sans-serif", color: '#1A1A2E', outline: 'none' }}
                  />
                </div>
              ))}
            </div>

            <div>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '8px' }}>Subject</label>
              <input
                type="text"
                value={form.subject}
                onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                placeholder="How can we help you?"
                required
                style={{ width: '100%', padding: '12px 14px', border: '2px solid #F0F0F0', borderRadius: '12px', fontSize: '15px', fontFamily: "'DM Sans', sans-serif", color: '#1A1A2E', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '8px' }}>Message</label>
              <textarea
                value={form.message}
                onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                placeholder="Write your message here..."
                required
                rows={5}
                style={{ width: '100%', padding: '12px 14px', border: '2px solid #F0F0F0', borderRadius: '12px', fontSize: '15px', fontFamily: "'DM Sans', sans-serif", resize: 'vertical', color: '#1A1A2E', outline: 'none' }}
              />
            </div>

            <button type="submit" disabled={loading} style={{ padding: '15px 24px', background: 'linear-gradient(135deg, #C8102E, #E31837)', color: 'white', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontFamily: "'DM Sans', sans-serif" }}>
              <FiSend size={18} /> {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
