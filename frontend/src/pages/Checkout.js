import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FiLock, FiCreditCard } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Checkout.css';

export default function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ fullName: user?.name || '', phone: user?.phone || '', street: '', city: '', state: '', pincode: '' });

  const gst = parseFloat((cartTotal * 0.18).toFixed(2));
  const delivery = cartTotal > 999 ? 0 : 99;
  const total = parseFloat((cartTotal + gst + delivery).toFixed(2));

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return toast.error('Cart is empty!');
    setLoading(true);
    try {
      // 1. Create order in DB
      const orderData = {
        orderItems: cartItems.map(i => ({ product: i._id, name: i.name, image: i.images?.[0], price: i.price, quantity: i.quantity, size: i.size, color: i.color })),
        shippingAddress: form,
        paymentMethod: 'razorpay'
      };
      const { data: orderRes } = await api.post('/orders', orderData);
      if (!orderRes.success) return toast.error('Failed to create order');
      const order = orderRes.order;

      // 2. Create Razorpay order
      const { data: payRes } = await api.post('/payment/razorpay', { orderId: order._id });
      if (!payRes.success) return toast.error('Payment init failed');

      // 3. Open Razorpay
      const options = {
        key: payRes.key,
        amount: payRes.razorpayOrder.amount,
        currency: 'INR',
        name: 'Manisara World',
        description: 'Fashion Purchase',
        order_id: payRes.razorpayOrder.id,
        handler: async (response) => {
          try {
            const { data: verifyRes } = await api.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order._id
            });
            if (verifyRes.success) {
              clearCart();
              navigate('/order-success/' + order._id);
            } else {
              toast.error('Payment verification failed');
            }
          } catch { toast.error('Verification error'); }
        },
        prefill: { name: form.fullName, contact: form.phone },
        theme: { color: '#C8102E' },
        modal: { ondismiss: () => toast('Payment cancelled') }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <div className="container">
          <h1><FiLock size={22} /> Secure Checkout</h1>
          <p>All transactions are 256-bit SSL encrypted</p>
        </div>
      </div>
      <div className="container checkout-layout">
        <form onSubmit={handleCheckout} className="checkout-form">
          <div className="form-section">
            <h2>Delivery Address</h2>
            <div className="form-grid">
              <div className="form-group full">
                <label>Full Name *</label>
                <input name="fullName" value={form.fullName} onChange={handleChange} required placeholder="Your full name" />
              </div>
              <div className="form-group">
                <label>Phone *</label>
                <input name="phone" value={form.phone} onChange={handleChange} required placeholder="10-digit mobile" pattern="[0-9]{10}" />
              </div>
              <div className="form-group full">
                <label>Street Address *</label>
                <input name="street" value={form.street} onChange={handleChange} required placeholder="House no, street, area" />
              </div>
              <div className="form-group">
                <label>City *</label>
                <input name="city" value={form.city} onChange={handleChange} required placeholder="City" />
              </div>
              <div className="form-group">
                <label>State *</label>
                <input name="state" value={form.state} onChange={handleChange} required placeholder="State" />
              </div>
              <div className="form-group">
                <label>PIN Code *</label>
                <input name="pincode" value={form.pincode} onChange={handleChange} required placeholder="6-digit PIN" pattern="[0-9]{6}" />
              </div>
            </div>
          </div>
          <div className="form-section">
            <h2><FiCreditCard size={20} /> Payment</h2>
            <div className="payment-note">
              <div className="payment-logos">
                <span>💳</span><span>UPI</span><span>NetBanking</span><span>Wallets</span>
              </div>
              <p>Secure payment powered by <strong>Razorpay</strong>. Click below to proceed.</p>
            </div>
          </div>
          <button type="submit" className="pay-btn" disabled={loading}>
            {loading ? <><span className="loader-spin"></span> Processing...</> : <>Pay ₹{total.toLocaleString('en-IN')} <FiLock size={16} /></>}
          </button>
        </form>

        <div className="checkout-summary">
          <h2>Order Items ({cartItems.length})</h2>
          <div className="checkout-items">
            {cartItems.map(item => (
              <div key={item._id + item.size} className="checkout-item">
                <img src={item.images?.[0] || 'https://via.placeholder.com/60'} alt={item.name} />
                <div>
                  <p className="ci-name">{item.name}</p>
                  <p className="ci-meta">{item.size} • Qty: {item.quantity}</p>
                  <p className="ci-price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="checkout-totals">
            <div className="total-row"><span>Subtotal</span><span>₹{cartTotal.toLocaleString('en-IN')}</span></div>
            <div className="total-row"><span>GST (18%)</span><span>₹{gst.toLocaleString('en-IN')}</span></div>
            <div className="total-row"><span>Delivery</span><span className={delivery === 0 ? 'free' : ''}>{delivery === 0 ? 'FREE' : '₹' + delivery}</span></div>
            <div className="total-row grand"><span>Total</span><span>₹{total.toLocaleString('en-IN')}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
