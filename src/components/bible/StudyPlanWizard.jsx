import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, BookOpen, Sparkles, Plus, X } from 'lucide-react';

const BIBLE_THEMES = [
  'Love & Compassion', 'Justice & Righteousness', 'Forgiveness', 'Redemption',
  'Faith & Trust', 'Prayer & Intercession', 'Discipleship', 'Leadership',
  'Transformation', 'Hope & Encouragement', 'Wisdom & Knowledge', 'Holy Spirit',
  'God\'s Character', 'Kingdom of God', 'Spiritual Warfare', 'Perseverance'
];

const BIBLE_EVENTS = [
  'Creation', 'Fall of Man', 'Noah & the Flood', 'Abraham & the Covenant',
  'Exodus & Liberation', 'Mt. Sinai & the Law', 'Wilderness Wandering',
  'Conquest of Canaan', 'Judges Era', 'United Kingdom', 'Kingdom Divided',
  'Babylonian Captivity', 'Return from Exile', 'Life of Jesus',
  'Crucifixion & Resurrection', 'Early Church', 'Paul\'s Missionary Journeys',
  'Fall of Jerusalem'
];

const READING_STYLES = [
  { id: 'chronological',  label: 'Chronological',   desc: 'Read in historical order of events',          emoji: '📅' },
  { id: 'thematic',       label: 'Thematic',         desc: 'Explore passages by topic or theme',           emoji: '🎯' },
  { id: 'difficulty_asc', label: 'Beginner First',   desc: 'Start simple, gradually increase complexity',  emoji: '🌱' },
  { id: 'difficulty_desc',label: 'Challenge Mode',   desc: 'Start with deep passages, build understanding',emoji: '🔥' },
  { id: 'canonical',      label: 'Canonical Order',  desc: 'Follow the traditional book order',            emoji: '📖' },
  { id: 'gospels_first',  label: 'Jesus-Centered',   desc: 'Start with the Gospels & work outward',        emoji: '✝️'  },
];

