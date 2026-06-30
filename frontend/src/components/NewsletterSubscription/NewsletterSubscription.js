import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { FiMail, FiCheck } from 'react-icons/fi';
import './NewsletterSubscription.css';

/**
 * Newsletter Subscription Component
 * Collects email addresses for marketing newsletters
 */
const NewsletterSubscription = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSubscribed(true);
        setEmail('');
        toast.success('Thanks for subscribing! Check your email for exclusive offers.');
        
        // Reset after 3 seconds
        setTimeout(() => setSubscribed(false), 3000);
      } else {
        toast.error('Already subscribed or invalid email');
      }
    } catch (err) {
      console.error(err);
      toast.error('Subscription failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="newsletter-section">
      <div className="container newsletter-container">
        <div className="newsletter-content">
          <div className="newsletter-text">
            <h2>Stay Updated with Manisara World</h2>
            <p>Get exclusive offers, new arrivals, and fashion tips delivered to your inbox</p>
            <div className="newsletter-benefits">
              <span>✓ Exclusive Discounts</span>
              <span>✓ New Collection Updates</span>
              <span>✓ Style Tips & Guides</span>
              <span>✓ Early Access to Sales</span>
            </div>
          </div>

          <form onSubmit={handleSubscribe} className="newsletter-form">
            {subscribed ? (
              <div className="subscription-success">
                <FiCheck size={24} />
                <span>Subscription Confirmed!</span>
              </div>
            ) : (
              <>
                <div className="form-group">
                  <FiMail className="form-icon" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  className="newsletter-btn"
                  disabled={loading}
                >
                  {loading ? 'Subscribing...' : 'Subscribe'}
                </button>
              </>
            )}
          </form>
        </div>

        <div className="newsletter-visual">
          <div className="newsletter-illustration">
            <div className="gift-box">
              <div className="gift-ribbon"></div>
              <div className="gift-bow"></div>
            </div>
            <div className="floating-offers">
              <span className="offer">20% OFF</span>
              <span className="offer">FREE DELIVERY</span>
              <span className="offer">NEW ARRIVALS</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSubscription;
