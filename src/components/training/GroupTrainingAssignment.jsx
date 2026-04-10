import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { BookOpen, Plus, Check, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function GroupTrainingAssignment({ groupId, isOwner }) {
  const queryClient = useQueryClient();
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedTracks, setSelectedTracks] = useState([]);

  const { data: group } = useQuery({
    queryKey: ['group', groupId],
    queryFn: async () => {
      const groups = await base44.entities.Group.filter({ id: groupId });
      return groups[0];
    },
  });

  const { data: allTracks = [] } = useQuery({
    queryKey: ['training-tracks'],
    queryFn: () => base44.entities.TrainingTrack.list(),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['assigned-courses', groupId],
    queryFn: async () => {
      if (!group?.assigned_training_ids?.length) return [];
      const allCourses = await base44.entities.TrainingCourse.list();
      return allCourses.filter(c => group.assigned_training_ids.includes(c.track_id));
    },
    enabled: !!group,
  });

  const { data: memberProgress = [] } = useQuery({
    queryKey: ['group-training-progress', groupId],
    queryFn: async () => {
      const groupMembers = await base44.entities.GroupMember.filter({
        group_id: groupId,
        status: 'active',
      });
      const memberIds = groupMembers.map(m => m.user_id);

      if (!memberIds.length) return [];

      const allProgress = await base44.entities.UserTrainingProgress.list();
      return allProgress.filter(p => memberIds.includes(p.user_id));
    },
    enabled: !!groupId,
  });

  const assignTrainingMutation = useMutation({
    mutationFn: async () => {
      return await base44.entities.Group.update(groupId, {
        assigned_training_ids: selectedTracks,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['group', groupId]);
      queryClient.invalidateQueries(['assigned-courses', groupId]);
      toast.success('Training assigned to group!');
      setAssignDialogOpen(false);
      setSelectedTracks([]);
    },
  });

  const removeTrainingMutation = useMutation({
    mutationFn: async (trackId) => {
      const updated = (group?.assigned_training_ids || []).filter(id => id !== trackId);
      return await base44.entities.Group.update(groupId, {
        assigned_training_ids: updated,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['group', groupId]);
      queryClient.invalidateQueries(['assigned-courses', groupId]);
      toast.success('Training removed');
    },
  });

  const getProgressStats = () => {
    if (!memberProgress.length) return { total: 0, completed: 0 };
    const completed = memberProgress.filter(p => p.status === 'completed').length;
    const total = memberProgress.length;
    return { completed, total };
  };

  const stats = getProgressStats();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Assigned Training
          </CardTitle>
          {isOwner && (
            <Button
              onClick={() => {
                setSelectedTracks(group?.assigned_training_ids || []);
                setAssignDialogOpen(true);
              }}
              size="sm"
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Assign Training
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {!courses.length ? (
            <p className="text-gray-500 text-center py-6">No training assigned yet</p>
          ) : (
            <div className="space-y-4">
              {allTracks.map(track => {
                if (!group?.assigned_training_ids?.includes(track.id)) return null;

                const trackCourses = courses.filter(c => c.track_id === track.id);
                const trackProgress = memberProgress.filter(
                  p => p.track_id === track.id && p.status === 'completed'
                );

                return (
                  <div key={track.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold">{track.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{track.description}</p>
                      </div>
                      {isOwner && (
                        <Button
                          onClick={() => removeTrainingMutation.mutate(track.id)}
                          variant="ghost"
                          size="sm"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-3">
                      <Badge variant="outline">{trackCourses.length} courses</Badge>
                      <Badge className="bg-green-100 text-green-800">
                        {trackProgress.length}/{stats.total} members completed
                      </Badge>
                    </div>

                    {trackCourses.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {trackCourses.map(course => (
                          <div key={course.id} className="text-sm ml-2 py-1">
                            <p className="text-gray-700">
                              • {course.title} ({course.estimated_hours}h)
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Member Progress */}
      {stats.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Member Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${(stats.completed / stats.total) * 100}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-3">
              {stats.completed} of {stats.total} members have completed their training
            </p>
          </CardContent>
        </Card>
      )}

      {/* Assignment Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Training to Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {allTracks.map(track => (
              <div key={track.id} className="flex items-start gap-3 p-3 border rounded-lg">
                <Checkbox
                  checked={selectedTracks.includes(track.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedTracks([...selectedTracks, track.id]);
                    } else {
                      setSelectedTracks(selectedTracks.filter(id => id !== track.id));
                    }
                  }}
                />
                <div className="flex-1">
                  <p className="font-semibold">{track.title}</p>
                  <p className="text-sm text-gray-600">{track.description}</p>
                </div>
              </div>
            ))}
          </div>
          <Button
            onClick={() => assignTrainingMutation.mutate()}
            disabled={assignTrainingMutation.isPending}
            className="w-full"
          >
            <Check className="w-4 h-4 mr-2" />
            Assign Selected Training
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}