export default function StudyPlanWizard({ currentUser, isDarkMode }) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [duration, setDuration] = useState(14);
  const [planType, setPlanType] = useState('interest');
  const [readingStyle, setReadingStyle] = useState('thematic');
  const [selectedThemes, setSelectedThemes] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [learningOutcomes, setLearningOutcomes] = useState('');
  const [topicsToAvoid, setTopicsToAvoid]  = useState('');

  const { data: readingHistory = [] } = useQuery({
    queryKey: ['readingHistory', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return [];
      return base44.entities.ReadingHistory.filter(
        { user_id: currentUser.id },
        '-reading_date',
        50
      );
    },
    enabled: !!currentUser
  });

  const { data: studyPlans = [] } = useQuery({
    queryKey: ['studyPlans', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return [];
      return base44.entities.StudyPlan.filter({ user_id: currentUser.id }, '-created_date', 5);
    },
    enabled: !!currentUser
  });

  const generatePlan = useMutation({
    mutationFn: async () => {
      if (!currentUser) throw new Error('Not authenticated');

      // Extract themes from reading history
      const frequentThemes = {};
      readingHistory.forEach(entry => {
        (entry.themes || []).forEach(theme => {
          frequentThemes[theme] = (frequentThemes[theme] || 0) + 1;
        });
      });

      const topThemes = Object.entries(frequentThemes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([theme]) => theme);

      const recentBooks = [...new Set(readingHistory.map(h => h.book))].slice(0, 5);

      let prompt = '';
      let planTitle = '';

      if (planType === 'theme') {
        prompt = `Create a ${duration}-day Bible study plan focused on these themes: ${selectedThemes.join(', ')}

Based on the user's reading history (recent books: ${recentBooks.join(', ')}), suggest passages that deepen their understanding.

${learningOutcomes ? `Learning outcomes: ${learningOutcomes}` : ''}
${topicsToAvoid ? `Avoid discussing: ${topicsToAvoid}` : ''}

Include:
- Daily objectives connected to each theme
- Progressive deepening from foundational to advanced
- Passages they likely haven't read yet
- Practical application exercises`;
        planTitle = `Study Plan: ${selectedThemes.slice(0, 2).join(' & ')}`;
      } else if (planType === 'event') {
        prompt = `Create a ${duration}-day study plan exploring the Biblical event: "${selectedEvent}"

Based on the user's reading history (${recentBooks.length > 0 ? `they've studied: ${recentBooks.join(', ')}` : 'beginner level'}), 
create a plan that explores this event chronologically and theologically.

${learningOutcomes ? `Learning outcomes: ${learningOutcomes}` : ''}
${topicsToAvoid ? `Avoid: ${topicsToAvoid}` : ''}

Include:
- Timeline and historical context
- Key passages in order
- Character studies involved
- Theological significance
- How it connects to Jesus`;
        planTitle = `Study Plan: ${selectedEvent}`;
      } else {
        prompt = `Create a personalized ${duration}-day Bible study plan.

The user has studied: ${recentBooks.join(', ')}
Their frequent themes of interest: ${topThemes.join(', ')}

${learningOutcomes ? `They want to learn: ${learningOutcomes}` : ''}
${topicsToAvoid ? `They prefer to avoid: ${topicsToAvoid}` : ''}

Build a plan that:
- Extends their interests further
- Suggests related passages they haven't studied
- Progressively increases depth
- Includes 2-3 completely new areas aligned with their interests`;
        planTitle = 'Personalized Study Plan';
      }

      const styleGuide = {
        chronological:    'Arrange all passages in strict chronological/historical order of events.',
        thematic:         'Group passages by theme for deeper conceptual understanding.',
        difficulty_asc:   'Start with simple narrative passages and progressively introduce more complex theology.',
        difficulty_desc:  'Begin with doctrinally rich passages, then reinforce with simpler narrative passages.',
        canonical:        'Follow the traditional Bible book order (Genesis to Revelation).',
        gospels_first:    'Start with the four Gospels to establish a Jesus-centered foundation, then expand.',
      }[readingStyle] || '';

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt + `

READING STYLE: ${readingStyle}. ${styleGuide}

Format as JSON with:
- title: Study plan name
- description: Overview
- reading_style_note: Brief note on how the reading style shapes this plan
- daily_objectives: Array of daily study goals (${duration} items)
- key_passages: Array of suggested Bible passages ordered according to the reading style
- theological_topics: Array of topics to explore
- learning_outcomes: Array of expected outcomes`,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            reading_style_note: { type: 'string' },
            daily_objectives: { type: 'array', items: { type: 'string' } },
            key_passages: { type: 'array', items: { type: 'string' } },
            theological_topics: { type: 'array', items: { type: 'string' } },
            learning_outcomes: { type: 'array', items: { type: 'string' } }
          }
        }
      });

      return base44.entities.StudyPlan.create({
        user_id: currentUser.id,
        title: response.title || planTitle,
        description: response.description,
        duration_days: duration,
        topics: response.theological_topics,
        generated_content: JSON.stringify(response, null, 2),
        status: 'active'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studyPlans'] });
      setIsOpen(false);
      setStep(1);
      setSelectedThemes([]);
      setSelectedEvent('');
    }
  });

  if (!currentUser) {
    return <p className="text-xs text-gray-500">Login to generate study plans</p>;
  }

  const canGenerate = (
    (planType === 'interest') ||
    (planType === 'theme' && selectedThemes.length > 0) ||
    (planType === 'event' && selectedEvent)
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full gap-2">
          <Sparkles className="w-4 h-4" />
          Generate Study Plan
        </Button>
      </DialogTrigger>
      <DialogContent style={{
        backgroundColor: isDarkMode ? '#1A1F1C' : '#FFFFFF',
        borderColor: isDarkMode ? '#2A2F2C' : '#E5E7EB'
      }} className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AI Study Plan Generator · Step {step}/3</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Step 1: Choose Plan Type */}
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700">What type of study plan?</p>
              <div className="grid gap-2">
                {[
                  { id: 'interest', label: '🎯 Based on My Interests', desc: 'AI uses your reading history & preferences' },
                  { id: 'theme',    label: '✨ By Theological Themes', desc: 'Choose specific themes to study deeply' },
                  { id: 'event',    label: '📅 By Biblical Event',     desc: 'Explore a key moment in Scripture' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setPlanType(opt.id)}
                    className={`p-3 rounded-xl border text-left text-sm transition ${
                      planType === opt.id ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-200' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <strong>{opt.label}</strong>
                    <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">📚 Reading Style</p>
                <div className="grid grid-cols-2 gap-2">
                  {READING_STYLES.map(style => (
                    <button
                      key={style.id}
                      onClick={() => setReadingStyle(style.id)}
                      className={`p-2.5 rounded-xl border text-left text-xs transition ${
                        readingStyle === style.id ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-200' : 'border-gray-200 hover:border-indigo-200'
                      }`}
                    >
                      <span className="text-base">{style.emoji}</span>
                      <p className="font-semibold mt-0.5">{style.label}</p>
                      <p className="text-gray-500 leading-tight">{style.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <Button onClick={() => setStep(2)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                Next →
              </Button>
            </div>
          )}

          {/* Step 2: Customize Details */}
          {step === 2 && (
            <div className="space-y-4">
              {planType === 'theme' && (
                <div>
                  <p className="text-sm font-semibold mb-2">Select Themes (pick 1-4)</p>
                  <div className="grid grid-cols-2 gap-2">
                    {BIBLE_THEMES.map(theme => (
                      <button
                        key={theme}
                        onClick={() => {
                          setSelectedThemes(
                            selectedThemes.includes(theme)
                              ? selectedThemes.filter(t => t !== theme)
                              : [...selectedThemes, theme].slice(0, 4)
                          );
                        }}
                        className={`p-2 rounded text-xs transition border ${
                          selectedThemes.includes(theme)
                            ? 'border-indigo-600 bg-indigo-50 font-semibold'
                            : 'border-gray-200'
                        }`}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {planType === 'event' && (
                <div>
                  <p className="text-sm font-semibold mb-2">Select Biblical Event</p>
                  <select
                    value={selectedEvent}
                    onChange={(e) => setSelectedEvent(e.target.value)}
                    className="w-full p-2 border rounded text-sm"
                  >
                    <option value="">Choose an event...</option>
                    {BIBLE_EVENTS.map(event => (
                      <option key={event} value={event}>{event}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-sm font-semibold block mb-2">Duration</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full p-2 border rounded text-sm"
                >
                  <option value={7}>1 Week</option>
                  <option value={14}>2 Weeks</option>
                  <option value={30}>1 Month</option>
                  <option value={60}>2 Months</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => setStep(3)} variant="outline" className="flex-1">
                  Advanced Options
                </Button>
                <Button
                  onClick={() => generatePlan.mutate()}
                  disabled={generatePlan.isPending || !canGenerate}
                  className="flex-1 gap-2"
                >
                  {generatePlan.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate'
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Advanced Options */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold block mb-2">Learning Outcomes (optional)</label>
                <textarea
                  value={learningOutcomes}
                  onChange={(e) => setLearningOutcomes(e.target.value)}
                  placeholder="e.g., Understand prayer principles, deepen faith in difficult times"
                  className="w-full p-2 border rounded text-sm h-20"
                />
              </div>

              <div>
                <label className="text-sm font-semibold block mb-2">Topics to Avoid (optional)</label>
                <textarea
                  value={topicsToAvoid}
                  onChange={(e) => setTopicsToAvoid(e.target.value)}
                  placeholder="e.g., Violence, harsh judgments"
                  className="w-full p-2 border rounded text-sm h-20"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={() => setStep(2)} variant="outline" className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={() => generatePlan.mutate()}
                  disabled={generatePlan.isPending || !canGenerate}
                  className="flex-1 gap-2"
                >
                  {generatePlan.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate Plan'
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}