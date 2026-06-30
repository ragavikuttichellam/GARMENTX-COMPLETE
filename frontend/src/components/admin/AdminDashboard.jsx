import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  FiAlertCircle,
  FiBox,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiPackage,
  FiShoppingBag,
  FiTruck,
  FiUsers,
  FiXCircle
} from 'react-icons/fi';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { adminAPI } from '../../utils/api';

const formatCurrency = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
}).format(Number(value || 0));

function MetricCard({ icon: Icon, label, value, hint, color = '#C8102E' }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="h-11 w-11 rounded-lg flex items-center justify-center" style={{ background: `${color}16`, color }}>
          <Icon size={22} />
        </div>
        <div className="text-right">
          <p className="text-xs font-bold uppercase text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-extrabold text-gray-950">{value}</p>
          {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <h3 className="text-base font-extrabold text-gray-950 mb-4">{title}</h3>
      <div className="h-72">{children}</div>
    </div>
  );
}

function ProductList({ title, products, type }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <h3 className="text-base font-extrabold text-gray-950 mb-4">{title}</h3>
      <div className="space-y-3">
        {(products || []).length === 0 && <p className="text-sm text-gray-500">No products available.</p>}
        {(products || []).map((product) => (
          <div key={product._id || product.name} className="flex items-center gap-3 border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
            <img
              src={product.image || product.images?.[0] || 'https://via.placeholder.com/80?text=MW'}
              alt={product.name}
              className="h-11 w-11 rounded-lg object-cover border border-gray-200"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-gray-950 truncate">{product.name || 'Product'}</p>
              <p className="text-xs text-gray-500">
                {type === 'top' && `${product.quantitySold || 0} sold | ${formatCurrency(product.revenue)}`}
                {type === 'stock' && `${product.stock || 0} in stock | ${formatCurrency(product.price)}`}
                {type === 'recent' && `${product.category || 'product'} | ${formatCurrency(product.price)}`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusTile({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ background: `${color}16`, color }}>
          <Icon size={20} />
        </div>
        <div>
          <p className="text-xs font-bold uppercase text-gray-500">{label}</p>
          <p className="text-xl font-extrabold text-gray-950">{value || 0}</p>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await adminAPI.getDashboard();
        setStats(data.stats);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-500">Loading Manisara World dashboard...</div>;
  }

  if (!stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-red-800 flex items-center gap-3">
        <FiAlertCircle size={20} />
        Dashboard data is unavailable.
      </div>
    );
  }

  const overview = stats.overview || {};
  const orders = stats.orders || {};
  const analytics = stats.analytics || {};
  const products = stats.products || {};
  const customers = stats.customers || {};

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-950">Manisara World Sales Dashboard</h2>
          <p className="text-sm text-gray-500 mt-1">Revenue, orders, products, and customer performance.</p>
        </div>
        <div className="rounded-lg bg-red-50 px-4 py-2 text-sm font-bold text-red-700 border border-red-100">
          Paid orders only, cancelled excluded
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <MetricCard icon={FiShoppingBag} label="Total Products" value={overview.totalProducts || 0} color="#C8102E" />
        <MetricCard icon={FiPackage} label="Total Orders" value={overview.totalOrders || 0} color="#2563EB" />
        <MetricCard icon={FiUsers} label="Total Customers" value={overview.totalCustomers || 0} color="#7C3AED" />
        <MetricCard icon={FiDollarSign} label="Total Revenue" value={formatCurrency(overview.totalRevenue)} color="#059669" />
        <MetricCard icon={FiDollarSign} label="Today's Revenue" value={formatCurrency(overview.todaysRevenue)} color="#EA580C" />
        <MetricCard icon={FiDollarSign} label="Weekly Revenue" value={formatCurrency(overview.weeklyRevenue)} color="#9333EA" />
        <MetricCard icon={FiDollarSign} label="Monthly Revenue" value={formatCurrency(overview.monthlyRevenue)} color="#0891B2" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <ChartCard title="Daily Sales - Last 7 Days">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.dailySales || []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" />
              <YAxis tickFormatter={(value) => `₹${Number(value) / 1000}k`} />
              <Tooltip formatter={(value, name) => [name === 'revenue' ? formatCurrency(value) : value, name === 'revenue' ? 'Revenue' : 'Orders']} />
              <Bar dataKey="revenue" fill="#C8102E" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly Sales - Last 12 Months">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics.monthlySales || []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" />
              <YAxis tickFormatter={(value) => `₹${Number(value) / 1000}k`} />
              <Tooltip formatter={(value, name) => [name === 'revenue' ? formatCurrency(value) : value, name === 'revenue' ? 'Revenue' : 'Orders']} />
              <Area type="monotone" dataKey="revenue" stroke="#2563EB" fill="#DBEAFE" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Revenue Trend">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics.revenueTrend || []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" />
              <YAxis tickFormatter={(value) => `₹${Number(value) / 1000}k`} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Line type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <StatusTile icon={FiClock} label="Pending" value={orders.pending} color="#D97706" />
        <StatusTile icon={FiBox} label="Processing" value={orders.processing} color="#7C3AED" />
        <StatusTile icon={FiTruck} label="Shipped" value={orders.shipped} color="#2563EB" />
        <StatusTile icon={FiCheckCircle} label="Delivered" value={orders.delivered} color="#059669" />
        <StatusTile icon={FiXCircle} label="Cancelled" value={orders.cancelled} color="#DC2626" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <ProductList title="Top Selling Products" products={products.topSelling} type="top" />
        <ProductList title="Low Stock Products" products={products.lowStock} type="stock" />
        <ProductList title="Recently Added Products" products={products.recentlyAdded} type="recent" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <MetricCard icon={FiUsers} label="New Customers" value={customers.newCustomers || 0} hint="This month" color="#C8102E" />
        <MetricCard icon={FiUsers} label="Repeat Customers" value={customers.repeatCustomers || 0} hint="More than one paid order" color="#059669" />
        <ChartCard title="Customer Growth">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={customers.growth || []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="customers" stroke="#7C3AED" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
