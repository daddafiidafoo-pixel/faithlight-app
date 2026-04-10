import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Download, Eye } from 'lucide-react';

const decks = [
  {
    title: 'Pastor & Teacher Training (45 min)',
    audience: 'pastors',
    duration: 45,
    language: 'English',
    slides: 7,
    status: 'ready_to_use',
    slideContent: [
      { 
        num: 1, 
        title: 'FaithLight Training for Pastors & Bible Teachers',
        content: 'Supporting Biblical Teaching with Clarity & Integrity' 
      },
      { 
        num: 2, 
        title: 'Why FaithLight Exists',
        content: 'Many believers desire deeper understanding of God\'s Word.\nPastors and teachers often lack time and resources.\n\nFaithLight exists to support—not replace—biblical teaching.' 
      },
      { 
        num: 3, 
        title: 'Our Foundation',
        content: 'Scripture is the final authority\nPrayer and the Church remain central\nTechnology is a tool, not a teacher\n\n"Let the word of Christ dwell in you richly." — Colossians 3:16' 
      },
      { 
        num: 4, 
        title: 'What FaithLight Provides',
        content: 'Bible & theology lessons\nInteractive quizzes\nAI-assisted teaching outlines\nDownloadable & printable materials' 
      },
      { 
        num: 5, 
        title: 'Preparing a Teaching Program',
        content: 'Enter topic & Scripture\nSelect audience & duration\nGenerate outline\nReview and personalize\nDownload or print' 
      },
      { 
        num: 6, 
        title: 'Best Practices',
        content: 'Always verify with Scripture\nUse local illustrations\nTeach with humility and prayer\n\nFaithLight supports your calling—it does not replace it' 
      },
      { 
        num: 7, 
        title: 'Closing',
        content: 'FaithLight is here to serve the Church.\nTeach with clarity. Lead with faith.' 
      }
    ]
  },
  {
    title: 'Translator & Reviewer Training (30 min)',
    audience: 'reviewers',
    duration: 30,
    language: 'English',
    slides: 5,
    status: 'ready_to_use',
    slideContent: [
      { 
        num: 1, 
        title: 'Your Role',
        content: 'You help make biblical education accessible without changing its meaning.' 
      },
      { 
        num: 2, 
        title: 'Translation Principles',
        content: 'Accuracy over creativity\nScripture references unchanged\nNatural church language\nNo added interpretation' 
      },
      { 
        num: 3, 
        title: 'Review Responsibilities',
        content: 'Check Scripture accuracy\nEnsure theological consistency\nConfirm cultural clarity\nFlag concerns for admin review' 
      },
      { 
        num: 4, 
        title: 'What Not to Do',
        content: 'Do not add doctrine\nDo not remove biblical tension\nDo not paraphrase Scripture carelessly' 
      },
      { 
        num: 5, 
        title: 'Commitment',
        content: '"I will review content carefully and keep Scripture as the final authority."' 
      }
    ]
  },
  {
    title: 'Church Admin Training (30 min)',
    audience: 'church_leaders',
    duration: 30,
    language: 'English',
    slides: 4,
    status: 'ready_to_use',
    slideContent: [
      { 
        num: 1, 
        title: 'Role of Church Admin',
        content: 'Support learning and discipleship across the church.' 
      },
      { 
        num: 2, 
        title: 'Managing Groups',
        content: 'Create Bible study groups\nAssign lessons and quizzes\nEncourage weekly completion' 
      },
      { 
        num: 3, 
        title: 'Monitoring Progress',
        content: 'Track lesson completion\nView quiz summaries\nSupport learners gently' 
      },
      { 
        num: 4, 
        title: 'Reporting',
        content: 'Use reports for:\nLeadership insight\nDiscipleship planning\nDonor transparency (if applicable)' 
      }
    ]
  },
  {
    title: 'Ambassador Onboarding (30 min)',
    audience: 'ambassadors',
    duration: 30,
    language: 'English',
    slides: 4,
    status: 'draft'
  },
  {
    title: 'Reviewer Standards & QA (60 min)',
    audience: 'reviewers',
    duration: 60,
    language: 'English',
    slides: 6,
    status: 'draft'
  }
];

