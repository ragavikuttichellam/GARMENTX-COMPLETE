import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './CartPage.css';

const GST_RATE = 0.18;
const FREE_DELIVERY_THRESHOLD = 999;
const DELIVERY_CHARGE = 99;

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const gst = parseFloat((cartTotal * GST_RATE).toFixed(2));
  const delivery = cartTotal > FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
  const grandTotal = parseFloat((cartTotal + gst + delivery).toFixed(2));

  if (cartItems.length === 0) {
    return (
      <div className="empty-cart">
        <div className="empty-cart-content">
          <div className="empty-icon">🛍️</div>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything yet. Let's fix that!</p>
          <Link to="/shop" className="btn-primary">Start Shopping <FiArrowRight /></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-header">
        <div className="container">
          <h1>Shopping Cart</h1>
          <p>{cartItems.reduce((a, i) => a + i.quantity, 0)} items in your cart</p>
        </div>
      </div>

      <div className="container cart-layout">
        <div className="cart-items">
          {cartItems.map(item => (
            <div key={item._id + item.size + item.color} className="cart-item">
              <Link to={'/product/' + item._id} className="cart-item-img-wrap">
                <img src={item.images?.[0] || 'https://via.placeholder.com/120'} alt={item.name} />
              </Link>
              <div className="cart-item-info">
                <p className="cart-brand">{item.brand || 'GarmentX'}</p>
                <h3 className="cart-name">{item.name}</h3>
                <div className="cart-meta">
                  {item.size && <span className="meta-chip">Size: {item.size}</span>}
                  {item.color && <span className="meta-chip">Color: {item.color}</span>}
                </div>
                <div className="cart-item-bottom">
                  <div className="qty-control">
                    <button onClick={() => updateQuantity(item._id, item.size, item.color, item.quantity - 1)} disabled={item.quantity <= 1}><FiMinus size={14} /></button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, item.size, item.color, item.quantity + 1)}><FiPlus size={14} /></button>
                  </div>
                  <span className="cart-item-price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  <button className="remove-btn" onClick={() => removeFromCart(item._id, item.size, item.color)}><FiTrash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2>Order Summary</h2>
          <div className="summary-rows">
            <div className="summary-row">
              <span>Subtotal ({cartItems.reduce((a, i) => a + i.quantity, 0)} items)</span>
              <span>₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="summary-row">
              <span>GST (18%)</span>
              <span>₹{gst.toLocaleString('en-IN')}</span>
            </div>
            <div className="summary-row">
              <span>Delivery Charges</span>
              <span className={delivery === 0 ? 'free' : ''}>{delivery === 0 ? 'FREE' : '₹' + delivery}</span>
            </div>
            {delivery > 0 && (
              <div className="free-delivery-note">
                Add ₹{(FREE_DELIVERY_THRESHOLD - cartTotal).toLocaleString('en-IN')} more for free delivery!
              </div>
            )}
          </div>
          <div className="summary-total">
            <span>Grand Total</span>
            <span>₹{grandTotal.toLocaleString('en-IN')}</span>
          </div>
          <p className="summary-tax-note">* Inclusive of all taxes</p>
          <button className="checkout-btn" onClick={() => user ? navigate('/checkout') : navigate('/login?redirect=/checkout')}>
            <FiShoppingBag size={18} />
            {user ? 'Proceed to Checkout' : 'Login to Checkout'}
          </button>
          <Link to="/shop" className="continue-shopping">← Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}
