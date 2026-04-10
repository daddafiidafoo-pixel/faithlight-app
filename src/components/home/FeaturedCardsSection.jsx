import React from "react";
import { Sparkles, AudioLines, Bookmark } from "lucide-react";

function FeatureCard({ icon: Icon, title, subtitle, action, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm transition hover:translate-y-[-1px]"
    >
      <div className="flex items-start justify-between gap-3 w-full">
        <div className="flex gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
            <Icon className="h-5 w-5" />
          </div>
          <div className="text-left">
            <p className="text-base font-semibold text-slate-900">{title}</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">{subtitle}</p>
          </div>
        </div>
        <div className="rounded-full bg-purple-50 px-3 py-2 text-xs font-semibold text-purple-700 whitespace-nowrap">
          {action}
        </div>
      </div>
    </button>
  );
}

export default function FeaturedCardsSection({ t = {}, navigate = () => {} }) {
  return (
    <section className="space-y-3">
      <h3 className="text-lg font-semibold text-slate-900">Featured</h3>
      <div className="space-y-3">
        <FeatureCard
          icon={Sparkles}
          title={t.todayDevotional || "Today's Devotional"}
          subtitle="Find light for everyday life."
          action={t.readNow || "Read Now"}
          onClick={() => navigate("/daily-devotional")}
        />
        <FeatureCard
          icon={AudioLines}
          title={t.prayerOfDay || "Prayer of the Day"}
          subtitle="A guided prayer prepared for today."
          action={t.open || "Open"}
          onClick={() => navigate("/prayer-journal")}
        />
        <FeatureCard
          icon={Bookmark}
          title={t.biblePlan || "Bible Plan"}
          subtitle="Continue your reading plan this week."
          action={t.startNow || "Start"}
          onClick={() => navigate("/ReadingPlans")}
        />
      </div>
    </section>
  );
}