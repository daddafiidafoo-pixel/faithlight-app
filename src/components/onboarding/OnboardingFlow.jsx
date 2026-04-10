import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { ChevronRight, Check } from 'lucide-react';

export default function OnboardingFlow({ onComplete }) {
  const [step, setStep] = useState(1);
  const [spiritualIntent, setSpiritualIntent] = useState(null);
  const [language, setLanguage] = useState('en');
  const [agreedToSafety, setAgreedToSafety] = useState(false);

  const trialMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('initiateFreeTrialSubscription', {});
      return response.data;
    },
    onSuccess: () => {
      setStep(7);
      setTimeout(() => {
        onComplete?.();
      }, 3000);
    },
    onError: () => {
      alert('Unable to activate trial. Please try again.');
    }
  });

  const handleContinue = async () => {
    if (step === 6) {
      // Start trial
      trialMutation.mutate();
    } else {
      setStep(step + 1);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 2:
        return spiritualIntent !== null;
      case 4:
        return agreedToSafety;
      case 6:
        return true;
      default:
        return true;
    }
  };

  const stepIndicator = (stepNum) => (
    <div className="flex items-center gap-2 mb-8">
      {[1, 2, 3, 4, 5, 6].map((s) => (
        <div key={s} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
              s === step
                ? 'bg-indigo-600 text-white'
                : s < step
                ? 'bg-green-600 text-white'
                : 'bg-gray-300 text-gray-600'
            }`}
          >
            {s < step ? <Check className="w-4 h-4" /> : s}
          </div>
          {s < 6 && <div className="w-8 h-0.5 bg-gray-300" />}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-indigo-900 to-blue-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl">
        {/* Step 1: Welcome */}
        {step === 1 && (
          <>
            <CardHeader className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full mx-auto flex items-center justify-center">
                <span className="text-3xl">📖</span>
              </div>
              <CardTitle className="text-4xl">Welcome to FaithLight</CardTitle>
              <p className="text-gray-600">Grow step-by-step in your faith journey.</p>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                onClick={() => setStep(2)}
                className="bg-indigo-600 hover:bg-indigo-700 text-lg px-8 py-6"
              >
                Let's Get Started <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </>
        )}

        {/* Step 2: Spiritual Intent */}
        {step === 2 && (
          <>
            <CardHeader>
              {stepIndicator(2)}
              <CardTitle>What best describes you?</CardTitle>
              <p className="text-sm text-gray-600 mt-2">This helps us personalize your learning path.</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { value: 'new_faith', label: '🌱 New to Faith', desc: 'Just starting my Christian journey' },
                { value: 'growing', label: '🌿 Growing Believer', desc: 'Active in my faith community' },
                { value: 'deep_study', label: '📖 Deeper Study', desc: 'Want to understand Scripture deeply' },
                { value: 'leadership', label: '🔥 Preparing for Leadership', desc: 'Leading others spiritually' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setSpiritualIntent(option.value)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    spiritualIntent === option.value
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <p className="font-semibold text-gray-900">{option.label}</p>
                  <p className="text-sm text-gray-600 mt-1">{option.desc}</p>
                </button>
              ))}
              <Button
                onClick={handleContinue}
                disabled={!isStepValid()}
                className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700"
              >
                Continue <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </>
        )}

        {/* Step 3: Language Selection */}
        {step === 3 && (
          <>
            <CardHeader>
              {stepIndicator(3)}
              <CardTitle>Choose Your Language</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { code: 'en', label: '🇺🇸 English' },
                { code: 'om', label: '🇪🇹 Afaan Oromo' },
                { code: 'es', label: '🇪🇸 Español' },
                { code: 'fr', label: '🇫🇷 Français' },
                { code: 'sw', label: '🇰🇪 Kiswahili' }
              ].map(lang => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                    language === lang.code
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
              <Button
                onClick={handleContinue}
                className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700"
              >
                Continue <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </>
        )}

        {/* Step 4: Safety Statement */}
        {step === 4 && (
          <>
            <CardHeader>
              {stepIndicator(4)}
              <CardTitle>Community Commitment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 space-y-3">
                <p className="font-semibold text-gray-900">FaithLight is a safe, verified Christian community.</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>✓ Verified by church leaders and theologians</li>
                  <li>✓ Built on Scripture, not human opinion</li>
                  <li>✓ Safe space for all ages and backgrounds</li>
                  <li>✓ Active moderation to protect our community</li>
                </ul>
              </div>
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={agreedToSafety}
                  onChange={(e) => setAgreedToSafety(e.target.checked)}
                  className="mt-1"
                />
                <label className="text-sm text-gray-700">
                  I agree to be part of a respectful, Christ-centered community
                </label>
              </div>
              <Button
                onClick={handleContinue}
                disabled={!isStepValid()}
                className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700"
              >
                I'm Ready <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </>
        )}

        {/* Step 5: Account Created (auto-skipped if already logged in) */}
        {step === 5 && (
          <>
            <CardHeader className="text-center">
              {stepIndicator(5)}
              <CardTitle className="text-2xl mt-4">Account Created! 🎉</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-700">You're ready to explore FaithLight.</p>
              <Button
                onClick={handleContinue}
                className="bg-indigo-600 hover:bg-indigo-700 text-lg px-8"
              >
                Next: Activate Your Free Trial <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </>
        )}

        {/* Step 6: Premium Introduction */}
        {step === 6 && (
          <>
            <CardHeader>
              {stepIndicator(6)}
              <CardTitle>Go Deeper with FaithLight Premium</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  '🎧 Offline Audio Downloads',
                  '📖 Advanced Theology Courses',
                  '🧠 AI Bible Tutor Pro',
                  '👥 Leadership Dashboard'
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-3 bg-blue-50 rounded">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-900">{feature}</span>
                  </div>
                ))}
              </div>
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg border border-indigo-200 text-center space-y-2">
                <p className="font-semibold text-gray-900">30-Day Free Trial</p>
                <p className="text-sm text-gray-700">
                  Experience all premium features risk-free.
                </p>
              </div>
              <Button
                onClick={handleContinue}
                disabled={trialMutation.isPending}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-lg py-6"
              >
                {trialMutation.isPending ? 'Activating...' : 'Start 30-Day Free Trial'}
              </Button>
              <p className="text-xs text-center text-gray-600">
                Cancel anytime. Core faith content always remains free.
              </p>
            </CardContent>
          </>
        )}

        {/* Step 7: Trial Activated */}
        {step === 7 && (
          <>
            <CardHeader className="text-center space-y-4">
              <div className="w-20 h-20 bg-green-100 rounded-full mx-auto flex items-center justify-center">
                <span className="text-5xl">🎉</span>
              </div>
              <CardTitle className="text-3xl">Your Trial Starts Now!</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="bg-green-50 p-6 rounded-lg border border-green-200 space-y-2">
                <p className="font-semibold text-green-900">30 days of Premium access</p>
                <p className="text-sm text-green-800">
                  Explore offline audio, advanced courses, leadership tools, and more.
                </p>
              </div>
              <p className="text-gray-600">Taking you home...</p>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}