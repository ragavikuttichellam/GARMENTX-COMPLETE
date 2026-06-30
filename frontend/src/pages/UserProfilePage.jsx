import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, ShoppingBag, MapPin, Download, Eye, Lock } from 'lucide-react';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import { authAPI, orderAPI } from '../utils/api';
import toast from 'react-hot-toast';

const UserProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const userRes = await authAPI.getProfile();
      setUser(userRes.data.user);
      setEditData(userRes.data.user);

      const ordersRes = await orderAPI.getMyOrders();
      setOrders(ordersRes.data.orders || []);
    } catch (error) {
      console.error('Error loading user data:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        toast.error('Error loading profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('manisara_world_token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleSaveProfile = async () => {
    try {
      const res = await authAPI.updateProfile(editData);
      setUser(res.data.user);
      setEditMode(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating profile');
    }
  };

  const handleChangePassword = async () => {
    try {
      if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
        toast.error('Please fill in all password fields');
        return;
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast.error('New password and confirmation do not match');
        return;
      }
      setChangingPassword(true);
      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error changing password');
    } finally {
      setChangingPassword(false);
    }
  };

  const downloadInvoice = async (orderId) => {
    try {
      const res = await api.get(`/admin/orders/${orderId}/invoice`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(res);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${orderId}.pdf`;
      a.click();
    } catch (error) {
      toast.error('Error downloading invoice');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <p className="text-gray-600">Please login to view your profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors font-semibold"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center text-white">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Welcome back!</p>
                  <p className="text-lg font-bold text-gray-900">{user.name}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-600 uppercase">Email</p>
                  <p className="text-gray-900 font-semibold">{user.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase">Phone</p>
                  <p className="text-gray-900 font-semibold">{user.phone || 'Not set'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 uppercase">Member Since</p>
                  <p className="text-gray-900 font-semibold">
                    {new Date(user.createdAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-600 uppercase mb-2">Loyalty Points</p>
                <p className="text-3xl font-bold text-pink-500">{user.loyaltyPoints || 0}</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('orders')}
                className={`pb-4 font-semibold transition-colors flex items-center gap-2 ${
                  activeTab === 'orders'
                    ? 'text-pink-500 border-b-2 border-pink-500'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <ShoppingBag className="w-5 h-5" />
                My Orders
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`pb-4 font-semibold transition-colors flex items-center gap-2 ${
                  activeTab === 'profile'
                    ? 'text-pink-500 border-b-2 border-pink-500'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <User className="w-5 h-5" />
                Edit Profile
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`pb-4 font-semibold transition-colors flex items-center gap-2 ${
                  activeTab === 'security'
                    ? 'text-pink-500 border-b-2 border-pink-500'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Lock className="w-5 h-5" />
                Security
              </button>
              <button
                onClick={() => setActiveTab('addresses')}
                className={`pb-4 font-semibold transition-colors flex items-center gap-2 ${
                  activeTab === 'addresses'
                    ? 'text-pink-500 border-b-2 border-pink-500'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <MapPin className="w-5 h-5" />
                Addresses
              </button>
            </div>

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <div key={order._id} className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Order ID</p>
                          <p className="text-lg font-bold text-gray-900 font-mono">{order._id}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600 mb-1">Status</p>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-gray-200">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Date</p>
                          <p className="font-semibold text-gray-900">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Items</p>
                          <p className="font-semibold text-gray-900">{order.items?.length} items</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Total</p>
                          <p className="font-bold text-lg text-pink-500">₹{order.totalAmount?.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/order/${order._id}`)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors font-semibold"
                        >
                          <Eye className="w-4 h-4" />
                          Track Order
                        </button>
                        <button
                          onClick={() => downloadInvoice(order._id)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                        >
                          <Download className="w-4 h-4" />
                          Invoice
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-lg text-gray-600 mb-4">No orders yet</p>
                    <button
                      onClick={() => navigate('/products')}
                      className="bg-pink-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-pink-600 transition-colors"
                    >
                      Start Shopping
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                {editMode ? (
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={editData.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
                      <input
                        type="email"
                        value={editData.email}
                        readOnly
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                      />
                      <p className="text-xs text-gray-600 mt-1">Email cannot be changed</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={editData.phone || ''}
                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500"
                      />
                    </div>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={handleSaveProfile}
                        className="flex-1 bg-pink-500 text-white py-2 rounded-lg font-semibold hover:bg-pink-600 transition-colors"
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditMode(false);
                          setEditData(user);
                        }}
                        className="flex-1 border border-gray-300 text-gray-900 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Full Name</p>
                      <p className="text-lg font-semibold text-gray-900">{user.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Email</p>
                      <p className="text-lg font-semibold text-gray-900">{user.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Phone</p>
                      <p className="text-lg font-semibold text-gray-900">{user.phone || 'Not set'}</p>
                    </div>
                    <button
                      onClick={() => setEditMode(true)}
                      className="w-full bg-pink-500 text-white py-2 rounded-lg font-semibold hover:bg-pink-600 transition-colors"
                    >
                      Edit Profile
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Current Password</label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">New Password</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleChangePassword}
                    disabled={changingPassword}
                    className="w-full bg-pink-500 text-white py-2 rounded-lg font-semibold hover:bg-pink-600 transition-colors disabled:opacity-60"
                  >
                    {changingPassword ? 'Updating Password...' : 'Update Password'}
                  </button>
                </div>
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-600">Address management coming soon</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default UserProfilePage;
