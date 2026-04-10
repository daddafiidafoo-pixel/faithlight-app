import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Bookmark,
  Download,
  Play,
  RotateCcw,
  RotateCw,
  SkipBack,
  SkipForward,
  Timer,
  Volume2,
} from 'lucide-react';

const ui = {
  en: {
    pageTitle: 'Audio Bible Catalog',
    nowPlaying: 'NOW PLAYING',
    speed: 'Speed',
    sleep: 'Sleep',
    off: 'Off',
    loading: 'Loading audio...',
    unavailable: 'Audio is not available for this chapter in the selected language.',
    failed: 'Audio could not be loaded right now.',
  },
  om: {
    pageTitle: 'Kuusaa Macaafa Qulqulluu Sagalee',
    nowPlaying: 'AMMA TAPHACHAA JIRA',
    speed: 'Saffisa',
    sleep: 'Yeroo Cufaa',
    off: 'Cufaa',
    loading: 'Sagalee fe\'aa jira...',
    unavailable: 'Sagaleen boqonnaa kanaa afaan filatame keessatti hin jiru.',
    failed: 'Sagaleen amma fe\'amuu hin dandeenye.',
  },
  am: {
    pageTitle: 'የድምፅ መጽሐፍ ቅዱስ ዝርዝር',
    nowPlaying: 'አሁን በመጫወት ላይ',
    speed: 'ፍጥነት',
    sleep: 'የመኝታ ሰዓት',
    off: 'ጠፍቷል',
    loading: 'ድምፅ በመጫን ላይ...',
    unavailable: 'የዚህ ምዕራፍ ድምፅ በተመረጠው ቋንቋ አይገኝም።',
    failed: 'ድምፁ አሁን መጫን አልቻለም።',
  },
};

