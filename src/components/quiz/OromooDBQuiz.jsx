import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, ArrowRight, ArrowLeft, RotateCw, Loader2 } from 'lucide-react';

const DIFFICULTY_LABELS = { beginner: 'Jalqabaa', intermediate: 'Giddu-galeessa', advanced: 'Olaanaa' };
const DIFFICULTY_OPTIONS = [
  { value: 'all', label: 'Hundasaas' },
  { value: 'beginner', label: 'Jalqabaa' },
  { value: 'intermediate', label: 'Giddu-galeessa' },
  { value: 'advanced', label: 'Olaanaa' },
];

export default function OromooDBQuiz() {
  const [difficulty, setDifficulty] = useState('all');
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const { data: allQuestions = [], isLoading } = useQuery({
    queryKey: ['om-quiz-questions'],
    queryFn: () => base44.entities.QuizQuestion.filter({ language_code: 'om' }, 'order_index', 200).catch(() => []),
    staleTime: 1000 * 60 * 10,
    retry: false,
  });

  const questions = difficulty === 'all'
    ? allQuestions
    : allQuestions.filter(q => q.difficulty === difficulty);

  // Shuffle + cap at 10
  const activeQuestions = React.useMemo(() => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, questions.length, difficulty]);

  const reset = () => {
    setCurrent(0);
    setAnswers({});
    setShowResults(false);
    setStarted(false);
  };

  const start = () => {
    setCurrent(0);
    setAnswers({});
    setShowResults(false);
    setStarted(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mr-2" />
        <span className="text-gray-500 text-sm">Fe'amaa jira…</span>
      </div>
    );
  }

  if (allQuestions.length === 0) {
    return (
      <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-2xl">
        <p className="font-semibold text-gray-700">Afaan kanaan qormaanni hin jiruu</p>
        <p className="text-sm text-gray-500 mt-1">Ammaaf gaaffileen Afaan Oromoo hin argamne.</p>
      </div>
    );
  }

  // Setup screen
  if (!started) {
    return (
      <div className="space-y-5">
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Rakkina filadhu</p>
          <div className="flex flex-wrap gap-2">
            {DIFFICULTY_OPTIONS.map(d => (
              <button
                key={d.value}
                type="button"
                onClick={() => setDifficulty(d.value)}
                className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                  difficulty === d.value
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 text-gray-600 hover:border-indigo-200'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Gaaffilee {Math.min(10, questions.length)} irraa {questions.length} argaman ni dhiheessinaf.
          </p>
        </div>
        <Button
          onClick={start}
          disabled={questions.length === 0}
          className="w-full bg-indigo-600 hover:bg-indigo-700 py-5 text-base gap-2"
        >
          Qormaata jalqabi <ArrowRight className="w-4 h-4" />
        </Button>
        {questions.length === 0 && (
          <p className="text-sm text-center text-amber-600">Filannoo kanaan gaaffii hin jiru.</p>
        )}
      </div>
    );
  }

  const q = activeQuestions[current];

  // Results screen
  if (showResults) {
    const correct = activeQuestions.filter((q, i) => answers[i] === q.correct_answer).length;
    const pct = Math.round((correct / activeQuestions.length) * 100);
    return (
      <div className="space-y-5">
        <Card className={`border-2 text-center ${pct >= 80 ? 'border-green-400 bg-green-50' : pct >= 50 ? 'border-amber-400 bg-amber-50' : 'border-red-300 bg-red-50'}`}>
          <CardContent className="pt-6 pb-6">
            <div className={`text-6xl font-black mb-2 ${pct >= 80 ? 'text-green-600' : pct >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{pct}%</div>
            <p className="text-gray-700">{correct} / {activeQuestions.length} sirrii</p>
            <p className="text-2xl mt-2">{pct >= 80 ? '🎉 Sirrii!' : pct >= 50 ? '👍 Carraaqqii gaarii!' : '📖 Irra deebi\'ii yaali'}</p>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {activeQuestions.map((q, i) => {
            const isCorrect = answers[i] === q.correct_answer;
            return (
              <Card key={i} className={`border ${isCorrect ? 'border-green-200' : 'border-red-200'}`}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-3">
                    {isCorrect
                      ? <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      : <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />}
                    <div className="flex-1 space-y-1.5">
                      <p className="font-medium text-gray-900 text-sm">{i + 1}. {q.question}</p>
                      <p className="text-sm text-green-700">✓ {q.options[q.correct_answer]}</p>
                      {!isCorrect && answers[i] !== undefined && (
                        <p className="text-sm text-red-600">✗ Deebii kee: {q.options[answers[i]]}</p>
                      )}
                      {q.explanation && (
                        <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2">{q.explanation}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex gap-3">
          <Button onClick={start} className="flex-1 bg-indigo-600 hover:bg-indigo-700 gap-2">
            <RotateCw className="w-4 h-4" /> Irra deebi'ii yaali
          </Button>
          <Button onClick={reset} variant="outline" className="gap-2">
            Deebi'i
          </Button>
        </div>
      </div>
    );
  }

  // Active quiz
  const selected = answers[current];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Gaaffii {current + 1} / {activeQuestions.length}</p>
        <div className="flex items-center gap-2">
          {q.difficulty && <Badge variant="outline" className="text-xs">{DIFFICULTY_LABELS[q.difficulty] || q.difficulty}</Badge>}
          {q.category && <Badge className="bg-indigo-100 text-indigo-700 text-xs">{q.category}</Badge>}
        </div>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-2">
        <div className="h-2 rounded-full bg-indigo-600 transition-all" style={{ width: `${((current + 1) / activeQuestions.length) * 100}%` }} />
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-900 leading-snug">{q.question}</h2>
          <div className="space-y-2.5">
            {(q.options || []).map((opt, idx) => (
              <button
                key={idx}
                onClick={() => setAnswers({ ...answers, [current]: idx })}
                className={`w-full p-3.5 text-left border-2 rounded-xl transition-all text-sm ${
                  selected === idx
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/30'
                }`}
              >
                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mr-2 ${
                  selected === idx ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}>{String.fromCharCode(65 + idx)}</span>
                {opt}
              </button>
            ))}
          </div>
          <div className="flex gap-3 pt-1">
            <Button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0} variant="outline" size="sm" className="gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Deebi'i
            </Button>
            <Button
              onClick={() => {
                if (current < activeQuestions.length - 1) setCurrent(c => c + 1);
                else setShowResults(true);
              }}
              disabled={selected === undefined}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 gap-2 text-sm"
            >
              {current === activeQuestions.length - 1 ? 'Xumuri' : 'Itti aanuu'}
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}