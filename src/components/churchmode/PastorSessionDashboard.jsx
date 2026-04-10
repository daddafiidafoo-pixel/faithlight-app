import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Radio, Send, BookOpen, HelpCircle, BarChart3, Loader2, X } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export default function PastorSessionDashboard({ sessionId, onClose }) {
  const [activeTab, setActiveTab] = useState('verses'); // 'verses' | 'notes' | 'polls' | 'qa'
  const [verseInput, setVerseInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '', '']);
  const [qaInput, setQaInput] = useState('');
  const queryClient = useQueryClient();

  const { data: session } = useQuery({
    queryKey: ['sermonSession', sessionId],
    queryFn: () => base44.entities.SermonSession.filter({ code: sessionId }),
  });

  const { data: polls = [] } = useQuery({
    queryKey: ['sessionPolls', sessionId],
    queryFn: async () => {
      const questions = await base44.entities.ChurchQuizQuestion.filter({ sessionId });
      return questions;
    },
  });

  const broadcastVerseMutation = useMutation({
    mutationFn: async (verse) => {
      await base44.entities.SermonSession.update(session[0].id, {
        verseRefs: [...(session[0].verseRefs || []), verse],
      });
      setVerseInput('');
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sermonSession', sessionId] }),
  });

  const broadcastNotesMutation = useMutation({
    mutationFn: async (notes) => {
      const sessionNotes = await base44.entities.SessionNote.create({
        sessionId: session[0].id,
        userId: (await base44.auth.me()).id,
        noteText: notes,
      });
      setNotesInput('');
      return sessionNotes;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sessionNotes', sessionId] }),
  });

  const createPollMutation = useMutation({
    mutationFn: async (pollData) => {
      const question = await base44.entities.ChurchQuizQuestion.create({
        sessionId: session[0].id,
        pastorId: (await base44.auth.me()).id,
        question: pollData.question,
        choices: pollData.options.filter(o => o.trim()),
        status: 'live',
      });
      setPollQuestion('');
      setPollOptions(['', '', '']);
      return question;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sessionPolls', sessionId] }),
  });

  const createQAMutation = useMutation({
    mutationFn: async (qaData) => {
      // This would create a Q&A queue entry
      setQaInput('');
    },
  });

  if (!session || session.length === 0) {
    return <div className="text-center py-12">Loading session...</div>;
  }

  const currentSession = session[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Radio className="w-8 h-8 text-indigo-600" />
              Live Broadcast
            </h1>
            <p className="text-gray-600 text-sm mt-1">Session Code: <span className="font-mono font-bold text-indigo-600">{currentSession.code}</span></p>
          </div>
          <Button variant="ghost" onClick={onClose} size="icon">
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {[
            { id: 'verses', label: '📖 Push Verses', icon: BookOpen },
            { id: 'notes', label: '📝 Sermon Notes', icon: Send },
            { id: 'polls', label: '📊 Live Polls', icon: BarChart3 },
            { id: 'qa', label: '❓ Q&A', icon: HelpCircle },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {/* Push Verses */}
          {activeTab === 'verses' && (
            <Card>
              <CardHeader>
                <CardTitle>Push Verse to Congregation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bible Verse Reference</label>
                    <Input
                      placeholder="e.g., John 3:16 or Romans 6:9-11"
                      value={verseInput}
                      onChange={(e) => setVerseInput(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={() => verseInput && broadcastVerseMutation.mutate(verseInput)}
                    disabled={broadcastVerseMutation.isPending || !verseInput}
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                  >
                    {broadcastVerseMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <BookOpen className="w-4 h-4 mr-2" />}
                    Push Verse
                  </Button>

                  {currentSession.verseRefs && currentSession.verseRefs.length > 0 && (
                    <div className="mt-6 pt-6 border-t">
                      <p className="text-sm font-semibold text-gray-700 mb-3">Shared Verses</p>
                      <div className="space-y-2">
                        {currentSession.verseRefs.map((verse, idx) => (
                          <div key={idx} className="bg-blue-50 p-3 rounded-lg text-blue-900 text-sm">
                            {verse}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sermon Notes */}
          {activeTab === 'notes' && (
            <Card>
              <CardHeader>
                <CardTitle>Broadcast Sermon Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Type sermon notes, key points, or discussion questions..."
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    className="h-32"
                  />
                  <Button
                    onClick={() => notesInput && broadcastNotesMutation.mutate(notesInput)}
                    disabled={broadcastNotesMutation.isPending || !notesInput}
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                  >
                    {broadcastNotesMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                    Send Notes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Live Polls */}
          {activeTab === 'polls' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Create Live Poll</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Poll Question</label>
                      <Input
                        placeholder="e.g., Which verse resonates most with you?"
                        value={pollQuestion}
                        onChange={(e) => setPollQuestion(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Answer Options</label>
                      <div className="space-y-2">
                        {pollOptions.map((option, idx) => (
                          <Input
                            key={idx}
                            placeholder={`Option ${idx + 1}`}
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...pollOptions];
                              newOptions[idx] = e.target.value;
                              setPollOptions(newOptions);
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={() =>
                        pollQuestion &&
                        createPollMutation.mutate({ question: pollQuestion, options: pollOptions })
                      }
                      disabled={createPollMutation.isPending || !pollQuestion}
                      className="w-full bg-indigo-600 hover:bg-indigo-700"
                    >
                      {createPollMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <BarChart3 className="w-4 h-4 mr-2" />}
                      Launch Poll
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {polls.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Active Polls</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {polls.map(poll => (
                        <div key={poll.id} className="p-4 bg-purple-50 rounded-lg">
                          <p className="font-semibold text-gray-900 mb-2">{poll.question}</p>
                          <div className="space-y-2">
                            {poll.choices.map((choice, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <span className="text-sm text-gray-700">{choice}</span>
                                <span className="ml-auto text-xs text-gray-500">(responses pending)</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Q&A */}
          {activeTab === 'qa' && (
            <Card>
              <CardHeader>
                <CardTitle>Q&A Submission Module</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">Members can submit questions during the service. Manage responses here.</p>
                  <Textarea
                    placeholder="Type a response to submitted questions..."
                    value={qaInput}
                    onChange={(e) => setQaInput(e.target.value)}
                    className="h-24"
                  />
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Respond to Questions
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}