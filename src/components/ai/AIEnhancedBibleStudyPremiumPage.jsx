"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BookMarked,
  BookOpen,
  CheckCircle2,
  Clock3,
  Copy,
  FileText,
  FolderHeart,
  History,
  Lightbulb,
  Loader2,
  Quote,
  Search,
  Sparkles,
  Star,
  Target,
} from "lucide-react";

const translations = {
  en: {
    pageTitle: "AI Enhanced Bible Study",
    subtitle: "Generate personalized study plans and theological insights",
    searchPlaceholder: "Search Scripture... (e.g. Matthew 5:9)",
    searchButton: "Search",
    back: "Back",
    providerLabel: "AI Provider",
    tabs: {
      studyPlans: "Study Plans",
      passages: "Passages",
      theology: "Theology",
    },
    theology: {
      title: "Theological Insights",
      subtitle: "Explore biblical concepts",
      topicLabel: "Theology Topic",
      customTopicPlaceholder: "Or enter custom topic",
      topics: [
        "Faith",
        "Love",
        "Grace",
        "Hope",
        "Salvation",
        "God's Will",
        "Blessings",
        "Theology",
      ],
    },
    placeholders: {
      studyPlans:
        "Enter a topic, book, chapter, or spiritual goal to generate a study plan.",
      passages:
        "Search for a verse or passage to receive deeper explanation and insights.",
      theology:
        "Choose a theology topic or type your own topic to explore biblical teaching.",
    },
    actions: {
      generate: "Generate Insight",
      clear: "Clear",
      copy: "Copy",
      copied: "Copied",
      save: "Save to Notes",
      saved: "Saved",
    },
    loading: "Generating insight...",
    errorTitle: "Something went wrong",
    response: {
      studyPlanDaily: "Daily Plan",
      keyVerses: "Key Verses",
      reading: "Reading",
      reflection: "Reflection",
      prayer: "Prayer",
      context: "Context",
      keyThemes: "Key Themes",
      application: "Application",
      explanation: "Explanation",
      supportingPassages: "Supporting Passages",
      practicalApplication: "Practical Application",
      cautions: "Cautions",
      warnings: "Important Notes",
    },
    support: {
      emptyBadge: "FaithLight AI",
      emptyTitle: "Start your next Bible study with clarity",
      emptySubtitle:
        "Search a verse, create a study plan, or explore a theology topic. FaithLight organizes the response into a clean study format.",
      suggestionsTitle: "Try one of these",
      suggestions: [
        "John 3:16",
        "Faith during trials",
        "Grace and salvation",
        "Matthew 5:1-12",
      ],
      recentTitle: "Recent searches",
      recentEmpty: "Your recent searches will appear here.",
      notesTitle: "Saved notes",
      notesEmpty: "Saved study notes will appear here.",
      clearRecent: "Clear all",
      delete: "Delete",
      justNow: "Just now",
      feature1Title: "Search Scripture",
      feature1Desc:
        "Find a verse, passage, or topic and get a clear, structured response.",
      feature2Title: "Save Insights",
      feature2Desc:
        "Keep valuable study responses and revisit them later as notes.",
      feature3Title: "Resume Quickly",
      feature3Desc:
        "Reopen recent searches without typing everything again.",
    },
  },
};

const RECENT_SEARCHES_KEY = "faithlight_recent_searches";
const SAVED_NOTES_KEY = "faithlight_saved_notes";

function getT(language) {
  return translations[language] ?? translations.en;
}

function formatRelativeTime(ts, language) {
  const diff = Date.now() - ts;
  const t = getT(language);
  if (diff < 60_000) return t.support.justNow;
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

function useCopyText() {
  const [copied, setCopied] = useState(false);
  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };
  return { copied, copy };
}

