import React, { useState, useEffect } from "react";
import { Download, Trash2, Pin, BookOpen, Zap } from "lucide-react";
import { getLibrary, deleteLibraryItem, togglePin, formatFileSize } from "@/lib/offlineLibraryService";

export default function OfflineLibraryPanel({ userEmail }) {
  const [library, setLibrary] = useState(null);
  const [filter, setFilter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLibrary();
  }, [userEmail, filter]);

  const loadLibrary = async () => {
    setLoading(true);
    try {
      const data = await getLibrary(userEmail, filter);
      setLibrary(data);
    } catch (error) {
      console.error("Error loading library:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (confirm("Remove from library?")) {
      try {
        await deleteLibraryItem(itemId);
        await loadLibrary();
      } catch (error) {
        console.error("Error deleting:", error);
      }
    }
  };

  const handleTogglePin = async (item) => {
    try {
      await togglePin(item.id, item.is_pinned);
      await loadLibrary();
    } catch (error) {
      console.error("Error toggling pin:", error);
    }
  };

  const getItemIcon = (type) => {
    if (type === "ai_insight") return <Zap className="h-5 w-5 text-violet-600" />;
    return <BookOpen className="h-5 w-5 text-blue-600" />;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white shadow-lg">
        <h3 className="text-2xl font-bold">My Spiritual Library</h3>
        <p className="mt-1 text-blue-100">
          {library ? `${library.count} items • ${formatFileSize(library.totalSize)}` : "Loading..."}
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 rounded-2xl bg-white p-2 shadow-sm">
        {[
          { id: null, label: "All" },
          { id: "bible_passage", label: "Passages" },
          { id: "reading_plan", label: "Plans" },
          { id: "ai_insight", label: "Insights" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
              filter === tab.id
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Items List */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-500">
          Loading library...
        </div>
      ) : library?.items.length ? (
        <div className="space-y-2">
          {library.items.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 hover:shadow-md transition"
            >
              <div className="mt-1">{getItemIcon(item.item_type)}</div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-slate-900 truncate">{item.title}</h4>
                {item.reference && (
                  <p className="text-sm text-slate-500 truncate">{item.reference}</p>
                )}
                <p className="text-xs text-slate-400 mt-1">
                  {formatFileSize(item.file_size_kb || 0)} • Downloaded{" "}
                  {new Date(item.downloaded_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleTogglePin(item)}
                  className={`p-2 rounded-lg transition ${
                    item.is_pinned
                      ? "bg-amber-100 text-amber-600"
                      : "hover:bg-slate-100 text-slate-400"
                  }`}
                  title="Pin favorite"
                >
                  <Pin className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 rounded-lg hover:bg-red-100 text-slate-400 hover:text-red-600 transition"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <Download className="h-12 w-12 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-600">No items downloaded yet</p>
          <p className="text-xs text-slate-500 mt-1">
            Start saving passages, plans, and insights for offline access
          </p>
        </div>
      )}
    </div>
  );
}