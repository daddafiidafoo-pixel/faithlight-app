import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

const SPIRITUAL_GIFTS = [
  'Teaching', 'Prophecy', 'Encouragement', 'Giving', 'Leadership',
  'Mercy', 'Service', 'Administration', 'Healing', 'Faith'
];

const EXPERTISE_OPTIONS = [
  'Old Testament', 'New Testament', 'Greek', 'Hebrew', 'Theology',
  'Bible History', 'Preaching', 'Teaching', 'Discipleship', 'Counseling'
];

const INTEREST_OPTIONS = [
  'Bible Study', 'Prayer', 'Worship', 'Theology', 'Youth Ministry',
  'Women\'s Ministry', 'Men\'s Ministry', 'Marriage', 'Parenting',
  'Discipleship', 'Missions'
];

export default function ExpandedProfileForm({ user, onSaved }) {
  const [bio, setBio] = useState(user?.bio || '');
  const [spiritualGifts, setSpiritualGifts] = useState(user?.spiritual_gifts || []);
  const [expertiseAreas, setExpertiseAreas] = useState(user?.expertise_areas || []);
  const [learningGoals, setLearningGoals] = useState(user?.learning_goals || []);
  const [interests, setInterests] = useState(user?.interests || []);
  const [seekingMentorship, setSeekingMentorship] = useState(user?.seeking_mentorship || false);
  const [willingToMentor, setWillingToMentor] = useState(user?.willing_to_mentor || false);
  const [mentorExperience, setMentorExperience] = useState(user?.mentor_experience_years || '');
  const [isLoading, setIsLoading] = useState(false);

  const [newGoal, setNewGoal] = useState('');

  const toggleArray = (array, item) => {
    if (array.includes(item)) {
      return array.filter(i => i !== item);
    } else {
      return [...array, item];
    }
  };

  const addGoal = (goal) => {
    if (goal.trim() && !learningGoals.includes(goal.trim())) {
      setLearningGoals([...learningGoals, goal.trim()]);
      setNewGoal('');
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await base44.auth.updateMe({
        bio: bio.trim(),
        spiritual_gifts: spiritualGifts,
        expertise_areas: expertiseAreas,
        learning_goals: learningGoals,
        interests: interests,
        seeking_mentorship: seekingMentorship,
        willing_to_mentor: willingToMentor,
        mentor_experience_years: mentorExperience ? parseInt(mentorExperience) : null,
      });
      toast.success('Profile updated!');
      onSaved?.();
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Bio */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">About Me</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about yourself, your faith journey, and what you're passionate about..."
            className="h-24"
          />
          <p className="text-xs text-gray-500">{bio.length}/500 characters</p>
        </CardContent>
      </Card>

      {/* Spiritual Gifts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Spiritual Gifts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">Select the spiritual gifts you identify with</p>
          <div className="grid grid-cols-2 gap-3">
            {SPIRITUAL_GIFTS.map((gift) => (
              <label key={gift} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={spiritualGifts.includes(gift)}
                  onCheckedChange={() => setSpiritualGifts(toggleArray(spiritualGifts, gift))}
                />
                <span className="text-sm">{gift}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Expertise Areas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Areas of Expertise</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">What are you knowledgeable about?</p>
          <div className="grid grid-cols-2 gap-3">
            {EXPERTISE_OPTIONS.map((area) => (
              <label key={area} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={expertiseAreas.includes(area)}
                  onCheckedChange={() => setExpertiseAreas(toggleArray(expertiseAreas, area))}
                />
                <span className="text-sm">{area}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Learning Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Learning Goals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">What do you want to learn or achieve?</p>
          <div className="space-y-2">
            {learningGoals.map((goal, idx) => (
              <div key={idx} className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-900">{goal}</span>
                <button
                  onClick={() => setLearningGoals(learningGoals.filter((_, i) => i !== idx))}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              placeholder="Add a learning goal..."
              onKeyPress={(e) => e.key === 'Enter' && addGoal(newGoal)}
            />
            <Button
              onClick={() => addGoal(newGoal)}
              variant="outline"
              size="sm"
              disabled={!newGoal.trim()}
            >
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Interests */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Interests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">Select topics you're interested in</p>
          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map((interest) => (
              <button
                key={interest}
                onClick={() => setInterests(toggleArray(interests, interest))}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  interests.includes(interest)
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mentorship Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Mentorship Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              checked={seekingMentorship}
              onCheckedChange={setSeekingMentorship}
              className="mt-1"
            />
            <div>
              <p className="font-medium text-gray-900">Looking for a mentor</p>
              <p className="text-xs text-gray-600">I'd like to be mentored by someone with more experience</p>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              checked={willingToMentor}
              onCheckedChange={setWillingToMentor}
              className="mt-1"
            />
            <div>
              <p className="font-medium text-gray-900">Willing to mentor others</p>
              <p className="text-xs text-gray-600">I'd like to share my knowledge and experience</p>
            </div>
          </label>

          {willingToMentor && (
            <Input
              type="number"
              value={mentorExperience}
              onChange={(e) => setMentorExperience(e.target.value)}
              placeholder="Years of mentoring experience"
              min="0"
            />
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={isLoading}
        className="w-full bg-indigo-600 hover:bg-indigo-700"
        size="lg"
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
        Save Profile Changes
      </Button>
    </div>
  );
}