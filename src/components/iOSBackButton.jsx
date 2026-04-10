import React from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { ROOT_PAGES } from '@/lib/navigationStore';

/**
 * Native-feel back button.
 * - Hidden on root/tab pages.
 * - Uses unified tab-aware history stack.
 * - 44×44 minimum tap target (WCAG 2.5.5).
 */
export default function IOSBackButton({ currentPageName, className = '' }) {
  const { goBack } = useAppNavigation();
  const location = useLocation();

  try {

    // Hide on root/tab pages
    const isRoot = ROOT_PAGES.has(currentPageName) || location.pathname === '/';
    if (isRoot) return null;

    return (
      <button
        onClick={goBack}
        aria-label="Go back"
        className={`
          min-h-[44px] min-w-[44px] p-2 -ml-2
          text-gray-700 dark:text-gray-300
          hover:bg-gray-100 dark:hover:bg-gray-800
          active:bg-gray-200 dark:active:bg-gray-700
          rounded-lg transition-colors
          focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2
          ${className}
        `}
      >
        <ArrowLeft className="w-5 h-5" aria-hidden="true" />
      </button>
    );
  } catch {
    return null;
  }
}