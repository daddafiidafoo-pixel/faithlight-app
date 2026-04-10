import React, { useEffect, useState } from "react";
import { ModernButton } from "@/components/ui/ModernButton";
import GlobalSearchModalComp from "@/components/nav/GlobalSearchModalComp";
import { Search } from "lucide-react";

export default function GlobalSearchButtonComp() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("faithlight:openSearch", onOpen);
    return () => window.removeEventListener("faithlight:openSearch", onOpen);
  }, []);

  return (
    <>
      <ModernButton variant="ghost" onClick={() => setOpen(true)} type="button" className="gap-2">
        <Search className="w-4 h-4" /> Search
      </ModernButton>
      <GlobalSearchModalComp open={open} onClose={() => setOpen(false)} />
    </>
  );
}