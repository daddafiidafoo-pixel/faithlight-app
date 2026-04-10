import React, { useEffect, useState } from "react";
import SidebarNavComp from "@/components/nav/SidebarNavComp";
import BreadcrumbsNav from "@/components/nav/BreadcrumbsNav";
import GlobalSearchButtonComp from "@/components/nav/GlobalSearchButtonComp";
import { Menu, X } from "lucide-react";

export default function AppShellLayout({ children }) {
  const [drawer, setDrawer] = useState(false);

  // Cmd/Ctrl+K opens search
  useEffect(() => {
    const onKey = (e) => {
      const isMac = navigator.platform.toLowerCase().includes("mac");
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("faithlight:openSearch"));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile top bar */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-3 py-3 flex items-center justify-between">
        <button className="p-2 hover:bg-gray-100 rounded-lg" onClick={() => setDrawer(true)} type="button">
          <Menu className="w-5 h-5" />
        </button>
        <div className="font-bold text-sm">FaithLight</div>
        <GlobalSearchButtonComp />
      </div>

      <div className="flex">
        {/* Desktop sidebar */}
        <div className="hidden lg:block w-64 h-screen sticky top-0 overflow-y-auto">
          <SidebarNavComp />
        </div>

        {/* Mobile drawer */}
        {drawer ? (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/40" onClick={() => setDrawer(false)}>
            <div className="absolute left-0 top-0 bottom-0 w-72 bg-white overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <SidebarNavComp />
              <div className="p-3 border-t border-gray-100">
                <button className="w-full px-3 py-2 rounded-xl border border-gray-200 flex items-center justify-center gap-2" onClick={() => setDrawer(false)} type="button">
                  <X className="w-4 h-4" /> Close
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Main */}
        <div className="flex-1">
          {/* Desktop top row */}
          <div className="hidden lg:flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
            <BreadcrumbsNav />
            <GlobalSearchButtonComp />
          </div>

          <div className="px-4 lg:px-6 pb-10 pt-4">{children}</div>
        </div>
      </div>
    </div>
  );
}