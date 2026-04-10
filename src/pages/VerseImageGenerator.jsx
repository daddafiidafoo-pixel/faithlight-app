import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Download, Share2, ChevronLeft, Sparkles, Image as ImageIcon, Type, Upload, X, RefreshCw, Globe, Loader2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { toast } from 'sonner';

// ── Language config ──────────────────────────────────────────────
const LANG_CONFIG = {
  en: { label: 'English',       flag: '🇬🇧', nativeName: 'English',       hasDirectBible: true,  fallbackMsg: null },
  om: { label: 'Afaan Oromoo',  flag: '🇪🇹', nativeName: 'Afaan Oromoo',  hasDirectBible: false, fallbackMsg: 'Aayanni kun yeroo ammaa Afaan Oromootiin guutuu hin argamne. Hiika gargaarsa AI fayyadamnee dhiyeessaa jirra.' },
  am: { label: 'Amharic',       flag: '🇪🇹', nativeName: 'አማርኛ',          hasDirectBible: false, fallbackMsg: 'ይህ ጥቅስ አሁን ሙሉ በሙሉ በአማርኛ አልተሟላም። የ AI ትርጉምን እየተጠቀምን ነው።' },
  sw: { label: 'Kiswahili',     flag: '🌍', nativeName: 'Kiswahili',      hasDirectBible: false, fallbackMsg: 'Mstari huu haupatikani kikamilifu kwa Kiswahili bado. Tunatumia tafsiri ya AI.' },
  ti: { label: 'Tigrinya',      flag: '🇪🇷', nativeName: 'ትግርኛ',          hasDirectBible: false, fallbackMsg: 'እዚ ጥቅሲ ሕጂ ብትግርኛ ብምሉኡ ኣይርከብን። ናይ AI ትርጉም ንጥቀም ኣለና።' },
  ar: { label: 'Arabic',        flag: '🌍', nativeName: 'العربية',         hasDirectBible: false, fallbackMsg: 'هذه الآية غير متاحة بالعربية بالكامل حتى الآن. نستخدم ترجمة بالذكاء الاصطناعي.' },
};

