import React, { useState } from "react";
import { Share2, Download, Sparkles } from "lucide-react";
import { generateShareCard, recordShare, getShareUrl, generateHtmlCard } from "@/lib/socialShareService";

export default function SocialCardBuilder({ userEmail, defaultData = {} }) {
  const [cardData, setCardData] = useState({
    type: "verse",
    title: defaultData.title || "Bible Verse",
    content: defaultData.content || "",
    reference: defaultData.reference || "",
    backgroundStyle: "gradient_purple",
  });

  const [preview, setPreview] = useState(false);
  const [sharing, setSharing] = useState(false);

  const backgroundOptions = [
    { id: "gradient_purple", label: "Purple Gradient" },
    { id: "gradient_blue", label: "Blue Gradient" },
    { id: "gradient_gold", label: "Gold Gradient" },
    { id: "solid_dark", label: "Dark Solid" },
  ];

  const shareableOn = [
    { id: "whatsapp", label: "WhatsApp", icon: "💬" },
    { id: "facebook", label: "Facebook", icon: "f" },
    { id: "instagram", label: "Instagram", icon: "📸" },
  ];

  const handleShare = async (platform) => {
    try {
      setSharing(true);

      // Save card
      const { card } = await generateShareCard(userEmail, cardData);

      // Record share
      await recordShare(card.id, [platform]);

      // Get share URL
      const shareUrl = getShareUrl(platform, cardData.title, cardData.content);

      if (shareUrl && platform !== "instagram") {
        window.open(shareUrl, "_blank");
      } else if (platform === "instagram") {
        alert(
          "Open Instagram app and share this card as a story or post from your camera roll!"
        );
      }
    } catch (error) {
      console.error("Share error:", error);
      alert("Failed to share. Please try again.");
    } finally {
      setSharing(false);
    }
  };

  const handleDownload = async () => {
    try {
      const html = generateHtmlCard(cardData);
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${cardData.title.replace(/\s+/g, "-")}.html`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  const PreviewCard = () => (
    <div
      className="relative w-full aspect-square rounded-2xl shadow-xl overflow-hidden"
      style={{
        backgroundImage:
          cardData.backgroundStyle === "solid_dark"
            ? undefined
            : `linear-gradient(135deg, ${
                cardData.backgroundStyle === "gradient_purple"
                  ? "#7c3aed 0%, #6366f1 100%"
                  : cardData.backgroundStyle === "gradient_blue"
                  ? "#3b82f6 0%, #06b6d4 100%"
                  : "#f59e0b 0%, #d97706 100%"
              })`,
        backgroundColor: cardData.backgroundStyle === "solid_dark" ? "#1f2937" : undefined,
      }}
    >
      <div className="absolute inset-0 flex flex-col justify-center items-center p-6 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">{cardData.title}</h2>
        <p className="text-xl font-medium mb-6 italic">"{cardData.content}"</p>
        {cardData.reference && (
          <p className="text-sm opacity-80">{cardData.reference}</p>
        )}
        <div className="absolute bottom-4 right-4 text-xs opacity-60">FaithLight</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <div className="rounded-3xl bg-white p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-900">Title</label>
          <input
            type="text"
            value={cardData.title}
            onChange={(e) => setCardData({ ...cardData, title: e.target.value })}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-100"
            placeholder="e.g., John 3:16"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-900">
            Content
          </label>
          <textarea
            value={cardData.content}
            onChange={(e) => setCardData({ ...cardData, content: e.target.value })}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 h-24 focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-100"
            placeholder="Paste verse text, devotion, or insight..."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-900">
            Reference (optional)
          </label>
          <input
            type="text"
            value={cardData.reference}
            onChange={(e) => setCardData({ ...cardData, reference: e.target.value })}
            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-2 focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-100"
            placeholder="e.g., John 3:16, NIV"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">
            Design
          </label>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {backgroundOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setCardData({ ...cardData, backgroundStyle: opt.id })}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                  cardData.backgroundStyle === opt.id
                    ? "ring-2 ring-violet-600 bg-violet-50 text-violet-700"
                    : "border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Preview Toggle */}
        <button
          onClick={() => setPreview(!preview)}
          className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          {preview ? "Hide Preview" : "Show Preview"}
        </button>
      </div>

      {/* Preview */}
      {preview && (
        <div>
          <p className="mb-2 text-sm font-semibold text-slate-600">Preview</p>
          <PreviewCard />
        </div>
      )}

      {/* Share & Download */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-slate-900">Share</p>
        <div className="grid gap-2 md:grid-cols-3">
          {shareableOn.map((platform) => (
            <button
              key={platform.id}
              onClick={() => handleShare(platform.id)}
              disabled={sharing || !cardData.content.trim()}
              className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Share2 className="h-4 w-4" />
              {platform.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleDownload}
          disabled={!cardData.content.trim()}
          className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="h-4 w-4" />
          Download Card
        </button>
      </div>
    </div>
  );
}