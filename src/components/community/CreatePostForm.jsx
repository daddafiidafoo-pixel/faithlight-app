import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Image as ImageIcon, Loader2, CheckCircle, Shield, X, AlertTriangle, Star, Tags, Sparkles, RefreshCw, Wand2, Lock } from 'lucide-react';
import { toast } from 'sonner';
import AIPostAssistant from './AIPostAssistant';
import AIWritingAssistPanel from './AIWritingAssistPanel';
import { useModerationStatus } from '../moderation/useModerationStatus';

const CATEGORIES = ['Teaching', 'Devotional', 'Testimony', 'Question', 'Announcement'];
const LANGUAGES = [
  { code: 'en', label: '🇬🇧 English' },
  { code: 'om', label: '🇪🇹 Afaan Oromoo' },
  { code: 'am', label: '🇪🇹 Amharic' },
  { code: 'es', label: '🇪🇸 Spanish' },
  { code: 'fr', label: '🇫🇷 French' },
  { code: 'ar', label: '🇸🇦 Arabic' },
  { code: 'sw', label: '🇹🇿 Swahili' },
];
const GUIDELINES = [
  'Be respectful and kind to all community members.',
  'No hate speech, harassment, or bullying.',
  'No sexual content, nudity, or violent imagery.',
  'No spam or self-promotion unrelated to biblical education.',
  'Do not share personal contact information.',
  'Share uplifting, Bible-centered content only.',
];

// Reputation threshold: user needs ≥3 approved posts with combined ≥10 likes
async function checkUserReputation(userId) {
  try {
    const posts = await base44.entities.CommunityPost.filter(
      { user_id: userId, status: 'published' }, '-created_date', 50
    );
    const totalLikes = posts.reduce((sum, p) => sum + (p.like_count || 0), 0);
    return posts.length >= 3 && totalLikes >= 10;
  } catch { return false; }
}

