import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function QuizQuestion({ question, onAnswer, answered, selectedAnswer }) {
  return (
    <div className="card p-6 rounded-xl mb-6">
      <h3 className="text-lg font-bold text-slate-900 mb-6">{question.question}</h3>

      <div className="space-y-3">
        {question.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => !answered && onAnswer(idx)}
            disabled={answered}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
              selectedAnswer === idx
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-slate-200 bg-white hover:border-slate-400'
            } ${answered ? 'opacity-75' : ''}`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selectedAnswer === idx
                  ? 'border-indigo-600 bg-indigo-600'
                  : 'border-slate-300'
              }`}>
                {selectedAnswer === idx && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
              <span className="text-slate-900">{option}</span>
            </div>
          </button>
        ))}
      </div>

      {answered && (
        <div className={`mt-6 p-4 rounded-lg ${
          selectedAnswer === question.correct
            ? 'bg-green-50 border border-green-200'
            : 'bg-red-50 border border-red-200'
        }`}>
          <p className={`text-sm font-semibold ${
            selectedAnswer === question.correct ? 'text-green-700' : 'text-red-700'
          }`}>
            {selectedAnswer === question.correct ? '✓ Correct!' : '✗ Incorrect'}
          </p>
          <p className="text-sm text-slate-700 mt-2">{question.explanation}</p>
        </div>
      )}
    </div>
  );
}