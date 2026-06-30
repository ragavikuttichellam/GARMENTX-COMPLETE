import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingBag, FiZap, FiHeart, FiStar } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [wished, setWished] = useState(false);
  const [adding, setAdding] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    setAdding(true);
    addToCart(product, product.sizes?.[0] || 'M', product.colors?.[0] || 'Default');
    setTimeout(() => setAdding(false), 1000);
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    addToCart(product, product.sizes?.[0] || 'M', product.colors?.[0] || 'Default');
    navigate('/cart');
  };

  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : product.discount || 0;

  return (
    <Link to={'/product/' + product._id} className="product-card">
      <div className="product-img-wrap">
        <img src={product.images?.[0] || 'https://via.placeholder.com/300x350/f5f5f5?text=No+Image'} alt={product.name} className="product-img" loading="lazy" />
        <div className="product-overlay">
          <button className={'add-cart-btn' + (adding ? ' adding' : '')} onClick={handleAddToCart}>
            <FiShoppingBag size={16} />
            {adding ? 'Added!' : 'Add to Cart'}
          </button>
          <button className="buy-now-btn" onClick={handleBuyNow}>
            <FiZap size={16} /> Buy Now
          </button>
        </div>
        {discount > 0 && <span className="discount-badge">-{discount}%</span>}
        {product.isNewArrival && <span className="new-badge">New</span>}
        <button className={'wish-btn' + (wished ? ' wished' : '')} onClick={e => { e.preventDefault(); setWished(!wished); }}>
          <FiHeart size={16} />
        </button>
      </div>
      <div className="product-info">
        <p className="product-brand">{product.brand || 'Manisara World'}</p>
        <h3 className="product-name">{product.name}</h3>
        <div className="product-rating">
          <div className="stars">
            {[...Array(5)].map((_, i) => (
              <FiStar key={i} size={12} fill={i < Math.floor(product.rating || 0) ? '#FFB800' : 'none'} color={i < Math.floor(product.rating || 0) ? '#FFB800' : '#D1D5DB'} />
            ))}
          </div>
          <span className="rating-count">({product.numReviews || 0})</span>
        </div>
        <div className="product-price">
          <span className="price-current">₹{product.price?.toLocaleString('en-IN')}</span>
          {product.originalPrice && <span className="price-original">₹{product.originalPrice?.toLocaleString('en-IN')}</span>}
        </div>
        {product.sizes && product.sizes.length > 0 && (
          <div className="size-chips">
            {product.sizes.slice(0, 4).map(s => <span key={s} className="size-chip">{s}</span>)}
          </div>
        )}
      </div>
    </Link>
  );
}
