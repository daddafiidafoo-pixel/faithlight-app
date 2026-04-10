import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, MapPin, Check } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧', native: 'English' },
  { code: 'es', name: 'Español', flag: '🇪🇸', native: 'Español' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', native: 'Français' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', native: 'Deutsch' },
  { code: 'pt', name: 'Português', flag: '🇧🇷', native: 'Português' },
  { code: 'om', name: 'Afaan Oromo', flag: '🇪🇹', native: 'Afaan Oromo' },
  { code: 'am', name: 'አማርኛ', flag: '🇪🇹', native: 'አማርኛ' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', native: 'العربية' },
  { code: 'zh', name: '中文', flag: '🇨🇳', native: '中文' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺', native: 'Русский' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳', native: 'हिन्दी' },
  { code: 'sw', name: 'Swahili', flag: '🇰🇪', native: 'Swahili' },
];

const COUNTRIES = [
  { code: 'US', name: 'United States', flag: '🇺🇸', region: 'north-america' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', region: 'north-america' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', region: 'europe' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', region: 'oceania' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', region: 'oceania' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', region: 'europe' },
  { code: 'FR', name: 'France', flag: '🇫🇷', region: 'europe' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', region: 'europe' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', region: 'europe' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', region: 'asia' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷', region: 'asia' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', region: 'asia' },
  { code: 'IN', name: 'India', flag: '🇮🇳', region: 'asia' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', region: 'south-america' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', region: 'north-america' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', region: 'africa' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', region: 'africa' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', region: 'africa' },
  { code: 'ET', name: 'Ethiopia', flag: '🇪🇹', region: 'africa' },
];

export default function LanguageCountryOnboarding({ onComplete }) {
  const [step, setStep] = useState(1); // 1: language, 2: country
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLanguageSelect = (code) => {
    setSelectedLanguage(code);
  };

  const handleCountrySelect = (code) => {
    setSelectedCountry(code);
  };

  const handleNext = async () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (!selectedCountry) {
        alert('Please select your country');
        return;
      }
      
      setIsSubmitting(true);
      try {
        const country = COUNTRIES.find(c => c.code === selectedCountry);
        await base44.auth.updateMe({
          preferred_language_code: selectedLanguage,
          country: selectedCountry,
          pricing_region: country.region,
        });
        onComplete();
      } catch (error) {
        console.error('Error saving preferences:', error);
        alert('Failed to save preferences');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const currentLang = LANGUAGES.find(l => l.code === selectedLanguage);
  const currentCountry = COUNTRIES.find(c => c.code === selectedCountry);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-xl">
          <CardTitle className="flex items-center gap-2">
            {step === 1 ? (
              <>
                <Globe className="w-6 h-6" />
                Choose Your Language
              </>
            ) : (
              <>
                <MapPin className="w-6 h-6" />
                Where are you located?
              </>
            )}
          </CardTitle>
          <p className="text-indigo-100 mt-2">
            {step === 1
              ? 'Select your preferred language for the app'
              : 'Select your country for accurate subscription pricing'
            }
          </p>
        </CardHeader>

        <CardContent className="pt-8">
          {step === 1 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageSelect(lang.code)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedLanguage === lang.code
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">{lang.flag}</div>
                    <div className="font-semibold text-sm text-gray-900">{lang.name}</div>
                    <div className="text-xs text-gray-600">{lang.native}</div>
                    {selectedLanguage === lang.code && (
                      <div className="flex justify-center mt-2">
                        <Check className="w-4 h-4 text-indigo-600" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {COUNTRIES.map(country => (
                  <button
                    key={country.code}
                    onClick={() => handleCountrySelect(country.code)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedCountry === country.code
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">{country.flag}</div>
                    <div className="font-semibold text-sm text-gray-900">{country.name}</div>
                    {selectedCountry === country.code && (
                      <div className="flex justify-center mt-2">
                        <Check className="w-4 h-4 text-indigo-600" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {selectedCountry && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Pricing Region:</strong> {currentCountry?.region.replace('-', ' ')}
                  </p>
                  <p className="text-xs text-gray-600 mt-2">
                    Your subscription will be priced according to your country's app store rates.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 mt-8 pt-6 border-t">
            {step === 2 && (
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={isSubmitting || (step === 2 && !selectedCountry)}
              className={`flex-1 ${step === 1 ? '' : ''} bg-indigo-600 hover:bg-indigo-700`}
            >
              {step === 1 ? 'Next' : isSubmitting ? 'Saving...' : 'Complete Setup'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}