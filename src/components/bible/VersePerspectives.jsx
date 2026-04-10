import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Lightbulb } from 'lucide-react';

const PERSPECTIVES = [
  { id: 'reformed', name: 'Reformed Theology', description: 'Focus on God\'s sovereignty and election' },
  { id: 'armenian', name: 'Arminian Theology', description: 'Emphasis on human free will and choice' },
  { id: 'pentecostal', name: 'Pentecostal/Charismatic', description: 'Focus on Spirit\'s work and gifts' },
  { id: 'catholic', name: 'Catholic Theology', description: 'Sacramental and church tradition emphasis' },
  { id: 'progressive', name: 'Progressive Christianity', description: 'Modern, contextual interpretation' },
  { id: 'evangelical', name: 'Evangelical', description: 'Scripture-centered, salvation-focused' }
];

export default function VersePerspectives({ verseReference, verseText, isDarkMode }) {
  const [perspectives, setPerspectives] = useState({});
  const [selectedPerspectives, setSelectedPerspectives] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const generatePerspectives = useMutation({
    mutationFn: async () => {
      setIsLoading(true);
      const perspectivesToAnalyze = selectedPerspectives.length > 0
        ? PERSPECTIVES.filter(p => selectedPerspectives.includes(p.id))
        : PERSPECTIVES;

      try {
        const response = await base44.integrations.Core.InvokeLLM({
          prompt: `Analyze this Bible verse from multiple theological perspectives:

Verse: ${verseReference}
Text: "${verseText}"

Provide brief interpretations (2-3 sentences each) from these perspectives:
${perspectivesToAnalyze.map(p => `- ${p.name}: ${p.description}`).join('\n')}

Format as a JSON object with keys matching the perspective names (use lowercase with underscores).`,
          response_json_schema: {
            type: 'object',
            additionalProperties: { type: 'string' }
          },
          add_context_from_internet: true
        });

        setPerspectives(response);
        setIsLoading(false);
      } catch (error) {
        console.error('Error generating perspectives:', error);
        setIsLoading(false);
      }
    }
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Lightbulb className="w-4 h-4" />
          Perspectives
        </Button>
      </DialogTrigger>
      <DialogContent style={{
        backgroundColor: isDarkMode ? '#1A1F1C' : '#FFFFFF'
      }} className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Theological Perspectives on {verseReference}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!isLoading && Object.keys(perspectives).length === 0 ? (
            <>
              <p className="text-sm text-gray-600">Select perspectives to explore:</p>
              <div className="grid grid-cols-2 gap-2">
                {PERSPECTIVES.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPerspectives(
                      selectedPerspectives.includes(p.id)
                        ? selectedPerspectives.filter(id => id !== p.id)
                        : [...selectedPerspectives, p.id]
                    )}
                    className={`p-2 rounded border text-left text-xs transition ${
                      selectedPerspectives.includes(p.id)
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-gray-600">{p.description}</p>
                  </button>
                ))}
              </div>

              <Button
                onClick={() => generatePerspectives.mutate()}
                disabled={selectedPerspectives.length === 0 || isLoading}
                className="w-full gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze Perspectives'
                )}
              </Button>
            </>
          ) : (
            <div className="space-y-3">
              {Object.entries(perspectives).map(([key, interpretation]) => (
                <Card key={key}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm capitalize">
                      {key.replace(/_/g, ' ')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-gray-700 leading-relaxed">{interpretation}</p>
                  </CardContent>
                </Card>
              ))}

              <Button
                variant="outline"
                onClick={() => {
                  setPerspectives({});
                  setSelectedPerspectives([]);
                }}
                className="w-full"
              >
                Explore Other Perspectives
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}