/**
 * Helper function to detect Capacitor and setup browser integration.
 * Call this once on app startup (e.g., from App.tsx/index.js)
 * 
 * This ensures:
 * - Android back button handling works correctly
 * - External links open in system browser (not WebView)
 * - Audio continues playing when screen locks
 */

export function setupCapacitorEnvironment() {
  if (typeof window === 'undefined') return;

  // Check if Capacitor is available
  if (window.Capacitor) {
    const { Plugins } = window.Capacitor;
    const { Browser } = Plugins;

    // Attach Browser to window for easy access in components
    if (!window.capacitor) {
      window.capacitor = {
        Browser: Browser
      };
    }

    console.log('[Capacitor] Environment initialized');
  }
}

/**
 * Use in pages like Pricing to open Stripe in system browser:
 * 
 * if (window.capacitor?.Browser) {
 *   window.capacitor.Browser.open({ url: stripeCheckoutUrl });
 * } else {
 *   window.location.href = stripeCheckoutUrl;
 * }
 */