import { useEffect, useRef, useState } from "react";
import { Download, Play } from "lucide-react";
import {
  saveAudioChapter,
  getAudioChapter,
} from "@/lib/offlineDb";

export default function OfflineAudioControls({
  chapterKey,
  audioUrl,
  textUrl,
  onTimeUpdate,
}) {
  const audioRef = useRef(null);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [playOffline, setPlayOffline] = useState(false);
  const [offlineAudioSrc, setOfflineAudioSrc] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadCached() {
      const cachedAudioUrl = await getAudioChapter(chapterKey);
      if (cachedAudioUrl && mounted) {
        setIsDownloaded(true);
        setOfflineAudioSrc(cachedAudioUrl);
      }
    }

    loadCached();

    return () => {
      mounted = false;
    };
  }, [chapterKey]);

  async function handleDownload() {
    try {
      setStatus("Downloading chapter...");

      const [audioResponse, textResponse] = await Promise.all([
        fetch(audioUrl),
        fetch(textUrl),
      ]);

      const audioBlob = await audioResponse.blob();

      await saveAudioChapter(chapterKey, audioUrl);

      const localUrl = URL.createObjectURL(audioBlob);
      setOfflineAudioSrc(localUrl);
      setIsDownloaded(true);
      setStatus("Downloaded for offline use.");
      setTimeout(() => setStatus(""), 2000);
    } catch {
      setStatus("Download failed.");
    }
  }

  return (
    <div className="rounded-2xl border bg-white dark:bg-slate-800 p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Audio Chapter</h3>
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${
            isDownloaded
              ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
              : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400"
          }`}
        >
          {isDownloaded ? "✓ Downloaded" : "Not Downloaded"}
        </span>
      </div>

      <audio
        ref={audioRef}
        controls
        src={playOffline && offlineAudioSrc ? offlineAudioSrc : audioUrl}
        className="mb-4 w-full rounded-lg"
        onTimeUpdate={(e) => onTimeUpdate?.(e.currentTarget.currentTime)}
      />

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleDownload}
          className="rounded-xl border border-gray-300 dark:border-slate-600 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
        >
          <Download className="w-4 h-4" /> Download
        </button>

        <label className="flex items-center gap-2 rounded-xl border border-gray-300 dark:border-slate-600 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors cursor-pointer">
          <input
            type="checkbox"
            checked={playOffline}
            onChange={(e) => setPlayOffline(e.target.checked)}
            disabled={!isDownloaded}
            className="cursor-pointer"
          />
          <span className={isDownloaded ? "" : "opacity-50"}>Play Offline</span>
        </label>
      </div>

      {status && <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{status}</p>}
    </div>
  );
}