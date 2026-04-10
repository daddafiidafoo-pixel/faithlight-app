import { useEffect } from 'react';

/**
 * Screenshot mode wrapper — hides navigation UI and optimizes spacing
 * Add ?screenshot=true to URL to enable
 */
export function useScreenshotMode() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isScreenshot = params.get('screenshot') === 'true';
    
    if (isScreenshot) {
      // Hide Header, BottomTabs, and other UI
      const header = document.querySelector('[data-header]');
      const bottomTabs = document.querySelector('[data-bottom-tabs]');
      const scrollbars = document.documentElement;
      
      if (header) header.style.display = 'none';
      if (bottomTabs) bottomTabs.style.display = 'none';
      
      // Hide scrollbars
      scrollbars.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    }
  }, []);
}