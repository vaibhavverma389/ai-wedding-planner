import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'md', className = '' }) => {
  const variantStyles = {
    default: 'bg-ivory-200 text-stone-700 border-ivory-300',
    RENT: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    BUY_NEW: 'bg-maroon-50 text-maroon-900 border-maroon-200 font-semibold',
    BUY_USED: 'bg-amber-50 text-amber-900 border-amber-300',
    BOOK_SERVICE: 'bg-purple-50 text-purple-900 border-purple-200',
    gold: 'bg-gold-50 text-gold-900 border-gold-300 font-medium',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-rose-50 text-rose-800 border-rose-200'
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5'
  };

  const selectedVariant = variantStyles[variant] || variantStyles.default;
  const selectedSize = sizeStyles[size] || sizeStyles.md;

  return (
    <span
      className={`inline-flex items-center rounded-full border tracking-wide uppercase font-medium ${selectedVariant} ${selectedSize} ${className}`}
    >
      {children}
    </span>
  );
};
