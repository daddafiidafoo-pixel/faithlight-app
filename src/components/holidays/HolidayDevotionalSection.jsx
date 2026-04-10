import React, { useState } from "react";
import { Share2, Download } from "lucide-react";
import html2canvas from "html2canvas";

export default function HolidayDevotionalSection({ holiday }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateShareImage = async () => {
    setIsGenerating(true);
    try {
      const element = document.getElementById("holiday-share-card");
      const canvas = await html2canvas(element, {
        backgroundColor: "#ffffff",
        scale: 2,
      });
      
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `${holiday.title.replace(/\s+/g, "-")}-blessing.png`;
      link.click();
    } catch (error) {
      console.error("Error generating image:", error);
      alert("Unable to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    const shareText = `${holiday.title}\n\n${holiday.greeting}\n\nVerse: ${holiday.verse.reference}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: holiday.title,
          text: shareText,
        });
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      alert("Holiday message copied to clipboard!");
    }
  };

  return (
    <div className="space-y-8">
      {/* Devotional Reflection */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-xl border border-indigo-200">
        <h3 className="text-xl font-semibold text-slate-900 mb-4">✨ Devotional Reflection</h3>
        <p className="text-slate-700 leading-relaxed text-lg mb-6">
          {holiday.reflection}
        </p>
        <div className="border-l-4 border-indigo-600 pl-6">
          <p className="text-slate-600 italic">
            "{holiday.prayer}"
          </p>
        </div>
      </div>

      {/* Social Share Card */}
      <div>
        <h3 className="text-xl font-semibold text-slate-900 mb-4">📱 Share as Image</h3>
        
        {/* Preview */}
        <div
          id="holiday-share-card"
          className="bg-gradient-to-br from-purple-600 to-purple-700 text-white p-8 rounded-xl mb-4 shadow-lg"
        >
          <div className="text-center space-y-4">
            <p className="text-lg font-semibold opacity-90">{holiday.title}</p>
            <p className="text-xl italic leading-relaxed">
              "{holiday.verse.text}"
            </p>
            <p className="text-sm opacity-90">— {holiday.verse.reference}</p>
            <div className="border-t border-purple-400/30 pt-4">
              <p className="text-base">
                {holiday.greeting}
              </p>
            </div>
            <div className="text-xs opacity-75 pt-4">
              FaithLight • Christian Holidays Calendar
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={generateShareImage}
            disabled={isGenerating}
            className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-400 text-white font-medium py-3 rounded-lg transition"
          >
            <Download size={18} />
            {isGenerating ? "Generating..." : "Download Image"}
          </button>
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-purple-600 text-purple-600 hover:bg-purple-50 font-medium py-3 rounded-lg transition"
          >
            <Share2 size={18} />
            Share
          </button>
        </div>
      </div>
    </div>
  );
}