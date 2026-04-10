import React from "react";
import { BookOpen, Heart, CalendarDays, Headphones, Globe } from "lucide-react";

function QuickActionCard({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex min-h-[102px] flex-col items-center justify-center rounded-[22px] border border-slate-200 bg-white p-4 text-center shadow-sm transition hover:translate-y-[-1px] active:scale-[0.98]"
    >
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-100 text-purple-700">
        <Icon className="h-5 w-5" />
      </div>
      <span className="text-sm font-medium text-slate-700">{label}</span>
    </button>
  );
}

export default function QuickActionsGrid({ t = {}, navigate = () => {} }) {
  const labels = {
    bible: t.bible || "Bible",
    prayer: t.prayer || "Prayer",
    devotional: t.devotional || "Devotional",
    favorites: t.favorites || "Favorites",
    languages: t.languages || "Languages",
    audio: t.audio || "Audio",
  };

  return (
    <section className="space-y-3">
      <h3 className="text-lg font-semibold text-slate-900">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        <QuickActionCard
          icon={BookOpen}
          label={labels.bible}
          onClick={() => navigate("/BibleReaderPage")}
        />
        <QuickActionCard
          icon={Heart}
          label={labels.prayer}
          onClick={() => navigate("/prayer-journal")}
        />
        <QuickActionCard
          icon={CalendarDays}
          label={labels.devotional}
          onClick={() => navigate("/daily-devotional")}
        />
        <QuickActionCard
          icon={Heart}
          label={labels.favorites}
          onClick={() => navigate("/Saved")}
        />
        <QuickActionCard
          icon={Globe}
          label={labels.languages}
          onClick={() => navigate("/SettingsLanguage")}
        />
        <QuickActionCard
          icon={Headphones}
          label={labels.audio}
          onClick={() => navigate("/AudioBiblePage")}
        />
      </div>
    </section>
  );
}