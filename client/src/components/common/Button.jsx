import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  type = 'button',
  onClick,
  ...props
}) => {
  const variantStyles = {
    primary:
      'bg-maroon-900 hover:bg-maroon-950 text-white shadow-md hover:shadow-lg focus:ring-maroon-700',
    gold:
      'bg-gold-600 hover:bg-gold-700 text-white shadow-md hover:shadow-lg focus:ring-gold-500',
    outline:
      'border-2 border-maroon-900 text-maroon-900 hover:bg-maroon-50 focus:ring-maroon-800',
    goldOutline:
      'border-2 border-gold-600 text-gold-700 hover:bg-gold-50 focus:ring-gold-500',
    secondary:
      'bg-ivory-200 hover:bg-ivory-300 text-stone-800 border border-ivory-300 focus:ring-stone-400',
    ghost:
      'text-stone-700 hover:bg-stone-100 focus:ring-stone-400',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500'
  };

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 rounded-md font-medium',
    md: 'text-sm px-4 py-2.5 rounded-lg font-medium',
    lg: 'text-base px-6 py-3.5 rounded-xl font-semibold',
    icon: 'p-2 rounded-lg'
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`inline-flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed ${variantStyles[variant] || variantStyles.primary} ${sizeStyles[size] || sizeStyles.md} ${className}`}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
};
