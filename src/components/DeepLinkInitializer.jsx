import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';

/**
 * Initialize deep link handler on app mount
 * Handles native deep links from Capacitor (mobile only)
 * Falls back gracefully on web
 */
export default function DeepLinkInitializer() {
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize deep link handler (only on Capacitor/mobile)
    const initHandler = () => {
      try {
        // Check if Capacitor App is available globally
        if (typeof window === 'undefined' || !window?.Capacitor?.Plugins?.App) {
          return;
        }

        const App = window.Capacitor.Plugins.App;

        App.addListener('appUrlOpen', (event) => {
          const url = new URL(event.url);
          const pathname = url.pathname;

          // Route based on path
          if (pathname.startsWith('/share/sermon/')) {
            const token = pathname.split('/share/sermon/')[1]?.split('?')[0];
            if (token) navigate(createPageUrl('ShareSermon', `shareToken=${token}`));
          } else if (pathname.startsWith('/share/church/')) {
            const code = pathname.split('/share/church/')[1]?.split('?')[0];
            if (code) navigate(createPageUrl('ChurchMode', `joinCode=${code}`));
          } else if (pathname.startsWith('/prayer/')) {
            const id = pathname.split('/prayer/')[1]?.split('?')[0];
            if (id) navigate(createPageUrl('PrayerWall', `requestId=${id}`));
          } else if (pathname.startsWith('/plan/')) {
            const id = pathname.split('/plan/')[1]?.split('?')[0];
            if (id) navigate(createPageUrl('ReadingPlans', `planId=${id}`));
          } else {
            navigate(createPageUrl('Home'));
          }
        });
      } catch (err) {
        // Silently fail - running on web without Capacitor
      }
    };

    initHandler();
  }, [navigate]);

  return null;
}