function SectionCard({ title, icon, children, tone = "default" }) {
  const toneClasses = {
    default: "border-slate-200 bg-white",
    violet: "border-violet-200 bg-violet-50/60",
    amber: "border-amber-200 bg-amber-50/70",
    indigo: "border-indigo-200 bg-indigo-50/70",
    green: "border-emerald-200 bg-emerald-50/70",
  };

  return (
    <div className={`rounded-[28px] border p-6 shadow-sm ${toneClasses[tone]}`}>
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 text-violet-700 shadow-sm">
          {icon}
        </div>
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      </div>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function Chip({ children }) {
  return (
    <span className="rounded-full bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm ring-1 ring-slate-200">
      {children}
    </span>
  );
}

function BulletList({ items, color = "slate" }) {
  const dotColor = {
    slate: "bg-slate-500",
    violet: "bg-violet-500",
    amber: "bg-amber-500",
    indigo: "bg-indigo-500",
    green: "bg-emerald-500",
  }[color];

  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li key={`${item}-${i}`} className="flex items-start gap-3">
          <span className={`mt-2 h-2.5 w-2.5 rounded-full ${dotColor}`} />
          <span className="text-slate-700 leading-7">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function LoadingCard({ language }) {
  const t = getT(language);
  return (
    <div className="mt-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3 text-violet-700">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="font-medium">{t.loading}</span>
      </div>
      <div className="mt-6 animate-pulse space-y-4">
        <div className="h-8 w-3/4 rounded-2xl bg-slate-200" />
        <div className="h-4 w-full rounded-xl bg-slate-100" />
        <div className="h-4 w-5/6 rounded-xl bg-slate-100" />
        <div className="h-32 rounded-3xl bg-slate-100" />
      </div>
    </div>
  );
}

function ErrorCard({ error, language }) {
  const t = getT(language);
  return (
    <div className="mt-6 rounded-[28px] border border-red-200 bg-red-50 p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" />
        <div>
          <h3 className="text-lg font-bold text-red-800">{t.errorTitle}</h3>
          <p className="mt-1 text-red-700">{error}</p>
        </div>
      </div>
    </div>
  );
}

function WarningsCard({ items, language }) {
  const t = getT(language);
  if (!items || items.length === 0) return null;
  return (
    <SectionCard
      title={t.response.warnings}
      icon={<AlertTriangle className="h-5 w-5" />}
      tone="amber"
    >
      <BulletList items={items} color="amber" />
    </SectionCard>
  );
}

function PremiumHeader({ title, summary, fullText, language }) {
  const t = getT(language);
  const { copied, copy } = useCopyText();

  return (
    <div className="rounded-[32px] bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-6 text-white shadow-lg md:p-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm">
            <Sparkles className="h-4 w-4" />
            <span>FaithLight AI</span>
          </div>

          <h2 className="mt-4 text-2xl font-bold leading-tight md:text-4xl">
            {title}
          </h2>

          <p className="mt-4 max-w-2xl text-white/90 leading-7">{summary}</p>
        </div>

        <button
          type="button"
          onClick={() => copy(fullText)}
          className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-3 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
        >
          <Copy className="h-4 w-4" />
          {copied ? t.actions.copied : t.actions.copy}
        </button>
      </div>
    </div>
  );
}

function AIResponseCards({ result, isLoading, error, language }) {
  const t = getT(language);

  if (isLoading) return <LoadingCard language={language} />;
  if (error) return <ErrorCard error={error} language={language} />;
  if (!result) return null;

  const fullText =
    result.type === "studyPlans"
      ? [
          result.title,
          result.summary,
          ...result.days.flatMap((d) => [d.day, d.title, d.reading, d.reflection, d.prayer]),
          ...result.keyVerses,
          ...(result.warnings || []),
        ].join("\n\n")
      : result.type === "passages"
      ? [
          result.title,
          result.summary,
          result.context,
          ...result.keyThemes,
          ...result.application,
          result.prayer,
          ...(result.warnings || []),
        ].join("\n\n")
      : [
          result.title,
          result.summary,
          result.explanation,
          ...result.supportingPassages,
          ...result.practicalApplication,
          ...(result.cautions || []),
          ...(result.warnings || []),
        ].join("\n\n");

  return (
    <div className="mt-6">
      <PremiumHeader
        title={result.title}
        summary={result.summary}
        fullText={fullText}
        language={language}
      />

      {result.type === "studyPlans" && (
        <div className="mt-6 space-y-5">
          <SectionCard
            title={t.response.studyPlanDaily}
            icon={<BookOpen className="h-5 w-5" />}
          >
            <div className="grid gap-4">
              {result.days.map((day, index) => (
                <div
                  key={`${day.day}-${index}`}
                  className="rounded-[24px] border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="inline-flex rounded-full bg-violet-100 px-3 py-1 text-sm font-semibold text-violet-700">
                        {day.day}
                      </div>
                      <h4 className="mt-3 text-xl font-bold text-slate-900">
                        {day.title}
                      </h4>
                    </div>
                    <div className="rounded-2xl bg-white px-4 py-2 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200">
                      {t.response.reading}: {day.reading}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                      <p className="text-sm font-semibold text-slate-500">
                        {t.response.reflection}
                      </p>
                      <p className="mt-2 leading-7 text-slate-700">
                        {day.reflection}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-violet-50 p-4 ring-1 ring-violet-200">
                      <p className="text-sm font-semibold text-violet-700">
                        {t.response.prayer}
                      </p>
                      <p className="mt-2 leading-7 text-violet-900">{day.prayer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title={t.response.keyVerses}
            icon={<Quote className="h-5 w-5" />}
            tone="indigo"
          >
            <div className="flex flex-wrap gap-2">
              {result.keyVerses.map((verse, i) => (
                <Chip key={`${verse}-${i}`}>{verse}</Chip>
              ))}
            </div>
          </SectionCard>

          <WarningsCard items={result.warnings} language={language} />
        </div>
      )}

      {result.type === "passages" && (
        <div className="mt-6 space-y-5">
          <SectionCard
            title={t.response.context}
            icon={<BookOpen className="h-5 w-5" />}
          >
            <p className="leading-8 text-slate-700">{result.context}</p>
          </SectionCard>

          <div className="grid gap-5 lg:grid-cols-2">
            <SectionCard
              title={t.response.keyThemes}
              icon={<Lightbulb className="h-5 w-5" />}
              tone="indigo"
            >
              <BulletList items={result.keyThemes} color="indigo" />
            </SectionCard>

            <SectionCard
              title={t.response.application}
              icon={<Target className="h-5 w-5" />}
              tone="green"
            >
              <BulletList items={result.application} color="green" />
            </SectionCard>
          </div>

          <SectionCard
            title={t.response.prayer}
            icon={<Sparkles className="h-5 w-5" />}
            tone="violet"
          >
            <p className="leading-8 text-slate-800">{result.prayer}</p>
          </SectionCard>

          <WarningsCard items={result.warnings} language={language} />
        </div>
      )}

      {result.type === "theology" && (
        <div className="mt-6 space-y-5">
          <SectionCard
            title={t.response.explanation}
            icon={<BookOpen className="h-5 w-5" />}
          >
            <p className="leading-8 text-slate-700">{result.explanation}</p>
          </SectionCard>

          <div className="grid gap-5 lg:grid-cols-2">
            <SectionCard
              title={t.response.supportingPassages}
              icon={<Quote className="h-5 w-5" />}
              tone="indigo"
            >
              <div className="flex flex-wrap gap-2">
                {result.supportingPassages.map((passage, i) => (
                  <Chip key={`${passage}-${i}`}>{passage}</Chip>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title={t.response.practicalApplication}
              icon={<CheckCircle2 className="h-5 w-5" />}
              tone="green"
            >
              <BulletList items={result.practicalApplication} color="green" />
            </SectionCard>
          </div>

          {result.cautions?.length ? (
            <SectionCard
              title={t.response.cautions}
              icon={<AlertTriangle className="h-5 w-5" />}
              tone="amber"
            >
              <BulletList items={result.cautions} color="amber" />
            </SectionCard>
          ) : null}

          <WarningsCard items={result.warnings} language={language} />
        </div>
      )}
    </div>
  );
}

function PremiumEmptyState({ language, onSuggestionClick }) {
  const t = getT(language);

  return (
    <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="rounded-[28px] bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-8 text-white">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm">
          <Sparkles className="h-4 w-4" />
          <span>{t.support.emptyBadge}</span>
        </div>

        <h3 className="mt-4 text-3xl font-bold leading-tight md:text-4xl">
          {t.support.emptyTitle}
        </h3>

        <p className="mt-4 max-w-2xl text-white/90 leading-7">
          {t.support.emptySubtitle}
        </p>
      </div>

      <div className="mt-6">
        <h4 className="text-lg font-bold text-slate-900">
          {t.support.suggestionsTitle}
        </h4>

        <div className="mt-4 flex flex-wrap gap-3">
          {t.support.suggestions.map((item) => (
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
      </div>
    </div>
  );
}

function RecentSearchesCard({ language, items, onItemClick, onClear }) {
  const t = getT(language);

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
            <Clock3 className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            {t.support.recentTitle}
          </h3>
        </div>

        {items.length > 0 ? (
          <button
            type="button"
            onClick={onClear}
            className="text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            {t.support.clearRecent}
          </button>
        ) : null}
      </div>

      {items.length === 0 ? (
        <p className="mt-5 text-sm text-slate-500">{t.support.recentEmpty}</p>
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
  language,
  items,
  onSave,
  onDelete,
  canSave,
  savedStateLabel,
}) {
  const t = getT(language);

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
            <FolderHeart className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">{t.support.notesTitle}</h3>
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
        <p className="mt-5 text-sm text-slate-500">{t.support.notesEmpty}</p>
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
                  {t.support.delete}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AIEnhancedBibleStudyPremiumPage({
  language = "en",
  initialTab = "theology",
  onBack,
}) {
  const t = getT(language);

  const [provider, setProvider] = useState("openai");
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedTopic, setSelectedTopic] = useState(t.theology.topics[0] ?? "");
  const [customTopic, setCustomTopic] = useState("");

  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [recentSearches, setRecentSearches] = useState([]);
  const [savedNotes, setSavedNotes] = useState([]);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    try {
      const recentRaw = localStorage.getItem(RECENT_SEARCHES_KEY);
      const notesRaw = localStorage.getItem(SAVED_NOTES_KEY);
      if (recentRaw) setRecentSearches(JSON.parse(recentRaw));
      if (notesRaw) setSavedNotes(JSON.parse(notesRaw));
    } catch {}
  }, []);

  const effectiveTopic = customTopic.trim() || selectedTopic;

  const activePlaceholder = useMemo(() => {
    return t.placeholders[activeTab];
  }, [activeTab, t]);

  const persistRecentSearch = (item) => {
    setRecentSearches((prev) => {
      const deduped = [
        item,
        ...prev.filter((x) => !(x.label === item.label && x.tab === item.tab)),
      ].slice(0, 8);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(deduped));
      return deduped;
    });
  };

  const handleGenerate = async () => {
    const currentValue = activeTab === "theology" ? effectiveTopic : query.trim();
    if (!currentValue) return;

    setIsLoading(true);
    setError("");
    setResult(null);

    const recentItem = {
      id: `${activeTab}-${currentValue}-${Date.now()}`,
      label: currentValue,
      tab: activeTab,
      topic: activeTab === "theology" ? effectiveTopic : undefined,
      createdAt: Date.now(),
    };
    persistRecentSearch(recentItem);

    try {
      const response = await fetch("/api/ai-bible-study", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider,
          language,
          tab: activeTab,
          query: query.trim(),
          topic: effectiveTopic,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || data?.detail || "Request failed");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to generate a response right now.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setCustomTopic("");
    setSelectedTopic(t.theology.topics[0] ?? "");
    setResult(null);
    setError("");
  };

  const handleUseRecentSearch = (item) => {
    setActiveTab(item.tab);
    if (item.tab === "theology") {
      setSelectedTopic(item.topic || item.label);
      setCustomTopic("");
      setQuery("");
    } else {
      setQuery(item.label);
      setCustomTopic("");
    }
  };

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
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
              aria-label={t.back}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}

          <div>
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
              {t.pageTitle}
            </h1>
            <p className="mt-1 text-sm text-slate-600 md:text-base">
              {t.subtitle}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-[32px] bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-6 text-white shadow-lg md:p-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm">
            <Sparkles className="h-4 w-4" />
            <span>FaithLight AI</span>
          </div>

          <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
            {t.pageTitle}
          </h2>

          <div className="mt-6 grid gap-3 md:grid-cols-[1fr,220px,auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="h-14 w-full rounded-2xl border-0 bg-white text-slate-900 outline-none pl-12 pr-4"
              />
            </div>

            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="h-14 rounded-2xl border-0 bg-white px-4 text-slate-900 outline-none"
              aria-label={t.providerLabel}
            >
              <option value="openai">OpenAI</option>
              <option value="claude">Claude</option>
            </select>

            <button
              type="button"
              onClick={handleGenerate}
              className="h-14 rounded-2xl bg-slate-900 px-6 font-semibold text-white transition hover:bg-slate-800"
            >
              {t.searchButton}
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 rounded-2xl bg-slate-100 p-1">
          {["studyPlans", "passages", "theology"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-xl px-4 py-3 text-sm md:text-base font-medium transition-colors ${
                activeTab === tab
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {t.tabs[tab]}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.05fr,1.35fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            {activeTab === "theology" && (
              <>
                <h2 className="text-2xl font-bold text-slate-900">
                  {t.theology.title}
                </h2>
                <p className="mt-2 text-slate-600">{t.theology.subtitle}</p>

                <div className="mt-8">
                  <label className="block text-lg font-semibold text-slate-800">
                    {t.theology.topicLabel}
                  </label>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {t.theology.topics.map((topic) => (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => {
                          setSelectedTopic(topic);
                          setCustomTopic("");
                        }}
                        className={`rounded-xl border px-4 py-4 text-base transition-colors text-left ${
                          customTopic.trim() === "" && selectedTopic === topic
                            ? "border-violet-500 bg-violet-50 text-violet-700"
                            : "border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100"
                        }`}
                      >
                        {topic}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    placeholder={t.theology.customTopicPlaceholder}
                    className="mt-5 h-14 w-full rounded-xl border border-slate-300 px-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </>
            )}

            {activeTab === "studyPlans" && (
              <>
                <h2 className="text-2xl font-bold text-slate-900">
                  {t.tabs.studyPlans}
                </h2>
                <p className="mt-2 text-slate-600">{t.placeholders.studyPlans}</p>

                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t.placeholders.studyPlans}
                  className="mt-6 min-h-[140px] w-full rounded-xl border border-slate-300 px-4 py-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </>
            )}

            {activeTab === "passages" && (
              <>
                <h2 className="text-2xl font-bold text-slate-900">
                  {t.tabs.passages}
                </h2>
                <p className="mt-2 text-slate-600">{t.placeholders.passages}</p>

                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t.placeholders.passages}
                  className="mt-6 min-h-[140px] w-full rounded-xl border border-slate-300 px-4 py-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </>
            )}

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleGenerate}
                className="h-12 rounded-xl bg-violet-600 px-5 text-white font-semibold hover:bg-violet-700 transition-colors"
              >
                {t.actions.generate}
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="h-12 rounded-xl border border-slate-300 px-5 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              >
                {t.actions.clear}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <AIResponseCards
              result={result}
              isLoading={isLoading}
              error={error}
              language={language}
            />

            {!result && !isLoading && !error ? (
              <PremiumEmptyState
                language={language}
                onSuggestionClick={(value) =>
                  handleUseRecentSearch({
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
                onItemClick={handleUseRecentSearch}
                onClear={handleClearRecent}
              />

              <SavedNotesCard
                language={language}
                items={savedNotes}
                onSave={handleSaveNote}
                onDelete={handleDeleteNote}
                canSave={!!result}
                savedStateLabel={savedFlash ? t.actions.saved : t.actions.save}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}