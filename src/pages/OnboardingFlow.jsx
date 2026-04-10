import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const SLIDES = [
  {
    emoji: '📖',
    illustration: '✦ 🌟 ✦',
    title: 'Read & Understand the Bible',
    description: 'Explore Scripture every day with guided reading plans and clear explanations.',
    bg: 'from-indigo-600 via-violet-600 to-purple-700',
  },
  {
    emoji: '🙏',
    illustration: '🕊️',
    title: 'Track Your Prayers',
    description: 'Keep a personal prayer journal and grow spiritually one day at a time.',
    bg: 'from-rose-500 via-pink-600 to-rose-700',
  },
  {
    emoji: '✨',
    illustration: '🤖',
    title: 'AI Bible Study Tools',
    description: 'Ask any Bible question and get Scripture-grounded answers instantly.',
    bg: 'from-amber-500 via-orange-500 to-amber-600',
    isLast: true,
  },
];

export default function OnboardingFlow() {
  const [slide, setSlide] = useState(0);
  const navigate = useNavigate();
  const current = SLIDES[slide];

  const finish = () => {
    localStorage.setItem('fl_onboarding_done', '1');
    navigate('/Home', { replace: true });
  };

  return (
    <div className={`fixed inset-0 flex flex-col bg-gradient-to-br ${current.bg} transition-all duration-500`}>
      {/* Skip */}
      {!current.isLast && (
        <button
          onClick={finish}
          className="absolute top-12 right-6 text-white/60 text-sm font-medium z-10"
          aria-label="Skip onboarding"
        >
          Skip
        </button>
      )}

      {/* Slide dots */}
      <div className="absolute top-14 left-0 right-0 flex justify-center gap-2 z-10">
        {SLIDES.map((_, i) => (
          <div
            key={i}
            className={`rounded-full transition-all duration-300 ${i === slide ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/40'}`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        {/* Illustration area */}
        <div className="w-48 h-48 bg-white/15 rounded-full flex flex-col items-center justify-center mb-10 shadow-2xl backdrop-blur-sm">
          <span className="text-7xl leading-none">{current.emoji}</span>
          <span className="text-white/50 text-lg mt-2">{current.illustration}</span>
        </div>

        <h2 className="text-3xl font-bold text-white leading-tight mb-4">{current.title}</h2>
        <p className="text-white/80 text-base leading-relaxed max-w-xs">{current.description}</p>
      </div>

      {/* Actions */}
      <div className="px-8 pb-16 flex flex-col gap-3">
        {current.isLast ? (
          <>
            <button
              onClick={finish}
              className="w-full py-4 bg-white text-amber-600 font-bold text-lg rounded-2xl shadow-lg active:scale-[0.98] transition-transform"
            >
              Get Started
            </button>
          </>
        ) : (
          <button
            onClick={() => setSlide(s => s + 1)}
            className="w-full py-4 bg-white/20 border border-white/30 text-white font-bold text-lg rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            Next <ChevronRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
}