import React, { useState, useMemo, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useLanguageStore } from '@/stores/languageStore';
import { normalizeSermonLanguage } from '@/lib/sermonLanguageNormalizer';
import { Sparkles, Loader2, Copy, Check, Download, Share2, RotateCcw, Heart, Database, FileText, MessageCircle, AlertCircle } from 'lucide-react';
import TextToSpeechButton from '@/components/audio/TextToSpeechButton';
import SermonLanguageSelector from '@/components/sermon/SermonLanguageSelector';
import SermonAudioPlayer from '@/components/sermon/SermonAudioPlayer';
import SermonImageGenerator from '@/components/sermon/SermonImageGenerator';
import SmartSermonFeatures from '@/components/sermon/SmartSermonFeatures';
import SermonSharer from '@/components/sermon/SermonSharer';
import SermonAISuggestions from '@/components/sermon/SermonAISuggestions';
import OfflineSermonManager from '@/components/sermon/OfflineSermonManager';
import { SERMON_TYPES, AUDIENCE_TYPES, SERMON_TONES, SERMON_FORMATS, SERMON_LANGUAGES, PREACHING_STYLES, DENOMINATION_STYLES, AUDIENCE_TYPES_OM, AUDIENCE_TYPES_AM, SERMON_FORMATS_OM, SERMON_FORMATS_AM } from '@/lib/sermonLanguageConfig';
import { sermonOfflineDB } from '@/lib/sermonOfflineDB';
import { jsPDF } from 'jspdf';
import { sermonGeneratorOromo } from '@/components/i18n/locales/sermon-generator-oromo';
import { sermonGeneratorAmharic } from '@/components/i18n/locales/sermon-generator-amharic';

// Translation helper - fallback to sermonGeneratorOromo/Amharic, then English
const getTranslations = (uiLanguage) => {
  // Amharic translations
  if (uiLanguage === 'am') return sermonGeneratorAmharic;
  
  // Oromo translations
  if (uiLanguage === 'om') return sermonGeneratorOromo;
  
  // Default English translations
  const english = {
    header: { 
      title: 'AI Sermon Generator', 
      subtitle: 'Generate sermons directly in your chosen language with full native support' 
    },
    form: { 
      language: 'Sermon Output Language',
      theme: 'Sermon Theme',
      passage: 'Bible Passage',
      themePlaceholder: 'e.g., Faith in trials, Love and grace',
      passagePlaceholder: 'e.g., Romans 8:28, James 1:2-4',
      sermonType: 'Sermon Type',
      audience: 'Audience',
      preachingStyle: 'Preaching Style',
      denomination: 'Denomination / Tradition',
      denominationHint: 'This helps tailor theology and emphasis appropriately',
      length: 'Estimated Length',
      lengthMinutes: 'minutes',
      format: 'Format',
      generate: 'Generate Sermon', 
      generating: 'Generating sermon...' 
    },
    results: { 
      title: 'Generated Sermon',
      copy: 'Copy',
      copied: 'Copied',
      download: 'Download',
      save: 'Save',
      saved: 'Saved',
      share: 'Share',
      whatsapp: 'WhatsApp',
      regenerate: 'Regenerate',
      regenerateOther: 'Regenerate in another language?'
    },
    errors: { 
      fillRequired: 'Please fill in all required fields',
      generationFailed: 'Failed to generate sermon. Please try again.',
      languageRequired: 'Please select a sermon output language',
      themeRequired: 'Please enter a theme or topic',
      passageRequired: 'Please enter a Bible passage'
    }
  };
  return english;
};

