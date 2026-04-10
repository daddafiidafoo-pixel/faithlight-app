import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, X, Target, Calendar, BookOpen } from 'lucide-react';

const LEARNING_GOALS = [
  'Deepen Biblical Knowledge',
  'Develop Spiritual Maturity',
  'Understand Theology',
  'Apply Scripture to Daily Life',
  'Build Prayer Life',
  'Study a Specific Book',
  'Explore Bible Themes',
  'Prepare for Teaching'
];

const STUDY_DURATIONS = [
  { value: '2', label: '2 weeks (14 days)' },
  { value: '4', label: '4 weeks (28 days)' },
  { value: '6', label: '6 weeks (42 days)' },
  { value: '8', label: '8 weeks (56 days)' },
  { value: '12', label: '12 weeks (84 days)' },
  { value: '16', label: '16 weeks (112 days)' }
];

const TIME_COMMITMENT = [
  { value: '15', label: '15 minutes per day' },
  { value: '30', label: '30 minutes per day' },
  { value: '45', label: '45 minutes per day' },
  { value: '60', label: '1 hour per day' },
  { value: '90', label: '1.5 hours per day' }
];

const LEARNING_STYLES = [
  { value: 'visual', label: 'Visual - Charts, diagrams, maps' },
  { value: 'auditory', label: 'Auditory - Listen and discuss' },
  { value: 'kinesthetic', label: 'Kinesthetic - Apply and practice' },
  { value: 'reading', label: 'Reading/Writing - Deep study and reflection' }
];

export default function EnhancedStudyPlanForm({ onSubmit, isLoading = false }) {
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [customGoal, setCustomGoal] = useState('');
  const [duration, setDuration] = useState('4');
  const [timePerDay, setTimePerDay] = useState('30');
  const [learningStyle, setLearningStyle] = useState('visual');
  const [focusAreas, setFocusAreas] = useState('');
  const [specificBooks, setSpecificBooks] = useState('');
  const [challenges, setChallenges] = useState('');

  const handleToggleGoal = (goal) => {
    setSelectedGoals(prev =>
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    );
  };

  const handleAddCustomGoal = () => {
    if (customGoal.trim() && !selectedGoals.includes(customGoal)) {
      setSelectedGoals([...selectedGoals, customGoal]);
      setCustomGoal('');
    }
  };

  const handleRemoveGoal = (goal) => {
    setSelectedGoals(prev => prev.filter(g => g !== goal));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (selectedGoals.length === 0) {
      alert('Please select at least one learning goal');
      return;
    }

    onSubmit({
      goals: selectedGoals,
      duration: parseInt(duration),
      durationDays: parseInt(duration) * 7,
      timePerDay: parseInt(timePerDay),
      learningStyle,
      focusAreas: focusAreas.trim(),
      specificBooks: specificBooks.trim(),
      challenges: challenges.trim(),
      totalMinutes: parseInt(duration) * 7 * parseInt(timePerDay)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Learning Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Learning Goals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {LEARNING_GOALS.map(goal => (
              <label key={goal} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <Checkbox
                  checked={selectedGoals.includes(goal)}
                  onCheckedChange={() => handleToggleGoal(goal)}
                />
                <span className="text-sm font-medium">{goal}</span>
              </label>
            ))}
          </div>

          <div className="space-y-2 pt-2 border-t">
            <label className="text-sm font-medium block">Add Custom Goal</label>
            <div className="flex gap-2">
              <Input
                value={customGoal}
                onChange={(e) => setCustomGoal(e.target.value)}
                placeholder="E.g., 'Master the Psalms'"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomGoal();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddCustomGoal}
                disabled={!customGoal.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {selectedGoals.length > 0 && (
            <div className="pt-2 space-y-2">
              <label className="text-sm font-medium block">Selected Goals:</label>
              <div className="flex flex-wrap gap-2">
                {selectedGoals.map(goal => (
                  <div
                    key={goal}
                    className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {goal}
                    <button
                      type="button"
                      onClick={() => handleRemoveGoal(goal)}
                      className="hover:text-blue-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Study Duration & Time Commitment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Duration & Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-2">Study Duration</label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STUDY_DURATIONS.map(d => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Daily Time Commitment</label>
            <Select value={timePerDay} onValueChange={setTimePerDay}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_COMMITMENT.map(t => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg text-sm">
            <p className="font-medium text-blue-900">
              Total commitment: {(parseInt(duration) * 7 * parseInt(timePerDay) / 60).toFixed(1)} hours over {duration} weeks
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Learning Style & Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Learning Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-2">Preferred Learning Style</label>
            <Select value={learningStyle} onValueChange={setLearningStyle}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEARNING_STYLES.map(style => (
                  <SelectItem key={style.value} value={style.value}>
                    {style.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Focus Areas (Optional)</label>
            <Textarea
              value={focusAreas}
              onChange={(e) => setFocusAreas(e.target.value)}
              placeholder="E.g., 'Gospel of John', 'Old Testament history', 'Christian living'"
              rows={2}
            />
            <p className="text-xs text-gray-600 mt-1">Specific biblical topics or themes you want to focus on</p>
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Specific Books to Study (Optional)</label>
            <Textarea
              value={specificBooks}
              onChange={(e) => setSpecificBooks(e.target.value)}
              placeholder="E.g., 'Romans', 'Ephesians', '1 Peter'"
              rows={2}
            />
            <p className="text-xs text-gray-600 mt-1">Bible books you'd like to prioritize</p>
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Learning Challenges (Optional)</label>
            <Textarea
              value={challenges}
              onChange={(e) => setChallenges(e.target.value)}
              placeholder="E.g., 'Limited time for in-depth study', 'Difficulty with Old Testament genealogies'"
              rows={2}
            />
            <p className="text-xs text-gray-600 mt-1">Let the AI know about any learning challenges so it can adapt the plan</p>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex gap-3">
        <Button
          type="submit"
          size="lg"
          className="flex-1"
          disabled={isLoading || selectedGoals.length === 0}
        >
          {isLoading ? 'Generating Plan...' : 'Generate Personalized Plan'}
        </Button>
      </div>
    </form>
  );
}