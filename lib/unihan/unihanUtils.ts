import fs from "node:fs/promises";
import { CharEntry, CharEntryMap, type GlyphForm } from "@lib/char/charTypes";
import { UnihanMap, UnihanRow, UnihanFields } from "./unihanTypes";
import { ORTHOGRAPHY } from "@lib/phonetics/phoneticTypes";

const toChar = (uPlus: string) =>
  String.fromCodePoint(parseInt(uPlus.slice(2), 16));

export async function loadUnihanFile(path: string): Promise<UnihanMap> {
  const text = await fs.readFile(path, "utf8");
  const map: UnihanMap = new Map();

  for (const line of text.split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const [cp, field, value] = line.split("\t");
    if (!cp || !field || value == null) continue;

    let row = map.get(cp);
    if (!row) {
      row = { codepoint: cp, char: toChar(cp), fields: {} };
      map.set(cp, row);
    }
    (row.fields[field] ??= []).push(value);
  }
  return map;
}

export function addMoreReadingsToCharEntryMap(
  charEntryMap: CharEntryMap,
  unihanMap: UnihanMap
): void {
  for (const entry of Object.values(charEntryMap)) {
    addReadingsToEntry(entry, unihanMap);
  }
}

export function addReadingsToEntry(
  entry: CharEntry,
  unihanMap: UnihanMap
): void {
  const row: UnihanRow | undefined = unihanMap.get(entry.unicode);
  if (!row) return;

  const f = row.fields;

  // Putonghua / Pinyin
  const pth = getPinyin(f);

  if (pth.length) entry.readings![ORTHOGRAPHY.PUTONGHUA_PINYIN] = pth;

  // Cantonese / Jyutping
  const jyut = getCantoneseJyutping(f);
  if (jyut.length) entry.readings![ORTHOGRAPHY.CANTONESE_JYUTPING] = jyut;

  // Middle Chinese / Baxter
  const mc = getMiddleChineseBaxter(f);
  if (mc.length) entry.readings![ORTHOGRAPHY.MIDDLE_CHINESE_BAXTER] = mc;

  // Japanese / Katakana (ON)
  const on = getJapaneseKatakana(f);
  if (on.length) entry.readings![ORTHOGRAPHY.JAPANESE_KATAKANA] = on;

  // NOTE: Kun is ignored by design per your spec.
}

const norm = (v?: string[] | string): string[] => {
  if (!v) return [];
  return Array.isArray(v) ? v : v.split(/[,\s;]+/g).filter(Boolean);
};

const getField = (f: UnihanFields, k: string) => f[k];

// kMandarin preferred; fallback to kHanyuPinyin (strip leading “T1=” etc. lightly)
function getPinyin(fields: UnihanFields): string[] {
  const mandarin = norm(getField(fields, "kMandarin"));
  if (mandarin.length) return mandarin;

  const hpRaw = norm(getField(fields, "kHanyuPinyin"));
  if (!hpRaw.length) return [];

  const out: string[] = [];
  for (const token of hpRaw) {
    for (const seg of token.split(";")) {
      const cleaned = seg.replace(/^\w+\d?=/, ""); // drop "T1=" or similar prefix
      out.push(...cleaned.split(/[,\s]+/).filter(Boolean));
    }
  }
  return out;
}

function getCantoneseJyutping(fields: UnihanFields): string[] {
  return norm(getField(fields, "kCantonese")); // typically Jyutping-like
}

// Middle Chinese (Baxter). Choose first available key you ship with your data.
function getMiddleChineseBaxter(fields: UnihanFields): string[] {
  return (
    norm(getField(fields, "kBaxter")) ||
    norm(getField(fields, "kMiddleChinese_Baxter")) ||
    norm(getField(fields, "kMiddleChineseBaxter")) ||
    norm(getField(fields, "kMiddleChinese"))
  );
}

// Japanese ON readings only (Katakana). KUN intentionally ignored.
function getJapaneseKatakana(fields: UnihanFields): string[] {
  return norm(getField(fields, "kJapaneseOn"));
}
export const inferGlyphFormFromVariants = (entry: CharEntry): GlyphForm | null => {
  const vm = entry.variantsMeta;
  if (!vm) return null;

  const hasSimplified = vm.simplified.length > 0;
  const hasTraditional = vm.traditional.length > 0;

  if (hasSimplified && hasTraditional) return "both";
  if (hasSimplified) return "traditional";
  if (hasTraditional) return "simplified";
  return null;
};

