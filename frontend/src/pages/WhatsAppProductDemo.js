import React from 'react';
import { FiTrendingUp, FiCheck } from 'react-icons/fi';
import WhatsAppButton from '../../components/WhatsApp/WhatsAppButton';
import './WhatsAppProductDemo.css';

/**
 * Example Product Page with WhatsApp Integration
 * Demonstrates various WhatsApp button variants and use cases
 * 
 * This component shows:
 * - Complete product information display
 * - Multiple WhatsApp button variants
 * - Product features and benefits
 * - Responsive design
 * - Stock status
 * - Price display with discount
 */
const WhatsAppProductDemo = () => {
  // Sample product data
  const product = {
    id: 1,
    name: "Premium Cotton T-Shirt",
    price: 499,
    originalPrice: 899,
    stock: 25,
    rating: 4.5,
    reviews: 128,
    brand: "GarmentX Premium",
    description: "Ultra-soft premium cotton t-shirt with perfect fit. Available in multiple sizes and colors.",
    features: [
      "100% Organic Cotton",
      "Breathable & Comfortable",
      "Easy to care",
      "Perfect for everyday wear"
    ],
    images: ["https://via.placeholder.com/600x750"],
    colors: ["Black", "White", "Navy", "Gray"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
  };

  const discount = Math.round((1 - product.price / product.originalPrice) * 100);

  return (
    <div className="whatsapp-product-demo">
      <div className="whatsapp-product-demo__container">
        {/* Header */}
        <div className="whatsapp-product-demo__header">
          <h1>WhatsApp Product Integration Demo</h1>
          <p>Professional product ordering directly through WhatsApp</p>
        </div>

        {/* Product Section */}
        <section className="whatsapp-product-demo__section">
          <div className="whatsapp-product-demo__grid">
            {/* Left: Product Image */}
            <div className="whatsapp-product-demo__image-container">
              <div className="whatsapp-product-demo__image">
                <img
                  src={product.images[0]}
                  alt={product.name}
                />
              </div>
              {/* Discount Badge */}
              {discount > 0 && (
                <div className="whatsapp-product-demo__badge">
                  <span className="whatsapp-product-demo__badge-text">
                    {discount}% OFF
                  </span>
                </div>
              )}
              {/* Stock Status */}
              <div className={`whatsapp-product-demo__stock-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                {product.stock > 0 ? `✓ In Stock (${product.stock})` : 'Out of Stock'}
              </div>
            </div>

            {/* Right: Product Details */}
            <div className="whatsapp-product-demo__details">
              {/* Brand */}
              <p className="whatsapp-product-demo__brand">{product.brand}</p>

              {/* Title */}
              <h2 className="whatsapp-product-demo__title">{product.name}</h2>

              {/* Rating */}
              <div className="whatsapp-product-demo__rating">
                <div className="whatsapp-product-demo__stars">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < Math.floor(product.rating) ? 'filled' : ''}>
                      ★
                    </span>
                  ))}
                </div>
                <span className="whatsapp-product-demo__reviews">
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="whatsapp-product-demo__price">
                <span className="whatsapp-product-demo__current-price">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.originalPrice && (
                  <span className="whatsapp-product-demo__original-price">
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="whatsapp-product-demo__description">
                {product.description}
              </p>

              {/* Features */}
              <div className="whatsapp-product-demo__features">
                {product.features.map((feature, index) => (
                  <div key={index} className="whatsapp-product-demo__feature">
                    <FiCheck size={18} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              {/* Button Variants Section */}
              <div className="whatsapp-product-demo__buttons-section">
                <h3 className="whatsapp-product-demo__section-title">Order Options</h3>

                {/* Gradient Button (Recommended) */}
                <div className="whatsapp-product-demo__button-group">
                  <label className="whatsapp-product-demo__button-label">
                    Primary Gradient Button (Recommended)
                  </label>
                  <WhatsAppButton
                    product={product}
                    quantity={1}
                    buttonText="Order on WhatsApp"
                    variant="gradient"
                    size="large"
                    fullWidth={true}
                    onBeforeClick={() => console.log('Opening WhatsApp...')}
                  />
                </div>

                {/* Standard Primary */}
                <div className="whatsapp-product-demo__button-group">
                  <label className="whatsapp-product-demo__button-label">
                    Standard Primary Button
                  </label>
                  <WhatsAppButton
                    product={product}
                    quantity={1}
                    buttonText="Chat on WhatsApp"
                    variant="primary"
                    size="medium"
                    fullWidth={true}
                  />
                </div>

                {/* Outline Button */}
                <div className="whatsapp-product-demo__button-group">
                  <label className="whatsapp-product-demo__button-label">
                    Outline Button
                  </label>
                  <WhatsAppButton
                    product={product}
                    quantity={1}
                    buttonText="Order via WhatsApp"
                    variant="outline"
                    size="medium"
                    fullWidth={true}
                  />
                </div>

                {/* Ghost Button */}
                <div className="whatsapp-product-demo__button-group">
                  <label className="whatsapp-product-demo__button-label">
                    Ghost Button
                  </label>
                  <WhatsAppButton
                    product={product}
                    quantity={1}
                    buttonText="Inquire on WhatsApp"
                    variant="ghost"
                    size="medium"
                    fullWidth={true}
                  />
                </div>

                {/* Small Button */}
                <div className="whatsapp-product-demo__button-group">
                  <label className="whatsapp-product-demo__button-label">
                    Small Button
                  </label>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <WhatsAppButton
                      product={product}
                      quantity={1}
                      buttonText="Order"
                      variant="gradient"
                      size="small"
                    />
                    <WhatsAppButton
                      product={product}
                      quantity={1}
                      buttonText="Chat"
                      variant="primary"
                      size="small"
                    />
                    <WhatsAppButton
                      product={product}
                      quantity={1}
                      buttonText="Inquire"
                      variant="outline"
                      size="small"
                    />
                  </div>
                </div>

                {/* Without Icon */}
                <div className="whatsapp-product-demo__button-group">
                  <label className="whatsapp-product-demo__button-label">
                    Button Without Icon
                  </label>
                  <WhatsAppButton
                    product={product}
                    quantity={1}
                    buttonText="Start WhatsApp Chat"
                    variant="gradient"
                    size="medium"
                    fullWidth={true}
                    showIcon={false}
                  />
                </div>
              </div>

              {/* Additional Info */}
              <div className="whatsapp-product-demo__info-box">
                <div className="whatsapp-product-demo__info-item">
                  <span className="whatsapp-product-demo__info-icon">🚚</span>
                  <span>Free delivery on orders above ₹999</span>
                </div>
                <div className="whatsapp-product-demo__info-item">
                  <span className="whatsapp-product-demo__info-icon">💳</span>
                  <span>COD Available - Pay after delivery</span>
                </div>
                <div className="whatsapp-product-demo__info-item">
                  <span className="whatsapp-product-demo__info-icon">↩️</span>
                  <span>30-day easy returns</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="whatsapp-product-demo__section">
          <h3 className="whatsapp-product-demo__section-title">Integration Benefits</h3>
          <div className="whatsapp-product-demo__benefits">
            <div className="whatsapp-product-demo__benefit-card">
              <div className="whatsapp-product-demo__benefit-icon">📱</div>
              <h4>Direct WhatsApp Integration</h4>
              <p>Seamless product ordering directly through WhatsApp messaging</p>
            </div>
            <div className="whatsapp-product-demo__benefit-card">
              <div className="whatsapp-product-demo__benefit-icon">📋</div>
              <h4>Auto-Filled Messages</h4>
              <p>Product details automatically populated in WhatsApp message</p>
            </div>
            <div className="whatsapp-product-demo__benefit-card">
              <div className="whatsapp-product-demo__benefit-icon">🎨</div>
              <h4>Multiple Button Styles</h4>
              <p>Choose from gradient, primary, outline, and ghost button variants</p>
            </div>
            <div className="whatsapp-product-demo__benefit-card">
              <div className="whatsapp-product-demo__benefit-icon">📊</div>
              <h4>Business Analytics Ready</h4>
              <p>Track customer inquiries through WhatsApp Business API</p>
            </div>
            <div className="whatsapp-product-demo__benefit-card">
              <div className="whatsapp-product-demo__benefit-icon">🔒</div>
              <h4>Secure & Reliable</h4>
              <p>Uses official WhatsApp API for trusted communication</p>
            </div>
            <div className="whatsapp-product-demo__benefit-card">
              <div className="whatsapp-product-demo__benefit-icon">📱</div>
              <h4>Mobile Optimized</h4>
              <p>Fully responsive design for all devices and screen sizes</p>
            </div>
          </div>
        </section>

        {/* Implementation Guide */}
        <section className="whatsapp-product-demo__section">
          <h3 className="whatsapp-product-demo__section-title">Quick Implementation Guide</h3>
          <div className="whatsapp-product-demo__code-block">
            <pre>{`// Import WhatsApp Button Component
import WhatsAppButton from './components/WhatsApp/WhatsAppButton';

// Use in your product page
<WhatsAppButton
  product={product}
  quantity={1}
  buttonText="Order on WhatsApp"
  variant="gradient"
  size="large"
  fullWidth={true}
/>

// Add floating widget to your App
import FloatingWhatsApp from './components/WhatsApp/FloatingWhatsApp';

<FloatingWhatsApp />`}</pre>
          </div>
        </section>
      </div>
    </div>
  );
};

export default WhatsAppProductDemo;