export default function TrainingMaterials() {
  const [user, setUser] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser.user_role !== 'admin') {
          alert('Access denied. Admin role required.');
          window.location.href = '/';
        }
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin();
      }
    };
    fetchUser();
  }, []);

  const { data: trainingDecks = [] } = useQuery({
    queryKey: ['training-decks'],
    queryFn: () => base44.entities.TrainingDeck.filter({}),
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Training Materials</h1>
            <p className="text-gray-600 mt-2">Manage training decks and educational materials</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Deck
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {decks.map((deck, idx) => (
            <DeckCard key={idx} deck={deck} />
          ))}
        </div>

        {/* Create Dialog */}
        {showCreateDialog && (
          <CreateDeckDialog onClose={() => setShowCreateDialog(false)} />
        )}
      </div>
    </div>
  );
}

function DeckCard({ deck }) {
  const [showPreview, setShowPreview] = React.useState(false);

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{deck.title}</h3>
                <Badge variant={deck.status === 'ready_to_use' ? 'default' : 'outline'}>
                  {deck.status === 'ready_to_use' ? 'Ready' : 'Draft'}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span>Audience: <span className="font-medium text-gray-900 capitalize">{deck.audience.replace('_', ' ')}</span></span>
                <span>•</span>
                <span>Duration: <span className="font-medium text-gray-900">{deck.duration} min</span></span>
                <span>•</span>
                <span>Slides: <span className="font-medium text-gray-900">{deck.slides}</span></span>
                <span>•</span>
                <span>Language: <span className="font-medium text-gray-900">{deck.language}</span></span>
              </div>
              {deck.slideContent && (
                <div className="mt-3 text-xs text-gray-500">
                  {deck.slideContent.length} slides defined
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {deck.slideContent && (
                <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowPreview(true)}>
                  <Eye className="w-4 h-4" />
                  Preview
                </Button>
              )}
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                PDF
              </Button>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      {showPreview && (
        <PreviewDialog deck={deck} onClose={() => setShowPreview(false)} />
      )}
    </>
  );
}

function PreviewDialog({ deck, onClose }) {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const slides = deck.slideContent || [];

  if (slides.length === 0) {
    return null;
  }

  const slide = slides[currentSlide];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{deck.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Slide Display */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-lg min-h-[400px] flex flex-col justify-between">
            <div>
              <h2 className="text-4xl font-bold text-indigo-900 mb-6">{slide.title}</h2>
              <div className="text-base text-gray-800 whitespace-pre-line leading-relaxed">
                {slide.content}
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-6">Slide {currentSlide + 1} of {slides.length}</p>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              disabled={currentSlide === 0}
              onClick={() => setCurrentSlide(currentSlide - 1)}
            >
              ← Previous
            </Button>
            <div className="flex gap-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    idx === currentSlide ? 'bg-indigo-600 w-8' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            <Button
              variant="outline"
              disabled={currentSlide === slides.length - 1}
              onClick={() => setCurrentSlide(currentSlide + 1)}
            >
              Next →
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CreateDeckDialog({ onClose }) {
  const [formData, setFormData] = useState({
    title: '',
    audience: 'pastors',
    duration_minutes: 45,
    language_code: 'en'
  });

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Training Deck</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Deck Title</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Pastor Training (45 min)"
              className="mt-2"
            />
          </div>

          <div>
            <Label>Target Audience</Label>
            <select 
              value={formData.audience}
              onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
              className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="pastors">Pastors</option>
              <option value="teachers">Teachers</option>
              <option value="ambassadors">Ambassadors</option>
              <option value="reviewers">Reviewers</option>
              <option value="church_leaders">Church Leaders</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Duration (minutes)</Label>
              <Input
                type="number"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Language</Label>
              <select 
                value={formData.language_code}
                onChange={(e) => setFormData({ ...formData, language_code: e.target.value })}
                className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="en">English</option>
                <option value="am">Amharic</option>
                <option value="sw">Swahili</option>
                <option value="fr">French</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button className="flex-1">
              <Plus className="w-4 h-4 mr-2" />
              Create & Edit Slides
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}