import React, { useState, useEffect } from 'react';
import { useAppStore } from "./store/appStore";
import { useI18n } from "./i18n/provider";
import { getVerseOfDay } from "../lib/bibleApi";

export function VerseOfDayCard() {
  const { uiLanguage, bibleLanguage } = useAppStore();
  const { t } = useI18n();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    getVerseOfDay({ uiLanguage, bibleLanguage })
      .then((d) => mounted && setData(d))
      .catch((e) => mounted && setError(e.message));
    return () => {
      mounted = false;
    };
  }, [uiLanguage, bibleLanguage]);

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide">{t("home.verseOfDay")}</div>
      {error ? <div className="text-sm text-red-600">{error}</div> : null}
      {data ? (
        <>
          <div className="mb-2 font-semibold">{data.bookName} {data.chapter}:{data.verse}</div>
          <div className="leading-7">{data.text}</div>
        </>
      ) : null}
    </div>
  );
}