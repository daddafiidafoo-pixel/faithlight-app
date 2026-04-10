import React, { useState, useEffect } from 'react';
import { X, BookOpen, Sparkles, Users } from 'lucide-react';

export default function FirstTimeOnboarding({ onDismiss }) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to FaithLight',
      description: 'Your personal Bible study companion',
      icon: BookOpen,
      color: '#8B5CF6',
    },
    {
      title: 'Explain Scripture',
      description: 'Get AI-powered insights on any Bible verse',
      icon: Sparkles,
      color: '#D97706',
    },
    {
      title: 'Study Plans',
      description: 'Follow structured readings on topics you care about',
      icon: BookOpen,
      color: '#0284C7',
    },
  ];

  const currentStep = steps[step];
  const Icon = currentStep.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onDismiss}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-sm mx-4 p-8 flex flex-col items-center text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
          style={{ backgroundColor: `${currentStep.color}15` }}
        >
          <Icon className="w-8 h-8" style={{ color: currentStep.color }} />
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-3">{currentStep.title}</h2>
        <p className="text-sm text-slate-600 mb-8">{currentStep.description}</p>

        <div className="flex gap-2 mb-6">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i === step ? 'w-8 bg-purple-600' : 'w-2 bg-slate-300'
              }`}
            />
          ))}
        </div>

        <div className="flex gap-3 w-full">
          <button
            onClick={onDismiss}
            className="flex-1 px-4 py-3 rounded-lg text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            Skip
          </button>
          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex-1 px-4 py-3 rounded-lg text-sm font-semibold bg-purple-600 text-white hover:bg-purple-700"
            >
              Next
            </button>
          ) : (
            <button
              onClick={onDismiss}
              className="flex-1 px-4 py-3 rounded-lg text-sm font-semibold bg-purple-600 text-white hover:bg-purple-700"
            >
              Get Started
            </button>
          )}
        </div>
      </div>
    </div>
  );
}