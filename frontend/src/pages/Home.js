import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { FiArrowRight, FiTruck, FiRefreshCw, FiShield, FiStar } from 'react-icons/fi';
import ProductCard from '../components/ProductCard/ProductCard';
import './Home.css';

const collections = [
  { id: 'men', label: "Men's Collection", sub: 'From Casual to Formal', path: '/men', emoji: '👔', bg: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 100%)', img: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80' },
  { id: 'women', label: "Women's Collection", sub: 'Elegance Redefined', path: '/women', emoji: '👗', bg: 'linear-gradient(135deg, #C8102E 0%, #FF6B9D 100%)', img: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80' },
  { id: 'kids', label: "Kids' Collection", sub: 'Fun & Comfortable', path: '/kids', emoji: '🧒', bg: 'linear-gradient(135deg, #FFB800 0%, #FF8C00 100%)', img: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=600&q=80' },
];

const features = [
  { icon: <FiTruck />, title: 'Free Delivery', desc: 'On orders above ₹999' },
  { icon: <FiRefreshCw />, title: 'Easy Returns', desc: '30-day hassle-free returns' },
  { icon: <FiShield />, title: 'Secure Payment', desc: '100% safe & encrypted' },
  { icon: <FiStar />, title: 'Best Quality', desc: 'Premium fabrics only' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [featRes, newRes] = await Promise.all([
          api.get('/products', { params: { featured: true, limit: 4 } }),
          api.get('/products', { params: { newArrival: true, limit: 4 } })
        ]);
        setFeatured(featRes.data.products || []);
        setNewArrivals(newRes.data.products || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-shape hero-shape-1"></div>
          <div className="hero-shape hero-shape-2"></div>
          <div className="hero-shape hero-shape-3"></div>
        </div>
        <div className="container hero-content">
          <div className="hero-text" style={{ animation: 'slideInLeft 0.8s ease forwards' }}>
            <span className="hero-tag">✨ New Season 2025</span>
            <h1 className="hero-title">
              Upgrade Your Style<br />
              with <span className="hero-brand">Manisara World</span>
            </h1>
            <p className="hero-subtitle">
              Discover premium fashion for men, women & kids. Curated collections that define your identity.
            </p>
            <div className="hero-cta">
              <button className="btn-primary hero-btn" onClick={() => navigate('/shop')}>
                Shop Now <FiArrowRight />
              </button>
              <button className="hero-btn-secondary" onClick={() => navigate('/new-arrivals')}>
                New Arrivals
              </button>
            </div>
            <div className="hero-stats">
              <div className="stat"><strong>50K+</strong><span>Happy Customers</span></div>
              <div className="stat-divider"></div>
              <div className="stat"><strong>2000+</strong><span>Products</span></div>
              <div className="stat-divider"></div>
              <div className="stat"><strong>4.8★</strong><span>Avg Rating</span></div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-img-wrapper">
              <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80" alt="Fashion" className="hero-img" />
              <div className="hero-badge hero-badge-1">🔥 50% Off Today</div>
              <div className="hero-badge hero-badge-2">🚚 Free Delivery</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Strip */}
      <section className="features-strip">
        <div className="container">
          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className="feature-item" style={{ animationDelay: i * 0.1 + 's' }}>
                <div className="feature-icon">{f.icon}</div>
                <div>
                  <strong>{f.title}</strong>
                  <p>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Collections */}
      <section className="collections-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Shop by Collection</h2>
            <p className="section-subtitle">Explore our curated collections for every occasion</p>
          </div>
          <div className="collections-grid">
            {collections.map((col, i) => (
              <Link to={col.path} key={col.id} className="collection-card" style={{ animationDelay: i * 0.15 + 's' }}>
                <div className="collection-img-wrap">
                  <img src={col.img} alt={col.label} className="collection-img" loading="lazy" />
                  <div className="collection-overlay" style={{ background: col.bg + '99' }}></div>
                </div>
                <div className="collection-info">
                  <span className="collection-emoji">{col.emoji}</span>
                  <h3>{col.label}</h3>
                  <p>{col.sub}</p>
                  <span className="collection-cta">Explore Now <FiArrowRight /></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="products-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Best Sellers</h2>
            <Link to="/shop?featured=true" className="see-all">See All <FiArrowRight /></Link>
          </div>
          {loading ? (
            <div className="products-grid">
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton product-skeleton"></div>)}
            </div>
          ) : (
            <div className="products-grid">
              {featured.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* Promo Banner */}
      <section className="promo-banner">
        <div className="container">
          <div className="promo-content">
            <div>
              <span className="promo-tag">Limited Time Offer</span>
              <h2>Up to 50% OFF on New Arrivals</h2>
              <p>Don't miss out on the biggest fashion sale of the season</p>
              <button className="btn-primary" onClick={() => navigate('/offers')}>Grab the Deal <FiArrowRight /></button>
            </div>
            <div className="promo-img">
              <img src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=500&q=80" alt="Promo" />
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="products-section bg-light-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">New Arrivals</h2>
            <Link to="/new-arrivals" className="see-all">See All <FiArrowRight /></Link>
          </div>
          {loading ? (
            <div className="products-grid">
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton product-skeleton"></div>)}
            </div>
          ) : (
            <div className="products-grid">
              {newArrivals.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="newsletter">
        <div className="container">
          <div className="newsletter-content">
            <h2>Stay in Style 💌</h2>
            <p>Subscribe to get the latest fashion updates, exclusive offers & more</p>
            <form className="newsletter-form" onSubmit={e => { e.preventDefault(); }}>
              <input type="email" placeholder="Enter your email address" required />
              <button type="submit" className="btn-primary">Subscribe</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
