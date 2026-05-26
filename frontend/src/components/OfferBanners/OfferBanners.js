import React from 'react';
import { FiArrowRight, FiTruck, FiGift } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import './OfferBanners.css';

/**
 * Offer Banners Component
 * Displays special offers and promotional banners
 */
const OfferBanners = () => {
  const navigate = useNavigate();

  const offers = [
    {
      id: 1,
      title: "First Time Buyer",
      subtitle: "Get 20% OFF on your first order",
      code: "FIRST20",
      icon: <FiGift size={40} />,
      color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      action: () => navigate('/shop')
    },
    {
      id: 2,
      title: "Free Delivery",
      subtitle: "On orders above ₹999",
      code: "FREEDEL999",
      icon: <FiTruck size={40} />,
      color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      action: () => navigate('/shop')
    },
    {
      id: 3,
      title: "Flash Sale",
      subtitle: "50% OFF on selected items",
      code: "FLASH50",
      icon: <FiArrowRight size={40} />,
      color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      action: () => navigate('/offers')
    },
  ];

  return (
    <div className="offer-banners-container">
      <div className="container">
        <div className="banners-grid">
          {offers.map((offer, index) => (
            <div
              key={offer.id}
              className="offer-banner"
              style={{ background: offer.color, animationDelay: `${index * 0.1}s` }}
            >
              <div className="banner-icon">{offer.icon}</div>
              <div className="banner-content">
                <h3>{offer.title}</h3>
                <p>{offer.subtitle}</p>
                <div className="banner-code">
                  <span>Code: <strong>{offer.code}</strong></span>
                </div>
              </div>
              <button className="banner-cta" onClick={offer.action}>
                Claim <FiArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OfferBanners;
