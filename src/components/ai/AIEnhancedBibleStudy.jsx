import React, { useState } from "react";
import AIStudyResponse from "./AIStudyResponse";
import { base44 } from "@/api/base44Client";

export default function AIEnhancedBibleStudy({
  language = "en",
  initialTab = "theology",
  onBack,
  onSearch,
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("");
  const [provider, setProvider] = useState("openai");
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const effectiveTopic = activeTab === "theology" ? topic : "";

  const handleSearch = async () => {
    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      let prompt, schema;

      if (activeTab === "theology") {
        prompt = `Explain the theology topic: "${query}"${effectiveTopic ? `, specifically focusing on "${effectiveTopic}"` : ""}. Cover key biblical references, major Christian perspectives, and practical implications. Language: ${language}.`;
        schema = {
          type: "object",
          properties: {
            type: { type: "string" },
            title: { type: "string" },
            summary: { type: "string" },
            explanation: { type: "string" },
            supportingPassages: { type: "array", items: { type: "string" } },
            practicalApplication: { type: "array", items: { type: "string" } },
            cautions: { type: "array", items: { type: "string" } },
          },
        };
      } else if (activeTab === "passages") {
        prompt = `Provide detailed insight for the Bible passage: "${query}". Include historical context, key themes, and practical application. Language: ${language}.`;
        schema = {
          type: "object",
          properties: {
            type: { type: "string" },
            title: { type: "string" },
            summary: { type: "string" },
            context: { type: "string" },
            keyThemes: { type: "array", items: { type: "string" } },
            application: { type: "array", items: { type: "string" } },
            prayer: { type: "string" },
          },
        };
      } else {
        prompt = `Create a 7-day Bible study plan on: "${query}". Language: ${language}.`;
        schema = {
          type: "object",
          properties: {
            type: { type: "string" },
            title: { type: "string" },
            summary: { type: "string" },
            days: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  day: { type: "string" },
                  title: { type: "string" },
                  reading: { type: "string" },
                  reflection: { type: "string" },
                  prayer: { type: "string" },
                },
              },
            },
            keyVerses: { type: "array", items: { type: "string" } },
          },
        };
      }

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: schema,
      });

      setResult({ ...response, type: activeTab });
      onSearch?.(query, activeTab, effectiveTopic);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">
            AI Bible Study Assistant
          </h1>
          {onBack && (
            <button
              onClick={onBack}
              className="rounded-lg px-4 py-2 text-slate-600 hover:bg-white hover:shadow-sm"
            >
              ← Back
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 flex gap-2 rounded-2xl bg-white p-1 shadow-sm">
          {[
            { id: "studyPlans", label: "Study Plans" },
            { id: "passages", label: "Passage Insights" },
            { id: "theology", label: "Theology" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 rounded-xl px-4 py-3 font-semibold transition ${
                activeTab === tab.id
                  ? "bg-violet-600 text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Query Input Card */}
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <label className="block text-sm font-semibold text-slate-900">
            {activeTab === "studyPlans"
              ? "What topic would you like to study?"
              : activeTab === "passages"
              ? "Which passage do you want to understand?"
              : "What theology topic interests you?"}
          </label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              activeTab === "studyPlans"
                ? "e.g., Overcoming anxiety"
                : activeTab === "passages"
                ? "e.g., John 3:16"
                : "e.g., The Trinity"
            }
            className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-100"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />

          {activeTab === "theology" && (
            <>
              <label className="mt-4 block text-sm font-semibold text-slate-900">
                Specific topic (optional)
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Predestination vs free will"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-100"
              />
            </>
          )}

          {/* Provider and Action Row */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-600">
                AI Model:
              </span>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-slate-900 focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-100"
              >
                <option value="openai">OpenAI (GPT-4o Mini)</option>
                <option value="claude">Claude (Sonnet 3.5)</option>
              </select>
            </label>

            <button
              onClick={handleSearch}
              disabled={!query.trim() || isLoading}
              className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
            >
              {isLoading ? "Generating..." : "Generate"}
            </button>
          </div>
        </div>

        {/* Response Section */}
        <AIStudyResponse result={result} isLoading={isLoading} error={error} />
      </div>
    </div>
  );
}