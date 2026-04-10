import { useMemo } from "react";
import { getActiveVerse } from "@/utils/verseTiming";

export function useVerseSync(timing, currentTime) {
  return useMemo(() => getActiveVerse(timing, currentTime), [timing, currentTime]);
}