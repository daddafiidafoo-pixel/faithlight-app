import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Users, MessageCircle, Loader2, ChevronRight, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { useQuery } from '@tanstack/react-query';

export default function AIGroupSuggester({ user }) {
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);

  const { data: readingHistory = [] } = useQuery({
    queryKey: ['reading-history-suggest', user?.id],
    queryFn: () => base44.entities.ReadingHistory.filter({ user_id: user.id }, '-updated_date', 10).catch(() => []),
    enabled: !!user?.id,
    retry: false,
  });

  const { data: userPoints } = useQuery({
    queryKey: ['user-points-suggest', user?.id],
    queryFn: () => base44.entities.UserPoints.filter({ user_id: user.id }, null, 1).then(r => r?.[0]).catch(() => null),
    enabled: !!user?.id,
    retry: false,
  });

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      const books = [...new Set(readingHistory.map(r => r.book).filter(Boolean))].slice(0, 5);
      const pts = userPoints?.total_points || 0;
      const chapters = userPoints?.chapters_read || 0;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a community AI for a Bible study platform called FaithLight. Generate 3 personalized Bible study group suggestions for a user.

User profile:
- Books recently read: ${books.join(', ') || 'Not specified'}
- Total points: ${pts}
- Chapters read: ${chapters}
- Interests: ${user?.interests?.join(', ') || 'General Bible Study'}

For each suggestion provide:
1. A creative group name (faith-themed)
2. A brief description (1 sentence)
3. 2-3 relevant tags
4. An opening discussion topic

Return as JSON.`,
        response_json_schema: {
          type: 'object',
          properties: {
            groups: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' },
                  tags: { type: 'array', items: { type: 'string' } },
                  opening_topic: { type: 'string' },
                },
              },
            },
          },
        },
      });
      setSuggestions(result?.groups || []);
    } catch {
      setSuggestions([
        { name: 'Psalms & Praise Circle', description: 'Dive deep into the Psalms and explore worship through Scripture.', tags: ['Psalms', 'Worship', 'Prayer'], opening_topic: 'What Psalm has moved you most recently?' },
        { name: 'New Testament Explorers', description: 'Journey through the Gospels and Epistles together.', tags: ['NT', 'Gospels', 'Paul'], opening_topic: 'How does the Sermon on the Mount apply to your daily life?' },
        { name: 'Wisdom Seekers', description: 'Study Proverbs, Ecclesiastes, and James for practical faith.', tags: ['Wisdom', 'Proverbs', 'James'], opening_topic: 'Share a proverb that changed how you think.' },
      ]);
    }
    setLoading(false);
  };

  return (
    <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50">
      <CardContent className="pt-5 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-gray-900">AI Group Suggestions</h3>
        </div>
        <p className="text-sm text-gray-500 mb-4">Based on your reading history and interests, AI suggests these groups for you.</p>

        {!suggestions && !loading && (
          <Button onClick={generateSuggestions} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
            <Sparkles className="w-4 h-4" /> Suggest Groups For Me
          </Button>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-indigo-600 py-4">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Analyzing your reading journey...</span>
          </div>
        )}

        {suggestions && (
          <div className="space-y-3">
            {suggestions.map((s, i) => (
              <div key={i} className="bg-white rounded-xl p-4 border border-indigo-100 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {s.name.charAt(0)}
                      </div>
                      <p className="font-semibold text-sm text-gray-900">{s.name}</p>
                    </div>
                    <p className="text-xs text-gray-500 mb-2 ml-9">{s.description}</p>
                    <div className="flex flex-wrap gap-1 ml-9">
                      {(s.tags || []).map(tag => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-medium">#{tag}</span>
                      ))}
                    </div>
                    {s.opening_topic && (
                      <div className="mt-2 ml-9 flex items-start gap-1.5">
                        <MessageCircle className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                        <p className="text-[10px] text-gray-500 italic">"{s.opening_topic}"</p>
                      </div>
                    )}
                  </div>
                  <Link to={createPageUrl('Groups')}>
                    <Button size="sm" variant="outline" className="text-xs h-7 flex-shrink-0 border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                      <PlusCircle className="w-3 h-3 mr-1" /> Join
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={generateSuggestions}
              className="text-indigo-600 text-xs mt-1"
            >
              <Sparkles className="w-3 h-3 mr-1" /> Regenerate suggestions
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}