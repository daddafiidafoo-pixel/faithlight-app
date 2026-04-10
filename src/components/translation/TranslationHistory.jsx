import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Globe } from 'lucide-react';

const LANGUAGES = {
  en: '🇬🇧 English',
  om: '🇪🇹 Oromo',
  am: '🇪🇹 Amharic',
  ar: '🇸🇦 Arabic',
};

export default function TranslationHistory({ userId }) {
  const { data: translations = [] } = useQuery({
    queryKey: ['translation-history', userId],
    queryFn: () => base44.entities.VoiceRequest.filter(
      { user_id: userId },
      '-created_date',
      10
    ),
    enabled: !!userId,
  });

  if (translations.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-6">
            <Globe className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-600">No translations yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Recent Translations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {translations.map((tr) => (
            <div key={tr.id} className="p-3 border rounded-lg hover:bg-gray-50">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="text-xs text-gray-600">
                  {new Date(tr.created_date).toLocaleDateString()}
                </div>
                <Badge variant={tr.status === 'DONE' ? 'default' : 'secondary'}>
                  {tr.status === 'DONE' ? '✓' : '⏳'} {tr.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-900 line-clamp-2">{tr.source_text}</p>
              {tr.result_translation && (
                <p className="text-sm text-blue-600 mt-2 line-clamp-2">
                  {LANGUAGES[tr.target_language]}: {tr.result_translation}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}