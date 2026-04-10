import React from 'react';

/**
 * SkipToContent - Accessible skip link for keyboard navigation
 * Allows users to jump directly to main content
 * Visible when focused (keyboard users)
 */
export function SkipToContent() {
  const handleClick = (e) => {
    e.preventDefault();
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <a
      href="#main-content"
      onClick={handleClick}
      aria-label="Skip to main content"
      style={{
        position: 'fixed',
        top: '-200px',
        left: '1rem',
        minWidth: '44px',
        minHeight: '44px',
        overflow: 'hidden',
        opacity: 0,
        pointerEvents: 'none',
        zIndex: 9999,
      }}
      onFocus={e => {
        Object.assign(e.currentTarget.style, {
          top: '1rem',
          minWidth: 'auto',
          minHeight: 'auto',
          width: 'auto',
          height: '48px',
          padding: '0 24px',
          overflow: 'visible',
          opacity: '1',
          pointerEvents: 'auto',
          background: '#6C5CE7',
          color: 'white',
          fontWeight: '700',
          fontSize: '1rem',
          borderRadius: '0.5rem',
          display: 'inline-flex',
          alignItems: 'center',
          textDecoration: 'none',
          outline: '3px solid white',
          outlineOffset: '2px',
        });
      }}
      onBlur={e => {
        Object.assign(e.currentTarget.style, {
          top: '-200px',
          minWidth: '44px',
          minHeight: '44px',
          width: 'auto',
          height: 'auto',
          padding: '0',
          overflow: 'hidden',
          opacity: '0',
          pointerEvents: 'none',
        });
      }}
    >
      Skip to main content
    </a>
  );
}

/**
 * FocusableMain - Main content wrapper with focus management
 * Allows skip link to focus and announce content region
 */
export function FocusableMain({ children, className = '' }) {
  return (
    <main
      id="main-content"
      role="main"
      tabIndex={-1}
      className={className}
      aria-label="Main content"
    >
      {children}
    </main>
  );
}

/**
 * AccessibleBadge - Badge with semantic meaning and proper contrast
 * Used for status indicators, pills, etc.
 */
export function AccessibleBadge({ 
  children, 
  variant = 'neutral',
  ariaLabel 
}) {
  const variants = {
    neutral: 'bg-gray-100 text-gray-900',
    success: 'bg-green-100 text-green-900',
    warning: 'bg-yellow-100 text-yellow-900',
    error: 'bg-red-100 text-red-900',
    info: 'bg-blue-100 text-blue-900',
  };

  return (
    <span 
      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${variants[variant]}`}
      aria-label={ariaLabel}
      role="status"
    >
      {children}
    </span>
  );
}

/**
 * AccessibleAlert - Screen-reader friendly alert component
 */
export function AccessibleAlert({ 
  type = 'info', 
  title, 
  message,
  onDismiss
}) {
  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
  };

  const colors = {
    info: 'bg-blue-50 border-blue-200 text-blue-900',
    success: 'bg-green-50 border-green-200 text-green-900',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    error: 'bg-red-50 border-red-200 text-red-900',
  };

  return (
    <div 
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      className={`border-l-4 p-4 rounded mb-4 ${colors[type]}`}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl" aria-hidden="true">{icons[type]}</span>
        <div className="flex-1">
          {title && <h3 className="font-semibold mb-1">{title}</h3>}
          {message && <p className="text-sm">{message}</p>}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-auto min-h-[44px] min-w-[44px] flex items-center justify-center text-lg leading-none hover:opacity-70 focus:outline-none focus-visible:ring-3 focus-visible:ring-offset-2 focus-visible:ring-indigo-600 rounded"
            aria-label="Dismiss alert"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * AccessibleFieldset - Accessible form fieldset with legend
 */
export function AccessibleFieldset({ legend, children, className = '' }) {
  return (
    <fieldset className={className}>
      {legend && (
        <legend className="block text-sm font-semibold text-gray-900 mb-3">
          {legend}
        </legend>
      )}
      {children}
    </fieldset>
  );
}

/**
 * AccessibleFormGroup - Wrapper for form input + label with proper association
 */
export function AccessibleFormGroup({ 
  id,
  label, 
  required = false,
  error,
  helpText,
  children 
}) {
  return (
    <div className="mb-4">
      {label && (
        <label 
          htmlFor={id}
          className="block text-sm font-medium text-gray-900 mb-2"
        >
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p 
          id={`${id}-error`}
          className="text-sm text-red-600 mt-1"
          role="alert"
        >
          {error}
        </p>
      )}
      {helpText && !error && (
        <p 
          id={`${id}-help`}
          className="text-sm text-gray-500 mt-1"
        >
          {helpText}
        </p>
      )}
    </div>
  );
}

/**
 * AccessibleTab - Tab component with proper ARIA attributes
 */
export function AccessibleTab({ 
   id,
   label,
   isActive,
   isDisabled,
   onClick,
   children
}) {
   return (
     <button
       id={id}
       role="tab"
       aria-selected={isActive}
       aria-controls={`${id}-panel`}
       disabled={isDisabled}
       onClick={onClick}
       className={`px-4 py-2 font-medium rounded-t-lg transition-colors focus:outline-none focus-visible:ring-3 focus-visible:ring-offset-2 focus-visible:ring-indigo-600 min-h-[44px] min-w-[44px] ${
         isActive
           ? 'bg-indigo-600 text-white border-b-2 border-indigo-600'
           : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
       } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
     >
       {label || children}
     </button>
   );
 }

/**
 * AccessibleTabPanel - Panel for tab content
 */
export function AccessibleTabPanel({ 
  id,
  isActive,
  children 
}) {
  if (!isActive) return null;

  return (
    <div
      id={`${id}-panel`}
      role="tabpanel"
      aria-labelledby={id}
      className="py-4"
    >
      {children}
    </div>
  );
}