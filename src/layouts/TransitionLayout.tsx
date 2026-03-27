// layouts/TransitionLayout.tsx
import { useLocation, Outlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useRouteStore } from "../store/routeState";
import { useMediaQuery, useTheme } from "@mui/material";

function useDirection() {
  const { action } = useRouteStore();
  // POP usually means back; PUSH means forward
  return action === "POP" ? -1 : 1;
}

export default function TransitionLayout() {
  const location = useLocation();
  const dir = useDirection();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  const magnitude = isMobile ? 8 : 12;

  const variants = reduceMotion
    ? {
        in:  { opacity: 1, x: 0, y: 0 },
        on:  { opacity: 1, x: 0, y: 0 },
        out: { opacity: 1, x: 0, y: 0 },
      }
    : {
        in:  { opacity: 0, x: 0, y: dir * magnitude },
        on:  { opacity: 1, x: 0, y: 0, transition: { duration: isMobile ? 0.14 : 0.2 } },
        out: { opacity: 0, x: 0, y: -dir * magnitude, transition: { duration: isMobile ? 0.10 : 0.14 } },
      };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.key}
        initial="in"
        animate="on"
        exit="out"
        variants={variants}
        style={{ willChange: "transform, opacity" }}
        custom={dir}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
}
