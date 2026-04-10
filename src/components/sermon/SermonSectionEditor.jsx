import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useI18n } from '../I18nProvider';
import { RefreshCw, Lightbulb, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

/**
 * SermonSectionEditor
 * 
 * Component for editing a sermon section with regenerate + suggest edits
 * Integrates into SermonBuilder or sermon editor pages
 */
export default function SermonSectionEditor({
  sermonTopic,
  audience,
  sermonStyle,
  sectionType,
  sectionContent,
  onSectionUpdate,
}) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState(null);

  const handleRegenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await base44.functions.invoke('sermonRegenerateSection', {
        section_type: sectionType,
        current_content: sectionContent,
        sermon_topic: sermonTopic,
        audience,
        sermon_style: sermonStyle,
      });

      onSectionUpdate(response.content);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestEdits = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await base44.functions.invoke('sermonSuggestEdits', {
        content: sectionContent,
        review_type: 'all',
        sermon_topic: sermonTopic,
        audience,
      });

      setSuggestions(response.suggestions || []);
      setShowSuggestions(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={handleRegenerate}
          disabled={loading || !sectionContent}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          {t('sermon.regenerate', 'Regenerate')}
        </Button>
        <Button
          onClick={handleSuggestEdits}
          disabled={loading || !sectionContent}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Lightbulb className="w-4 h-4" />
          )}
          {t('sermon.suggestEdits', 'Suggest Edits')}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="text-sm text-red-600 flex items-center gap-2 mt-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Suggestions Dialog */}
      <Dialog open={showSuggestions} onOpenChange={setShowSuggestions}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('sermon.suggestionsTitle', 'Improvement Suggestions')}</DialogTitle>
            <DialogDescription>
              {t('sermon.suggestionsDesc', 'AI-powered suggestions for clarity, flow, and theological depth')}
            </DialogDescription>
          </DialogHeader>

          {suggestions.length > 0 ? (
            <div className="space-y-4">
              {suggestions.map((suggestion, idx) => (
                <Card key={idx} className="p-4 border border-amber-200 bg-amber-50">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="px-2 py-1 bg-amber-600 text-white rounded text-xs font-semibold">
                        {suggestion.area}
                      </span>
                      <p className="font-medium text-gray-900">{suggestion.issue}</p>
                    </div>
                    <p className="text-sm text-gray-700 ml-0">
                      <strong>Suggestion:</strong> {suggestion.suggestion}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-600">
              {t('sermon.noSuggestions', 'No suggestions at this time')}
            </div>
          )}

          <Button onClick={() => setShowSuggestions(false)} className="w-full">
            {t('common.close', 'Close')}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}