import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BarChart2, Plus, CheckCircle2, X, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export default function GroupPolls({ groupId, user, isAdmin }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [multiSelect, setMultiSelect] = useState(false);

  const { data: polls = [] } = useQuery({
    queryKey: ['group-polls', groupId],
    queryFn: () => base44.entities.ForumPoll.filter({ group_id: groupId }, '-updated_date', 20).catch(() => []),
    enabled: !!groupId,
    retry: false,
  });

  const { data: userVotes = [] } = useQuery({
    queryKey: ['group-poll-votes', groupId, user?.id],
    queryFn: () => base44.entities.ForumUpvote.filter({ user_id: user.id, entity_type: 'poll_option' }, '-updated_date', 100).catch(() => []),
    enabled: !!user?.id,
    retry: false,
  });

  const createPoll = useMutation({
    mutationFn: () => base44.entities.ForumPoll.create({
      group_id: groupId,
      question,
      options: options.filter(o => o.trim()).map(o => ({ text: o.trim(), votes: 0 })),
      allow_multiple: multiSelect,
      created_by: user.id,
      created_by_name: user.full_name,
      status: 'active',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['group-polls', groupId]);
      setShowForm(false);
      setQuestion('');
      setOptions(['', '']);
      toast.success('Poll created!');
    },
  });

  const voteMutation = useMutation({
    mutationFn: async ({ pollId, optionIndex, poll }) => {
      const alreadyVoted = userVotes.find(v => v.entity_id === `${pollId}-${optionIndex}`);
      if (alreadyVoted) {
        await base44.entities.ForumUpvote.delete(alreadyVoted.id);
        // Decrement
        const updatedOptions = poll.options.map((o, i) => i === optionIndex ? { ...o, votes: Math.max(0, (o.votes || 0) - 1) } : o);
        return base44.entities.ForumPoll.update(pollId, { options: updatedOptions });
      } else {
        await base44.entities.ForumUpvote.create({ entity_id: `${pollId}-${optionIndex}`, entity_type: 'poll_option', user_id: user.id });
        const updatedOptions = poll.options.map((o, i) => i === optionIndex ? { ...o, votes: (o.votes || 0) + 1 } : o);
        return base44.entities.ForumPoll.update(pollId, { options: updatedOptions });
      }
    },
    onSuccess: () => { queryClient.invalidateQueries(['group-polls', groupId]); queryClient.invalidateQueries(['group-poll-votes', groupId, user?.id]); },
  });

  const closePoll = useMutation({
    mutationFn: (id) => base44.entities.ForumPoll.update(id, { status: 'closed' }),
    onSuccess: () => queryClient.invalidateQueries(['group-polls', groupId]),
  });

  const deletePoll = useMutation({
    mutationFn: (id) => base44.entities.ForumPoll.delete(id),
    onSuccess: () => { queryClient.invalidateQueries(['group-polls', groupId]); toast.success('Poll deleted'); },
  });

  const addOption = () => setOptions(p => [...p, '']);
  const removeOption = (i) => setOptions(p => p.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-indigo-500" />
          <h3 className="font-bold text-gray-900">Group Polls</h3>
        </div>
        {user && (
          <Button size="sm" onClick={() => setShowForm(true)} className="gap-1 bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-3.5 h-3.5" /> Create Poll
          </Button>
        )}
      </div>

      {/* Create Poll Form */}
      {showForm && (
        <Card className="border-indigo-200">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm">New Poll</h4>
              <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <Input placeholder="Ask a question..." value={question} onChange={e => setQuestion(e.target.value)} />
            <div className="space-y-2">
              <p className="text-xs text-gray-500">Options</p>
              {options.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <Input placeholder={`Option ${i + 1}`} value={opt} onChange={e => setOptions(p => p.map((o, idx) => idx === i ? e.target.value : o))} />
                  {options.length > 2 && <button onClick={() => removeOption(i)}><X className="w-4 h-4 text-gray-400" /></button>}
                </div>
              ))}
              {options.length < 6 && (
                <button onClick={addOption} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Add option
                </button>
              )}
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={multiSelect} onChange={e => setMultiSelect(e.target.checked)} className="rounded" />
              <span className="text-xs text-gray-600">Allow multiple selections</span>
            </label>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 bg-indigo-600"
                onClick={() => { if (!question.trim() || options.filter(o => o.trim()).length < 2) { toast.error('Question and at least 2 options required'); return; } createPoll.mutate(); }}
                disabled={createPoll.isPending}>
                {createPoll.isPending ? 'Creating...' : 'Create Poll'}
              </Button>
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Polls List */}
      {polls.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl">
          <BarChart2 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-400">No polls yet</p>
          <p className="text-xs text-gray-400">Create a poll to make group decisions together</p>
        </div>
      ) : (
        <div className="space-y-4">
          {polls.map(poll => {
            const totalVotes = (poll.options || []).reduce((s, o) => s + (o.votes || 0), 0);
            const isClosed = poll.status === 'closed';
            const votedOptionIds = userVotes.filter(v => v.entity_id?.startsWith(poll.id)).map(v => parseInt(v.entity_id?.split('-').pop()));
            const hasVoted = votedOptionIds.length > 0;

            return (
              <Card key={poll.id} className={`border-gray-200 ${isClosed ? 'opacity-75' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h4 className="font-semibold text-sm text-gray-900">{poll.question}</h4>
                        {isClosed && <Badge className="bg-gray-100 text-gray-600 border-0 text-xs">Closed</Badge>}
                        {poll.allow_multiple && <Badge className="bg-blue-100 text-blue-600 border-0 text-xs">Multi-select</Badge>}
                      </div>
                      <p className="text-xs text-gray-400">By {poll.created_by_name} · {totalVotes} votes</p>
                    </div>
                    {(isAdmin || poll.created_by === user?.id) && (
                      <div className="flex items-center gap-1">
                        {!isClosed && <button onClick={() => closePoll.mutate(poll.id)} className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded border border-gray-200">Close</button>}
                        <button onClick={() => { if (confirm('Delete this poll?')) deletePoll.mutate(poll.id); }} className="text-gray-300 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    {(poll.options || []).map((opt, idx) => {
                      const pct = totalVotes > 0 ? Math.round(((opt.votes || 0) / totalVotes) * 100) : 0;
                      const isVoted = votedOptionIds.includes(idx);
                      const showResults = isClosed || hasVoted;

                      return (
                        <button key={idx}
                          className={`w-full text-left rounded-lg border transition-all overflow-hidden relative ${isVoted ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 bg-white hover:border-indigo-200'} ${isClosed ? 'cursor-default' : 'cursor-pointer'}`}
                          onClick={() => { if (!isClosed && user) voteMutation.mutate({ pollId: poll.id, optionIndex: idx, poll }); }}
                          disabled={isClosed}
                        >
                          {showResults && (
                            <div className="absolute inset-0 rounded-lg transition-all" style={{ width: `${pct}%`, backgroundColor: isVoted ? 'rgba(99,102,241,0.15)' : 'rgba(0,0,0,0.04)' }} />
                          )}
                          <div className="relative flex items-center justify-between px-3 py-2">
                            <div className="flex items-center gap-2">
                              {isVoted && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />}
                              <span className="text-sm text-gray-800">{opt.text}</span>
                            </div>
                            {showResults && <span className="text-xs font-semibold text-gray-500">{pct}%</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {!user && <p className="text-xs text-gray-400 mt-2 text-center">Sign in to vote</p>}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}