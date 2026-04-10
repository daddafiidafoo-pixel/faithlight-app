import React, { useState, useEffect } from 'react';
import { Sparkles, Heart, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PrayerCoachPanel({ verseReference, verseText, userEmail, onSaveToJournal }) {
  const [prayerPoints, setPrayerPoints] = useState([]);
  const [reflectionPrompts, setReflectionPrompts] = useState([]);
  const [prayerStarters, setPrayerStarters] = useState([]);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (verseReference) {
      setPrayerPoints([
        { id: 1, content: `Reflect on the meaning of ${verseReference} in your life.` },
        { id: 2, content: `Pray for wisdom to apply this verse daily.` },
        { id: 3, content: `Consider how this verse strengthens your faith.` },
      ]);
      setReflectionPrompts([
        `What does this verse reveal about God's character?`,
        `How can you apply this verse to your current situation?`,
      ]);
      setPrayerStarters([
        `Father, help me understand the depth of ${verseReference}...`,
        `Lord, as I meditate on this verse, guide my heart...`,
      ]);
    }
  }, [verseReference, verseText]);

  const handleSaveToJournal = (content) => {
    if (onSaveToJournal) onSaveToJournal();
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!verseReference) return null;

  return (
    <div className="card p-6 rounded-xl border-l-4 border-purple-500">
      <div className="flex items-center gap-2 mb-4 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <Sparkles className="w-5 h-5 text-purple-600" />
        <h3 className="font-bold text-slate-900">Prayer Coach</h3>
      </div>

      {expanded && (
        <div className="space-y-6 mt-4 pt-4 border-t border-slate-200">
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Prayer Points</h4>
            <div className="space-y-2">
              {prayerPoints.map((point) => (
                <div
                  key={point.id}
                  className="bg-purple-50 p-3 rounded-lg border border-purple-100"
                >
                  <p className="text-sm text-slate-700 mb-2">{point.content}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleSaveToJournal(point.content)}
                    className="text-xs h-7"
                  >
                    <Heart className="w-3 h-3 mr-1" />
                    Save to Journal
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Reflection Prompts</h4>
            <div className="space-y-2">
              {reflectionPrompts.slice(0, 2).map((prompt, idx) => (
                <div key={idx} className="text-sm text-slate-600 italic">
                  "{prompt}"
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Prayer Starters</h4>
            <div className="space-y-2">
              {prayerStarters.slice(0, 2).map((starter, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <p className="text-sm text-slate-700 flex-1">{starter}</p>
                  <button
                    onClick={() => handleCopyToClipboard(starter)}
                    className="text-slate-400 hover:text-indigo-600 flex-shrink-0"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-lg">
            ℹ️ This AI content is meant to assist your prayer time, not replace Scripture study, pastoral guidance, or your own spiritual discernment.
          </p>
        </div>
      )}
    </div>
  );
}