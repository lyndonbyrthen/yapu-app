#!/usr/bin/env node
// Subset fonts + emit missingGlyphs into public/data.{json,js}
import { uPlusToChar } from "@lib/char/charUtils";
import { upsertFieldIntoJS, upsertFieldIntoJSON } from "@lib/fileUtils";
import fs from "node:fs";
import { $ } from "zx";

// $.verbose = true;

/* ============================== Types ====================================== */

type UPlus = `U+${string}`;

/* ============================ Subset step ================================== */

async function pyftsubset(inFile: string, textFile: string, outFile: string): Promise<void> {
  try {
    await $`pyftsubset ${inFile} --text-file=${textFile} --flavor=woff2 \
      --output-file=${outFile} --layout-features=${'*'} --no-hinting \
      --recalc-average-width --canonical-order`;
  } catch {
    console.warn("[warn] pyftsubset unavailable; trying python -m fontTools.subset");
    await $`python3 -m fontTools.subset ${inFile} --text-file=${textFile} --flavor=woff2 \
      --output-file=${outFile} --layout-features=${'*'} --no-hinting \
      --recalc-average-width --canonical-order`;
  }
}

//— Subset (existing behavior) --------------------------------------------------
await pyftsubset(
  "scripts/data/fonts/TW-Kai-98_1.ttf",
  "scripts/data/charset/charset-bmp.txt",
  "public/fonts/KaiGlyphs-BMP.woff2"
);
await pyftsubset(
  "scripts/data/fonts/TW-Kai-Ext-B-98_1.ttf",
  "scripts/data/charset/charset-extb.txt",
  "public/fonts/KaiGlyphs-ExtB.woff2"
);
await pyftsubset(
  "scripts/data/fonts/LXGWWenKaiMonoGB-Regular.ttf",
  "scripts/data/charset/charset-bmp.txt",
  "public/fonts/WenKai-Regular.woff2"
);

/* ========================= Coverage utilities ============================== */

/** Prefer ttx CLI; fall back to python module. Returns Set<"U+XXXX"> */
async function extractCoverageUPlus(fontFile: string): Promise<Set<UPlus>> {
  try {
    const { stdout } = await $`ttx -q -o - -t cmap ${fontFile}`;
    return parseTtxCmap(stdout);
  } catch {
    const { stdout } = await $`python3 -m fontTools.ttx -q -o - -t cmap ${fontFile}`;
    return parseTtxCmap(stdout);
  }
}

function parseTtxCmap(xmlText: string): Set<UPlus> {
  const cps = new Set<UPlus>();
  const re = /code="0x([0-9a-fA-F]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xmlText))) {
    cps.add(("U+" + m[1].toUpperCase().padStart(4, "0")) as UPlus);
  }
  return cps;
}

function loadCharFileAsCharSet(textFile: string): Set<string> {
  const text = fs.readFileSync(textFile, "utf8");
  // iterate by Unicode scalars
  const chars = [...text.replace(/\s+/g, "")];
  return new Set<string>(chars);
}

/* ======================= Font config (per-font) ============================ */
/** 
 * Each font declares:
 *  - name: key used in payload.missingGlyphs
 *  - woff2: one or more produced font files to union coverage
 *  - targets: charset files whose characters must be supported by this font
 */
const FONTS: Array<{
  name: string;
  woff2: string[];
  targets: string[];
}> = [
    {
      name: "KaiGlyphs",
      woff2: ["public/fonts/KaiGlyphs-BMP.woff2", "public/fonts/KaiGlyphs-ExtB.woff2"],
      targets: ["scripts/data/charset/charset-bmp.txt", "scripts/data/charset/charset-extb.txt"],
    },
    {
      // Use "WenKai" or "WenKai-Regular" — quoted in output so hyphens are fine
      name: "WenKai",
      woff2: ["public/fonts/WenKai-Regular.woff2"],
      targets: ["scripts/data/charset/charset-bmp.txt", "scripts/data/charset/charset-extb.txt"], // no ExtB subset for this font
    },
  ];

/* ======================= Compute missing glyphs ============================ */

const missingByFont: Record<string, string[]> = {};

for (const font of FONTS) {
  // Union coverage of this font (across its WOFF2 files)
  const coverU = new Set<UPlus>();
  for (const wf of font.woff2) {
    if (!fs.existsSync(wf)) {
      console.warn(`[warn] woff2 not found: ${wf}`);
      continue;
    }
    const u = await extractCoverageUPlus(wf);
    for (const cp of u) coverU.add(cp);
  }
  const coverChars = new Set<string>([...coverU].map(uPlusToChar));

  // Union targets for this font
  const targets = new Set<string>();
  for (const tf of font.targets) {
    if (!fs.existsSync(tf)) {
      console.warn(`[warn] charset file missing: ${tf}`);
      continue;
    }
    for (const ch of loadCharFileAsCharSet(tf)) targets.add(ch);
  }

  // MISSING = targets \ coverage
  // const missing: string[] = [];
  // for (const ch of targets) if (!coverChars.has(ch)) missing.push(ch);

  // missingByFont[font.name] = missing;
  // console.log(`[${font.name}] targets: ${targets.size}, missing: ${missing.length}`);
  // if (missing.length) {
  //   console.warn(`[warn] charset file missing from [${font.name}] ${missing.join('')}`)
  // }
}

/* ==================== Emit to /public/data.json|js ========================= */

// Build wire object for JSON: { [font]: { [char]: true } }
// const jsonMissing = {};
// for (const [fontName, chars] of Object.entries(missingByFont)) {
//   jsonMissing[fontName] = chars.join('');
// }

// JSON
// const fieldName = "missingGlyphs";
// upsertFieldIntoJSON("public/data.json", fieldName, jsonMissing);

// JS: { [font]: new Map([[char,true], ...]) } with **quoted keys** (safe for hyphens)
// const jsExpr = `{${Object.entries(missingByFont)
//   .map(([fontName, chars]) => `${JSON.stringify(fontName)}: new Map(${JSON.stringify(
//     chars.map(ch => [ch, true] as const)
//   )})`)
//   .join(", ")}}`;

// upsertFieldIntoJS("public/data.js", fieldName, jsExpr);

console.log("subset + missingGlyphs (Kai & WenKai) merge complete.");
