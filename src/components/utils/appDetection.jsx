/**
 * Detect if running in native app WebView vs web browser.
 * Uses multiple signals for reliability:
 *  1. Custom UA string set by the native wrapper (FaithLightApp)
 *  2. localStorage flag set by native bridge on init
 *  3. Android WebView detection
 */

export function isRunningInApp() {
  try {
    // 1. Custom UA injected by the native wrapper
    if (/FaithLightApp/i.test(navigator.userAgent)) return true;
    // 2. Flag set via native JS bridge on app boot
    if (localStorage.getItem('faithlight_native_app') === 'true') return true;
    // 3. Android WebView signal
    if (/wv/.test(navigator.userAgent) && /android/i.test(navigator.userAgent)) return true;
    return false;
  } catch {
    return false;
  }
}

export function isRunningIniOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function isRunningInAndroid() {
  return /android/i.test(navigator.userAgent);
}

export function isRunningInWeb() {
  return !isRunningInApp();
}

/**
 * Web payment (Stripe) must NEVER be shown inside the native wrapper.
 * Reader-app model: no pricing, no upgrade buttons, no checkout inside the app.
 */
export function shouldShowWebPaymentLink() {
  return !isRunningInApp();
}

export function getAvailablePaymentMethods() {
  return {
    web: !isRunningInApp(),
    ios: isRunningIniOS(),
    android: isRunningInAndroid(),
  };
}