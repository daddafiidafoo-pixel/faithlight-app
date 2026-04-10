/**
 * BiblePicker
 * Loads the catalog (from getBibleCatalog function or /catalog.json fallback)
 * and provides Language → Version → Book → Chapter selectors.
 * Calls onChange({ language, versionId, bookId, chapter, filesetIdText, filesetIdAudio })
 */
import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import MobileActionSheet from '../MobileActionSheet';

const BOOKS = [
  { id: 'GEN', name: 'Genesis' }, { id: 'EXO', name: 'Exodus' },
  { id: 'LEV', name: 'Leviticus' }, { id: 'NUM', name: 'Numbers' },
  { id: 'DEU', name: 'Deuteronomy' }, { id: 'JOS', name: 'Joshua' },
  { id: 'JDG', name: 'Judges' }, { id: 'RUT', name: 'Ruth' },
  { id: '1SA', name: '1 Samuel' }, { id: '2SA', name: '2 Samuel' },
  { id: '1KI', name: '1 Kings' }, { id: '2KI', name: '2 Kings' },
  { id: '1CH', name: '1 Chronicles' }, { id: '2CH', name: '2 Chronicles' },
  { id: 'EZR', name: 'Ezra' }, { id: 'NEH', name: 'Nehemiah' },
  { id: 'EST', name: 'Esther' }, { id: 'JOB', name: 'Job' },
  { id: 'PSA', name: 'Psalms' }, { id: 'PRO', name: 'Proverbs' },
  { id: 'ECC', name: 'Ecclesiastes' }, { id: 'SNG', name: 'Song of Songs' },
  { id: 'ISA', name: 'Isaiah' }, { id: 'JER', name: 'Jeremiah' },
  { id: 'LAM', name: 'Lamentations' }, { id: 'EZK', name: 'Ezekiel' },
  { id: 'DAN', name: 'Daniel' }, { id: 'HOS', name: 'Hosea' },
  { id: 'JOL', name: 'Joel' }, { id: 'AMO', name: 'Amos' },
  { id: 'OBA', name: 'Obadiah' }, { id: 'JON', name: 'Jonah' },
  { id: 'MIC', name: 'Micah' }, { id: 'NAH', name: 'Nahum' },
  { id: 'HAB', name: 'Habakkuk' }, { id: 'ZEP', name: 'Zephaniah' },
  { id: 'HAG', name: 'Haggai' }, { id: 'ZEC', name: 'Zechariah' },
  { id: 'MAL', name: 'Malachi' },
  { id: 'MAT', name: 'Matthew' }, { id: 'MRK', name: 'Mark' },
  { id: 'LUK', name: 'Luke' }, { id: 'JHN', name: 'John' },
  { id: 'ACT', name: 'Acts' }, { id: 'ROM', name: 'Romans' },
  { id: '1CO', name: '1 Corinthians' }, { id: '2CO', name: '2 Corinthians' },
  { id: 'GAL', name: 'Galatians' }, { id: 'EPH', name: 'Ephesians' },
  { id: 'PHP', name: 'Philippians' }, { id: 'COL', name: 'Colossians' },
  { id: '1TH', name: '1 Thessalonians' }, { id: '2TH', name: '2 Thessalonians' },
  { id: '1TI', name: '1 Timothy' }, { id: '2TI', name: '2 Timothy' },
  { id: 'TIT', name: 'Titus' }, { id: 'PHM', name: 'Philemon' },
  { id: 'HEB', name: 'Hebrews' }, { id: 'JAS', name: 'James' },
  { id: '1PE', name: '1 Peter' }, { id: '2PE', name: '2 Peter' },
  { id: '1JN', name: '1 John' }, { id: '2JN', name: '2 John' },
  { id: '3JN', name: '3 John' }, { id: 'JUD', name: 'Jude' },
  { id: 'REV', name: 'Revelation' },
];

