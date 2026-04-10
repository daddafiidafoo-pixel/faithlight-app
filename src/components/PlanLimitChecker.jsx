import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

export default function PlanLimitChecker({ user, feature, onProceed }) {
  // Check if user can use the feature
  const canUse = checkFeatureAccess(user, feature);

  if (canUse.allowed) {
    return (
      <div>
        {onProceed && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-blue-900">
              <Sparkles className="w-4 h-4" />
              <span>
                {feature === 'ai_tutor' 
                  ? `${canUse.remaining} AI questions remaining today`
                  : `${canUse.remaining} / ${canUse.limit} AI generations this month`}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Alert className="bg-amber-50 border-amber-200">
      <Lock className="w-4 h-4 text-amber-600" />
      <AlertDescription>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-amber-900 mb-1">{canUse.message}</p>
            <p className="text-sm text-amber-800">{canUse.description}</p>
          </div>
          <Link to={createPageUrl('Pricing')}>
            <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white ml-4">
              Upgrade Now
            </Button>
          </Link>
        </div>
      </AlertDescription>
    </Alert>
  );
}

function checkFeatureAccess(user, feature) {
  if (!user) {
    return { allowed: false, message: 'Please log in', description: 'You need to be logged in to use this feature.' };
  }

  const planType = user.plan_type || 'free';
  const aiUsed = user.ai_generations_used || 0;
  const resetDate = user.ai_reset_date ? new Date(user.ai_reset_date) : null;
  const today = new Date();

  // Reset counter if past reset date
  const needsReset = resetDate && today > resetDate;

  if (feature === 'ai_tutor') {
    if (planType === 'free') {
      const dailyLimit = 5;
      if (!needsReset && aiUsed >= dailyLimit) {
        return {
          allowed: false,
          message: 'Daily Limit Reached',
          description: 'Free plan allows 5 AI questions per day. Upgrade to Pro for unlimited access.',
          remaining: 0,
          limit: dailyLimit
        };
      }
      return { 
        allowed: true, 
        remaining: needsReset ? dailyLimit : Math.max(0, dailyLimit - aiUsed),
        limit: dailyLimit
      };
    }
    // Pro and Teacher have unlimited AI Tutor
    return { allowed: true, remaining: '∞', limit: '∞' };
  }

  if (feature === 'teaching_builder') {
    if (planType === 'free' || planType === 'pro') {
      return {
        allowed: false,
        message: 'Teacher Plan Required',
        description: 'AI Teaching & Sermon Builder is only available for Teacher/Pastor plan members.',
        remaining: 0,
        limit: 0
      };
    }
    
    if (planType === 'teacher') {
      const monthlyLimit = 30;
      if (!needsReset && aiUsed >= monthlyLimit) {
        return {
          allowed: false,
          message: 'Monthly Limit Reached',
          description: 'You\'ve used all 30 AI generations this month. Limit resets next billing cycle.',
          remaining: 0,
          limit: monthlyLimit
        };
      }
      return { 
        allowed: true, 
        remaining: needsReset ? monthlyLimit : Math.max(0, monthlyLimit - aiUsed),
        limit: monthlyLimit
      };
    }
  }

  return { allowed: false, message: 'Access Denied', description: 'You do not have access to this feature.' };
}

export { checkFeatureAccess };