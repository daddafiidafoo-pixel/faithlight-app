import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export default function StudyPlanBuilderPro({ user, language, onGenerate }) {
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState('7');
  const [audience, setAudience] = useState('general');
  const [goal, setGoal] = useState('understanding');
  const [loading, setLoading] = useState(false);

  const isOm = language === 'om';

  const DURATIONS = [
    { value: '7', label: isOm ? '7 Guyyaa' : '7 Days' },
    { value: '14', label: isOm ? '14 Guyyaa' : '14 Days' },
    { value: '30', label: isOm ? '30 Guyyaa' : '30 Days' },
    { value: '90', label: isOm ? '90 Guyyaa' : '90 Days' },
  ];

  const AUDIENCES = [
    { value: 'new_believers', label: isOm ? 'Amantaa Haaraa' : 'New Believers' },
    { value: 'growing', label: isOm ? 'Oli Jiraachuu' : 'Growing Christians' },
    { value: 'mature', label: isOm ? 'Amantaa Midhaan' : 'Mature Christians' },
    { value: 'small_group', label: isOm ? 'Garee Xiqqaa' : 'Small Group' },
  ];

  const GOALS = [
    { value: 'understanding', label: isOm ? 'Hubannaa' : 'Understanding' },
    { value: 'memorization', label: isOm ? 'Yaadannoo' : 'Memorization' },
    { value: 'application', label: isOm ? 'Gargaarsa' : 'Application' },
    { value: 'discussion', label: isOm ? 'Haasaha' : 'Discussion' },
  ];

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error(isOm ? 'Mata Seera Gaafadhu' : 'Enter a topic');
      return;
    }

    setLoading(true);
    const prompt = `Create a personalized ${duration}-day Bible study plan about: "${topic}"

Target audience: ${AUDIENCES.find(a => a.value === audience)?.label}
Learning goal: ${GOALS.find(g => g.value === goal)?.label}

Format each day as:
**Day [N]: [Title]**
- Passage: [Book Chapter:Verses]
- Focus: [One-sentence focus]
- Reflection Question: [Thoughtful question]
- Memory Verse: [If appropriate]

Include weekly review days. End with: ⚠️ *AI-generated — verify with Scripture.*`;

    try {
      const response = await base44.integrations.Core.InvokeLLM({ prompt });
      const plan = typeof response === 'string' ? response : JSON.stringify(response);
      onGenerate(plan, {
        duration,
        audience,
        goal,
        topic,
      });
    } catch (err) {
      toast.error(isOm ? 'Dogoggora dhabudhaa' : 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-indigo-600" />
        {isOm ? 'Pro Karoorsaa Barumsa' : 'Study Plan Builder Pro'}
      </h3>

      <div>
        <label className="text-xs font-medium text-gray-700 block mb-2">
          {isOm ? 'Mata' : 'Topic'}
        </label>
        <Input
          value={topic}
          onChange={e => setTopic(e.target.value)}
          placeholder={isOm ? 'Jidha Kitaaba keessa' : 'e.g., Grace, Prayer, Forgiveness'}
          className="text-sm"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-700 block mb-2">
            {isOm ? 'Guyyaa' : 'Duration'}
          </label>
          <Select value={duration} onValueChange={setDuration}>
            <SelectTrigger className="text-sm h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DURATIONS.map(d => (
                <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-700 block mb-2">
            {isOm ? 'Waamtota' : 'Audience'}
          </label>
          <Select value={audience} onValueChange={setAudience}>
            <SelectTrigger className="text-sm h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AUDIENCES.map(a => (
                <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-700 block mb-2">
            {isOm ? 'Galmi' : 'Goal'}
          </label>
          <Select value={goal} onValueChange={setGoal}>
            <SelectTrigger className="text-sm h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GOALS.map(g => (
                <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button onClick={handleGenerate} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2">
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {isOm ? 'Uumuu' : 'Generate Plan'}
      </Button>
    </div>
  );
}