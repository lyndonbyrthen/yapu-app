import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { HashRouter } from "react-router-dom";
import { CssBaseline, GlobalStyles, ThemeProvider } from "@mui/material";
import { mainTheme, BaseStyles } from "./styles/theme";
import { StoreProvider } from "./store/provider";
import { createAppStore } from "./store/buildInitialState";
import { Payload } from "@lib/payloadTypes";

export function mount(selector: string | Element, data: Payload) {
  const el = typeof selector === "string" ? document.querySelector(selector)! : selector;
  const root = createRoot(el as Element);
  (el as any)._reactRoot = root;

  // optional: ensure hash routing when opened via file://
  if (!window.location.hash) {
    window.location.replace(window.location.href.split("#")[0] + "#/");
  }
  const store = createAppStore(data);

  root.render(
    <ThemeProvider theme={mainTheme}>
      <CssBaseline />
      <GlobalStyles styles={BaseStyles} />
      <HashRouter>
        <StoreProvider store={store}>
          <App />
        </StoreProvider>
      </HashRouter>
    </ThemeProvider>
  );
}

export function unmount(selector: string | Element) {
  const el = typeof selector === "string" ? document.querySelector(selector)! : selector;
  (el as any)._reactRoot?.unmount?.();
}

(globalThis as any).YapuApp = { mount, unmount };
