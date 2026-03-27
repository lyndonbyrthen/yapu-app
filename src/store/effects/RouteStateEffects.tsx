// routes/RouteStateEffects.tsx
import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useRouteStore } from "@src/store/routeState";

export default function RouteStateEffects() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = useRouteStore((s) => s.path);
  const setPath = useRouteStore((s) => s.setPath);

  // Track whether the current store change came from a popstate/location change
  const fromPopRef = useRef(false);

  const currentUrl = () => location.pathname + location.search + location.hash;

  // Seed store on mount (don’t navigate)
  useEffect(() => {
    const cur = currentUrl();
    setPath(cur);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 1) Router/location ➜ Store
  useEffect(() => {
    const cur = currentUrl();

    // If store already matches live URL, do nothing
    if (path === cur) return;

    fromPopRef.current = true; // next store->router effect should NOT navigate
    setPath(cur);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key, location.pathname, location.search, location.hash]);

  // 2) Store ➜ Router (programmatic nav via setPath)
  useEffect(() => {
    if (!path) return;

    const cur = currentUrl();

    // If target equals current URL, do nothing (prevents duplicate pushes)
    if (path === cur) {
      fromPopRef.current = false;
      return;
    }

    if (fromPopRef.current) {
      // Store changed because location changed; accept it but don’t push
      fromPopRef.current = false;
      return;
    }

    // Programmatic navigation: only push when target differs from current
    navigate(path); // push; use { replace: true } case-by-case if desired
  }, [path, navigate, location.pathname, location.search, location.hash]);

  return null;
}
