import React, { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight, FiArrowRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import './HeroBanner.css';

/**
 * Hero Banner Slider Component
 * Displays rotating banners with featured offers and CTAs
 */
const HeroBanner = () => {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  const banners = [
    {
      id: 1,
      title: "New Summer Collection",
      subtitle: "Discover elegant designs for the season",
      cta: "Shop Now",
      badge: "🌞 New Arrivals",
      bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    {
      id: 2,
      title: "50% Off Clearance",
      subtitle: "Limited time offer on selected items",
      cta: "Shop Sale",
      badge: "🔥 Limited Time",
      bg: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
    },
    {
      id: 3,
      title: "Exclusive Collection",
      subtitle: "Premium fabrics, luxurious designs",
      cta: "View Collection",
      badge: "👑 Premium",
      bg: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index) => {
    setCurrent(index);
  };

  const goToPrev = () => {
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrent((prev) => (prev + 1) % banners.length);
  };

  const localVideo = '/videos/Garment_shop.mp4';

  return (
    <div className="hero-banner-container">
      <div className="hero-slider-wrapper">
        {banners.map((banner, index) => (
          <div key={banner.id} className={`hero-slide ${index === current ? 'active' : ''}`} style={{ background: banner.bg }}>
            {/* Use local hero video for first slide if available; fall back to gradient */}
            {index === 0 ? (
              <video className="hero-slide-video" src={localVideo} autoPlay muted loop playsInline preload="metadata" />
            ) : (
              <div className="hero-slide-overlay" />
            )}
            <div className="hero-slide-content">
              <span className="hero-slide-badge">{banner.badge}</span>
              <h1 className="hero-slide-title">{banner.title}</h1>
              <p className="hero-slide-subtitle">{banner.subtitle}</p>
              <button className="hero-slide-cta" onClick={() => navigate('/shop')}>
                {banner.cta} <FiArrowRight />
              </button>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        <button className="hero-nav-arrow hero-nav-prev" onClick={goToPrev}>
          <FiChevronLeft size={24} />
        </button>
        <button className="hero-nav-arrow hero-nav-next" onClick={goToNext}>
          <FiChevronRight size={24} />
        </button>

        {/* Indicators */}
        <div className="hero-indicators">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`hero-indicator ${index === current ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
