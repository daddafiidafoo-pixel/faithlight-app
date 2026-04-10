/**
 * Native wrapper detection — covers Capacitor, Cordova, React Native WebView,
 * iOS WKWebView, and Android WebView.
 */

export function isCapacitor() {
  return typeof window !== 'undefined' && !!window.Capacitor;
}

export function isCordova() {
  return typeof window !== 'undefined' && !!window.cordova;
}

export function isReactNativeWebView() {
  return typeof window !== 'undefined' && !!window.ReactNativeWebView;
}

export function isIOSWebView() {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  return isIOS && /AppleWebKit/i.test(ua) && !/Safari/i.test(ua);
}

export function isAndroidWebView() {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const isAndroid = /Android/i.test(ua);
  return isAndroid && (/\bwv\b/i.test(ua) || /Version\/\d+/i.test(ua));
}

export function isNativeWrapper() {
  try {
    // Custom UA set by the FaithLight native wrapper
    if (/FaithLightApp/i.test(navigator.userAgent)) return true;
    // Flag set via native JS bridge on boot
    if (localStorage.getItem('faithlight_native_app') === 'true') return true;
    return (
      isCapacitor() ||
      isCordova() ||
      isReactNativeWebView() ||
      isIOSWebView() ||
      isAndroidWebView()
    );
  } catch {
    return false;
  }
}