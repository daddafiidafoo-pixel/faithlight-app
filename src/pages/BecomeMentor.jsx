import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Award, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function BecomeMentor() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [profileType, setProfileType] = useState(''); // 'mentor' or 'mentee'
  
  const [mentorData, setMentorData] = useState({
    bio: '',
    areas_of_expertise: [],
    max_mentees: 5,
    years_of_experience: 0,
  });

  const [menteeData, setMenteeData] = useState({
    bio: '',
    interests: [],
    goals: '',
  });

  const [expertiseInput, setExpertiseInput] = useState('');
  const [interestInput, setInterestInput] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  const { data: mentorProfile } = useQuery({
    queryKey: ['mentor-profile', user?.id],
    queryFn: () => base44.entities.MentorProfile.filter({ user_id: user.id }),
    enabled: !!user,
  });

  const { data: menteeProfile } = useQuery({
    queryKey: ['mentee-profile', user?.id],
    queryFn: () => base44.entities.MenteeProfile.filter({ user_id: user.id }),
    enabled: !!user,
  });

  const { data: completedTracks = [] } = useQuery({
    queryKey: ['user-certificates', user?.id],
    queryFn: async () => {
      const certs = await base44.entities.TrainingCertificate.filter({ user_id: user.id });
      return certs.map(c => c.track_id);
    },
    enabled: !!user,
  });

  const { data: currentTracks = [] } = useQuery({
    queryKey: ['user-current-tracks', user?.id],
    queryFn: async () => {
      const progress = await base44.entities.UserTrainingProgress.filter({ user_id: user.id });
      const uniqueCourses = [...new Set(progress.map(p => p.course_id))];
      const courses = await base44.entities.TrainingCourse.list();
      return [...new Set(courses.filter(c => uniqueCourses.includes(c.id)).map(c => c.track_id))];
    },
    enabled: !!user,
  });

  const createMentorMutation = useMutation({
    mutationFn: async () => {
      return await base44.entities.MentorProfile.create({
        user_id: user.id,
        full_name: user.full_name,
        bio: mentorData.bio,
        areas_of_expertise: mentorData.areas_of_expertise,
        completed_tracks: completedTracks,
        max_mentees: mentorData.max_mentees,
        years_of_experience: mentorData.years_of_experience,
        availability_status: 'available',
        is_active: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['mentor-profile']);
      toast.success('Mentor profile created successfully!');
    },
  });

  const createMenteeMutation = useMutation({
    mutationFn: async () => {
      return await base44.entities.MenteeProfile.create({
        user_id: user.id,
        full_name: user.full_name,
        bio: menteeData.bio,
        interests: menteeData.interests,
        current_tracks: currentTracks,
        goals: menteeData.goals,
        is_seeking: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['mentee-profile']);
      toast.success('Mentee profile created successfully!');
    },
  });

  const addExpertise = () => {
    if (expertiseInput.trim()) {
      setMentorData(prev => ({
        ...prev,
        areas_of_expertise: [...prev.areas_of_expertise, expertiseInput.trim()]
      }));
      setExpertiseInput('');
    }
  };

  const removeExpertise = (index) => {
    setMentorData(prev => ({
      ...prev,
      areas_of_expertise: prev.areas_of_expertise.filter((_, i) => i !== index)
    }));
  };

  const addInterest = () => {
    if (interestInput.trim()) {
      setMenteeData(prev => ({
        ...prev,
        interests: [...prev.interests, interestInput.trim()]
      }));
      setInterestInput('');
    }
  };

  const removeInterest = (index) => {
    setMenteeData(prev => ({
      ...prev,
      interests: prev.interests.filter((_, i) => i !== index)
    }));
  };

  const hasMentorProfile = mentorProfile && mentorProfile.length > 0;
  const hasMenteeProfile = menteeProfile && menteeProfile.length > 0;

  if (!user) return <div className="p-12 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Mentorship Program</h1>
          <p className="text-xl text-gray-600">
            Join as a mentor to guide others, or as a mentee to receive guidance
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className={hasMentorProfile ? 'border-2 border-green-500' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-6 h-6" />
                Mentor Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hasMentorProfile ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Active Mentor</span>
                </div>
              ) : (
                <p className="text-gray-600">Not registered as a mentor</p>
              )}
            </CardContent>
          </Card>

          <Card className={hasMenteeProfile ? 'border-2 border-green-500' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-6 h-6" />
                Mentee Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hasMenteeProfile ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Active Mentee</span>
                </div>
              ) : (
                <p className="text-gray-600">Not registered as a mentee</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Profile Type Selection */}
        {!hasMentorProfile && !hasMenteeProfile && !profileType && (
          <Card>
            <CardHeader>
              <CardTitle>Choose Your Role</CardTitle>
              <CardDescription>Select whether you want to be a mentor, mentee, or both</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => setProfileType('mentor')}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                size="lg"
              >
                <Users className="w-5 h-5 mr-2" />
                Become a Mentor
              </Button>
              <Button 
                onClick={() => setProfileType('mentee')}
                className="w-full bg-purple-600 hover:bg-purple-700"
                size="lg"
              >
                <Award className="w-5 h-5 mr-2" />
                Become a Mentee
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Mentor Profile Form */}
        {!hasMentorProfile && (profileType === 'mentor' || (hasMenteeProfile && !hasMentorProfile)) && (
          <Card>
            <CardHeader>
              <CardTitle>Create Mentor Profile</CardTitle>
              <CardDescription>Share your expertise and help others grow</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Bio / Introduction</Label>
                <Textarea
                  placeholder="Tell potential mentees about your background, experience, and mentoring philosophy..."
                  value={mentorData.bio}
                  onChange={(e) => setMentorData({ ...mentorData, bio: e.target.value })}
                  className="h-32"
                />
              </div>

              <div>
                <Label>Areas of Expertise</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="e.g., Leadership, Biblical Studies, Youth Ministry"
                    value={expertiseInput}
                    onChange={(e) => setExpertiseInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addExpertise()}
                  />
                  <Button onClick={addExpertise}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {mentorData.areas_of_expertise.map((area, idx) => (
                    <Badge key={idx} variant="secondary" className="cursor-pointer" onClick={() => removeExpertise(idx)}>
                      {area} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Years of Ministry/Leadership Experience</Label>
                <Input
                  type="number"
                  value={mentorData.years_of_experience}
                  onChange={(e) => setMentorData({ ...mentorData, years_of_experience: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div>
                <Label>Maximum Number of Mentees</Label>
                <Select
                  value={mentorData.max_mentees.toString()}
                  onValueChange={(val) => setMentorData({ ...mentorData, max_mentees: parseInt(val) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 mentee</SelectItem>
                    <SelectItem value="3">3 mentees</SelectItem>
                    <SelectItem value="5">5 mentees</SelectItem>
                    <SelectItem value="10">10 mentees</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={() => createMentorMutation.mutate()}
                disabled={createMentorMutation.isPending || !mentorData.bio}
                className="w-full"
              >
                Create Mentor Profile
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Mentee Profile Form */}
        {!hasMenteeProfile && (profileType === 'mentee' || (hasMentorProfile && !hasMenteeProfile)) && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Create Mentee Profile</CardTitle>
              <CardDescription>Find a mentor to guide your spiritual and leadership journey</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Bio / Background</Label>
                <Textarea
                  placeholder="Tell potential mentors about yourself, your current ministry/role, and where you are in your journey..."
                  value={menteeData.bio}
                  onChange={(e) => setMenteeData({ ...menteeData, bio: e.target.value })}
                  className="h-32"
                />
              </div>

              <div>
                <Label>Areas of Interest</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="e.g., Leadership Development, Preaching, Discipleship"
                    value={interestInput}
                    onChange={(e) => setInterestInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                  />
                  <Button onClick={addInterest}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {menteeData.interests.map((interest, idx) => (
                    <Badge key={idx} variant="secondary" className="cursor-pointer" onClick={() => removeInterest(idx)}>
                      {interest} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Mentorship Goals</Label>
                <Textarea
                  placeholder="What do you hope to achieve through mentorship? What specific areas do you want to grow in?"
                  value={menteeData.goals}
                  onChange={(e) => setMenteeData({ ...menteeData, goals: e.target.value })}
                  className="h-32"
                />
              </div>

              <Button 
                onClick={() => createMenteeMutation.mutate()}
                disabled={createMenteeMutation.isPending || !menteeData.bio}
                className="w-full"
              >
                Create Mentee Profile
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Both Profiles Exist */}
        {hasMentorProfile && hasMenteeProfile && (
          <Card>
            <CardHeader>
              <CardTitle>Your Mentorship Profiles</CardTitle>
              <CardDescription>You are registered as both a mentor and mentee</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-semibold">Mentor Profile Active</span>
                </div>
                <Button variant="outline" onClick={() => window.location.href = '/MentorDashboard'}>
                  View Dashboard
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-semibold">Mentee Profile Active</span>
                </div>
                <Button variant="outline" onClick={() => window.location.href = '/FindMentor'}>
                  Find Mentors
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}