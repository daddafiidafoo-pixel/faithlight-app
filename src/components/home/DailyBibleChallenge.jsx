import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, CheckCircle2, XCircle, Loader2, Trophy, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const SEED_QUESTIONS = [
  { question: "How many books are in the Bible?", options: ["60", "66", "72", "80"], answer: 1, explanation: "The Bible has 66 books: 39 in the Old Testament and 27 in the New Testament." },
  { question: "Who wrote the book of Psalms primarily?", options: ["Moses", "Solomon", "David", "Isaiah"], answer: 2, explanation: "David wrote approximately half of the 150 Psalms, making him the primary author." },
  { question: "What is the shortest verse in the Bible?", options: ["John 1:1", "John 11:35", "Gen 1:1", "Ps 100:1"], answer: 1, explanation: "\"Jesus wept\" (John 11:35) is the shortest verse in the English Bible." },
  { question: "Which disciple denied Jesus three times?", options: ["John", "James", "Peter", "Andrew"], answer: 2, explanation: "Peter denied knowing Jesus three times before the rooster crowed, as Jesus had predicted." },
  { question: "What is the first book of the New Testament?", options: ["Mark", "Luke", "Matthew", "Acts"], answer: 2, explanation: "Matthew is the first book of the New Testament, bridging the Old and New Testaments." },
  { question: "Who was the first king of Israel?", options: ["David", "Solomon", "Saul", "Samuel"], answer: 2, explanation: "Saul was anointed as the first king of Israel by the prophet Samuel." },
  { question: "In what city was Jesus born?", options: ["Jerusalem", "Nazareth", "Bethlehem", "Jericho"], answer: 2, explanation: "Jesus was born in Bethlehem, fulfilling the prophecy of Micah 5:2." },
];

function getTodayQuestion() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return SEED_QUESTIONS[dayOfYear % SEED_QUESTIONS.length];
}

export default function DailyBibleChallenge({ user }) {
  const queryClient = useQueryClient();
  const todayKey = new Date().toISOString().slice(0, 10);
  const localStorageKey = `daily_challenge_${user?.id}_${todayKey}`;

  const [selected, setSelected] = useState(() => {
    const stored = localStorage.getItem(localStorageKey);
    return stored !== null ? parseInt(stored) : null;
  });
  const [showResult, setShowResult] = useState(selected !== null);
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiQuestion, setAiQuestion] = useState(null);
  const [useAI, setUseAI] = useState(false);

  const question = useAI && aiQuestion ? aiQuestion : getTodayQuestion();
  const isAnswered = selected !== null;
  const isCorrect = isAnswered && selected === question.answer;

  const handleAnswer = (idx) => {
    if (isAnswered) return;
    setSelected(idx);
    setShowResult(true);
    localStorage.setItem(localStorageKey, String(idx));

    // Award points if correct
    if (idx === question.answer && user) {
      base44.entities.UserPoints.filter({ user_id: user.id }, '-updated_date', 1).catch(() => []).then(records => {
        if (records[0]) {
          base44.entities.UserPoints.update(records[0].id, {
            total_points: (records[0].total_points || 0) + 10,
            points_this_week: (records[0].points_this_week || 0) + 10,
            points_this_month: (records[0].points_this_month || 0) + 10,
          }).catch(() => {});
        }
      }).catch(() => {});
      toast.success('🎉 +10 points for correct answer!');
    }
  };

  const loadAIChallenge = async () => {
    setIsAILoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a Bible knowledge quiz question (medium difficulty). Return JSON with: question (string), options (array of 4 strings), answer (0-indexed integer of correct option), explanation (1-2 sentences).`,
        response_json_schema: {
          type: 'object',
          properties: {
            question: { type: 'string' },
            options: { type: 'array', items: { type: 'string' } },
            answer: { type: 'number' },
            explanation: { type: 'string' },
          }
        }
      });
      setAiQuestion(result);
      setUseAI(true);
      setSelected(null);
      setShowResult(false);
    } catch {
      toast.error('Could not load AI question');
    }
    setIsAILoading(false);
  };

  return (
    <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden">
      <CardContent className="pt-5 pb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-500 rounded-lg">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Daily Bible Challenge</h3>
              <p className="text-xs text-gray-500">+10 pts for correct answer</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAnswered && isCorrect && (
              <Badge className="bg-green-100 text-green-800 text-xs gap-1">
                <Trophy className="w-3 h-3" /> Correct!
              </Badge>
            )}
            {isAnswered && !isCorrect && (
              <Badge className="bg-red-100 text-red-800 text-xs">Try again tomorrow</Badge>
            )}
            <Button variant="ghost" size="sm" onClick={loadAIChallenge} disabled={isAILoading}
              className="gap-1 text-xs text-amber-700 hover:bg-amber-100 h-7 px-2">
              {isAILoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              {isAILoading ? '' : 'New'}
            </Button>
          </div>
        </div>

        <p className="font-semibold text-gray-900 text-sm mb-3">{question.question}</p>

        <div className="grid grid-cols-2 gap-2 mb-3">
          {question.options.map((opt, idx) => {
            let style = 'border-gray-200 bg-white text-gray-700 hover:border-amber-400 hover:bg-amber-50';
            if (isAnswered) {
              if (idx === question.answer) style = 'border-green-500 bg-green-50 text-green-800';
              else if (idx === selected && idx !== question.answer) style = 'border-red-400 bg-red-50 text-red-800';
              else style = 'border-gray-200 bg-white text-gray-400 opacity-60';
            }
            return (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={isAnswered}
                className={`text-xs font-medium px-3 py-2 rounded-lg border-2 transition-all text-left ${style} ${!isAnswered ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <span className="font-bold mr-1.5 text-gray-500">{['A','B','C','D'][idx]}.</span>
                {opt}
              </button>
            );
          })}
        </div>

        {showResult && question.explanation && (
          <div className={`text-xs p-3 rounded-lg flex gap-2 items-start ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-900'}`}>
            {isCorrect ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" /> : <XCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />}
            {question.explanation}
          </div>
        )}
      </CardContent>
    </Card>
  );
}