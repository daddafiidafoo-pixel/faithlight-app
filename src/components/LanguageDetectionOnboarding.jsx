import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  detectDeviceLanguage,
  getSuggestedLanguagesForCountry,
  COUNTRY_LANGUAGE_MAP,
} from '@/lib/translations';

export default function LanguageDetectionOnboarding({ userId, onComplete }) {
  const [detectedLanguage, setDetectedLanguage] = useState('en');
  const [suggestedLanguages, setSuggestedLanguages] = useState(['en']);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [userCountry, setUserCountry] = useState('');
  const [step, setStep] = useState('detect'); // detect → select → save

  // Fetch available languages
  const { data: languages = [] } = useQuery({
    queryKey: ['languages'],
    queryFn: async () => {
      return await base44.entities.Language.filter({ is_active: true }, 'priority');
    },
  });

  // Save language preference
  const saveLanguageMutation = useMutation({
    mutationFn: async () => {
      const user = await base44.auth.me();
      await base44.auth.updateMe({
        preferred_language_code: selectedLanguage,
        country: userCountry,
        language_auto_detected: step === 'detect',
      });
      return true;
    },
  });

  // Auto-detect language on mount
  useEffect(() => {
    const detected = detectDeviceLanguage();
    setDetectedLanguage(detected);
    setSelectedLanguage(detected);
  }, []);

  // Update suggestions when country changes
  useEffect(() => {
    if (userCountry) {
      const suggested = getSuggestedLanguagesForCountry(userCountry);
      setSuggestedLanguages(suggested);
      if (suggested.length > 0 && !suggested.includes(detectedLanguage)) {
        setSelectedLanguage(suggested[0]);
      }
    }
  }, [userCountry, detectedLanguage]);

  const handleContinue = async () => {
    if (step === 'detect') {
      // Go to language selection
      setStep('select');
    } else if (step === 'select') {
      // Save and complete
      await saveLanguageMutation.mutateAsync();
      if (onComplete) {
        onComplete(selectedLanguage);
      }
    }
  };

  const languageName = languages.find(l => l.code === selectedLanguage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Choose Your Language
          </CardTitle>
          <p className="text-sm text-indigo-100 mt-2">
            You can change this anytime in Settings
          </p>
        </CardHeader>

        <CardContent className="pt-8">
          {/* Step 1: Language Detection */}
          {step === 'detect' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900">We detected your language</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Based on your device settings, we suggest:{' '}
                      <span className="font-semibold">
                        {languageName?.native_name || detectedLanguage}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-900 block mb-3">
                  Your Country
                </label>
                <Select value={userCountry} onValueChange={setUserCountry}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your country (optional)" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {Object.entries(COUNTRY_LANGUAGE_MAP).map(([code, data]) => (
                      <SelectItem key={code} value={code}>
                        {data.country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleContinue}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                Proceed to Language Selection
              </Button>
            </div>
          )}

          {/* Step 2: Language Selection */}
          {step === 'select' && (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-semibold text-gray-900 block mb-4">
                  Select Your Language
                </label>

                <div className="space-y-2">
                  {languages.map(lang => {
                    const isRecommended = suggestedLanguages.includes(lang.code);

                    return (
                      <label
                        key={lang.code}
                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedLanguage === lang.code
                            ? 'border-indigo-600 bg-indigo-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="language"
                          value={lang.code}
                          checked={selectedLanguage === lang.code}
                          onChange={(e) => setSelectedLanguage(e.target.value)}
                          className="w-4 h-4"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {lang.flag} {lang.native_name}
                          </div>
                          <div className="text-xs text-gray-600">{lang.english_name}</div>
                        </div>
                        {isRecommended && (
                          <Badge className="bg-green-600 text-xs">Recommended</Badge>
                        )}
                        {lang.completion_percent < 100 && (
                          <Badge variant="outline" className="text-xs">
                            {lang.completion_percent}%
                          </Badge>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>

              {languages.find(l => l.code === selectedLanguage)?.completion_percent < 100 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800">
                    This language is still being translated. You'll see English for some parts.
                  </p>
                </div>
              )}

              <Button
                onClick={handleContinue}
                disabled={saveLanguageMutation.isPending}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                {saveLanguageMutation.isPending ? 'Saving...' : 'Start Using FaithLight'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}