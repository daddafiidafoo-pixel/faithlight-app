import React from 'react';
import { BookOpen, Award, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function QuizCard({ quiz, onStart, isCompleted }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">{quiz.book_name}</h3>
            <p className="text-xs text-slate-500">{quiz.topic || 'General Knowledge'}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          quiz.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
          quiz.difficulty === 'medium' ? 'bg-amber-100 text-amber-700' :
          'bg-red-100 text-red-700'
        }`}>
          {quiz.difficulty}
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-600 mb-4">
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {quiz.questions?.length || 0} questions
        </div>
        <div className="flex items-center gap-1">
          <Award className="w-3.5 h-3.5" />
          {quiz.points_reward || 100} pts
        </div>
      </div>

      <Button
        onClick={() => onStart(quiz)}
        variant={isCompleted ? "outline" : "default"}
        className="w-full"
      >
        {isCompleted ? 'Retake Quiz' : 'Start Quiz'}
      </Button>
    </div>
  );
}