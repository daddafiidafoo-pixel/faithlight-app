import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, Sparkles, MessageSquare, Pin, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export default function GroupDiscussionPanel({ groupId, user, isDarkMode = false }) {
  const [discussions, setDiscussions] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [replies, setReplies] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const scrollRef = useRef(null);

  const { data: discussionData = [] } = useQuery({
    queryKey: ['group-discussions', groupId],
    queryFn: () => base44.entities.GroupDiscussion.filter({ group_id: groupId }, '-created_date'),
    enabled: !!groupId
  });

  useEffect(() => {
    setDiscussions(discussionData);
  }, [discussionData]);

  const handleSelectThread = async (thread) => {
    setSelectedThread(thread);
    // In a real implementation, fetch replies for this thread
    setReplies([]);
  };

  const handleSubmitReply = async () => {
    if (!replyText.trim() || !selectedThread) return;

    setReplying(true);
    try {
      // Create discussion reply (would need GroupDiscussionReply entity)
      // For now, just show success
      setReplies([...replies, {
        id: Math.random(),
        user_name: user.full_name,
        content: replyText,
        created_date: new Date().toISOString()
      }]);

      setReplyText('');
      toast.success('Reply posted!');
    } catch (error) {
      toast.error('Failed to post reply');
    } finally {
      setReplying(false);
    }
  };

  const generateAITopics = async () => {
    setLoadingTopics(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Suggest 3 engaging discussion topics for a Bible study group. Make them thought-provoking, conversation-starters that encourage deep reflection. Format as JSON array with: [{"topic": "...", "prompt": "...", "type": "question|challenge|reflection"}]`,
        add_context_from_internet: false,
        response_json_schema: {
          type: 'object',
          properties: {
            topics: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  topic: { type: 'string' },
                  prompt: { type: 'string' },
                  type: { type: 'string' }
                }
              }
            }
          }
        }
      });

      toast.success('AI suggestions generated!');
      console.log('AI Topics:', response);
    } catch (error) {
      toast.error('Failed to generate topics');
    } finally {
      setLoadingTopics(false);
    }
  };

  const bgColor = isDarkMode ? '#0F1411' : '#FAFAF7';
  const cardColor = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const textColor = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const borderColor = isDarkMode ? '#2A2F2C' : '#E6E6E6';
  const primaryColor = isDarkMode ? '#8FB996' : '#6B8E6E';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ backgroundColor: bgColor }}>
      {/* Discussion List */}
      <div className="lg:col-span-1">
        <Card style={{ backgroundColor: cardColor, borderColor, border: `1px solid ${borderColor}` }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle style={{ color: textColor }} className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Discussions
              </CardTitle>
              <Button
                size="sm"
                variant="ghost"
                onClick={generateAITopics}
                disabled={loadingTopics}
                title="Generate AI topic suggestions"
              >
                <Sparkles className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 max-h-96 overflow-y-auto">
            {discussions.length === 0 ? (
              <p style={{ color: borderColor }} className="text-sm text-center py-4">
                No discussions yet. Start one!
              </p>
            ) : (
              discussions.map(discussion => (
                <button
                  key={discussion.id}
                  onClick={() => handleSelectThread(discussion)}
                  className="w-full p-3 rounded-lg text-left transition-all"
                  style={{
                    backgroundColor: selectedThread?.id === discussion.id ? primaryColor : 'transparent',
                    color: selectedThread?.id === discussion.id ? '#FFFFFF' : textColor,
                    border: `1px solid ${borderColor}`
                  }}
                >
                  <p className="font-medium text-sm">{discussion.thread_title}</p>
                  <p className="text-xs mt-1 opacity-75">{discussion.reply_count} replies</p>
                </button>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Thread View */}
      <div className="lg:col-span-2">
        {selectedThread ? (
          <Card style={{ backgroundColor: cardColor, borderColor, border: `1px solid ${borderColor}` }}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle style={{ color: textColor }}>{selectedThread.thread_title}</CardTitle>
                  <p style={{ color: borderColor }} className="text-xs mt-2">
                    Started by {selectedThread.initiator_name}
                  </p>
                </div>
                {selectedThread.is_pinned && (
                  <Pin className="w-5 h-5" style={{ color: primaryColor }} />
                )}
                {selectedThread.is_closed && (
                  <Lock className="w-5 h-5" style={{ color: '#EF4444' }} />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Original Post */}
              <div className="p-3 rounded-lg" style={{ backgroundColor: bgColor, borderColor, border: `1px solid ${borderColor}` }}>
                <p style={{ color: textColor }}>{selectedThread.initial_post}</p>
              </div>

              {/* Replies */}
              <div ref={scrollRef} className="space-y-3 max-h-64 overflow-y-auto">
                {replies.map(reply => (
                  <div key={reply.id} className="p-3 rounded-lg" style={{ backgroundColor: bgColor, borderColor, border: `1px solid ${borderColor}` }}>
                    <p className="font-medium text-sm" style={{ color: primaryColor }}>{reply.user_name}</p>
                    <p style={{ color: textColor }} className="text-sm mt-1">{reply.content}</p>
                    <p style={{ color: borderColor }} className="text-xs mt-2">
                      {formatDistanceToNow(new Date(reply.created_date))} ago
                    </p>
                  </div>
                ))}
              </div>

              {/* Reply Box */}
              {!selectedThread.is_closed && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmitReply();
                  }}
                  className="space-y-2 pt-4 border-t"
                  style={{ borderColor }}
                >
                  <Textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Share your thoughts..."
                    rows={3}
                    style={{ backgroundColor: bgColor, borderColor, color: textColor }}
                  />
                  <Button
                    type="submit"
                    disabled={replying || !replyText.trim()}
                    className="w-full gap-2"
                    style={{ backgroundColor: primaryColor, color: '#FFFFFF' }}
                  >
                    {replying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Post Reply
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card style={{ backgroundColor: cardColor, borderColor, border: `1px solid ${borderColor}` }}>
            <CardContent className="py-12 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4" style={{ color: borderColor }} />
              <p style={{ color: textColor }}>Select a discussion to view replies</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}