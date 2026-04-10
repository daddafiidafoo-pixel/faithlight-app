import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export default function StruggleAreaDetector({ userId, isDarkMode }) {
  const [detecting, setDetecting] = useState(false);
  const [struggles, setStruggles] = useState([]);
  const [recommendations, setRecommendations] = useState(null);

  const detectStruggles = async () => {
    if (!userId) return;

    setDetecting(true);
    try {
      // Get low-scoring quizzes
      const lowScoreQuizzes = await base44.entities.UserQuizResult.filter(
        { user_id: userId, score: { $lt: 70 } },
        '-created_date',
        15
      );

      // Get incomplete lessons
      const incompleteProgress = await base44.entities.UserProgress.filter(
        { user_id: userId, is_completed: false },
        '-updated_date',
        10
      );

      // Extract topics
      const struggleTopic = lowScoreQuizzes.map(q => ({
        topic: q.topic || 'General',
        score: q.score,
        attempts: q.attempt_count || 1
      }));

      const slowProgress = incompleteProgress.map(p => ({
        lesson: p.lesson_id || 'Unknown',
        timeSpent: p.time_spent_minutes || 0,
        progress: p.progress_percent || 0
      }));

      setStruggles([...struggleTopic, ...slowProgress]);

      // Generate AI-powered recommendations
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze these learner struggles and suggest targeted interventions:

STRUGGLING TOPICS (Quiz Scores < 70%):
${struggleTopic.map(s => `- ${s.topic}: ${s.score}% (${s.attempts} attempts)`).join('\n')}

INCOMPLETE LESSONS:
${slowProgress.map(p => `- ${p.lesson}: ${p.progress}% complete after ${p.timeSpent} minutes`).join('\n')}

Provide JSON with remediation strategies:
{
  "interventions": [
    {
      "area": "topic name",
      "root_cause": "why they're struggling",
      "strategy": "specific intervention",
      "resources": ["resource1", "resource2"]
    }
  ]
}`,
        add_context_from_internet: false,
        response_json_schema: {
          type: 'object',
          properties: {
            interventions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  area: { type: 'string' },
                  root_cause: { type: 'string' },
                  strategy: { type: 'string' },
                  resources: { type: 'array', items: { type: 'string' } }
                }
              }
            }
          }
        }
      });

      setRecommendations(response);
      toast.success('Struggle areas identified!');
    } catch (error) {
      console.error('Error detecting struggles:', error);
      toast.error('Failed to detect struggle areas');
    } finally {
      setDetecting(false);
    }
  };

  const bgColor = isDarkMode ? '#0F1411' : '#FAFAF7';
  const cardColor = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const mutedColor = isDarkMode ? '#A0A0A0' : '#6E6E6E';
  const borderColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';
  const primaryColor = isDarkMode ? '#8FB996' : '#6B8E6E';

  return (
    <Card style={{ backgroundColor: cardColor, borderColor, border: `1px solid ${borderColor}` }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: textColor }}>
          <BookOpen className="w-5 h-5" style={{ color: primaryColor }} />
          Struggle Area Detector
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p style={{ color: mutedColor }} className="text-sm">
          AI identifies topics where you're struggling and recommends targeted help.
        </p>

        <Button
          onClick={detectStruggles}
          disabled={detecting}
          className="w-full gap-2"
          style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
        >
          {detecting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing Struggles...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Identify My Struggles
            </>
          )}
        </Button>

        {struggles.length > 0 && (
          <div className="space-y-2">
            {struggles.slice(0, 5).map((s, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg"
                style={{ backgroundColor: bgColor, borderColor, border: `1px solid ${borderColor}` }}
              >
                <p style={{ color: textColor }} className="font-semibold text-sm">
                  {s.topic || s.lesson}
                </p>
                {s.score && (
                  <p style={{ color: mutedColor }} className="text-xs">
                    Quiz Score: {s.score}%
                  </p>
                )}
                {s.progress !== undefined && (
                  <p style={{ color: mutedColor }} className="text-xs">
                    Progress: {s.progress}%
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {recommendations && (
          <div className="space-y-3">
            <p style={{ color: textColor }} className="font-semibold">
              Personalized Interventions
            </p>
            {recommendations.interventions?.slice(0, 3).map((intervention, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg"
                style={{ backgroundColor: bgColor, borderColor, border: `1px solid ${borderColor}` }}
              >
                <p style={{ color: primaryColor }} className="font-semibold text-sm mb-1">
                  {intervention.area}
                </p>
                <p style={{ color: mutedColor }} className="text-xs mb-2">
                  <strong>Why:</strong> {intervention.root_cause}
                </p>
                <p style={{ color: textColor }} className="text-xs mb-2">
                  <strong>Strategy:</strong> {intervention.strategy}
                </p>
                {intervention.resources && intervention.resources.length > 0 && (
                  <p style={{ color: mutedColor }} className="text-xs">
                    <strong>Resources:</strong> {intervention.resources.slice(0, 2).join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}