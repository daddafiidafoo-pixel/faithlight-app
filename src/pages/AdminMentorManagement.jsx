import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Users, UserPlus, Trash2, CheckCircle, XCircle, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminMentorManagement() {
  const [searchMentor, setSearchMentor] = useState('');
  const [searchMentee, setSearchMentee] = useState('');
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [selectedMentee, setSelectedMentee] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState('');
  const [notes, setNotes] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: allUsers = [] } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: tracks = [] } = useQuery({
    queryKey: ['training-tracks'],
    queryFn: () => base44.entities.TrainingTrack.list('order'),
  });

  const { data: assignments = [] } = useQuery({
    queryKey: ['mentor-assignments'],
    queryFn: () => base44.entities.MentorAssignment.list('-created_date'),
  });

  const createAssignmentMutation = useMutation({
    mutationFn: (data) => base44.entities.MentorAssignment.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentor-assignments'] });
      toast.success('Mentor assigned successfully');
      setDialogOpen(false);
      resetForm();
    },
  });

  const deleteAssignmentMutation = useMutation({
    mutationFn: (id) => base44.entities.MentorAssignment.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentor-assignments'] });
      toast.success('Assignment removed');
    },
  });

  const updateAssignmentMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.MentorAssignment.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentor-assignments'] });
      toast.success('Assignment status updated');
    },
  });

  const resetForm = () => {
    setSelectedMentor(null);
    setSelectedMentee(null);
    setSelectedTrack('');
    setNotes('');
    setSearchMentor('');
    setSearchMentee('');
  };

  const handleCreateAssignment = async () => {
    if (!selectedMentor || !selectedMentee) {
      toast.error('Please select both mentor and mentee');
      return;
    }

    const track = tracks.find(t => t.id === selectedTrack);
    const user = await base44.auth.me();

    createAssignmentMutation.mutate({
      mentor_id: selectedMentor.id,
      mentee_id: selectedMentee.id,
      mentor_name: selectedMentor.full_name,
      mentee_name: selectedMentee.full_name,
      track_id: selectedTrack || null,
      track_name: track ? track.name : 'All Tracks',
      assigned_by: user.id,
      notes: notes,
      status: 'active',
    });
  };

  const filteredMentors = allUsers.filter(u => 
    u.full_name?.toLowerCase().includes(searchMentor.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchMentor.toLowerCase())
  );

  const filteredMentees = allUsers.filter(u => 
    u.full_name?.toLowerCase().includes(searchMentee.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchMentee.toLowerCase())
  );

  const activeAssignments = assignments.filter(a => a.status === 'active');
  const inactiveAssignments = assignments.filter(a => a.status !== 'active');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mentor Management</h1>
            <p className="text-gray-600 mt-1">Assign mentors to guide students through leadership training</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="w-4 h-4" />
                Assign Mentor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Assign Mentor to Student</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {/* Select Mentor */}
                <div>
                  <Label>Select Mentor</Label>
                  <Input
                    placeholder="Search by name or email..."
                    value={searchMentor}
                    onChange={(e) => setSearchMentor(e.target.value)}
                    className="mb-2"
                  />
                  <div className="border rounded-lg max-h-48 overflow-y-auto">
                    {filteredMentors.slice(0, 10).map(user => (
                      <div
                        key={user.id}
                        onClick={() => setSelectedMentor(user)}
                        className={`p-3 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 ${
                          selectedMentor?.id === user.id ? 'bg-indigo-50' : ''
                        }`}
                      >
                        <div className="font-medium">{user.full_name}</div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                      </div>
                    ))}
                  </div>
                  {selectedMentor && (
                    <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                      Selected: <strong>{selectedMentor.full_name}</strong>
                    </div>
                  )}
                </div>

                {/* Select Mentee */}
                <div>
                  <Label>Select Student (Mentee)</Label>
                  <Input
                    placeholder="Search by name or email..."
                    value={searchMentee}
                    onChange={(e) => setSearchMentee(e.target.value)}
                    className="mb-2"
                  />
                  <div className="border rounded-lg max-h-48 overflow-y-auto">
                    {filteredMentees.slice(0, 10).map(user => (
                      <div
                        key={user.id}
                        onClick={() => setSelectedMentee(user)}
                        className={`p-3 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 ${
                          selectedMentee?.id === user.id ? 'bg-indigo-50' : ''
                        }`}
                      >
                        <div className="font-medium">{user.full_name}</div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                      </div>
                    ))}
                  </div>
                  {selectedMentee && (
                    <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                      Selected: <strong>{selectedMentee.full_name}</strong>
                    </div>
                  )}
                </div>

                {/* Select Track */}
                <div>
                  <Label>Training Track (Optional)</Label>
                  <Select value={selectedTrack} onValueChange={setSelectedTrack}>
                    <SelectTrigger>
                      <SelectValue placeholder="All tracks (general mentorship)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>All Tracks</SelectItem>
                      {tracks.map(track => (
                        <SelectItem key={track.id} value={track.id}>
                          {track.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Notes */}
                <div>
                  <Label>Notes (Optional)</Label>
                  <Textarea
                    placeholder="Add any special instructions or context..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={handleCreateAssignment} 
                  disabled={createAssignmentMutation.isPending}
                  className="w-full"
                >
                  {createAssignmentMutation.isPending ? 'Assigning...' : 'Assign Mentor'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Active Assignments */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Active Mentor Assignments ({activeAssignments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeAssignments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No active assignments yet</p>
            ) : (
              <div className="space-y-3">
                {activeAssignments.map(assignment => (
                  <div key={assignment.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div>
                            <div className="font-medium text-lg">
                              {assignment.mentor_name} → {assignment.mentee_name}
                            </div>
                            <div className="text-sm text-gray-600">
                              Track: <span className="font-medium">{assignment.track_name}</span>
                            </div>
                          </div>
                        </div>
                        {assignment.notes && (
                          <p className="text-sm text-gray-600 mt-2 italic">{assignment.notes}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateAssignmentMutation.mutate({ 
                            id: assignment.id, 
                            status: 'completed' 
                          })}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateAssignmentMutation.mutate({ 
                            id: assignment.id, 
                            status: 'inactive' 
                          })}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            if (confirm('Remove this assignment?')) {
                              deleteAssignmentMutation.mutate(assignment.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Completed/Inactive Assignments */}
        {inactiveAssignments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-600">Completed/Inactive Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {inactiveAssignments.map(assignment => (
                  <div key={assignment.id} className="border rounded-lg p-3 bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">
                          {assignment.mentor_name} → {assignment.mentee_name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {assignment.track_name} • <Badge variant="outline">{assignment.status}</Badge>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateAssignmentMutation.mutate({ 
                          id: assignment.id, 
                          status: 'active' 
                        })}
                      >
                        Reactivate
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}