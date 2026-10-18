"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

// 🧩 Dashboard ke 2 layouts: "sidebar" (left menu) ya "topbar" (upar menu)
export type LayoutMode = "sidebar" | "topbar";

type LayoutCtx = {
  mode: LayoutMode;
  setMode: (m: LayoutMode) => void;
  toggle: () => void;
};

const LayoutContext = createContext<LayoutCtx | null>(null);
const STORAGE_KEY = "layout-mode";

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<LayoutMode>("sidebar");

  // pichli choice yaad rakho
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "sidebar" || saved === "topbar") setModeState(saved);
    } catch {
      /* ignore */
    }
  }, []);

  const setMode = (m: LayoutMode) => {
    setModeState(m);
    try {
      localStorage.setItem(STORAGE_KEY, m);
    } catch {
      /* ignore */
    }
  };

  return (
    <LayoutContext.Provider
      value={{
        mode,
        setMode,
        toggle: () => setMode(mode === "sidebar" ? "topbar" : "sidebar"),
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayoutMode() {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error("useLayoutMode must be used inside LayoutProvider");
  return ctx;
}
