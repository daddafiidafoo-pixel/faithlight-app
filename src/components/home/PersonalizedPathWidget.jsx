import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, BookOpen, Target, Brain, ChevronRight, Loader2, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { toast } from 'sonner';

const CACHE_KEY = 'fl_personalized_path_v1';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24h

function getCachedPath(userId) {
  try {
    const raw = localStorage.getItem(`${CACHE_KEY}_${userId}`);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL) return null;
    return data;
  } catch { return null; }
}

function setCachedPath(userId, data) {
  localStorage.setItem(`${CACHE_KEY}_${userId}`, JSON.stringify({ ts: Date.now(), data }));
}

export default function PersonalizedPathWidget({ user }) {
  const [path, setPath] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    const cached = getCachedPath(user.id);
    if (cached) { setPath(cached); setGenerated(true); }
  }, [user?.id]);

  const generatePath = async (force = false) => {
    if (!user) return;
    if (!force) {
      const cached = getCachedPath(user.id);
      if (cached) { setPath(cached); setGenerated(true); return; }
    }

    setLoading(true);
    try {
      // Gather context: saved verses (filter user_id only — safe) + user profile
      const savedVerses = await base44.entities.SavedVerse.filter(
        { user_id: user.id }, '-created_date', 20
      ).catch(() => []);

      const savedBooks = [...new Set(savedVerses.map(s => s.book).filter(Boolean))];
      const savedRefs = savedVerses.map(s => s.reference || s.ref_key).filter(Boolean).slice(0, 10).join(', ');
      const level = user.spiritual_level || 1;
      const levelName = ['', 'New to Faith', 'Growing Strong', 'Deep Study', 'Leadership'][level] || 'Growing';

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a personalized Bible learning coach. Analyze this user's activity and generate a tailored learning path.

User profile:
- Spiritual level: ${level} (${levelName})
- Recently saved verses: ${savedRefs || 'none yet'}
- Books they engage with: ${savedBooks.length ? savedBooks.join(', ') : 'exploring'}

Generate a focused 7-day learning path. Return JSON:
{
  "title": "path title (10 words max)",
  "theme": "1-2 word theme",
  "why": "1 sentence why this is right for them now",
  "steps": [
    { "day": 1, "label": "short action", "type": "reading|memorize|study", "ref": "Book X:Y-Z" }
  ],
  "memorize_verse": { "ref": "Book X:Y", "text": "verse text" }
}
Return exactly 7 steps. Types: reading, memorize, study.`,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            theme: { type: 'string' },
            why: { type: 'string' },
            steps: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  day: { type: 'number' },
                  label: { type: 'string' },
                  type: { type: 'string' },
                  ref: { type: 'string' },
                }
              }
            },
            memorize_verse: {
              type: 'object',
              properties: { ref: { type: 'string' }, text: { type: 'string' } }
            }
          }
        }
      });

      setCachedPath(user.id, result);
      setPath(result);
      setGenerated(true);
    } catch {
      toast.error('Could not generate path. Try again.');
    }
    setLoading(false);
  };

  const typeIcon = (type) => {
    if (type === 'memorize') return '🧠';
    if (type === 'study') return '📚';
    return '📖';
  };

  const typeBadge = (type) => {
    const map = { reading: 'bg-blue-100 text-blue-700', memorize: 'bg-purple-100 text-purple-700', study: 'bg-amber-100 text-amber-700' };
    return map[type] || 'bg-gray-100 text-gray-600';
  };

  if (!generated && !loading) {
    return (
      <div className="rounded-2xl border border-dashed border-indigo-300 bg-indigo-50/50 p-6 text-center">
        <Brain className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-gray-800 mb-1">Your Personalized Learning Path</h3>
        <p className="text-sm text-gray-500 mb-4">AI analyzes your saved verses and progress to build a custom 7-day study plan just for you.</p>
        <Button onClick={() => generatePath(false)} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
          <Sparkles className="w-4 h-4" /> Generate My Path
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-indigo-200 bg-white p-6 text-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Analyzing your activity and building your path…</p>
      </div>
    );
  }

  if (!path) return null;

  const today = new Date().getDay(); // 0=Sun
  const currentStep = path.steps?.[Math.min(today, 6)];

  return (
    <div className="rounded-2xl border border-indigo-200 bg-white overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span className="text-xs font-semibold text-indigo-200 uppercase tracking-wider">AI Learning Path</span>
            </div>
            <h3 className="text-white font-bold text-base">{path.title}</h3>
          </div>
          <Badge className="bg-white/20 text-white border-0 text-xs">{path.theme}</Badge>
        </div>
        {path.why && <p className="text-indigo-200 text-xs mt-2">{path.why}</p>}
      </div>

      <div className="p-4 space-y-4">
        {/* Today's focus */}
        {currentStep && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <p className="text-xs font-semibold text-amber-700 mb-1">📅 Today (Day {currentStep.day})</p>
            <div className="flex items-center gap-2">
              <span className="text-lg">{typeIcon(currentStep.type)}</span>
              <div>
                <p className="text-sm font-medium text-gray-800">{currentStep.label}</p>
                {currentStep.ref && <p className="text-xs text-gray-500">{currentStep.ref}</p>}
              </div>
            </div>
          </div>
        )}

        {/* 7-day steps */}
        <div className="grid grid-cols-7 gap-1">
          {(path.steps || []).map((s, i) => {
            const isToday = i === Math.min(today, 6);
            return (
              <div key={i} className={`rounded-lg p-1.5 text-center ${isToday ? 'bg-indigo-100 border border-indigo-300' : 'bg-gray-50'}`}>
                <p className="text-xs font-bold text-gray-500 mb-0.5">D{s.day}</p>
                <span className="text-sm">{typeIcon(s.type)}</span>
              </div>
            );
          })}
        </div>

        {/* Memorize verse */}
        {path.memorize_verse?.text && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
            <p className="text-xs font-semibold text-purple-700 mb-1 flex items-center gap-1">
              <Brain className="w-3 h-3" /> Verse to Memorize
            </p>
            <p className="text-xs text-gray-700 italic leading-relaxed">"{path.memorize_verse.text}"</p>
            <p className="text-xs text-purple-600 font-semibold mt-1">— {path.memorize_verse.ref}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <Link to={createPageUrl('BibleStudyPlans')}>
            <Button variant="outline" size="sm" className="gap-1 text-xs text-indigo-600 border-indigo-200">
              View Study Plans <ChevronRight className="w-3 h-3" />
            </Button>
          </Link>
          <Button
            variant="ghost" size="sm"
            className="gap-1 text-xs text-gray-400 hover:text-gray-600"
            onClick={() => generatePath(true)}
          >
            <RefreshCw className="w-3 h-3" /> Refresh
          </Button>
        </div>
      </div>
    </div>
  );
}