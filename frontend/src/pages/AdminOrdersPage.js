import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiBarChart2, FiCheckCircle, FiClock, FiSearch, FiTruck } from 'react-icons/fi';
import { adminAPI } from '../utils/api';
import AdminOrders from '../components/admin/AdminOrders';
import BarcodeScanner from '../components/admin/BarcodeScanner';

function MetricCard({ icon, label, value, color }) {
  return (
    <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '18px', boxShadow: '0 1px 4px rgba(15,23,42,0.05)' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${color}18`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>{icon}</div>
      <div style={{ color: '#6B7280', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ color: '#111827', fontSize: '24px', fontWeight: 900, marginTop: '4px' }}>{value}</div>
    </div>
  );
}

export default function AdminOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersRes, statsRes] = await Promise.all([
        adminAPI.getAllOrders(),
        adminAPI.getDashboard()
      ]);
      setOrders(ordersRes.data.orders || []);
      const rawStats = statsRes.data.stats || {};
      setStats({
        totalOrders: rawStats.totalOrders ?? rawStats.overview?.totalOrders ?? 0,
        pendingOrders: rawStats.pendingOrders ?? rawStats.orders?.pending ?? 0,
        shippedOrders: rawStats.shippedOrders ?? rawStats.orders?.shipped ?? 0,
        deliveredOrders: rawStats.deliveredOrders ?? rawStats.orders?.delivered ?? 0,
        totalRevenue: rawStats.totalRevenue ?? rawStats.overview?.totalRevenue ?? 0,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load admin orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredOrders = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return orders.filter((order) => {
      const searchable = [
        order.orderNumber,
        order.packageId,
        order.invoiceNumber,
        order.courierDetails?.trackingId,
        order.courierDetails?.awbNumber,
        order.user?.name,
        order.user?.email,
      ].filter(Boolean).join(' ').toLowerCase();
      return searchable.includes(term) && (!statusFilter || order.status === statusFilter);
    });
  }, [orders, searchTerm, statusFilter]);

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', background: '#F8FAFC' }}>
      <div className="container" style={{ padding: '32px 24px', maxWidth: '1280px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '36px', color: '#111827', marginBottom: '6px' }}>Order Operations</h1>
            <p style={{ color: '#6B7280' }}>Invoice, barcode scanning, package verification, and courier tracking.</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '16px', marginBottom: '22px' }}>
          <MetricCard icon={<FiBarChart2 size={20} />} label="Total Orders" value={stats.totalOrders || 0} color="#C8102E" />
          <MetricCard icon={<FiClock size={20} />} label="Pending" value={stats.pendingOrders || 0} color="#F59E0B" />
          <MetricCard icon={<FiTruck size={20} />} label="Shipped" value={stats.shippedOrders || 0} color="#2563EB" />
          <MetricCard icon={<FiCheckCircle size={20} />} label="Delivered" value={stats.deliveredOrders || 0} color="#16A34A" />
          <MetricCard icon={<FiBarChart2 size={20} />} label="Revenue" value={`₹${Number(stats.totalRevenue || 0).toLocaleString('en-IN')}`} color="#7C3AED" />
        </div>

        <div style={{ marginBottom: '22px' }}>
          <BarcodeScanner onScanComplete={fetchData} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: '14px', marginBottom: '18px' }}>
          <div style={{ position: 'relative' }}>
            <FiSearch size={18} style={{ position: 'absolute', left: '14px', top: '13px', color: '#9CA3AF' }} />
            <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search order, package, tracking ID, AWB, customer..." style={{ width: '100%', padding: '12px 14px 12px 44px', border: '1px solid #D1D5DB', borderRadius: '10px', boxSizing: 'border-box' }} />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '12px 14px', border: '1px solid #D1D5DB', borderRadius: '10px', background: 'white' }}>
            <option value="">All statuses</option>
            {['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'].map((status) => (
              <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>
            ))}
          </select>
        </div>

        <AdminOrders orders={filteredOrders} loading={loading} onOpenOrder={(id) => navigate(`/admin/orders/${id}`)} />
      </div>
    </div>
  );
}
