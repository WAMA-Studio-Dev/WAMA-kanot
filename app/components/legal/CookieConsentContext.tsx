"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CookiePreferences = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
};

const STORAGE_KEY = "bykanot_cookie_consent";

const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
};

const FULL_PREFERENCES: CookiePreferences = {
  necessary: true,
  analytics: true,
  marketing: true,
};

type StoredConsent = {
  preferences: CookiePreferences;
  decidedAt: string;
};

function readStoredConsent(): StoredConsent | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredConsent;
    if (!parsed?.preferences) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStoredConsent(preferences: CookiePreferences) {
  const payload: StoredConsent = { preferences, decidedAt: new Date().toISOString() };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

type CookieConsentContextValue = {
  preferences: CookiePreferences;
  showBanner: boolean;
  showPreferences: boolean;
  openPreferences: () => void;
  closePreferences: () => void;
  acceptAll: () => void;
  rejectNonEssential: () => void;
  savePreferences: (preferences: CookiePreferences) => void;
};

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null);

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES);
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    // localStorage only exists client-side, so the consent decision must be read
    // post-mount to keep the SSR markup (banner hidden) matching the first client render.
    const stored = readStoredConsent();
    if (stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreferences(stored.preferences);
    } else {
      setShowBanner(true);
    }
  }, []);

  const value = useMemo<CookieConsentContextValue>(
    () => ({
      preferences,
      showBanner,
      showPreferences,
      openPreferences: () => setShowPreferences(true),
      closePreferences: () => setShowPreferences(false),
      acceptAll: () => {
        setPreferences(FULL_PREFERENCES);
        writeStoredConsent(FULL_PREFERENCES);
        setShowBanner(false);
        setShowPreferences(false);
      },
      rejectNonEssential: () => {
        setPreferences(DEFAULT_PREFERENCES);
        writeStoredConsent(DEFAULT_PREFERENCES);
        setShowBanner(false);
        setShowPreferences(false);
      },
      savePreferences: (next) => {
        setPreferences(next);
        writeStoredConsent(next);
        setShowBanner(false);
        setShowPreferences(false);
      },
    }),
    [preferences, showBanner, showPreferences]
  );

  return <CookieConsentContext.Provider value={value}>{children}</CookieConsentContext.Provider>;
}

export function useCookieConsent() {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) {
    throw new Error("useCookieConsent debe usarse dentro de CookieConsentProvider");
  }
  return ctx;
}
