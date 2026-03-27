// src/ui/fonts.ts
export const GlobalFonts = {
  RefHanGlyphs: [
    {
      fontFamily: "RefHanGlyphs",
      src: `url("/fonts/KaiGlyphs-BMP.woff2") format("woff2")`,
      fontWeight: 400,
      fontStyle: "normal",
      fontDisplay: "swap",
      unicodeRange: [
        "U+2F00-2FDF",   // Kangxi Radicals
        "U+3400-4DBF",   // CJK Ext A
        "U+4E00-9FFF",   // Unified Ideographs
        "U+F900-FAFF"    // Compatibility Ideographs
      ].join(", "),
    },
    {
      fontFamily: "RefHanGlyphs",
      src: `url("/fonts/KaiGlyphs-ExtB.woff2") format("woff2")`,
      fontWeight: 400,
      fontStyle: "normal",
      fontDisplay: "swap",
      unicodeRange: "U+20000-2FA1F",
    },
  ],

  UIGlyphs: [
    {
      fontFamily: "UIGlyphs",
      src: `url("/fonts/NotoSansMono-Regular.woff2") format("woff2")`,
      fontWeight: 400,
      fontStyle: "normal",
      fontDisplay: "swap",
      unicodeRange: "U+0000-00FF",
    },
    {
      fontFamily: "UIGlyphs",
      src: `url("/fonts/WenKai-Regular.woff2") format("woff2")`,
      fontWeight: 400,
      fontStyle: "normal",
      fontDisplay: "swap",
    },
  ],

  PhoneticGlyphs: [
    {
      fontFamily: "PhoneticGlyphs",
      src: `url("/fonts/NotoSansMono-Regular.woff2") format("woff2")`,
      fontWeight: 400,
      fontStyle: "normal",
      fontDisplay: "swap",
      unicodeRange: "U+0000-00FF",
    },
    {
      fontFamily: "PhoneticGlyphs",
      src: `url("/fonts/WenKai-Regular.woff2") format("woff2")`,
      fontWeight: 400,
      fontStyle: "normal",
      fontDisplay: "swap",
    },
  ],
};
