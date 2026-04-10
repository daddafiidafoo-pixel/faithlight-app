import { useEffect } from "react";
import { useLanguage } from "./useLanguage";

// Only truly RTL scripts — Oromo (om), Amharic (am) and all other Latin/Ethiopic scripts are LTR
const RTL_ONLY = new Set(['ar', 'fa', 'ur', 'he', 'yi', 'ps', 'dv', 'ckb', 'sd', 'ug', 'syr']);

export default function DirectionController() {
  const { selectedLanguage } = useLanguage();

  useEffect(() => {
    const lang = selectedLanguage || "en";
    const base = lang.toLowerCase().split('-')[0];
    const dir = RTL_ONLY.has(base) ? "rtl" : "ltr";

    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', lang);
    document.body.setAttribute('dir', dir);
  }, [selectedLanguage]);

  return null;
}