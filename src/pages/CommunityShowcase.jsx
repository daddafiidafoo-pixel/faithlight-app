import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  BookOpen, MessageSquare, Copy, Star, Search, Loader2, Users, Calendar,
  ChevronRight, X, Send, CheckCircle2, FileText, Sparkles
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

function StarRating({ value, onChange, readonly }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => !readonly && onChange && onChange(n)}
          className={`${readonly ? 'cursor-default' : 'hover:scale-110'} transition-transform`}
        >
          <Star className={`w-4 h-4 ${n <= value ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
        </button>
      ))}
    </div>
  );
}

function CommentSection({ resourceType, resourceId, user }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { load(); }, [resourceId]);

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.SharedComment.filter({ resource_type: resourceType, resource_id: resourceId }, '-created_date', 30);
    setComments(data || []);
    setLoading(false);
  };

  const submit = async () => {
    if (!user) { base44.auth.redirectToLogin(); return; }
    if (!text.trim()) return;
    setSubmitting(true);
    await base44.entities.SharedComment.create({
      resource_type: resourceType,
      resource_id: resourceId,
      user_id: user.id,
      user_name: user.full_name || 'Anonymous',
      content: text.trim(),
      rating: rating > 0 ? rating : undefined,
    });
    setText('');
    setRating(0);
    await load();
    setSubmitting(false);
    toast.success('Comment posted!');
  };

  return (
    <div className="space-y-4">
      {/* Add comment */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
        <p className="text-sm font-medium text-gray-700">Leave a comment</p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Rating:</span>
          <StarRating value={rating} onChange={setRating} />
        </div>
        <Textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Share your thoughts, feedback, or how you used this…"
          className="text-sm min-h-[80px] bg-white"
        />
        <Button size="sm" onClick={submit} disabled={submitting || !text.trim()} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
          {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
          Post Comment
        </Button>
      </div>

      {/* Comment list */}
      {loading ? (
        <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-3">
          {comments.map(c => (
            <div key={c.id} className="border border-gray-100 rounded-xl p-3 bg-white">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-gray-700">{c.user_name}</span>
                {c.rating > 0 && <StarRating value={c.rating} readonly />}
              </div>
              <p className="text-sm text-gray-600">{c.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PlanCard({ plan, user, onCopy, copying }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card className="hover:border-indigo-300 transition-all cursor-pointer group" onClick={() => setOpen(true)}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-bold text-gray-900 text-sm leading-tight">{plan.title}</h3>
                {plan.difficulty && (
                  <Badge className={`text-xs ${plan.difficulty === 'beginner' ? 'bg-green-100 text-green-700' : plan.difficulty === 'intermediate' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                    {plan.difficulty}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-500 line-clamp-2 mb-2">{plan.description}</p>
              <div className="flex flex-wrap gap-1 mb-2">
                {(plan.topics || []).slice(0, 3).map(t => (
                  <span key={t} className="text-xs bg-indigo-50 text-indigo-600 rounded-full px-2 py-0.5">{t}</span>
                ))}
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{plan.shares || 0} copies</span>
                {plan.item_count > 0 && <span>{plan.item_count} items</span>}
                {plan.rating > 0 && <span className="flex items-center gap-0.5"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{plan.rating.toFixed(1)}</span>}
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{plan.duration_days || '?'} days</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 flex-shrink-0">
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs"
                onClick={e => { e.stopPropagation(); setOpen(true); }}
              >
                <ChevronRight className="w-3 h-3" /> View
              </Button>
              <Button
                size="sm"
                className="gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700"
                disabled={copying === plan.id}
                onClick={e => { e.stopPropagation(); onCopy(plan); }}
              >
                {copying === plan.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Copy className="w-3 h-3" />}
                Copy
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              {plan.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {plan.description && <p className="text-sm text-gray-600">{plan.description}</p>}
            <div className="flex flex-wrap gap-2">
              {(plan.topics || []).map(t => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
            </div>
            {plan.plan_items && plan.plan_items.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Reading Items</p>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {plan.plan_items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-1.5">
                      <span className="text-gray-400 text-xs">{i + 1}.</span>
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <Button
              onClick={() => onCopy(plan)}
              disabled={copying === plan.id}
              className="w-full gap-2 bg-indigo-600 hover:bg-indigo-700"
            >
              {copying === plan.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
              Copy to My Study Plans
            </Button>
            <div className="border-t pt-4">
              <p className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-gray-400" /> Comments
              </p>
              <CommentSection resourceType="study_plan" resourceId={plan.id} user={user} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SermonCard({ sermon, user }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Card className="hover:border-purple-300 transition-all cursor-pointer" onClick={() => setOpen(true)}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-bold text-gray-900 text-sm leading-tight">{sermon.title}</h3>
                {sermon.style && <Badge variant="outline" className="text-xs capitalize">{sermon.style}</Badge>}
              </div>
              {sermon.topic && <p className="text-xs text-indigo-600 mb-1">Topic: {sermon.topic}</p>}
              <p className="text-xs text-gray-500 line-clamp-2 mb-2">{sermon.description}</p>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                {sermon.audience && <span className="capitalize">{sermon.audience}</span>}
                {sermon.length_minutes && <span>{sermon.length_minutes} min</span>}
                {sermon.rating > 0 && <span className="flex items-center gap-0.5"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{sermon.rating.toFixed(1)}</span>}
                <span className="flex items-center gap-1"><Copy className="w-3 h-3" />{sermon.shares || 0} copies</span>
              </div>
            </div>
            <Button size="sm" variant="outline" className="flex-shrink-0 gap-1 text-xs" onClick={e => { e.stopPropagation(); setOpen(true); }}>
              <ChevronRight className="w-3 h-3" /> View
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-500" />
              {sermon.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {sermon.topic && <Badge variant="outline">Topic: {sermon.topic}</Badge>}
              {sermon.style && <Badge variant="outline" className="capitalize">{sermon.style}</Badge>}
              {sermon.audience && <Badge variant="outline" className="capitalize">{sermon.audience}</Badge>}
            </div>
            {sermon.full_content && (
              <div className="bg-gray-50 rounded-xl p-4 prose prose-sm max-w-none max-h-96 overflow-y-auto">
                <ReactMarkdown>{sermon.full_content}</ReactMarkdown>
              </div>
            )}
            <div className="border-t pt-4">
              <p className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-gray-400" /> Comments
              </p>
              <CommentSection resourceType="sermon_draft" resourceId={sermon.id} user={user} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function CommunityShowcase() {
  const [user, setUser] = useState(null);
  const [plans, setPlans] = useState([]);
  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('all');
  const [copying, setCopying] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => null);
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [planData, sermonData] = await Promise.all([
      base44.entities.SharedStudyPlan.list('-created_date', 50),
      base44.entities.SermonNote.filter({ is_shared: true }, '-created_date', 50),
    ]);
    setPlans(planData || []);
    setSermons(sermonData || []);
    setLoading(false);
  };

  const handleCopyPlan = async (sharedPlan) => {
    if (!user) { base44.auth.redirectToLogin(); return; }
    setCopying(sharedPlan.id);
    try {
      await base44.entities.StudyPlan.create({
        user_id: user.id,
        title: `${sharedPlan.title} (Community Copy)`,
        description: sharedPlan.description,
        duration_days: sharedPlan.duration_days,
        topics: sharedPlan.topics,
        plan_items: (sharedPlan.plan_items || []).map(i => ({ ...i, done: false })),
        status: 'active',
        progress_percentage: 0,
      });
      await base44.entities.SharedStudyPlan.update(sharedPlan.id, { shares: (sharedPlan.shares || 0) + 1 });
      setPlans(prev => prev.map(p => p.id === sharedPlan.id ? { ...p, shares: (p.shares || 0) + 1 } : p));
      toast.success('Plan copied to your Study Plans!');
    } catch { toast.error('Failed to copy plan.'); }
    setCopying(null);
  };

  const filteredPlans = plans.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.title?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || (p.topics || []).some(t => t.toLowerCase().includes(q));
    const matchDiff = difficulty === 'all' || p.difficulty === difficulty;
    return matchSearch && matchDiff;
  });

  const filteredSermons = sermons.filter(s => {
    const q = search.toLowerCase();
    return !q || s.title?.toLowerCase().includes(q) || s.topic?.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 mb-4 shadow-lg">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Showcase</h1>
          <p className="text-gray-500 max-w-lg mx-auto">Discover study plans and sermon drafts shared by the FaithLight community. Copy them to your own library or leave feedback.</p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by title, topic, or keyword…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="plans">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="plans" className="flex-1 gap-2">
              <BookOpen className="w-4 h-4" /> Study Plans
              {filteredPlans.length > 0 && <Badge variant="secondary" className="text-xs ml-1">{filteredPlans.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="sermons" className="flex-1 gap-2">
              <FileText className="w-4 h-4" /> Sermon Drafts
              {filteredSermons.length > 0 && <Badge variant="secondary" className="text-xs ml-1">{filteredSermons.length}</Badge>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="plans">
            {loading ? (
              <div className="flex items-center justify-center py-20 text-gray-400 gap-3">
                <Loader2 className="w-5 h-5 animate-spin" /> Loading plans…
              </div>
            ) : filteredPlans.length === 0 ? (
              <Card className="border-dashed border-2">
                <CardContent className="text-center py-16">
                  <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 font-medium">No shared study plans yet</p>
                  <p className="text-sm text-gray-400 mt-1">Be the first to share yours from the Study Plans page!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredPlans.map(plan => (
                  <PlanCard key={plan.id} plan={plan} user={user} onCopy={handleCopyPlan} copying={copying} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sermons">
            {loading ? (
              <div className="flex items-center justify-center py-20 text-gray-400 gap-3">
                <Loader2 className="w-5 h-5 animate-spin" /> Loading sermons…
              </div>
            ) : filteredSermons.length === 0 ? (
              <Card className="border-dashed border-2">
                <CardContent className="text-center py-16">
                  <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 font-medium">No shared sermon drafts yet</p>
                  <p className="text-sm text-gray-400 mt-1">Share your sermon prep from the Ask AI or Sermon Builder page!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredSermons.map(sermon => (
                  <SermonCard key={sermon.id} sermon={sermon} user={user} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}