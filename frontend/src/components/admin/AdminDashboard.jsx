import React, { useEffect, useState } from 'react';
import { FiTrendingUp, FiPackage, FiTruck, FiCheckCircle, FiDollarSign, FiUsers, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { adminAPI } from '../../utils/api';

/**
 * Analytics Card Component - Displays key metric with icon and value
 */
function AnalyticsCard({ icon: Icon, title, value, subtitle, color, trend }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '24px',
      border: '1px solid #E5E7EB',
      boxShadow: '0 1px 3px rgba(15,23,42,0.08)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{
          background: `${color}15`,
          padding: '12px',
          borderRadius: '8px',
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon size={24} />
        </div>
        {trend && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: trend > 0 ? '#10B981' : '#EF4444', fontSize: '12px', fontWeight: 700 }}>
            <FiTrendingUp size={14} />
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div style={{ marginBottom: '4px' }}>
        <p style={{ color: '#6B7280', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>{title}</p>
        <h3 style={{ fontSize: '28px', fontWeight: 800, color: '#111827' }}>{value}</h3>
      </div>
      {subtitle && <p style={{ color: '#9CA3AF', fontSize: '12px' }}>{subtitle}</p>}
    </div>
  );
}

/**
 * Chart Component - Simple bar chart for revenue trend
 */
function RevenueChart({ data }) {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div style={{
        background: '#F9FAFB',
        borderRadius: '8px',
        padding: '32px',
        textAlign: 'center',
        color: '#6B7280'
      }}>
        No data available
      </div>
    );
  }

  const entries = Object.entries(data).slice(-7); // Last 7 days
  const maxValue = Math.max(...entries.map(([_, v]) => v), 1);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(40px, 1fr))', gap: '8px', alignItems: 'flex-end', height: '200px' }}>
      {entries.map(([date, value]) => (
        <div key={date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <div style={{
            background: '#C8102E',
            borderRadius: '4px',
            width: '100%',
            height: `${(value / maxValue) * 160}px`,
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            opacity: 0.8
          }} title={`₹${value.toLocaleString('en-IN')}`} />
          <span style={{ fontSize: '10px', color: '#6B7280', textAlign: 'center', width: '100%' }}>
            {new Date(date).getDate()}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * Status Progress Card - Shows fulfillment and delivery progress
 */
function StatusProgressCard({ label, value, max, color }) {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>{label}</span>
        <span style={{ fontSize: '13px', fontWeight: 700, color: color }}>{value}</span>
      </div>
      <div style={{
        background: '#F3F4F6',
        borderRadius: '999px',
        height: '8px',
        overflow: 'hidden'
      }}>
        <div style={{
          background: color,
          height: '100%',
          width: `${percentage}%`,
          transition: 'width 0.3s ease'
        }} />
      </div>
    </div>
  );
}

/**
 * Admin Dashboard Component
 * Main analytics and metrics display for admin panel
 */
export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
    // Refresh stats every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await adminAPI.getDashboard();
      setStats(data.stats);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard');
      toast.error('Could not load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '64px 32px',
        textAlign: 'center',
        color: '#6B7280',
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        background: '#FEF2F2',
        borderRadius: '12px',
        padding: '24px',
        border: '1px solid #FECACA',
        color: '#991B1B',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <FiAlertCircle size={20} />
        <div>
          <p style={{ fontWeight: 700 }}>Error Loading Dashboard</p>
          <p style={{ fontSize: '14px' }}>{error}</p>
        </div>
      </div>
    );
  }

  const overview = stats?.overview || {};
  const orders = stats?.orders || {};
  const analytics = stats?.analytics || {};

  return (
    <div style={{ display: 'grid', gap: '32px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', marginBottom: '8px' }}>Dashboard</h1>
        <p style={{ color: '#6B7280', fontSize: '15px' }}>Welcome back! Here's an overview of your store performance.</p>
      </div>

      {/* Key Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px'
      }}>
        <AnalyticsCard
          icon={FiDollarSign}
          title="Total Revenue"
          value={`₹${overview.totalRevenue?.toLocaleString('en-IN') || '0'}`}
          subtitle={`Recent: ₹${overview.recentRevenue?.toLocaleString('en-IN') || '0'}`}
          color="#C8102E"
          trend={12}
        />
        <AnalyticsCard
          icon={FiPackage}
          title="Total Orders"
          value={overview.totalOrders || '0'}
          subtitle={`${orders.fulfilled || 0} fulfilled`}
          color="#0369A1"
        />
        <AnalyticsCard
          icon={FiTruck}
          title="In Transit"
          value={orders.shipped || '0'}
          subtitle="Orders shipped"
          color="#C2410C"
        />
        <AnalyticsCard
          icon={FiCheckCircle}
          title="Delivered"
          value={orders.delivered || '0'}
          subtitle={`${orders.fulfillmentRate}% fulfillment rate`}
          color="#047857"
          trend={8}
        />
        <AnalyticsCard
          icon={FiUsers}
          title="Total Customers"
          value={overview.totalUsers || '0'}
          subtitle="Active users"
          color="#7C3AED"
        />
        <AnalyticsCard
          icon={FiTrendingUp}
          title="Avg. Order Value"
          value={`₹${analytics.averageOrderValue?.toLocaleString('en-IN') || '0'}`}
          subtitle="Per transaction"
          color="#06B6D4"
        />
      </div>

      {/* Revenue Chart & Order Status */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Revenue Trend */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(15,23,42,0.08)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', marginBottom: '20px' }}>Revenue Trend (Last 7 Days)</h3>
          <RevenueChart data={analytics.revenueByDay} />
        </div>

        {/* Order Status Overview */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(15,23,42,0.08)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', marginBottom: '20px' }}>Order Status</h3>
          <StatusProgressCard
            label="Pending & Processing"
            value={orders.pending || 0}
            max={overview.totalOrders || 1}
            color="#FBBF24"
          />
          <StatusProgressCard
            label="Shipped"
            value={orders.shipped || 0}
            max={overview.totalOrders || 1}
            color="#60A5FA"
          />
          <StatusProgressCard
            label="Delivered"
            value={orders.delivered || 0}
            max={overview.totalOrders || 1}
            color="#10B981"
          />
          <StatusProgressCard
            label="Returned"
            value={orders.returned || 0}
            max={overview.totalOrders || 1}
            color="#F87171"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        border: '1px solid #E5E7EB',
        boxShadow: '0 1px 3px rgba(15,23,42,0.08)'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', marginBottom: '16px' }}>Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          <button style={{
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid #E5E7EB',
            background: 'white',
            color: '#111827',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }} onMouseEnter={e => e.target.style.background = '#F9FAFB'} onMouseLeave={e => e.target.style.background = 'white'}>
            <FiPackage size={16} /> View Orders
          </button>
          <button style={{
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid #E5E7EB',
            background: 'white',
            color: '#111827',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }} onMouseEnter={e => e.target.style.background = '#F9FAFB'} onMouseLeave={e => e.target.style.background = 'white'}>
            <FiTruck size={16} /> Scan Package
          </button>
          <button style={{
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid #E5E7EB',
            background: 'white',
            color: '#111827',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }} onMouseEnter={e => e.target.style.background = '#F9FAFB'} onMouseLeave={e => e.target.style.background = 'white'}>
            <FiDollarSign size={16} /> Export Report
          </button>
        </div>
      </div>
    </div>
  );
}
