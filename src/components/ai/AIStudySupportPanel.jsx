"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  BookMarked,
  Clock3,
  FileText,
  FolderHeart,
  History,
  Search,
  Sparkles,
  Star,
} from "lucide-react";

const text = {
  en: {
    empty: {
      badge: "FaithLight AI",
      title: "Start your next Bible study with clarity",
      subtitle:
        "Search a verse, create a study plan, or explore a theology topic. FaithLight will organize the response into a clean study format.",
      suggestionsTitle: "Try one of these",
      suggestions: [
        "John 3:16",
        "Faith during trials",
        "Grace and salvation",
        "Matthew 5:1-12",
      ],
      recentTitle: "Recent searches",
      recentEmpty: "Your recent searches will appear here.",
    },
    notes: {
      title: "Saved notes",
      save: "Save to Notes",
      saved: "Saved",
      empty: "Saved study notes will appear here.",
    },
    tabs: {
      studyPlans: "Study Plans",
      passages: "Passages",
      theology: "Theology",
    },
    recent: {
      now: "Just now",
      clear: "Clear all",
    },
  },
  om: {
    empty: {
      badge: "FaithLight AI",
      title: "Qorannoo Macaaba Qulqulluu kee ifaan jalqabi",
      subtitle:
        "Aayata barbaadi, karoora qorannoo uumi, ykn mata duree ti'oolojii qoradhu. FaithLight deebii kee bifa barnootaa qulqulluutti qindeessa.",
      suggestionsTitle: "Kana keessaa tokko yaali",
      suggestions: [
        "Yohannis 3:16",
        "Yeroo qorumsaatti amantii",
        "Ayyaanaa fi fayyina",
        "Maatewos 5:1-12",
      ],
      recentTitle: "Barbaacha dhihoo",
      recentEmpty: "Barbaachi kee dhihoo asitti mul'ata.",
    },
    notes: {
      title: "Yaadannoo kuufame",
      save: "Yaadannootti Kuusi",
      saved: "Kuufameera",
      empty: "Yaadannoowwan qorannoo kuufaman asitti mul'atu.",
    },
    tabs: {
      studyPlans: "Karoorota Qorannoo",
      passages: "Kutaa Caaffataa",
      theology: "Ti'oolojii",
    },
    recent: {
      now: "Amma",
      clear: "Hunda haqi",
    },
  },
};

const RECENT_SEARCHES_KEY = "faithlight_recent_searches";
const SAVED_NOTES_KEY = "faithlight_saved_notes";

function formatRelativeTime(ts, language) {
  const diff = Date.now() - ts;
  if (diff < 60_000) {
    return (text[language] ?? text.en).recent.now;
  }
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(diff / 86_400_000);
  return `${days}d`;
}

function buildResultNote(result) {
  if (result.type === "studyPlans") {
    return {
      title: result.title,
      body: [
        result.summary,
        "",
        ...result.days.flatMap((d) => [
          `${d.day} - ${d.title}`,
          `Reading: ${d.reading}`,
          d.reflection,
          d.prayer,
          "",
        ]),
        result.keyVerses.join(", "),
      ].join("\n"),
    };
  }

  if (result.type === "passages") {
    return {
      title: result.title,
      body: [
        result.summary,
        "",
        result.context,
        "",
        ...result.keyThemes,
        "",
        ...result.application,
        "",
        result.prayer,
      ].join("\n"),
    };
  }

  return {
    title: result.title,
    body: [
      result.summary,
      "",
      result.explanation,
      "",
      ...result.supportingPassages,
      "",
      ...result.practicalApplication,
      "",
      ...(result.cautions || []),
    ].join("\n"),
  };
}

