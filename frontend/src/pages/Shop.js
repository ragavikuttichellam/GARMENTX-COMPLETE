import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { FiFilter, FiX, FiChevronDown, FiSearch } from 'react-icons/fi';
import ProductCard from '../components/ProductCard/ProductCard';
import './Shop.css';

const CATEGORIES = ['all', 'men', 'women', 'kids', 'accessories'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

export default function Shop({ category: propCategory, newArrival, offer }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    category: propCategory || searchParams.get('category') || 'all',
    sort: searchParams.get('sort') || 'newest',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    search: searchParams.get('search') || '',
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.category !== 'all') params.set('category', filters.category);
      if (filters.sort) params.set('sort', filters.sort);
      if (filters.minPrice) params.set('minPrice', filters.minPrice);
      if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
      if (filters.search) params.set('search', filters.search);
      if (newArrival) params.set('newArrival', 'true');
      if (offer) params.set('offer', 'true');
      params.set('page', page);
      params.set('limit', '12');
      const { data } = await api.get('/products', { params });
      setProducts(data.products || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters, page, newArrival, offer]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    if (propCategory) setFilters(f => ({ ...f, category: propCategory }));
  }, [propCategory]);

  const pageTitle = propCategory
    ? propCategory.charAt(0).toUpperCase() + propCategory.slice(1) + "'s Collection"
    : newArrival ? 'New Arrivals' : offer ? 'Special Offers' : 'All Products';

  return (
    <div className="shop-page">
      <div className="shop-header">
        <div className="container">
          <h1 className="shop-title">{pageTitle}</h1>
          <p className="shop-count">{total} Products Found</p>
        </div>
      </div>

      <div className="container shop-layout">
        {/* Sidebar Filters */}
        <aside className={'shop-sidebar' + (showFilter ? ' open' : '')}>
          <div className="filter-header">
            <h3>Filters</h3>
            <button className="close-filter" onClick={() => setShowFilter(false)}><FiX /></button>
          </div>

          <div className="filter-group">
            <h4>Category</h4>
            <div className="filter-options">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  className={'filter-opt' + (filters.category === cat ? ' active' : '')}
                  onClick={() => { setFilters(f => ({ ...f, category: cat })); setPage(1); }}
                >
                  {cat === 'all' ? 'All Products' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h4>Price Range</h4>
            <div className="price-inputs">
              <input type="number" placeholder="Min ₹" value={filters.minPrice} onChange={e => setFilters(f => ({ ...f, minPrice: e.target.value }))} />
              <span>—</span>
              <input type="number" placeholder="Max ₹" value={filters.maxPrice} onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))} />
            </div>
          </div>

          <button className="clear-filters" onClick={() => { setFilters({ category: propCategory || 'all', sort: 'newest', minPrice: '', maxPrice: '', search: '' }); setPage(1); }}>
            Clear All Filters
          </button>
        </aside>

        <div className="shop-main">
          {/* Toolbar */}
          <div className="shop-toolbar">
            <button className="filter-toggle" onClick={() => setShowFilter(true)}>
              <FiFilter size={16} /> Filters
            </button>
            <div className="search-inline">
              <FiSearch size={16} />
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={e => { setFilters(f => ({ ...f, search: e.target.value })); setPage(1); }}
              />
            </div>
            <div className="sort-select-wrap">
              <select className="sort-select" value={filters.sort} onChange={e => { setFilters(f => ({ ...f, sort: e.target.value })); setPage(1); }}>
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <FiChevronDown size={14} className="sort-arrow" />
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="products-grid">
              {[...Array(8)].map((_, i) => <div key={i} className="skeleton" style={{ height: '380px', borderRadius: '16px' }}></div>)}
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <div className="empty-emoji">🔍</div>
              <h3>No products found</h3>
              <p>Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <div className="products-grid">
              {products.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="pagination">
              {[...Array(pages)].map((_, i) => (
                <button key={i} className={'page-btn' + (page === i + 1 ? ' active' : '')} onClick={() => { setPage(i + 1); window.scrollTo(0, 300); }}>
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {showFilter && <div className="filter-overlay" onClick={() => setShowFilter(false)}></div>}
    </div>
  );
}
