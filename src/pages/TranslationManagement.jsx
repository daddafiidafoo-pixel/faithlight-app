import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { BookOpen, Check, AlertCircle, Shield, Quote } from 'lucide-react';

const LICENSE_COLORS = {
  public_domain: 'bg-green-100 text-green-800',
  open_license: 'bg-blue-100 text-blue-800',
  commercial: 'bg-amber-100 text-amber-800',
  unknown: 'bg-gray-100 text-gray-800'
};

const LICENSE_ICONS = {
  public_domain: '✓',
  open_license: '◯',
  commercial: '⚡',
  unknown: '?'
};

export default function TranslationManagement() {
  const [user, setUser] = useState(null);
  const [selectedTranslation, setSelectedTranslation] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        setSelectedTranslation(currentUser.preferred_translation || 'WEB');
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    fetchUser();
  }, []);

  const { data: translations = [], isLoading } = useQuery({
    queryKey: ['translations'],
    queryFn: () => base44.entities.Translation.list()
  });

  const updateTranslationMutation = useMutation({
    mutationFn: async (translationCode) => {
      await base44.auth.updateMe({
        preferred_translation: translationCode
      });
      setUser({ ...user, preferred_translation: translationCode });
      return translationCode;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['translations']);
    }
  });

  const handleSelectTranslation = (code) => {
    setSelectedTranslation(code);
    updateTranslationMutation.mutate(code);
  };

  const activeTranslations = translations.filter(t => t.is_active);
  const inactiveTranslations = translations.filter(t => !t.is_active);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bible Translations</h1>
          <p className="text-gray-600">Select your preferred translation and view license information</p>
        </div>

        {/* Current Selection */}
        {user && (
          <Card className="mb-8 border-indigo-200 bg-indigo-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">Default Translation</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {translations.find(t => t.translation_code === selectedTranslation)?.display_name || 'Not set'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Translations */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Available Translations</h2>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading translations...</div>
          ) : activeTranslations.length === 0 ? (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-yellow-900">No translations available yet</p>
                    <p className="text-sm text-yellow-800 mt-1">Admins can import translations using the Bible Data Setup page.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {activeTranslations.map((translation) => (
                <Card
                  key={translation.id}
                  className={`cursor-pointer transition-all border-2 ${
                    selectedTranslation === translation.translation_code
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                  onClick={() => handleSelectTranslation(translation.translation_code)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 flex items-start gap-3">
                        <RadioGroupItem
                          value={translation.translation_code}
                          id={translation.id}
                          checked={selectedTranslation === translation.translation_code}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <CardTitle className="text-lg">{translation.display_name}</CardTitle>
                          <CardDescription className="mt-1">{translation.translation_code}</CardDescription>
                        </div>
                      </div>
                      <Badge className={LICENSE_COLORS[translation.license_type]}>
                        {LICENSE_ICONS[translation.license_type]} {translation.license_type.replace('_', ' ')}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {translation.description && (
                      <p className="text-sm text-gray-700">{translation.description}</p>
                    )}

                    {/* Verse Count */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Quote className="w-4 h-4 text-gray-400" />
                      <span>{translation.verse_count.toLocaleString()} verses</span>
                    </div>

                    {/* License Details */}
                    {translation.attribution_required && (
                      <div className="bg-amber-50 border border-amber-200 rounded p-3">
                        <div className="flex gap-2">
                          <Shield className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div className="text-sm">
                            <p className="font-semibold text-amber-900">Attribution Required</p>
                            {translation.attribution_text && (
                              <p className="text-amber-800 mt-1">{translation.attribution_text}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {translation.source_provider && (
                      <div className="text-xs text-gray-500">
                        <span className="font-semibold">Source:</span> {translation.source_provider}
                      </div>
                    )}

                    {translation.import_notes && (
                      <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs text-blue-800">
                        <span className="font-semibold">Import notes:</span> {translation.import_notes}
                      </div>
                    )}

                    {/* License Note */}
                    {translation.license_note && (
                      <div className="text-xs text-gray-600 italic border-l-2 border-gray-300 pl-2">
                        {translation.license_note}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Inactive Translations */}
        {inactiveTranslations.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Coming Soon</h2>
            <div className="grid gap-4">
              {inactiveTranslations.map((translation) => (
                <Card key={translation.id} className="opacity-50">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-lg">{translation.display_name}</CardTitle>
                        <CardDescription className="mt-1">{translation.translation_code}</CardDescription>
                      </div>
                      <Badge variant="outline" className="bg-gray-100 text-gray-600">
                        Coming Soon
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* License Info Section */}
        <Card className="mt-8 bg-gray-50 border-gray-200">
          <CardHeader>
            <CardTitle className="text-base">License Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-700">
            <div>
              <span className="font-semibold">Public Domain:</span> No restrictions, freely redistributable
            </div>
            <div>
              <span className="font-semibold">Open License:</span> Freely available, attribution may be required
            </div>
            <div>
              <span className="font-semibold">Commercial:</span> Licensed usage, terms apply
            </div>
            <p className="text-xs text-gray-600 mt-4">
              FaithLight respects all translation copyrights and license requirements. Selections here ensure compliance with each translation's terms of use.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}