function PremiumEmptyState({ language = "en", onSuggestionClick }) {
  const t = text[language] ?? text.en;

  return (
    <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="rounded-[28px] bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-8 text-white">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm">
          <Sparkles className="h-4 w-4" />
          <span>{t.empty.badge}</span>
        </div>

        <h3 className="mt-4 text-3xl font-bold leading-tight md:text-4xl">
          {t.empty.title}
        </h3>

        <p className="mt-4 max-w-2xl text-white/90 leading-7">
          {t.empty.subtitle}
        </p>
      </div>

      <div className="mt-6">
        <h4 className="text-lg font-bold text-slate-900">
          {t.empty.suggestionsTitle}
        </h4>

        <div className="mt-4 flex flex-wrap gap-3">
          {t.empty.suggestions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onSuggestionClick(item)}
              className="rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700 transition hover:bg-violet-100"
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-violet-700 shadow-sm">
              <Search className="h-6 w-6" />
            </div>
            <h5 className="mt-4 text-lg font-semibold text-slate-900">
              Search Scripture
            </h5>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Find a verse, passage, or topic and get a clear, structured response.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-violet-700 shadow-sm">
              <BookMarked className="h-6 w-6" />
            </div>
            <h5 className="mt-4 text-lg font-semibold text-slate-900">
              Save Insights
            </h5>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Keep valuable study responses and revisit them later as notes.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-violet-700 shadow-sm">
              <History className="h-6 w-6" />
            </div>
            <h5 className="mt-4 text-lg font-semibold text-slate-900">
              Resume Quickly
            </h5>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Reopen recent searches without typing everything again.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecentSearchesCard({
  language = "en",
  items,
  onItemClick,
  onClear,
}) {
  const t = text[language] ?? text.en;

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
            <Clock3 className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            {t.empty.recentTitle}
          </h3>
        </div>

        {items.length > 0 ? (
          <button
            type="button"
            onClick={onClear}
            className="text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            {t.recent.clear}
          </button>
        ) : null}
      </div>

      {items.length === 0 ? (
        <p className="mt-5 text-sm text-slate-500">{t.empty.recentEmpty}</p>
      ) : (
        <div className="mt-5 space-y-3">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onItemClick(item)}
              className="flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:bg-slate-100"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900">{item.label}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                  <span className="rounded-full bg-white px-2 py-1 ring-1 ring-slate-200">
                    {t.tabs[item.tab]}
                  </span>
                  <span>{formatRelativeTime(item.createdAt, language)}</span>
                </div>
              </div>

              <History className="h-4 w-4 shrink-0 text-slate-400" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SavedNotesCard({
  language = "en",
  items,
  onSave,
  onDelete,
  canSave,
  savedStateLabel,
}) {
  const t = text[language] ?? text.en;

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
            <FolderHeart className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">{t.notes.title}</h3>
        </div>

        <button
          type="button"
          onClick={onSave}
          disabled={!canSave}
          className="inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Star className="h-4 w-4" />
          {savedStateLabel}
        </button>
      </div>

      {items.length === 0 ? (
        <p className="mt-5 text-sm text-slate-500">{t.notes.empty}</p>
      ) : (
        <div className="mt-5 space-y-3">
          {items.map((note) => (
            <div
              key={note.id}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-violet-600" />
                    <p className="truncate font-semibold text-slate-900">
                      {note.title}
                    </p>
                  </div>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                    {note.body}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onDelete(note.id)}
                  className="shrink-0 text-xs font-medium text-slate-500 hover:text-slate-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AIStudySupportPanel({
  language = "en",
  activeTab,
  query,
  selectedTopic = "",
  result,
  onUseRecentSearch,
}) {
  const t = text[language] ?? text.en;
  const [recentSearches, setRecentSearches] = useState([]);
  const [savedNotes, setSavedNotes] = useState([]);
  const [savedFlash, setSavedFlash] = useState(false);

  const currentSearchLabel = useMemo(() => {
    if (activeTab === "theology") return selectedTopic || query;
    return query;
  }, [activeTab, query, selectedTopic]);

  useEffect(() => {
    try {
      const recentRaw = localStorage.getItem(RECENT_SEARCHES_KEY);
      const notesRaw = localStorage.getItem(SAVED_NOTES_KEY);

      if (recentRaw) setRecentSearches(JSON.parse(recentRaw));
      if (notesRaw) setSavedNotes(JSON.parse(notesRaw));
    } catch (error) {
      console.error("Failed to load from localStorage:", error);
    }
  }, []);

  useEffect(() => {
    if (!currentSearchLabel.trim()) return;

    const item = {
      id: `${activeTab}-${currentSearchLabel}-${Date.now()}`,
      label: currentSearchLabel.trim(),
      tab: activeTab,
      topic: selectedTopic,
      createdAt: Date.now(),
    };

    const timeout = setTimeout(() => {
      setRecentSearches((prev) => {
        const deduped = [
          item,
          ...prev.filter(
            (x) => !(x.label === item.label && x.tab === item.tab)
          ),
        ].slice(0, 8);

        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(deduped));
        return deduped;
      });
    }, 900);

    return () => clearTimeout(timeout);
  }, [activeTab, currentSearchLabel, selectedTopic]);

  const handleClearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  const handleSaveNote = () => {
    if (!result) return;

    const note = buildResultNote(result);
    const item = {
      id: `${note.title}-${Date.now()}`,
      title: note.title,
      body: note.body,
      createdAt: Date.now(),
    };

    setSavedNotes((prev) => {
      const next = [item, ...prev].slice(0, 20);
      localStorage.setItem(SAVED_NOTES_KEY, JSON.stringify(next));
      return next;
    });

    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1400);
  };

  const handleDeleteNote = (id) => {
    setSavedNotes((prev) => {
      const next = prev.filter((x) => x.id !== id);
      localStorage.setItem(SAVED_NOTES_KEY, JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="space-y-6">
      {!result ? (
        <PremiumEmptyState
          language={language}
          onSuggestionClick={(value) =>
            onUseRecentSearch({
              id: `suggestion-${value}`,
              label: value,
              tab: activeTab,
              topic: activeTab === "theology" ? value : undefined,
              createdAt: Date.now(),
            })
          }
        />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentSearchesCard
          language={language}
          items={recentSearches}
          onItemClick={onUseRecentSearch}
          onClear={handleClearRecent}
        />

        <SavedNotesCard
          language={language}
          items={savedNotes}
          onSave={handleSaveNote}
          onDelete={handleDeleteNote}
          canSave={!!result}
          savedStateLabel={savedFlash ? t.notes.saved : t.notes.save}
        />
      </div>
    </div>
  );
}