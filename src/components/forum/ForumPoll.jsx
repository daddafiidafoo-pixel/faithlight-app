import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CheckCircle2, BarChart3 } from 'lucide-react';

export default function ForumPoll({ pollId, poll, onVoted }) {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const queryClient = useQueryClient();

  // Check if user already voted
  const { data: userVote } = useQuery({
    queryKey: ['poll-user-vote', pollId],
    queryFn: async () => {
      const user = await base44.auth.me();
      if (!user) return null;
      // This would check if user has already voted (requires tracking entity)
      return null;
    },
    enabled: !!pollId,
  });

  const voteMutation = useMutation({
    mutationFn: async (optionIds) => {
      if (!Array.isArray(optionIds)) {
        optionIds = [optionIds];
      }

      const updatedOptions = poll.options.map(opt => {
        if (optionIds.includes(opt.id)) {
          return { ...opt, vote_count: (opt.vote_count || 0) + 1 };
        }
        return opt;
      });

      const totalVotes = updatedOptions.reduce((sum, opt) => sum + (opt.vote_count || 0), 0);

      await base44.entities.ForumPoll.update(pollId, {
        options: updatedOptions,
        total_votes: totalVotes,
      });

      setHasVoted(true);
      if (onVoted) onVoted();
      queryClient.invalidateQueries(['poll-data', pollId]);
    },
  });

  const handleVote = (optionId) => {
    if (poll.allow_multiple) {
      if (selectedOptions.includes(optionId)) {
        setSelectedOptions(selectedOptions.filter(id => id !== optionId));
      } else {
        setSelectedOptions([...selectedOptions, optionId]);
      }
    } else {
      setSelectedOptions([optionId]);
    }
  };

  const handleSubmitVote = () => {
    if (selectedOptions.length > 0) {
      voteMutation.mutate(selectedOptions);
    }
  };

  // Prepare data for chart
  const chartData = poll.options.map(opt => ({
    name: opt.text,
    votes: opt.vote_count || 0,
    percentage: poll.total_votes > 0 ? Math.round((opt.vote_count || 0) / poll.total_votes * 100) : 0,
  }));

  const colors = ['#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#f43f5e', '#f97316'];

  const isPollOpen = poll.is_open && (!poll.expires_at || new Date(poll.expires_at) > new Date());

  return (
    <Card className="mb-6">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="w-5 h-5 text-indigo-600" />
          <Badge variant="outline">Poll</Badge>
        </div>
        <CardTitle className="text-lg">{poll.question}</CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          By <span className="font-semibold">{poll.created_by_name}</span> • {poll.total_votes} vote{poll.total_votes !== 1 ? 's' : ''}
        </p>
      </CardHeader>

      <CardContent className="pt-6">
        {/* Voting Options */}
        {isPollOpen && !hasVoted ? (
          <div className="space-y-3 mb-6">
            {poll.options.map(option => (
              <label
                key={option.id}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <input
                  type={poll.allow_multiple ? 'checkbox' : 'radio'}
                  checked={selectedOptions.includes(option.id)}
                  onChange={() => handleVote(option.id)}
                  className="w-4 h-4"
                />
                <span className="flex-1 text-gray-900">{option.text}</span>
              </label>
            ))}

            <Button
              onClick={handleSubmitVote}
              disabled={selectedOptions.length === 0 || voteMutation.isPending}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {voteMutation.isPending ? 'Submitting...' : 'Submit Vote'}
            </Button>
          </div>
        ) : null}

        {/* Results Chart */}
        {poll.total_votes > 0 && (
          <div className="space-y-4">
            {hasVoted && (
              <p className="text-sm text-green-700 bg-green-50 p-3 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Thank you for voting!
              </p>
            )}

            {poll.total_votes <= 10 ? (
              <div className="space-y-2">
                {chartData.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">{item.name}</span>
                      <span className="text-sm text-gray-600">{item.votes} ({item.percentage}%)</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all`}
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: colors[idx % colors.length],
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="votes" fill="#6366f1" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

        {!isPollOpen && (
          <p className="text-sm text-gray-600 text-center p-3 bg-gray-50 rounded-lg">
            This poll is now closed
          </p>
        )}
      </CardContent>
    </Card>
  );
}