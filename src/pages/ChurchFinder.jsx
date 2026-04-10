import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  Search,
  Star,
  List,
  Map as MapIcon,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from "lucide-react";
import { translations } from "@/lib/translations";
import { useLanguageStore } from "@/stores/languageStore";

export default function ChurchFinder() {
  const uiLanguage = useLanguageStore(s => s.uiLanguage);
  const page = translations[uiLanguage]?.churchFinder || translations.en.churchFinder;

  const [searchQuery, setSearchQuery] = useState("");
  const [activeDenomination, setActiveDenomination] = useState(page.all);
  const [viewMode, setViewMode] = useState("list");

  const churches = [];

  const denominations = [
    page.all,
    page.baptist,
    page.catholic,
    page.lutheran,
    page.methodist,
    page.pentecostal,
    page.presbyterian,
  ];

  const filteredChurches = useMemo(() => {
    let filtered = churches;

    if (activeDenomination !== page.all) {
      filtered = filtered.filter(
        (church) => church.denomination === activeDenomination
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (church) =>
          church.name.toLowerCase().includes(q) ||
          church.city.toLowerCase().includes(q) ||
          church.denomination.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [churches, activeDenomination, searchQuery, page.all]);

  const handleSearch = () => {
    console.log("Searching for:", searchQuery);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="flex items-center justify-between gap-4 px-6 py-4 border-b">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">{page.pageTitle}</h1>
        </div>

        <div className="text-sm font-medium">
          {uiLanguage === "om" ? "Afaan filadhu" : "Select language"}
        </div>
      </div>

      <div className="p-6">
        <div className="rounded-2xl overflow-hidden bg-slate-50">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-10 text-white">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-start gap-3">
                <MapPin className="w-8 h-8 mt-1" />
                <div>
                  <h2 className="text-4xl font-bold">{page.heroTitle}</h2>
                  <p className="mt-2 text-white/90 text-lg">
                    {page.heroSubtitle}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={page.searchPlaceholder}
                    className="w-full h-14 pl-12 pr-4 rounded-xl border-2 border-slate-200 text-slate-900 outline-none focus:ring-2 focus:ring-white"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSearch}
                  className="h-14 px-6 rounded-xl bg-white text-indigo-700 font-semibold hover:opacity-95"
                >
                  {page.searchButton}
                </button>
              </div>
            </div>
          </div>

          <div className="px-6 py-5">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                <button
                  type="button"
                  className="shrink-0 px-5 py-3 rounded-full border bg-white text-slate-700 flex items-center gap-2"
                >
                  <Star className="w-4 h-4" />
                  {page.favorites} (0)
                </button>

                {denominations.map((item) => {
                  const active = activeDenomination === item;
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setActiveDenomination(item)}
                      className={`shrink-0 px-5 py-3 rounded-full border transition ${
                        active
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2 text-slate-400">
                  <ChevronLeft className="w-4 h-4" />
                  <div className="h-3 w-64 rounded-full bg-slate-300" />
                  <ChevronRight className="w-4 h-4" />
                </div>

                <div className="inline-flex rounded-xl bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                      viewMode === "list"
                        ? "bg-white text-indigo-700 shadow-sm"
                        : "text-slate-600"
                    }`}
                  >
                    <List className="w-4 h-4" />
                    {page.list}
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewMode("map")}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                      viewMode === "map"
                        ? "bg-white text-indigo-700 shadow-sm"
                        : "text-slate-600"
                    }`}
                  >
                    <MapIcon className="w-4 h-4" />
                    {page.map}
                  </button>
                </div>
              </div>

              <p className="mt-6 text-slate-700">
                {filteredChurches.length} {page.churchesFound}
              </p>

              {filteredChurches.length === 0 ? (
                <div className="mt-6 rounded-2xl bg-white border min-h-[320px] flex flex-col items-center justify-center text-center px-6">
                  <MapPin className="w-12 h-12 text-slate-300 mb-4" />
                  <h3 className="text-3xl font-medium text-slate-600">
                    {page.noChurchesFound}
                  </h3>
                  <p className="mt-3 text-slate-400">
                    {page.tryAdjustingFilters}
                  </p>
                </div>
              ) : (
                <div className="mt-6 grid gap-4">
                  {filteredChurches.map((church) => (
                    <div
                      key={church.id}
                      className="rounded-2xl border bg-white p-5"
                    >
                      <h3 className="text-xl font-semibold">{church.name}</h3>
                      <p className="text-slate-600 mt-1">{church.city}</p>
                      <p className="text-slate-500 mt-1">
                        {church.denomination}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}