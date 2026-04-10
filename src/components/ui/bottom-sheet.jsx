import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * Accessible BottomSheet
 * - ARIA role="dialog" + aria-modal
 * - Focus trap: first focusable element receives focus on open
 * - Escape key closes
 * - Backdrop click closes
 * - Drag-handle visual affordance
 * - Safe-area padding at bottom
 */
export function BottomSheet({ isOpen, onClose, title, children, className = '' }) {
  const sheetRef = useRef(null);
  const closeRef = useRef(null);

  // Focus trap + Escape key handler
  useEffect(() => {
    if (!isOpen) return;

    // Auto-focus the close button when sheet opens
    const timer = setTimeout(() => closeRef.current?.focus(), 50);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !sheetRef.current) return;

      const focusable = Array.from(
        sheetRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.disabled);

      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    // Prevent background scroll
    document.body.style.overflow = 'hidden';

    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40"
            aria-hidden="true"
          />

          {/* Sheet */}
          <motion.div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'bottom-sheet-title' : undefined}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            className={`fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-white dark:bg-gray-900 max-h-[85vh] flex flex-col ${className}`}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1" aria-hidden="true">
              <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3 border-b border-gray-100 dark:border-gray-800">
              {title
                ? <h2 id="bottom-sheet-title" className="font-semibold text-base text-gray-900 dark:text-white">{title}</h2>
                : <div />
              }
              <button
                ref={closeRef}
                onClick={onClose}
                aria-label="Close"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" aria-hidden="true" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 p-4" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Kept for backward-compat but no longer needed as a separate element
export function BottomSheetTrigger({ children, onClick, className = '', ...props }) {
  return (
    <button
      onClick={onClick}
      className={`min-h-[44px] min-w-[44px] ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}