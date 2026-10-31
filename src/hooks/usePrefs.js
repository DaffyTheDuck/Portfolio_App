import { useState, useEffect, useCallback } from "react";

const KEY = "pf-prefs";

function read() {
  try {
    return JSON.parse(window.localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

const osReducesMotion = () => !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

/** Theme and effects preferences, remembered per browser. */
export function usePrefs() {
  const [theme, setTheme] = useState(() => (read().theme === "light" ? "light" : "dark"));
  const [effectsOff, setEffectsOff] = useState(() => read().effectsOff === true);

  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify({ theme, effectsOff }));
    } catch {
      /* storage unavailable; the choice just won't persist */
    }
  }, [theme, effectsOff]);

  const toggleTheme = useCallback(() => setTheme((t) => (t === "light" ? "dark" : "light")), []);
  const toggleEffects = useCallback(() => setEffectsOff((v) => !v), []);

  return { theme, toggleTheme, effectsOff, toggleEffects, reduce: effectsOff || osReducesMotion() };
}

/** True when this browser has seen the intro animations before. */
export function hasSeenIntro() {
  try {
    return window.localStorage.getItem("pf-seen") === "1";
  } catch {
    return false;
  }
}

export function markIntroSeen() {
  try {
    window.localStorage.setItem("pf-seen", "1");
  } catch {
    /* ignore */
  }
}
