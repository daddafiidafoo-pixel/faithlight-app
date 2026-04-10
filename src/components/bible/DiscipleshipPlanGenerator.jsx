import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Sparkles, ChevronDown, ChevronUp, Loader2, Save, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

const FOCUS_AREAS = ['Prayer life', 'Bible reading habits', 'Evangelism', 'Serving others', 'Worship', 'Community', 'Spiritual disciplines', 'Leadership'];

export default function DiscipleshipPlanGenerator({ user, onInsertToChat }) {
  const [expanded, setExpanded] = useState(false);
  const [focus, setFocus] = useState([]);
  const [duration, setDuration] = useState('30');
  const [level, setLevel] = useState('growing');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleFocus = (area) => setFocus(p => p.includes(area) ? p.filter(a => a !== area) : [...p, area]);

  const generate = async () => {
    setLoading(true);
    setResult(null);
    setSaved(false);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Create a personalized discipleship plan:
Spiritual Level: ${level}
Duration: ${duration} days
Focus Areas: ${focus.join(', ') || 'General discipleship'}

Generate a practical, encouraging plan with:
1. **Overview** — goals and spiritual vision for this journey
2. **Weekly Rhythm** — daily/weekly spiritual habits
3. **Week-by-week breakdown** with:
   - Daily scripture (specific references)
   - Prayer focus
   - Practical action steps
   - Reflection questions
4. **Accountability suggestions** — what to track, who to share with
5. **Milestone checkpoints** (week 1, mid-point, end)

Keep it practical, grace-filled, and Spirit-led. Use warm encouraging language.`,
      add_context_from_internet: false,
    });
    setResult(res);
    setLoading(false);
  };

  const savePlan = async () => {
    if (!user || !result) return;
    await base44.entities.StudyPlan.create({
      user_id: user.id,
      title: `${duration}-Day Discipleship Plan (${focus.join(', ') || 'General'})`,
      description: `Focus: ${focus.join(', ') || 'General discipleship'} | Level: ${level}`,
      content: result,
      status: 'active',
      duration_days: parseInt(duration),
    }).catch(() => {});
    setSaved(true);
    toast.success('Discipleship plan saved!');
  };

  return (
    <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
      <CardContent className="pt-4 pb-4">
        <button className="w-full flex items-center justify-between" onClick={() => setExpanded(p => !p)}>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-600 rounded-lg"><Target className="w-4 h-4 text-white" /></div>
            <div className="text-left">
              <p className="font-semibold text-gray-900 text-sm">Discipleship Plan Generator</p>
              <p className="text-xs text-gray-500">Tailored spiritual growth plan for you</p>
            </div>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>

        {expanded && (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Spiritual Level</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" value={level} onChange={e => setLevel(e.target.value)}>
                  <option value="new_believer">New Believer</option>
                  <option value="growing">Growing</option>
                  <option value="mature">Mature</option>
                  <option value="leader">Leader/Teacher</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Duration</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" value={duration} onChange={e => setDuration(e.target.value)}>
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 block mb-2">Focus Areas (select any)</label>
              <div className="flex flex-wrap gap-1.5">
                {FOCUS_AREAS.map(area => (
                  <button key={area} onClick={() => toggleFocus(area)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${focus.includes(area) ? 'bg-amber-500 text-white border-amber-500' : 'border-amber-200 text-amber-700 hover:bg-amber-100'}`}>
                    {area}
                  </button>
                ))}
              </div>
            </div>

            <Button className="w-full gap-2 bg-amber-600 hover:bg-amber-700" onClick={generate} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {loading ? 'Generating plan...' : 'Generate My Discipleship Plan'}
            </Button>

            {result && (
              <div className="bg-white border border-amber-200 rounded-xl p-4 max-h-[400px] overflow-y-auto">
                <div className="flex justify-between items-center mb-3">
                  <Badge className="bg-amber-100 text-amber-800">{duration}-Day Plan</Badge>
                  <div className="flex gap-2">
                    {user && (
                      <Button size="sm" variant="ghost" className={`h-7 gap-1 text-xs ${saved ? 'text-green-600' : 'text-amber-600'}`} onClick={savePlan} disabled={saved}>
                        {saved ? <><CheckCircle className="w-3 h-3" />Saved!</> : <><Save className="w-3 h-3" />Save Plan</>}
                      </Button>
                    )}
                    {onInsertToChat && (
                      <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs text-indigo-600" onClick={() => onInsertToChat('🎯 **My Discipleship Plan**\n\n' + result)}>
                        Insert to Chat
                      </Button>
                    )}
                  </div>
                </div>
                <ReactMarkdown className="prose prose-sm max-w-none text-sm">{result}</ReactMarkdown>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}