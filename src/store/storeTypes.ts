import type { CharEntry, CharEntryMap, RadicalMap, RadicalsByStrokes } from "@lib/char/charTypes";
import { Orthography } from "@lib/phonetics/phoneticTypes";

export type AppState = {
  charEntryMap: CharEntryMap;

  simplifiedRadicalMap: RadicalMap;
  simplifiedRadicalsByStrokes: RadicalsByStrokes
  simplifiedByResidual: CharsByResidual;

  kangxiRadicalMap: RadicalMap;
  kangxiRadicalsByStrokes: RadicalsByStrokes
  kangxiByResidual: CharsByResidual;

  syllabaryMaps: SyllabaryMaps;

  radicalToGlyphMap: RadicalMap;
};

export type CharsByResidual = Record<string, Record<string, Array<CharEntry>>>;
export type SyllabaryMaps = Record<Orthography, Syllabary>;
// toned syllables as keys, chars as sets
export type SyllableMap = Record<string, Array<string>>;
// normalized syllables as keys
export type Syllabary = Record<string, SyllableMap>;




