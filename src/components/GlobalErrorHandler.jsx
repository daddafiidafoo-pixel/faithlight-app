/**
 * Global error handler for uncaught errors
 * Silently logs errors without showing popups
 * Prevents user-facing error messages from breaking UX
 */

export function initGlobalErrorHandler() {
  // Handle uncaught promise rejections (like Axios errors)
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason;
    const isAxiosError = error?.message?.includes('AxiosError');
    const isNetworkError = error?.code === 'NETWORK_ERROR' || error?.message?.includes('status code');

    // Log silently but prevent crash
    console.warn(`[GlobalErrorHandler] Unhandled rejection:`, error?.message || error);

    // For network/API errors: just prevent the crash, don't show popup
    if (isAxiosError || isNetworkError) {
      event.preventDefault(); // Prevent browser from showing error
    }
  });

  // Handle uncaught errors (render errors that escape boundaries)
  window.addEventListener('error', (event) => {
    const error = event.error;
    
    // Log silently
    console.warn(`[GlobalErrorHandler] Uncaught error:`, error?.message || event.message);

    // Don't preventDefault for these - let normal error handling work
  });
}

/**
 * Safe API call wrapper - catches errors and returns fallback
 * Used in components that can't use React hooks
 */
export async function safeApiCall(apiPromise, fallback = null) {
  try {
    return await apiPromise;
  } catch (error) {
    console.warn(`[SafeApiCall] Error caught:`, error?.message || error);
    return fallback;
  }
}

/**
 * Friendly error message mapper
 */
export function getFriendlyErrorMessage(error) {
  if (!error) return 'Something went wrong.';

  const status = error?.response?.status || error?.status;
  const message = error?.message || '';

  if (message.includes('AxiosError')) {
    if (status === 401) return 'Please sign in to continue.';
    if (status === 403) return "You don't have permission for this.";
    if (status === 404) return 'This content was not found.';
    if (status === 429) return 'Too many requests. Please wait a moment.';
    if (status >= 500) return 'Service temporarily unavailable. Please try again.';
    return 'Connection issue. Please check your internet.';
  }

  if (message.includes('Network')) return 'Network error. Please check your connection.';
  if (message.includes('timeout')) return 'Request timed out. Please try again.';

  return 'Something went wrong. Please try again.';
}