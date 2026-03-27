// src/store/provider.tsx
import { AppState } from "./storeTypes";
import React, { createContext, useContext } from "react";
import { useStore as useZustandStore, type StoreApi } from "zustand";

const StoreCtx = createContext<StoreApi<AppState> | null>(null);

export function StoreProvider({
  store,
  children,
}: {
  store: StoreApi<AppState>;
  children: React.ReactNode;
}) {
  return <StoreCtx.Provider value={store}>{children}</StoreCtx.Provider>;
}

export function useAppStore<T>(selector: (s: AppState) => T): T {
  const store = useContext(StoreCtx);
  if (!store) throw new Error("useAppStore must be used within <StoreProvider>");
  return useZustandStore(store, selector);
}
