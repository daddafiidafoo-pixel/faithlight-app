/**
 * useAppNavigation
 * Central navigation hook — use instead of bare `useNavigate()`.
 * Tracks per-tab stacks, powers the back button, and handles
 * Android hardware back via the Capacitor/popstate bridge.
 */
import { useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useNavigationStore, ROOT_PAGES, TAB_ROOTS } from '@/lib/navigationStore';
// Also import the store directly so goBack can read fresh state without closure issues

export function useAppNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const store = useNavigationStore();

  // ── Sync current path into the correct tab stack ──────────────────────────
  useEffect(() => {
    const tab = store.resolveTab(location.pathname);
    if (tab) {
      store.push(tab, location.pathname + location.search);
      store.setActiveTab(tab);
    }
  }, [location.pathname, location.search]);

  // ── Android hardware back button via popstate / Capacitor ─────────────────
  useEffect(() => {
    const handleHardwareBack = (e) => {
      // Only intercept if we're inside the Capacitor/Cordova bridge
      if (!window.__capacitor && !window.Capacitor) return;
      const handled = goBack();
      if (handled) {
        e.preventDefault?.();
        e.stopPropagation?.();
      }
    };

    // Capacitor fires a custom event
    document.addEventListener('backbutton', handleHardwareBack);
    return () => document.removeEventListener('backbutton', handleHardwareBack);
  }, [location.pathname]);

  // ── Navigate forward and record in stack ─────────────────────────────────
  const goTo = useCallback((path, options = {}) => {
    navigate(path, options);
  }, [navigate]);

  // ── Go back within tab stack, then fall back to router history ────────────
  const goBack = useCallback(() => {
    const page = location.pathname.replace(/^\//, '').split('?')[0];
    const isRoot = ROOT_PAGES.has(page) || location.pathname === '/';
    if (isRoot) return false; // nothing to go back to

    const tab = store.resolveTab(location.pathname) || store.activeTab;
    const currentStacks = useNavigationStore.getState().stacks;
    const stack = currentStacks[tab] || [];

    if (stack.length > 1) {
      const prev = store.pop(tab);
      navigate(prev, { replace: false });
      return true;
    }

    // Fall back: if browser history exists, use it; otherwise go to tab root
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(TAB_ROOTS[tab] || '/');
    }
    return true;
  }, [location.pathname, navigate, store]);

  // ── Tab switch: restore last page, or reset if same tab re-selected ────────
  const switchTab = useCallback((tab) => {
    const isReselecting = store.activeTab === tab;
    if (isReselecting) {
      store.resetTab(tab);
      navigate(TAB_ROOTS[tab] || '/');
    } else {
      const dest = store.peek(tab);
      store.setActiveTab(tab);
      navigate(dest);
    }
  }, [navigate, store]);

  // ── Convenience: can we go back? ─────────────────────────────────────────
  const canGoBack = (() => {
    const page = location.pathname.replace(/^\//, '').split('?')[0];
    if (ROOT_PAGES.has(page) || location.pathname === '/') return false;
    const tab = store.resolveTab(location.pathname) || store.activeTab;
    return (store.stacks[tab]?.length || 0) > 1;
  })();

  return {
    goTo,
    goBack,
    switchTab,
    canGoBack,
    activeTab: store.activeTab,
    location,
  };
}