export default function BiblePicker({ onChange, catalog: catalogProp = null, className = '' }) {
  const [catalog, setCatalog] = useState(catalogProp);
  const [loading, setLoading] = useState(!catalogProp);

  const [language, setLanguage] = useState('en');
  const [versionId, setVersionId] = useState('en_web');
  const [bookId, setBookId] = useState('JHN');
  const [chapter, setChapter] = useState(3);

  // Sync if catalogProp changes externally
  useEffect(() => {
    if (catalogProp) { setCatalog(catalogProp); setLoading(false); initCatalog(catalogProp); }
  }, [catalogProp]);

  // Load catalog from backend function, fall back to /catalog.json
  useEffect(() => {
    if (catalogProp) return; // already provided
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const res = await base44.functions.invoke('getBibleCatalog');
        if (alive && res?.data) {
          initCatalog(res.data);
        }
      } catch {
        // fallback to static file
        try {
          const res = await fetch('/catalog.json', { cache: 'no-store' });
          const data = await res.json();
          if (alive && data) initCatalog(data);
        } catch (e) {
          console.warn('BiblePicker: could not load catalog', e);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  function initCatalog(data) {
    setCatalog(data);
    const defLang = data?.defaults?.language || data?.languages?.[0]?.code || 'en';
    const defVer  = data?.defaults?.versionId || data?.versions?.find(v => v.language === defLang)?.id || '';
    const defBook = data?.defaults?.bookId || 'JHN';
    const defCh   = Number(data?.defaults?.chapter || 3);
    setLanguage(defLang);
    setVersionId(defVer);
    setBookId(defBook);
    setChapter(defCh);
  }

  const versionsForLang = useMemo(
    () => (catalog?.versions ?? []).filter(v => v.language === language && !v.pending),
    [catalog, language]
  );

  // Reset version when language changes
  useEffect(() => {
    if (!catalog) return;
    const list = (catalog.versions ?? []).filter(v => v.language === language && !v.pending);
    if (list.length && !list.some(v => v.id === versionId)) {
      setVersionId(list.find(v => v.isDefault)?.id || list[0]?.id || '');
    }
  }, [catalog, language]);

  const selectedVersion = useMemo(
    () => versionsForLang.find(v => v.id === versionId) || null,
    [versionsForLang, versionId]
  );

  const langHasVersions = useMemo(
    () => (catalog?.versions ?? []).some(v => v.language === language && !v.pending),
    [catalog, language]
  );

  // Notify parent
  useEffect(() => {
    if (!selectedVersion) return;
    onChange?.({
      language,
      versionId,
      bookId,
      chapter,
      filesetIdText:  selectedVersion.filesetIdText,
      filesetIdAudio: selectedVersion.filesetIdAudio,
      offlineAllowed: selectedVersion.offlineAllowed ?? false,
      license:        selectedVersion.license ?? 'unknown',
      attribution:    selectedVersion.attribution ?? '',
    });
  }, [language, versionId, bookId, chapter, selectedVersion]);

  if (loading) return <div className="text-sm text-gray-500 p-3">Loading Bible catalog…</div>;
  if (!catalog) return <div className="text-sm text-red-500 p-3">Could not load Bible catalog.</div>;

  return (
    <div className={`grid gap-3 ${className}`}>
      {/* Language */}
      <MobileActionSheet
        value={language}
        onValueChange={setLanguage}
        label="Language"
        options={catalog.languages.map(l => ({
          value: l.code,
          label: `${l.flag || ''} ${l.name}`.trim(),
        }))}
        renderOption={(opt) => opt.label || opt}
      />

      {/* Version or Coming Soon */}
      {!langHasVersions ? (
        <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2 border border-amber-200">
          <span>🚧</span>
          <span>Bible text for this language coming soon.</span>
        </div>
      ) : (
        <>
          <MobileActionSheet
            value={versionId}
            onValueChange={setVersionId}
            label="Version"
            options={versionsForLang.map(v => ({
              value: v.id,
              label: v.title,
            }))}
            renderOption={(opt) => opt.label || opt}
          />
          {selectedVersion?.license === 'public-domain' && (
            <p className="text-xs text-green-600">✓ Public domain · offline available</p>
          )}
        </>
      )}

      {/* Book */}
      <MobileActionSheet
        value={bookId}
        onValueChange={setBookId}
        label="Book"
        options={BOOKS.map(b => ({
          value: b.id,
          label: b.name,
        }))}
        renderOption={(opt) => opt.label || opt}
      />

      {/* Chapter */}
      <div>
        <label className="text-xs font-medium text-gray-500 mb-1 block">Chapter</label>
        <Input
          type="number"
          min={1}
          max={150}
          value={chapter}
          onChange={e => setChapter(Math.max(1, Number(e.target.value || 1)))}
        />
      </div>
    </div>
  );
}