import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, Loader2, CheckCircle2, XCircle, RotateCcw, Trophy } from 'lucide-react';

export default function PassageQuiz({ book, chapter, verse }) {
  const [questions, setQuestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const passage = `${book} ${chapter}${verse ? ':' + verse : ''}`;

  const generate = async () => {
    if (!book || !chapter) { setError('Please select a book and chapter first.'); return; }
    setLoading(true);
    setError('');
    setQuestions(null);
    setAnswers({});
    setSubmitted(false);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 5 multiple-choice Bible knowledge questions based on ${passage}. Each question should test understanding of the passage's content, meaning, or theological significance.`,
        response_json_schema: {
          type: 'object',
          properties: {
            passage: { type: 'string' },
            questions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  question: { type: 'string' },
                  options: { type: 'array', items: { type: 'string' } },
                  correct: { type: 'number', description: '0-based index of correct option' },
                  explanation: { type: 'string' },
                }
              }
            }
          }
        }
      });
      setQuestions(res.questions || []);
    } catch {
      setError('Could not generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (qId, optIdx) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qId]: optIdx }));
  };

  const score = submitted && questions
    ? questions.filter(q => answers[q.id] === q.correct).length
    : 0;

  const allAnswered = questions && Object.keys(answers).length === questions.length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-800 text-base">Passage Quiz</h3>
          <p className="text-xs text-gray-500">Test your knowledge of {passage}</p>
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-sm font-semibold transition"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? 'Generating…' : questions ? 'New Quiz' : 'Generate Quiz'}
        </button>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-2">{error}</p>}

      {/* Score banner */}
      {submitted && (
        <div className={`flex items-center gap-3 rounded-2xl px-5 py-4 font-bold text-lg shadow-sm ${
          score === questions.length ? 'bg-green-50 text-green-700 border border-green-200'
          : score >= questions.length / 2 ? 'bg-amber-50 text-amber-700 border border-amber-200'
          : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          <Trophy className="w-6 h-6" />
          {score} / {questions.length} correct
          <span className="text-sm font-normal ml-1">
            {score === questions.length ? '🎉 Perfect!' : score >= questions.length / 2 ? '👍 Good effort!' : '📖 Keep studying!'}
          </span>
          <button onClick={() => { setAnswers({}); setSubmitted(false); }} className="ml-auto text-sm font-semibold flex items-center gap-1 opacity-70 hover:opacity-100">
            <RotateCcw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      {/* Questions */}
      {questions && (
        <div className="space-y-5">
          {questions.map((q, qi) => {
            const userAns = answers[q.id];
            const isCorrect = userAns === q.correct;
            return (
              <div key={q.id} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                <p className="font-semibold text-gray-800 text-sm mb-3">
                  <span className="text-indigo-500 mr-1">{qi + 1}.</span> {q.question}
                </p>
                <div className="space-y-2">
                  {q.options.map((opt, oi) => {
                    let cls = 'border border-gray-200 text-gray-700 hover:border-indigo-400 hover:bg-indigo-50';
                    if (submitted) {
                      if (oi === q.correct) cls = 'border-green-400 bg-green-50 text-green-800';
                      else if (oi === userAns && !isCorrect) cls = 'border-red-400 bg-red-50 text-red-700';
                      else cls = 'border-gray-100 text-gray-400';
                    } else if (userAns === oi) {
                      cls = 'border-indigo-500 bg-indigo-50 text-indigo-800';
                    }
                    return (
                      <button
                        key={oi}
                        onClick={() => handleAnswer(q.id, oi)}
                        disabled={submitted}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2 ${cls}`}
                      >
                        <span className="w-5 h-5 rounded-full border border-current flex-shrink-0 flex items-center justify-center text-xs font-bold">
                          {String.fromCharCode(65 + oi)}
                        </span>
                        {opt}
                        {submitted && oi === q.correct && <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto" />}
                        {submitted && oi === userAns && !isCorrect && <XCircle className="w-4 h-4 text-red-500 ml-auto" />}
                      </button>
                    );
                  })}
                </div>
                {submitted && q.explanation && (
                  <p className="mt-3 text-xs text-gray-600 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100 italic">
                    💡 {q.explanation}
                  </p>
                )}
              </div>
            );
          })}

          {!submitted && (
            <button
              onClick={() => setSubmitted(true)}
              disabled={!allAnswered}
              className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold transition"
            >
              {allAnswered ? 'Submit Answers' : `Answer all questions (${Object.keys(answers).length}/${questions.length})`}
            </button>
          )}
        </div>
      )}

      {!questions && !loading && (
        <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-2xl">
          <Sparkles className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          Click "Generate Quiz" to test your knowledge of this passage
        </div>
      )}
    </div>
  );
}