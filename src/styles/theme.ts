// theme.ts
import { createTheme, responsiveFontSizes } from "@mui/material/styles";
import { CssBaseline, GlobalStyles, ThemeProvider } from "@mui/material";
import { fontFamily, fontSize } from "@mui/system";

// custom jumbo variant for the entry page
declare module "@mui/material/styles" {
  interface TypographyVariants {
    heroTitle: React.CSSProperties;
  }
  interface TypographyVariantsOptions {
    heroTitle?: React.CSSProperties;
  }
}
declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    heroTitle: true;
  }
}

let yapinTheme = createTheme({
  typography: {
    // This is your app-wide face
    fontFamily: `"UIGlyphs", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial`,

    // Body
    body1: { fontSize: "1.5rem", lineHeight: 1.5 },
    body2: { fontSize: "clamp(1.35rem, 1vw, 1.45rem)", lineHeight: 1.45 },

    // Headings: smaller caps + gentler slope
    h1: { fontWeight: 700, fontSize: "clamp(2.4rem, 2.4vw, 3.0rem)", lineHeight: 1.2 },
    h2: { fontWeight: 700, fontSize: "clamp(1.85rem, 1.4vw, 2.20rem)", lineHeight: 1.25 },
    h3: { fontWeight: 600, fontSize: "clamp(1.9rem, 1.6vw, 2.3rem)", lineHeight: 1.3 },
    h4: { fontWeight: 600, fontSize: "clamp(1.75rem, 1.4vw, 2.05rem)", lineHeight: 1.35 },
    h5: { fontWeight: 600, fontSize: "clamp(1.65rem, 1.2vw, 1.9rem)", lineHeight: 1.35 },
    h6: { fontWeight: 600, fontSize: "clamp(1.55rem, 1.0vw, 1.75rem)", lineHeight: 1.35 },

    // Meta
    subtitle1: { fontSize: "1.45rem", fontWeight: 500, lineHeight: 1.45 },
    subtitle2: { fontSize: "1.35rem", fontWeight: 500, lineHeight: 1.45 },
    caption: { fontSize: "clamp(1.30rem, 1.0vw, 1.40rem)", lineHeight: 1.35 },

    // Buttons
    button: { fontSize: "1.5rem", textTransform: "none", lineHeight: 1.2 },

    // Entry-only jumbo (unchanged; use on that page only)
    heroTitle: { fontWeight: 800, fontSize: "clamp(6rem, 6vw, 9rem)", lineHeight: 1.08 },
  },

  components: {
    // Safer default HTML tags for each variant (so no invalid <p><p> nesting)
    MuiTypography: {
      defaultProps: {
        variantMapping: {
          heroTitle: "h1",
          h1: "h1", h2: "h2", h3: "h3", h4: "h4", h5: "h5", h6: "h6",
          body1: "p", body2: "p", subtitle1: "p", subtitle2: "p",
          caption: "span", overline: "span", button: "span",
        },
      },
    },

    // Make Divider’s wrapper inherit so your Typography sizes win
    MuiDivider: {
      styleOverrides: {
        wrapper: { fontSize: "inherit", lineHeight: "inherit", padding: 0 },
      },
    },

    // Optional: keep Buttons visually consistent when not using Typography inside
    MuiButton: {
      styleOverrides: { root: { textTransform: "none", fontSize: "inherit" } },
    },

    // (Optional) baseline plumbing
    MuiCssBaseline: {
      styleOverrides: {
        "html, body, #root": { height: "100%", fontFamily: "UIGlyphs" },
        "*": { minWidth: 0, minHeight: 0 },
        "img, video": { maxWidth: "100%", height: "auto" },
      },
    },
  },
});

export const mainTheme = yapinTheme;

