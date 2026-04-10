import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/components/I18nProvider';
import { aiSermonBuilderTranslations } from '@/data/aiSermonBuilderTranslations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sparkles, BookOpen, Save, Share2, WifiOff, Plus, X, Loader2,
  ChevronRight, Clock, Users, Mic, Layout, RefreshCw, Trash2, Eye, UserPlus
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import SermonOutlineViewer from '../components/sermon/SermonOutlineViewer';
import SermonOfflineDownload from '../components/sermon/SermonOfflineDownload';
import SermonShareModal from '../components/sermon/SermonShareModal';
import { getAllOfflineSermons } from '../components/sermon/SermonOfflineDownload';
import SermonVoiceNotes from '../components/sermon/SermonVoiceNotes';
import SermonSlidePreview from '../components/sermon/SermonSlidePreview';
import SermonStudyGuide from '../components/sermon/SermonStudyGuide';
import SermonEditorDragDrop from '../components/sermon/SermonEditorDragDrop';
import SermonTextToSpeech from '../components/sermon/SermonTextToSpeech';
import SermonExportFormats from '../components/sermon/SermonExportFormats';
import SermonCollabInviteModal from '../components/sermon/SermonCollabInviteModal';
import SermonCommentPanel from '../components/sermon/SermonCommentPanel';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { sermonBuilderEn } from '@/components/i18n/locales/sermon-builder-en';
import { sermonBuilderOm } from '@/components/i18n/locales/sermon-builder-om';
import { sermonBuilderAm } from '@/components/i18n/locales/sermon-builder-am';
import { sermonBuilderSw } from '@/components/i18n/locales/sermon-builder-sw';
import { sermonBuilderAr } from '@/components/i18n/locales/sermon-builder-ar';

const AUDIENCE_KEYS = ['general', 'youth', 'leaders', 'beginners', 'mature'];
const AUDIENCE_ICONS = { general: '👥', youth: '🌱', leaders: '🏛️', beginners: '✨', mature: '📖' };

const LENGTH_KEYS = ['short', 'medium', 'long'];
const LENGTH_VALUES = { short: 10, medium: 20, long: 35 };

const TONE_KEYS = ['teaching', 'evangelistic', 'devotional', 'prophetic'];
const TONE_ICONS = { teaching: '🎓', evangelistic: '✝️', devotional: '🕊️', prophetic: '🔥' };

const STYLE_KEYS = ['expository', 'topical', 'narrative', 'apologetics', 'threePoint'];
const STYLE_ICONS = { expository: '📖', topical: '🎯', narrative: '📜', apologetics: '🛡️', threePoint: '📋' };

const THEME_KEYS = ['grace', 'faith', 'repentance', 'forgiveness', 'prayer', 'hope', 'love', 'redemption', 'holiness', 'kingdomOfGod', 'salvation', 'evangelism'];

// Translation helper function
const getSermonTranslations = (lang) => {
  const translations = {
    'en': sermonBuilderEn,
    'om': sermonBuilderOm,
    'am': sermonBuilderAm,
    'sw': sermonBuilderSw,
    'ar': sermonBuilderAr,
  };
  return translations[lang] || sermonBuilderEn;
};

