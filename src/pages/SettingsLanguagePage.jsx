import React, { useMemo, useState } from "react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { getSupportedLanguages, saveLanguage } from "@/lib/languageDetection";

export default function SettingsLanguagePage() {
  const { language, setLanguage, t } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [saveState, setSaveState] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const languages = useMemo(() => getSupportedLanguages(), []);

  const handleSave = async () => {
    try {
      setSaveState("saving");
      setErrorMessage("");
      saveLanguage(selectedLanguage);
      setLanguage(selectedLanguage);
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2000);
    } catch (error) {
      console.error("Failed to change app language:", error);
      setSaveState("error");
      setErrorMessage("Unable to save language. Please try again.");
    }
  };

  const hasChanged = selectedLanguage !== language;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6">
          <p className="mb-2 text-sm font-medium text-blue-600">Settings</p>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Language</h1>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Choose the language you want to use throughout the app.
          </p>
        </header>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
          <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
            <h2 className="text-base font-semibold text-gray-900">App Language</h2>
            <p className="mt-1 text-sm text-gray-600">
              Your selected language will be saved and used every time you open the app.
            </p>
          </div>

          <div className="space-y-5 px-5 py-5 sm:px-6">
            <div>
              <label htmlFor="app-language" className="mb-2 block text-sm font-medium text-gray-800">
                Select language
              </label>
              <select
                id="app-language"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm font-medium text-gray-800">Current language</p>
              <p className="mt-1 text-sm text-gray-600">
                {languages.find((lang) => lang.code === language)?.label || "English"}
              </p>
            </div>

            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-sm font-medium text-blue-900">Note</p>
              <p className="mt-1 text-sm leading-6 text-blue-800">
                Automatic language detection is used on first launch, but your manual selection will always be saved and preferred afterwards.
              </p>
            </div>

            {saveState === "error" && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            {saveState === "saved" && (
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                Language updated successfully.
              </div>
            )}

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <button
                type="button"
                onClick={handleSave}
                disabled={!hasChanged || saveState === "saving"}
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {saveState === "saving" ? "Saving..." : "Save changes"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedLanguage(language);
                  setSaveState("idle");
                  setErrorMessage("");
                }}
                disabled={!hasChanged || saveState === "saving"}
                className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}