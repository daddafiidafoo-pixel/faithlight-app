import React, { useMemo, useState } from "react";
import LanguageSelector from "../components/LanguageSelector";
import { useLanguage } from "../components/i18n/LanguageProvider";

export default function CommunityPrayerBoard() {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = useMemo(
    () => [
      "all",
      "health",
      "family",
      "faith",
      "work",
      "relationships",
      "gratitude",
      "other"
    ],
    []
  );

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex justify-end">
          <div className="w-full max-w-xs">
            <LanguageSelector />
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {t("communityPrayerBoard.title", "Prayer Board")}
          </h1>
          <p className="mt-2 text-gray-600">
            {t("communityPrayerBoard.subtitle", "Lift each other up in prayer")}
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {categories.map((category) => {
            const isActive = activeCategory === category;

            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={[
                  "rounded-full px-4 py-2 text-sm font-medium transition",
                  isActive
                    ? "bg-blue-600 text-white"
                    : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                ].join(" ")}
              >
                {t(`communityPrayerBoard.categories.${category}`, category)}
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {t("communityPrayerBoard.title", "Prayer Board")}
            </h2>

            <button
              type="button"
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              {t("communityPrayerBoard.request", "Request")}
            </button>
          </div>

          <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
            <p className="text-lg font-semibold text-gray-800">
              {t("communityPrayerBoard.emptyState.title", "No prayer requests yet")}
            </p>
            <p className="mt-2 text-gray-600">
              {t("communityPrayerBoard.emptyState.subtitle", "Be the first to share a need")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}