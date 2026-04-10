import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAppStore } from "../components/store/appStore";
import { useI18n } from "../components/i18n/provider";
import ExportSection from "../components/prayer/ExportSection";
import ReminderSection from "../components/prayer/ReminderSection";

export default function PrayerAssistantPage() {
  const { uiLanguage } = useAppStore();
  const { t } = useI18n();
  const [topic, setTopic] = useState("");
  const [generatedPrayer, setGeneratedPrayer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [journal, setJournal] = useState([]);
  const [active, setActive] = useState([]);
  const [answered, setAnswered] = useState([]);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("faithlight.prayers");
    if (saved) setJournal(JSON.parse(saved));
    const requests = localStorage.getItem("faithlight.prayerRequests");
    if (requests) {
      const all = JSON.parse(requests);
      setActive(all.filter((r) => r.status === "active"));
      setAnswered(all.filter((r) => r.status === "answered"));
    }
  }, []);

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    setError("");
    try {
      const response = await base44.functions.invoke('prayerGenerate', {
        topic,
        language: uiLanguage,
      });
      setGeneratedPrayer(response.data.prayer);
    } catch (e) {
      console.error(e);
      setError(t("prayer.generationError", "We couldn't generate a prayer right now. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrayer = () => {
    if (!generatedPrayer) return;
    const entry = {
      id: Date.now().toString(),
      topic,
      prayer: generatedPrayer,
      createdAt: new Date().toISOString(),
    };
    const updated = [...journal, entry];
    setJournal(updated);
    localStorage.setItem("faithlight.prayers", JSON.stringify(updated));
    setTopic("");
    setGeneratedPrayer("");
  };

  const handleAddRequest = () => {
    if (!topic) return;
    const request = {
      id: Date.now().toString(),
      title: topic,
      status: "active",
    };
    const updated = [...active, request];
    setActive(updated);
    localStorage.setItem("faithlight.prayerRequests", JSON.stringify([...updated, ...answered]));
    setTopic("");
    setGeneratedPrayer("");
  };

  const toggleStatus = (id) => {
    const request = active.find((r) => r.id === id);
    if (!request) return;
    setActive(active.filter((r) => r.id !== id));
    const answered_entry = { ...request, status: "answered", answeredAt: new Date().toISOString() };
    const updated = [...answered, answered_entry];
    setAnswered(updated);
    localStorage.setItem("faithlight.prayerRequests", JSON.stringify([...active.filter((r) => r.id !== id), ...updated]));
  };

  return (
    <div className="mx-auto max-w-5xl p-4">
      <h1 className="mb-4 text-2xl font-bold">{t("prayer.title")}</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <textarea
            className="min-h-32 w-full rounded-xl border p-3"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t("prayer.topicPlaceholder")}
          />
          <div className="mt-3 flex gap-2">
             <button className="rounded-xl bg-black px-4 py-2 text-white" onClick={handleGenerate} disabled={loading}>
               {loading ? t("prayer.generating", "Generating...") : t("prayer.generate")}
             </button>
             <button className="rounded-xl border px-4 py-2" onClick={handleSavePrayer}>{t("prayer.save")}</button>
             <button className="rounded-xl border px-4 py-2" onClick={handleAddRequest}>{t("prayer.requests")}</button>
           </div>
           {error && <div className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
           {generatedPrayer ? <div className="mt-4 whitespace-pre-line rounded-xl bg-gray-100 p-4 leading-7">{generatedPrayer}</div> : null}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-semibold">{t("prayer.journal")}</span>
              <ExportSection journal={journal} />
            </div>
            <div className="space-y-3">
              {journal.map((entry) => (
                <div key={entry.id} className="rounded-xl border p-3">
                  <div className="mb-1 font-medium">{entry.topic}</div>
                  <div className="whitespace-pre-line text-sm leading-6">{entry.prayer}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <div className="mb-3 font-semibold">{t("prayer.requests")}</div>
            <div className="space-y-3">
              {active.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between rounded-xl border p-3">
                  <div>
                    <div className="font-medium">{entry.title}</div>
                    <div className="text-sm text-gray-500">{t("prayer.active")}</div>
                  </div>
                  <button className="rounded-lg border px-3 py-2" onClick={() => toggleStatus(entry.id)}>{t("prayer.answered")}</button>
                </div>
              ))}
            </div>
            {answered.length > 0 ? (
              <div className="mt-4">
                <div className="mb-2 font-medium">{t("prayer.answered")}</div>
                <div className="space-y-3">
                  {answered.map((entry) => (
                    <div key={entry.id} className="rounded-xl border p-3">
                      <div className="font-medium">{entry.title}</div>
                      <div className="text-sm text-gray-500">{entry.answeredAt ? new Date(entry.answeredAt).toLocaleDateString() : ""}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <ReminderSection />
        </div>
      </div>
    </div>
  );
}