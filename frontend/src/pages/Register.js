import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('Name, email & password are required');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const data = await register(form.name, form.email, form.password, form.phone);
      if (data.success) {
        toast.success('Account created! Welcome to Manisara World 🎉');
        navigate('/');
      } else {
        toast.error(data.message || 'Registration failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'name', label: 'Full Name', type: 'text', icon: <FiUser size={18} />, placeholder: 'John Doe' },
    { name: 'email', label: 'Email Address', type: 'email', icon: <FiMail size={18} />, placeholder: 'you@example.com' },
    { name: 'phone', label: 'Phone Number (Optional)', type: 'tel', icon: <FiPhone size={18} />, placeholder: '+91 98765 43210' },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>G<span style={{ color: '#C8102E' }}>X</span></div>
          <h1 style={styles.title}>Create Account</h1>
          <p style={styles.subtitle}>Join Manisara World — Fashion is waiting for you</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {fields.map(f => (
            <div key={f.name} style={styles.field}>
              <label style={styles.label}>{f.label}</label>
              <div style={styles.inputWrap}>
                <span style={styles.inputIcon}>{f.icon}</span>
                <input
                  type={f.type}
                  name={f.name}
                  value={form[f.name]}
                  onChange={handleChange}
                  placeholder={f.placeholder}
                  style={styles.input}
                  required={f.name !== 'phone'}
                />
              </div>
            </div>
          ))}

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrap}>
              <span style={styles.inputIcon}><FiLock size={18} /></span>
              <input
                type={showPass ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                style={{ ...styles.input, paddingRight: '48px' }}
                required
              />
              <button type="button" onClick={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                {showPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? 'Creating account...' : <><span>Create Account</span><FiArrowRight size={18} /></>}
          </button>
        </form>

        <p style={styles.switchText}>
          Already have an account?{' '}
          <Link to="/login" style={styles.switchLink}>Sign In</Link>
        </p>

        <p style={styles.terms}>
          By creating an account, you agree to our <a href="#!" style={{ color: '#C8102E' }}>Terms of Service</a> and <a href="#!" style={{ color: '#C8102E' }}>Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #FFF5F5 0%, #FFFFFF 50%, #FFF0F3 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '100px 24px 40px',
  },
  card: {
    background: '#FFFFFF',
    borderRadius: '24px',
    boxShadow: '0 20px 60px rgba(200,16,46,0.12)',
    padding: '48px 40px',
    width: '100%',
    maxWidth: '440px',
  },
  header: { textAlign: 'center', marginBottom: '32px' },
  logo: {
    width: '56px', height: '56px',
    background: '#1A1A2E',
    color: 'white',
    borderRadius: '16px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '24px', fontWeight: 900,
    margin: '0 auto 16px',
    fontFamily: "'Playfair Display', serif",
  },
  title: { fontSize: '28px', fontWeight: 700, color: '#1A1A2E', marginBottom: '8px', fontFamily: "'Playfair Display', serif" },
  subtitle: { color: '#6B7280', fontSize: '15px' },
  form: { display: 'flex', flexDirection: 'column', gap: '18px' },
  field: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '14px', fontWeight: 600, color: '#374151' },
  inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: '14px', color: '#9CA3AF', pointerEvents: 'none', display: 'flex' },
  input: {
    width: '100%',
    padding: '12px 14px 12px 44px',
    border: '2px solid #F0F0F0',
    borderRadius: '12px',
    fontSize: '15px',
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    color: '#1A1A2E',
  },
  eyeBtn: {
    position: 'absolute', right: '14px',
    background: 'none', border: 'none',
    color: '#9CA3AF', cursor: 'pointer',
    display: 'flex', alignItems: 'center',
  },
  submitBtn: {
    padding: '14px',
    background: 'linear-gradient(135deg, #C8102E, #E31837)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: "'DM Sans', sans-serif",
    marginTop: '4px',
  },
  switchText: { textAlign: 'center', color: '#6B7280', fontSize: '14px', marginTop: '24px' },
  switchLink: { color: '#C8102E', fontWeight: 700 },
  terms: { textAlign: 'center', color: '#9CA3AF', fontSize: '12px', marginTop: '16px', lineHeight: '1.6' },
};
