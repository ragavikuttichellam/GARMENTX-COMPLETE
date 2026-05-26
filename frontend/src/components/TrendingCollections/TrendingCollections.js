import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
import './TrendingCollections.css';

/**
 * Trending Collections Component
 * Displays category-based product collections
 */
const TrendingCollections = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  const collections = [
    {
      id: 1,
      name: "Summer Sarees",
      category: "saree",
      image: "https://images.unsplash.com/photo-1593032484735-7a2f77a48ab7?w=400&q=80",
      itemCount: 245,
      discount: "Up to 40% OFF",
      trending: true,
      color: "linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)"
    },
    {
      id: 2,
      name: "Designer Suits",
      category: "suit",
      image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&q=80",
      itemCount: 180,
      discount: "Up to 35% OFF",
      trending: true,
      color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    {
      id: 3,
      name: "Casual Wear",
      category: "casual",
      image: "https://images.unsplash.com/photo-1567516866141-e8ddc2161bab?w=400&q=80",
      itemCount: 320,
      discount: "Up to 50% OFF",
      trending: false,
      color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
    },
    {
      id: 4,
      name: "Evening Gowns",
      category: "gown",
      image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&q=80",
      itemCount: 95,
      discount: "Up to 30% OFF",
      trending: true,
      color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
    },
    {
      id: 5,
      name: "Kids Fashion",
      category: "kids",
      image: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=400&q=80",
      itemCount: 210,
      discount: "Up to 45% OFF",
      trending: false,
      color: "linear-gradient(135deg, #FFB800 0%, #FF8C00 100%)"
    },
    {
      id: 6,
      name: "Ethnic Wear",
      category: "ethnic",
      image: "https://images.unsplash.com/photo-1578886662996-a90183d11b02?w=400&q=80",
      itemCount: 155,
      discount: "Up to 25% OFF",
      trending: true,
      color: "linear-gradient(135deg, #74ebd5 0%, #acb6e5 100%)"
    },
  ];

  const filteredCollections = activeFilter === 'trending'
    ? collections.filter(c => c.trending)
    : activeFilter === 'all'
    ? collections
    : collections.filter(c => c.category === activeFilter);

  return (
    <section className="trending-section">
      <div className="container">
        <div className="trending-header">
          <h2>Trending Collections</h2>
          <p>Explore what's hot right now</p>
        </div>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All Collections
          </button>
          <button
            className={`filter-btn ${activeFilter === 'trending' ? 'active' : ''}`}
            onClick={() => setActiveFilter('trending')}
          >
            🔥 Trending
          </button>
        </div>

        <div className="collections-grid">
          {filteredCollections.map((collection, index) => (
            <Link
              key={collection.id}
              to={`/shop?category=${collection.category}`}
              className="collection-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="collection-image-wrapper">
                <img src={collection.image} alt={collection.name} className="collection-image" />
                {collection.trending && (
                  <span className="trending-badge">🔥 Trending</span>
                )}
                <div className="collection-overlay" style={{ background: collection.color }}>
                  <div className="collection-content">
                    <h3>{collection.name}</h3>
                    <div className="collection-stats">
                      <span>{collection.itemCount} Items</span>
                      <span className="discount">{collection.discount}</span>
                    </div>
                    <button className="collection-cta">
                      Shop Now <FiArrowRight />
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingCollections;