// AI image moderation using InvokeLLM vision
async function moderateImage(fileUrl) {
  try {
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a content moderator for a Bible education app for all ages. Analyze this image and determine if it is safe and appropriate.

Safe = uplifting, educational, nature, scripture, church-related content.
Unsafe = nudity, sexual content, violence, hate symbols, graphic imagery, anything inappropriate for children.

Be strict. When in doubt, mark as unsafe.`,
      file_urls: [fileUrl],
      response_json_schema: {
        type: 'object',
        properties: {
          safe: { type: 'boolean' },
          reason: { type: 'string' },
        },
      },
    });
    return result;
  } catch { return { safe: true, reason: 'Moderation check skipped' }; }
}

export default function CreatePostForm({ user, onSuccess, onCancel }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('Devotional');
  const [language, setLanguage] = useState(user?.preferred_language_code || 'en');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imageChecking, setImageChecking] = useState(false);
  const [imageBlocked, setImageBlocked] = useState(false);
  const [imageBlockReason, setImageBlockReason] = useState('');
  const [aiTags, setAiTags] = useState([]);
  const [generatingTags, setGeneratingTags] = useState(false);
  const [improvingContent, setImprovingContent] = useState(false);
  const { isSuspended, suspendedUntil } = useModerationStatus(user?.id);

  if (isSuspended) {
    return (
      <Card className="border border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Lock className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-900">Account Suspended</p>
              <p className="text-sm text-red-700 mt-1">
                Your account is temporarily suspended from posting.
              </p>
              {suspendedUntil && (
                <p className="text-xs text-red-600 mt-2">
                  Suspension expires: {new Date(suspendedUntil).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleGenerateTags = async () => {
    const text = `${title} ${body}`.trim();
    if (!text) { toast.error('Add a title or body first'); return; }
    setGeneratingTags(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate 5–7 relevant tags for this faith/Bible community post. Return ONLY a JSON object with a "tags" array of short tag strings.
Post: """${text.slice(0, 500)}"""`,
      response_json_schema: { type: 'object', properties: { tags: { type: 'array', items: { type: 'string' } } } },
    }).catch(() => null);
    setAiTags(res?.tags || []);
    setGeneratingTags(false);
  };

  const handleImproveContent = async () => {
    if (!body.trim()) { toast.error('Add body content first'); return; }
    setImprovingContent(true);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a faith community writing coach. Improve this post to be clearer, more engaging, and biblically grounded. Keep the same core message. Return only the improved text, no explanations.
Original: """${body}"""`,
    }).catch(() => null);
    if (res) { setBody(res); toast.success('Content improved by AI!'); }
    setImprovingContent(false);
  };

  const handleAIApply = ({ title: t, body: b, category: c }) => {
    setTitle(t);
    setBody(b);
    if (CATEGORIES.includes(c)) setCategory(c);
  };

  const handleImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { toast.error('Only JPG, PNG, or WebP allowed'); return; }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setImageBlocked(false);
    setImageBlockReason('');
    setImageChecking(true);

    try {
      // Upload first, then check with AI vision
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const check = await moderateImage(file_url);
      if (!check.safe) {
        setImageFile(null);
        setImagePreview(null);
        setImageBlocked(true);
        setImageBlockReason(check.reason || 'Image does not meet community standards.');
        toast.error('Image blocked by content filter.');
      } else {
        // Store the already-uploaded URL to reuse
        setImageFile({ _uploaded: true, url: file_url });
      }
    } catch {
      // On error, let the image through (fail open for UX)
    }
    setImageChecking(false);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !body.trim()) { toast.error('Title and body are required'); return; }
    if (!agreed) { toast.error('Please agree to the Community Guidelines'); return; }
    if (imageBlocked) { toast.error('Please remove the blocked image before submitting'); return; }
    setSubmitting(true);
    try {
      let image_url = '';
      if (imageFile) {
        if (imageFile._uploaded) {
          image_url = imageFile.url;
        } else {
          const { file_url } = await base44.integrations.Core.UploadFile({ file: imageFile });
          image_url = file_url;
        }
      }

      // Check reputation to decide if post can auto-publish
      const trusted = await checkUserReputation(user.id);
      const status = trusted ? 'published' : 'pending';

      await base44.entities.CommunityPost.create({
        user_id: user.id,
        user_name: user.full_name,
        user_photo: user.profile_photo_url || user.avatar_url || '',
        title: title.trim(),
        body: body.trim(),
        category,
        language,
        image_url,
        status,
        like_count: 0,
        comment_count: 0,
      });

      if (trusted) {
        toast.success('Post published! You\'re a trusted contributor.');
      } else {
        toast.success('Post submitted for review! It will appear once approved.');
      }
      onSuccess?.();
    } catch { toast.error('Failed to submit post'); }
    setSubmitting(false);
  };

  return (
    <Card className="border border-indigo-100 shadow-sm">
      <CardContent className="pt-6 space-y-4">
        <h2 className="font-bold text-gray-900 flex items-center gap-2"><Plus className="w-4 h-4" /> New Post</h2>

        {/* AI Assistant (legacy) */}
        <AIPostAssistant onApplyDraft={handleAIApply} />

        {/* New AI Writing Assistant */}
        <AIWritingAssistPanel
          type="POST"
          category={category}
          draft={body}
          onApply={(text, how) => {
            if (how === 'replace') setBody(text);
            else if (how === 'append') setBody(prev => prev ? prev + '\n\n' + text : text);
            else if (how === 'title') setTitle(text);
          }}
        />

        {/* Community guidelines */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-xs font-bold text-amber-800 mb-2 flex items-center gap-1"><Shield className="w-3 h-3" /> Community Guidelines</p>
          <ul className="space-y-1">
            {GUIDELINES.map(g => (
              <li key={g} className="text-xs text-amber-700 flex items-start gap-1.5">
                <span className="text-amber-400 mt-0.5">•</span>{g}
              </li>
            ))}
          </ul>
        </div>

        {/* Reputation notice */}
        <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
          <Star className="w-3.5 h-3.5 text-green-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-green-700">Trusted contributors (3+ approved posts, 10+ likes) get posts published instantly.</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger><SelectValue placeholder="Language" /></SelectTrigger>
            <SelectContent>{LANGUAGES.map(l => <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <Input placeholder="Post title" value={title} onChange={e => setTitle(e.target.value)} />

        {/* Body + AI improve */}
        <div className="relative">
          <Textarea placeholder="Share your biblical education content…" value={body} onChange={e => setBody(e.target.value)} rows={5} />
          <button
            type="button"
            onClick={handleImproveContent}
            disabled={improvingContent}
            className="absolute bottom-2 right-2 flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-600 border border-purple-200 transition-all"
            title="AI Improve"
          >
            {improvingContent ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
            {improvingContent ? 'Improving…' : 'AI Improve'}
          </button>
        </div>

        {/* AI Tag Generator */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleGenerateTags}
            disabled={generatingTags}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 transition-all"
          >
            {generatingTags ? <Loader2 className="w-3 h-3 animate-spin" /> : <Tags className="w-3 h-3" />}
            {generatingTags ? 'Generating tags…' : 'Auto-generate Tags'}
          </button>
          {aiTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {aiTags.map(tag => (
                <Badge key={tag} className="bg-amber-50 text-amber-700 border border-amber-200 text-xs cursor-pointer hover:bg-amber-100" onClick={() => { navigator.clipboard.writeText(`#${tag}`); toast.success(`Copied #${tag}`); }}>
                  #{tag}
                </Badge>
              ))}
              <button className="text-xs text-gray-400 underline hover:text-gray-600" onClick={() => setAiTags([])}>Clear</button>
            </div>
          )}
        </div>

        {/* Image upload */}
        <div>
          <label className={`flex items-center gap-2 text-sm cursor-pointer w-fit transition-colors ${imageChecking ? 'text-amber-500' : 'text-gray-500 hover:text-indigo-600'}`}>
            {imageChecking
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Checking image…</>
              : <><ImageIcon className="w-4 h-4" /> Attach image (optional, max 5MB JPG/PNG/WebP)</>
            }
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImage} disabled={imageChecking} />
          </label>

          {imagePreview && !imageBlocked && (
            <div className="relative mt-2 w-fit">
              <img src={imagePreview} alt="preview" className="h-32 rounded-lg object-cover border" />
              {imageChecking && (
                <div className="absolute inset-0 bg-white/70 rounded-lg flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                </div>
              )}
              <button onClick={() => { setImageFile(null); setImagePreview(null); }} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {imageBlocked && (
            <div className="mt-2 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-red-700">Image blocked by content filter</p>
                <p className="text-xs text-red-600 mt-0.5">{imageBlockReason}</p>
              </div>
            </div>
          )}
        </div>

        <label className="flex items-start gap-2 cursor-pointer">
          <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-0.5" />
          <span className="text-xs text-gray-600">I agree to the Community Guidelines and confirm my post is uplifting and Bible-centered.</span>
        </label>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting || imageChecking} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            Submit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}