import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if onboarding has been seen
    const seen = localStorage.getItem('fl_onboarding_done');
    const timer = setTimeout(() => {
      navigate(seen ? '/Home' : '/OnboardingFlow', { replace: true });
    }, 2200);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-700 via-violet-700 to-purple-800">
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-24 translate-x-24 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-16 -translate-x-16 pointer-events-none" />

      <div className="relative flex flex-col items-center gap-5">
        {/* Logo */}
        <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center shadow-2xl backdrop-blur-sm">
          <span className="text-5xl">✝</span>
        </div>

        <div className="text-center">
          <h1 className="text-4xl font-bold text-white tracking-tight">FaithLight</h1>
          <p className="text-indigo-200 text-base mt-2 font-medium">Grow in faith daily</p>
        </div>

        {/* Loading indicator */}
        <div className="mt-8 flex items-center gap-2">
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}