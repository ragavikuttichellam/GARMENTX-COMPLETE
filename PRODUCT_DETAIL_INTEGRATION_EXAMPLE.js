/**
 * ProductDetail.js - Updated with WhatsApp Integration
 * 
 * This file shows how to integrate WhatsApp button and functionality
 * into your existing ProductDetail page.
 * 
 * Changes:
 * 1. Import WhatsApp components and utilities
 * 2. Add meta tag updates in useEffect
 * 3. Add WhatsApp button section after Buy Now
 * 4. Update Open Graph tags for sharing
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiShoppingBag, FiZap, FiStar, FiTruck, FiRefreshCw, FiShield, FiChevronRight } from 'react-icons/fi';
import ReviewSummary from '../components/Reviews/ReviewSummary';
import ReviewForm from '../components/Reviews/ReviewForm';
import ReviewsList from '../components/Reviews/ReviewsList';
import { useCart } from '../context/CartContext';

// ✅ NEW: Import WhatsApp components
import WhatsAppButton from '../components/WhatsApp/WhatsAppButton';

import toast from 'react-hot-toast';
import './Shop.css';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [mainImg, setMainImg] = useState(0);

  useEffect(() => {
    axios.get('/api/products/' + id)
      .then(({ data }) => {
        setProduct(data.product);
        setSelectedSize(data.product.sizes?.[0] || '');
        setSelectedColor(data.product.colors?.[0] || '');

        // ✅ NEW: Update Open Graph meta tags for WhatsApp sharing
        if (data.product) {
          const product = data.product;
          const productUrl = window.location.href;
          const productImage = product.images?.[0] || 'https://via.placeholder.com/1200x630';

          // Update meta tags
          document.title = `${product.name} | GarmentX`;
          
          // Update OG tags for WhatsApp sharing
          updateMetaTag('property', 'og:title', product.name);
          updateMetaTag('property', 'og:description', product.description || `${product.name} - ₹${product.price}`);
          updateMetaTag('property', 'og:image', productImage);
          updateMetaTag('property', 'og:url', productUrl);
          updateMetaTag('name', 'description', product.description || `Shop ${product.name} on GarmentX`);
        }
      })
      .catch(() => toast.error('Product not found'))
      .finally(() => setLoading(false));
  }, [id]);

  // ✅ NEW: Helper function to update meta tags
  const updateMetaTag = (type, attribute, value) => {
    let element;
    if (type === 'property') {
      element = document.querySelector(`meta[property="${attribute}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('property', attribute);
        document.head.appendChild(element);
      }
    } else {
      element = document.querySelector(`meta[name="${attribute}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('name', attribute);
        document.head.appendChild(element);
      }
    }
    element.setAttribute('content', value);
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '80px' }}>
      <div className="spinner"></div>
    </div>
  );

  if (!product) return (
    <div style={{ textAlign: 'center', padding: '120px 24px' }}>
      <h2>Product not found</h2>
      <button onClick={() => navigate('/shop')} style={{ marginTop: '16px', padding: '12px 24px', background: '#C8102E', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer' }}>
        Back to Shop
      </button>
    </div>
  );

  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

  const handleAddToCart = () => {
    if (!selectedSize && product.sizes?.length > 0) return toast.error('Please select a size');
    addToCart(product, selectedSize, selectedColor);
  };

  const handleBuyNow = () => {
    if (!selectedSize && product.sizes?.length > 0) return toast.error('Please select a size');
    addToCart(product, selectedSize, selectedColor);
    navigate('/cart');
  };

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh', background: '#FAFAFA' }}>
      {/* Breadcrumb */}
      <div className="container" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6B7280' }}>
        <span style={{ cursor: 'pointer', color: '#C8102E' }} onClick={() => navigate('/')}>Home</span>
        <FiChevronRight size={14} />
        <span style={{ cursor: 'pointer', color: '#C8102E' }} onClick={() => navigate('/shop')}>Shop</span>
        <FiChevronRight size={14} />
        <span>{product.name}</span>
      </div>

      <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', padding: '0 24px 60px', maxWidth: '1200px' }}>
        {/* Images */}
        <div>
          <div style={{ borderRadius: '20px', overflow: 'hidden', background: '#f8f8f8', aspectRatio: '4/5', marginBottom: '16px' }}>
            <img
              src={product.images?.[mainImg] || 'https://via.placeholder.com/600x750'}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          {product.images?.length > 1 && (
            <div style={{ display: 'flex', gap: '12px' }}>
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setMainImg(i)} style={{
                  width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden',
                  border: mainImg === i ? '3px solid #C8102E' : '2px solid transparent',
                  cursor: 'pointer', padding: 0, background: '#f8f8f8'
                }}>
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p style={{ color: '#6B7280', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>{product.brand}</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '32px', color: '#1A1A2E', marginBottom: '12px', lineHeight: '1.3' }}>{product.name}</h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '2px' }}>
              {[...Array(5)].map((_, i) => (
                <FiStar key={i} size={16}
                  fill={i < Math.floor(product.rating || 0) ? '#FFB800' : 'none'}
                  color={i < Math.floor(product.rating || 0) ? '#FFB800' : '#D1D5DB'}
                />
              ))}
            </div>
            <span style={{ color: '#6B7280', fontSize: '14px' }}>({product.numReviews || 0} reviews)</span>
            {product.stock > 0 ? (
              <span style={{ color: '#10B981', fontWeight: 600, fontSize: '14px' }}>✓ In Stock ({product.stock})</span>
            ) : (
              <span style={{ color: '#EF4444', fontWeight: 600, fontSize: '14px' }}>Out of Stock</span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
            <span style={{ fontSize: '34px', fontWeight: 800, color: '#C8102E' }}>₹{product.price?.toLocaleString('en-IN')}</span>
            {product.originalPrice && (
              <>
                <span style={{ fontSize: '20px', color: '#9CA3AF', textDecoration: 'line-through' }}>₹{product.originalPrice?.toLocaleString('en-IN')}</span>
                <span style={{ background: '#FEF2F2', color: '#C8102E', fontWeight: 700, fontSize: '14px', padding: '4px 10px', borderRadius: '8px' }}>{discount}% OFF</span>
              </>
            )}
          </div>

          {/* Sizes */}
          {product.sizes?.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontWeight: 600, marginBottom: '12px', color: '#374151' }}>Select Size</p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {product.sizes.map(s => (
                  <button key={s} onClick={() => setSelectedSize(s)} style={{
                    padding: '8px 18px',
                    border: selectedSize === s ? '2px solid #C8102E' : '2px solid #E5E7EB',
                    borderRadius: '10px',
                    background: selectedSize === s ? '#FEF2F2' : 'white',
                    color: selectedSize === s ? '#C8102E' : '#374151',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontFamily: "'DM Sans', sans-serif",
                  }}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {/* Colors */}
          {product.colors?.length > 0 && (
            <div style={{ marginBottom: '28px' }}>
              <p style={{ fontWeight: 600, marginBottom: '12px', color: '#374151' }}>Color: <span style={{ color: '#C8102E' }}>{selectedColor}</span></p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {product.colors.map(c => (
                  <button key={c} onClick={() => setSelectedColor(c)} style={{
                    padding: '6px 16px',
                    border: selectedColor === c ? '2px solid #C8102E' : '2px solid #E5E7EB',
                    borderRadius: '8px',
                    background: selectedColor === c ? '#FEF2F2' : 'white',
                    color: selectedColor === c ? '#C8102E' : '#374151',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontFamily: "'DM Sans', sans-serif",
                  }}>{c}</button>
                ))}
              </div>
            </div>
          )}

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: '14px', marginBottom: '32px' }}>
            <button onClick={handleAddToCart} disabled={product.stock === 0} style={{
              flex: 1, padding: '15px', border: '2px solid #C8102E', borderRadius: '14px',
              background: 'white', color: '#C8102E', fontWeight: 700, fontSize: '16px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              fontFamily: "'DM Sans', sans-serif",
            }}>
              <FiShoppingBag size={18} /> Add to Cart
            </button>
            <button onClick={handleBuyNow} disabled={product.stock === 0} style={{
              flex: 1, padding: '15px', border: 'none', borderRadius: '14px',
              background: 'linear-gradient(135deg, #C8102E, #E31837)', color: 'white',
              fontWeight: 700, fontSize: '16px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              fontFamily: "'DM Sans', sans-serif",
            }}>
              <FiZap size={18} /> Buy Now
            </button>
          </div>

          {/* ✅ NEW: WhatsApp Order Section */}
          <div style={{
            padding: '20px',
            background: '#f0fdf4',
            borderRadius: '14px',
            border: '1px solid #86efac',
            marginBottom: '28px'
          }}>
            <p style={{
              fontSize: '14px',
              color: '#374151',
              margin: '0 0 14px 0',
              fontWeight: 500
            }}>
              💬 Order directly on WhatsApp for instant support and real-time updates
            </p>
            <WhatsAppButton
              product={product}
              quantity={1}
              buttonText="Order on WhatsApp"
              variant="gradient"
              size="large"
              fullWidth={true}
              onBeforeClick={() => console.log('Opening WhatsApp for', product.name)}
            />
          </div>

          {/* Features */}
          <div style={{ background: '#F9FAFB', borderRadius: '16px', padding: '20px' }}>
            {[
              { icon: <FiTruck size={16} />, text: 'Free delivery on orders above ₹999' },
              { icon: <FiRefreshCw size={16} />, text: '30-day easy returns' },
              { icon: <FiShield size={16} />, text: '100% Secure Payment via Razorpay' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: i < 2 ? '12px' : 0, color: '#374151', fontSize: '14px' }}>
                {item.icon}
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="container" style={{ padding: '0 24px 60px', maxWidth: '1200px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '40px' }}>
          <ReviewSummary product={product} />
          <div>
            <ReviewForm productId={product._id} />
            <ReviewsList productId={product._id} />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * INTEGRATION INSTRUCTIONS:
 * 
 * 1. The WhatsAppButton component is imported at the top
 * 2. Meta tags are automatically updated in the useEffect hook
 * 3. WhatsApp section is added with professional styling
 * 4. Message includes product details (name, price, link)
 * 5. Opens WhatsApp Web with pre-filled message on click
 * 
 * To customize:
 * - Change button text: buttonText="Your Text"
 * - Change button variant: variant="primary|outline|ghost"
 * - Change button size: size="small|medium|large"
 * - Add callbacks: onBeforeClick={() => {}} or onAfterClick={() => {}}
 * 
 * The product object is automatically used for:
 * - Product name
 * - Product price
 * - Product description
 * - Product images
 * - Product URL
 * 
 * Open Graph tags help when customers share on WhatsApp with:
 * - Product image preview
 * - Product name as title
 * - Product description
 * - Product URL as link
 */
