'use client';
import { useSyncExternalStore } from 'react';
const event = 'portfolio-preference';
const memory = new Map<string, string>();
function subscribe(callback: () => void) {
 window.addEventListener('storage', callback);
 window.addEventListener(event, callback);
 return () => { window.removeEventListener('storage', callback); window.removeEventListener(event, callback); };
}
export function usePreference<T extends string>(key: string, fallback: T, allowed: readonly T[]) {
 const value = useSyncExternalStore(subscribe, () => {
  let stored = memory.get(key);
  try { stored = window.localStorage.getItem(key) ?? stored; } catch { /* Preferences remain usable when storage is unavailable. */ }
  return allowed.includes(stored as T) ? stored as T : fallback;
 }, () => fallback);
 const setValue = (next: T) => {
  memory.set(key, next);
  try { window.localStorage.setItem(key, next); } catch { /* Keep the preference for this visit. */ }
  window.dispatchEvent(new Event(event));
 };
 return [value, setValue] as const;
}
