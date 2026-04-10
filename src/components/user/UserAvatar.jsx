import React, { useState } from 'react';
import { User } from 'lucide-react';

/**
 * Shared avatar component — use everywhere a user avatar appears.
 *
 * Props:
 *   imageUrl   - string | null
 *   name       - string (used for initials fallback)
 *   size       - 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number (px)
 *   className  - extra classes on the wrapper
 *   rounded    - 'full' | 'xl' | '2xl' (default 'full')
 */
const SIZE_MAP = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-2xl',
  '2xl': 'w-24 h-24 text-3xl',
};

const ROUNDED_MAP = {
  full: 'rounded-full',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
};

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
}

export default function UserAvatar({
  imageUrl,
  name,
  size = 'md',
  className = '',
  rounded = 'full',
  style,
}) {
  const [imgError, setImgError] = useState(false);

  const sizeClass = typeof size === 'number' ? '' : (SIZE_MAP[size] || SIZE_MAP.md);
  const inlineStyle = typeof size === 'number' ? { width: size, height: size, fontSize: size * 0.35, ...style } : style;
  const roundedClass = ROUNDED_MAP[rounded] || 'rounded-full';

  const showImage = imageUrl && !imgError;

  return (
    <div
      className={`${sizeClass} ${roundedClass} overflow-hidden flex items-center justify-center flex-shrink-0 ${className}`}
      style={inlineStyle}
      aria-label={name ? `${name}'s avatar` : 'User avatar'}
    >
      {showImage ? (
        <img
          src={imageUrl}
          alt={name || 'User avatar'}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-full h-full bg-indigo-100 flex items-center justify-center">
          {name ? (
            <span className="font-bold text-indigo-600 leading-none select-none">
              {getInitials(name)}
            </span>
          ) : (
            <User className="w-1/2 h-1/2 text-indigo-400" />
          )}
        </div>
      )}
    </div>
  );
}