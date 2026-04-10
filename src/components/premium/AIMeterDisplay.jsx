import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { AlertCircle, Sparkles } from 'lucide-react';

/**
 * AIMeterDisplay
 * 
 * Inline meter for AI features showing daily AI request usage
 */
export default function AIMeterDisplay({ feature = 'Sermon_Builder' }) {
  const [requestsUsed, setRequestsUsed] = useState(0);
  const [requestsRemaining, setRequestsRemaining] = useState(5);
  const [isWarning, setIsWarning] = useState(false);
  const [isExhausted, setIsExhausted] = useState(false);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated().catch(() => false);
        if (!isAuth) return;
        const result = await base44.functions.invoke('checkFeatureAccess', {
          featureKey: 'ai.explain_passage',
        });
        const data = result?.data;
        if (data && typeof data.used === 'number') {
          const used = data.used || 0;
          setRequestsUsed(used);
          setRequestsRemaining(Math.max(0, 5 - used));
          setIsWarning(used >= 4);
          setIsExhausted(used >= 5);
        }
      } catch {
        // Silently ignore
      }
    };

    fetchUsage();
    const interval = setInterval(fetchUsage, 30000);
    return () => clearInterval(interval);
  }, [feature]);

  const percent = Math.min((requestsUsed / 5) * 100, 100);

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs">
      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
      <div className="flex-1">
        <div className="font-semibold text-gray-900">
          AI Today: {requestsUsed} / 5
        </div>
        <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-1.5 rounded-full transition-all ${
              isExhausted ? 'bg-red-600' : isWarning ? 'bg-amber-600' : 'bg-indigo-600'
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
      {isExhausted && (
        <AlertCircle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
      )}
      {isWarning && !isExhausted && requestsRemaining === 1 && (
        <span className="text-amber-700 font-semibold text-xs">
          Last one
        </span>
      )}
    </div>
  );
}