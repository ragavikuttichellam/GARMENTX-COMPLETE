import React, { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight, FiStar } from 'react-icons/fi';
import './TestimonialCarousel.css';

/**
 * Testimonial/Reviews Carousel Component
 * Displays customer reviews with rotating carousel
 */
const TestimonialCarousel = () => {
  const [current, setCurrent] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: "Priya Sharma",
      role: "Fashion Enthusiast",
      rating: 5,
      text: "Manisara World has the most beautiful and premium quality sarees! The delivery was fast and the customer service is amazing. Highly recommend!",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
      verified: true
    },
    {
      id: 2,
      name: "Anita Verma",
      role: "Regular Customer",
      rating: 5,
      text: "I've been shopping at Manisara World for 6 months now. The quality of fabrics and designs is consistently excellent. Love the new collection!",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
      verified: true
    },
    {
      id: 3,
      name: "Deepika Singh",
      role: "Professional",
      rating: 5,
      text: "Perfect for work and casual wear. The sizing is accurate and the return policy is hassle-free. Best online shopping experience!",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
      verified: true
    },
    {
      id: 4,
      name: "Rajni Mehta",
      role: "Mother of 2",
      rating: 5,
      text: "Found great options for the entire family. Kids love their clothes and my husband's shirts are premium quality. Definitely buying again!",
      image: "https://images.unsplash.com/photo-1502685457775-32081356a37a?w=100&q=80",
      verified: true
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const goToSlide = (index) => {
    setCurrent(index);
  };

  const goToPrev = () => {
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setCurrent((prev) => (prev + 1) % testimonials.length);
  };

  const testimonial = testimonials[current];

  return (
    <section className="testimonial-section">
      <div className="container">
        <div className="section-header">
          <h2>Customer Love ❤️</h2>
          <p>Join thousands of happy customers who trust Manisara World</p>
        </div>

        <div className="testimonial-carousel">
          <div className="testimonial-card">
            <div className="testimonial-header">
              <div className="testimonial-avatar">
                <img src={testimonial.image} alt={testimonial.name} />
                {testimonial.verified && <span className="verified-badge">✓</span>}
              </div>
              <div className="testimonial-info">
                <h3 className="testimonial-name">{testimonial.name}</h3>
                <p className="testimonial-role">{testimonial.role}</p>
                <div className="testimonial-stars">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FiStar key={i} size={16} fill="#FFB800" color="#FFB800" />
                  ))}
                </div>
              </div>
            </div>
            <p className="testimonial-text">"{testimonial.text}"</p>
          </div>

          {/* Navigation Controls */}
          <div className="testimonial-controls">
            <button className="testimonial-nav" onClick={goToPrev} aria-label="Previous testimonial">
              <FiChevronLeft size={20} />
            </button>
            <div className="testimonial-indicators">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`indicator ${index === current ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
            <button className="testimonial-nav" onClick={goToNext} aria-label="Next testimonial">
              <FiChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="testimonial-stats">
          <div className="stat">
            <strong>50K+</strong>
            <span>Happy Customers</span>
          </div>
          <div className="stat">
            <strong>4.8★</strong>
            <span>Average Rating</span>
          </div>
          <div className="stat">
            <strong>2000+</strong>
            <span>5-Star Reviews</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialCarousel;
