import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import Skeleton from '@/components/ui/Skeleton';

export default function AISermonGenerator() {
  const [type, setType] = useState('verse'); // 'verse' or 'topic'
  const [input, setInput] = useState('');
  const [tone, setTone] = useState('teaching'); // teaching, preaching, expository
  const [duration, setDuration] = useState(30); // minutes
  const [audience, setAudience] = useState('adults');
  
  const [loading, setLoading] = useState(false);
  const [sermon, setSermon] = useState(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setError('');
    setLoading(true);

    try {
      const res = await base44.functions.invoke('generateSermon', {
        type: type, // 'verse' or 'topic'
        input: input,
        tone: tone,
        duration_minutes: duration,
        audience: audience
      });

      if (res?.data?.sermon) {
        setSermon(res.data.sermon);
      } else {
        setError('Failed to generate sermon. Try again.');
      }
    } catch (err) {
      console.error('Generation error:', err);
      setError(err.message || 'Error generating sermon');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader title="Sermon Generator" subtitle="AI-powered sermon outlines and notes" />
        <CardContent className="space-y-4">
          {/* Type Selection */}
          <div>
            <label className="text-sm font-semibold block mb-2">Choose Input Type</label>
            <div className="flex gap-2">
              <Button
                variant={type === 'verse' ? 'primary' : 'secondary'}
                onClick={() => setType('verse')}
              >
                Bible Verse
              </Button>
              <Button
                variant={type === 'topic' ? 'primary' : 'secondary'}
                onClick={() => setType('topic')}
              >
                Topic/Theme
              </Button>
            </div>
          </div>

          {/* Input Field */}
          <div>
            <label className="text-sm font-semibold block mb-2">
              {type === 'verse' ? 'Enter Verse (e.g., John 3:16)' : 'Enter Topic or Theme'}
            </label>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={type === 'verse' ? 'John 3:16' : 'Love, Faith, Redemption...'}
            />
          </div>

          {/* Sermon Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold block mb-2">Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
              >
                <option value="teaching">Teaching</option>
                <option value="preaching">Preaching</option>
                <option value="expository">Expository</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold block mb-2">Audience</label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
              >
                <option value="adults">Adults</option>
                <option value="youth">Youth</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="text-sm font-semibold block mb-2">Duration: {duration} minutes</label>
            <input
              type="range"
              min="15"
              max="60"
              step="5"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}

          <Button
            onClick={handleGenerate}
            disabled={loading || !input.trim()}
            className="w-full"
          >
            {loading ? 'Generating...' : 'Generate Sermon'}
          </Button>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="space-y-2">
          <Skeleton className="h-20" />
          <Skeleton className="h-32" />
          <Skeleton className="h-24" />
        </div>
      )}

      {/* Generated Sermon */}
      {sermon && !loading && (
        <div className="space-y-4">
          {/* Title */}
          {sermon.title && (
            <Card>
              <CardHeader title={sermon.title} subtitle={sermon.subtitle} />
            </Card>
          )}

          {/* Outline */}
          {sermon.outline && (
            <Card>
              <CardHeader title="Sermon Outline" />
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  {sermon.outline.split('\n').map((line, i) => (
                    line.trim() && (
                      <p key={i} className="text-sm text-gray-700 mb-2">
                        {line}
                      </p>
                    )
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Key Points */}
          {sermon.key_points && sermon.key_points.length > 0 && (
            <Card>
              <CardHeader title="Key Points" />
              <CardContent>
                <ul className="space-y-2">
                  {sermon.key_points.map((point, i) => (
                    <li key={i} className="text-sm text-gray-700 flex gap-2">
                      <span className="font-bold text-indigo-600 flex-shrink-0">{i + 1}.</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Supporting Scriptures */}
          {sermon.supporting_verses && sermon.supporting_verses.length > 0 && (
            <Card>
              <CardHeader title="Supporting Scripture" />
              <CardContent>
                <ul className="space-y-2">
                  {sermon.supporting_verses.map((verse, i) => (
                    <li key={i} className="text-sm">
                      <span className="font-semibold text-indigo-600">{verse.reference}</span>
                      <p className="text-gray-700 mt-1">{verse.text}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {sermon.notes && (
            <Card>
              <CardHeader title="Notes" />
              <CardContent>
                <div className="text-sm text-gray-700 space-y-2">
                  {sermon.notes.split('\n').map((note, i) => (
                    note.trim() && <p key={i}>{note}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Button onClick={() => setSermon(null)} className="w-full">
            Generate Another
          </Button>
        </div>
      )}
    </div>
  );
}