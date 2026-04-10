import React, { useMemo, useState, useEffect } from "react";
import LanguageSelector from "@/components/LanguageSelector";
import BibleVersionSelector from "@/components/BibleVersionSelector";
import BibleComingSoon from "@/components/BibleComingSoon";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { isBibleComingSoon } from "@/lib/bibleAvailability";
import { resolveReaderLanguage, BIBLE_TEXT_CONFIG } from "@/lib/bibleTextResolvers";

const MOCK_ENGLISH_RESULTS = [
  {
    id: "john-3-16",
    reference: "John 3:16",
    text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life."
  },
  {
    id: "psalm-23-1",
    reference: "Psalm 23:1",
    text: "The Lord is my shepherd, I lack nothing."
  },
  {
    id: "phil-4-6",
    reference: "Philippians 4:6",
    text: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God."
  }
];

function SearchResultCard({ reference, text, onOpenVerse, t }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-gray-900">{reference}</h3>
          <p className="mt-2 text-sm leading-6 text-gray-700">{text}</p>
        </div>

        <button
          type="button"
          onClick={onOpenVerse}
          className="shrink-0 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          {t("bibleSearch.open", "Open")}
        </button>
      </div>
    </div>
  );
}

export default function BibleSearchPage() {
  const { language, t } = useLanguage();

  const resolvedLanguage = resolveReaderLanguage(language);
  const [bibleLanguage, setBibleLanguage] = useState(resolvedLanguage);
  const [query, setQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // Sync bible language when app language changes
  useEffect(() => {
    setBibleLanguage(resolveReaderLanguage(language));
  }, [language]);

  const trimmedQuery = query.trim();

  const results = useMemo(() => {
    if (!trimmedQuery || bibleLanguage !== "en") {
      return [];
    }

    const normalizedQuery = trimmedQuery.toLowerCase();

    return MOCK_ENGLISH_RESULTS.filter((item) => {
      return (
        item.reference.toLowerCase().includes(normalizedQuery) ||
        item.text.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [trimmedQuery, bibleLanguage]);

  const handleSearch = (event) => {
    event.preventDefault();
    setHasSearched(true);
  };

  const showBibleComingSoon = isBibleComingSoon(bibleLanguage);

  if (showBibleComingSoon) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <LanguageSelector showHelperText />
            <BibleVersionSelector
              value={bibleLanguage}
              onChange={setBibleLanguage}
            />
          </div>

          <BibleComingSoon
            title={t(
              "bibleComingSoon.searchTitle",
              "Afaan Oromoo Bible Search Coming Soon"
            )}
            message={t(
              "bibleComingSoon.searchMessage",
              "Bible search in Afaan Oromoo is not available yet because the Bible source is still being connected."
            )}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {t("bibleSearch.title")}
          </h1>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            {t("bibleSearch.description")}
          </p>
        </header>

        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <LanguageSelector showHelperText />
          <BibleVersionSelector
            value={bibleLanguage}
            onChange={setBibleLanguage}
          />
        </div>

        {(language === "om" || language === "hae" || language === "gaz") && !BIBLE_TEXT_CONFIG[bibleLanguage]?.hasOT && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            {t("bibleSearch.englishBibleNotice")}
          </div>
        )}

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <form onSubmit={handleSearch}>
            <label
              htmlFor="bible-search-input"
              className="mb-2 block text-sm font-medium text-gray-800"
            >
              {t("bibleSearch.searchLabel")}
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="bible-search-input"
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("bibleSearch.searchPlaceholder")}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />

              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                {t("bibleSearch.searchButton")}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6">
          {!hasSearched ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center">
              <p className="text-lg font-semibold text-gray-800">
                {t("bibleSearch.startTitle")}
              </p>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                {t("bibleSearch.startDescription")}
              </p>
            </div>
          ) : trimmedQuery && results.length > 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                {t("bibleSearch.resultsCount")}: {results.length}
              </p>

              {results.map((result) => (
                <SearchResultCard
                  key={result.id}
                  reference={result.reference}
                  text={result.text}
                  t={t}
                  onOpenVerse={() => {
                    console.log("Open verse:", result.reference);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white px-6 py-10 text-center shadow-sm">
              <p className="text-lg font-semibold text-gray-800">
                {t("bibleSearch.noResultsTitle")}
              </p>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                {t("bibleSearch.noResultsDescription")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}