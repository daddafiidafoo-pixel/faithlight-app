/**
 * OfflineAIContent
 * Lists saved sermon drafts and AI commentaries, allows users to
 * mark them as offline-cached (stored in localStorage) so they're
 * accessible without internet.
 *
 * Offline caching strategy: JSON-serialise to localStorage under
 *   fl_offline_sermons  — array of SermonNote records
 *   fl_offline_commentary — array of VerseCommentary records
 */

import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Download, CheckCircle2, Trash2, Loader2, FileText,
  MessageSquare, Lock, Sparkles, WifiOff,
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

const LS_SERMONS = 'fl_offline_sermons';
const LS_COMMENTARY = 'fl_offline_commentary';

function loadLS(key) { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; } }
function saveLS(key, data) { localStorage.setItem(key, JSON.stringify(data)); }

function isCachedSermon(id) { return loadLS(LS_SERMONS).some(s => s.id === id); }
function isCachedCommentary(id) { return loadLS(LS_COMMENTARY).some(c => c.id === id); }

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Sermon item ────────────────────────────────────────────────────────────────
function SermonRow({ item, isPremium, onCacheToggle }) {
  const cached = isCachedSermon(item.id);
  const [toggling, setToggling] = useState(false);

  const toggle = async () => {
    if (!isPremium) { toast.error('Offline downloads require Premium.'); return; }
    setToggling(true);
    const list = loadLS(LS_SERMONS);
    if (cached) {
      saveLS(LS_SERMONS, list.filter(s => s.id !== item.id));
      toast.success('Removed from offline');
    } else {
      saveLS(LS_SERMONS, [...list, item]);
      toast.success('Sermon saved for offline');
    }
    onCacheToggle?.();
    setToggling(false);
  };

  return (
    <div className="flex items-start justify-between gap-3 p-3 rounded-lg border border-gray-200 bg-white hover:border-indigo-200 transition-all group">
      <div className="flex items-start gap-2 min-w-0">
        <FileText className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{item.title || 'Untitled Sermon'}</p>
          <p className="text-xs text-gray-400 mt-0.5">{item.topic || ''} · {formatDate(item.created_date)}</p>
        </div>
      </div>
      <Button
        variant={cached ? 'ghost' : 'outline'}
        size="sm"
        onClick={toggle}
        disabled={toggling || !isPremium}
        className={`flex-shrink-0 gap-1 text-xs ${cached ? 'text-green-600 hover:text-red-500' : 'border-indigo-200 text-indigo-600 hover:bg-indigo-50'}`}
      >
        {toggling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
          cached ? <><CheckCircle2 className="w-3.5 h-3.5" /> Saved</> :
          <><Download className="w-3.5 h-3.5" /> Save Offline</>}
      </Button>
    </div>
  );
}

// ── Commentary item ────────────────────────────────────────────────────────────
function CommentaryRow({ item, isPremium, onCacheToggle }) {
  const cached = isCachedCommentary(item.id);
  const [toggling, setToggling] = useState(false);

  const toggle = async () => {
    if (!isPremium) { toast.error('Offline downloads require Premium.'); return; }
    setToggling(true);
    const list = loadLS(LS_COMMENTARY);
    if (cached) {
      saveLS(LS_COMMENTARY, list.filter(c => c.id !== item.id));
      toast.success('Removed from offline');
    } else {
      saveLS(LS_COMMENTARY, [...list, item]);
      toast.success('Commentary saved for offline');
    }
    onCacheToggle?.();
    setToggling(false);
  };

  const ref = `${item.book} ${item.chapter}:${item.verse_start}${item.verse_end && item.verse_end !== item.verse_start ? `-${item.verse_end}` : ''}`;

  return (
    <div className="flex items-start justify-between gap-3 p-3 rounded-lg border border-gray-200 bg-white hover:border-indigo-200 transition-all">
      <div className="flex items-start gap-2 min-w-0">
        <MessageSquare className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-800">{ref}</p>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{item.theological_insights?.slice(0, 80)}…</p>
        </div>
      </div>
      <Button
        variant={cached ? 'ghost' : 'outline'}
        size="sm"
        onClick={toggle}
        disabled={toggling || !isPremium}
        className={`flex-shrink-0 gap-1 text-xs ${cached ? 'text-green-600 hover:text-red-500' : 'border-purple-200 text-purple-600 hover:bg-purple-50'}`}
      >
        {toggling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
          cached ? <><CheckCircle2 className="w-3.5 h-3.5" /> Saved</> :
          <><Download className="w-3.5 h-3.5" /> Save Offline</>}
      </Button>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function OfflineAIContent({ user, isPremium }) {
  const [tick, setTick] = useState(0);
  const refresh = () => setTick(t => t + 1);

  const { data: sermons = [], isLoading: loadingSermons } = useQuery({
    queryKey: ['offlineSermons', user?.id],
    queryFn: () => base44.entities.SermonNote.filter({ user_id: user.id }, '-created_date', 50),
    enabled: !!user?.id,
  });

  const { data: commentaries = [], isLoading: loadingCommentary } = useQuery({
    queryKey: ['offlineCommentary', user?.id],
    queryFn: () => base44.entities.VerseCommentary.filter({}, '-created_date', 50),
    enabled: !!user?.id,
  });

  const offlineSermons = loadLS(LS_SERMONS);
  const offlineCommentary = loadLS(LS_COMMENTARY);

  if (!user) {
    return (
      <div className="text-center py-14 text-gray-400">
        <WifiOff className="w-10 h-10 mx-auto mb-3 text-gray-200" />
        <p className="text-sm font-medium">Sign in to save AI content for offline access</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-0 shadow-sm bg-indigo-50">
          <CardContent className="p-4 flex items-center gap-3">
            <FileText className="w-5 h-5 text-indigo-500" />
            <div>
              <div className="text-lg font-bold text-gray-900">{offlineSermons.length}</div>
              <div className="text-xs text-gray-500">Sermons offline</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-purple-50">
          <CardContent className="p-4 flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-purple-500" />
            <div>
              <div className="text-lg font-bold text-gray-900">{offlineCommentary.length}</div>
              <div className="text-xs text-gray-500">Commentaries offline</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sermons">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="sermons">Sermon Drafts ({sermons.length})</TabsTrigger>
          <TabsTrigger value="commentary">AI Commentary ({commentaries.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="sermons">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600 font-normal">
                Click "Save Offline" to cache sermon outlines for offline reading.
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingSermons ? (
                <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-indigo-400" /></div>
              ) : sermons.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <FileText className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                  <p className="text-sm">No sermon drafts yet.</p>
                  <Link to={createPageUrl('SermonBuilder')}>
                    <button className="mt-3 text-xs text-indigo-600 hover:underline">Generate a sermon outline →</button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {sermons.map(s => (
                    <SermonRow key={s.id} item={s} isPremium={isPremium} onCacheToggle={refresh} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commentary">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-600 font-normal">
                Save AI commentary to read without internet.
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingCommentary ? (
                <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-purple-400" /></div>
              ) : commentaries.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <MessageSquare className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                  <p className="text-sm">No AI commentary generated yet.</p>
                  <Link to={createPageUrl('BibleReader')}>
                    <button className="mt-3 text-xs text-indigo-600 hover:underline">Go to Bible Reader to generate commentary →</button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {commentaries.map(c => (
                    <CommentaryRow key={c.id} item={c} isPremium={isPremium} onCacheToggle={refresh} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}