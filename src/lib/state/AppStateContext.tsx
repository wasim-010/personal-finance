"use client";

import { createContext, useContext, useEffect, useReducer, useRef } from "react";
import type { AppState } from "@/types/finance";
import { loadAndMigrate, saveState } from "@/lib/storage";
import { appReducer, type AppAction } from "@/lib/state/actions";
import { getDefaultAppState } from "@/lib/defaults/settings";

const AppStateContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, undefined, getDefaultAppState);
  const hasLoadedStorage = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!hasLoadedStorage.current) {
      hasLoadedStorage.current = true;
      dispatch({ type: "REPLACE_STATE", payload: loadAndMigrate() });
      return;
    }
    saveState(state);
  }, [state]);

  return <AppStateContext.Provider value={{ state, dispatch }}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) throw new Error("useAppState must be inside AppStateProvider");
  return context;
}
