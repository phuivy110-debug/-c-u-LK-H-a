import { useCallback, useRef, useState } from 'react';
import type { SetStateAction } from 'react';

// Store filters with the history entry: Back restores them without persistent storage.
export function useHistoryState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => typeof window === 'undefined'
    ? initialValue : window.history.state?.listing?.[key] ?? initialValue);
  const current = useRef(value);
  const update = useCallback((action: SetStateAction<T>) => {
    const next = typeof action === 'function' ? (action as (previous: T) => T)(current.current) : action;
    current.current = next;
    if (typeof window !== 'undefined') {
      const state = window.history.state || {};
      window.history.replaceState({ ...state, listing: { ...state.listing, [key]: next } }, '');
    }
    setValue(next);
  }, [key]);
  return [value, update] as const;
}
