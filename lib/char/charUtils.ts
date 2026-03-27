// lib/charUtils.ts
import { tify } from "chinese-conv";
import { CharEntry, CharEntryMap, GlyphForm, Radical, RadicalsByStrokes } from "./charTypes";
import { ORTHOGRAPHY } from "@lib/phonetics/phoneticTypes";

export function isUnifiedIdeograph(cp) {
  return (
    (cp >= 0x3400 && cp <= 0x4DBF) || // Ext A
    (cp >= 0x4E00 && cp <= 0x9FFF) || // Unified
    (cp >= 0xF900 && cp <= 0xFAFF)    // Compatibility Ideographs
  );
}

export function isRadicalSymbol(cp: string) {
  return (
    (cp >= 0x2E80 && cp <= 0x2EFF) || // CJK Radicals Supplement
    (cp >= 0x2F00 && cp <= 0x2FD5)    // Kangxi Radicals
  );
}

export function safeS2T(text: string) {
  let out = "";
  for (const ch of text ?? "") {
    const cp = ch.codePointAt(0);
    if (isUnifiedIdeograph(cp)) {
      out += tify(ch);     // convert 网→網, 体→體, etc.
    } else {
      // leave radicals/symbols/punctuation as-is (⽹ stays ⽹)
      out += ch;
    }
  }
  return out;
}

export const digitsOnly = (s: string) => s.replace(/\D/g, "");

export function uPlusToChar(cp: string) {
  if (!cp) return cp;
  // "U+6F22" -> "漢"
  return String.fromCodePoint(parseInt(cp.slice(2), 16));
}

export function charToUPlus(ch: string) {
  return "U+" + ch.codePointAt(0).toString(16).toUpperCase().padStart(4, "0");
}

export const isHan = (ch: string) => /\p{Script=Han}/u.test(ch);
export const splitHanChars = (s = "") => [...String(s)].filter(isHan);

export const dedupeStrings = (arr: string[] = []) => [...new Set(arr.map(s => s.trim()).filter(Boolean))];

export function dedupeArray(arr: any[]) {
  const aSet = new Set(arr);
  return aSet.entries()
}

export const getGlyphForm = (entry: CharEntry, map?: CharEntryMap): GlyphForm => {
  if (!entry) return entry;
  const hasTradVariant = !!entry.variantsMeta?.traditional.length;
  const hasSimpVariant = !!entry.variantsMeta?.simplified.length;

  if (hasSimpVariant && !hasTradVariant) return "traditional" as GlyphForm;
  if (hasTradVariant && !hasSimpVariant) return "simplified" as GlyphForm;
  if (entry.alias && map) return getGlyphForm(map[entry.alias], map);

  return "both" as GlyphForm;
}

export const normalizeRadical = (str: string): string => str.replace(/_/g, "");

export const isChineseChar = (ch: string): boolean => {
  const code = ch.codePointAt(0);
  return !!code && (
    (code >= 0x4E00 && code <= 0x9FFF) ||   // CJK Unified Ideographs
    (code >= 0x3400 && code <= 0x4DBF) ||   // CJK Extension A
    (code >= 0x20000 && code <= 0x2A6DF) || // CJK Extension B
    (code >= 0x2A700 && code <= 0x2B73F) || // CJK Extension C
    (code >= 0x2B740 && code <= 0x2B81F) || // CJK Extension D
    (code >= 0x2B820 && code <= 0x2CEAF) || // CJK Extension E
    (code >= 0x2CEB0 && code <= 0x2EBEF) || // CJK Extension F
    (code >= 0xF900 && code <= 0xFAFF) ||   // CJK Compatibility Ideographs
    (code >= 0x2F800 && code <= 0x2FA1F)    // CJK Compatibility Ideographs Supplement
  );
};

export const isWhitespace = (ch: string): boolean =>
  /^\p{White_Space}$/u.test(ch);

export const findCharWithReadings = (char: string, charEntryMap: CharEntryMap, map: Record<string, boolean> = {}): string | null => {
  if (map[char]) return null;
  if (charEntryMap[char]?.readings?.[ORTHOGRAPHY.YAPU_YAPIN]) return char;
  const charEntry = charEntryMap[char];
  if (!charEntry?.alias) return null;
  map[char] = true;
  return findCharWithReadings(charEntry?.alias, charEntryMap, map);
}

export const compareCharByTotalStrokes = (a: string, b: string, charEntryMap: CharEntryMap) => {
  const aStrokes = charEntryMap[a]?.RSMeta?.totalStrokes;
  const bStrokes = charEntryMap[b]?.RSMeta?.totalStrokes;

  if (aStrokes === undefined || bStrokes === undefined) return 0;
  return Number(aStrokes) - Number(bStrokes);
}

export const groupCharsByStrokes = (chars: string[], charEntryMap: CharEntryMap) => {
  const map: Record<string, string[]> = {};
  chars.forEach((ch) => {
    const n = charEntryMap[ch]?.RSMeta?.totalStrokes;
    if (!n) return;
    if (!map[n]) map[n] = [];
    map[n].push(ch);
  });
  return map;
}
export function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}
