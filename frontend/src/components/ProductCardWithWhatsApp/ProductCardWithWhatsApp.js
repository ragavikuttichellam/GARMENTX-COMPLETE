import React, { useState } from 'react';
import { FiStar, FiHeart, FiShare2 } from 'react-icons/fi';
import WhatsAppButton from '../WhatsApp/WhatsAppButton';
import './ProductCardWithWhatsApp.css';

/**
 * Product Card Component with WhatsApp Integration
 * Displays product with image, price, rating, and WhatsApp button
 * 
 * @param {Object} props - Component props
 * @param {Object} props.product - Product data
 * @param {function} props.onViewDetails - Callback to view product details
 * @param {boolean} props.showWhatsAppButton - Show WhatsApp button (default: true)
 */
const ProductCardWithWhatsApp = ({
  product,
  onViewDetails,
  showWhatsAppButton = true,
  onAddToCart,
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageError, setImageError] = useState(false);

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const handleFavorite = (e) => {
    e.preventDefault();
    setIsFavorite(!isFavorite);
  };

  return (
    <div className="product-card-whatsapp">
      {/* Image Section */}
      <div className="product-card-whatsapp__image-wrapper">
        <div className="product-card-whatsapp__image">
          {!imageError ? (
            <img
              src={product.images?.[0] || 'https://via.placeholder.com/280x350'}
              alt={product.name}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="product-card-whatsapp__image-placeholder">
              <p>Image not available</p>
            </div>
          )}
        </div>

        {/* Stock Badge */}
        {product.stock !== undefined && (
          <div
            className={`product-card-whatsapp__stock-badge ${
              product.stock > 0 ? 'in-stock' : 'out-of-stock'
            }`}
          >
            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
          </div>
        )}

        {/* Discount Badge */}
        {discount > 0 && (
          <div className="product-card-whatsapp__discount-badge">
            {discount}% OFF
          </div>
        )}

        {/* Action Buttons */}
        <div className="product-card-whatsapp__actions">
          <button
            className={`product-card-whatsapp__favorite ${isFavorite ? 'active' : ''}`}
            onClick={handleFavorite}
            title="Add to favorites"
          >
            <FiHeart size={18} fill={isFavorite ? '#ef4444' : 'none'} />
          </button>
          <button
            className="product-card-whatsapp__share"
            title="Share product"
            onClick={(e) => {
              e.preventDefault();
              // Can implement share functionality
            }}
          >
            <FiShare2 size={18} />
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="product-card-whatsapp__content">
        {/* Brand */}
        {product.brand && (
          <p className="product-card-whatsapp__brand">{product.brand}</p>
        )}

        {/* Product Name */}
        <h3 className="product-card-whatsapp__name" title={product.name}>
          {product.name}
        </h3>

        {/* Rating */}
        {product.rating !== undefined && (
          <div className="product-card-whatsapp__rating">
            <div className="product-card-whatsapp__stars">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={i < Math.floor(product.rating) ? 'filled' : ''}
                >
                  ★
                </span>
              ))}
            </div>
            {product.numReviews && (
              <span className="product-card-whatsapp__reviews">
                ({product.numReviews})
              </span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="product-card-whatsapp__price">
          <span className="product-card-whatsapp__current-price">
            ₹{product.price?.toLocaleString('en-IN')}
          </span>
          {product.originalPrice && (
            <span className="product-card-whatsapp__original-price">
              ₹{product.originalPrice?.toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {/* Buttons */}
        <div className="product-card-whatsapp__buttons">
          {/* View Details Button */}
          <button
            className="product-card-whatsapp__btn product-card-whatsapp__btn--secondary"
            onClick={() => onViewDetails && onViewDetails(product.id)}
          >
            View Details
          </button>

          {/* WhatsApp Button */}
          {showWhatsAppButton && (
            <WhatsAppButton
              product={product}
              quantity={1}
              buttonText="WhatsApp"
              variant="gradient"
              size="small"
              showIcon={true}
              style={{ flex: 1 }}
            />
          )}
        </div>

        {/* Delivery Info */}
        <div className="product-card-whatsapp__delivery-info">
          <span className="product-card-whatsapp__delivery-icon">🚚</span>
          <span className="product-card-whatsapp__delivery-text">
            Free delivery above ₹999
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCardWithWhatsApp;
