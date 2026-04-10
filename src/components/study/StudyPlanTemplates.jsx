import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loader2, BookOpen, Calendar, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const PLAN_TEMPLATES = [
  {
    id: '7-day',
    title: '7-Day Quick Start',
    description: 'A brief introduction to scripture reading habits',
    days: 7,
    daily_time: '10 min',
    icon: '⚡',
    passages: [
      { day: 1, reference: 'John 1:1-18', title: 'The Word Made Flesh' },
      { day: 2, reference: 'John 3:16-17', title: 'God\'s Love for the World' },
      { day: 3, reference: 'Psalm 23', title: 'The Shepherd Psalm' },
      { day: 4, reference: 'Romans 8:28-39', title: 'Assurance in God' },
      { day: 5, reference: 'Matthew 5:3-12', title: 'The Beatitudes' },
      { day: 6, reference: '1 Corinthians 13', title: 'Love Never Fails' },
      { day: 7, reference: 'Revelation 21:1-7', title: 'Eternity Awaits' },
    ],
  },
  {
    id: '30-day',
    title: '30-Day Deep Dive',
    description: 'Comprehensive Bible exploration month-long study',
    days: 30,
    daily_time: '15 min',
    icon: '📖',
    passages: Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      reference: `Day ${i + 1}`,
      title: `Scripture Study Day ${i + 1}`,
    })),
  },
  {
    id: '1-year',
    title: '1-Year Bible Reading Plan',
    description: 'Read the entire Bible over 365 days',
    days: 365,
    daily_time: '20 min',
    icon: '🏆',
    passages: Array.from({ length: 365 }, (_, i) => ({
      day: i + 1,
      reference: `Day ${i + 1}`,
      title: `Year-Long Day ${i + 1}`,
    })),
  },
];

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'om', label: 'Afaan Oromoo' },
  { code: 'am', label: 'Amharic' },
  { code: 'sw', label: 'Kiswahili' },
  { code: 'fr', label: 'French' },
];

const BIBLE_VERSIONS = {
  en: [
    { code: 'WEB', label: 'World English Bible' },
    { code: 'NIV', label: 'New International Version' },
    { code: 'KJV', label: 'King James Version' },
  ],
  om: [{ code: 'OEB', label: 'Oromo English Bible' }],
  am: [{ code: 'AMB', label: 'Amharic Bible' }],
  sw: [{ code: 'SWB', label: 'Swahili Bible' }],
  fr: [{ code: 'FRB', label: 'French Bible' }],
};

export default function StudyPlanTemplates({ user, onPlanCreated }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [language, setLanguage] = useState('en');
  const [bibleVersion, setBibleVersion] = useState('WEB');
  const [creating, setCreating] = useState(false);

  const handleCreatePlan = async () => {
    if (!user?.id) {
      base44.auth.redirectToLogin();
      return;
    }

    setCreating(true);
    try {
      const planData = {
        user_id: user.id,
        title: selectedTemplate.title,
        description: selectedTemplate.description,
        duration_days: selectedTemplate.days,
        minutes_per_day: parseInt(selectedTemplate.daily_time),
        language_code: language,
        bible_version: bibleVersion,
        passages: selectedTemplate.passages.map((p) => ({
          ...p,
          devotional: `Devotional for ${p.reference}`,
          reflection_question: `What does ${p.reference} teach you?`,
        })),
        status: 'created',
        current_day: 0,
      };

      const created = await base44.entities.StudyPlan.create(planData);
      toast.success(`${selectedTemplate.title} created!`);
      setSelectedTemplate(null);
      onPlanCreated?.(created);
    } catch (error) {
      toast.error('Failed to create plan. Please try again.');
      console.error(error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLAN_TEMPLATES.map((template) => (
          <Card
            key={template.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedTemplate(template)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="text-4xl mb-2">{template.icon}</div>
              </div>
              <CardTitle className="text-lg">{template.title}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{template.days} days</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{template.daily_time}</span>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                Select Plan
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedTemplate} onOpenChange={(open) => !open && setSelectedTemplate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedTemplate?.title}</DialogTitle>
            <DialogDescription>{selectedTemplate?.description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Language</label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Bible Version</label>
              <Select value={bibleVersion} onValueChange={setBibleVersion}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(BIBLE_VERSIONS[language] || []).map((version) => (
                    <SelectItem key={version.code} value={version.code}>
                      {version.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-700">
              <CheckCircle2 className="w-4 h-4 mb-2 inline mr-2" />
              <span>
                {selectedTemplate?.days} days of daily reading • Offline support enabled
              </span>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setSelectedTemplate(null)}
                disabled={creating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreatePlan}
                disabled={creating}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 gap-2"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Creating…
                  </>
                ) : (
                  'Create Plan'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}