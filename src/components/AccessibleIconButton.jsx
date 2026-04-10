import React from 'react';

/**
 * AccessibleIconButton - Icon button that meets WCAG requirements
 * - Ensures 44×44px minimum tap target
 * - Requires explicit aria-label for icon-only buttons
 * - Handles focus styles automatically
 */
export default function AccessibleIconButton({
  Icon,
  label,
  onClick,
  variant = 'default',
  size = 'md',
  disabled = false,
  className = '',
  ...props
}) {
  const sizeClasses = {
    sm: 'min-h-[44px] min-w-[44px] p-2',
    md: 'min-h-[44px] min-w-[44px] p-2.5',
    lg: 'min-h-[44px] min-w-[44px] p-3',
  };

  const variantClasses = {
    default: 'text-gray-600 hover:bg-gray-100 active:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800 dark:active:bg-gray-700',
    primary: 'text-indigo-600 hover:bg-indigo-100 active:bg-indigo-200 dark:text-indigo-400 dark:hover:bg-indigo-900 dark:active:bg-indigo-800',
    destructive: 'text-red-600 hover:bg-red-100 active:bg-red-200 dark:text-red-400 dark:hover:bg-red-900 dark:active:bg-red-800',
    ghost: 'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white',
  };

  if (!label) {
    console.warn('AccessibleIconButton: aria-label prop is required for icon-only buttons');
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`
        inline-flex items-center justify-center rounded-lg transition-colors
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
      {...props}
    >
      {Icon && <Icon className="w-5 h-5" aria-hidden="true" />}
    </button>
  );
}