import { base44 } from '@/api/base44Client';

/**
 * Silent error logging utility
 * Logs errors to database without showing popups to users
 */
export const useErrorLog = () => {
  const logError = async (error, context = {}) => {
    try {
      const user = await base44.auth.me().catch(() => null);
      const currentPage = window.location.pathname.replace('/', '').split('?')[0] || 'Unknown';
      
      const errorCode = error?.code || context.errorCode || `ERR_${Date.now()}`;
      const messageShort = error?.message?.substring(0, 200) || context.message || 'Unknown error';
      const messageFull = error?.toString?.() || JSON.stringify(error);

      // Silently log to database (fire and forget)
      base44.entities.AppErrorLog.create({
        user_id: user?.id || 'anonymous',
        page: currentPage,
        error_code: errorCode,
        message_short: messageShort,
        message_full: messageFull,
        stack_trace: error?.stack || null,
        meta: {
          url: window.location.href,
          timestamp: new Date().toISOString(),
          ...context.meta
        },
        severity: context.severity || 'error',
        source: context.source || 'frontend'
      }).catch(err => {
        // Silently fail if logging fails
        console.debug('[ErrorLog] Logging failed:', err);
      });
    } catch (err) {
      // Prevent logging errors from crashing the app
      console.debug('[ErrorLog] Unexpected error:', err);
    }
  };

  return { logError };
};