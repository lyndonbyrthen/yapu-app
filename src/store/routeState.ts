// store/routeState.ts
import { create } from "zustand";

type RouteState = {
  path?: string;                 // undefined until seeded
  setPath: (p: string) => void;  // the only write API
};

export const useRouteStore = create<RouteState>((set) => ({
  path: undefined,
  setPath: (p) => set({ path: p }),  // ← Zustand's `set` merges and notifies
}));
