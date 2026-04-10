import React, { useState, useEffect } from 'react';
import { useLanguageStore } from '@/stores/languageStore';
import { bibleStructureTranslations as translations, bibleStructureLanguages as supportedLanguages } from '@/i18n/bibleStructureTranslations';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';









// Simple section card renderer from translations
function SectionCard({ section }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 border border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xl font-bold text-slate-900">{section.title}</h3>
        <Badge className="bg-indigo-100 text-indigo-800">{section.countLabel}</Badge>
      </div>
      <p className="text-sm text-slate-700 mb-2">{section.description}</p>
      <p className="text-xs text-slate-500 mb-3">{section.range}</p>
      <p className="text-xs italic text-slate-600">{section.books.join(", ")}</p>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function BibleStructureOverview() {
  const uiLanguage = useLanguageStore(s => s.uiLanguage);
  const [selectedLanguage, setSelectedLanguage] = useState(uiLanguage);

  const page = translations[selectedLanguage]?.bibleStructure || translations.en.bibleStructure;
  const isRTL = selectedLanguage === "ar";

  useEffect(() => {
    document.title = translations[selectedLanguage]?.pages?.bibleStructureOverview || "Bible Structure Overview";
  }, [selectedLanguage]);

  return (
    <div className="min-h-screen bg-slate-50 p-6" dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className={`flex items-center justify-between gap-4 mb-6 ${isRTL ? "flex-row-reverse" : ""}`}>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">{page.pageTitle}</h1>
              <p className={`text-slate-600 mt-2 ${isRTL ? "text-right" : "text-left"}`}>{page.intro}</p>
            </div>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {supportedLanguages.map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>{lang.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bible Sections Grid */}
        <div className="space-y-4">
          {page.sections.map(section => (
            <SectionCard key={section.key} section={section} />
          ))}
        </div>
      </div>
    </div>
  );
}