// ── English verse pool (source for translation) ──────────────────
const EN_VERSES = [
  { reference: 'John 3:16',       text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.' },
  { reference: 'Philippians 4:13', text: 'I can do all this through him who gives me strength.' },
  { reference: 'Isaiah 41:10',    text: 'So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you.' },
  { reference: 'Psalm 23:1',      text: 'The Lord is my shepherd, I lack nothing.' },
  { reference: 'Romans 8:28',     text: 'And we know that in all things God works for the good of those who love him.' },
  { reference: 'Joshua 1:9',      text: 'Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.' },
  { reference: 'John 14:27',      text: 'Peace I leave with you; my peace I give you. Do not let your hearts be troubled and do not be afraid.' },
  { reference: '1 Peter 5:7',     text: 'Cast all your anxiety on him because he cares for you.' },
  { reference: 'Psalm 46:1',      text: 'God is our refuge and strength, an ever-present help in trouble.' },
  { reference: 'Proverbs 3:5',    text: 'Trust in the Lord with all your heart and lean not on your own understanding.' },
  { reference: 'Jeremiah 29:11',  text: 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.' },
  { reference: 'Matthew 11:28',   text: 'Come to me, all you who are weary and burdened, and I will give you rest.' },
];

// Oromo translations for the pool (pre-baked so no AI call needed for common verses)
const OM_VERSES = [
  { reference: 'Yohaannis 3:16',       text: 'Waaqayyo akka nama isa amanu hundinuu hin badinne, garuu jireenya bara baraa argatuuf, addunyaa kana akkaan jaallate, ilma isaa tokkicha kenneef.' },
  { reference: 'Piliippisiiyus 4:13',  text: 'Waaqayyo iddoo hundatti na dandeessisa; qabxii hunda isaan gochuu nan danda\'a.' },
  { reference: 'Isaayyaas 41:10',      text: 'Hin sodaatin, ani si waliin nan jira; hin rifatin, ani Waaqayyo kee; nan jabeenya siif kenna, nan gargaara siif danda\'a.' },
  { reference: 'Faarfannaa 23:1',      text: 'Waaqayyo tiksee koo; wanti ana barbaachisu hin jiru.' },
  { reference: 'Roomaa 8:28',          text: 'Waaqayyo wantoota hunda namoota isa jaallatan, warra ergama isaatti waamaman, gara gaariitti akka hojjetan ni beekna.' },
  { reference: 'Yoosuwaa 1:9',         text: 'Jabaadhaa, garaa qabaadha; hin sodaatin, hin jabaadhin; waaqayyo kee bakka itti deemtu hundumaatti si wajjin jira.' },
  { reference: 'Yohaannis 14:27',      text: 'Nagaa isiniif dhiisa; nagaa koo isiniif kenna. Addunyaan akka kennutti ani isiniif hin kennu. Garaa keessan hin dheekkamsin, hin sodaatin.' },
  { reference: '1 Pheexiros 5:7',      text: 'Waa\'ee keessan hunda isatti darbaa, isa keessan irratti xinxallata.' },
  { reference: 'Faarfannaa 46:1',      text: 'Waaqayyo qollee fi cimina keenya dha, gargaarsa yerootti argamu rakkinaatti.' },
  { reference: 'Fakkeenya 3:5',        text: 'Waaqayyo keetti garaa guutuun hirkadhu, waan of danda\'utti hin hirkatin.' },
  { reference: 'Ermiyaas 29:11',       text: 'Yaadni isiniif yaade nan beeka; sagantaa nagaa ta\'e malee miidhaa miti; fuuldura fi abdii isiniif kenna jedha Waaqayyo.' },
  { reference: 'Maatewoos 11:28',      text: 'Horii fi rakkoodhaan dadhabdan hundi koottan dhufaa, ani boqonnaa isiniif kenna.' },
];

// Amharic translations (pre-baked)
const AM_VERSES = [
  { reference: 'ዮሐንስ 3:16',       text: 'እግዚአብሔር አንድያ ልጁን እስኪሰጥ ድረስ ዓለሙን በጣም ወደደ፤ ማንም በእርሱ የሚያምን እንዳይጠፋ ዘላለማዊ ሕይወት ያገኝ ዘንድ።' },
  { reference: 'ፊልጵስዩስ 4:13',   text: 'ሁሉን ነገር ሊያደርገኝ በሚችለው ኃይሉ ስሰጠው ሁሉ ማድረግ እችላለሁ።' },
  { reference: 'ኢሳያስ 41:10',     text: 'አትፍራ፤ እኔ ከአንተ ጋር ነኝ፤ አትደንግጥ፤ እኔ አምላክህ ነኝ። እጠነክርሃለሁ፤ እረዳሃለሁ።' },
  { reference: 'መዝሙር 23:1',      text: 'እግዚአብሔር እረኛዬ ነው፤ የሚያስፈልገኝ ነገር የለም።' },
  { reference: 'ሮሜ 8:28',         text: 'ሁሉ ለሚወዱት ለእግዚአብሔር ለበጎ እንደሚደረጉ እናውቃለን።' },
  { reference: 'ኢያሱ 1:9',         text: 'ጠንክር፤ ድፍረት ያዝ። አትፍራ፤ አትደንበር፤ ወደምትሄድበት ሁሉ አምላክህ እግዚአብሔር ከአንተ ጋር ነው።' },
  { reference: 'ዮሐንስ 14:27',      text: 'ሰላምን እተውላችኋለሁ፤ ሰላሜን እሰጣችኋለሁ። ልብዎ አይታወክ አይፍራ።' },
  { reference: '1 ጴጥሮስ 5:7',     text: 'ስለእናንተ ያሳስበዋልና ጭንቀታችሁን ሁሉ ወደ እርሱ ጣሉ።' },
  { reference: 'መዝሙር 46:1',      text: 'እግዚአብሔር መጠጊያችን ኃይላችን ነው፤ በጭንቅ ጊዜ ዘወትር የሚገኝ ዕርዳታ ነው።' },
  { reference: 'ምሳሌ 3:5',         text: 'በሙሉ ልብህ በእግዚአብሔር ታመን፤ ራስህን አታወጣ።' },
  { reference: 'ኤርሚያስ 29:11',    text: 'ስለ እናንተ ያለኝን ሐሳብ አውቃለሁ፤ ሕይወቱ ሊጎዳ ሳይሆን ሊጠቅም ነው፤ ወደፊቱ ተስፋ ሊሰጣቸው ነው ይላል እግዚአብሔር።' },
  { reference: 'ማቴዎስ 11:28',     text: 'ሁሉ ደካሞችና ሸካሮች ወደ እኔ ኑ፤ እኔ አሳርፋችኋለሁ።' },
];

const VERSE_POOLS = { en: EN_VERSES, om: OM_VERSES, am: AM_VERSES };

// ── Design constants ────────────────────────────────────────────
const BACKGROUNDS = [
  { id: 'dawn',     label: 'Golden Dawn',  style: 'linear-gradient(135deg, #F6D365 0%, #FDA085 100%)', textColor: '#3B1C06' },
  { id: 'sky',      label: 'Blue Sky',     style: 'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)', textColor: '#FFFFFF' },
  { id: 'forest',   label: 'Forest',       style: 'linear-gradient(135deg, #11998E 0%, #38EF7D 100%)', textColor: '#0D2B1F' },
  { id: 'dusk',     label: 'Dusk',         style: 'linear-gradient(135deg, #FC5C7D 0%, #6A3093 100%)', textColor: '#FFFFFF' },
  { id: 'ocean',    label: 'Deep Ocean',   style: 'linear-gradient(135deg, #2980B9 0%, #6DD5FA 100%)', textColor: '#FFFFFF' },
  { id: 'sand',     label: 'Desert Sand',  style: 'linear-gradient(135deg, #F7971E 0%, #FFD200 100%)', textColor: '#3B2300' },
  { id: 'night',    label: 'Holy Night',   style: 'linear-gradient(135deg, #0F0C29 0%, #302B63 50%, #24243E 100%)', textColor: '#E8D5FF' },
  { id: 'rose',     label: 'Rose Garden',  style: 'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 100%)', textColor: '#4A1025' },
  { id: 'cream',    label: 'Ivory Light',  style: 'linear-gradient(135deg, #FDFCFB 0%, #E2D1C3 100%)', textColor: '#3B2F2F' },
  { id: 'olive',    label: 'Olive Grove',  style: 'linear-gradient(135deg, #DAE2B6 0%, #A8C070 100%)', textColor: '#1F2E0A' },
  { id: 'ember',    label: 'Ember',        style: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)', textColor: '#FFFFFF' },
  { id: 'charcoal', label: 'Charcoal',     style: 'linear-gradient(135deg, #232526, #414345)', textColor: '#F5F5F5' },
  { id: 'lavender', label: 'Lavender',     style: 'linear-gradient(135deg, #c3cfe2, #f5f7fa)', textColor: '#2d2060' },
  { id: 'gold',     label: 'Pure Gold',    style: 'linear-gradient(135deg, #C6A84B, #F8E08E, #C6A84B)', textColor: '#2B1A00' },
];

const FONTS = [
  { id: 'georgia',  label: 'Georgia',     css: 'Georgia, serif' },
  { id: 'palatino', label: 'Palatino',    css: '"Palatino Linotype", Palatino, serif' },
  { id: 'system',   label: 'Modern',      css: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  { id: 'courier',  label: 'Typewriter',  css: '"Courier New", Courier, monospace' },
];

const SIZES = [
  { id: 'square',   label: '1:1',  w: 360, h: 360 },
  { id: 'portrait', label: '4:5',  w: 360, h: 450 },
  { id: 'story',    label: '9:16', w: 360, h: 640 },
];

const TEXT_ALIGNS = ['left', 'center', 'right'];

// ── AI translate single verse ────────────────────────────────────
async function translateVerseWithAI(langCode, enVerse) {
  const langInstructions = {
    om: 'Afaan Oromoo (Oromo)',
    am: 'Amharic (አማርኛ, Ethiopic script)',
    sw: 'Kiswahili',
    ti: 'Tigrinya (ትግርኛ, Ethiopic script)',
    ar: 'Arabic (العربية, right-to-left)',
  };
  const target = langInstructions[langCode] || 'English';
  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `Translate this Bible verse faithfully into ${target}.
Return ONLY the translated verse text and the reference in the target language — nothing else.

Reference: ${enVerse.reference}
English text: "${enVerse.text}"

Format your response exactly as:
REFERENCE: [reference in target language]
TEXT: [translated verse text]`,
  });
  const lines = (result || '').split('\n').map(l => l.trim()).filter(Boolean);
  const refLine = lines.find(l => l.startsWith('REFERENCE:'));
  const textLine = lines.find(l => l.startsWith('TEXT:'));
  return {
    reference: refLine ? refLine.replace('REFERENCE:', '').trim() : enVerse.reference,
    text: textLine ? textLine.replace('TEXT:', '').trim() : enVerse.text,
  };
}

// ── Main component ───────────────────────────────────────────────
export default function VerseImageGenerator() {
  const [activeLang, setActiveLang] = useState('en');
  const [versePool, setVersePool]   = useState(EN_VERSES);
  const [selectedVerse, setSelectedVerse] = useState(EN_VERSES[0]);
  const [usingFallback, setUsingFallback] = useState(false);
  const [translating, setTranslating]     = useState(false);

  const [selectedBg,   setSelectedBg]   = useState(BACKGROUNDS[0]);
  const [selectedFont, setSelectedFont] = useState(FONTS[0]);
  const [selectedSize, setSelectedSize] = useState(SIZES[0]);
  const [textAlign, setTextAlign]       = useState('center');
  const [fontSize, setFontSize]         = useState(16);
  const [customText, setCustomText]     = useState('');
  const [customRef, setCustomRef]       = useState('');
  const [uploadedBg, setUploadedBg]     = useState(null);
  const [exporting, setExporting]       = useState(false);
  const [exported, setExported]         = useState(false);
  const [activeTab, setActiveTab]       = useState('bg');
  const [searchQuery, setSearchQuery]   = useState('');

  const cardRef   = useRef(null);
  const uploadRef = useRef(null);

  // When language changes → load or translate verse pool
  useEffect(() => {
    let isMounted = true;

    const loadVersePool = async () => {
      setCustomText('');
      setCustomRef('');
      setUsingFallback(false);

      const pool = VERSE_POOLS[activeLang];
      if (pool) {
        // Pre-baked translation available
        if (isMounted) {
          setVersePool(pool);
          setSelectedVerse(pool[0]);
          setUsingFallback(false);
        }
        return;
      }

      // No pre-baked pool → AI-translate the first verse immediately, rest on demand
      const langCfg = LANG_CONFIG[activeLang];
      if (!langCfg?.hasDirectBible) {
        if (isMounted) {
          setUsingFallback(true);
          setTranslating(true);
        }
        // Translate first verse as default
        try {
          const translated = await translateVerseWithAI(activeLang, EN_VERSES[0]);
          if (isMounted) {
            setSelectedVerse(translated);
            // Build translated pool from english
            setVersePool(EN_VERSES.map((v, i) => i === 0 ? translated : { ...v, _needsTranslation: true }));
          }
        } catch {
          if (isMounted) {
            setSelectedVerse(EN_VERSES[0]);
            setVersePool(EN_VERSES);
          }
        } finally {
          if (isMounted) setTranslating(false);
        }
      }
    };

    loadVersePool();
    return () => { isMounted = false; };
  }, [activeLang]);

  // Translate a verse on click for non-pre-baked languages
  const handleSelectVerse = async (v) => {
    setCustomText('');
    setCustomRef('');
    if (!v._needsTranslation || VERSE_POOLS[activeLang]) {
      setSelectedVerse(v);
      return;
    }
    setTranslating(true);
    try {
      const translated = await translateVerseWithAI(activeLang, EN_VERSES.find(e => e.reference === v.reference) || v);
      setSelectedVerse(translated);
      // Update pool cache
      setVersePool(prev => prev.map(p => p.reference === v.reference ? translated : p));
    } catch {
      setSelectedVerse(v);
      toast.error('Translation failed, showing English fallback');
    } finally {
      setTranslating(false);
    }
  };

  const displayVerse = {
    reference: customRef || selectedVerse?.reference || '',
    text: customText || selectedVerse?.text || '',
  };

  const langCfg = LANG_CONFIG[activeLang] || LANG_CONFIG.en;

  const handleUploadBg = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setUploadedBg(ev.target.result);
    reader.readAsDataURL(file);
  };
  const clearUpload = () => { setUploadedBg(null); if (uploadRef.current) uploadRef.current.value = ''; };

  const handleExport = async () => {
    if (!cardRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true, allowTaint: true, backgroundColor: null });
      const link = document.createElement('a');
      link.download = `faithlight-${activeLang}-${displayVerse.reference.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setExported(true);
      toast.success('Image downloaded!');
      setTimeout(() => setExported(false), 3000);
    } catch { toast.error('Export failed'); }
    setExporting(false);
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true, allowTaint: true, backgroundColor: null });
      canvas.toBlob(async (blob) => {
        const file = new File([blob], `faithlight-${activeLang}-verse.png`, { type: 'image/png' });
        if (navigator.share && navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], title: displayVerse.reference });
          toast.success('Shared!');
        } else {
          const link = document.createElement('a');
          link.download = file.name;
          link.href = canvas.toDataURL();
          link.click();
          toast.success('Image downloaded');
        }
      });
    } catch { toast.error('Share failed'); }
    setExporting(false);
  };

  const filteredVerses = versePool.filter(v =>
    !searchQuery || v.reference.toLowerCase().includes(searchQuery.toLowerCase()) || v.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const cardBgStyle = uploadedBg
    ? { backgroundImage: `url(${uploadedBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { background: selectedBg?.style };
  const textColor  = uploadedBg ? '#FFFFFF' : selectedBg?.textColor || '#FFFFFF';
  const textShadow = uploadedBg ? '0 1px 4px rgba(0,0,0,0.7)' : 'none';
  // RTL for Arabic
  const isRTL = activeLang === 'ar';

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-lg mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Link to="/Home" className="p-2 rounded-xl hover:bg-gray-200">
            <ChevronLeft size={20} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">✨ Verse Image Creator</h1>
            <p className="text-xs text-gray-500">Design & share beautiful Bible verse cards</p>
          </div>
        </div>

        {/* Language selector */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Globe size={13} className="text-indigo-500" />
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select language</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(LANG_CONFIG).map(([code, cfg]) => (
              <button
                key={code}
                onClick={() => setActiveLang(code)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all ${
                  activeLang === code
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 text-gray-600 hover:border-indigo-300'
                }`}
              >
                {cfg.flag} {cfg.nativeName}
              </button>
            ))}
          </div>
        </div>

        {/* Fallback notice */}
        {usingFallback && langCfg.fallbackMsg && (
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
            <AlertCircle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-relaxed">{langCfg.fallbackMsg}</p>
          </div>
        )}

        {/* Translating indicator */}
        {translating && (
          <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-xl p-3 mb-4">
            <Loader2 size={14} className="text-indigo-600 animate-spin" />
            <p className="text-xs text-indigo-700">Translating verse into {langCfg.nativeName}…</p>
          </div>
        )}

        {/* PREVIEW CARD */}
        <div className="mb-4 flex justify-center">
          <div
            ref={cardRef}
            dir={isRTL ? 'rtl' : 'ltr'}
            style={{
              ...cardBgStyle,
              color: textColor,
              width: selectedSize?.w || 360,
              height: selectedSize?.h || 360,
              borderRadius: 20,
              padding: 36,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
              overflow: 'hidden',
            }}
          >
            {uploadedBg && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', borderRadius: 20 }} />}
            <div style={{ fontSize: 28, opacity: 0.2, position: 'absolute', top: 18, right: 22, zIndex: 1 }}>✝</div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 1, textAlign }}>
              <p style={{
                fontSize,
                fontStyle: 'italic',
                lineHeight: 1.8,
                marginBottom: 16,
                fontFamily: selectedFont?.css || 'Georgia, serif',
                textShadow,
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
              }}>
                "{displayVerse.text}"
              </p>
              <p style={{
                fontSize: fontSize - 2,
                fontWeight: 700,
                letterSpacing: 0.5,
                opacity: 0.9,
                fontFamily: selectedFont?.css || 'Georgia, serif',
                textShadow,
              }}>
                — {displayVerse.reference}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, opacity: 0.45, marginTop: 8, position: 'relative', zIndex: 1 }}>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1 }}>✦ FAITHLIGHT</span>
            </div>
          </div>
        </div>

        {/* Export buttons */}
        <div className="flex gap-3 mb-5">
          <button onClick={handleExport} disabled={exporting || translating}
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-2xl font-semibold text-sm disabled:opacity-50 active:scale-95 transition-transform">
            <Download size={16} /> {exported ? 'Saved ✓' : exporting ? 'Saving…' : 'Download PNG'}
          </button>
          <button onClick={handleShare} disabled={exporting || translating}
            className="flex-1 flex items-center justify-center gap-2 bg-white border border-indigo-200 text-indigo-700 py-3 rounded-2xl font-semibold text-sm active:scale-95 transition-transform">
            <Share2 size={16} /> Share
          </button>
        </div>

        {/* Tab nav */}
        <div className="flex bg-gray-100 rounded-2xl p-1 mb-4 gap-1">
          {[['bg', '🎨 Background'], ['font', '🔤 Font'], ['verse', '📖 Verse'], ['layout', '⚙️ Layout']].map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${activeTab === key ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Background Tab */}
        {activeTab === 'bg' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
            <p className="text-sm font-bold text-gray-800 flex items-center gap-2"><ImageIcon size={14} /> Choose Background</p>
            <div className="grid grid-cols-5 gap-2">
              {BACKGROUNDS.map(bg => (
                <button key={bg.id} onClick={() => { setSelectedBg(bg); clearUpload(); }}
                  style={{ background: bg.style }}
                  className={`h-10 rounded-xl border-2 transition-all ${!uploadedBg && selectedBg.id === bg.id ? 'border-indigo-500 scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
                  title={bg.label} />
              ))}
            </div>
            <div className="border-t border-gray-100 pt-3">
              <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1"><Upload size={12} /> Upload Your Own Photo</p>
              {uploadedBg ? (
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                  <img src={uploadedBg} className="w-12 h-12 rounded-lg object-cover" alt="bg preview" />
                  <p className="flex-1 text-xs text-green-700 font-medium">Custom background active</p>
                  <button onClick={clearUpload} className="p-1.5 rounded-lg hover:bg-green-100 text-green-600"><X size={13} /></button>
                </div>
              ) : (
                <button onClick={() => uploadRef.current?.click()}
                  className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-xs text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition-colors">
                  Tap to upload an image from your device
                </button>
              )}
              <input ref={uploadRef} type="file" accept="image/*" className="hidden" onChange={handleUploadBg} />
            </div>
          </div>
        )}

        {/* Font Tab */}
        {activeTab === 'font' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
            <p className="text-sm font-bold text-gray-800 flex items-center gap-2"><Type size={14} /> Text Style</p>
            <div className="space-y-2">
              {FONTS.map(f => (
                <button key={f.id} onClick={() => setSelectedFont(f)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${selectedFont.id === f.id ? 'border-indigo-400 bg-indigo-50' : 'border-gray-100 hover:border-gray-300'}`}>
                  <span className="text-sm font-semibold text-gray-800">{f.label}</span>
                  <span style={{ fontFamily: f.css }} className="text-sm text-gray-500 italic">The Lord is my shepherd</span>
                </button>
              ))}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">Font Size: {fontSize}px</p>
              <input type="range" min={11} max={22} value={fontSize} onChange={e => setFontSize(Number(e.target.value))} className="w-full accent-indigo-600" />
              <div className="flex justify-between text-xs text-gray-400 mt-1"><span>Small</span><span>Large</span></div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">Text Alignment</p>
              <div className="flex gap-2">
                {TEXT_ALIGNS.map(a => (
                  <button key={a} onClick={() => setTextAlign(a)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border capitalize transition-all ${textAlign === a ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200 text-gray-600 hover:border-indigo-300'}`}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Verse Tab */}
        {activeTab === 'verse' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
            <p className="text-sm font-bold text-gray-800 flex items-center gap-2"><Sparkles size={14} /> Choose Verse — {langCfg.flag} {langCfg.nativeName}</p>
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search verse or reference…"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />

            <div className="space-y-2 max-h-52 overflow-y-auto">
              {filteredVerses.map(v => (
                <button key={v.reference} onClick={() => handleSelectVerse(v)}
                  disabled={translating}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${selectedVerse.reference === v.reference && !customText ? 'border-indigo-400 bg-indigo-50 text-indigo-800' : 'border-gray-100 text-gray-700 hover:border-gray-300'}`}>
                  <span className="font-semibold block">{v.reference}</span>
                  <span className="text-gray-500 line-clamp-2">{v._needsTranslation ? <em className="text-amber-500">Tap to translate</em> : v.text}</span>
                </button>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-2">
              <p className="text-xs font-semibold text-gray-600">Or type your own verse</p>
              <input value={customRef} onChange={e => setCustomRef(e.target.value)}
                placeholder="Reference (e.g. Psalm 91:1)"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              <textarea rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                placeholder="Paste verse text here…"
                value={customText} onChange={e => setCustomText(e.target.value)} />
              {(customText || customRef) && (
                <button onClick={() => { setCustomText(''); setCustomRef(''); }}
                  className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1">
                  <RefreshCw size={11} /> Reset to selected verse
                </button>
              )}
            </div>
          </div>
        )}

        {/* Layout Tab */}
        {activeTab === 'layout' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
            <p className="text-sm font-bold text-gray-800">Canvas Size</p>
            <div className="grid grid-cols-3 gap-3">
              {SIZES.map(s => (
                <button key={s.id} onClick={() => setSelectedSize(s)}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all ${selectedSize.id === s.id ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div style={{ width: 24, height: s.id === 'square' ? 24 : s.id === 'portrait' ? 30 : 42 }}
                    className={`rounded border-2 ${selectedSize.id === s.id ? 'border-indigo-500' : 'border-gray-400'}`} />
                  <span className="text-xs font-semibold text-gray-700">{s.label}</span>
                  <span className="text-xs text-gray-400">{s.id === 'square' ? 'Feed' : s.id === 'portrait' ? 'Portrait' : 'Story'}</span>
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}