import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, RefreshCw, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const AUDIENCES = [
  { value: 'general', label: 'General Congregation' },
  { value: 'youth', label: 'Youth' },
  { value: 'children', label: 'Children' },
  { value: 'students', label: 'Theological Students' },
  { value: 'leaders', label: 'Church Leaders' },
];

const TONES = [
  { value: 'inspirational', label: 'Inspirational' },
  { value: 'instructional', label: 'Instructional' },
  { value: 'apologetic', label: 'Apologetic' },
  { value: 'devotional', label: 'Devotional' },
  { value: 'prophetic', label: 'Prophetic' },
];

export default function EnhancedSermonBuilder() {
  const [topic, setTopic] = useState('');
  const [scripture, setScripture] = useState('');
  const [audience, setAudience] = useState('general');
  const [tone, setTone] = useState('inspirational');
  const [duration, setDuration] = useState('30');
  const [sermonOutput, setSermonOutput] = useState(null);
  const [regeneratingSection, setRegeneratingSection] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateSermon = async () => {
    if (!topic || !scripture) {
      alert('Please enter a topic and scripture reference');
      return;
    }

    setIsLoading(true);
    try {
      const response = await base44.functions.invoke('generateSermonContent', {
        topic,
        scripture,
        audience,
        tone,
        duration: parseInt(duration),
      });

      const sermon = response.data?.sermon || response.data;
      setSermonOutput(sermon);
    } catch (error) {
      console.error('Error generating sermon:', error);
      alert('Failed to generate sermon');
    } finally {
      setIsLoading(false);
    }
  };

  const regenerateSection = async (sectionId) => {
    if (!sermonOutput) return;

    setRegeneratingSection(sectionId);
    try {
      const response = await base44.functions.invoke('generateSermonSection', {
        topic,
        scripture,
        audience,
        tone,
        sectionId,
        currentOutline: sermonOutput,
      });

      const updatedSermon = {
        ...sermonOutput,
        [sectionId]: response.data?.[sectionId] || response.data,
      };
      setSermonOutput(updatedSermon);
    } catch (error) {
      console.error('Error regenerating section:', error);
      alert('Failed to regenerate section');
    } finally {
      setRegeneratingSection(null);
    }
  };

  const downloadSermon = () => {
    if (!sermonOutput) return;
    const text = JSON.stringify(sermonOutput, null, 2);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sermon-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Sermon Builder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topic
              </label>
              <Input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., The Prodigal Son"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scripture Reference
              </label>
              <Input
                value={scripture}
                onChange={(e) => setScripture(e.target.value)}
                placeholder="e.g., Luke 15:11-32"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Audience
              </label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AUDIENCES.map((aud) => (
                    <SelectItem key={aud.value} value={aud.value}>
                      {aud.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tone
              </label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes)
              </label>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                min="10"
                max="60"
              />
            </div>
          </div>

          <Button
            onClick={generateSermon}
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Sermon
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Sermon Output */}
      {sermonOutput && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Sermon</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title Section */}
            {sermonOutput.title && (
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {sermonOutput.title}
                  </h3>
                  <Button
                    onClick={() => regenerateSection('title')}
                    disabled={regeneratingSection === 'title'}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    {regeneratingSection === 'title' ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3 h-3" />
                    )}
                    Regenerate
                  </Button>
                </div>
              </div>
            )}

            {/* Introduction */}
            {sermonOutput.intro && (
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-lg text-gray-900">Introduction</h4>
                  <Button
                    onClick={() => regenerateSection('intro')}
                    disabled={regeneratingSection === 'intro'}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    {regeneratingSection === 'intro' ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3 h-3" />
                    )}
                  </Button>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{sermonOutput.intro}</p>
              </div>
            )}

            {/* Main Points */}
            {sermonOutput.points && Array.isArray(sermonOutput.points) && (
              <div className="space-y-4">
                {sermonOutput.points.map((point, idx) => (
                  <div key={idx} className="space-y-2 bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <h5 className="font-semibold text-gray-900">
                        Point {idx + 1}: {point.title}
                      </h5>
                      <Button
                        onClick={() => regenerateSection(`point_${idx}`)}
                        disabled={regeneratingSection === `point_${idx}`}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        {regeneratingSection === `point_${idx}` ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <RefreshCw className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{point.content}</p>
                    {point.examples && (
                      <div className="text-sm italic text-gray-600 mt-2">
                        <strong>Example:</strong> {point.examples}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Application */}
            {sermonOutput.application && (
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-lg text-gray-900">Application</h4>
                  <Button
                    onClick={() => regenerateSection('application')}
                    disabled={regeneratingSection === 'application'}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    {regeneratingSection === 'application' ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3 h-3" />
                    )}
                  </Button>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {sermonOutput.application}
                </p>
              </div>
            )}

            {/* Discussion Questions */}
            {sermonOutput.questions && Array.isArray(sermonOutput.questions) && (
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-lg text-gray-900">
                    Discussion Questions
                  </h4>
                  <Button
                    onClick={() => regenerateSection('questions')}
                    disabled={regeneratingSection === 'questions'}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    {regeneratingSection === 'questions' ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3 h-3" />
                    )}
                  </Button>
                </div>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {sermonOutput.questions.map((q, idx) => (
                    <li key={idx}>{q}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Download Button */}
            <Button
              onClick={downloadSermon}
              variant="outline"
              className="w-full gap-2"
            >
              Download Sermon
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}