export default function AudioBibleCatalog({
  language = 'en',
  selectedBook = 'Genesis',
  selectedChapter = 1,
  totalChapters = 50,
  onBack,
}) {
  const t = ui[language] || ui.en;
  const isRTL = language === 'ar';

  const audioRef = useRef(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const chapterLabel = `${selectedBook} ${selectedChapter}`;

  useEffect(() => {
    let ignore = false;

    async function loadAudio() {
      setLoading(true);
      setError('');
      setAudioUrl('');
      setPlaying(false);

      try {
        const res = await fetch('/api/biblebrain-audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            language,
            book: selectedBook,
            chapter: selectedChapter,
          }),
        });

        const data = await res.json();

        if (ignore) return;

        if (!res.ok || !data.ok || !data.audioUrl) {
          setError(data.error || t.unavailable);
          return;
        }

        setAudioUrl(data.audioUrl);
      } catch {
        if (!ignore) setError(t.failed);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadAudio();

    return () => {
      ignore = true;
    };
  }, [language, selectedBook, selectedChapter, t.failed, t.unavailable]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = playbackRate;
  }, [playbackRate]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    try {
      if (audio.paused) {
        await audio.play();
        setPlaying(true);
      } else {
        audio.pause();
        setPlaying(false);
      }
    } catch {
      setError(t.failed);
    }
  };

  const seekBy = (seconds) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, (audio.currentTime || 0) + seconds);
  };

  const formatTime = (seconds) => {
    if (!seconds || !Number.isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className={`min-h-screen bg-white ${isRTL ? 'text-right' : 'text-left'}`}>
      <audio
        ref={audioRef}
        src={audioUrl || undefined}
        preload="metadata"
        onEnded={() => setPlaying(false)}
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onError={() => setError(t.failed)}
      />

      <div className="flex items-center gap-3 border-b px-6 py-4">
        <button
          type="button"
          onClick={onBack}
          className="rounded-full p-2 hover:bg-slate-100"
          aria-label="Back"
        >
          <ArrowLeft className={`h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
        </button>
        <h1 className="text-2xl font-bold text-slate-900">{t.pageTitle}</h1>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600 text-white shadow">
                <Volume2 className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-4xl font-bold text-slate-900">Audio Bible</h2>
                <p className="mt-1 text-slate-500">{chapterLabel}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold tracking-wide text-slate-400">{t.nowPlaying}</p>
                <h3 className="mt-2 text-3xl font-bold text-slate-900">{chapterLabel}</h3>
              </div>
              <button className="text-slate-400">
                <Bookmark className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 rounded-3xl bg-gradient-to-b from-violet-600 to-indigo-700 p-7 text-white shadow-lg">
              <div className="flex items-center gap-4">
                <div className="flex h-18 w-18 items-center justify-center rounded-3xl bg-white/20">
                  <BookOpen className="h-10 w-10" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{selectedBook}</div>
                  <div className="text-lg text-white/85">
                    Chapter {selectedChapter} of {totalChapters}
                  </div>
                </div>
              </div>

              {audioUrl && (
                <div className="mt-8">
                  <div
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const percent = (e.clientX - rect.left) / rect.width;
                      if (audioRef.current) audioRef.current.currentTime = percent * duration;
                    }}
                    className="h-1.5 w-full rounded-full bg-white/30 cursor-pointer overflow-hidden group"
                  >
                    <div
                      className="h-full bg-white group-hover:bg-white/90"
                      style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                    />
                  </div>
                  <div className="mt-3 flex justify-between text-sm text-white/90">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
              )}

              <div className="mt-8 flex items-center justify-center gap-5">
                <button
                  onClick={() => seekBy(-30)}
                  disabled={!audioUrl || loading}
                  className="text-white/90 hover:text-white disabled:opacity-50 transition"
                >
                  <RotateCcw className="h-6 w-6" />
                </button>
                <button
                  onClick={() => seekBy(-10)}
                  disabled={!audioUrl || loading}
                  className="text-white/90 hover:text-white disabled:opacity-50 transition"
                >
                  <SkipBack className="h-6 w-6" />
                </button>

                <button
                  type="button"
                  onClick={togglePlay}
                  disabled={!audioUrl || loading}
                  className="flex h-20 w-20 items-center justify-center rounded-full bg-white/30 transition hover:bg-white/40 disabled:opacity-50"
                >
                  <Play className="h-10 w-10 fill-current" />
                </button>

                <button
                  onClick={() => seekBy(10)}
                  disabled={!audioUrl || loading}
                  className="text-white/90 hover:text-white disabled:opacity-50 transition"
                >
                  <SkipForward className="h-6 w-6" />
                </button>
                <button
                  onClick={() => seekBy(30)}
                  disabled={!audioUrl || loading}
                  className="text-white/90 hover:text-white disabled:opacity-50 transition"
                >
                  <RotateCw className="h-6 w-6" />
                </button>
              </div>

              <div className="mt-6 text-center text-sm">
                {loading ? (
                  <span className="text-white/90">{t.loading}</span>
                ) : error ? (
                  <span className="text-amber-200">{error}</span>
                ) : audioUrl ? (
                  <span className="text-emerald-200">{playing ? 'Playing' : 'Ready to play'}</span>
                ) : null}
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border bg-white p-5">
                <div className="mb-4 flex items-center gap-2 text-slate-600">
                  <Volume2 className="h-4 w-4" />
                  <span className="font-medium">{t.speed}</span>
                </div>
                <div className="flex gap-2">
                  {[0.75, 1, 1.25, 1.5].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setPlaybackRate(rate)}
                      className={`rounded-xl px-5 py-3 ${
                        playbackRate === rate
                          ? 'bg-violet-600 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border bg-white p-5">
                <div className="mb-4 flex items-center gap-2 text-slate-600">
                  <Timer className="h-4 w-4" />
                  <span className="font-medium">{t.sleep}</span>
                </div>
                <div className="flex gap-2">
                  {['Off', '10m', '20m', '30m', '60m'].map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={`rounded-xl px-5 py-3 ${
                        item === 'Off' ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button className="rounded-2xl bg-slate-100 p-4 text-slate-600 hover:bg-slate-200">
                <Download className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}