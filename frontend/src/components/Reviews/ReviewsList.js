import React, { useEffect, useState } from 'react';
import { reviewAPI } from '../../utils/api';
import ReviewCard from './ReviewCard';
import toast from 'react-hot-toast';

export default function ReviewsList({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState('latest');
  const [loading, setLoading] = useState(false);

  const fetch = async (p = 1, s = sort) => {
    setLoading(true);
    try {
      const { data } = await reviewAPI.getByProduct(productId, { page: p, sort: s });
      setReviews(data.reviews || []);
      setTotal(data.total || 0);
      setPage(data.page || 1);
    } catch (err) {
      toast.error('Failed to load reviews');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetch(1, sort); }, [productId, sort]);

  const handleHelpful = async (id) => {
    try {
      await reviewAPI.helpful(id);
      fetch(page, sort);
    } catch (err) { toast.error('Failed'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setSort('latest')} style={{ padding: '6px 10px', borderRadius: 8, border: sort==='latest' ? '2px solid #C8102E' : '1px solid #E5E7EB' }}>Latest</button>
          <button onClick={() => setSort('highest')} style={{ padding: '6px 10px', borderRadius: 8, border: sort==='highest' ? '2px solid #C8102E' : '1px solid #E5E7EB' }}>Highest</button>
          <button onClick={() => setSort('lowest')} style={{ padding: '6px 10px', borderRadius: 8, border: sort==='lowest' ? '2px solid #C8102E' : '1px solid #E5E7EB' }}>Lowest</button>
        </div>
        <div style={{ color: '#6B7280' }}>{total} reviews</div>
      </div>

      {loading ? <div className="spinner" /> : (
        <div>
          {reviews.map(r => <ReviewCard key={r._id} review={r} onHelpful={handleHelpful} />)}
          {reviews.length === 0 && <div style={{ padding: 20, background: 'white', borderRadius: 10 }}>No reviews yet</div>}
        </div>
      )}
    </div>
  );
}
