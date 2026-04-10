import { useLanguage } from "@/context/LanguageProvider";

/**
 * Short translation hook.
 * Usage:
 *   const t = useT();
 *   t("common", "save");          // → "Save"
 *   t("common", "save", "Save!"); // → with custom fallback
 */
export default function useT() {
  const { t } = useLanguage();
  return t;
}