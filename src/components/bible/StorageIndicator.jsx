import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HardDrive, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function StorageIndicator({ isDarkMode }) {
  const [storageUsed, setStorageUsed] = useState(0);
  const [storageLimit] = useState(500 * 1024 * 1024); // 500MB limit

  useEffect(() => {
    calculateStorage();
  }, []);

  const calculateStorage = () => {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('bible_')) {
        const value = localStorage.getItem(key);
        total += value.length;
      }
    }
    setStorageUsed(total);
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const percentUsed = (storageUsed / storageLimit) * 100;
  const cardBg = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const borderColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';
  const progressColor = percentUsed > 80 ? '#EF4444' : percentUsed > 50 ? '#F97316' : '#22C55E';

  const clearAllStorage = () => {
    if (window.confirm('Delete all offline Bible content? This cannot be undone.')) {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('bible_')) {
          keys.push(key);
        }
      }
      keys.forEach(key => localStorage.removeItem(key));
      setStorageUsed(0);
    }
  };

  return (
    <Card style={{ backgroundColor: cardBg, borderColor }} className="border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2" style={{ color: textColor }}>
            <HardDrive className="w-5 h-5" />
            Offline Storage
          </CardTitle>
          <span className="text-xs font-semibold" style={{ color: textColor }}>
            {formatBytes(storageUsed)} / {formatBytes(storageLimit)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="w-full bg-gray-300 rounded-full h-3" style={{ backgroundColor: isDarkMode ? '#2A2F2C' : '#E5E7EB' }}>
          <div
            className="h-3 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(percentUsed, 100)}%`, backgroundColor: progressColor }}
          />
        </div>
        <div className="text-xs" style={{ color: textColor }}>
          <p className="font-medium">{Math.round(percentUsed)}% of storage used</p>
          <p style={{ color: isDarkMode ? '#A0A0A0' : '#6E6E6E' }} className="text-xs mt-1">
            {formatBytes(storageUsed)} stored • {formatBytes(storageLimit - storageUsed)} available
          </p>
        </div>
        {percentUsed > 80 && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllStorage}
            className="w-full gap-2 text-xs"
            style={{ borderColor, color: '#EF4444' }}
          >
            <Trash2 className="w-3 h-3" />
            Clear All Storage
          </Button>
        )}
      </CardContent>
    </Card>
  );
}