export const BaseStyles = [
  {
    "html, body, #root": {
      height: "100%",
      width: "100%",
      margin: 0,
    },
    body: {
      // overflow: "hidden",           // block global scroll
      overscrollBehavior: "none",      // avoid iOS bounce
      fontFamily: "UIGlyphs",
      // fontSize: "1.5rem",
    },
    "*, *::before, *::after": {
      boxSizing: "border-box",
    },
  },

  /* ---------------- RefHanGlyphs ---------------- */
  {
    "@font-face": {
      fontFamily: "RefHanGlyphs",
      src: `url("fonts/KaiGlyphs-BMP.woff2") format("woff2")`,
      fontWeight: 400,
      fontStyle: "normal",
      fontDisplay: "block",
    },
  },
  {
    "@font-face": {
      fontFamily: "RefHanGlyphs",
      src: `url("fonts/KaiGlyphs-ExtB.woff2") format("woff2")`,
      fontWeight: 400,
      fontStyle: "normal",
      fontDisplay: "block",
    },
  },

  /* ---------------- UIGlyphs (Latin → NotoSansMono, else → WenKai) ---------------- */
  {
    "@font-face": {
      fontFamily: "UIGlyphs",
      src: `url("fonts/WenKai-Regular.woff2") format("woff2")`,
      fontWeight: 400,
      fontStyle: "normal",
      fontDisplay: "block",
      // Everything else (CJK blocks, symbols, fullwidth punctuation, etc.)
      // You can leave this unrestricted so it covers non-Latin.
    },
  },
  {
    "@font-face": {
      fontFamily: "UIGlyphs",
      src: `url("fonts/NotoSansMono-Regular.woff2") format("woff2")`,
      fontWeight: 400,
      fontStyle: "normal",
      fontDisplay: "block",
      unicodeRange: [
        // Core Latin
        "U+0000-00FF",   // Basic Latin + Latin-1
        "U+0100-017F",   // Latin Extended-A
        "U+0180-024F",   // Latin Extended-B
        "U+1E00-1EFF",   // Latin Extended Additional (precomposed diacritics)

        // IPA & phonetic
        "U+0250-02AF",   // IPA Extensions
        "U+1D00-1D7F",   // Phonetic Extensions
        "U+1D80-1DBF",   // Phonetic Extensions Supplement
        "U+02B0-02FF",   // Spacing Modifier Letters (incl. ː ˑ, ʰ ʷ, ʲ, ᵑ, etc.)

        // Combining marks (crucial for g̬ and friends):
        "U+0300-036F",   // Combining Diacritical Marks (acute, macron, caron, ring below, etc.)
        "U+1AB0-1AFF",   // Combining Diacritical Marks Extended
        "U+1DC0-1DFF",   // Combining Diacritical Marks Supplement
        "U+20D0-20FF",   // Combining Diacritical Marks for Symbols

        // Tone marks
        "U+02E5-02E9",   // Mod. Letters: Chao tone letters (˥ ˦ ˧ ˨ ˩)
        "U+A700-A71F",   // Modifier Tone Letters

        // (Optional) Punctuation to keep it mono-styled:
        "U+2010-205F"    // General Punctuation (– — … “ ” ‘ ’, etc.)
      ].join(", "),
    },
  },


  /* -------- PhoneticGlyphs (same routing for now; change later if needed) -------- */

  {
    "@font-face": {
      fontFamily: "PhoneticGlyphs",
      src: `url("fonts/WenKai-Regular.woff2") format("woff2")`,
      fontWeight: 400,
      fontStyle: "normal",
      fontDisplay: "block",
    },
  },
  {
    "@font-face": {
      fontFamily: "PhoneticGlyphs",
      src: `url("fonts/NotoSansMono-Regular.woff2") format("woff2")`,
      fontWeight: 400,
      fontStyle: "normal",
      fontDisplay: "block",
      unicodeRange: [
        // Core Latin
        "U+0000-00FF",   // Basic Latin + Latin-1
        "U+0100-017F",   // Latin Extended-A
        "U+0180-024F",   // Latin Extended-B
        "U+1E00-1EFF",   // Latin Extended Additional (precomposed diacritics)

        // IPA & phonetic
        "U+0250-02AF",   // IPA Extensions
        "U+1D00-1D7F",   // Phonetic Extensions
        "U+1D80-1DBF",   // Phonetic Extensions Supplement
        "U+02B0-02FF",   // Spacing Modifier Letters (incl. ː ˑ, ʰ ʷ, ʲ, ᵑ, etc.)

        // Combining marks (crucial for g̬ and friends):
        "U+0300-036F",   // Combining Diacritical Marks (acute, macron, caron, ring below, etc.)
        "U+1AB0-1AFF",   // Combining Diacritical Marks Extended
        "U+1DC0-1DFF",   // Combining Diacritical Marks Supplement
        "U+20D0-20FF",   // Combining Diacritical Marks for Symbols

        // Tone marks
        "U+02E5-02E9",   // Mod. Letters: Chao tone letters (˥ ˦ ˧ ˨ ˩)
        "U+A700-A71F",   // Modifier Tone Letters

        // (Optional) Punctuation to keep it mono-styled:
        "U+2010-205F"    // General Punctuation (– — … “ ” ‘ ’, etc.)
      ].join(", "),
    },
  },
];

