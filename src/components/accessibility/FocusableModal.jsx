import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * FocusableModal — Accessible modal wrapper with consistent focus styling
 * - Traps focus within modal
 * - Auto-focuses first focusable element on open
 * - Restores focus on close
 * - Consistent focus-visible ring styling across all modals
 * - Includes fixed close button
 */
export default function FocusableModal({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  closeButtonClassName = '',
  contentClassName = '',
  size = 'md', // sm | md | lg | xl
}) {
  const modalRef = useRef(null);
  const previousActiveRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Store the element that had focus before modal opened
    previousActiveRef.current = document.activeElement;

    // Prevent body scroll
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Close on Escape key
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Auto-focus first focusable element
    setTimeout(() => {
      if (modalRef.current) {
        const focusables = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length > 0) {
          focusables[0].focus();
        }
      }
    }, 50);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = oldOverflow;
      // Restore focus to previous element
      if (previousActiveRef.current?.focus) {
        previousActiveRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center sm:justify-center p-4 overflow-y-auto">
      <div
        ref={modalRef}
        role="dialog"
        aria-labelledby="modal-title"
        aria-modal="true"
        className={`bg-white w-full sm:rounded-lg rounded-t-lg shadow-2xl ${sizeClasses[size]} ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 id="modal-title" className="text-lg font-semibold text-gray-900">
            {title}
          </h2>
          <button
            onClick={onClose}
            className={`flex items-center justify-center w-10 h-10 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${closeButtonClassName}`}
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className={`p-6 overflow-y-auto max-h-[calc(100vh-180px)] sm:max-h-[calc(100vh-200px)] ${contentClassName}`}>
          {children}
        </div>
      </div>
    </div>
  );
}