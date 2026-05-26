import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Star, Heart, ShoppingBag } from 'lucide-react';
import HeroBanner from '../components/HeroBanner/HeroBanner';
import NewsletterSubscription from '../components/NewsletterSubscription/NewsletterSubscription';
import InstagramFeed from '../components/InstagramFeed/InstagramFeed';
import WhatsAppButton from '../components/WhatsApp/WhatsAppButton';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import api from '../utils/api';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [trendingCollections, setTrendingCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Fetch featured products
      const featuredRes = await api.get('/products?featured=true&limit=8');
      setFeaturedProducts(featuredRes.data.products || []);

      // Fetch trending collections
      const trendingRes = await api.get('/products?trending=true&limit=8');
      setTrendingCollections(trendingRes.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const testimonials = [
    {
      id: 1,
      name: 'Priya Sharma',
      text: 'Absolutely love the collection! Premium quality and amazing service. Will definitely order again.',
      rating: 5,
      image: null
    },
    {
      id: 2,
      name: 'Anjali Singh',
      text: 'The sarees are breathtaking! Fast delivery and excellent customer support. Highly recommended!',
      rating: 5,
      image: null
    },
    {
      id: 3,
      name: 'Deepali Patel',
      text: 'Premium fabrics and exquisite designs. Worth every penny. Already recommended to my friends!',
      rating: 5,
      image: null
    }
  ];

  const offers = [
    { id: 1, title: 'Summer Sale', discount: '40% OFF', image: 'bg-gradient-to-r from-pink-400 to-rose-400' },
    { id: 2, title: 'Wedding Collection', discount: 'NEW', image: 'bg-gradient-to-r from-purple-400 to-pink-400' },
    { id: 3, title: 'First Order', discount: '20% OFF', image: 'bg-gradient-to-r from-amber-400 to-orange-400' }
  ];

  const ProductCard = ({ product }) => (
    <Link to={`/product/${product._id}`} className="group">
      <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
        <div className="relative overflow-hidden bg-gray-200 h-72">
          <img
            src={product.images?.[0]?.url || 'https://via.placeholder.com/300x400?text=Product'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          {product.discount && (
            <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              -{product.discount}%
            </div>
          )}
          <button className="absolute top-4 left-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors">
            <Heart className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-800 truncate">{product.name}</h3>
          <p className="text-xs text-gray-500 mt-1 mb-3">{product.category}</p>
          <div className="flex items-center mb-3">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <span className="text-xs text-gray-600 ml-2">(124 reviews)</span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <div>
              <span className="text-lg font-bold text-gray-900">₹{product.price?.toLocaleString()}</span>
              {product.originalPrice && (
                <span className="text-sm text-gray-500 line-through ml-2">₹{product.originalPrice?.toLocaleString()}</span>
              )}
            </div>
          </div>
          {product.stock > 0 ? (
            <button className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-2 rounded-lg font-semibold hover:from-pink-600 hover:to-rose-600 transition-colors flex items-center justify-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Add to Cart
            </button>
          ) : (
            <button className="w-full bg-gray-300 text-gray-600 py-2 rounded-lg font-semibold cursor-not-allowed">
              Out of Stock
            </button>
          )}
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <WhatsAppButton />

      {/* Hero Banner */}
      <HeroBanner />

      {/* Offer Banners */}
      <section className="py-8 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className={`${offer.image} rounded-lg p-8 text-white cursor-pointer hover:shadow-xl transition-shadow duration-300`}
            >
              <h3 className="text-2xl font-bold mb-2">{offer.title}</h3>
              <p className="text-4xl font-bold">{offer.discount}</p>
              <p className="text-sm mt-4 opacity-90">Shop Now →</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-2 text-gray-900">Featured Collection</h2>
        <p className="text-center text-gray-600 mb-12">Handpicked luxury pieces for you</p>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-96 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Trending Collections */}
      <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto bg-gray-50">
        <h2 className="text-3xl font-bold text-center mb-2 text-gray-900">Trending Now</h2>
        <p className="text-center text-gray-600 mb-12">What everyone's loving this season</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingCollections.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* Customer Reviews/Testimonials */}
      <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-2 text-gray-900">What Our Customers Say</h2>
        <p className="text-center text-gray-600 mb-12">Join thousands of satisfied customers</p>
        
        <div className="relative max-w-3xl mx-auto">
          <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg p-8 md:p-12">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 bg-gray-200 flex items-center justify-center text-lg font-semibold text-gray-700">
                {testimonials[testimonialIndex].name.split(' ').map(n=>n[0]).slice(0,2).join('')}
              </div>
              <div className="flex justify-center mb-4">
                {[...Array(testimonials[testimonialIndex].rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-lg text-gray-700 mb-4 italic">"{testimonials[testimonialIndex].text}"</p>
              <p className="font-semibold text-gray-900">{testimonials[testimonialIndex].name}</p>
            </div>
          </div>

          {/* Navigation */}
          <button
            onClick={() => setTestimonialIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 bg-gray-900 text-white p-2 rounded-full hover:bg-gray-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setTestimonialIndex((prev) => (prev + 1) % testimonials.length)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 bg-gray-900 text-white p-2 rounded-full hover:bg-gray-700 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setTestimonialIndex(i)}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === testimonialIndex ? 'bg-pink-500' : 'bg-gray-300'
              }`}
            ></button>
          ))}
        </div>
      </section>

      {/* Instagram Section */}
      <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto">
        <InstagramFeed />
      </section>

      {/* Newsletter Section */}
      <section className="py-12 px-4 md:px-8 bg-gray-900">
        <NewsletterSubscription />
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;
