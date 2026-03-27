// layouts/TopPage.tsx
import { memo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useMediaQuery, useTheme } from "@mui/material";

function TopPageImpl() {
  const location = useLocation();
  const theme = useTheme();

  // Prefer lighter transitions on phones and respect user setting
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  const variants = reduceMotion
    ? {
        initial: { opacity: 1, y: 0 },
        enter:   { opacity: 1, y: 0 },
        exit:    { opacity: 1, y: 0 },
      }
    : {
        initial: { opacity: 0, y: isMobile ? 6 : 10 },
        enter:   { opacity: 1, y: 0,  transition: { duration: isMobile ? 0.14 : 0.2, ease: [0.2, 0.8, 0.2, 1] } },
        exit:    { opacity: 0, y: isMobile ? -6 : -10, transition: { duration: isMobile ? 0.10 : 0.14, ease: [0.4, 0.0, 1, 1] } },
      };

  return (
    <AnimatePresence mode="wait" onExitComplete={() => { /* optional: window.scrollTo(0,0) */ }}>
      <motion.div
        key={location.key}
        initial="initial"
        animate="enter"
        exit="exit"
        variants={variants}
        style={{ willChange: "opacity, transform" }}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
}

const TopPage = memo(TopPageImpl);
export default TopPage;
