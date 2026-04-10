import React from "react";
import { createPageUrl } from "@/utils";

function pretty(seg) {
  return seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function BreadcrumbsNav() {
  const path = typeof window !== "undefined" ? window.location.pathname : "/";
  const parts = path.split("/").filter(Boolean);

  if (parts.length <= 1) return null;

  const crumbs = parts.map((p, idx) => ({
    label: pretty(p),
    href: "/" + parts.slice(0, idx + 1).join("/"),
  }));

  return (
    <div className="text-xs text-gray-600 flex flex-wrap items-center gap-2">
      <a href={createPageUrl('Home')} className="underline">Home</a>
      {crumbs.map((c, i) => (
        <React.Fragment key={c.href}>
          <span>/</span>
          {i === crumbs.length - 1 ? (
            <span className="text-gray-800 font-semibold">{c.label}</span>
          ) : (
            <a href={c.href} className="underline">{c.label}</a>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}