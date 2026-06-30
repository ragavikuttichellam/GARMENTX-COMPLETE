const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const User = require('./models/User');
dotenv.config();

const products = [
  { name: "Classic Oxford Shirt", description: "Premium cotton Oxford shirt, perfect for formal occasions", price: 1299, originalPrice: 1899, category: "men", subCategory: "shirts", images: ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400"], sizes: ["S","M","L","XL","XXL"], colors: ["White","Blue","Grey"], stock: 50, brand: "Manisara World", rating: 4.5, numReviews: 24, isFeatured: true, discount: 32 },
  { name: "Slim Fit Chinos", description: "Comfortable slim-fit chinos for everyday wear", price: 1599, originalPrice: 2199, category: "men", subCategory: "pants", images: ["https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400"], sizes: ["28","30","32","34","36"], colors: ["Navy","Khaki","Black"], stock: 40, brand: "Manisara World", rating: 4.3, numReviews: 18, isFeatured: true, discount: 27 },
  { name: "Premium Polo T-Shirt", description: "Breathable polo T-shirt for casual outings", price: 799, originalPrice: 1199, category: "men", subCategory: "tshirts", images: ["https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=400"], sizes: ["S","M","L","XL"], colors: ["Red","White","Black","Navy"], stock: 80, brand: "Manisara World", rating: 4.6, numReviews: 45, isNewArrival: true, discount: 33 },
  { name: "Denim Jacket", description: "Classic denim jacket with modern fit", price: 2499, originalPrice: 3499, category: "men", subCategory: "jackets", images: ["https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400"], sizes: ["S","M","L","XL"], colors: ["Blue","Black"], stock: 25, brand: "Manisara World", rating: 4.7, numReviews: 32, isFeatured: true, discount: 29 },
  { name: "Floral Maxi Dress", description: "Elegant floral maxi dress for special occasions", price: 1899, originalPrice: 2799, category: "women", subCategory: "dresses", images: ["https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400"], sizes: ["XS","S","M","L","XL"], colors: ["Red","Blue","Green"], stock: 35, brand: "Manisara World", rating: 4.8, numReviews: 56, isFeatured: true, discount: 32 },
  { name: "Women's Kurti Set", description: "Traditional printed kurti with palazzo", price: 1299, originalPrice: 1899, category: "women", subCategory: "ethnic", images: ["https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400"], sizes: ["S","M","L","XL","XXL"], colors: ["Pink","Yellow","Orange"], stock: 60, brand: "Manisara World", rating: 4.6, numReviews: 78, isNewArrival: true, discount: 32 },
  { name: "Casual Crop Top", description: "Trendy crop top for casual outings", price: 599, originalPrice: 899, category: "women", subCategory: "tops", images: ["https://images.unsplash.com/photo-1562572159-4efc207f5aff?w=400"], sizes: ["XS","S","M","L"], colors: ["White","Black","Pink"], stock: 70, brand: "Manisara World", rating: 4.4, numReviews: 34, isOnOffer: true, discount: 33 },
  { name: "Women's Blazer", description: "Professional blazer for office wear", price: 2299, originalPrice: 3299, category: "women", subCategory: "blazers", images: ["https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=400"], sizes: ["XS","S","M","L","XL"], colors: ["Black","Grey","Navy"], stock: 20, brand: "Manisara World", rating: 4.7, numReviews: 29, isFeatured: true, discount: 30 },
  { name: "Kids Cartoon T-Shirt", description: "Fun cartoon print T-shirt for kids", price: 499, originalPrice: 699, category: "kids", subCategory: "tshirts", images: ["https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=400"], sizes: ["2-3Y","4-5Y","6-7Y","8-9Y"], colors: ["Blue","Red","Yellow"], stock: 100, brand: "Manisara World", rating: 4.5, numReviews: 42, isNewArrival: true, discount: 29 },
  { name: "Kids Denim Set", description: "Comfortable denim shirt and pants combo", price: 899, originalPrice: 1299, category: "kids", subCategory: "sets", images: ["https://images.unsplash.com/photo-1522771930-78848d9293e8?w=400"], sizes: ["3-4Y","5-6Y","7-8Y","9-10Y"], colors: ["Blue","Black"], stock: 45, brand: "Manisara World", rating: 4.6, numReviews: 28, isFeatured: true, discount: 31 },
  { name: "Girls Frock", description: "Adorable floral frock for little girls", price: 699, originalPrice: 999, category: "kids", subCategory: "dresses", images: ["https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=400"], sizes: ["2-3Y","4-5Y","6-7Y","8-9Y"], colors: ["Pink","Purple","Yellow"], stock: 55, brand: "Manisara World", rating: 4.7, numReviews: 61, isOnOffer: true, discount: 30 },
  { name: "Kids Track Suit", description: "Sporty track suit for active kids", price: 1099, originalPrice: 1499, category: "kids", subCategory: "sportswear", images: ["https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=400"], sizes: ["4-5Y","6-7Y","8-9Y","10-11Y"], colors: ["Navy","Black","Grey"], stock: 38, brand: "Manisara World", rating: 4.4, numReviews: 19, isFeatured: false, discount: 27 }
];

async function seed() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is required. Refusing to seed without an explicit database connection string.');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log(`✅ Seeded ${products.length} products`);
    
    // Create admin user
    const existing = await User.findOne({ email: 'admin@manisaraworld.com' });
    if (!existing) {
      await User.create({ name: 'Admin', email: 'admin@manisaraworld.com', password: 'Admin@123', role: 'admin' });
      console.log('✅ Admin user created: admin@manisaraworld.com / Admin@123');
    }
    mongoose.disconnect();
    console.log('✅ Seeding complete!');
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}
seed();
