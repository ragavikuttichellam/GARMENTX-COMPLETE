import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

const StarRating = ({ rating }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span key={i} className={i <= Math.round(rating) ? 'star filled' : 'star'}>★</span>
    );
  }
  return <div className="star-row">{stars}</div>;
};

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [wishlist, setWishlist] = useState(false);

  const price    = product.discountPrice > 0 ? product.discountPrice : product.price;
  const original = product.discountPrice > 0 ? product.price : null;
  const discount = original ? Math.round(((original - price) / original) * 100) : 0;
  const image    = product.images?.[0]?.url || 'https://via.placeholder.com/400x500?text=Manisara World';

  const handleAddToCart = async (e) => {
    e.preventDefault();
    setAdding(true);
    addToCart(product);
    setTimeout(() => setAdding(false), 800);
  };

  const handleBuyNow = (e) => {
    e.preventDefault();
    addToCart(product);
    navigate('/cart');
  };

  return (
    <div className="product-card">
      {/* Image */}
      <Link to={`/product/${product._id}`} className="card-image-wrap">
        <img src={image} alt={product.name} className="card-image" loading="lazy" />

        {/* Badges */}
        <div className="card-badges">
          {product.isNewArrival && <span className="badge badge-green">New</span>}
          {discount > 0        && <span className="badge badge-red">{discount}% OFF</span>}
          {product.isOnOffer   && !discount && <span className="badge badge-gold">Offer</span>}
        </div>

        {/* Wishlist */}
        <button
          className={`wishlist-btn ${wishlist ? 'active' : ''}`}
          onClick={e => { e.preventDefault(); setWishlist(w => !w); }}
          aria-label="Add to wishlist"
        >
          {wishlist ? '❤️' : '🤍'}
        </button>

        {/* Quick Actions Overlay */}
        <div className="card-overlay">
          <button className="overlay-btn" onClick={handleBuyNow}>Buy Now</button>
        </div>
      </Link>

      {/* Details */}
      <div className="card-details">
        <span className="card-category">{product.category} · {product.subCategory || ''}</span>
        <Link to={`/product/${product._id}`} className="card-name">{product.name}</Link>

        <div className="card-rating">
          <StarRating rating={product.ratings || 0} />
          <span className="review-count">({product.numReviews || 0})</span>
        </div>

        <div className="card-price">
          <span className="price-current">₹{price.toLocaleString('en-IN')}</span>
          {original && (
            <>
              <span className="price-original">₹{original.toLocaleString('en-IN')}</span>
              <span className="price-discount">{discount}% off</span>
            </>
          )}
        </div>

        {product.stock === 0 ? (
          <div className="out-of-stock">Out of Stock</div>
        ) : (
          <div className="card-actions">
            <button
              className={`btn btn-outline btn-sm add-cart-btn ${adding ? 'adding' : ''}`}
              onClick={handleAddToCart}
              disabled={adding}
            >
              {adding ? '✓ Added!' : '+ Cart'}
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleBuyNow}
            >
              Buy Now
            </button>
          </div>
        )}

        {product.stock > 0 && product.stock <= 5 && (
          <p className="low-stock">⚠️ Only {product.stock} left!</p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
