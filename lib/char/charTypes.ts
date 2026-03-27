import { ReadingsRecord } from "@lib/phonetics/phoneticTypes";

export type CharRSMeta = {
  radicalId: string | null;
  residual: string | null; // residual stroke count
  totalStrokes: string | null // total stroke count
};

export type GlyphForm = "traditional" | "simplified" | "both";
export const GLYPH_FORMS = [
  "traditional",
  "simplified",
  "both",
] as const;

export type CharEntry = {
  unicode: string;
  alias: string | null;
  readings: ReadingsRecord | null;
  RSMeta: CharRSMeta | null;
  variantsMeta: VariantsMeta | null;
};

export type CharEntryMap = Record<string, CharEntry>;
export type CharRSMetaMap = Record<string, CharRSMeta>;

export type VariantsMeta = {
  simplified: string[];
  traditional: string[];
  variants: string[];
};

export type RadicalMeta = {
  "glyph": string;
  "codepoint": string;
  "baseGlyph": string;
  "baseCodepoint": string;
}

export type Radical = {
  radicalId: string | null;
  totalStrokes: string | null;
  glyph: string | null;
  kxGlyph?: string | null;
  variant?: Array<string>;
}

export type RadicalsByStrokes = Record<string, Array<Radical>>;
export type RadicalMap = Record<string, Radical>

export { ReadingsRecord };
