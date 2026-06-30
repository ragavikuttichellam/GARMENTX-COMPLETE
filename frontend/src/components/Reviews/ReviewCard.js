import React from 'react';
import { useAuth } from '../../context/AuthContext';
import StarRating from './StarRating';

export default function ReviewCard({ review, onDelete, onEdit, onHelpful, onReport }) {
  const { user, isAdmin } = useAuth();
  const author = review.userId || {};
  const isOwner = user && author._id && user._id === author._id;
  const canManage = isOwner || isAdmin;
  return (
    <div style={{ display: 'flex', gap: 12, padding: 16, background: 'white', borderRadius: 12, marginBottom: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
      <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {author.avatar ? <img src={author.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: '#9CA3AF', fontWeight: 700 }}>{(author.name || 'U').charAt(0)}</span>}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{author.name || 'Anonymous'}</div>
            <div style={{ color: '#6B7280', fontSize: 12, marginTop: 4 }}>{new Date(review.createdAt).toLocaleDateString()}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <StarRating value={review.rating} />
            {review.verifiedPurchase && <div style={{ marginTop: 6, color: '#10B981', fontSize: 12, fontWeight: 600 }}>Verified purchase</div>}
          </div>
        </div>

        <div style={{ marginTop: 12, color: '#374151', lineHeight: 1.7 }}>{review.comment}</div>

        {review.images?.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(96px, 1fr))', gap: 10, marginTop: 14 }}>
            {review.images.map((img, i) => (
              <img key={i} src={img.url} alt={`review-${i}`} style={{ width: '100%', height: 96, objectFit: 'cover', borderRadius: 12 }} />
            ))}
          </div>
        )}

        {review.adminReply?.text && (
          <div style={{ marginTop: 14, padding: 14, borderRadius: 12, background: '#F8FAFC', border: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>Admin reply</div>
            <div style={{ color: '#334155', lineHeight: 1.6 }}>{review.adminReply.text}</div>
          </div>
        )}

        <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <button onClick={() => onHelpful && onHelpful(review._id)} style={{ background: 'transparent', border: '1px solid #E5E7EB', padding: '8px 12px', borderRadius: 10, color: '#374151' }}>
            Helpful ({review.helpfulCount || 0})
          </button>
          {canManage && (
            <button onClick={() => onEdit && onEdit(review)} style={{ background: '#FDF2F2', border: '1px solid #FECACA', padding: '8px 12px', borderRadius: 10, color: '#B91C1C' }}>
              Edit
            </button>
          )}
          {canManage && (
            <button onClick={() => onDelete && onDelete(review._id)} style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '8px 12px', borderRadius: 10, color: '#1D4ED8' }}>
              Delete
            </button>
          )}
          {!canManage && onReport && (
            <button onClick={() => onReport(review._id)} style={{ background: '#FEF3C7', border: '1px solid #FDE68A', padding: '8px 12px', borderRadius: 10, color: '#92400E' }}>
              Report
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
