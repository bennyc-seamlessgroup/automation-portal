import { useCallback, useEffect, useRef, useState } from "react";

export function useAutosave<T extends Record<string, any>>(
  data: T,
  saveFn: (data: T) => void,
  delay: number = 1000
) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousDataRef = useRef<string>("");

  const scheduleSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsSaving(true);
      saveFn(data);
      setLastSaved(new Date());
      setIsSaving(false);
      timeoutRef.current = null;
    }, delay);
  }, [data, saveFn, delay]);

  const dataString = JSON.stringify(data);
  useEffect(() => {
    if (dataString !== previousDataRef.current) {
      previousDataRef.current = dataString;
      scheduleSave();
    }
  }, [dataString, scheduleSave]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { isSaving, lastSaved, scheduleSave: () => scheduleSave() };
}
