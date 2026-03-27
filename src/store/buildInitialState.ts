import type { Payload } from "@lib/payloadTypes";
import { type StoreApi, create } from "zustand";
import { devtools } from "zustand/middleware";
import { buildDerived, deepFreeze } from "./bootstrapUtils";
import type { AppState } from "./storeTypes";


export function buildInitialState(payload: Payload): AppState {
    const derived = buildDerived(payload);
    return {
        ...derived
    };
}
// Factory: create a store already bootstrapped
export function createAppStore(payload: Payload): StoreApi<AppState> {
    const initial = buildInitialState(payload);
    // Lookup tables are deep-frozen => effectively immutable
    return create<AppState>()(
        devtools(
            (_set, _get, _api) => ({ ...initial }),
            { name: 'appStore' }
        )
    );
}
