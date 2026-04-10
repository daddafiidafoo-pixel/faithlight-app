import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { X, Lock, Zap, Award } from 'lucide-react';
import { base44 } from '@/api/base44Client';

/**
 * Paywall modal shown when non-subscribed users access Academy content
 * Guides them to subscribe or continue with free features
 */
export default function SubscriptionPaywall({
  isOpen,
  onClose,
  contentTitle = 'Premium Academy Content',
  contentType = 'course', // course, certification, advanced_ai
}) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleSubscribeClick = async () => {
    const authenticated = await base44.auth.isAuthenticated();
    if (!authenticated) {
      base44.auth.redirectToLogin(createPageUrl('AcademySubscription'));
      return;
    }
    // Redirect to subscription page
    window.location.href = `/${createPageUrl('AcademySubscription')}`;
  };

  const contentMessages = {
    course: {
      title: 'Complete Your Theology Course',
      description: 'This advanced curriculum is part of FaithLight Academy Premium.',
      benefits: [
        'Full structured theology curriculum',
        'Progress tracking & completion certificate',
        'Interactive quizzes with AI feedback',
      ],
    },
    certification: {
      title: 'Earn Your Certificate',
      description: 'Certification paths are exclusive to Academy Premium members.',
      benefits: [
        'Verifiable digital certificate',
        'Recognized by faith communities',
        'Track record of completed courses',
      ],
    },
    advanced_ai: {
      title: 'Advanced AI Study Tools',
      description: 'Unlock powerful AI-powered learning features.',
      benefits: [
        'AI-generated theological commentary',
        'Personalized study recommendations',
        'Sermon & lesson outline generator',
      ],
    },
  };

  const content = contentMessages[contentType] || contentMessages.course;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-600" />
            {content.title}
          </DialogTitle>
          <DialogDescription>{content.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Why Subscribe */}
          <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
            <p className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-600" />
              What You'll Get:
            </p>
            <ul className="space-y-2">
              {content.benefits.map((benefit, idx) => (
                <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full flex-shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          {/* Pricing Preview */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg p-4 text-white">
            <p className="text-sm opacity-90 mb-1">Academy Premium</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">$9.99</span>
              <span className="text-sm opacity-75">/month (or $79.99/year)</span>
            </div>
            <p className="text-xs mt-2 opacity-75">Cancel anytime, auto-renews</p>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleSubscribeClick}
              disabled={isCheckingOut}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              size="lg"
            >
              {isCheckingOut ? 'Processing...' : 'Subscribe Now'}
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Continue With Free Features
            </Button>
          </div>

          {/* Legal */}
          <div className="text-xs text-gray-500 text-center space-y-1">
            <p>
              By subscribing, you agree to our{' '}
              <Link to={createPageUrl('TermsOfService')} className="text-indigo-600 hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to={createPageUrl('PrivacyPolicy')} className="text-indigo-600 hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}