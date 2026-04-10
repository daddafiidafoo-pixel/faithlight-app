import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { AlertCircle, Volume2 } from 'lucide-react';

/**
 * AudioMeterDisplay
 * 
 * Inline meter for audio player showing daily audio listening minutes
 */
export default function AudioMeterDisplay() {
  const [minutesUsed, setMinutesUsed] = useState(0);
  const [minutesRemaining, setMinutesRemaining] = useState(30);
  const [isWarning, setIsWarning] = useState(false);
  const [isExhausted, setIsExhausted] = useState(false);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated().catch(() => false);
        if (!isAuth) return;
        const result = await base44.functions.invoke('checkFeatureAccess', {
          featureKey: 'audio.stream_minutes',
        });
        const data = result?.data;
        if (data && typeof data.used === 'number') {
          const used = data.used || 0;
          setMinutesUsed(used);
          setMinutesRemaining(Math.max(0, 30 - used));
          setIsWarning(used >= 24);
          setIsExhausted(used >= 30);
        }
      } catch (err) {
        // Silently ignore — don't spam console with meter errors
      }
    };

    fetchUsage();
    // Refresh every 30 seconds
    const interval = setInterval(fetchUsage, 30000);
    return () => clearInterval(interval);
  }, []);

  const percent = Math.min((minutesUsed / 30) * 100, 100);

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs">
      <Volume2 className="w-3.5 h-3.5 text-gray-600" />
      <div className="flex-1">
        <div className="font-semibold text-gray-900">
          {minutesUsed} / 30 min
        </div>
        <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-1.5 rounded-full transition-all ${
              isExhausted ? 'bg-red-600' : isWarning ? 'bg-amber-600' : 'bg-blue-600'
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
      {isExhausted && (
        <AlertCircle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
      )}
      {isWarning && !isExhausted && (
        <span className="text-amber-700 font-semibold">
          {minutesRemaining} min left
        </span>
      )}
    </div>
  );
}