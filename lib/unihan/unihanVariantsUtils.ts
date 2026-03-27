// unihanVariantsUtils.ts
// Keep imports as-is; your IDE will adjust paths.
import type { CharEntryMap, CharEntry, VariantsMeta } from "@lib/char/charTypes";
import type { UnihanMap, UnihanRow, UnihanFields } from "./unihanTypes";
import { defaultVariantsMeta, defaultCharEntry } from "@lib/char/charFactories";
import { uPlusToChar } from "@lib/char/charUtils";
import { log, logStat } from "@lib/buildUtils";
import { rowGap } from "@mui/system";

// --- Config: which Unihan fields map into our VariantsMeta keys (order matters) ---
const FIELD_MAP = [
  ["kSimplifiedVariant", "simplified"],
  ["kTraditionalVariant", "traditional"],
  ["kSemanticVariant", "variants"],
] as const;

// --- Pure utilities ------------------------------------------------------------

/** Split a Unihan "values" cell into clean U+ codepoints, preserving order & duplicates. */
export const extractCodepoints = (values?: string[]): string[] =>
  !values || values.length === 0
    ? []
    : values.flatMap((raw) =>
      raw
        .split("U+")                    // separate every target
        .filter(Boolean)                // drop leading empty chunk
        .map((chunk) => chunk.split("<")[0]) // strip qualifiers like "<kMatthews"
        .map((hex) => `U+${hex.trim().toUpperCase()}`)
        .filter(Boolean)
    );

/** Convert Unihan values cell directly to glyphs (Array<string>). */
export const extractGlyphs = (values?: string[]): string[] =>
  extractCodepoints(values).map(uPlusToChar);

/** Initialize variantsMeta if needed (idempotent) and append glyphs from a field. */
const counter = {
  "kSimplifiedVariant": 0,
  "kTraditionalVariant": 0,
  "kSemanticVariant": 0,
}
const appendGlyphsFromField = (
  entry: CharEntry,
  fields: UnihanFields,
  unihanField: (typeof FIELD_MAP)[number][0],
  metaKey: (typeof FIELD_MAP)[number][1]
): string[] => {
  entry.variantsMeta ??= defaultVariantsMeta();
  const glyphs = extractGlyphs(fields[unihanField]);
  if (glyphs.length) counter[unihanField]++;
  if (glyphs.length) entry.variantsMeta[metaKey].push(...glyphs);
  return glyphs;
};


/** Attach mapped variants for a single codepoint; create/enrich targets as needed (DFS). */
const dfsAttachForCodepoint = (
  cp: string,                 // "U+XXXX" (4–6 hex)
  charEntryMap: CharEntryMap,
  variantsMap: UnihanMap,
  visited: Set<string>,
  alias: string
): void => {
  if (visited.has(cp)) return;
  visited.add(cp);

  // Ensure base entry exists (keyed by glyph)
  // Add it as a new entry if not.
  const ch = uPlusToChar(cp);
  const entry = charEntryMap[ch] ?? (() => {
    const created = defaultCharEntry(ch);
    charEntryMap[ch] = created;
    return created;
  })();

  // Pull Unihan row & append (not replace) glyphs for our three fields
  const row: UnihanRow | undefined = variantsMap.get(cp);
  if (!row) return;

  // For each field, append glyphs and ensure those targets exist too
  const nextGlyphs = FIELD_MAP.flatMap(([unihanField, metaKey]) =>
    appendGlyphsFromField(entry, row.fields, unihanField, metaKey)
  );

  // Recurse into the newly referenced targets (convert glyphs back to cp)
  // Note: we can compute cp from glyph via codePointAt and format as U+… (fast path).
  nextGlyphs.forEach((g) => {
    const codePoint = g.codePointAt(0);
    if (codePoint == null) return;
    const nextCp = "U+" + codePoint.toString(16).toUpperCase();

    let curAlias = alias;
    if (entry.readings) {
      curAlias = uPlusToChar(entry.unicode);
    } else {
      entry.alias = alias;
    }

    dfsAttachForCodepoint(nextCp, charEntryMap, variantsMap, visited, curAlias);
  });
};

export const attachVariants = (
  charEntryMap: CharEntryMap,
  variantsMap: UnihanMap
) => {
  log(`  Attaching char variants from Unihan`, 'HEADER');

  const roots: CharEntry[] = Object.values(charEntryMap);
  const visited = new Set<string>();
  const sizeBefore = roots.length;

  roots.forEach((root) => dfsAttachForCodepoint(root.unicode, charEntryMap, variantsMap, visited, uPlusToChar(root.unicode)));

  log(`${Object.values(charEntryMap).length - sizeBefore} variants attached.`, 'SUCCESS');
  log(`${counter['kSemanticVariant']} semantic variants added.`);
  log(`${counter["kSimplifiedVariant"]} simplified variants added.`);
  log(`${counter['kTraditionalVariant']} traditional variants added.`);
  log(`${roots.length} root chars. ${visited.size} nodes visited.`);


};

