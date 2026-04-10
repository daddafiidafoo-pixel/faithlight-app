import React, { useEffect } from 'react';
import OnboardingFlow from '../components/onboarding/OnboardingFlow';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';

export default function OnboardingPage() {
  const navigate = useNavigate();

  const handleOnboardingComplete = async () => {
    // Track onboarding completion
    try {
      await base44.functions.invoke('trackAnalyticsEvent', {
        eventName: 'onboarding_completed',
        eventCategory: 'activation'
      });
    } catch (err) {
      console.warn('Failed to track onboarding:', err);
    }

    // Redirect to home
    setTimeout(() => {
      navigate('/Home');
    }, 3000);
  };

  return (
    <OnboardingFlow onComplete={handleOnboardingComplete} />
  );
}