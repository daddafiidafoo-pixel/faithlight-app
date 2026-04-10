import React from "react";
import { Search, Sparkles } from "lucide-react";

export default function HeroSearchSection({ t = {}, navigate = () => {} }) {
  return (
    <section className="overflow-hidden rounded-[28px] bg-gradient-to-br from-purple-700 via-violet-600 to-indigo-600 p-5 text-white shadow-[0_20px_50px_rgba(88,28,135,0.22)]">
      <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide text-purple-50">
        <Sparkles className="h-3.5 w-3.5" />
        {t.searchTitle || "Search Scripture"}
      </div>

      <h2 className="max-w-[16rem] text-[1.7rem] font-bold leading-tight">
        {t.searchHeadline || "Find comfort, truth, and hope."}
      </h2>
      <p className="mt-2 max-w-[18rem] text-sm leading-6 text-purple-100">
        {t.searchSubtext || "Search verses, prayers, and devotionals in your language."}
      </p>

      <div className="mt-5 flex gap-2">
        <div className="flex flex-1 items-center rounded-2xl bg-white px-4 py-3 shadow-sm">
          <Search className="mr-2 h-4 w-4 text-slate-400" />
          <input
            placeholder={t.searchPlaceholder || "Search verses, topics, prayers..."}
            className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
          />
        </div>
        <button
          onClick={() => navigate("/BibleSearch")}
          className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-purple-700 shadow-sm transition hover:scale-[0.99] active:scale-95"
        >
          {t.searchButton || "Search"}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {["Hope", "Faith", "Love", "Healing"].map((tag) => (
          <button
            key={tag}
            className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-white/95 transition hover:bg-white/20"
          >
            {tag}
          </button>
        ))}
      </div>
    </section>
  );
}