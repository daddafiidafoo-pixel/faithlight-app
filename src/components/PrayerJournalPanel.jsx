import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import {
  createPrayerJournalEntry,
  deletePrayerJournalEntry,
  getEntriesForVerse,
} from "@/lib/prayerJournal";

const moodOptions = ["Hopeful", "Grateful", "Peaceful", "Burdened", "Joyful", "Reflective"];

export default function PrayerJournalPanel({
  verseReference,
  currentAudioTime = null,
}) {
  const [noteContent, setNoteContent] = useState("");
  const [mood, setMood] = useState("");
  const [tags, setTags] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const entries = useMemo(() => {
    return getEntriesForVerse(verseReference);
  }, [verseReference, refreshKey]);

  function handleSave() {
    if (!noteContent.trim()) return;

    createPrayerJournalEntry({
      verseReference,
      noteContent: noteContent.trim(),
      mood,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      audioTimestamp: currentAudioTime ? Math.floor(currentAudioTime) : null,
    });

    setNoteContent("");
    setMood("");
    setTags("");
    setRefreshKey((v) => v + 1);
  }

  return (
    <div className="rounded-2xl border bg-white dark:bg-slate-800 p-4 shadow-sm">
      <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Private Prayer Journal</h3>
      <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Add a personal note for <strong>{verseReference}</strong>.
      </p>

      <textarea
        value={noteContent}
        onChange={(e) => setNoteContent(e.target.value)}
        placeholder="Write your prayer, reflection, or note..."
        className="mb-3 min-h-[120px] w-full rounded-xl border border-gray-300 dark:border-slate-600 p-3 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
      />

      <div className="mb-3 grid gap-3 md:grid-cols-2">
        <select
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          className="rounded-xl border border-gray-300 dark:border-slate-600 p-3 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
        >
          <option value="">Select mood</option>
          {moodOptions.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Tags, separated by commas"
          className="rounded-xl border border-gray-300 dark:border-slate-600 p-3 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
        />
      </div>

      <button
        onClick={handleSave}
        className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 font-medium text-white transition-colors"
      >
        Save Note
      </button>

      <div className="mt-6">
        <h4 className="mb-3 font-semibold text-gray-900 dark:text-white">Saved Notes</h4>

        {entries.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No notes saved for this verse yet.</p>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div key={entry.id} className="rounded-xl border border-gray-200 dark:border-slate-600 p-3 bg-gray-50 dark:bg-slate-700">
                <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>{new Date(entry.createdAt).toLocaleString()}</span>
                  {entry.mood && (
                    <span className="rounded-full bg-gray-100 dark:bg-slate-600 px-2 py-1 text-gray-700 dark:text-gray-300">
                      {entry.mood}
                    </span>
                  )}
                  {entry.audioTimestamp !== null && (
                    <span className="rounded-full bg-blue-50 dark:bg-blue-900 px-2 py-1 text-blue-700 dark:text-blue-300">
                      Audio {entry.audioTimestamp}s
                    </span>
                  )}
                </div>

                <p className="mb-2 whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-100">{entry.noteContent}</p>

                {entry.tags?.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {entry.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-indigo-50 dark:bg-indigo-900 px-2 py-1 text-xs text-indigo-700 dark:text-indigo-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => {
                    deletePrayerJournalEntry(entry.id);
                    setRefreshKey((v) => v + 1);
                  }}
                  className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}