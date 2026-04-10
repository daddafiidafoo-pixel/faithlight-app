import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, ChevronRight, ChevronLeft, BookOpen, Search, Sparkles, Users, Target, Award, CheckCircle } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

const WALKTHROUGH_KEY = 'faithlight_onboarding_done';

const STEPS = [
  {
    id: 'welcome',
    icon: '👋',
    title: 'Welcome to FaithLight!',
    description: "You're joining a global community of believers. Let's take a quick tour of what you can do here.",
    tip: null,
    highlight: null,
    cta: null,
  },
  {
    id: 'bible',
    icon: '📖',
    title: 'Read & Study the Bible',
    description: 'Access the full Bible with AI-powered explanations, cross-references, and offline reading. Bookmark your favourite verses.',
    tip: '💡 Tip: Tap any verse to get an instant AI explanation or add a personal note.',
    highlight: 'BibleReader',
    cta: { label: 'Open Bible', page: 'BibleReader' },
  },
  {
    id: 'search',
    icon: '🔍',
    title: 'Search Everything',
    description: 'Use the powerful search to find scriptures, community posts, study plans, and forum discussions in seconds. Filter by keyword, category, date, and custom tags.',
    tip: '💡 Tip: Press ⌘K (Ctrl+K) anywhere to search the Bible. Press the "All" button for the global search.',
    highlight: null,
    cta: null,
  },
  {
    id: 'ai',
    icon: '✨',
    title: 'AI Content Assistant',
    description: 'Let AI help you draft devotionals, sermons, and study plans. Generate titles, taglines, and keywords for your content automatically.',
    tip: '💡 Tip: Use "Metadata" mode to auto-generate SEO tags, scripture references, and reading time.',
    highlight: null,
    cta: { label: 'Try Ask AI', page: 'AskAI' },
  },
  {
    id: 'community',
    icon: '👥',
    title: 'Connect with the Community',
    description: 'Share posts, join study groups, participate in forum discussions, and send prayer requests to brothers and sisters worldwide.',
    tip: '💡 Tip: Your posts go through a quick review to keep the community safe and edifying.',
    highlight: null,
    cta: { label: 'Explore Community', page: 'Community' },
  },
  {
    id: 'goals',
    icon: '🎯',
    title: 'Set Reading Goals & Earn Badges',
    description: 'Track your Bible reading progress, join weekly challenges, and earn achievement badges as you grow in your faith journey.',
    tip: '💡 Tip: Maintaining a daily reading streak unlocks special milestones.',
    highlight: null,
    cta: { label: 'Set a Goal', page: 'ReadingGoals' },
  },
  {
    id: 'done',
    icon: '🎉',
    title: "You're all set!",
    description: "That's the essentials. FaithLight has much more to discover — live events, audio Bible, mentor connections, and a full learning institute. Explore at your own pace!",
    tip: null,
    highlight: null,
    cta: { label: 'Go to Dashboard', page: 'Home' },
  },
];

export default function OnboardingWalkthrough({ onComplete }) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem(WALKTHROUGH_KEY);
    if (!done) setVisible(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem(WALKTHROUGH_KEY, 'true');
    setVisible(false);
    onComplete?.();
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else dismiss();
  };

  const prev = () => setStep(s => Math.max(0, s - 1));

  if (!visible) return null;

  const current = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div className="h-1 bg-indigo-500 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        <div className="p-6">
          {/* Close */}
          <div className="flex justify-between items-center mb-4">
            <Badge variant="outline" className="text-xs text-gray-500">
              {step + 1} / {STEPS.length}
            </Badge>
            <button onClick={dismiss} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">{current.icon}</div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">{current.title}</h2>
            <p className="text-gray-600 leading-relaxed text-sm">{current.description}</p>
            {current.tip && (
              <div className="mt-3 px-3 py-2 bg-amber-50 border border-amber-100 rounded-lg text-left">
                <p className="text-xs text-amber-800">{current.tip}</p>
              </div>
            )}
          </div>

          {/* Step dots */}
          <div className="flex justify-center gap-1.5 mb-5">
            {STEPS.map((_, i) => (
              <button key={i} onClick={() => setStep(i)}
                className={`rounded-full transition-all ${
                  i === step ? 'w-6 h-2 bg-indigo-500' : i < step ? 'w-2 h-2 bg-indigo-300' : 'w-2 h-2 bg-gray-200'
                }`} />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {step > 0 && (
              <Button variant="outline" size="sm" onClick={prev} className="gap-1">
                <ChevronLeft className="w-4 h-4" /> Back
              </Button>
            )}
            <div className="flex-1 flex gap-2">
              {current.cta && step < STEPS.length - 1 && (
                <Link to={createPageUrl(current.cta.page)} onClick={dismiss} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full text-indigo-600 border-indigo-200 gap-1">
                    {current.cta.label} <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              )}
              <Button onClick={next}
                className={`gap-1.5 ${step === 0 ? 'flex-1' : ''} bg-indigo-600 hover:bg-indigo-700 text-white`}>
                {step === STEPS.length - 1 ? (
                  <><CheckCircle className="w-4 h-4" /> Get Started</>
                ) : (
                  <>Next <ChevronRight className="w-4 h-4" /></>
                )}
              </Button>
            </div>
          </div>

          <button onClick={dismiss} className="mt-3 w-full text-xs text-gray-400 hover:text-gray-600 transition-colors">
            Skip tour
          </button>
        </div>
      </Card>
    </div>
  );
}

/* ── Compact re-launch trigger (for Help button) ── */
export function OnboardingRestartButton() {
  const restart = () => {
    localStorage.removeItem(WALKTHROUGH_KEY);
    window.location.reload();
  };
  return (
    <button onClick={restart} className="text-xs text-indigo-600 hover:text-indigo-800 underline">
      Restart guided tour
    </button>
  );
}