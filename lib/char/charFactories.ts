import { CharEntry, VariantsMeta, CharRSMeta, Radical } from "./charTypes";
import { charToUPlus } from "./charUtils";

export function defaultCharEntry(ch: string): CharEntry {
  return {
    unicode: charToUPlus(ch),
    alias: null,
    readings: null,
    RSMeta: null,
    variantsMeta: null
  };
}

export function defaultVariantsMeta(): VariantsMeta {
  return {
    simplified: [],
    traditional: [],
    variants: [],
  };
}

export function defaultCharKSMeta(): CharRSMeta {
  return {
    radicalId: null,
    residual: null,
    totalStrokes: null,
  };
}

export function defaultRadical(): Radical {
  return {
    radicalId: null,
    glyph: "",
    kxGlyph: "", 
    totalStrokes: null, 
  };
}
