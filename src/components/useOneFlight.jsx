import { useEffect, useRef } from "react";

export function useOneFlight(key, fn) {
  const inFlight = useRef(false);
  const lastKey = useRef(null);

  useEffect(() => {
    if (!key) return;
    if (inFlight.current && lastKey.current === key) return;

    inFlight.current = true;
    lastKey.current = key;

    Promise.resolve(fn()).finally(() => {
      inFlight.current = false;
    });
  }, [key]);
}