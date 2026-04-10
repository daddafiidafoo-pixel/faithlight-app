import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Search, Award, Clock, CheckCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function FindMentor() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expertiseFilter, setExpertiseFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [connectionNote, setConnectionNote] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  const { data: mentors = [] } = useQuery({
    queryKey: ['mentors'],
    queryFn: () => base44.entities.MentorProfile.filter({ is_active: true }),
  });

  const { data: myConnections = [] } = useQuery({
    queryKey: ['my-connections', user?.id],
    queryFn: () => base44.entities.MentorshipConnection.filter({ mentee_id: user.id }),
    enabled: !!user,
  });

  const { data: tracks = [] } = useQuery({
    queryKey: ['training-tracks'],
    queryFn: () => base44.entities.TrainingTrack.list(),
  });

  const requestConnectionMutation = useMutation({
    mutationFn: async (mentorId) => {
      const mentor = mentors.find(m => m.user_id === mentorId);
      return await base44.entities.MentorshipConnection.create({
        mentor_id: mentorId,
        mentee_id: user.id,
        mentor_name: mentor.full_name,
        mentee_name: user.full_name,
        status: 'pending',
        focus_areas: [],
        notes: connectionNote,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-connections']);
      toast.success('Connection request sent!');
      setSelectedMentor(null);
      setConnectionNote('');
    },
  });

  const getTrackName = (trackId) => {
    const track = tracks.find(t => t.id === trackId);
    return track ? track.name : 'Unknown';
  };

  const allExpertiseAreas = [...new Set(mentors.flatMap(m => m.areas_of_expertise || []))];

  const filteredMentors = mentors.filter(mentor => {
    // Don't show own profile
    if (mentor.user_id === user?.id) return false;
    
    // Check if already connected
    const isConnected = myConnections.some(c => c.mentor_id === mentor.user_id && c.status !== 'declined');
    if (isConnected) return false;

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesName = mentor.full_name.toLowerCase().includes(searchLower);
      const matchesBio = mentor.bio?.toLowerCase().includes(searchLower);
      const matchesExpertise = mentor.areas_of_expertise?.some(a => a.toLowerCase().includes(searchLower));
      if (!matchesName && !matchesBio && !matchesExpertise) return false;
    }

    // Expertise filter
    if (expertiseFilter !== 'all') {
      if (!mentor.areas_of_expertise?.includes(expertiseFilter)) return false;
    }

    // Availability filter
    if (availabilityFilter !== 'all') {
      if (mentor.availability_status !== availabilityFilter) return false;
    }

    return true;
  });

  const getConnectionStatus = (mentorId) => {
    return myConnections.find(c => c.mentor_id === mentorId)?.status;
  };

  if (!user) return <div className="p-12 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Find a Mentor</h1>
          <p className="text-xl text-gray-600">
            Connect with experienced leaders who can guide your spiritual and ministry growth
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, expertise, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={expertiseFilter} onValueChange={setExpertiseFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by expertise" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Expertise Areas</SelectItem>
                  {allExpertiseAreas.map(area => (
                    <SelectItem key={area} value={area}>{area}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Availability</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="limited">Limited Availability</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Mentor Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMentors.map(mentor => (
            <Card key={mentor.id} className="hover:shadow-xl transition-all">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <CardTitle className="text-xl">{mentor.full_name}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Award className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{mentor.years_of_experience || 0} years experience</span>
                    </div>
                  </div>
                  <Badge 
                    className={
                      mentor.availability_status === 'available' 
                        ? 'bg-green-100 text-green-800' 
                        : mentor.availability_status === 'limited'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }
                  >
                    {mentor.availability_status}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-3">{mentor.bio}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Areas of Expertise:</p>
                  <div className="flex flex-wrap gap-1">
                    {mentor.areas_of_expertise?.slice(0, 3).map((area, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {area}
                      </Badge>
                    ))}
                    {mentor.areas_of_expertise?.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{mentor.areas_of_expertise.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {mentor.completed_tracks?.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Completed Training:</p>
                    <div className="space-y-1">
                      {mentor.completed_tracks.slice(0, 2).map((trackId, idx) => (
                        <div key={idx} className="flex items-center gap-1 text-xs text-gray-600">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                          {getTrackName(trackId)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button 
                  onClick={() => setSelectedMentor(mentor)}
                  disabled={mentor.availability_status === 'unavailable'}
                  className="w-full"
                >
                  Request Connection
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMentors.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No mentors found matching your criteria</p>
          </div>
        )}

        {/* Connection Request Dialog */}
        <Dialog open={!!selectedMentor} onOpenChange={() => setSelectedMentor(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Mentorship Connection</DialogTitle>
              <DialogDescription>
                Send a connection request to {selectedMentor?.full_name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Why do you want to connect with this mentor?</Label>
                <Textarea
                  placeholder="Tell the mentor about your goals and why you think they would be a good fit..."
                  value={connectionNote}
                  onChange={(e) => setConnectionNote(e.target.value)}
                  className="h-32"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => requestConnectionMutation.mutate(selectedMentor?.user_id)}
                  disabled={requestConnectionMutation.isPending || !connectionNote}
                  className="flex-1"
                >
                  Send Request
                </Button>
                <Button variant="outline" onClick={() => setSelectedMentor(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}