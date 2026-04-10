import React, { useState } from 'react';
import { Sparkles, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useI18n } from '../I18nProvider';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function AskTheBibleCard() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');

  const handleAsk = () => {
    navigate(createPageUrl('AIBibleCompanion'), { 
      state: { initialQuestion: question }
    });
  };

  const suggestedQuestions = [
    t('bible.what_fear', 'What does the Bible say about fear?'),
    t('bible.forgiveness', 'Explain forgiveness in Scripture'),
    t('bible.faith', 'How do I strengthen my faith?'),
  ];

  return (
    <Card className="shadow-sm border-indigo-200 bg-gradient-to-br from-indigo-100 via-indigo-50 to-white">
      <CardContent className="pt-6 pb-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
            {t('bible.companion_title', 'AI Bible Companion')}
          </p>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
            placeholder={t('bible.ask_placeholder', 'What does Romans 8:28 mean?')}
            className="w-full px-4 py-2.5 border border-indigo-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />

          <Button
            onClick={handleAsk}
            disabled={!question.trim()}
            className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700"
          >
            {t('bible.ask_button', 'Ask AI')}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="pt-2 border-t border-indigo-200">
          <p className="text-xs font-semibold text-gray-600 mb-2">
            {t('bible.suggestions', 'Try asking:')}
          </p>
          <div className="space-y-1.5">
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuestion(q);
                  // Auto-submit after setting state
                  setTimeout(() => handleAsk(), 0);
                }}
                className="w-full text-left text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 p-2 rounded transition-colors"
              >
                → {q}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}