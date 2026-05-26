import React from 'react';
import StarRating from './StarRating';

export default function ReviewCard({ review, onDelete, onEdit, onHelpful }) {
  const user = review.userId || {};
  return (
    <div style={{ display: 'flex', gap: 12, padding: 12, background: 'white', borderRadius: 10, marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.03)'}}>
      <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {user.avatar ? <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: '#9CA3AF' }}>{(user.name || 'U').charAt(0)}</span>}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700 }}>{user.name || 'Anonymous'}</div>
            <div style={{ color: '#6B7280', fontSize: 12 }}>{new Date(review.createdAt).toLocaleDateString()}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <StarRating value={review.rating} />
            {review.verifiedPurchase && <div style={{ marginTop: 6, color: '#10B981', fontSize: 12, fontWeight: 600 }}>Verified purchase</div>}
          </div>
        </div>
        <div style={{ marginTop: 8, color: '#374151' }}>{review.comment}</div>
        {review.images?.length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            {review.images.map((img,i) => (
              <img key={i} src={img.url} alt="rev" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }} />
            ))}
          </div>
        )}
        <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
          <button onClick={() => onHelpful && onHelpful(review._id)} style={{ background: 'transparent', border: '1px solid #E5E7EB', padding: '6px 10px', borderRadius: 8 }}>Helpful ({review.helpfulCount || 0})</button>
        </div>
      </div>
    </div>
  );
}
