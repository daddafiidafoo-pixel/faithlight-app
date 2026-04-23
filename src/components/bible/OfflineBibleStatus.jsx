import React, { useEffect, useState } from 'react';ø
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, HardDrive } from 'lucide-react';

export default function OfflineBibleStatus({ languageCode = 'en', translationId = 'KJV' }) {
  const [cached, setCached] = useState(0);
  const [size, setSize] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const cachedChapters = [];
    setCached(cachedChapters.length);
    const storageSize = 0;
    setSize(storageSize);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="flex items-center gap-4 py-2 px-4 bg-gray-50 rounded-lg border border-gray-200">
      {isOnline ? (
        <Wifi className="w-4 h-4 text-green-600" />
      ) : (
        <WifiOff className="w-4 h-4 text-amber-600" />
      )}

      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={isOnline ? 'default' : 'secondary'}>
            {isOnline ? 'Online' : 'Offline Mode'}
          </Badge>
          {cached > 0 && (
            <Badge variant="outline" className="flex items-center gap-1">
              <HardDrive className="w-3 h-3" />
              {cached} chapters cached
            </Badge>
          )}
          {size > 0 && (
            <span className="text-xs text-gray-600">
              {size} MB offline
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
