import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Copy, Share2, Save, RotateCcw, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/components/I18nProvider';
import { toast } from 'sonner';

export default function SermonAndPrayerBuilder() {
  const { t } = useI18n();
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState('sermon'); // 'sermon' or 'prayer'
  const [input, setInput] = useState('');
  const [audience, setAudience] = useState('personal');
  const [output, setOutput] = useState(null);
  const [isSaved, setIsSaved] = useState(false);

  React.useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  const generateMutation = useMutation({
    mutationFn: async (data) => {
      const prompt =
        mode === 'sermon'
          ? `Generate a structured sermon outline for ${data.input}. Target audience: ${audience}. Format: Title, Main Theme, Key Scripture, Introduction, 3 Main Points, Application, Closing Prayer.`
          : `Generate a personalized prayer based on ${data.input}. Target audience: ${audience}. Include scripture, prayer body, and reflection.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            content: { type: 'string' },
            scripture: { type: 'string' },
          },
        },
      });

      return response;
    },
    onSuccess: (data) => {
      setOutput(data);
      setIsSaved(false);
    },
    onError: () => {
      toast.error(t('errors.generationFailed', 'Failed to generate content. Please try again.'));
    },
  });

  const saveMutation = useMutation({
    mutationFn: (data) =>
      base44.entities.AIGeneratedContent.create({
        user_id: user?.id,
        content_type: mode === 'sermon' ? 'sermon_outline' : 'prayer',
        input_verse_ref: input,
        audience,
        output_content: data,
        is_saved: true,
      }),
    onSuccess: () => {
      setIsSaved(true);
      toast.success(t('ai.saved', 'Saved successfully'));
    },
  });

  const handleGenerate = () => {
    if (!input.trim()) {
      toast.error(t('errors.inputRequired', 'Please enter a verse or theme'));
      return;
    }
    generateMutation.mutate({ input, audience });
  };

  const handleCopy = () => {
    if (output) {
      const text = `${output.title}\n\n${output.content}`;
      navigator.clipboard.writeText(text);
      toast.success(t('verses.copied', 'Copied to clipboard'));
    }
  };

  const handleSave = () => {
    if (output) {
      saveMutation.mutate(output);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-indigo-900 mb-6">
          {t('ai.sermonAndPrayer', 'Sermon & Prayer Builder')}
        </h1>

        {/* Mode Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">
            {t('ai.selectMode', 'What would you like to create?')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => {
                setMode('sermon');
                setOutput(null);
              }}
              className={`p-4 rounded-lg border-2 transition-all text-center ${
                mode === 'sermon'
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-300'
              }`}
            >
              <p className="text-xl font-semibold">📖</p>
              <p className="font-semibold mt-2 text-gray-900">
                {t('ai.sermonOutline', 'Sermon Outline')}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {t('ai.sermonDescription', 'Structure for preaching')}
              </p>
            </button>

            <button
              onClick={() => {
                setMode('prayer');
                setOutput(null);
              }}
              className={`p-4 rounded-lg border-2 transition-all text-center ${
                mode === 'prayer'
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-300'
              }`}
            >
              <p className="text-xl font-semibold">🙏</p>
              <p className="font-semibold mt-2 text-gray-900">
                {t('ai.prayer', 'Prayer')}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {t('ai.prayerDescription', 'Personalized prayer')}
              </p>
            </button>
          </div>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('ai.input', 'Verse or Theme')}
            </label>
            <Input
              placeholder={t('ai.verseOrThemePlaceholder', 'e.g., John 3:16 or Faith')}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('ai.audience', 'Audience')}
            </label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="personal">{t('ai.personal', 'Personal Study')}</option>
              <option value="youth">{t('ai.youth', 'Youth Group')}</option>
              <option value="church">{t('ai.church', 'Church Service')}</option>
              <option value="bible_study">{t('ai.bibleStudy', 'Bible Study Group')}</option>
            </select>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={generateMutation.isPending}
            className="w-full"
          >
            {generateMutation.isPending ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                {t('ai.generating', 'Generating...')}
              </>
            ) : (
              mode === 'sermon'
              ? t('ai.generateOutline', 'Generate Outline')
              : t('ai.generatePrayer', 'Generate Prayer')
            )}
          </Button>
        </div>

        {/* Output Section */}
        {output && (
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <h3 className="font-semibold text-gray-900 text-lg">{output.title}</h3>

            {output.scripture && (
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                <p className="text-sm font-medium text-indigo-900">
                  {t('ai.scripture', 'Scripture')}
                </p>
                <p className="text-sm text-indigo-800 mt-1">{output.scripture}</p>
              </div>
            )}

            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">{output.content}</p>
            </div>

            <div className="flex gap-2 flex-wrap pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={handleCopy}
                className="gap-2"
              >
                <Copy className="w-4 h-4" />
                {t('verses.copy', 'Copy')}
              </Button>

              <Button
                variant="outline"
                onClick={handleSave}
                disabled={isSaved}
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaved ? t('ai.saved', 'Saved') : t('common.save', 'Save')}
              </Button>

              <Button
                variant="outline"
                onClick={() => generateMutation.mutate({ input, audience })}
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                {t('ai.regenerate', 'Regenerate')}
              </Button>

              <Button
                variant="outline"
                className="gap-2"
              >
                <Share2 className="w-4 h-4" />
                {t('verses.share', 'Share')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}