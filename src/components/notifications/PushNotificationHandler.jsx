import { useEffect } from 'react';

// Push notifications require a real VAPID key + a deployed service worker.
// In preview/sandbox environments these are not available, so this component
// is intentionally a no-op to prevent 500 errors from the registration attempt.
export default function PushNotificationHandler({ user }) {
  useEffect(() => {
    // No-op: push notifications disabled in this environment.
  }, [user]);

  return null;
}