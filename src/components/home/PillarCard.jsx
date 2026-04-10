import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Lock, ChevronRight } from 'lucide-react';

/**
 * PillarCard
 * 
 * Reusable pillar card for Home 3-pillar layout
 */
export default function PillarCard({
  icon: Icon,
  title,
  description,
  features,
  ctaLabel,
  onCTA,
  isPremium = true,
  lockMessage = null,
  isLocked = false,
}) {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow border-0 bg-white">
      <CardContent className="p-6 space-y-4 h-full flex flex-col">
        {/* Icon + Title */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Icon className="w-6 h-6 text-indigo-600" />
              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            </div>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
          {isLocked && (
            <Lock className="w-5 h-5 text-amber-600 flex-shrink-0" />
          )}
        </div>

        {/* Features */}
        <div className="flex-1 space-y-2">
          {features.map((feature, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
              <span>{feature}</span>
            </div>
          ))}
        </div>

        {/* Premium note (if not premium) */}
        {!isPremium && lockMessage && (
          <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
            {lockMessage}
          </div>
        )}

        {/* CTA Button */}
        <Button
          onClick={onCTA}
          variant={isPremium ? 'default' : 'outline'}
          className={`w-full gap-2 ${isPremium ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
          disabled={isLocked}
        >
          {ctaLabel}
          <ChevronRight className="w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );
}