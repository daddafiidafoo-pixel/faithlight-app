import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Lock, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

/**
 * Academy Paywall Modal
 * Shows when user tries to access premium Academy content without subscription
 * 
 * Usage:
 * <AcademyPaywall 
 *   open={showPaywall}
 *   onClose={() => setShowPaywall(false)}
 *   contentTitle="Advanced Theology Course"
 * />
 */
export default function AcademyPaywall({ 
  open = false, 
  onClose = () => {}, 
  contentTitle = 'Premium Content',
  variant = 'course' // 'course', 'certificate', 'ai-tools'
}) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    if (open) {
      fetchUser();
    }
  }, [open]);

  const variantContent = {
    course: {
      icon: '📚',
      title: 'Unlock Premium Courses',
      description: 'This course is available exclusively to Academy Premium members.',
      benefits: [
        'Structured theology curriculum',
        'Leadership certification track',
        'Downloadable materials',
        'Academy completion certificates',
      ],
    },
    certificate: {
      icon: '🎓',
      title: 'Unlock Certificates',
      description: 'Training certificates are exclusive to Academy Premium members.',
      benefits: [
        'Official completion certificates',
        'Digital credential verification',
        'Shareable certificates',
        'Professional credentials',
      ],
    },
    'ai-tools': {
      icon: '🤖',
      title: 'Unlock AI Advanced Tools',
      description: 'Advanced AI study tools are exclusive to Academy Premium members.',
      benefits: [
        'Advanced Bible commentary',
        'Custom sermon generation',
        'Personalized study plans',
        'AI-powered quiz creation',
      ],
    },
  };

  const content = variantContent[variant];

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl mx-auto mb-4">
            <Lock className="w-6 h-6 text-indigo-600" />
          </div>
          <DialogTitle className="text-center text-xl">{content.title}</DialogTitle>
          <DialogDescription className="text-center mt-2">
            {contentTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Description */}
          <p className="text-gray-600 text-center text-sm">
            {content.description}
          </p>

          {/* Benefits */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4">
            <p className="font-semibold text-gray-900 mb-3">Premium includes:</p>
            <ul className="space-y-2">
              {content.benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <Sparkles className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pricing Preview */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Just</p>
                <p className="text-2xl font-bold text-gray-900">$9.99/mo</p>
                <p className="text-xs text-gray-500">or $79.99/year (save 33%)</p>
              </div>
              <div className="text-right text-sm text-green-600 font-semibold">
                Cancel<br />anytime
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Not logged in */}
            {loading ? (
              <Button disabled className="w-full bg-indigo-600">
                Loading...
              </Button>
            ) : !user ? (
              <Button
                onClick={() => {
                  base44.auth.redirectToLogin(window.location.pathname);
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Sign In to Subscribe
              </Button>
            ) : (
              <Link to={createPageUrl('AcademySubscription')} className="block">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2">
                  <Sparkles className="w-4 h-4" />
                  Upgrade to Premium
                </Button>
              </Link>
            )}

            <Button
              variant="ghost"
              onClick={onClose}
              className="w-full text-gray-700"
            >
              Maybe Later
            </Button>
          </div>

          {/* Fine Print */}
          <p className="text-xs text-gray-500 text-center">
            Subscription auto-renews unless canceled. No commitment.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}