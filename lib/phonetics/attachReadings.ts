/**
 * readings-selected.charEntryMap.ts
 * - Arrays only (no hydration)
 * - Uses CharEntryMap = Map<string, CharEntry>
 * - Targets: putonghua:pinyin, cantonese:jyutping, middleChinese:fanqie, japanese:katakana
 * - Merges own readings + Unihan fields
 * - One-hop alias inheritance
 */

import { UnihanMap, UnihanFields, UnihanRow } from "@lib/unihan/unihanTypes";
import { Orthography, ReadingsRecord } from "./phoneticTypes";
import { CharEntryMap } from "@lib/char/charTypes";
import { dedupeStrings as dedupeArray, uniq } from "@lib/char/charUtils";
import { log } from "@lib/buildUtils";
import { WikCharMeta } from "scripts/wiktionary/wikUtils";
import { WIK_CHAR_META_PATH } from "@lib/paths";
import { fs } from "zx";
import { removeInvalidPinyin } from "./phoneticUtils";
import { KXFanqieMap } from "./attachPTK";

/** Split a list of strings by common separators, trim, and dedupe. */
export const split = (arr?: string[]) =>
  dedupeArray(
    (arr ?? [])
      .flatMap(s => s.split(/[,\s;、·･・／/；]+/))
      .map(t => t.trim())
      .filter(Boolean)
  );

/** Katakana check (keeps long vowel mark). */
export const isKatakana = (s: string) => /^[\u30A0-\u30FFー]+$/.test(s);

/**
 * Pull just the four targets from a Unihan fields bag.
 * - putonghua:pinyin     ← kMandarin
 * - cantonese:jyutping   ← kCantonese
 * - middleChinese:fanqie ← kFanqie
 * - japanese:katakana    ← kJapanese(On|Kun|combined), katakana only (on’yomi)
 * - middleChinese:baxter ← kTang (as you had it)
 */

/** Build Putonghua pinyin list:
 *  - union of kHanyuPinyin + kHanyuPinlu + kXHC1983 (letters-only split, deduped)
 *  - then move the FIRST kMandarin token to the front as canonical (add if absent)
 */
export const buildPutonghuaReadings = (fields: any): string[] => {
  // 1) union third-column sources, keep only Latin letters (incl. tone marks)
  const raw = [
    ...(fields?.kHanyuPinyin ?? []),
    ...(fields?.kHanyuPinlu ?? []),
    ...(fields?.kXHC1983 ?? []),
  ].join(" ").normalize("NFC");

  const set = new Set(
    raw.replace(/[^\p{Script=Latin}\p{Mark}]+/gu, " ")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
  );

  const out = Array.from(set);

  // kMandarin is the canonical pth reading
  const canon =
    (fields?.kMandarin ?? [])
      .join(" ")
      .split(/[,\s;、·･・／/；]+/)
      .map(s => s.trim())
      .filter(Boolean)[0];

  // Move the canonical pth reading to index 0
  if (canon) {
    const i = out.indexOf(canon);
    if (i > -1) out.splice(i, 1);
    out.unshift(canon);
  }

  return out;
};

function extractSelected(row: UnihanRow = {} as UnihanRow): ReadingsRecord | undefined {
  const { fields } = row;
  if (!fields) return;
  const out: ReadingsRecord = {};

  const pth = buildPutonghuaReadings(fields);
  out["putonghua:pinyin"] = removeInvalidPinyin(pth); // pth[0] is canonical, also remove unihan pinyin errors

  const jyut = split(fields.kCantonese);
  out["cantonese:jyutping"] = jyut;

  const fq = split(fields.kFanqie);
  out["middleChinese:fanqie"] = fq;

  // const jap = dedupeArray(
  //   [
  //     ...split(fields.kJapaneseOn),
  //     ...split(fields.kJapaneseKun),
  //     ...split(fields.kJapanese),
  //   ].filter(isKatakana)
  // );
  // if (jap.length) out["japanese:katakana"] = jap;

  return Object.keys(out).length ? out : undefined;
}

/** Merge helper now RETURNS a merged object (no silent no-op). */
export function mergeIntoOwnReadingsRecord(
  a?: ReadingsRecord | null,
  b?: ReadingsRecord
): ReadingsRecord | undefined {
  if (!b) return a ?? undefined;
  const out: ReadingsRecord = { ...(a ?? {}) };

  const keys = new Set<string>([
    ...Object.keys(out),
    ...Object.keys(b),
  ]);

  for (const k of keys) {
    if (!out[k]) {
      out[k] = b[k] ? [...b[k]] : [];
    } else if (b[k]) {
      out[k] = [...out[k], ...b[k]];
    }
  }
  return out;
}

/** Write merged readings back onto the entry. */
export function attachReadings(charEntryMap: CharEntryMap, readingsMap: UnihanMap, kxFanqieMap: KXFanqieMap) {

  log(`  Attaching putonghua and jyutping readings from Unihan`, 'HEADER');
  const wikMap: Record<string, WikCharMeta> = JSON.parse(fs.readFileSync(WIK_CHAR_META_PATH, "utf8"));
  let noCant = 0, cantFromWik = 0, noFanqie = 0;

  for (const [char, e] of Object.entries(charEntryMap)) {
    // aliased entries don't need their own readings
    if (e.alias) continue;

    const uni = extractSelected(readingsMap.get(e.unicode));
    if (uni && uni["cantonese:jyutping"].length < 1) {
      noCant++;
      uni["cantonese:jyutping"] = wikMap[char]?.readings?.jyutping ?? [];
      if (uni["cantonese:jyutping"].length) cantFromWik++;
    }

    if (uni && uni["cantonese:jyutping"].length < 1) {
      noCant++;
      uni["cantonese:jyutping"] = wikMap[char]?.readings?.jyutping ?? [];
      if (uni["cantonese:jyutping"].length) cantFromWik++;
    }

    if (uni && uni["middleChinese:fanqie"].length < 1) {
      uni["middleChinese:fanqie"] = uniq(kxFanqieMap[char]?.fanqie ?
        [kxFanqieMap[char].fanqie, ...uni["middleChinese:fanqie"]] :
        uni["middleChinese:fanqie"]);

      if (uni["middleChinese:fanqie"].length < 1) noFanqie++;
    }

    const merged = mergeIntoOwnReadingsRecord(e.readings ?? undefined, uni);

    if (merged && Object.keys(merged).length) {
      e.readings = merged; // <-- assign back
    }
  }

  log(`Readings attached.`, 'SUCCESS');
  log(`${noFanqie} entries are missing Fanqie.`, 'WARNING');
  log(`${noCant} entries are missing jyutping.`, 'WARNING');
  log(`${cantFromWik} jyutping supplimented from wiktionary.`, 'WARNING');

}
