import React from "react";
import { Loader2, AlertCircle, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function AIOutputCard({ output, title, isLoading, error }) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-6 flex flex-col items-center justify-center gap-3 min-h-[160px]">
        <Loader2 size={28} className="text-indigo-500 animate-spin" />
        <p className="text-sm text-indigo-600 font-semibold">Generating...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-5 flex items-start gap-3">
        <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-red-700">Could not generate response right now.</p>
          <p className="text-xs text-red-500 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!output) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 flex flex-col items-center justify-center gap-2 min-h-[160px] text-center">
        <Sparkles size={24} className="text-gray-300" />
        <p className="text-sm font-semibold text-gray-400">Choose a task and enter your text or scripture reference.</p>
        <p className="text-xs text-gray-400">Your result will appear here.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-green-100 bg-white overflow-hidden shadow-sm">
      {title && (
        <div className="bg-green-50 border-b border-green-100 px-4 py-2.5">
          <p className="text-xs font-bold text-green-700 uppercase tracking-wide">{title}</p>
        </div>
      )}
      <div className="p-4">
        <div className="text-sm text-gray-800 leading-relaxed prose prose-sm max-w-none prose-headings:text-indigo-800 prose-strong:text-gray-900 prose-p:my-1.5">
          <ReactMarkdown>{output}</ReactMarkdown>
        </div>
        <p className="text-xs text-gray-400 mt-4 border-t border-gray-100 pt-3">
          Always compare AI output with Scripture.
        </p>
      </div>
    </div>
  );
}