export default function SermonPreparation() {
  const uiLanguage = useLanguageStore((s) => s.uiLanguage);
  const t = useMemo(() => getTranslations(uiLanguage), [uiLanguage]);

  // Form state — default sermon output language to current app language
  const defaultOutputLanguage = normalizeSermonLanguage(uiLanguage);
  const [outputLanguage, setOutputLanguage] = useState(defaultOutputLanguage);

  // Auto-sync output language when app language changes
  useEffect(() => {
    const normalized = normalizeSermonLanguage(uiLanguage);
    setOutputLanguage(normalized);
  }, [uiLanguage]);
  const [sermonType, setSermonType] = useState('sunday');
  const [audience, setAudience] = useState('general');
  const [theme, setTheme] = useState('');
  const [passage, setPassage] = useState('');
  const [tone, setTone] = useState('pastoral');
  const [preachingStyle, setPreachingStyle] = useState('pastoral');
  const [denomination, setDenomination] = useState('general');
  const [length, setLength] = useState(30);
  const [format, setFormat] = useState('full');

  // Generation state
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const validateForm = () => {
    if (!outputLanguage) return t.errors.languageRequired || 'Please select a sermon output language';
    if (!sermonType) return 'Please select a sermon type';
    if (!theme.trim()) return t.errors.themeRequired || 'Please enter a theme or topic';
    if (!passage.trim()) return t.errors.passageRequired || 'Please enter a Bible passage';
    if (!audience) return 'Please select an audience';
    if (!tone) return 'Please select a tone';
    if (!format) return 'Please select an output format';
    return null;
  };

  const handleGenerate = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Build language instruction based on target language
      const languageInstructions = {
        en: 'Respond ONLY in English.',
        om: 'Respond ONLY in Afaan Oromoo. Use natural, pastoral tone.',
        am: 'Respond ONLY in Amharic (አማርኛ). Use natural, pastoral tone.',
        ar: 'Respond ONLY in Arabic. Use natural, pastoral tone.',
        sw: 'Respond ONLY in Kiswahili. Use natural, pastoral tone.',
        fr: 'Respond ONLY in French. Use natural, pastoral tone.',
      };

      const langInstruction = languageInstructions[outputLanguage] || languageInstructions.en;

      // Build structured sermon prompt using proven template
      const prompt = `${langInstruction}

You are a Spirit-led Christian pastor and Bible teacher.

Generate a ${SERMON_TYPES[sermonType].label} sermon in ${outputLanguage === 'en' ? 'English' : outputLanguage === 'om' ? 'Afaan Oromoo' : outputLanguage === 'am' ? 'Amharic' : outputLanguage}.

Requirements:
- Use natural, fluent ${outputLanguage === 'en' ? 'English' : outputLanguage === 'om' ? 'Afaan Oromoo' : outputLanguage === 'am' ? 'Amharic' : outputLanguage} (not translated tone)
- Be spiritually sound, biblically accurate, and encouraging
- Match this preaching style: ${PREACHING_STYLES[preachingStyle]?.label || 'pastoral'}
- Audience: ${AUDIENCE_TYPES[audience]}
- Theological tradition: ${DENOMINATION_STYLES[denomination]?.label || 'general Christian'}

Structure:
1. Title (compelling, clear)
2. Introduction (engaging, relatable opening)
3. Main Theme (1-2 sentences setting up the sermon)
4. ${format === 'outline' ? '3-4 Main Points (each with verse reference)' : '3-5 Main Points:'}
${format === 'full' ? `   - Each point must include:
     * Clear explanation
     * Supporting Bible verse(s)
     * Real-life application` : ''}
5. Practical Application (how believers apply this daily)
6. Conclusion (strong, memorable closing)
7. Closing Prayer (heartfelt, relevant to theme)

Bible Passage(s):
${passage}

Theme:
${theme}

Estimated Length: ${length} minutes

Critical Rules:
- Do NOT mix languages
- Do NOT output English if the language is not English
- Avoid robotic or literal translation tone
- Keep a pastoral, human, warm voice
- Make it suitable for ${AUDIENCE_TYPES[audience]}
- Ensure theological accuracy for ${DENOMINATION_STYLES[denomination]?.label || 'general Christian'} tradition`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        model: 'gpt_5', // Use higher quality model for sermon content
      });

      if (!response || typeof response !== 'string') {
        throw new Error('No sermon generated');
      }

      setResult({
        sermon: response,
        metadata: {
          language: outputLanguage,
          type: sermonType,
          theme,
          passage,
          audience,
          tone,
          length,
          format,
          generatedAt: new Date().toISOString(),
        },
      });
    } catch (err) {
       console.error('[SermonPreparation] Error:', err);
       setError(t.errors.generationFailed);
     } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result.sermon);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = `SERMON PREPARATION
Generated: ${new Date().toLocaleString()}
Language: ${outputLanguage}
Type: ${SERMON_TYPES[sermonType].label}
Theme: ${result.metadata.theme}
Passage: ${result.metadata.passage}

${'='.repeat(50)}

${result.sermon}`;

    const a = document.createElement('a');
    a.href = 'data:text/plain,' + encodeURIComponent(text);
    a.download = `sermon-${result.metadata.theme.replace(/\s+/g, '-')}-${Date.now()}.txt`;
    a.click();
  };

  const handleSaveOffline = async () => {
    if (!result) return;
    try {
      await sermonOfflineDB.saveSermon({
        ...result,
        metadata: {
          ...result.metadata,
          preachingStyle,
          denomination,
        },
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to save sermon:', err);
    }
  };

  const handleExportPDF = async () => {
    if (!result) return;
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const maxWidth = pageWidth - 2 * margin;
      let yPosition = margin;

      // Title
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      const titleSplit = doc.splitTextToSize(result.metadata.theme, maxWidth);
      titleSplit.forEach((line) => {
        if (yPosition > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(line, margin, yPosition);
        yPosition += 8;
      });

      yPosition += 5;

      // Metadata
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      const metadata = [
        `Language: ${result.metadata.language.toUpperCase()}`,
        `Passage: ${result.metadata.passage}`,
        `Type: ${SERMON_TYPES[result.metadata.type].label}`,
        `Audience: ${AUDIENCE_TYPES[result.metadata.audience]}`,
        `Style: ${PREACHING_STYLES[result.metadata.preachingStyle]?.label || 'N/A'}`,
        `Generated: ${new Date(result.metadata.generatedAt).toLocaleString()}`,
      ];

      metadata.forEach((line) => {
        if (yPosition > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(line, margin, yPosition);
        yPosition += 6;
      });

      yPosition += 5;
      doc.setDrawColor(200);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 10;

      // Sermon content
      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');
      const contentSplit = doc.splitTextToSize(result.sermon, maxWidth);
      contentSplit.forEach((line) => {
        if (yPosition > pageHeight - margin - 10) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(line, margin, yPosition);
        yPosition += 6;
      });

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text('Generated by FaithLight', margin, pageHeight - 10);

      const filename = `sermon-${result.metadata.theme.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
      doc.save(filename);
    } catch (err) {
      console.error('Failed to export PDF:', err);
    }
  };

  const handleShare = async () => {
    if (!result) return;
    const text = `Sermon: ${result.metadata.theme}\nPassage: ${result.metadata.passage}\n\n${result.sermon}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Sermon', text });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      handleCopy(); // Fallback to copy
    }
  };

  const handleShareWhatsApp = () => {
    if (!result) return;
    const text = encodeURIComponent(
      `📖 Sermon: ${result.metadata.theme}\n\n✝️ Passage: ${result.metadata.passage}\n\n${result.sermon.substring(0, 500)}...\n\nGenerated by FaithLight 🙏`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleShareFacebook = () => {
    if (!result) return;
    const url = encodeURIComponent(window.location.href);
    const quote = encodeURIComponent(`Check out this sermon: "${result.metadata.theme}" - ${result.metadata.passage}`);
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${quote}`,
      'facebook-share-dialog',
      'width=626,height=436'
    );
  };

  const handleRegenerate = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pb-24" dir={uiLanguage === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-5 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={20} className="text-indigo-600" />
            <h1 className="text-xl font-bold text-gray-900">{t.header.title}</h1>
          </div>
          <p className="text-xs text-gray-500">
            {t.header.subtitle}
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Form */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
          {/* 1. Language Selection (Required) */}
          <SermonLanguageSelector value={outputLanguage} onChange={setOutputLanguage} appLanguage={uiLanguage} />

          {/* 2. Sermon Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              {t.form.sermonType}<span className="text-red-600">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.values(SERMON_TYPES).map((type) => {
                const typeLabel = uiLanguage === 'om' ? type.labelOm : uiLanguage === 'am' ? type.labelAm : type.label;
                const typeDesc = uiLanguage === 'om' ? type.descriptionOm : uiLanguage === 'am' ? type.descriptionAm : type.description;
                return (
                <button
                  key={type.id}
                  onClick={() => setSermonType(type.id)}
                  aria-label={`${typeLabel}: ${typeDesc}`}
                  className={`p-4 rounded-lg border-2 text-left transition-all min-h-[100px] ${
                    sermonType === type.id
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 bg-white hover:border-indigo-300'
                  }`}
                >
                  <div className="font-semibold text-gray-900">{typeLabel}</div>
                  <div className="text-xs text-gray-500 mt-1">{typeDesc}</div>
                </button>
              );
              })}
            </div>
          </div>

          {/* 3. Theme and Passage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                {t.form.topic || t.form.theme || 'Theme'}<span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder={t.form.themePlaceholder || 'e.g., Faith in trials, Love and grace'}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              </div>
              <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                {t.form.scripture || t.form.passage || 'Bible Passage'}<span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={passage}
                onChange={(e) => setPassage(e.target.value)}
                placeholder={t.form.passagePlaceholder || 'e.g., Romans 8:28, James 1:2-4'}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* 4. Audience and Tone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">{t.form.audience || 'Audience'}</label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
              >
                {Object.entries(AUDIENCE_TYPES).map(([key, val]) => {
                  const auditiveLabel = uiLanguage === 'om' ? (AUDIENCE_TYPES_OM[key] || val) : 
                                        uiLanguage === 'am' ? (AUDIENCE_TYPES_AM[key] || val) : val;
                  return (
                  <option key={key} value={key}>
                    {auditiveLabel}
                  </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">{t.form.preachingStyle || 'Preaching Style'}</label>
              <select
                value={preachingStyle}
                onChange={(e) => setPreachingStyle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
              >
                {Object.values(PREACHING_STYLES).map((style) => {
                  const styleLabel = uiLanguage === 'om' ? style.labelOm : uiLanguage === 'am' ? style.labelAm : style.label;
                  const styleDesc = uiLanguage === 'om' ? style.descriptionOm : uiLanguage === 'am' ? style.descriptionAm : style.description;
                  return (
                  <option key={style.id} value={style.id}>
                    {styleLabel} — {styleDesc}
                  </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* 4b. Denomination */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">{t.form.doctrine || t.form.denomination || 'Denomination / Tradition'}</label>
            <select
              value={denomination}
              onChange={(e) => setDenomination(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
            >
              {Object.values(DENOMINATION_STYLES).map((denom) => {
                const denomLabel = uiLanguage === 'om' ? denom.labelOm : uiLanguage === 'am' ? denom.labelAm : denom.label;
                const denomDesc = uiLanguage === 'om' ? denom.descriptionOm : uiLanguage === 'am' ? denom.descriptionAm : denom.description;
                return (
                <option key={denom.id} value={denom.id}>
                  {denomLabel} — {denomDesc}
                </option>
                );
              })}
            </select>
            <p className="text-xs text-gray-500 mt-1">{t.form.denominationHint || 'This helps tailor theology and emphasis appropriately'}</p>
          </div>

          {/* 5. Length and Format */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                {t.form.duration || t.form.length || 'Estimated Length'}: {length} {t.form.minutes || 'minutes'}
              </label>
              <input
                type="range"
                min="10"
                max="60"
                step="5"
                value={length}
                onChange={(e) => setLength(parseInt(e.target.value))}
                className="w-full"
                aria-label="Set sermon length in minutes"
              />
              <div className="text-xs text-gray-500 mt-1">10 - 60 minutes</div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">{t.form.outputType || t.form.format || 'Format'}</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
              >
                {Object.entries(SERMON_FORMATS).map(([key, val]) => {
                  const formatLabel = uiLanguage === 'om' ? (SERMON_FORMATS_OM[key] || val) :
                                      uiLanguage === 'am' ? (SERMON_FORMATS_AM[key] || val) : val;
                  return (
                  <option key={key} value={key}>
                    {formatLabel}
                  </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Error message */}
           {error && (
             <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg flex items-start gap-3">
               <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
               <div>{error}</div>
             </div>
           )}

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            aria-label={t.form.generate}
            className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 min-h-[44px]"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {t.form.generating || 'Generating sermon...'}
              </>
            ) : (
              <>
                <Sparkles size={16} />
                {t.form.generate}
              </>
              )}
              </button>
        </div>

        {/* Results */}
         {result && (
           <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
             <div className="flex items-center justify-between mb-4">
               <div>
                   <h2 className="text-lg font-bold text-gray-900">{t.results?.title || 'Generated Sermon'}</h2>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {result.metadata.language.toUpperCase()}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {PREACHING_STYLES[result.metadata.preachingStyle].label}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    {DENOMINATION_STYLES[result.metadata.denomination].label}
                  </span>
                </div>
              </div>
              <button
                onClick={handleRegenerate}
                aria-label={t.results?.regenerate || 'Generate another sermon'}
                className="flex items-center justify-center px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-medium transition-colors min-h-[44px] min-w-[44px]"
                title={t.results?.regenerate || 'Generate another sermon'}
              >
                <RotateCcw size={14} />
              </button>
            </div>

            {/* Text-to-Speech */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">🎙 Listen to Sermon</span>
              <TextToSpeechButton
                text={result.sermon}
                reference={result.metadata.theme}
                language={result.metadata.language}
                showLabel={true}
              />
            </div>
            {/* Audio Player */}
            <SermonAudioPlayer text={result.sermon} language={result.metadata.language} title={result.metadata.theme} />

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleCopy}
                aria-label={copied ? 'Copied to clipboard' : 'Copy sermon to clipboard'}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors min-h-[44px]"
              >
                {copied ? (
                  <>
                    <Check size={16} className="text-green-600" />
                    {t.results?.copied || 'Copied'}
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    {t.results?.copy || 'Copy'}
                  </>
                )}
              </button>
              <button
                onClick={handleDownload}
                aria-label="Download sermon as text file"
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors min-h-[44px]"
              >
                <Download size={16} />
                {t.results?.download || 'Download'}
              </button>
              <button
                onClick={handleExportPDF}
                aria-label="Export sermon as PDF"
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors min-h-[44px]"
              >
                <FileText size={16} />
                PDF
              </button>
              <button
                onClick={handleShare}
                aria-label="Share sermon"
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors min-h-[44px]"
              >
                <Share2 size={16} />
                {t.results?.share || 'Share'}
              </button>
              <button
                onClick={handleShareWhatsApp}
                aria-label="Share via WhatsApp"
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors min-h-[44px]"
                title="Share to WhatsApp"
              >
                <MessageCircle size={16} />
                {t.results?.whatsapp || 'WhatsApp'}
              </button>
              <button
                onClick={handleSaveOffline}
                aria-label={saveSuccess ? 'Sermon saved' : 'Save sermon offline'}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors min-h-[44px]"
              >
                {saveSuccess ? (
                  <>
                    <Check size={16} className="text-green-600" />
                    {t.results?.saved || 'Saved'}
                  </>
                ) : (
                  <>
                    <Database size={16} />
                    {t.results?.save || 'Save'}
                  </>
                )}
              </button>
            </div>

            {/* Sermon content */}
            <div className="bg-gray-50 rounded-lg p-6 whitespace-pre-wrap text-sm text-gray-700 leading-relaxed max-h-[600px] overflow-y-auto font-serif">
              {result.sermon}
            </div>

            {/* Share Image Generator */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 border border-indigo-100">
              <h3 className="font-semibold text-gray-900 mb-4">Share as Image</h3>
              <SermonImageGenerator 
                sermon={{
                  title: result.metadata.theme,
                  keyVerse: result.metadata.passage,
                  shortMessage: `${SERMON_TYPES[result.metadata.type].label} • ${result.metadata.language.toUpperCase()}`
                }}
              />
            </div>

            {/* Smart Features */}
            <SmartSermonFeatures sermon={result.sermon} language={result.metadata.language} />

            {/* Metadata */}
            <div className="pt-4 border-t border-gray-200 text-xs text-gray-500 space-y-1">
              <p>
                <span className="font-semibold">Type:</span> {SERMON_TYPES[result.metadata.type].label} | 
                <span className="font-semibold ml-2">Length:</span> {result.metadata.length} min
              </p>
              <p>
                <span className="font-semibold">Theme:</span> {result.metadata.theme} | 
                <span className="font-semibold ml-2">Passage:</span> {result.metadata.passage}
              </p>
              <p>
                <span className="font-semibold">Generated:</span> {new Date(result.metadata.generatedAt).toLocaleString()}
              </p>
            </div>

            {/* Sharing Options */}
              <SermonSharer sermon={result.sermon} title={result.metadata.theme} isDarkMode={false} />

              {/* Offline Manager */}
              <OfflineSermonManager sermon={result.sermon} title={result.metadata.theme} isDarkMode={false} />

              {/* Regenerate in another language option */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-600 mb-3">{t.results?.regenerateOther || 'Want to regenerate in another language?'}</p>
                <div className="flex gap-2 flex-wrap">
                  {Object.values(SERMON_LANGUAGES)
                    .filter((l) => l.code !== result.metadata.language)
                    .map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setOutputLanguage(lang.code);
                          setResult(null);
                        }}
                        aria-label={`Regenerate sermon in ${lang.nativeName}`}
                        className="px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-medium transition-colors"
                      >
                        {lang.nativeName}
                      </button>
                    ))}
                </div>
              </div>
            </div>
            )}

            {/* AI Suggestions Section - appears before form */}
            {!result && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <SermonAISuggestions theme={theme} isDarkMode={false} />
            </div>
            )}
            </div>
            </div>
            );
            }