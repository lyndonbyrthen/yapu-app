#!/usr/bin/env node
// Convert Simplified → Traditional across a whole text file (e.g., CSV),
// and produce a preview list of which chars will change and how.
//
// Usage:
//   npm i chinese-conv
//   node s2t-file-preview.mjs <infile> [--out <outfile>] [--preview <preview.csv>] [--maxPrint 50]
//
// Examples:
//   node s2t-file-preview.mjs laoguoyin_freq_used.csv
//   node s2t-file-preview.mjs laoguoyin_freq_used.csv --out out.csv --preview preview.csv --maxPrint 100
//
// Notes:
// - Only converts **Unified Ideographs** blocks (Ext-A/U+3400–4DBF, Unified/U+4E00–9FFF, Compat/U+F900–FAFF).
// - **Skips radical symbols** (e.g., ⽹ U+2F79), punctuation, ASCII, etc.
// - Preserves BOM if present.

import { readFile, writeFile } from "fs/promises";
import { tify } from "chinese-conv";

// ---------- CLI ----------
const args = Object.fromEntries(
  process.argv.slice(2).map((a,i,arr)=>a.startsWith("--")
    ? [a.slice(2), (arr[i+1] && !arr[i+1].startsWith("--")) ? arr[i+1] : true]
    : null
  ).filter(Boolean)
);
const inPath = process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2] : null;
if (!inPath) {
  console.error("Usage: node s2t-file-preview.mjs <infile> [--out <outfile>] [--preview <preview.csv>] [--maxPrint 50]");
  process.exit(1);
}
const outPath     = args.out     || inPath.replace(/(\.[^./\\]+)?$/i, ".trad$1");
const previewPath = args.preview || inPath.replace(/(\.[^./\\]+)?$/i, ".s2t-preview.csv");
const maxPrint    = Number.isFinite(+args.maxPrint) ? +args.maxPrint : 50;

// ---------- helpers ----------
function hasBOM(s){ return s && s.charCodeAt(0) === 0xFEFF; }
function stripBOM(s){ return hasBOM(s) ? s.slice(1) : s; }

function isUnifiedIdeograph(cp) {
  return (
    (cp >= 0x3400 && cp <= 0x4DBF) || // Ext A
    (cp >= 0x4E00 && cp <= 0x9FFF) || // Unified
    (cp >= 0xF900 && cp <= 0xFAFF)    // Compatibility Ideographs
  );
}
// We intentionally **do not** convert radical symbols (U+2E80–2EFF, U+2F00–2FD5).
function shouldConvert(cp) { return isUnifiedIdeograph(cp); }

function toCSV(rows) {
  if (!rows.length) return "simplified,traditional,count,u_s,u_t\n";
  const cols = Object.keys(rows[0]);
  const esc = v => {
    let s = String(v ?? "");
    const need = /["\n,\r]/.test(s);
    if (/"/.test(s)) s = s.replace(/"/g, '""');
    return need ? `"${s}"` : s;
  };
  let out = cols.join(",") + "\n";
  for (const r of rows) out += cols.map(c => esc(r[c])).join(",") + "\n";
  return out;
}

// ---------- main ----------
const raw = await readFile(inPath, "utf8");
const bom = hasBOM(raw);
const text = stripBOM(raw);

const counts = new Map(); // simplified char -> { trad, count }
let converted = "";

// Single pass: convert (only unified ideographs), and collect preview stats
for (const ch of text) {
  const cp = ch.codePointAt(0);
  if (shouldConvert(cp)) {
    const trad = tify(ch);
    converted += trad;
    if (trad !== ch) {
      const cur = counts.get(ch);
      if (cur) { cur.count += 1; }
      else { counts.set(ch, { trad, count: 1 }); }
    }
  } else {
    converted += ch; // leave radicals, punctuation, ASCII, etc.
  }
}

// Preview rows sorted by descending frequency, then by codepoint
const previewRows = [...counts.entries()]
  .map(([s, {trad, count}]) => ({
    simplified: s,
    traditional: trad,
    count,
    u_s: "U+" + s.codePointAt(0).toString(16).toUpperCase().padStart(4, "0"),
    u_t: "U+" + trad.codePointAt(0).toString(16).toUpperCase().padStart(4, "0"),
  }))
  .sort((a,b) => b.count - a.count || a.simplified.codePointAt(0) - b.simplified.codePointAt(0));

// Write outputs
await writeFile(outPath, (bom ? "\uFEFF" : "") + converted, "utf8");
await writeFile(previewPath, toCSV(previewRows), "utf8");

// Console preview
const totalDistinct = previewRows.length;
const totalOccurrences = previewRows.reduce((n, r) => n + r.count, 0);
console.log(`Converted → ${outPath}`);
console.log(`Preview CSV → ${previewPath}`);
console.log(`Will convert ${totalDistinct} distinct chars (${totalOccurrences} occurrences). Top ${Math.min(maxPrint, totalDistinct)}:`);
console.table(previewRows.slice(0, maxPrint));
