import React from "react";
import { createPageUrl } from "@/utils";
import { BookOpen, Home, Sparkles, BookCopy, Users, WifiOff, Settings, MessageCircle } from "lucide-react";
import { shouldShowPaymentsUI } from "@/components/lib/billing/paymentsGuard";

const NAV = [
  { label: "Home", path: "Home", icon: Home },
  { label: "Bible", path: "BibleReader", icon: BookOpen },
  { label: "AI Tools", path: "AskAI", icon: Sparkles },
  { label: "Study Plans", path: "StudyPlans", icon: BookCopy },
  { label: "Community", path: "Community", icon: Users },
  { label: "Forum", path: "BibleForum", icon: MessageCircle },
  { label: "Offline", path: "OfflineLibrary", icon: WifiOff },
  { label: "Settings", path: "UserSettings", icon: Settings },
];

export default function SidebarNavComp() {
  const current = typeof window !== "undefined" ? window.location.pathname : "/";

  const items = NAV.filter((x) => {
    if (x.guard === "payments" && !shouldShowPaymentsUI()) return false;
    return true;
  });

  return (
    <div className="h-full flex flex-col border-r border-gray-200 bg-white">
      <div className="px-4 py-4 border-b border-gray-100">
        <div className="font-extrabold text-lg">FaithLight</div>
        <div className="text-xs text-gray-500 mt-1">Scripture & Study</div>
      </div>

      <div className="p-3 space-y-1 flex-1">
        {items.map((it) => {
          const href = createPageUrl(it.path);
          const active = current === href || current.startsWith(href + "/");
          const Icon = it.icon;
          return (
            <a
              key={it.path}
              href={href}
              className={[
                "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition",
                active ? "bg-black text-white" : "hover:bg-gray-100",
              ].join(" ")}
            >
              <Icon className="w-4 h-4" />
              {it.label}
            </a>
          );
        })}
      </div>

      <div className="p-3 border-t border-gray-100">
        <a
          href={createPageUrl('HelpCenter')}
          className="w-full block px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold hover:bg-gray-50 text-center"
        >
          Help & Support
        </a>
      </div>
    </div>
  );
}