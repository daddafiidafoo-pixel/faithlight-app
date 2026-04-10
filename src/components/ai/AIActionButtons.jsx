import React, { useState } from "react";
import { Copy, RefreshCw, Trash2, Check } from "lucide-react";
import { toast } from "sonner";
import AITextToSpeech from "./AITextToSpeech";

export default function AIActionButtons({ output, onRegenerate, onClear, loading, language = "en" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!output && !loading) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <AITextToSpeech text={output} language={language} label="Listen" />
      <button
        onClick={handleCopy}
        disabled={!output}
        className="flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:border-indigo-300 hover:text-indigo-700 transition-all disabled:opacity-40"
      >
        {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
        {copied ? "Copied" : "Copy"}
      </button>
      <button
        onClick={onRegenerate}
        disabled={loading}
        className="flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:border-indigo-300 hover:text-indigo-700 transition-all disabled:opacity-40"
      >
        <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        Regenerate
      </button>
      <button
        onClick={onClear}
        disabled={loading}
        className="flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-500 hover:border-red-200 hover:text-red-600 transition-all disabled:opacity-40 ml-auto"
      >
        <Trash2 size={14} />
        Clear
      </button>
    </div>
  );
}