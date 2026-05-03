import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productAPI } from '../utils/api';
import ProductCard from '../components/ProductCard';
import './HomePage.css';

/* ─── Hero Section ───────────────────────────────────────────────────────────── */
const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-bg">
        <img
          src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1600&auto=format&fit=crop"
          alt="Fashion Banner"
          className="hero-img"
        />
        <div className="hero-overlay" />
      </div>

      <div className="hero-content container">
        <div className="hero-text fade-up">
          <span className="hero-eyebrow">New Collection 2025</span>
          <h1 className="hero-heading">
            Upgrade Your Style<br />
            <em>with GarmentX</em>
          </h1>
          <p className="hero-subtext">
            Curated fashion for Men, Women & Kids. Premium quality,
            unbeatable prices, delivered to your doorstep.
          </p>
          <div className="hero-ctas">
            <Link to="/shop" className="btn btn-primary btn-lg">
              Shop Now →
            </Link>
            <Link to="/shop?isNewArrival=true" className="btn btn-outline btn-lg hero-outline-btn">
              New Arrivals
            </Link>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <strong>50K+</strong><span>Happy Customers</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <strong>2K+</strong><span>Products</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <strong>4.8★</strong><span>Avg Rating</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="scroll-indicator">
        <div className="scroll-dot" />
      </div>
    </section>
  );
};

/* ─── Announcement Bar ───────────────────────────────────────────────────────── */
const AnnouncementBar = () => (
  <div className="announcement-bar">
    <div className="announcement-track">
      {[
        '🎉 Free delivery on orders above ₹999',
        '⚡ Use code FIRST10 for 10% off your first order',
        '🔄 Easy 30-day returns',
        '💎 Premium quality guaranteed',
        '🚚 Express delivery in 2–4 business days'
      ].map((msg, i) => (
        <span key={i} className="announcement-item">{msg}</span>
      ))}
    </div>
  </div>
);

/* ─── Collections ─────────────────────────────────────────────────────────────── */
const Collections = () => {
  const navigate = useNavigate();

  const categories = [
    {
      id: 'men',
      label: "Men's Collection",
      desc: 'Sharp, modern & timeless',
      color: '#1a1a2e',
      image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop',
    },
    {
      id: 'women',
      label: "Women's Collection",
      desc: 'Elegant, bold & expressive',
      color: '#C8102E',
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop',
    },
    {
      id: 'kids',
      label: "Kids' Collection",
      desc: 'Fun, comfy & vibrant',
      color: '#D4A843',
      image: 'https://images.unsplash.com/photo-1519278409-1f56ab241a43?w=600&auto=format&fit=crop',
    }
  ];

  return (
    <section className="collections section-gap">
      <div className="container">
        <div className="section-header">
          <h2>Shop by Collection</h2>
          <p>Find your perfect style across our curated collections</p>
          <div className="underline" />
        </div>
        <div className="collections-grid">
          {categories.map((cat, i) => (
            <div
              key={cat.id}
              className="collection-card"
              style={{ '--cat-color': cat.color, animationDelay: `${i * 0.12}s` }}
              onClick={() => navigate(`/shop/${cat.id}`)}
              role="button" tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && navigate(`/shop/${cat.id}`)}
            >
              <div className="collection-img-wrap">
                <img src={cat.image} alt={cat.label} loading="lazy" />
                <div className="collection-overlay" />
              </div>
              <div className="collection-info">
                <h3>{cat.label}</h3>
                <p>{cat.desc}</p>
                <span className="collection-cta">Explore →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─── Offer Banner ────────────────────────────────────────────────────────────── */
const OfferBanner = () => (
  <section className="offer-banner">
    <div className="container offer-inner">
      <div className="offer-text">
        <span className="offer-eyebrow">Limited Time Offer</span>
        <h2>Up to <span className="offer-highlight">50% OFF</span><br />on New Arrivals</h2>
        <p>Grab the season's best deals before they're gone</p>
        <Link to="/shop?isOnOffer=true" className="btn btn-primary btn-lg">
          Shop Offers
        </Link>
      </div>
      <div className="offer-image">
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=700&auto=format&fit=crop"
          alt="Offer"
        />
      </div>
    </div>
  </section>
);

/* ─── Featured Products ──────────────────────────────────────────────────────── */
const FeaturedProducts = ({ products, loading }) => (
  <section className="featured section-gap">
    <div className="container">
      <div className="section-header">
        <h2>Best Sellers</h2>
        <p>Our most loved pieces, picked by thousands of happy shoppers</p>
        <div className="underline" />
      </div>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /></div>
      ) : (
        <div className="products-grid">
          {products.map(p => <ProductCard key={p._id} product={p} />)}
        </div>
      )}

      <div className="view-all">
        <Link to="/shop" className="btn btn-outline btn-lg">View All Products →</Link>
      </div>
    </div>
  </section>
);

/* ─── Why Choose Us ──────────────────────────────────────────────────────────── */
const WhyUs = () => {
  const features = [
    { icon: '🚚', title: 'Free Delivery',     desc: 'On all orders above ₹999' },
    { icon: '↩️', title: 'Easy Returns',       desc: '30-day hassle-free returns' },
    { icon: '🔒', title: 'Secure Payments',   desc: 'Razorpay powered, 100% safe' },
    { icon: '💎', title: 'Premium Quality',   desc: 'Ethically sourced materials' },
    { icon: '📱', title: '24/7 Support',      desc: 'Always here to help you' },
    { icon: '🎁', title: 'Gift Wrapping',     desc: 'Make your gifting special' },
  ];

  return (
    <section className="why-us section-gap">
      <div className="container">
        <div className="section-header">
          <h2>Why Choose GarmentX?</h2>
          <div className="underline" />
        </div>
        <div className="features-grid">
          {features.map((f, i) => (
            <div key={i} className="feature-card" style={{ animationDelay: `${i * 0.08}s` }}>
              <span className="feature-icon">{f.icon}</span>
              <h4>{f.title}</h4>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ─── HomePage ────────────────────────────────────────────────────────────────── */
const HomePage = () => {
  const [featured, setFeatured] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    document.title = 'GarmentX — Upgrade Your Style';
    productAPI.getFeatured()
      .then(({ data }) => setFeatured(data.products))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <AnnouncementBar />
      <Hero />
      <Collections />
      <FeaturedProducts products={featured} loading={loading} />
      <OfferBanner />
      <WhyUs />
    </>
  );
};

export default HomePage;
