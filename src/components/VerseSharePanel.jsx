import { useState } from "react";
import { Share2, Download, Copy } from "lucide-react";
import {
  copyToClipboard,
  shareVerse,
  generateShareText,
} from "@/lib/verseShare";

export default function VerseSharePanel({ verseText, reference }) {
  const [background, setBackground] = useState("#5b4ce6");
  const [fontFamily, setFontFamily] = useState("Georgia");
  const [status, setStatus] = useState("");

  const appUrl = `${window.location.origin}/BibleReader?verse=${encodeURIComponent(reference)}`;

  async function handleCopy() {
    try {
      await copyToClipboard(`"${verseText}" — ${reference}`);
      setStatus("Verse copied to clipboard.");
      setTimeout(() => setStatus(""), 2000);
    } catch {
      setStatus("Could not copy verse.");
    }
  }

  async function handleDownloadImage() {
    try {
      setStatus("Generating image...");
      // Canvas image generation would require additional implementation
      setStatus("Image generation not yet implemented.");
      setTimeout(() => setStatus(""), 2000);
    } catch {
      setStatus("Failed to generate image.");
    }
  }

  async function handleShare() {
    try {
      setStatus("Preparing to share...");
      const text = generateShareText(reference, verseText);
      
      const shared = await shareVerse(reference, verseText);

      if (!shared) {
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      }

      setStatus("Share started.");
      setTimeout(() => setStatus(""), 2000);
    } catch {
      setStatus("Sharing failed.");
    }
  }

  return (
    <div className="rounded-2xl border bg-white dark:bg-slate-800 p-4 shadow-sm">
      <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">Share Verse</h3>

      <div className="mb-3 grid gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Background</span>
          <input
            type="color"
            value={background}
            onChange={(e) => setBackground(e.target.value)}
            className="h-11 w-full rounded-lg border border-gray-300 dark:border-slate-600 cursor-pointer"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Typography</span>
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            className="rounded-lg border border-gray-300 dark:border-slate-600 p-3 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
          >
            <option value="Georgia">Georgia</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Arial">Arial</option>
            <option value="Verdana">Verdana</option>
          </select>
        </label>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleCopy}
          className="rounded-xl border border-gray-300 dark:border-slate-600 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
        >
          <Copy className="w-4 h-4" /> Copy
        </button>

        <button
          onClick={handleDownloadImage}
          className="rounded-xl border border-gray-300 dark:border-slate-600 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
        >
          <Download className="w-4 h-4" /> Generate Image
        </button>

        <button
          onClick={handleShare}
          className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-white transition-colors flex items-center gap-2"
        >
          <Share2 className="w-4 h-4" /> Share
        </button>
      </div>

      {status && <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{status}</p>}
    </div>
  );
}