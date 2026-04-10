import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from "../store/appStore";
import { getChapterAudio } from "../../lib/audioApi";

export function ChapterAudioPlayer({ bookCode, chapter }) {
  const { audioLanguage, setAudioLanguage } = useAppStore();
  const [track, setTrack] = useState(null);
  const [error, setError] = useState("");
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    getChapterAudio({ audioLanguage, bookCode, chapter }).then(setTrack).catch((e) => setError(e.message));
  }, [audioLanguage, bookCode, chapter]);

  useEffect(() => {
    if (audioRef.current && track?.audioUrl) {
      audioRef.current.src = track.audioUrl;
      setPlaying(false);
    }
  }, [track]);

  const toggle = async () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
      return;
    }
    await audioRef.current.play();
    setPlaying(true);
  };

  return (
    <>
      <audio ref={audioRef} onEnded={() => setPlaying(false)} />
      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="font-semibold">Chapter Audio</div>
          <select className="rounded-lg border p-2" value={audioLanguage} onChange={(e) => setAudioLanguage(e.target.value)}>
            <option value="en">English</option>
            <option value="om">Afaan Oromoo</option>
          </select>
        </div>
        {error ? <div className="text-sm text-red-600">{error}</div> : null}
        <button className="rounded-xl bg-black px-4 py-2 text-white" onClick={toggle} disabled={!track?.audioUrl}>
          {playing ? "Pause" : "Play"}
        </button>
      </div>
      {track?.audioUrl ? (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
            <div className="min-w-0">
              <div className="truncate font-medium">{bookCode} {chapter}</div>
              <div className="text-sm text-muted-foreground">{audioLanguage === "om" ? "Afaan Oromoo" : "English"}</div>
            </div>
            <button className="rounded-xl bg-black px-4 py-2 text-white" onClick={toggle}>{playing ? "Pause" : "Play"}</button>
          </div>
        </div>
      ) : null}
    </>
  );
}