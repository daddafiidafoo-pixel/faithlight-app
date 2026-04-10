import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';

const ACTION_COLORS = {
  REMOVE_CONTENT: 'bg-orange-100 text-orange-800',
  WARN_USER: 'bg-yellow-100 text-yellow-800',
  SUSPEND_USER: 'bg-red-100 text-red-800',
  DISMISS_REPORT: 'bg-green-100 text-green-800',
  NEEDS_HUMAN_REVIEW: 'bg-gray-100 text-gray-700',
};

export default function AIModerationAssistPanel({ report, content, modStatus, modHistory }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const analyze = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await base44.functions.invoke('aiModerationAssist', {
        report,
        content,
        reportedUser: { id: report?.target_owner_user_id },
        moderationStatus: modStatus,
        moderationHistory: modHistory || [],
      });
      setResult(res.data);
    } catch (e) {
      setError(e.message || 'AI analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-indigo-200 rounded-xl bg-indigo-50/50 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span className="font-semibold text-sm text-indigo-900">AI Moderation Assist</span>
        </div>
        <Button
          size="sm"
          onClick={analyze}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 h-8 text-xs"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
          {loading ? 'Analyzing…' : 'Analyze'}
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-700 text-sm bg-red-50 rounded-lg px-3 py-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {!result && !loading && !error && (
        <p className="text-xs text-gray-500 italic">
          Click Analyze to get an AI-suggested action, rationale, and draft messages.
        </p>
      )}

      {result && (
        <div className="space-y-3 mt-2">
          {/* Suggested action */}
          <div className="flex items-center gap-3">
            <Badge className={ACTION_COLORS[result.suggestedAction] || 'bg-gray-100 text-gray-700'}>
              {result.suggestedAction}
            </Badge>
            {typeof result.confidence === 'number' && (
              <span className="text-xs text-gray-500">
                {Math.round(result.confidence * 100)}% confidence
              </span>
            )}
          </div>

          {/* Rationale */}
          {result.rationale && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Rationale</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{result.rationale}</p>
            </div>
          )}

          {/* History summary */}
          {result.historySummary && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">History Summary</p>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{result.historySummary}</p>
            </div>
          )}

          {/* Draft warning */}
          {result.draftWarning && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Draft Warning</p>
              <textarea
                readOnly
                value={result.draftWarning}
                className="w-full text-sm text-gray-700 border border-gray-200 rounded-lg p-2 resize-none bg-white"
                rows={3}
                onClick={e => e.target.select()}
              />
            </div>
          )}

          {/* Draft removal notice */}
          {result.draftRemovalNotice && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Draft Removal Notice</p>
              <textarea
                readOnly
                value={result.draftRemovalNotice}
                className="w-full text-sm text-gray-700 border border-gray-200 rounded-lg p-2 resize-none bg-white"
                rows={3}
                onClick={e => e.target.select()}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}