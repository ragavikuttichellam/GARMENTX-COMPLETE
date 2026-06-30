import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Share2, ChevronLeft, ChevronRight, Star, Truck, RefreshCw, Shield } from 'lucide-react';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import WhatsAppButton from '../components/WhatsApp/WhatsAppButton';
import ReviewSummary from '../components/Reviews/ReviewSummary';
import ReviewForm from '../components/Reviews/ReviewForm';
import ReviewsList from '../components/Reviews/ReviewsList';
import api from '../utils/api';
import toast from 'react-hot-toast';

const ProductDetailPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [imageZoom, setImageZoom] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetchProductDetails();
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/products/${productId}`);
      setProduct(res.data);
      setSelectedColor(res.data.colors?.[0] || null);
      setSelectedSize(res.data.sizes?.[0] || null);

      // Fetch reviews
      const reviewRes = await api.get(`/reviews/product/${productId}`);
      setReviews(reviewRes.data.reviews || []);

      // Fetch related products
      const relatedRes = await api.get(`/products?category=${res.data.category}&limit=4`);
      setRelatedProducts(relatedRes.data.products?.filter(p => p._id !== productId) || []);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Product not found');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!selectedColor || !selectedSize) {
      toast.error('Please select color and size');
      return;
    }
    const cartItem = {
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity,
      color: selectedColor,
      size: selectedSize,
      image: product.images[0]
    };
    localStorage.setItem('cartItem', JSON.stringify([...JSON.parse(localStorage.getItem('cart') || '[]'), cartItem]));
    toast.success('Added to cart');
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setZoomPosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <p className="text-gray-600">Product not found</p>
        </div>
      </div>
    );
  }

  const averageRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <WhatsAppButton productId={productId} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <a href="/" className="hover:text-pink-500">Home</a>
          <span>/</span>
          <a href="/products" className="hover:text-pink-500">{product.category}</a>
          <span>/</span>
          <span className="text-gray-900 font-semibold">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div
              className="relative overflow-hidden bg-gray-100 rounded-lg h-96 cursor-zoom-in"
              onMouseEnter={() => setImageZoom(true)}
              onMouseLeave={() => setImageZoom(false)}
              onMouseMove={handleMouseMove}
            >
              <img
                src={product.images[selectedImage]?.url || 'https://via.placeholder.com/500x600'}
                alt={product.name}
                className={`w-full h-full object-cover transition-transform duration-300 ${
                  imageZoom ? 'scale-150' : 'scale-100'
                }`}
                style={
                  imageZoom
                    ? {
                        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
                      }
                    : {}
                }
              />
              <button className="absolute top-4 right-4 bg-white rounded-full p-3 shadow-lg hover:bg-gray-50 transition-colors">
                <Heart className="w-6 h-6 text-gray-600 hover:text-red-500" />
              </button>
            </div>

            {/* Thumbnail Gallery */}
            <div className="flex gap-2 overflow-x-auto">
              {product.images?.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index ? 'border-pink-500' : 'border-gray-200'
                  }`}
                >
                  <img src={image.url} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Product Video */}
            {product.videoUrl && (
              <div className="rounded-lg overflow-hidden bg-gray-100 h-60">
                <iframe
                  src={product.videoUrl}
                  title="Product Video"
                  className="w-full h-full"
                  allowFullScreen
                ></iframe>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div>
            {/* Rating & Reviews */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.round(averageRating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="font-semibold text-gray-900">{averageRating}</span>
              <span className="text-gray-600">({reviews.length} reviews)</span>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
            <p className="text-gray-600 text-lg mb-6">{product.description}</p>

            {/* Pricing */}
            <div className="mb-6">
              <div className="flex items-center gap-4">
                <span className="text-4xl font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-500 line-through">₹{product.originalPrice.toLocaleString()}</span>
                )}
              </div>
              {product.discount && (
                <p className="text-green-600 font-semibold mt-2">Save {product.discount}%</p>
              )}
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              {product.stock > 0 ? (
                <span className="inline-block bg-green-50 text-green-700 px-3 py-1 rounded-full font-semibold">
                  In Stock ({product.stock} available)
                </span>
              ) : (
                <span className="inline-block bg-red-50 text-red-700 px-3 py-1 rounded-full font-semibold">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-3">Color</label>
                <div className="flex gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        selectedColor === color
                          ? 'border-gray-900 ring-2 ring-offset-2 ring-gray-400'
                          : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    ></button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-3">Size</label>
                <div className="flex gap-3 flex-wrap">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-lg border-2 font-semibold transition-all ${
                        selectedSize === size
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-300 text-gray-900 hover:border-gray-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-3">Quantity</label>
              <div className="flex items-center border border-gray-300 rounded-lg w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                >
                  −
                </button>
                <span className="px-6 py-2 font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-rose-600 transition-all flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 border-2 border-gray-900 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Buy Now
              </button>
            </div>

            {/* Features */}
            <div className="space-y-4 border-t border-b border-gray-200 py-6">
              <div className="flex items-center gap-4">
                <Truck className="w-6 h-6 text-gray-600" />
                <div>
                  <p className="font-semibold text-gray-900">Free Shipping</p>
                  <p className="text-sm text-gray-600">On orders above ₹499</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <RefreshCw className="w-6 h-6 text-gray-600" />
                <div>
                  <p className="font-semibold text-gray-900">Easy Returns</p>
                  <p className="text-sm text-gray-600">30-day return policy</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Shield className="w-6 h-6 text-gray-600" />
                <div>
                  <p className="font-semibold text-gray-900">Secure Payment</p>
                  <p className="text-sm text-gray-600">SSL encrypted checkout</p>
                </div>
              </div>
            </div>

            {/* Share */}
            <div className="flex items-center gap-2 mt-6">
              <span className="text-sm text-gray-600">Share:</span>
              <button className="p-2 text-gray-600 hover:text-pink-500 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
          <div className="space-y-8">
            <ReviewSummary productId={productId} />
            <ReviewForm productId={productId} />
            <ReviewsList productId={productId} />
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((prod) => (
                <div key={prod._id} className="group cursor-pointer" onClick={() => navigate(`/product/${prod._id}`)}>
                  <div className="bg-gray-100 rounded-lg overflow-hidden h-64 mb-4">
                    <img
                      src={prod.images[0]?.url || 'https://via.placeholder.com/300x400'}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{prod.name}</h3>
                  <p className="text-lg font-bold text-gray-900">₹{prod.price.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetailPage;
