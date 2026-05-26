import React, { useState } from 'react';
import { FiInstagram, FiExternalLink } from 'react-icons/fi';
import './InstagramFeed.css';

/**
 * Instagram Feed Component
 * Displays Instagram gallery with follow button and social links
 */
const InstagramFeed = () => {
  const [isFollowing, setIsFollowing] = useState(false);

  const instagramPosts = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=300&q=80",
      caption: "New Summer Collection 2025 ☀️",
      likes: 1250,
      url: "https://instagram.com/garmentx"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1595521624651-2faa8cdf8472?w=300&q=80",
      caption: "Premium Quality Fabrics 👗",
      likes: 980,
      url: "https://instagram.com/garmentx"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1470825653336-96b3f0f0f0b2?w=300&q=80",
      caption: "Fashion Forward Designs 💫",
      likes: 1540,
      url: "https://instagram.com/garmentx"
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300&q=80",
      caption: "Customer Favorites 🌟",
      likes: 890,
      url: "https://instagram.com/garmentx"
    },
    {
      id: 5,
      image: "https://images.unsplash.com/photo-1576995853950-3135dd27f172?w=300&q=80",
      caption: "Trendy & Comfortable 🔥",
      likes: 1120,
      url: "https://instagram.com/garmentx"
    },
    {
      id: 6,
      image: "https://images.unsplash.com/photo-1552062407-291c33ba5c77?w=300&q=80",
      caption: "Perfect for Every Occasion ✨",
      likes: 1650,
      url: "https://instagram.com/garmentx"
    },
  ];

  const handleFollowClick = () => {
    setIsFollowing(!isFollowing);
    window.open('https://instagram.com/garmentx', '_blank');
  };

  return (
    <section className="instagram-section">
      <div className="container">
        <div className="instagram-header">
          <div className="instagram-header-content">
            <FiInstagram size={32} className="instagram-icon" />
            <h2>Follow Us on Instagram</h2>
            <p>Get inspired by our latest collections and customer stories</p>
          </div>
          <button 
            className={`follow-btn ${isFollowing ? 'following' : ''}`}
            onClick={handleFollowClick}
          >
            <FiInstagram size={18} />
            {isFollowing ? 'Following' : 'Follow'} @garmentx
          </button>
        </div>

        <div className="instagram-feed">
          {instagramPosts.map((post) => (
            <a 
              key={post.id}
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="instagram-post"
            >
              <img src={post.image} alt={post.caption} className="post-image" />
              <div className="post-overlay">
                <div className="post-stats">
                  <span>❤️ {post.likes}</span>
                </div>
                <p className="post-caption">{post.caption}</p>
                <div className="post-cta">
                  View on Instagram <FiExternalLink size={16} />
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="instagram-footer">
          <a href="https://instagram.com/garmentx" target="_blank" rel="noopener noreferrer" className="view-all-btn">
            View All Posts on Instagram
          </a>
        </div>
      </div>
    </section>
  );
};

export default InstagramFeed;
