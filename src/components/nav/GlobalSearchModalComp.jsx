import React, { useEffect, useMemo, useState } from "react";
import { base44 } from '@/api/base44Client';
import { ModernInput } from "@/components/ui/ModernInput";
import { ModernButton } from "@/components/ui/ModernButton";
import SkeletonUI from "@/components/ui/SkeletonUI";
import EmptyStateUI from "@/components/ui/EmptyStateUI";
import { searchAllContent } from "@/components/search/searchProviders";
import { X } from "lucide-react";

function Group({ title, items, onPick }) {
  if (!items?.length) return null;
  return (
    <div className="mt-4">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{title}</div>
      <div className="space-y-2">
        {items.map((r, i) => (
          <button
            key={`${r.path}-${i}`}
            className="w-full text-left border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition"
            onClick={() => onPick(r)}
            type="button"
          >
            <div className="text-xs text-gray-500">{r.type}</div>
            <div className="font-semibold">{r.title}</div>
            {r.subtitle ? <div className="text-sm text-gray-600 mt-1 line-clamp-2">{r.subtitle}</div> : null}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function GlobalSearchModalComp({ open, onClose }) {
  const [q, setQ] = useState("");
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState({});

  useEffect(() => {
    if (!open) return;
    setQ("");
    setGroups({});
    setLoading(true);

    (async () => {
      try {
        const m = await base44.auth.me().catch(() => null);
        setMe(m || null);
      } catch {
        setMe(null);
      }
      setLoading(false);
    })();
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (!open) return;
    let alive = true;
    const t = setTimeout(async () => {
      setLoading(true);
      const res = await searchAllContent({ query: q, me });
      if (alive) {
        setGroups(res || {});
        setLoading(false);
      }
    }, 180);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [q, me, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const hasAny = useMemo(() => Object.values(groups).some((arr) => (arr?.length || 0) > 0), [groups]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-2xl max-h-[75vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-100 flex items-center justify-between gap-3">
          <div className="text-lg font-semibold">Search</div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg" type="button">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 pt-4">
          <ModernInput
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search plans, community, features…"
            autoFocus
          />
          <div className="text-xs text-gray-500 mt-2">Tip: Press Cmd/Ctrl+K anytime to search.</div>
        </div>

        <div className="flex-1 overflow-auto px-5 py-4">
          {loading ? (
            <div className="space-y-2">
              <SkeletonUI className="h-16" />
              <SkeletonUI className="h-16" />
              <SkeletonUI className="h-16" />
            </div>
          ) : !hasAny ? (
            <EmptyStateUI title="No results" description="Try different keywords or browse by category." />
          ) : (
            <>
              <Group title="Features" items={groups["Features"]} onPick={(r) => { onClose(); window.location.href = r.path; }} />
              <Group title="Study Plans" items={groups["Study Plans"]} onPick={(r) => { onClose(); window.location.href = r.path; }} />
              <Group title="Community" items={groups["Community"]} onPick={(r) => { onClose(); window.location.href = r.path; }} />
              <Group title="Settings" items={groups["Settings"]} onPick={(r) => { onClose(); window.location.href = r.path; }} />
              <Group title="Legal" items={groups["Legal"]} onPick={(r) => { onClose(); window.location.href = r.path; }} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}