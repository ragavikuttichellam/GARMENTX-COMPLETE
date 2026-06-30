import React, { useEffect, useState } from 'react';
import { reviewAPI } from '../../utils/api';
import ReviewCard from './ReviewCard';
import StarRating from './StarRating';
import toast from 'react-hot-toast';

export default function ReviewsList({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState('latest');
  const [loading, setLoading] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState('');
  const [editFiles, setEditFiles] = useState([]);
  const [removeImageIds, setRemoveImageIds] = useState([]);

  const fetchReviews = async (p = 1, s = sort) => {
    setLoading(true);
    try {
      const { data } = await reviewAPI.getByProduct(productId, { page: p, sort: s });
      setReviews(data.reviews || []);
      setTotal(data.total || 0);
      setPage(data.page || 1);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to load reviews');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchReviews(1, sort); }, [productId, sort]);

  const resetEditState = () => {
    setEditingReview(null);
    setEditRating(0);
    setEditComment('');
    setEditFiles([]);
    setRemoveImageIds([]);
  };

  const startEdit = (review) => {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditComment(review.comment || '');
    setEditFiles([]);
    setRemoveImageIds([]);
  };

  const handleSaveEdit = async () => {
    if (!editingReview) return;
    if (!editRating) return toast.error('Rating is required');
    try {
      const formData = new FormData();
      formData.append('rating', editRating);
      formData.append('comment', editComment);
      removeImageIds.forEach((id) => formData.append('removeImageIds[]', id));
      editFiles.forEach((file) => formData.append('images', file));
      await reviewAPI.update(editingReview._id, formData);
      toast.success('Review updated');
      resetEditState();
      fetchReviews(page, sort);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Update failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await reviewAPI.delete(id);
      toast.success('Review deleted');
      if (editingReview?.id === id) resetEditState();
      fetchReviews(page, sort);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Delete failed');
    }
  };

  const handleReport = async (id) => {
    try {
      await reviewAPI.report(id, { reason: 'Inappropriate content' });
      toast.success('Review reported');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Report failed');
    }
  };

  const handleHelpful = async (id) => {
    try {
      await reviewAPI.helpful(id);
      fetchReviews(page, sort);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to register helpful vote');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['latest', 'highest', 'lowest'].map((option) => (
            <button key={option} onClick={() => setSort(option)} style={{ padding: '8px 12px', borderRadius: 10, border: sort === option ? '2px solid #C8102E' : '1px solid #E5E7EB', background: 'white', color: '#374151', cursor: 'pointer' }}>
              {option === 'latest' ? 'Latest' : option === 'highest' ? 'Highest' : 'Lowest'}
            </button>
          ))}
        </div>
        <div style={{ color: '#6B7280', fontWeight: 600 }}>{total} reviews</div>
      </div>

      {editingReview && (
        <div style={{ background: 'white', borderRadius: 16, padding: 20, boxShadow: '0 2px 16px rgba(0,0,0,0.05)', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Edit Your Review</h3>
            <button onClick={resetEditState} style={{ background: 'transparent', border: 'none', color: '#6B7280', cursor: 'pointer' }}>Cancel</button>
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ minWidth: 200 }}><StarRating value={editRating} editable onChange={setEditRating} /></div>
            <textarea value={editComment} onChange={(e) => setEditComment(e.target.value)} rows={4} style={{ width: '100%', minWidth: 260, padding: 12, borderRadius: 12, border: '1px solid #E5E7EB' }} />
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 12, background: '#F3F4F6', color: '#374151' }}>
              Add Images
              <input type="file" accept="image/*" multiple onChange={(e) => setEditFiles(Array.from(e.target.files).slice(0, 5))} style={{ display: 'none' }} />
            </label>
            <button onClick={handleSaveEdit} style={{ padding: '10px 18px', borderRadius: 12, background: '#C8102E', color: 'white', border: 'none', cursor: 'pointer' }}>Save Edit</button>
          </div>
          {editFiles.length > 0 && <div style={{ marginTop: 12, color: '#6B7280' }}>{editFiles.length} new image(s) selected</div>}
        </div>
      )}

      {loading ? <div className="spinner" /> : (
        <div>
          {reviews.length > 0 ? reviews.map((review) => (
            <ReviewCard
              key={review._id}
              review={review}
              onHelpful={handleHelpful}
              onDelete={handleDelete}
              onEdit={startEdit}
              onReport={handleReport}
            />
          )) : <div style={{ padding: 20, background: 'white', borderRadius: 12 }}>No reviews yet</div>}
        </div>
      )}
    </div>
  );
}
