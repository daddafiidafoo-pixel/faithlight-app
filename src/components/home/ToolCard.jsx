import React from "react";

export default function ToolCard({
  title,
  description,
  badge,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm hover:shadow-md hover:border-violet-300 transition"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        {badge ? (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
            {badge}
          </span>
        ) : null}
      </div>

      <p className="mt-3 text-slate-600">{description}</p>
    </button>
  );
}