import React from "react";
import { Languages, BookOpen, Mic, Heart } from "lucide-react";

const TASKS = [
  { id: "translate", icon: Languages, labelKey: "translate" },
  { id: "explain_scripture", icon: BookOpen, labelKey: "explainScripture" },
  { id: "sermon_outline", icon: Mic, labelKey: "sermonOutline" },
  { id: "prayer_generation", icon: Heart, labelKey: "prayerGeneration" },
];

const TASK_LABELS = {
  en: { translate: "Translate", explainScripture: "Explain", sermon_outline: "Sermon", prayerGeneration: "Prayer" },
  om: { translate: "Hiiki", explainScripture: "Ibsi", sermon_outline: "Lallaba", prayerGeneration: "Kadhannaa" },
  am: { translate: "ተርጉም", explainScripture: "አብራራ", sermon_outline: "ስብከት", prayerGeneration: "ጸሎት" },
  ar: { translate: "ترجم", explainScripture: "اشرح", sermon_outline: "موعظة", prayerGeneration: "صلاة" },
  sw: { translate: "Tafsiri", explainScripture: "Eleza", sermon_outline: "Hotuba", prayerGeneration: "Sala" },
  fr: { translate: "Traduire", explainScripture: "Expliquer", sermon_outline: "Sermon", prayerGeneration: "Prière" },
  ti: { translate: "ተርጉም", explainScripture: "ኣብራህ", sermon_outline: "ስብከት", prayerGeneration: "ጸሎት" },
};

export default function AITaskTabs({ value, onChange, language = "en" }) {
  const labels = TASK_LABELS[language] || TASK_LABELS.en;

  return (
    <div className="flex gap-1 bg-gray-100 rounded-2xl p-1">
      {TASKS.map(({ id, icon: Icon, labelKey }) => {
        const label = labels[labelKey] || labels[id] || id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-sm font-semibold transition-all min-h-[44px] ${
              value === id
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icon size={15} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}