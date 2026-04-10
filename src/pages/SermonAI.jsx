import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Sparkles, Copy, Save, Send } from 'lucide-react';
import { useI18n } from '@/components/I18nProvider';
import SermonOutlineForm from '@/components/sermon/SermonOutlineForm';
import SermonOutlineDisplay from '@/components/sermon/SermonOutlineDisplay';
import SendToSessionModal from '@/components/sermon/SendToSessionModal';

export default function SermonAI() {
  const { t } = useI18n();
  const [user, setUser] = useState(null);
  const [outline, setOutline] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.isAuthenticated().then(authed => {
      if (authed) {
        base44.auth.me().then(u => setUser(u)).catch(() => {});
      }
    });
  }, []);

  const { data: userOutlines = [], refetch: refetchOutlines } = useQuery({
    queryKey: ['sermonOutlines', user?.email],
    queryFn: () => user ? base44.entities.SermonOutline.filter(
      { pastorId: user.email },
      '-created_date',
      20
    ) : [],
    enabled: !!user
  });

  const generateMutation = useMutation({
    mutationFn: async (params) => {
      setLoading(true);
      const prompt = `Generate a sermon outline with the following:
Bible Verse: ${params.verseRef}
Topic: ${params.topic}
Audience: ${params.audience || 'mixed'}
Length: ${params.length || 'medium'}

Please provide a structured outline with:
- Title
- Key verse and historical context
- 3-5 main points with scripture support
- Application ideas
- Optional closing prayer

Format as JSON with keys: title, keyVerse, context, mainPoints (array), application, closingPrayer`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            keyVerse: { type: 'string' },
            context: { type: 'string' },
            mainPoints: { type: 'array', items: { type: 'string' } },
            application: { type: 'string' },
            closingPrayer: { type: 'string' }
          }
        }
      });

      setLoading(false);
      setOutline(result);
      return result;
    }
  });

  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.SermonOutline.create(data),
    onSuccess: () => {
      refetchOutlines();
      alert('Outline saved!');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SermonOutline.update(id, data),
    onSuccess: () => {
      refetchOutlines();
      alert('Outline updated!');
    }
  });

  const handleGenerate = (params) => {
    generateMutation.mutate(params);
  };

  const handleSave = (params) => {
    if (!user) {
      alert(t('common.loginRequired', 'Please sign in'));
      return;
    }
    saveMutation.mutate({
      pastorId: user.email,
      verseRef: params.verseRef,
      topic: params.topic,
      audience: params.audience,
      length: params.length,
      outlineJson: outline
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-3">{t('sermonAI.title', 'Sermon AI Generator')}</h1>
          <p className="text-slate-600 mb-6">{t('sermonAI.loginPrompt', 'Please sign in to create sermon outlines')}</p>
          <Button onClick={() => base44.auth.redirectToLogin()} className="bg-indigo-600">
            {t('nav.login', 'Sign In')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{t('sermonAI.pageTitle', 'AI Sermon Outline Generator')}</h1>
        <p className="text-slate-600 mb-6">{t('sermonAI.subtitle', 'Create sermon outlines in seconds')}</p>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Form */}
          <div className="lg:col-span-1">
            <SermonOutlineForm
              onGenerate={handleGenerate}
              loading={loading}
            />
          </div>

          {/* Output */}
          <div className="lg:col-span-2">
            {outline ? (
              <>
                <SermonOutlineDisplay outline={outline} />
                <div className="flex gap-3 mt-6 flex-wrap">
                  <Button
                   variant="outline"
                   onClick={() => {
                     navigator.clipboard.writeText(JSON.stringify(outline, null, 2));
                     alert(t('sermonAI.copiedClipboard', 'Copied to clipboard!'));
                   }}
                   className="gap-2"
                  >
                   <Copy className="w-4 h-4" /> {t('sermonAI.copy', 'Copy')}
                  </Button>
                  <Button
                   onClick={() => handleSave({
                     verseRef: 'Custom',
                     topic: outline.title,
                     audience: 'mixed',
                     length: 'medium'
                   })}
                   className="gap-2 bg-green-600 hover:bg-green-700"
                  >
                   <Save className="w-4 h-4" /> {t('sermonAI.save', 'Save')}
                  </Button>
                  <Button
                   onClick={() => setShowSendModal(true)}
                   className="gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                   <Send className="w-4 h-4" /> {t('sermonAI.sendSession', 'Send to Session')}
                  </Button>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-lg p-8 text-center border-2 border-dashed border-slate-300">
                <Sparkles className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600">
                  {loading ? t('sermonAI.generating', 'Generating outline...') : t('sermonAI.enterDetails', 'Enter details and generate an outline')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Send Modal */}
        {showSendModal && outline && (
          <SendToSessionModal
            outline={outline}
            userEmail={user.email}
            onClose={() => setShowSendModal(false)}
          />
        )}

        {/* Saved Outlines */}
        {userOutlines.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-slate-900 mb-4">{t('sermonAI.recentOutlines', 'Recent Outlines')}</h2>
            <div className="grid gap-3">
              {userOutlines.map(o => (
                <div
                  key={o.id}
                  className="text-left bg-white p-4 rounded-lg border border-slate-200 flex justify-between items-start gap-4 hover:shadow-md"
                >
                  <button
                    onClick={() => setOutline(o.outlineJson)}
                    className="flex-1"
                  >
                    <p className="font-semibold text-slate-900 text-left">{o.topic}</p>
                    <p className="text-sm text-slate-500">{o.verseRef}</p>
                  </button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                       const newTitle = prompt(t('sermonAI.editTitle', 'Edit title:'), o.topic);
                       if (newTitle) {
                         updateMutation.mutate({
                           id: o.id,
                           data: { topic: newTitle }
                         });
                       }
                     }}
                    className="flex-shrink-0"
                    >
                    {t('sermonAI.edit', 'Edit')}
                    </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}