import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, Clock, Sparkles, Volume2 } from 'lucide-react';
import { useI18n } from '../I18nProvider';

/**
 * FeatureLimitModal
 * 
 * Soft limit modal shown when user hits daily feature cap
 * Shows meter, reset time, upgrade CTA, and alternatives
 */
export default function FeatureLimitModal({
  open,
  onClose,
  featureName = 'Feature',
  minutesRemaining = null,
  requestsRemaining = null,
  onUpgrade,
}) {
  const { t } = useI18n();

  const getContent = () => {
    if (featureName.includes('Reading')) {
      return {
        title: t('limits.reading.title', 'Daily Reading Limit Reached'),
        desc: t('limits.reading.desc', "You have used today's free reading minutes. They reset at midnight."),
        icon: <Volume2 className="w-6 h-6 text-amber-600" />,
        alternatives: [
          { label: t('limits.alt.upgrade', 'Upgrade to Premium'), action: onUpgrade, primary: true },
          { label: t('limits.alt.ok', 'OK'), action: onClose, primary: false },
        ],
      };
    }

    if (featureName.includes('Audio')) {
      return {
        title: t('limits.audio.title', 'Daily Audio Limit Reached'),
        desc: t('limits.audio.desc', 'You have used today\'s free audio listening minutes. They reset at midnight.'),
        icon: <Volume2 className="w-6 h-6 text-amber-600" />,
        alternatives: [
          { label: t('limits.alt.upgrade', 'Upgrade to Premium'), action: onUpgrade, primary: true },
          { label: t('limits.alt.ok', 'OK'), action: onClose, primary: false },
        ],
      };
    }

    if (featureName.includes('Sermon')) {
      return {
        title: 'Want to save this sermon? 🙏',
        desc: 'Unlock unlimited sermon generation and saving with FaithLight Premium.',
        icon: <Sparkles className="w-6 h-6 text-indigo-600" />,
        alternatives: [
          { label: 'Upgrade to Premium', action: onUpgrade, primary: true },
          { label: 'Continue with Free (limited)', action: onClose, primary: false },
        ],
      };
    }

    if (featureName.includes('AI')) {
      return {
        title: "You've reached your free limit 🙏",
        desc: 'Unlock unlimited AI prayers and Bible insights with FaithLight Premium.',
        icon: <Sparkles className="w-6 h-6 text-indigo-600" />,
        alternatives: [
          { label: 'Upgrade to Premium', action: onUpgrade, primary: true },
          { label: 'Continue with Free (limited)', action: onClose, primary: false },
        ],
      };
    }

    return {
      title: "You've reached your free limit 🙏",
      desc: 'Unlock unlimited access with FaithLight Premium.',
      icon: <AlertCircle className="w-6 h-6 text-amber-600" />,
      alternatives: [
        { label: 'Upgrade to Premium', action: onUpgrade, primary: true },
        { label: 'Continue with Free (limited)', action: onClose, primary: false },
      ],
    };
  };

  const content = getContent();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex items-start gap-3 mb-2">
            {content.icon}
            <div className="flex-1">
              <DialogTitle>{content.title}</DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <DialogDescription className="text-base text-gray-700 mb-6">
          {content.desc}
        </DialogDescription>

        {/* Reset Time */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2 mb-6">
          <Clock className="w-4 h-4 text-blue-600" />
          <span className="text-sm text-blue-900">
            {t('limits.resetTime', 'Resets at midnight UTC')}
          </span>
        </div>

        {/* Alternatives */}
        <div className="space-y-3">
          {content.alternatives.map((alt, idx) => (
            <Button
              key={idx}
              onClick={alt.action}
              variant={alt.primary ? 'default' : 'outline'}
              className={`w-full ${alt.primary ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
            >
              {alt.label}
            </Button>
          ))}
        </div>

        {/* Learn More Link */}
        <div className="mt-4 text-center">
          <a
            href="/Pricing"
            className="text-sm text-indigo-600 hover:text-indigo-700 underline"
          >
            {t('limits.comparePlans', 'Compare Free vs Premium plans')}
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}