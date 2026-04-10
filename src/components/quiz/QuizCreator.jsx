import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X, Plus, Trash2 } from 'lucide-react';

export default function QuizCreator({ sessionId, onSubmit, onCancel, isLoading }) {
  const [question, setQuestion] = useState('');
  const [choices, setChoices] = useState(['', '', '']);
  const [correctIndex, setCorrectIndex] = useState(0);

  const handleAddChoice = () => {
    setChoices([...choices, '']);
  };

  const handleRemoveChoice = (idx) => {
    const newChoices = choices.filter((_, i) => i !== idx);
    setChoices(newChoices);
    if (correctIndex >= newChoices.length) {
      setCorrectIndex(newChoices.length - 1);
    }
  };

  const handleSubmit = () => {
    if (!question.trim() || choices.some(c => !c.trim())) {
      alert('Please fill in all fields');
      return;
    }

    onSubmit({
      sessionId,
      pastorId: localStorage.getItem('userEmail'),
      question,
      choices: choices.filter(c => c.trim()),
      correctIndex,
      status: 'live'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Create Quick Question</h2>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Question */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Question
            </label>
            <Textarea
              placeholder="Enter your question…"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Choices */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Answer Choices
            </label>
            <div className="space-y-2">
              {choices.map((choice, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="radio"
                    name="correct"
                    checked={correctIndex === idx}
                    onChange={() => setCorrectIndex(idx)}
                    className="w-4 h-4"
                    title="Mark correct answer"
                  />
                  <Input
                    placeholder={`Choice ${String.fromCharCode(65 + idx)}`}
                    value={choice}
                    onChange={(e) => {
                      const newChoices = [...choices];
                      newChoices[idx] = e.target.value;
                      setChoices(newChoices);
                    }}
                    className="flex-1"
                  />
                  {choices.length > 2 && (
                    <button
                      onClick={() => handleRemoveChoice(idx)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {choices.length < 4 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddChoice}
                className="mt-2 gap-1"
              >
                <Plus className="w-3 h-3" /> Add Choice
              </Button>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isLoading ? 'Launching...' : 'Launch Question'}
          </Button>
        </div>
      </div>
    </div>
  );
}