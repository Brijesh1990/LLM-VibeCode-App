import React from 'react';

export default function Avatar({ name = 'User', src, size = 'md', className = '' }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`rounded-full object-cover ring-2 ring-white shadow-sm ${sizes[size] || sizes.md} ${className}`}
      />
    );
  }

  return (
    <div
      className={`rounded-full bg-gradient-to-br from-[#4F46E5] via-[#8B5CF6] to-[#06B6D4] text-white font-bold flex items-center justify-center ring-2 ring-white shadow-sm ${
        sizes[size] || sizes.md
      } ${className}`}
    >
      {initials || 'NX'}
    </div>
  );
}
