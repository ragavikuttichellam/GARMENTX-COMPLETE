import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = new URLSearchParams(location.search).get('redirect') || '/';

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      if (data.success) {
        toast.success('Welcome back! 👋');
        navigate(redirect, { replace: true });
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>G<span style={{ color: '#C8102E' }}>X</span></div>
          <h1 style={styles.title}>Welcome Back</h1>
          <p style={styles.subtitle}>Sign in to your GarmentX account</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email Address</label>
            <div style={styles.inputWrap}>
              <FiMail style={styles.inputIcon} size={18} />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                style={styles.input}
                required
              />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrap}>
              <FiLock style={styles.inputIcon} size={18} />
              <input
                type={showPass ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                style={{ ...styles.input, paddingRight: '48px' }}
                required
              />
              <button type="button" onClick={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                {showPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? 'Signing in...' : <><span>Sign In</span> <FiArrowRight size={18} /></>}
          </button>
        </form>

        <div style={styles.divider}><span>OR</span></div>

        <div style={styles.demoBox}>
          <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px', fontWeight: 600 }}>🔑 Demo Credentials</p>
          <p style={{ fontSize: '12px', color: '#9CA3AF' }}>Admin: <strong>admin@garmentx.com</strong> / <strong>Admin@123</strong></p>
        </div>

        <p style={styles.switchText}>
          Don't have an account?{' '}
          <Link to="/register" style={styles.switchLink}>Create Account</Link>
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
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  field: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '14px', fontWeight: 600, color: '#374151' },
  inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', left: '14px', color: '#9CA3AF', pointerEvents: 'none' },
  input: {
    width: '100%',
    padding: '12px 14px 12px 44px',
    border: '2px solid #F0F0F0',
    borderRadius: '12px',
    fontSize: '15px',
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    transition: 'border-color 0.2s',
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
  divider: {
    textAlign: 'center',
    margin: '24px 0',
    color: '#D1D5DB',
    fontSize: '13px',
    position: 'relative',
  },
  demoBox: {
    background: '#F9FAFB',
    border: '1px solid #F0F0F0',
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'center',
    marginBottom: '24px',
  },
  switchText: { textAlign: 'center', color: '#6B7280', fontSize: '14px' },
  switchLink: { color: '#C8102E', fontWeight: 700 },
};
