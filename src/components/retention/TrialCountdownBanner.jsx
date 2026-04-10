import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function TrialCountdownBanner({ daysRemaining, onDismiss }) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || daysRemaining <= 0) {
    return null;
  }

  const bgColor = daysRemaining <= 3 ? 'bg-red-50 border-red-200' :
                  daysRemaining <= 7 ? 'bg-orange-50 border-orange-200' :
                  'bg-blue-50 border-blue-200';

  const textColor = daysRemaining <= 3 ? 'text-red-900' :
                    daysRemaining <= 7 ? 'text-orange-900' :
                    'text-blue-900';

  const buttonColor = daysRemaining <= 3 ? 'bg-red-600 hover:bg-red-700' :
                      daysRemaining <= 7 ? 'bg-orange-600 hover:bg-orange-700' :
                      'bg-blue-600 hover:bg-blue-700';

  return (
    <Card className={`border-2 ${bgColor} rounded-none`}>
      <CardContent className="py-4 px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Clock className={`w-5 h-5 flex-shrink-0 ${textColor.replace('text-', 'text-')}`} />
            <div>
              <p className={`font-semibold ${textColor}`}>
                {daysRemaining === 1
                  ? 'Last day of your free trial!'
                  : `${daysRemaining} days left in your free trial`}
              </p>
              <p className={`text-sm ${textColor} opacity-80`}>
                Keep your unlimited access — continue for $10/month or save 20% yearly.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <Link to={createPageUrl('PremiumFeatures')}>
              <Button className={`${buttonColor}`}>
                Continue Premium
              </Button>
            </Link>
            <button
              onClick={() => {
                setIsVisible(false);
                onDismiss?.();
              }}
              className={`p-2 rounded hover:bg-white/50 ${textColor}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}