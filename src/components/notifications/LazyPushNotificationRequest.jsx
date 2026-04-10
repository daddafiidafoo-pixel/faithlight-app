import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, Check, X } from 'lucide-react';

/**
 * Lazy Push Notification Permission Request
 * Only shown when user enables a feature that requires push notifications
 * (e.g., Daily Verse Reminder)
 */
export default function LazyPushNotificationRequest({ featureName, onApprove, onDismiss }) {
  const [loading, setLoading] = useState(false);
  const [requested, setRequested] = useState(false);

  const handleRequestPermission = async () => {
    setLoading(true);
    try {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const permission = await Notification.requestPermission();
        setRequested(true);
        
        if (permission === 'granted') {
          // Subscribe to push notifications
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
          });
          
          // Send subscription to backend
          if (onApprove) onApprove(subscription);
        }
      }
    } catch (err) {
      console.warn('Push notification request failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (requested) {
    return null; // Hide after requesting
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
      <div className="flex items-start gap-3">
        <Bell className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-900">
            Enable {featureName} notifications?
          </p>
          <p className="text-xs text-blue-700 mt-0.5">
            Get timely reminders without missing a day. We'll only send notifications for features you choose.
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={onDismiss}
          className="flex-1 gap-1 text-xs"
        >
          <X className="w-3.5 h-3.5" /> Not now
        </Button>
        <Button
          size="sm"
          onClick={handleRequestPermission}
          disabled={loading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 gap-1 text-xs"
        >
          <Check className="w-3.5 h-3.5" /> Enable
        </Button>
      </div>
    </div>
  );
}