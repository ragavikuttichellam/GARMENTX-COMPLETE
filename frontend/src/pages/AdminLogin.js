import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // call admin auth endpoint which only issues token for admins
      const { data } = await authAPI.adminLogin({ email, password });
      if (!data.success) return toast.error(data.message || 'Login failed');
      localStorage.setItem('manisara_world_token', data.token);
      window.location.href = '/admin';
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ paddingTop: 80, minHeight: '70vh' }}>
      <div className="container" style={{ maxWidth: 420, padding: 24 }}>
        <h2>Admin Login</h2>
        <form onSubmit={submit} style={{ background: 'white', padding: 16, borderRadius: 12 }}>
          <label style={{ display: 'block', marginBottom: 8 }}>Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" style={{ width: '100%', padding: 8, marginBottom: 12 }} />
          <label style={{ display: 'block', marginBottom: 8 }}>Password</label>
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" style={{ width: '100%', padding: 8, marginBottom: 12 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" disabled={loading} style={{ padding: '10px 14px', background: '#C8102E', color: 'white', border: 'none', borderRadius: 8 }}>{loading ? 'Signing...' : 'Sign in'}</button>
            <button type="button" onClick={() => navigate('/')} style={{ padding: '10px 14px', borderRadius: 8 }}>Back</button>
          </div>
        </form>
      </div>
    </div>
  );
}
