import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { Loader2, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const SPIRITUAL_GOALS = [
  'Deepen faith and understanding',
  'Prepare for ministry or teaching',
  'Study specific biblical themes',
  'Explore church history and theology',
  'Develop prayer and contemplation practice',
  'Understand Bible prophecy',
  'Learn apologetics and defense of faith'
];

const LEARNING_STYLES = [
  { id: 'visual', name: 'Visual', desc: 'Maps, diagrams, charts' },
  { id: 'auditory', name: 'Auditory', desc: 'Lectures, discussions, audio' },
  { id: 'reading', name: 'Reading/Writing', desc: 'Texts, notes, written content' },
  { id: 'kinesthetic', name: 'Hands-on', desc: 'Practice, activities, application' }
];

const BIBLICAL_INTERESTS = [
  'Old Testament', 'New Testament', 'Gospels', 'Apostolic Writings',
  'Historical figures', 'Parables', 'Miracles', 'Prophecy',
  'Doctrine', 'Ethics', 'Worship', 'Leadership',
  'Early Church', 'Medieval History', 'Reformation', 'Modern Church'
];

export default function StudyProfileBuilder({ open, onComplete }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    goals: [],
    interests: [],
    learningStyle: null,
    customGoal: '',
    timeAvailable: 'moderate', // light, moderate, intensive
    preferredDuration: 4 // weeks
  });

  const handleGoalToggle = (goal) => {
    setProfile(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const handleInterestToggle = (interest) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSaveProfile = async () => {
    if (!profile.goals.length || !profile.interests.length || !profile.learningStyle) {
      toast.error('Please complete all selections');
      return;
    }

    setLoading(true);
    try {
      const user = await base44.auth.me();
      await base44.auth.updateMe({
        study_profile: {
          goals: profile.goals,
          interests: profile.interests,
          learningStyle: profile.learningStyle,
          customGoal: profile.customGoal,
          timeAvailable: profile.timeAvailable,
          preferredDuration: profile.preferredDuration,
          createdAt: new Date().toISOString()
        }
      });
      
      toast.success('Study profile created! AI will personalize your plans.');
      onComplete?.(profile);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Build Your Study Profile</DialogTitle>
          <DialogDescription>
            Help us create personalized study plans by sharing your preferences
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Step 1: Goals */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">What are your spiritual goals?</h3>
              <div className="grid grid-cols-1 gap-2">
                {SPIRITUAL_GOALS.map(goal => (
                  <button
                    key={goal}
                    onClick={() => handleGoalToggle(goal)}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      profile.goals.includes(goal)
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={profile.goals.includes(goal)}
                        readOnly
                        className="w-4 h-4"
                      />
                      {goal}
                    </span>
                  </button>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Or add a custom goal:</label>
                <Textarea
                  placeholder="Describe your own spiritual goal..."
                  value={profile.customGoal}
                  onChange={(e) => setProfile(prev => ({ ...prev, customGoal: e.target.value }))}
                  rows={2}
                />
              </div>
            </div>
          )}

          {/* Step 2: Interests */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">What biblical topics interest you?</h3>
              <div className="grid grid-cols-2 gap-2">
                {BIBLICAL_INTERESTS.map(interest => (
                  <button
                    key={interest}
                    onClick={() => handleInterestToggle(interest)}
                    className={`p-2 rounded-lg border-2 text-sm text-left transition-all ${
                      profile.interests.includes(interest)
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={profile.interests.includes(interest)}
                        readOnly
                        className="w-3 h-3"
                      />
                      {interest}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Learning Style & Time */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-4">What's your preferred learning style?</h3>
                <div className="grid grid-cols-2 gap-3">
                  {LEARNING_STYLES.map(style => (
                    <button
                      key={style.id}
                      onClick={() => setProfile(prev => ({ ...prev, learningStyle: style.id }))}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        profile.learningStyle === style.id
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{style.name}</div>
                      <div className="text-xs text-gray-600">{style.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">How much time can you commit weekly?</label>
                <select
                  value={profile.timeAvailable}
                  onChange={(e) => setProfile(prev => ({ ...prev, timeAvailable: e.target.value }))}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="light">Light (1-2 hours/week)</option>
                  <option value="moderate">Moderate (3-5 hours/week)</option>
                  <option value="intensive">Intensive (6+ hours/week)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Preferred plan duration</label>
                <Input
                  type="number"
                  min="2"
                  max="12"
                  value={profile.preferredDuration}
                  onChange={(e) => setProfile(prev => ({ ...prev, preferredDuration: parseInt(e.target.value) }))}
                  placeholder="weeks"
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={step === 1 || loading}
            >
              Back
            </Button>
            
            {step < 3 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 1 && !profile.goals.length) ||
                  (step === 2 && !profile.interests.length)
                }
                className="gap-2"
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSaveProfile}
                disabled={loading}
                className="gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating Profile...
                  </>
                ) : (
                  'Create Profile & Generate Plans'
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}