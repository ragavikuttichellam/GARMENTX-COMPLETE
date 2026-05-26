import React, { useEffect, useState } from 'react';
import { reviewAPI } from '../../utils/api';
import StarRating from './StarRating';

export default function ReviewSummary({ productId }) {
  const [data, setData] = useState({ average: 0, count: 0, breakdown: {} });
  useEffect(() => {
    let mounted = true;
    reviewAPI.average(productId).then(({ data }) => { if (mounted && data.success) setData({ average: data.average, count: data.count, breakdown: data.breakdown }); }).catch(()=>{});
    return () => mounted = false;
  }, [productId]);

  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginBottom: 16 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: '#C8102E' }}>{(data.average || 0).toFixed(1)}</div>
        <div style={{ marginTop: 6 }}><StarRating value={Math.round(data.average)} size={18} /></div>
        <div style={{ color: '#6B7280', marginTop: 6 }}>{data.count} ratings</div>
      </div>
      <div style={{ flex: 1 }}>
        {[5,4,3,2,1].map(star => {
          const cnt = data.breakdown?.[star] || 0;
          const percent = data.count ? Math.round((cnt / data.count) * 100) : 0;
          return (
            <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 36 }}>{star}★</div>
              <div style={{ background: '#F3F4F6', height: 10, borderRadius: 6, flex: 1, overflow: 'hidden' }}>
                <div style={{ width: `${percent}%`, background: '#F59E0B', height: '100%' }}></div>
              </div>
              <div style={{ width: 40, textAlign: 'right', color: '#6B7280' }}>{cnt}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
