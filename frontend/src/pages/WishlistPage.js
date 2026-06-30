import React from 'react';
import { FiHeart, FiShoppingCart, FiTrash2, FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import toast from 'react-hot-toast';
import './WishlistPage.css';

/**
 * Wishlist Page Component
 * Displays all wishlist items with actions to add to cart or remove
 */
const WishlistPage = () => {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();

  const handleAddToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('manisara_world_cart') || '[]');
    const exists = cart.find(item => item._id === product._id);
    
    if (exists) {
      exists.quantity += 1;
    } else {
      cart.push({
        ...product,
        quantity: 1,
        selectedSize: 'M',
        selectedColor: product.colors ? product.colors[0] : '#000',
      });
    }
    
    localStorage.setItem('manisara_world_cart', JSON.stringify(cart));
    removeFromWishlist(product._id);
    toast.success('Added to cart');
  };

  if (wishlist.length === 0) {
    return (
      <div className="wishlist-empty">
        <div className="container">
          <div className="empty-state">
            <FiHeart size={64} />
            <h2>Your Wishlist is Empty</h2>
            <p>Save your favorite items to view them later</p>
            <Link to="/shop" className="btn-primary">
              <FiArrowLeft /> Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="container">
        <div className="wishlist-header">
          <h1>My Wishlist</h1>
          <span className="wishlist-count">({wishlist.length} items)</span>
          {wishlist.length > 0 && (
            <button className="clear-wishlist" onClick={clearWishlist}>
              Clear All
            </button>
          )}
        </div>

        <div className="wishlist-grid">
          {wishlist.map((product) => (
            <div key={product._id} className="wishlist-item">
              <Link to={`/product/${product._id}`} className="wishlist-item-image">
                <img src={product.images?.[0] || 'placeholder.jpg'} alt={product.name} />
                {product.discount && (
                  <span className="discount-badge">-{product.discount}%</span>
                )}
              </Link>

              <div className="wishlist-item-content">
                <Link to={`/product/${product._id}`} className="wishlist-item-name">
                  {product.name}
                </Link>
                
                <p className="wishlist-item-category">{product.category}</p>

                <div className="wishlist-item-price">
                  <span className="current-price">₹{product.price?.toLocaleString('en-IN')}</span>
                  {product.originalPrice && (
                    <span className="original-price">₹{product.originalPrice?.toLocaleString('en-IN')}</span>
                  )}
                </div>

                {product.stock > 0 ? (
                  <span className="stock-status in-stock">In Stock</span>
                ) : (
                  <span className="stock-status out-of-stock">Out of Stock</span>
                )}

                <div className="wishlist-item-actions">
                  <button 
                    className="btn-add-cart"
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                  >
                    <FiShoppingCart /> Add to Cart
                  </button>
                  <button 
                    className="btn-remove"
                    onClick={() => removeFromWishlist(product._id)}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;
