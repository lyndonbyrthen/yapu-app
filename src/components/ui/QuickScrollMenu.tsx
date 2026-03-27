import * as React from "react";
import { Box } from "@mui/material";

type Props = {
  letters: string[];
  sectionPrefix?: string; // e.g. 'section-'
  offsetTop?: number;     // pixels to offset for sticky headers
  scrollContainer?: HTMLElement | null;
};

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const QuickScrollMenu: React.FC<Props> = ({
  letters,
  sectionPrefix = "section-",
  offsetTop = 0,
  scrollContainer
}) => {
  const [active, setActive] = React.useState<string | null>(letters[0] ?? null);
  const [scrubbing, setScrubbing] = React.useState(false);
  const ref = React.useRef<HTMLDivElement | null>(null);
  const rafRef = React.useRef<number | null>(null);

  // Scroll helper
  const scrollToLetter = React.useCallback(
    (letter: string, smooth: boolean) => {
      const el = document.getElementById(`${sectionPrefix}${letter}`);
      if (!el) return;
      const y = el.getBoundingClientRect().top + window.pageYOffset - offsetTop;
      console.log('---------------------------',`${sectionPrefix}${letter}`,y,scrollContainer)
      const scRect = (scrollContainer as HTMLElement).getBoundingClientRect();
      scrollContainer!.scrollTo({ top: y, behavior: smooth ? "smooth" : "auto" });
    },
    [offsetTop, sectionPrefix,scrollContainer]
  );

  // IntersectionObserver: update active letter based on what’s in view
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Choose the most visible entry
        const vis = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0));
        if (vis[0]) {
          const id = vis[0].target.id; // e.g., section-a
          const letter = id.replace(sectionPrefix, "");
          setActive(letter);
        }
      },
      {
        // Trigger when header crosses into upper viewport, accounting for offsetTop
        root: null,
        rootMargin: `-${offsetTop}px 0px -60% 0px`,
        threshold: [0.01, 0.1, 0.25, 0.5, 0.75, 1],
      }
    );

    // Observe each section header
    letters.forEach((l) => {
      const el = document.getElementById(`${sectionPrefix}${l}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [letters, sectionPrefix, offsetTop]);

  // Pointer scrubbing -> map Y position to letter index and scroll
  const scrubToClientY = React.useCallback(
    (clientY: number) => {
      if (!ref.current || letters.length === 0) return;
      const rect = ref.current.getBoundingClientRect();
      const ratio = (clientY - rect.top) / rect.height;
      const idx = clamp(Math.floor(ratio * letters.length), 0, letters.length - 1);
      const target = letters[idx];

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setActive(target);
        // While scrubbing we prefer immediate tracking
        scrollToLetter(target, /* smooth */ false);
      });
    },
    [letters, scrollToLetter]
  );

  const onPointerDown = (e: React.PointerEvent) => {
    setScrubbing(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    scrubToClientY(e.clientY);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!scrubbing) return;
    scrubToClientY(e.clientY);
  };

  const endScrub = () => setScrubbing(false);

  // Touch support (for browsers not sending pointer events)
  const onTouchStart = (e: React.TouchEvent) => {
    setScrubbing(true);
    scrubToClientY(e.touches[0].clientY);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!scrubbing) return;
    scrubToClientY(e.touches[0].clientY);
  };
  const onTouchEnd = () => setScrubbing(false);

  // Click/tap to jump smoothly
  const onClickLetter = (letter: string) => {
    scrollToLetter(letter, true);
  };

  // Dynamic size/opacity per letter: current big, neighbors graduated
  const renderLetter = (letter: string, i: number) => {
    const currentIndex = active ? letters.indexOf(active) : -1;
    const dist = currentIndex >= 0 ? Math.abs(i - currentIndex) : 99;

    // scale: 1.6 (active), 1.3 (±1), 1.1 (±2), 1.0 (others)
    const scale =
      dist === 0 ? 1.6 : dist === 1 ? 1.3 : dist === 2 ? 1.1 : 1.0;

    // opacity: fade with distance for a subtle focus effect
    const opacity =
      dist === 0 ? 1 : dist === 1 ? 0.9 : dist === 2 ? 0.8 : 0.7;

    const weight = dist <= 1 ? 700 : 500;

    return (
      <Box
        key={letter}
        role="button"
        aria-label={`jump to ${letter}`}
        onClick={() => onClickLetter(letter)}
        sx={{
          userSelect: "none",
          touchAction: "none",
          lineHeight: 1,
          transform: `scale(${scale})`,
          transformOrigin: "center",
          opacity,
          fontWeight: weight,
          cursor: "pointer",
          px: 0.5,
          py: 0.25,
        }}
      >
        {letter.toUpperCase()}
      </Box>
    );
  };

  return (
    <Box
      ref={ref}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endScrub}
      onPointerCancel={endScrub}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      sx={{
        position: "fixed",
        right: { xs: 8, sm: 12, md: 16 },
        top: { xs: 96, sm: 96, md: 112 }, // adjust to sit below your page title
        bottom: { xs: "auto", md: "auto" },
        zIndex: (t) => t.zIndex.appBar + 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0.25,
        p: 0.75,
        borderRadius: "9999px",
        backdropFilter: "blur(6px)",
        bgcolor: "rgba(0,0,0,0.05)",
        _dark: { bgcolor: "rgba(255,255,255,0.06)" } as any, // if you use a dark mode token
        // Slight shadow for legibility over content
        boxShadow: 1,
      }}
    >
      {letters.map((l, i) => renderLetter(l, i))}
    </Box>
  );
};

export default QuickScrollMenu;
