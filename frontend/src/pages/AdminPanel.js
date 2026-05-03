import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiPackage, FiUsers, FiDollarSign, FiShoppingBag, FiX, FiSave, FiRefreshCw } from 'react-icons/fi';

const TABS = ['Dashboard', 'Products', 'Orders', 'Users'];

const EMPTY_PRODUCT = {
  name: '', description: '', price: '', originalPrice: '',
  category: 'men', subCategory: '', brand: 'GarmentX',
  images: [''], sizes: '', colors: '', stock: '',
  isFeatured: false, isNewArrival: false, isOnOffer: false, discount: 0,
};

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [stats, setStats] = useState({});
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_PRODUCT);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/admin/stats');
      if (data.success) setStats(data.stats);
    } catch (e) { console.error(e); }
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/products?limit=100');
      setProducts(data.products || []);
    } catch (e) { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/admin/orders');
      setOrders(data.orders || []);
    } catch (e) { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/admin/users');
      setUsers(data.users || []);
    } catch (e) { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchStats();
    if (activeTab === 'Products') fetchProducts();
    if (activeTab === 'Orders') fetchOrders();
    if (activeTab === 'Users') fetchUsers();
  }, [activeTab, fetchStats, fetchProducts, fetchOrders, fetchUsers]);

  const openModal = (product = null) => {
    if (product) {
      setEditProduct(product);
      setForm({
        ...product,
        sizes: product.sizes?.join(', ') || '',
        colors: product.colors?.join(', ') || '',
        images: product.images?.length ? product.images : [''],
      });
    } else {
      setEditProduct(null);
      setForm(EMPTY_PRODUCT);
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.stock) return toast.error('Name, price & stock required');
    const payload = {
      ...form,
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
      stock: Number(form.stock),
      sizes: form.sizes ? form.sizes.split(',').map(s => s.trim()).filter(Boolean) : [],
      colors: form.colors ? form.colors.split(',').map(c => c.trim()).filter(Boolean) : [],
      images: form.images.filter(Boolean),
    };
    try {
      if (editProduct) {
        await axios.put('/api/products/' + editProduct._id, payload);
        toast.success('Product updated!');
      } else {
        await axios.post('/api/products', payload);
        toast.success('Product created!');
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await axios.delete('/api/products/' + id);
      toast.success('Product deleted');
      fetchProducts();
    } catch { toast.error('Delete failed'); }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.put('/api/orders/' + orderId + '/status', { status });
      toast.success('Order status updated');
      fetchOrders();
    } catch { toast.error('Update failed'); }
  };

  const statCards = [
    { icon: <FiShoppingBag size={24} />, label: 'Total Products', value: stats.totalProducts || 0, color: '#C8102E' },
    { icon: <FiPackage size={24} />, label: 'Total Orders', value: stats.totalOrders || 0, color: '#3B82F6' },
    { icon: <FiUsers size={24} />, label: 'Customers', value: stats.totalUsers || 0, color: '#10B981' },
    { icon: <FiDollarSign size={24} />, label: 'Revenue', value: `₹${Number(stats.totalRevenue || 0).toLocaleString('en-IN')}`, color: '#FFB800' },
  ];

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', background: '#F9FAFB' }}>
      <div className="container" style={{ padding: '32px 24px', maxWidth: '1200px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '36px', color: '#1A1A2E', marginBottom: '8px' }}>Admin Panel</h1>
          <p style={{ color: '#6B7280' }}>Manage your GarmentX store</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', background: 'white', padding: '6px', borderRadius: '14px', width: 'fit-content', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '10px 24px', borderRadius: '10px', border: 'none',
              background: activeTab === tab ? '#C8102E' : 'transparent',
              color: activeTab === tab ? 'white' : '#6B7280',
              fontWeight: 600, cursor: 'pointer', fontSize: '14px',
              fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s',
            }}>{tab}</button>
          ))}
        </div>

        {/* Dashboard */}
        {activeTab === 'Dashboard' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' }}>
              {statCards.map((s, i) => (
                <div key={i} style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                  <div style={{ width: '48px', height: '48px', background: s.color + '15', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, marginBottom: '16px' }}>
                    {s.icon}
                  </div>
                  <p style={{ fontSize: '28px', fontWeight: 800, color: '#1A1A2E', marginBottom: '4px' }}>{s.value}</p>
                  <p style={{ color: '#9CA3AF', fontSize: '14px' }}>{s.label}</p>
                </div>
              ))}
            </div>
            <div style={{ background: 'white', borderRadius: '20px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", marginBottom: '16px' }}>Quick Actions</h2>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button onClick={() => { setActiveTab('Products'); setTimeout(() => openModal(), 100); }} style={{ padding: '12px 20px', background: '#C8102E', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'DM Sans', sans-serif" }}>
                  <FiPlus size={16} /> Add Product
                </button>
                <button onClick={() => setActiveTab('Orders')} style={{ padding: '12px 20px', background: '#F3F4F6', color: '#1A1A2E', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'DM Sans', sans-serif" }}>
                  <FiPackage size={16} /> View Orders
                </button>
                <button onClick={fetchStats} style={{ padding: '12px 20px', background: '#F3F4F6', color: '#1A1A2E', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'DM Sans', sans-serif" }}>
                  <FiRefreshCw size={16} /> Refresh Stats
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Products */}
        {activeTab === 'Products' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px' }}>Products ({products.length})</h2>
              <button onClick={() => openModal()} style={{ padding: '12px 20px', background: '#C8102E', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', fontFamily: "'DM Sans', sans-serif" }}>
                <FiPlus size={16} /> Add Product
              </button>
            </div>

            {loading ? <p style={{ textAlign: 'center', color: '#6B7280', padding: '40px' }}>Loading...</p> : (
              <div style={{ background: 'white', borderRadius: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #F0F0F0' }}>
                        {['Image', 'Name', 'Category', 'Price', 'Stock', 'Actions'].map(h => (
                          <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(p => (
                        <tr key={p._id} style={{ borderBottom: '1px solid #F9FAFB' }}>
                          <td style={{ padding: '14px 20px' }}>
                            <img src={p.images?.[0]} alt={p.name} style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover' }} />
                          </td>
                          <td style={{ padding: '14px 20px' }}>
                            <p style={{ fontWeight: 600, fontSize: '14px' }}>{p.name}</p>
                            <p style={{ fontSize: '12px', color: '#9CA3AF' }}>{p.brand}</p>
                          </td>
                          <td style={{ padding: '14px 20px' }}>
                            <span style={{ padding: '4px 10px', background: '#F3F4F6', borderRadius: '8px', fontSize: '12px', fontWeight: 600, textTransform: 'capitalize' }}>{p.category}</span>
                          </td>
                          <td style={{ padding: '14px 20px', fontWeight: 700, color: '#C8102E' }}>₹{p.price?.toLocaleString('en-IN')}</td>
                          <td style={{ padding: '14px 20px' }}>
                            <span style={{ color: p.stock < 10 ? '#EF4444' : '#10B981', fontWeight: 600, fontSize: '14px' }}>{p.stock}</span>
                          </td>
                          <td style={{ padding: '14px 20px' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button onClick={() => openModal(p)} style={{ padding: '8px 14px', background: '#EFF6FF', color: '#3B82F6', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600 }}>
                                <FiEdit2 size={14} /> Edit
                              </button>
                              <button onClick={() => handleDelete(p._id, p.name)} style={{ padding: '8px 14px', background: '#FEF2F2', color: '#EF4444', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600 }}>
                                <FiTrash2 size={14} /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Orders */}
        {activeTab === 'Orders' && (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', marginBottom: '20px' }}>Orders ({orders.length})</h2>
            {loading ? <p style={{ textAlign: 'center', color: '#6B7280', padding: '40px' }}>Loading...</p> : (
              <div style={{ background: 'white', borderRadius: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #F0F0F0' }}>
                        {['Order #', 'Customer', 'Items', 'Total', 'Status', 'Date', 'Update'].map(h => (
                          <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(o => (
                        <tr key={o._id} style={{ borderBottom: '1px solid #F9FAFB' }}>
                          <td style={{ padding: '14px 20px', fontSize: '13px', fontWeight: 600 }}>{o.orderNumber}</td>
                          <td style={{ padding: '14px 20px' }}>
                            <p style={{ fontSize: '14px', fontWeight: 600 }}>{o.user?.name}</p>
                            <p style={{ fontSize: '12px', color: '#9CA3AF' }}>{o.user?.email}</p>
                          </td>
                          <td style={{ padding: '14px 20px', fontSize: '14px' }}>{o.orderItems?.length}</td>
                          <td style={{ padding: '14px 20px', fontWeight: 700, color: '#C8102E' }}>₹{o.totalPrice?.toLocaleString('en-IN')}</td>
                          <td style={{ padding: '14px 20px' }}>
                            <span style={{ padding: '4px 10px', background: '#F3F4F6', borderRadius: '8px', fontSize: '12px', fontWeight: 600, textTransform: 'capitalize' }}>{o.status}</span>
                          </td>
                          <td style={{ padding: '14px 20px', fontSize: '13px', color: '#6B7280' }}>
                            {new Date(o.createdAt).toLocaleDateString('en-IN')}
                          </td>
                          <td style={{ padding: '14px 20px' }}>
                            <select
                              value={o.status}
                              onChange={(e) => updateOrderStatus(o._id, e.target.value)}
                              style={{ padding: '7px 10px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '13px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
                            >
                              {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
                                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Users */}
        {activeTab === 'Users' && (
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', marginBottom: '20px' }}>Customers ({users.length})</h2>
            <div style={{ background: 'white', borderRadius: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #F0F0F0' }}>
                      {['Name', 'Email', 'Phone', 'Joined', 'Role'].map(h => (
                        <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id} style={{ borderBottom: '1px solid #F9FAFB' }}>
                        <td style={{ padding: '14px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '36px', height: '36px', background: '#C8102E', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px' }}>
                              {u.name?.[0]?.toUpperCase()}
                            </div>
                            <span style={{ fontWeight: 600, fontSize: '14px' }}>{u.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 20px', color: '#6B7280', fontSize: '14px' }}>{u.email}</td>
                        <td style={{ padding: '14px 20px', color: '#6B7280', fontSize: '14px' }}>{u.phone || '—'}</td>
                        <td style={{ padding: '14px 20px', color: '#6B7280', fontSize: '13px' }}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                        <td style={{ padding: '14px 20px' }}>
                          <span style={{ padding: '4px 10px', background: u.role === 'admin' ? '#FEF2F2' : '#F3F4F6', color: u.role === 'admin' ? '#C8102E' : '#6B7280', borderRadius: '8px', fontSize: '12px', fontWeight: 600, textTransform: 'capitalize' }}>{u.role}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '24px', padding: '32px', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px' }}>
                {editProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280' }}>
                <FiX size={24} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {[
                { key: 'name', label: 'Product Name *', type: 'text', span: 2 },
                { key: 'price', label: 'Price (₹) *', type: 'number' },
                { key: 'originalPrice', label: 'Original Price (₹)', type: 'number' },
                { key: 'stock', label: 'Stock *', type: 'number' },
                { key: 'brand', label: 'Brand', type: 'text' },
                { key: 'subCategory', label: 'Sub Category', type: 'text' },
                { key: 'discount', label: 'Discount %', type: 'number' },
                { key: 'sizes', label: 'Sizes (comma-sep)', type: 'text', span: 2 },
                { key: 'colors', label: 'Colors (comma-sep)', type: 'text', span: 2 },
              ].map(f => (
                <div key={f.key} style={{ gridColumn: f.span === 2 ? '1 / -1' : 'auto' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>{f.label}</label>
                  <input
                    type={f.type}
                    value={form[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    style={{ width: '100%', padding: '10px 14px', border: '2px solid #F0F0F0', borderRadius: '10px', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", outline: 'none', color: '#1A1A2E' }}
                  />
                </div>
              ))}

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>Category *</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={{ width: '100%', padding: '10px 14px', border: '2px solid #F0F0F0', borderRadius: '10px', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", color: '#1A1A2E' }}>
                  {['men', 'women', 'kids', 'accessories'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>Image URL</label>
                <input
                  type="text"
                  value={form.images[0]}
                  onChange={e => setForm(p => ({ ...p, images: [e.target.value] }))}
                  placeholder="https://example.com/image.jpg"
                  style={{ width: '100%', padding: '10px 14px', border: '2px solid #F0F0F0', borderRadius: '10px', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", color: '#1A1A2E' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  rows={3}
                  style={{ width: '100%', padding: '10px 14px', border: '2px solid #F0F0F0', borderRadius: '10px', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", resize: 'vertical', color: '#1A1A2E' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '20px' }}>
                {[
                  { key: 'isFeatured', label: 'Featured' },
                  { key: 'isNewArrival', label: 'New Arrival' },
                  { key: 'isOnOffer', label: 'On Offer' },
                ].map(f => (
                  <label key={f.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                    <input type="checkbox" checked={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.checked }))} style={{ width: '16px', height: '16px', accentColor: '#C8102E' }} />
                    {f.label}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '13px', border: '2px solid #E5E7EB', borderRadius: '12px', background: 'white', color: '#6B7280', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
              <button onClick={handleSave} style={{ flex: 2, padding: '13px', background: 'linear-gradient(135deg, #C8102E, #E31837)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontFamily: "'DM Sans', sans-serif" }}>
                <FiSave size={16} /> {editProduct ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
