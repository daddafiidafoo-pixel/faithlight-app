import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, HelpCircle } from 'lucide-react';

export default function PassageExplainer({ verseReference, verseText, isDarkMode }) {
  const [explanation, setExplanation] = useState('');
  const [explainType, setExplainType] = useState('');

  const explainPassage = useMutation({
    mutationFn: async (type) => {
      setExplainType(type);

      const prompts = {
        simple: `Explain this Bible verse in simple, everyday language that anyone can understand:

Verse: ${verseReference}
Text: "${verseText}"

Focus on: What does this verse mean? What is it saying?`,

        historical: `Provide historical and cultural context for this Bible verse:

Verse: ${verseReference}
Text: "${verseText}"

Include: The historical period, cultural customs, geographical context, and why understanding this context matters.`,

        theological: `Explain the theological significance of this verse:

Verse: ${verseReference}
Text: "${verseText}"

Cover: What theological truths does it teach? How does it fit into God's bigger story? What can we learn about God's character?`,

        practical: `Explain how this Bible verse applies to modern life:

Verse: ${verseReference}
Text: "${verseText}"

Include: What does it mean for us today? How should this verse change our thinking or behavior? Provide practical examples.`
      };

      try {
        const response = await base44.integrations.Core.InvokeLLM({
          prompt: prompts[type] || prompts.simple,
          add_context_from_internet: true
        });

        setExplanation(response);
      } catch (error) {
        console.error('Error explaining passage:', error);
        setExplanation('Unable to generate explanation. Please try again.');
      }
    }
  });

  const explanationTypes = [
    { key: 'simple', label: 'Simple Explanation', icon: '📖' },
    { key: 'historical', label: 'Historical Context', icon: '🏛️' },
    { key: 'theological', label: 'Theological Meaning', icon: '⛪' },
    { key: 'practical', label: 'Practical Application', icon: '💡' }
  ];

  return (
    <Card style={{
      backgroundColor: isDarkMode ? '#1A1F1C' : '#FFFFFF',
      borderColor: isDarkMode ? '#2A2F2C' : '#E5E7EB'
    }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <HelpCircle className="w-5 h-5 text-blue-500" />
          Passage Explanation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!explanation ? (
          <>
            <p className="text-sm text-gray-600">{verseReference}</p>
            <p className="text-sm italic text-gray-700">"{verseText}"</p>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-600">How would you like this explained?</p>
              <div className="grid grid-cols-2 gap-2">
                {explanationTypes.map(type => (
                  <Button
                    key={type.key}
                    variant="outline"
                    size="sm"
                    onClick={() => explainPassage.mutate(type.key)}
                    disabled={explainPassage.isPending}
                    className="text-xs h-auto py-2"
                  >
                    <span className="mr-1">{type.icon}</span>
                    <span>{type.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
              {explanation}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExplanation('')}
              className="w-full"
            >
              Different Explanation
            </Button>
          </div>
        )}

        {explainPassage.isPending && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating explanation...
          </div>
        )}
      </CardContent>
    </Card>
  );
}