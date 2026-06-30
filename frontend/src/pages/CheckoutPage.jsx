import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Truck, CreditCard, Plus, X } from 'lucide-react';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import api from '../utils/api';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phone: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    isDefault: false
  });
  const [loading, setLoading] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');

  useEffect(() => {
    loadCart();
    loadUser();
  }, []);

  const loadCart = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartItems(cart);
      if (cart.length === 0) {
        navigate('/cart');
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const loadUser = async () => {
    try {
      const res = await api.get('/auth/profile');
      const userData = res.data.user;
      setUser(userData);

      const addressList = [];
      if (userData.address && Object.keys(userData.address).length > 0) {
        const addressObj = {
          _id: 'profile-address',
          fullName: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          addressLine1: userData.address.street || '',
          addressLine2: '',
          city: userData.address.city || '',
          state: userData.address.state || '',
          pincode: userData.address.pincode || '',
          country: userData.address.country || 'India',
          isDefault: true
        };
        addressList.push(addressObj);
        setSelectedAddress(addressObj._id);
      }
      setAddresses(addressList);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.fullName || !newAddress.phone || !newAddress.addressLine1 || !newAddress.city || !newAddress.pincode) {
      toast.error('Please fill all required fields');
      return;
    }

    const address = {
      ...newAddress,
      _id: `local-address-${Date.now()}`
    };
    setAddresses([...addresses, address]);
    setSelectedAddress(address._id);
    setShowAddressForm(false);
    setNewAddress({
      fullName: '',
      phone: '',
      email: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      isDefault: false
    });
    toast.success('Address added successfully');
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 499 ? 0 : 99;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }

    const selectedAddressObj = addresses.find((addr) => addr._id === selectedAddress);
    if (!selectedAddressObj) {
      toast.error('Please select a delivery address');
      return;
    }

    const orderItems = cartItems.map((item) => ({
      product: item.product || item.productId || item._id || item.id,
      quantity: item.quantity,
      size: item.size,
      color: item.color
    }));

    const shippingAddress = {
      fullName: selectedAddressObj.fullName,
      email: selectedAddressObj.email,
      phone: selectedAddressObj.phone,
      addressLine1: selectedAddressObj.addressLine1,
      addressLine2: selectedAddressObj.addressLine2,
      city: selectedAddressObj.city,
      state: selectedAddressObj.state,
      pincode: selectedAddressObj.pincode,
      country: selectedAddressObj.country
    };

    const orderData = {
      orderItems,
      shippingAddress,
      paymentMethod,
      notes: orderNotes
    };

    try {
      setLoading(true);

      if (paymentMethod === 'razorpay') {
        await handleRazorpayPayment(orderData);
      } else if (paymentMethod === 'cod') {
        await createOrder(orderData);
      } else if (paymentMethod === 'upi') {
        await handleUPIPayment(orderData);
      }
    } catch (error) {
      toast.error('Error processing order');
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpayPayment = async (orderData) => {
    try {
      const orderRes = await api.post('/orders', orderData);
      const order = orderRes.data.order || orderRes.data;

      const keyRes = await api.get('/payment/key');
      const paymentRes = await api.post('/payment/razorpay', { orderId: order._id });
      const razorpayOrder = paymentRes.data.razorpayOrder;
      const razorpayKey = keyRes.data.key || process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_1234567890';

      const options = {
        key: razorpayKey,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Manisara World',
        description: `Order #${order._id}`,
        order_id: razorpayOrder.id,
        handler: async (response) => {
          try {
            const verifyRes = await api.post('/payment/verify', {
              orderId: order._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyRes.data.success) {
              localStorage.removeItem('cart');
              navigate(`/payment-success/${order._id}`);
            }
          } catch (error) {
            toast.error('Payment verification failed');
            navigate(`/payment-failed/${order._id}`);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || ''
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      toast.error('Error initiating payment');
    }
  };

  const handleUPIPayment = async (orderData) => {
    try {
      const orderRes = await api.post('/orders', orderData);
      const order = orderRes.data.order || orderRes.data;

      const upiUrl = `upi://pay?pa=merchant@upi&pn=Manisara World&am=${total}&tn=Order%20${order._id}`;
      window.location.href = upiUrl;

      setTimeout(() => {
        navigate(`/payment-success/${order._id}`);
      }, 2000);
    } catch (error) {
      toast.error('Error processing UPI payment');
    }
  };

  const createOrder = async (orderData) => {
    try {
      const res = await api.post('/orders', orderData);
      const order = res.data.order || res.data;
      localStorage.removeItem('cart');
      navigate(`/payment-success/${order._id}`);
      toast.success('Order placed successfully!');
    } catch (error) {
      toast.error('Error creating order');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/cart')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex-1">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold">1</div>
                <div className="flex-1 h-1 bg-pink-500 mx-2"></div>
              </div>
              <p className="text-sm font-semibold text-gray-900 mt-2">Delivery Address</p>
            </div>
            <div className="flex-1">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold">2</div>
                <div className="flex-1 h-1 bg-pink-500 mx-2"></div>
              </div>
              <p className="text-sm font-semibold text-gray-900 mt-2">Payment</p>
            </div>
            <div className="flex-1">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-bold">3</div>
              </div>
              <p className="text-sm font-semibold text-gray-900 mt-2">Review</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Delivery Address Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Delivery Address
                </h2>
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="text-pink-500 hover:text-pink-600 font-semibold flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add New
                </button>
              </div>

              {/* Address Form */}
              {showAddressForm && (
                <form onSubmit={handleAddAddress} className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="Full Name *"
                      value={newAddress.fullName}
                      onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number *"
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>

                  <input
                    type="email"
                    placeholder="Email"
                    value={newAddress.email}
                    onChange={(e) => setNewAddress({ ...newAddress, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm mb-4"
                  />

                  <input
                    type="text"
                    placeholder="Address Line 1 *"
                    value={newAddress.addressLine1}
                    onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm mb-4"
                  />

                  <input
                    type="text"
                    placeholder="Address Line 2"
                    value={newAddress.addressLine2}
                    onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm mb-4"
                  />

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <input
                      type="text"
                      placeholder="City *"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Pincode *"
                      value={newAddress.pincode}
                      onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <select
                      value={newAddress.country}
                      onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option>India</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <label className="flex items-center gap-2 mb-4 text-sm">
                    <input
                      type="checkbox"
                      checked={newAddress.isDefault}
                      onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-gray-700">Set as default address</span>
                  </label>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-pink-500 text-white py-2 rounded-lg font-semibold hover:bg-pink-600 transition-colors disabled:opacity-50"
                    >
                      Save Address
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="flex-1 bg-gray-200 text-gray-900 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Saved Addresses */}
              {addresses.length > 0 && (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <label key={addr._id} className="flex p-4 border-2 rounded-lg cursor-pointer hover:border-pink-300 transition-colors" style={{ borderColor: selectedAddress === addr._id ? '#ec4899' : '#e5e7eb' }}>
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddress === addr._id}
                        onChange={() => setSelectedAddress(addr._id)}
                        className="mt-1 mr-4"
                      />
                      <div className="flex-grow">
                        <p className="font-semibold text-gray-900">{addr.fullName}</p>
                        <p className="text-sm text-gray-600">{addr.addressLine1}, {addr.addressLine2}</p>
                        <p className="text-sm text-gray-600">{addr.city}, {addr.state} {addr.pincode}</p>
                        <p className="text-xs text-gray-600 mt-1">Phone: {addr.phone}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {addresses.length === 0 && !showAddressForm && (
                <p className="text-gray-600 text-center py-4">No saved addresses. Please add a delivery address.</p>
              )}
            </div>

            {/* Payment Method Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Method
              </h2>

              <div className="space-y-3">
                <label className="flex p-4 border-2 rounded-lg cursor-pointer border-gray-200 hover:border-pink-300 transition-colors" style={{ borderColor: paymentMethod === 'razorpay' ? '#ec4899' : '#e5e7eb' }}>
                  <input
                    type="radio"
                    name="payment"
                    value="razorpay"
                    checked={paymentMethod === 'razorpay'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-1 mr-4"
                  />
                  <div className="flex-grow">
                    <p className="font-semibold text-gray-900">Credit/Debit Card / Digital Wallet</p>
                    <p className="text-sm text-gray-600">Fast & Secure with Razorpay</p>
                  </div>
                </label>

                <label className="flex p-4 border-2 rounded-lg cursor-pointer border-gray-200 hover:border-pink-300 transition-colors" style={{ borderColor: paymentMethod === 'upi' ? '#ec4899' : '#e5e7eb' }}>
                  <input
                    type="radio"
                    name="payment"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-1 mr-4"
                  />
                  <div className="flex-grow">
                    <p className="font-semibold text-gray-900">UPI</p>
                    <p className="text-sm text-gray-600">Google Pay, PhonePe, Paytm</p>
                  </div>
                </label>

                <label className="flex p-4 border-2 rounded-lg cursor-pointer border-gray-200 hover:border-pink-300 transition-colors" style={{ borderColor: paymentMethod === 'cod' ? '#ec4899' : '#e5e7eb' }}>
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mt-1 mr-4"
                  />
                  <div className="flex-grow">
                    <p className="font-semibold text-gray-900">Cash on Delivery</p>
                    <p className="text-sm text-gray-600">Pay when your order arrives</p>
                  </div>
                </label>
              </div>

              {/* Order Notes */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <label className="block text-sm font-semibold text-gray-900 mb-2">Order Notes (Optional)</label>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Add any special requests or notes"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm h-24 resize-none"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

              {/* Items */}
              <div className="max-h-64 overflow-y-auto mb-6 pb-6 border-b border-gray-200">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex justify-between mb-3 text-sm">
                    <span className="text-gray-600">
                      {item.name} x {item.quantity}
                    </span>
                    <span className="font-semibold text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-900">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold text-gray-900">
                    {shipping === 0 ? <span className="text-green-600">FREE</span> : <>₹{shipping.toLocaleString()}</>}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (18% GST)</span>
                  <span className="font-semibold text-gray-900">₹{tax.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-between mb-6">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-pink-500">₹{total.toLocaleString()}</span>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading || !selectedAddress}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CheckoutPage;