function OptionButton({ value, selected, onClick, label, icon }) {
  return (
    <button
      onClick={() => onClick(value)}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
        selected
          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
          : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
      }`}
    >
      {icon && <span>{icon}</span>}
      {label}
    </button>
  );
}

function LengthButton({ value, selected, onClick, t }) {
  return (
    <button
      onClick={() => onClick(value)}
      className={`flex flex-col items-center px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
        selected ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300'
      }`}
    >
      <span className="font-bold">{t(`form.length.${value}`)}</span>
      <span className={`text-xs ${selected ? 'text-indigo-200' : 'text-gray-400'}`}>{t(`form.length.${value}Sub`)}</span>
    </button>
  );
}

export default function AISermonBuilder() {
   const { lang } = useI18n();
   const sermonT = getSermonTranslations(lang);
   const TT = (path, fallback = "") => {
     const keys = path.split('.');
     let value = sermonT;
     for (const key of keys) {
       value = value?.[key];
     }
     return value ?? fallback;
   };
   // Page-level translations (UI labels, placeholders, buttons)
   const pt = useMemo(() => aiSermonBuilderTranslations[lang] || aiSermonBuilderTranslations.en, [lang]);
   // Sermon output language (defaults to current app language, user can override)
   const [sermonLanguage, setSermonLanguage] = useState(lang);
   // Sync sermonLanguage when app language changes (if user hasn't manually changed it)
   useEffect(() => { setSermonLanguage(lang); }, [lang]);
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('build');

  // Form state
  const [theme, setTheme] = useState('');
  const [passages, setPassages] = useState([]);
  const [passageText, setPassageText] = useState('');
  const [passageInput, setPassageInput] = useState('');
  const [audience, setAudience] = useState('general');
  const [duration, setDuration] = useState(20);
  const [tone, setTone] = useState('teaching');
  const [style, setStyle] = useState('expository');
  const [selectedThemes, setSelectedThemes] = useState([]);

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [currentOutline, setCurrentOutline] = useState(null);
  const [savedSermon, setSavedSermon] = useState(null);
  const [saving, setSaving] = useState(false);

  // Voice notes
  const [voiceNotes, setVoiceNotes] = useState([]);
  const addVoiceNote = (note) => setVoiceNotes(prev => [...prev, note]);
  const removeVoiceNote = (note) => setVoiceNotes(prev => prev.filter(n => n !== note));

  // Multimedia tab state
  const [multimediaTab, setMultimediaTab] = useState('slides'); // slides | guide

  // Share modal
  const [shareOpen, setShareOpen] = useState(false);

  // Collab invite modal
  const [collabOpen, setCollabOpen] = useState(false);

  // Saved sermons list
  const [savedSermons, setSavedSermons] = useState([]);
  const [offlineSermons, setOfflineSermons] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  useEffect(() => {
    const init = async () => {
      const isAuth = await base44.auth.isAuthenticated().catch(() => false);
      if (isAuth) {
        const u = await base44.auth.me().catch(() => null);
        setUser(u);
      }
    };
    init();
  }, []);

  // Load saved sermons when tab changes
  useEffect(() => {
    if (tab === 'saved' && user?.id) {
      loadSavedSermons();
    }
    if (tab === 'offline') {
      loadOfflineSermons();
    }
  }, [tab, user?.id]);

  const loadSavedSermons = async () => {
    setLoadingSaved(true);
    try {
      const results = await base44.entities.SermonOutline.filter({ user_id: user.id }, '-updated_date', 20);
      setSavedSermons(results);
    } catch (e) {
      console.debug('Could not load saved sermons:', e.message);
      setSavedSermons([]);
    } finally {
      setLoadingSaved(false);
    }
  };

  const loadOfflineSermons = async () => {
    try {
      const results = await getAllOfflineSermons();
      setOfflineSermons(Array.isArray(results) ? results : []);
    } catch (e) {
      console.debug('Could not load offline sermons:', e.message);
      setOfflineSermons([]);
    }
  };

  const addPassage = () => {
    const trimmed = passageInput.trim();
    if (!trimmed || passages.includes(trimmed)) return;
    setPassages(p => [...p, trimmed]);
    setPassageInput('');
  };

  const removePassage = (p) => setPassages(ps => ps.filter(x => x !== p));

  const handleGenerate = async () => {
     if (!user) {
       toast.error(TT('messages.signInToSave'));
       return;
     }
     if (!theme.trim()) {
       toast.error(TT('errors.enterTopic'));
       return;
     }
     setGenerating(true);
     setCurrentOutline(null);
     setSavedSermon(null);
     try {
       // Map language codes to language names - CRITICAL for AI output language
       const langNames = {
         'en': 'English', 'om': 'Afaan Oromoo', 'am': 'Amharic',
         'ar': 'Arabic', 'fr': 'French', 'sw': 'Swahili', 'ti': 'Tigrinya',
       };
       const langName = langNames[sermonLanguage] || 'English';

       // Language instruction for AI - ensures output is in selected sermon language
       const languageInstructions = {
         'en': 'Respond ONLY in English. Provide a clear, pastoral sermon outline.',
         'om': 'Respond ONLY in Afaan Oromoo. Use natural pastoral tone.',
         'am': 'Respond ONLY in Amharic (አማርኛ). Use natural pastoral tone.',
         'ar': 'Respond ONLY in Arabic. Use natural pastoral tone.',
         'sw': 'Respond ONLY in Swahili. Use natural pastoral tone.',
         'fr': 'Respond ONLY in French. Use natural pastoral tone.',
         'ti': 'Respond ONLY in Tigrinya (ትግርኛ). Use natural pastoral tone.',
       };
       const langInstruction = languageInstructions[sermonLanguage] || languageInstructions['en'];

       const res = await base44.functions.invoke('generateSermonOutline', {
         passages,
         theme,
         audience,
         duration_minutes: duration,
         tone,
         style,
         themes: selectedThemes,
         passage_text: passageText.trim() || undefined,
         langCode: sermonLanguage,
         langName: langName,
         langInstruction: langInstruction,
       });
       const data = res.data;
       setCurrentOutline(data);
       toast.success(TT('saved.saveSuccess'));
     } catch (e) {
       toast.error(TT('errors.generationFailed') + (e.response?.data?.error || e.message));
     } finally {
       setGenerating(false);
     }
   };

  const handleSave = async () => {
    if (!user || !currentOutline) return;
    setSaving(true);
    try {
      const payload = {
        user_id: user.id,
        user_name: user.full_name,
        title: currentOutline.title || theme,
        big_idea: currentOutline.big_idea,
        passages,
        theme,
        audience,
        duration_minutes: duration,
        tone,
        style,
        outline_sections: currentOutline.outline_sections,
        supporting_verses: currentOutline.supporting_verses,
        application: currentOutline.application,
        closing_prayer: currentOutline.closing_prayer,
        is_shared: false,
      };

      let saved;
      if (savedSermon?.id) {
        saved = await base44.entities.SermonOutline.update(savedSermon.id, payload);
        toast.success('Sermon updated!');
      } else {
        saved = await base44.entities.SermonOutline.create(payload);
        toast.success('Sermon saved!');
      }
      setSavedSermon(saved);
    } catch (e) {
      toast.error('Save failed: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSaved = async (id) => {
    try {
      await base44.entities.SermonOutline.delete(id);
      setSavedSermons(prev => prev.filter(s => s.id !== id));
      toast.success('Deleted');
    } catch (e) {
      toast.error('Failed to delete');
    }
  };

  const handleLoadSaved = (sermon) => {
    setTheme(sermon.theme || '');
    setPassages(sermon.passages || []);
    setAudience(sermon.audience || 'general');
    setDuration(sermon.duration_minutes || 30);
    setTone(sermon.tone || 'teaching');
    setStyle(sermon.style || 'three_point');
    setCurrentOutline({
      title: sermon.title,
      big_idea: sermon.big_idea,
      outline_sections: sermon.outline_sections,
      supporting_verses: sermon.supporting_verses,
      application: sermon.application,
      closing_prayer: sermon.closing_prayer,
    });
    setSavedSermon(sermon);
    setTab('build');
    toast.success('Sermon loaded into builder');
  };

  const sermonForOffline = savedSermon
    ? { ...savedSermon, ...currentOutline }
    : currentOutline
    ? { id: `temp_${Date.now()}`, title: currentOutline.title || theme, ...currentOutline }
    : null;

  return (
    <ErrorBoundary>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{pt.title}</h1>
              <p className="text-xs text-gray-500 hidden sm:block">{pt.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {currentOutline && (
              <>
                <SermonOfflineDownload
                  sermon={sermonForOffline}
                  onStatusChange={() => {}}
                />
                <Button
                   size="sm"
                   variant="outline"
                   onClick={() => setShareOpen(true)}
                   disabled={!savedSermon}
                   className="gap-2 hidden sm:flex"
                 >
                   <Share2 className="w-4 h-4" /> {TT('buttons.share')}
                 </Button>
                 <Button
                   size="sm"
                   variant="outline"
                   onClick={() => setCollabOpen(true)}
                   disabled={!savedSermon}
                   className="gap-2 hidden sm:flex border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                 >
                   <UserPlus className="w-4 h-4" /> {pt.collaborate}
                 </Button>
                 <Button
                   size="sm"
                   onClick={handleSave}
                   disabled={saving}
                   className="gap-2 bg-indigo-600 hover:bg-indigo-700"
                 >
                   {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                   {savedSermon ? TT('buttons.update') : TT('buttons.save')}
                 </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-6">
             <TabsTrigger value="build" className="gap-2">
               <Sparkles className="w-4 h-4" /> {pt.buildTab}
             </TabsTrigger>
             <TabsTrigger value="saved" className="gap-2">
               <BookOpen className="w-4 h-4" /> {pt.savedTab}
             </TabsTrigger>
             <TabsTrigger value="offline" className="gap-2">
               <WifiOff className="w-4 h-4" /> {pt.offlineTab}
             </TabsTrigger>
           </TabsList>

          {/* BUILD TAB */}
          <TabsContent value="build">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Left: Form */}
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                     <CardTitle className="text-base">{pt.settingsTitle}</CardTitle>
                   </CardHeader>
                   <CardContent className="space-y-4">
                     {/* Theme */}
                     <div>
                       <label className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 block">
                         {pt.topicLabel}
                       </label>
                       <Input
                         placeholder={pt.topicPlaceholder}
                         value={theme}
                         onChange={e => setTheme(e.target.value)}
                         className="text-sm"
                       />
                     </div>

                     {/* Passages */}
                     <div>
                       <label className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 block">
                         {pt.passagesLabel}
                       </label>
                       <div className="flex gap-2 mb-2">
                         <Input
                           placeholder={pt.passagesPlaceholder}
                           value={passageInput}
                           onChange={e => setPassageInput(e.target.value)}
                           onKeyDown={e => e.key === 'Enter' && addPassage()}
                           className="text-sm"
                         />
                         <Button size="sm" variant="outline" onClick={addPassage} className="flex-shrink-0">
                           <Plus className="w-4 h-4" />
                         </Button>
                       </div>
                      {passages.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {passages.map(p => (
                            <span key={p} className="flex items-center gap-1 text-xs bg-indigo-100 text-indigo-700 rounded-full px-2.5 py-1 font-medium">
                              {p}
                              <button onClick={() => removePassage(p)} className="ml-0.5 hover:text-red-500">
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Passage text (optional grounding) */}
                    <div>
                      <label className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 block">
                        {pt.passageTextLabel} <span className="font-normal text-gray-400">({pt.passageTextHint})</span>
                      </label>
                      <Textarea
                        placeholder={pt.passageTextPlaceholder}
                        value={passageText}
                        onChange={e => setPassageText(e.target.value)}
                        className="text-sm h-24 resize-none"
                      />
                    </div>

                    {/* Audience */}
                    <div>
                      <label className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 block">{pt.audienceLabel}</label>
                      <div className="flex flex-wrap gap-1.5">
                        {AUDIENCE_KEYS.map(a => (
                          <OptionButton key={a} value={a} selected={audience === a} onClick={setAudience} label={TT(`form.audience.${a}`)} icon={AUDIENCE_ICONS[a]} />
                        ))}
                      </div>
                      </div>

                      {/* Length */}
                      <div>
                      <label className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 block">
                        <Clock className="w-3.5 h-3.5 inline mr-1" /> {TT('form.lengthLabel')}
                      </label>
                      <div className="flex gap-1.5">
                        {LENGTH_KEYS.map(d => (
                          <LengthButton key={d} value={d} selected={duration === LENGTH_VALUES[d]} onClick={() => setDuration(LENGTH_VALUES[d])} t={TT} />
                        ))}
                      </div>
                      </div>

                      {/* Style */}
                      <div>
                      <label className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 block">
                        <Layout className="w-3.5 h-3.5 inline mr-1" /> {TT('form.styleLabel')}
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {STYLE_KEYS.map(s => (
                          <OptionButton key={s} value={s} selected={style === s} onClick={setStyle} label={TT(`form.style.${s}`)} icon={STYLE_ICONS[s]} />
                        ))}
                      </div>
                      </div>

                      {/* Themes chips */}
                      <div>
                      <label className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 block">
                        {TT('form.themesLabel')} <span className="text-gray-400 font-normal">(optional)</span>
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {THEME_KEYS.map(th => {
                          const active = selectedThemes.includes(th);
                          return (
                            <button
                              key={th}
                              onClick={() => setSelectedThemes(prev => active ? prev.filter(x => x !== th) : [...prev, th])}
                              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                                active ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'
                              }`}
                            >
                              {TT(`form.themes.${th}`)}
                            </button>
                          );
                        })}
                      </div>
                      </div>

                      {/* Tone */}
                      <div>
                      <label className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 block">
                        <Mic className="w-3.5 h-3.5 inline mr-1" /> {TT('form.toneLabel')}
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {TONE_KEYS.map(tone_val => (
                          <OptionButton key={tone_val} value={tone_val} selected={tone === tone_val} onClick={setTone} label={TT(`form.tone.${tone_val}`)} icon={TONE_ICONS[tone_val]} />
                        ))}
                      </div>
                      </div>

                    {/* Sermon Language Selector */}
                    <div>
                      <label className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5 block">
                        {pt.languageLabel}
                      </label>
                      <select
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        value={sermonLanguage}
                        onChange={(e) => setSermonLanguage(e.target.value)}
                      >
                        <option value="en">English</option>
                        <option value="fr">Français</option>
                        <option value="ar">العربية</option>
                        <option value="sw">Kiswahili</option>
                        <option value="am">አማርኛ</option>
                        <option value="ti">ትግርኛ</option>
                        <option value="om">Afaan Oromoo</option>
                      </select>
                    </div>

                    {/* Generate Button */}
                    <Button
                      className="w-full gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-5"
                      onClick={handleGenerate}
                      disabled={generating || !theme.trim()}
                    >
                      {generating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {pt.generating}
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          {currentOutline ? pt.regenerate : pt.generate}
                        </>
                      )}
                    </Button>

                    {!user && (
                      <p className="text-xs text-center text-gray-500">
                        <button onClick={() => base44.auth.redirectToLogin()} className="text-indigo-600 underline font-medium">{pt.signIn}</button> {pt.signInToSave}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right: Output */}
              <div className="lg:col-span-3">
                {generating ? (
                  <div className="flex flex-col items-center justify-center h-80 gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
                      <Sparkles className="w-6 h-6 text-indigo-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <div className="text-center">
                       <p className="font-semibold text-gray-700">{TT('generation.generatingOutline')}</p>
                       <p className="text-sm text-gray-500 mt-1">{TT('generation.generatingText')}</p>
                     </div>
                  </div>
                ) : currentOutline ? (
                  <div>
                    {/* Title bar */}
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{currentOutline.title}</h2>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {passages.map(p => (
                            <Badge key={p} variant="outline" className="text-xs">{p}</Badge>
                          ))}
                          <Badge className="text-xs bg-indigo-100 text-indigo-700 border-0">
                            {audience}
                          </Badge>
                          <Badge className="text-xs bg-amber-100 text-amber-700 border-0">
                            {duration} min
                          </Badge>
                                             {selectedThemes.slice(0, 3).map(th => (
                                               <Badge key={th} className="text-xs bg-purple-100 text-purple-700 border-0">{th}</Badge>
                                             ))}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        {savedSermon && (
                          <Button size="sm" variant="outline" onClick={() => setShareOpen(true)} className="gap-1.5 sm:flex hidden">
                            <Share2 className="w-3.5 h-3.5" /> {TT('buttons.share')}
                          </Button>
                        )}
                      </div>
                    </div>
                    <SermonOutlineViewer outline={currentOutline} voiceNotes={voiceNotes} onAddVoiceNote={addVoiceNote} onDeleteVoiceNote={removeVoiceNote} />

                   {/* Multimedia Layer */}
                   <div className="mt-6 space-y-6">
                     <div className="flex items-center gap-2 mb-3">
                       <div className="flex bg-gray-100 rounded-xl p-1 gap-1 overflow-x-auto flex-nowrap">
                         {[['slides', '🎞️ Slides'], ['guide', '📄 Guide'], ['editor', '✏️ Edit'], ['audio', '🔊 Audio'], ['export', '⬇️ Export'], ['comments', '💬 Comments']].map(([v, l]) => (
                           <button key={v} onClick={() => setMultimediaTab(v)}
                             className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 ${multimediaTab === v ? 'bg-white shadow text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}>
                             {l}
                           </button>
                         ))}
                       </div>
                     </div>
                     {multimediaTab === 'slides' && <SermonSlidePreview outline={currentOutline} />}
                     {multimediaTab === 'guide' && <SermonStudyGuide outline={currentOutline} theme={theme} />}
                     {multimediaTab === 'editor' && <SermonEditorDragDrop outline={currentOutline} onUpdate={setCurrentOutline} />}
                     {multimediaTab === 'audio' && <SermonTextToSpeech outline={currentOutline} />}
                     {multimediaTab === 'export' && <SermonExportFormats outline={currentOutline} title={currentOutline.title} />}
                     {multimediaTab === 'comments' && savedSermon && (
                       <SermonCommentPanel
                         sermonId={savedSermon.id}
                         sections={currentOutline.outline_sections || []}
                         isOwner={true}
                         initialComments={[]}
                       />
                     )}
                     {multimediaTab === 'comments' && !savedSermon && (
                       <div className="text-center py-8 text-gray-400 bg-white rounded-xl border border-gray-200">
                         <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                         <p className="text-sm font-medium">Save the sermon first to view comments</p>
                       </div>
                     )}
                   </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-80 text-center gap-4 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-indigo-400" />
                    </div>
                    <div>
                        <p className="font-semibold text-gray-700 text-lg">{TT('output.ready')}</p>
                        <p className="text-sm text-gray-500 mt-1 max-w-xs">
                          {TT('output.readyText')}
                        </p>
                      </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* SAVED TAB */}
          <TabsContent value="saved">
            {!user ? (
              <div className="text-center py-16">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 mb-3">{pt.signIn} {pt.signInToSave}</p>
                <Button onClick={() => base44.auth.redirectToLogin()}>{pt.signIn}</Button>
              </div>
            ) : loadingSaved ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              </div>
            ) : savedSermons.length === 0 ? (
               <div className="text-center py-16">
                 <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                 <p className="text-gray-600 mb-3">{pt.noSaved}</p>
                 <Button onClick={() => setTab('build')} className="gap-2 bg-indigo-600">
                   <Sparkles className="w-4 h-4" /> {pt.buildFirst}
                 </Button>
               </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedSermons.map(sermon => (
                  <Card key={sermon.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-gray-900 text-sm leading-snug flex-1">{sermon.title}</h3>
                        {sermon.is_shared && (
                          <Badge className="text-xs bg-green-100 text-green-700 border-0 flex-shrink-0">{TT('messages.shared')}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mb-3">{sermon.theme}</p>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {(sermon.passages || []).slice(0, 3).map(p => (
                          <span key={p} className="text-xs bg-indigo-50 text-indigo-600 rounded px-2 py-0.5">{p}</span>
                        ))}
                      </div>
                      <div className="flex gap-2 pt-2 border-t border-gray-100">
                        <Button size="sm" variant="outline" onClick={() => handleLoadSaved(sermon)} className="flex-1 gap-1.5 text-xs">
                                  <Eye className="w-3.5 h-3.5" /> {pt.open}
                                </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeleteSaved(sermon.id)} className="text-red-500 hover:bg-red-50 hover:border-red-200">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* OFFLINE TAB */}
          <TabsContent value="offline">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <WifiOff className="w-5 h-5 text-indigo-600" />
                <h2 className="font-bold text-gray-900">{pt.offlineLibrary}</h2>
              </div>
              <Button size="sm" variant="outline" onClick={loadOfflineSermons} className="gap-2">
                <RefreshCw className="w-4 h-4" /> {pt.refresh}
              </Button>
            </div>

            {offlineSermons.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
              <WifiOff className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="font-semibold text-gray-700 mb-1">{pt.noSaved}</p>
              <p className="text-sm text-gray-500 mb-4">{pt.generate}</p>
              <Button onClick={() => setTab('build')} className="gap-2 bg-indigo-600">
              <Sparkles className="w-4 h-4" /> {pt.generate}
              </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {offlineSermons.map(sermon => (
                  <Card key={sermon.id} className="hover:shadow-md transition-shadow border-green-200 bg-green-50/30">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-start gap-2 mb-2">
                        <WifiOff className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <h3 className="font-bold text-gray-900 text-sm leading-snug">{sermon.title}</h3>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{sermon.theme}</p>
                      <p className="text-xs text-green-600">
                        {pt.offlineSaved} {sermon.offline_saved_at ? new Date(sermon.offline_saved_at).toLocaleDateString() : ''}
                      </p>
                      <div className="flex gap-2 pt-3 border-t border-gray-100 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 gap-1.5 text-xs"
                          onClick={() => {
                            setCurrentOutline(sermon);
                            setTheme(sermon.theme || '');
                            setPassages(sermon.passages || []);
                            setTab('build');
                          }}
                        >
                          <Eye className="w-3.5 h-3.5" /> {pt.view}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Collab Invite Modal */}
      {collabOpen && savedSermon && (
        <SermonCollabInviteModal
          sermon={savedSermon}
          onClose={() => setCollabOpen(false)}
        />
      )}

      {/* Share Modal */}
      <SermonShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        sermon={savedSermon}
        onShared={(shared) => {
          setSavedSermon(prev => ({ ...prev, is_shared: shared }));
          setSavedSermons(prev => prev.map(s => s.id === savedSermon?.id ? { ...s, is_shared: shared } : s));
        }}
      />
    </div>
    </ErrorBoundary>
  );
}