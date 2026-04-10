import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, Send, Copy, Share2, ChevronDown, ChevronUp, Check } from 'lucide-react';

const CATEGORIES = ['Salvation', 'Faith', 'Prayer', 'Prophecy', 'Wisdom', 'Grace', 'Justice', 'Love'];

export default function AIExplanationV2({ reference, passageText, verseKeys = [], translationId = 'WEB' }) {
  const [thread, setThread] = useState(null);
  const [verseNotes, setVerseNotes] = useState({}); // keyed by verseKey
  const [loading, setLoading] = useState(false);
  const [expandedVerse, setExpandedVerse] = useState(null);
  const [followUpInputs, setFollowUpInputs] = useState({});
  const [followUpLoading, setFollowUpLoading] = useState({});
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState(false);
  const [shareId, setShareId] = useState(null);
  const [error, setError] = useState('');

  const generate = async () => {
    setError('');
    setLoading(true);
    try {
      const { data } = await base44.functions.invoke('generateBibleExplanation', {
        reference,
        translation_id: translationId,
        passage_text: passageText,
        verse_keys: verseKeys,
      });

      if (!data?.guardrails_passed) {
        setError('AI response did not pass quality guardrails. Please try again.');
        return;
      }

      // Save thread to DB
      const me = await base44.auth.me().catch(() => null);
      let savedThread = null;
      if (me) {
        savedThread = await base44.entities.AIExplanationThread.create({
          user_id: me.id,
          reference,
          translation_id: translationId,
          passage_text: passageText,
          verse_keys: verseKeys,
          summary: data.summary,
          context: data.context,
          themes: data.themes || [],
          application: data.application || [],
          guardrails_passed: true,
        });

        // Save individual verse notes
        const notes = {};
        for (const vb of data.verseBreakdown || []) {
          const note = await base44.entities.AIExplanationVerseNote.create({
            thread_id: savedThread.id,
            verse_key: vb.verseKey,
            breakdown: vb.explanation,
            qa: [],
            saved: false,
          });
          notes[vb.verseKey] = note;
        }
        setVerseNotes(notes);
      }

      setThread({ ...data, id: savedThread?.id });
      setSaved(false);
      setShared(false);
    } catch (err) {
      setError(err.message || 'Error generating explanation');
    } finally {
      setLoading(false);
    }
  };

  const submitFollowUp = async (verseKey) => {
    const q = followUpInputs[verseKey]?.trim();
    if (!q) return;

    setFollowUpLoading(prev => ({ ...prev, [verseKey]: true }));
    try {
      const { data } = await base44.functions.invoke('generateFollowUpExplanation', {
        verse_ref: verseKey,
        verse_text: getVerseText(verseKey),
        explanation: verseNotes[verseKey]?.breakdown || '',
        follow_up_question: q,
        existing_qa: (verseNotes[verseKey]?.qa || []).slice(-3),
      });

      const newQA = { q, a: data?.answer, created_at: new Date().toISOString() };
      const updatedNote = {
        ...verseNotes[verseKey],
        qa: [...(verseNotes[verseKey]?.qa || []), newQA],
      };
      setVerseNotes(prev => ({ ...prev, [verseKey]: updatedNote }));

      // Persist to DB
      if (verseNotes[verseKey]?.id) {
        await base44.entities.AIExplanationVerseNote.update(verseNotes[verseKey].id, {
          qa: updatedNote.qa,
        });
      }

      setFollowUpInputs(prev => ({ ...prev, [verseKey]: '' }));
    } catch (err) {
      console.error('Follow-up error:', err);
    } finally {
      setFollowUpLoading(prev => ({ ...prev, [verseKey]: false }));
    }
  };

  const saveVerseNote = async (verseKey) => {
    const note = verseNotes[verseKey];
    if (!note?.id) return;
    await base44.entities.AIExplanationVerseNote.update(note.id, { saved: true });
    setVerseNotes(prev => ({ ...prev, [verseKey]: { ...note, saved: true } }));
  };

  const saveThread = async () => {
    if (!thread?.id) return;
    await base44.entities.AIExplanationThread.update(thread.id, {
      saved: true,
      categories: selectedCategories,
    });
    setSaved(true);
  };

  const shareThread = async () => {
    if (!thread?.id) return;
    const id = `share_${thread.id}_${Date.now()}`;
    await base44.entities.AIExplanationThread.update(thread.id, {
      is_shared: true,
      share_id: id,
    });
    setShareId(id);
    setShared(true);
    navigator.clipboard.writeText(`${window.location.origin}/SharedExplanation?share_id=${id}`);
  };

  const toggleCategory = (cat) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const getVerseText = (verseKey) => {
    // Try to extract from passage_text by verse key if it exists
    return verseKey;
  };

  return (
    <div className="space-y-4">
      {!thread && (
        <Button onClick={generate} disabled={loading} className="w-full">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Explain This Passage
        </Button>
      )}

      {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}

      {thread && (
        <div className="space-y-4">
          {/* Summary + Context */}
          <Card className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50">
            <h4 className="font-semibold text-gray-900 mb-1">Summary</h4>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">{thread.summary}</p>
            {thread.context && (
              <>
                <h4 className="font-semibold text-gray-900 mb-1">Historical Context</h4>
                <p className="text-sm text-gray-700 leading-relaxed">{thread.context}</p>
              </>
            )}
          </Card>

          {/* Verse-by-verse breakdown accordion */}
          {(thread.verseBreakdown || []).map((vb) => (
            <Card key={vb.verseKey} className="overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                onClick={() => setExpandedVerse(expandedVerse === vb.verseKey ? null : vb.verseKey)}
              >
                <span className="font-medium text-indigo-700 text-sm">{vb.verseKey}</span>
                {expandedVerse === vb.verseKey
                  ? <ChevronUp className="w-4 h-4 text-gray-400" />
                  : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>

              {expandedVerse === vb.verseKey && (
                <div className="px-4 pb-4 space-y-3 border-t">
                  <p className="text-sm text-gray-700 mt-3 leading-relaxed">{vb.explanation}</p>

                  {/* Existing QAs */}
                  {(verseNotes[vb.verseKey]?.qa || []).map((qa, i) => (
                    <div key={i} className="bg-white border rounded-lg p-3">
                      <p className="text-xs font-medium text-indigo-600 mb-1">Q: {qa.q}</p>
                      <p className="text-sm text-gray-700">{qa.a}</p>
                    </div>
                  ))}

                  {/* Follow-up input */}
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Ask a follow-up about this verse..."
                      value={followUpInputs[vb.verseKey] || ''}
                      onChange={(e) => setFollowUpInputs(prev => ({ ...prev, [vb.verseKey]: e.target.value }))}
                      className="min-h-[60px] text-sm"
                    />
                    <Button
                      size="sm"
                      onClick={() => submitFollowUp(vb.verseKey)}
                      disabled={!followUpInputs[vb.verseKey]?.trim() || followUpLoading[vb.verseKey]}
                    >
                      {followUpLoading[vb.verseKey]
                        ? <Loader2 className="w-3 h-3 animate-spin" />
                        : <Send className="w-3 h-3" />}
                    </Button>
                  </div>

                  {/* Save verse note */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => saveVerseNote(vb.verseKey)}
                    disabled={verseNotes[vb.verseKey]?.saved}
                    className="text-xs gap-1"
                  >
                    {verseNotes[vb.verseKey]?.saved ? <Check className="w-3 h-3" /> : <Save className="w-3 h-3" />}
                    {verseNotes[vb.verseKey]?.saved ? 'Verse Saved' : 'Save Verse Note'}
                  </Button>
                </div>
              )}
            </Card>
          ))}

          {/* Themes + Application */}
          {thread.themes?.length > 0 && (
            <Card className="p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Themes</h4>
              <div className="flex flex-wrap gap-2">
                {thread.themes.map((t, i) => (
                  <Badge key={i} variant="secondary">{t}</Badge>
                ))}
              </div>
            </Card>
          )}

          {thread.application?.length > 0 && (
            <Card className="p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Application</h4>
              <ul className="space-y-1">
                {thread.application.map((a, i) => (
                  <li key={i} className="text-sm text-gray-700 flex gap-2">
                    <span className="text-indigo-500 flex-shrink-0">•</span>{a}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Categories */}
          <Card className="p-4">
            <h4 className="font-semibold text-gray-900 mb-2 text-sm">Tag Categories</h4>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`px-2 py-1 rounded-full text-xs border transition-colors ${
                    selectedCategories.includes(cat)
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </Card>

          {/* Action buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(thread.summary)} className="gap-1">
              <Copy className="w-3 h-3" /> Copy
            </Button>
            <Button variant="outline" size="sm" onClick={saveThread} disabled={saved} className="gap-1">
              {saved ? <Check className="w-3 h-3" /> : <Save className="w-3 h-3" />}
              {saved ? 'Saved' : 'Save'}
            </Button>
            <Button variant="outline" size="sm" onClick={shareThread} disabled={shared} className="gap-1">
              <Share2 className="w-3 h-3" />
              {shared ? 'Link Copied!' : 'Share'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setThread(null)} className="text-xs">
              Re-generate
            </Button>
          </div>

          {shared && shareId && (
            <p className="text-xs text-green-700 bg-green-50 p-2 rounded">
              Share link copied to clipboard. Anyone with the link can view this explanation.
            </p>
          )}

          <p className="text-xs text-gray-400 italic">AI-generated explanation · Always verify with Scripture</p>
        </div>
      )}
    </div>
  );
}