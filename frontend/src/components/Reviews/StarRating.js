import React from 'react';
import { FiStar } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';

export default function StarRating({ value = 0, size = 20, editable = false, onChange }) {
  const stars = [1,2,3,4,5];
  const handleClick = (v) => {
    if (!editable) return;
    onChange && onChange(v);
  };
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {stars.map(s => (
        <span key={s} onClick={() => handleClick(s)} style={{ cursor: editable ? 'pointer' : 'default' }}>
          {s <= value ? <FaStar size={size} color="#FFB800" /> : <FiStar size={size} color="#D1D5DB" />}
        </span>
      ))}
    </div>
  );
}
