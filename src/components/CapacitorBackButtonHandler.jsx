import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppNavigation } from '@/hooks/useAppNavigation';

/**
 * CapacitorBackButtonHandler
 * Intercepts the Android/Capacitor hardware back button.
 * Uses the unified navigation store so tab stacks are respected.
 */
export default function CapacitorBackButtonHandler() {
  const location = useLocation();
  const { goBack } = useAppNavigation();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.Capacitor) return;

    const { App } = window.Capacitor.Plugins;
    if (!App?.addListener) return;

    const listener = App.addListener('backButton', async () => {
      const isHome = location.pathname === '/' || location.pathname === '/Home';

      if (isHome) {
        // On root — confirm exit
        const confirmed = window.confirm('Exit FaithLight?');
        if (confirmed) App.exitApp?.();
      } else {
        goBack();
      }
    });

    return () => { listener?.remove?.(); };
  }, [location.pathname, goBack]);

  return null;
}