import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Target, BookOpen, Heart, Sparkles, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ComprehensiveProfileBuilder({ user, onComplete }) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({
    spiritual_goals: [],
    learning_goals: [],
    ministry_goals: [],
    learning_style: '',
    study_preferences: [],
    spiritual_disciplines: [],
    discipline_frequency: {},
    areas_of_growth: [],
    theological_interests: [],
    preferred_content_depth: 'medium',
    time_availability: '',
    accountability_preference: '',
    sermon_prep_focus: []
  });

  useEffect(() => {
    if (user?.comprehensive_profile) {
      setProfile(user.comprehensive_profile);
    }
  }, [user]);

  const spiritualGoalsOptions = [
    'Grow in prayer life',
    'Deepen Bible knowledge',
    'Share faith more confidently',
    'Develop spiritual disciplines',
    'Understand theology better',
    'Overcome specific struggles',
    'Lead others spiritually',
    'Serve in ministry'
  ];

  const learningGoalsOptions = [
    'Complete Bible reading plan',
    'Master a book of the Bible',
    'Learn original languages',
    'Study systematic theology',
    'Prepare for teaching/preaching',
    'Understand apologetics',
    'Learn church history',
    'Develop exegetical skills'
  ];

  const ministryGoalsOptions = [
    'Become a better preacher',
    'Lead small groups',
    'Disciple others',
    'Teach Sunday school',
    'Counsel effectively',
    'Plant or lead a church',
    'Youth ministry',
    'Missionary work'
  ];

  const learningStyleOptions = [
    { value: 'visual', label: 'Visual - I learn best through charts, diagrams, and images' },
    { value: 'auditory', label: 'Auditory - I learn best through listening and discussion' },
    { value: 'reading', label: 'Reading/Writing - I learn best through reading and taking notes' },
    { value: 'kinesthetic', label: 'Hands-on - I learn best through practice and application' }
  ];

  const studyPreferencesOptions = [
    'In-depth verse-by-verse study',
    'Big picture overview',
    'Practical application focus',
    'Historical/cultural context',
    'Word studies (Greek/Hebrew)',
    'Cross-referencing Scripture',
    'Devotional reflection',
    'Systematic theology'
  ];

  const spiritualDisciplinesOptions = [
    'Daily Bible reading',
    'Prayer and intercession',
    'Fasting',
    'Scripture memorization',
    'Journaling',
    'Meditation',
    'Corporate worship',
    'Solitude and silence',
    'Service to others',
    'Giving/Generosity',
    'Confession',
    'Spiritual reading'
  ];

  const areasOfGrowthOptions = [
    'Prayer consistency',
    'Bible study habits',
    'Sharing faith',
    'Resisting temptation',
    'Forgiveness',
    'Patience',
    'Love for others',
    'Trust in God',
    'Contentment',
    'Wisdom in decisions',
    'Handling anxiety',
    'Breaking addictions'
  ];

  const theologicalInterestsOptions = [
    'Soteriology (Salvation)',
    'Pneumatology (Holy Spirit)',
    'Ecclesiology (Church)',
    'Eschatology (End times)',
    'Christology (Jesus)',
    'Theodicy (Evil & suffering)',
    'Biblical ethics',
    'Worship theology',
    'Covenant theology',
    'Kingdom theology',
    'Missiology',
    'Spiritual gifts'
  ];

  const sermonPrepFocusOptions = [
    'Expository preaching',
    'Topical sermons',
    'Evangelistic messages',
    'Pastoral care',
    'Apologetics',
    'Social justice',
    'Family/relationships',
    'Spiritual growth',
    'Prophetic teaching',
    'Practical living'
  ];

  const handleSave = async () => {
    try {
      await base44.auth.updateMe({
        comprehensive_profile: profile
      });
      toast.success('Profile updated successfully!');
      if (onComplete) onComplete(profile);
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const toggleSelection = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }));
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-600" />
            Build Your Personalized Profile
          </CardTitle>
          <p className="text-sm text-gray-600">
            Help us understand your spiritual journey to provide tailored recommendations
          </p>
          <div className="flex gap-2 mt-4">
            {[1, 2, 3, 4].map(num => (
              <div
                key={num}
                className={`flex-1 h-2 rounded-full ${
                  step >= num ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-semibold text-lg">Your Spiritual Goals</h3>
                </div>
                <div className="space-y-2">
                  {spiritualGoalsOptions.map(goal => (
                    <div key={goal} className="flex items-center space-x-2">
                      <Checkbox
                        checked={profile.spiritual_goals.includes(goal)}
                        onCheckedChange={() => toggleSelection('spiritual_goals', goal)}
                      />
                      <Label className="cursor-pointer">{goal}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-4">Learning Goals</h3>
                <div className="space-y-2">
                  {learningGoalsOptions.map(goal => (
                    <div key={goal} className="flex items-center space-x-2">
                      <Checkbox
                        checked={profile.learning_goals.includes(goal)}
                        onCheckedChange={() => toggleSelection('learning_goals', goal)}
                      />
                      <Label className="cursor-pointer">{goal}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-4">Ministry Aspirations</h3>
                <div className="space-y-2">
                  {ministryGoalsOptions.map(goal => (
                    <div key={goal} className="flex items-center space-x-2">
                      <Checkbox
                        checked={profile.ministry_goals.includes(goal)}
                        onCheckedChange={() => toggleSelection('ministry_goals', goal)}
                      />
                      <Label className="cursor-pointer">{goal}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-semibold text-lg">Learning Style</h3>
                </div>
                <div className="space-y-3">
                  {learningStyleOptions.map(style => (
                    <div
                      key={style.value}
                      onClick={() => setProfile(prev => ({ ...prev, learning_style: style.value }))}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                        profile.learning_style === style.value
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="font-medium">{style.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-4">Study Preferences</h3>
                <div className="space-y-2">
                  {studyPreferencesOptions.map(pref => (
                    <div key={pref} className="flex items-center space-x-2">
                      <Checkbox
                        checked={profile.study_preferences.includes(pref)}
                        onCheckedChange={() => toggleSelection('study_preferences', pref)}
                      />
                      <Label className="cursor-pointer">{pref}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-4">Content Depth Preference</h3>
                <div className="grid grid-cols-3 gap-3">
                  {['simple', 'medium', 'advanced'].map(depth => (
                    <Button
                      key={depth}
                      variant={profile.preferred_content_depth === depth ? 'default' : 'outline'}
                      onClick={() => setProfile(prev => ({ ...prev, preferred_content_depth: depth }))}
                    >
                      {depth === 'simple' ? 'Beginner' : depth === 'medium' ? 'Intermediate' : 'Advanced'}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-semibold text-lg">Spiritual Disciplines</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Select disciplines you practice or want to develop
                </p>
                <div className="space-y-2">
                  {spiritualDisciplinesOptions.map(discipline => (
                    <div key={discipline} className="flex items-center space-x-2">
                      <Checkbox
                        checked={profile.spiritual_disciplines.includes(discipline)}
                        onCheckedChange={() => toggleSelection('spiritual_disciplines', discipline)}
                      />
                      <Label className="cursor-pointer">{discipline}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-4">Areas for Growth</h3>
                <div className="space-y-2">
                  {areasOfGrowthOptions.map(area => (
                    <div key={area} className="flex items-center space-x-2">
                      <Checkbox
                        checked={profile.areas_of_growth.includes(area)}
                        onCheckedChange={() => toggleSelection('areas_of_growth', area)}
                      />
                      <Label className="cursor-pointer">{area}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-4">Theological Interests</h3>
                <div className="space-y-2">
                  {theologicalInterestsOptions.map(interest => (
                    <div key={interest} className="flex items-center space-x-2">
                      <Checkbox
                        checked={profile.theological_interests.includes(interest)}
                        onCheckedChange={() => toggleSelection('theological_interests', interest)}
                      />
                      <Label className="cursor-pointer">{interest}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {(user?.user_role === 'pastor' || user?.user_role === 'teacher') && (
                <div>
                  <h3 className="font-semibold text-lg mb-4">Sermon Prep Focus Areas</h3>
                  <div className="space-y-2">
                    {sermonPrepFocusOptions.map(focus => (
                      <div key={focus} className="flex items-center space-x-2">
                        <Checkbox
                          checked={profile.sermon_prep_focus.includes(focus)}
                          onCheckedChange={() => toggleSelection('sermon_prep_focus', focus)}
                        />
                        <Label className="cursor-pointer">{focus}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium">Weekly Time Availability</Label>
                <Input
                  placeholder="e.g., 5 hours per week"
                  value={profile.time_availability}
                  onChange={(e) => setProfile(prev => ({ ...prev, time_availability: e.target.value }))}
                  className="mt-2"
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-6 border-t">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
                Previous
              </Button>
            )}
            {step < 4 ? (
              <Button onClick={() => setStep(step + 1)} className="flex-1">
                Next
              </Button>
            ) : (
              <Button onClick={handleSave} className="flex-1 gap-2">
                <CheckCircle className="w-4 h-4" />
                Complete Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}