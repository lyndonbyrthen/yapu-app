// layouts/RootLayout.tsx
import * as React from "react";
import { Outlet } from "react-router-dom";
import { Box, Container } from "@mui/material";

export default function RootLayout() {
  // Fallback for older mobile browsers without 100dvh
  React.useEffect(() => {
    const setVH = () => {
      document.documentElement.style.setProperty(
        "--vh",
        `${window.innerHeight * 0.01}px`
      );
    };
    setVH();
    window.addEventListener("resize", setVH);
    return () => window.removeEventListener("resize", setVH);
  }, []);

  return (
    <Box
      sx={{
        // Prefer dynamic viewport; fall back to --vh on older engines
        height: { xs: "100dvh", md: "100dvh" },
        "@supports not (height: 100dvh)": { height: "calc(var(--vh, 1vh) * 100)" },

        width: "100vw",
        display: "flex",
        flexDirection: "column",
        // Prevent sideways scrollbars from mobile reflow
        overflowX: "clip",

        // Safe-area support for iOS notches / Android cutouts
        pt: "max(8px, env(safe-area-inset-top))",
        pb: "max(8px, env(safe-area-inset-bottom))",

        // Nice responsive gutters
        px: { xs: 1.5, sm: 2, md: 3 },
      }}
    >
      {/* AppBar spot (optional) */}

      {/* Main scroll container */}
      <Box
        component="main"
        sx={{
          flex: 1,
          minHeight: 0, // allow child overflow containers to actually scroll
          overflowY: "auto",
          // Smooth iOS momentum scrolling
          WebkitOverflowScrolling: "touch",
          // Avoid rubber-band chain scrolling into the body on mobile
          overscrollBehaviorY: "contain",
        }}
      >
        <Container
          // Constrain content width on tablets/desktop; mobile is fluid
          maxWidth="lg"
          disableGutters
          sx={{
            // Add inner gutters only when wider than phones
            px: { xs: 0, sm: 1, md: 2 },
          }}
        >
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}
