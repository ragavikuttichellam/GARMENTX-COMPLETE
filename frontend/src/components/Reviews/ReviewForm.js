import React, { useState } from 'react';
import StarRating from './StarRating';
import { useAuth } from '../../context/AuthContext';
import { reviewAPI } from '../../utils/api';
import toast from 'react-hot-toast';

export default function ReviewForm({ productId, onPosted }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [showFileInput, setShowFileInput] = useState(false);

  const handleFiles = (e) => {
    setFiles(Array.from(e.target.files).slice(0,5));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!rating) return toast.error('Please add a rating');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('productId', productId);
      fd.append('rating', rating);
      fd.append('comment', comment);
      files.forEach(f => fd.append('images', f));
      const { data } = await reviewAPI.add(fd);
      toast.success('Review submitted');
      setRating(0); setComment(''); setFiles([]);
      onPosted && onPosted(data.review);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to submit review');
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={submit} style={{ background: 'white', padding: 16, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.03)', marginBottom: 16 }}>
      <h3 style={{ marginBottom: 8 }}>Write a review</h3>
      <div style={{ marginBottom: 8 }}>
        <StarRating value={rating} editable onChange={setRating} />
      </div>
      <textarea placeholder="Share your experience" value={comment} onChange={e => setComment(e.target.value)} rows={4} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #E5E7EB', marginBottom: 8 }} />
      <div style={{ marginBottom: 12 }}>
        {!user ? (
          <div style={{ color: '#6B7280' }}>Please login to attach images.</div>
        ) : (
          <div>
            <button type="button" onClick={() => setShowFileInput(s => !s)} style={{ padding: '6px 10px', marginBottom: 8, borderRadius: 8, border: '1px solid #E5E7EB' }}>{showFileInput ? 'Hide images' : 'Attach images'}</button>
            {showFileInput && (
              <div>
                <input type="file" accept="image/*" multiple onChange={handleFiles} />
                <div style={{ marginTop: 8 }}>
                  {files.map((f,i) => <span key={i} style={{ marginRight: 8, color: '#6B7280' }}>{f.name}</span>)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" disabled={loading} style={{ padding: '10px 16px', background: '#C8102E', color: 'white', border: 'none', borderRadius: 10 }}>
          {loading ? 'Posting...' : 'Post Review'}
        </button>
      </div>
    </form>
  );
}
