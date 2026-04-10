import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, X } from 'lucide-react';

export default function NotificationPermissionRequest({ onPermissionGranted }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const checkPermission = async () => {
      if ('Notification' in window) {
        if (Notification.permission === 'default') {
          const requested = localStorage.getItem('notificationRequested');
          if (!requested) {
            setVisible(true);
          }
        }
      }
    };
    checkPermission();
  }, []);

  const handleRequest = async () => {
    localStorage.setItem('notificationRequested', 'true');

    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          onPermissionGranted?.();
          setVisible(false);
        }
      } catch (err) {
        console.error('Notification permission failed:', err);
      }
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('notificationRequested', 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm border-l-4 border-indigo-600 z-50">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Bell className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-gray-900">Daily Reminders</h3>
            <p className="text-sm text-gray-600 mt-1">
              Get notified to continue your Bible study and journal entries
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex gap-2 mt-4">
        <Button
          onClick={handleRequest}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          Enable Notifications
        </Button>
        <Button
          onClick={handleDismiss}
          variant="outline"
          className="flex-1"
        >
          Not Now
        </Button>
      </div>
    </div>
  );
}