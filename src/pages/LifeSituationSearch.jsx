import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Heart, Sparkles } from 'lucide-react';
import { useI18n } from '../components/I18nProvider';

const LIFE_SITUATIONS = [
  'fear', 'anxiety', 'depression', 'grief', 'forgiveness', 'anger',
  'loneliness', 'failure', 'doubt', 'stress', 'shame', 'addiction'
];

export default function LifeSituationSearch() {
  const { t } = useI18n();
  const [situation, setSituation] = useState('fear');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchSituation = async () => {
    if (!situation.trim()) {
      setError('Please enter a life situation');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await base44.functions.invoke('searchByLifeSituation', {
        situation: situation,
        language: localStorage.getItem('faithlight_ui_lang') || 'en'
      });
      setResult(response.data);
    } catch (err) {
      setError('Failed to find verses. Please try again.');
      console.error('[LifeSituationSearch] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchSituation();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-orange-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-rose-900 mb-2">🔍 Find Hope in Every Situation</h1>
          <p className="text-rose-700">Search Bible verses by the challenges you're facing</p>
        </div>

        {/* Search Section */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" />
              What are you facing?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="E.g., fear, forgiveness, loneliness, failure..."
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              onKeyPress={handleKeyPress}
              className="rounded-lg text-base"
            />
            <div className="flex flex-wrap gap-2">
              {LIFE_SITUATIONS.map(s => (
                <Button
                  key={s}
                  variant={situation.toLowerCase() === s ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSituation(s)}
                  className="capitalize"
                >
                  {s}
                </Button>
              ))}
            </div>
            <Button
              onClick={searchSituation}
              disabled={loading || !situation.trim()}
              className="w-full bg-rose-600 hover:bg-rose-700 gap-2"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Find Bible Verses
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <Card className="mb-6 border-red-300 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-700">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Theme Explanation */}
            <Card className="border-l-4 border-l-rose-600 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg capitalize text-rose-900">
                  About {result.situation}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {result.theme_explanation}
                </p>
              </CardContent>
            </Card>

            {/* Verses */}
            {result.verses && result.verses.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-rose-900">📖 Recommended Verses</h2>
                {result.verses.map((verse, idx) => (
                  <Card key={idx} className="shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-base text-rose-800">
                        {verse.reference}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 italic leading-relaxed">
                        "{verse.text}"
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Suggested Prayer */}
            <Card className="bg-gradient-to-r from-rose-50 to-orange-50 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-rose-500" />
                  Prayer for This Situation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed italic">
                  {result.suggested_prayer}
                </p>
              </CardContent>
            </Card>

            {/* Search Another Button */}
            <Button
              onClick={searchSituation}
              disabled={loading}
              className="w-full bg-rose-600 hover:bg-rose-700"
              size="lg"
            >
              Search Another Situation
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}