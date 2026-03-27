#!/usr/bin/env node
// Preview & Merge two CSVs that each have: laoguoyin, chars
//
// What it does (strict laoguoyin↔laoguoyin, no normalization):
//  1) PREVIEW (diff):
//     - left_minus_right: for keys present in BOTH, list chars in LEFT that are missing in RIGHT
//     - left_only_keys  : keys present in LEFT but absent in RIGHT (include LEFT chars)
//  2) MERGE (UPDATED):
//     - Augments the RIGHT CSV, preserving RIGHT's columns/order (e.g., yapin, laoguoyin, zhaopin, chars):
//       • For shared keys: append missing chars from LEFT into RIGHT.chars (stable union).
//       • For left-only keys: append new rows following RIGHT's header; fill yapin/zhaopin from LEFT if present, else blank.
//
// Usage:
//   node preview_and_merge_csv.js \
//     --left  ./data/csv/laoguoyin_freq_used.csv \
//     --right "./data/csv/1926年《校改國音字典》v3.csv" \
//     [--preview-only | --merge-only]
//
// Options:
//   --sep ,                         CSV delimiter (default ",")
//   --preview-only                  Only write the preview (diff) outputs
//   --merge-only                    Only write the merged output
//   --order left-first|right-first  Char precedence when merging shared keys (default left-first)
//   --rowOrder left-first|alpha     Row order for appended keys (default left-first)
// Output filenames (override with flags if you like):
//   --outDiffMissing   ./data/csv/left_minus_right_chars.csv
//   --outDiffLeftOnly  ./data/csv/left_keys_missing_in_right.csv
//   --outMerged        ./data/csv/right_augmented.csv
//   --outAudit         ./data/csv/merge_audit.csv
//
// No external packages required.


/*   
    Usage:
    node preview_and_merge_csv.js \
        --left  ./data/csv/laoguoyin_freq_used.csv \
        --right "./data/csv/1926年《校改國音字典》v3.csv" \
        --preview-only 

    node preview_and_merge_csv.js \
        --left  ./data/csv/laoguoyin_freq_used.csv \
        --right "./data/csv/1926年《校改國音字典》v3.csv" 
*/

import { readFile, writeFile } from "fs/promises";

// ---------- CLI ----------
const args = Object.fromEntries(
  process.argv.slice(2).map((a, i, arr) => a.startsWith("--")
    ? [a.slice(2), (arr[i + 1] && !arr[i + 1].startsWith("--")) ? arr[i + 1] : true]
    : null
  ).filter(Boolean)
);
function die(msg) { console.error(msg); process.exit(1); }

const LEFT = args.left || die("Missing --left csv");
const RIGHT = args.right || die("Missing --right csv");
const SEP = (args.sep ?? ",").toString();
const PREVIEW_ONLY = !!args["preview-only"];
const MERGE_ONLY = !!args["merge-only"];
const DO_PREVIEW = PREVIEW_ONLY || !MERGE_ONLY;
const DO_MERGE = MERGE_ONLY || !PREVIEW_ONLY;

const ORDER = (args.order ?? "left-first");          // char precedence when unioning shared keys
const ROW_ORDER = (args.rowOrder ?? "left-first");   // ordering for appended left-only keys

const OUT_DIFF_MISSING = args.outDiffMissing || "./data/csv/left_minus_right_chars.csv";
const OUT_DIFF_LEFTONLY = args.outDiffLeftOnly || "./data/csv/left_keys_missing_in_right.csv";
const OUT_MERGED = args.outMerged || "./data/csv/right_augmented.csv";
const OUT_AUDIT = args.outAudit || "./data/csv/merge_audit.csv";

// ---------- minimal CSV parse/stringify ----------
function stripBOM(s) { return s && s.charCodeAt(0) === 0xFEFF ? s.slice(1) : s; }
function parseCSV(text, sep = ",") {
  text = stripBOM(String(text));
  const rows = [];
  let row = []; let field = ""; let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        const next = text[i + 1];
        if (next === '"') { field += '"'; i++; } else { inQuotes = false; }
      } else field += ch;
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === sep) { row.push(field); field = ""; }
      else if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ""; }
      else if (ch === '\r') { /* ignore; rely on \n */ }
      else field += ch;
    }
  }
  row.push(field); rows.push(row);
  if (!rows.length) return [];
  const header = rows[0];
  return rows.slice(1).filter(r => r.some(v => v !== "")).map(r => {
    const obj = {}; for (let i = 0; i < header.length; i++) obj[header[i]] = r[i] ?? ""; return obj;
  });
}
function csvEscape(val) {
  let s = String(val ?? "");
  const need = s.includes('"') || s.includes(',') || s.includes('\n') || s.includes('\r');
  if (s.includes('"')) s = s.replace(/"/g, '""');
  return need ? `"${s}"` : s;
}
function stringifyCSV(rows) {
  if (!rows.length) return "";
  const cols = [...new Set(rows.flatMap((r, i) => i ? Object.keys(r) : Object.keys(rows[0])))];
  let out = cols.map(csvEscape).join(",") + "\n";
  for (const r of rows) out += cols.map(c => csvEscape(r[c])).join(",") + "\n";
  return out;
}

// NEW: get header (array) while keeping existing parseCSV intact
function parseCSVMatrix(text, sep = ",") {
  text = stripBOM(String(text));
  const rows = [];
  let row = []; let field = ""; let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        const next = text[i + 1];
        if (next === '"') { field += '"'; i++; } else { inQuotes = false; }
      } else field += ch;
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === sep) { row.push(field); field = ""; }
      else if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ""; }
      else if (ch === '\r') { /* ignore */ }
      else field += ch;
    }
  }
  row.push(field); rows.push(row);
  return rows; // [ [header...], [r1...], ... ]
}
// NEW: stringify with fixed header order (preserve RIGHT schema)
function stringifyCSVWithHeader(rows, headerOrder) {
  let out = headerOrder.join(",") + "\n";
  for (const r of rows) out += headerOrder.map(c => csvEscape(r[c])).join(",") + "\n";
  return out;
}

// ---------- shared char utils ----------
const SEP_CHARS = new Set([",", "，", "、", ";", "；", "/", "|", " ", "\t", "\r", "\n"]);
function orderedUniqueChars(s) {
  const out = []; const seen = new Set();
  for (const ch of String(s)) {
    if (SEP_CHARS.has(ch)) continue;  // ignore separators/whitespace
    if (!seen.has(ch)) { seen.add(ch); out.push(ch); }
  }
  return out.join("");
}
function mergeOrdered(a, b) { // append only new chars from b, preserve each side's order
  const seen = new Set(a); const out = [...a];
  for (const ch of b) if (!seen.has(ch)) { seen.add(ch); out.push(ch); }
  return out.join("");
}

// ---------- build maps (shared between preview & merge) ----------
function buildKeyToChars(rows) {
  // returns { map: Map<key,string>, order: string[] } merging duplicates per key
  const map = new Map(); const order = [];
  for (const r of rows) {
    const key = String(r.laoguoyin || "").trim();
    if (!key) continue;
    const chars = orderedUniqueChars(r.chars);
    const prior = map.get(key) || "";
    if (!map.has(key)) order.push(key);
    map.set(key, mergeOrdered(prior, chars));
  }
  return { map, order };
}

// ---------- main ----------
(async () => {
  const leftCSV = await readFile(LEFT, "utf-8");
  const rightCSV = await readFile(RIGHT, "utf-8");

  // objects for preview logic
  const leftRows = parseCSV(leftCSV, SEP);
  const rightRows = parseCSV(rightCSV, SEP);

  if (!leftRows.length) die("Left CSV has no rows.");
  if (!rightRows.length) die("Right CSV has no rows.");
  for (const req of ["laoguoyin", "chars"]) {
    if (!(req in leftRows[0])) die(`Left CSV must have column: ${req}`);
    if (!(req in rightRows[0])) die(`Right CSV must have column: ${req}`);
  }

  // headers (array) for preserving RIGHT schema during merge
  const leftMatrix = parseCSVMatrix(leftCSV, SEP);
  const rightMatrix = parseCSVMatrix(rightCSV, SEP);
  const lHeader = leftMatrix[0] || [];
  const rHeader = rightMatrix[0] || [];
  // sanity: ensure RIGHT has expected schema columns
  for (const req of ["yapin", "laoguoyin", "zhaopin", "chars"]) {
    if (!rHeader.includes(req)) die("Right CSV must include columns: yapin, laoguoyin, zhaopin, chars");
  }
  const leftHasYapin = lHeader.includes("yapin");
  const leftHasZhaopin = lHeader.includes("zhaopin");

  const { map: leftMap, order: leftOrder } = buildKeyToChars(leftRows);
  const { map: rightMap, order: rightOrder } = buildKeyToChars(rightRows);

  // ---------- PREVIEW (diffs) ----------
  if (DO_PREVIEW) {
    // 1) For shared keys: left minus right (missing in right)
    const rowsMissing = [];
    for (const [key, lchars] of leftMap.entries()) {
      if (!rightMap.has(key)) continue;
      const rset = new Set(rightMap.get(key));
      const missing = [...lchars].filter(ch => !rset.has(ch));
      if (missing.length) {
        rowsMissing.push({
          laoguoyin: key,
          missing_count: missing.length,
          missing_chars: missing.join(""),
          left_chars: lchars,
          right_chars: rightMap.get(key)
        });
      }
    }
    rowsMissing.sort((a, b) => b.missing_count - a.missing_count || a.laoguoyin.localeCompare(b.laoguoyin));
    await writeFile(OUT_DIFF_MISSING, stringifyCSV(rowsMissing), "utf-8");

    // 2) Keys only in LEFT (include left chars)
    const rowsLeftOnly = [];
    for (const [key, lchars] of leftMap.entries()) {
      if (!rightMap.has(key)) {
        rowsLeftOnly.push({ laoguoyin: key, left_chars: lchars });
      }
    }
    rowsLeftOnly.sort((a, b) => a.laoguoyin.localeCompare(b.laoguoyin));
    await writeFile(OUT_DIFF_LEFTONLY, stringifyCSV(rowsLeftOnly), "utf-8");

    console.log("[preview done]");
    console.log(" • Left-minus-right diff:", OUT_DIFF_MISSING);
    console.log(" • Left-only keys      :", OUT_DIFF_LEFTONLY);
  }

  // ---------- MERGE ----------
  if (DO_MERGE) {
    // Start from RIGHT rows and preserve RIGHT schema
    const rHeader = Object.keys(rightRows[0]);           // keep RIGHT column order
    const outRows = rightRows.map(r => ({ ...r }));      // mutable copy

    // Index RIGHT by laoguoyin (first occurrence wins)
    const rightIndex = new Map();
    outRows.forEach((row, idx) => {
      const k = String(row.laoguoyin || "").trim();
      if (k && !rightIndex.has(k)) rightIndex.set(k, idx);
    });

    const auditRows = [];

    // 1) Update SHARED keys: add missing chars from LEFT into RIGHT.chars (stable union)
    for (const [key, lchars] of leftMap.entries()) {
      const idx = rightIndex.get(key);
      if (idx == null) continue; // not shared
      const before = orderedUniqueChars(outRows[idx].chars);
      // RIGHT-first ordering, then add LEFT-only chars
      const merged = mergeOrdered(before, lchars);
      if (merged !== before) {
        outRows[idx].chars = merged;
        const beforeSet = new Set(before);
        const addedFromLeft = [...merged].filter(ch => !beforeSet.has(ch)).length;
        auditRows.push({
          laoguoyin: key,
          source: "both",
          left_count: lchars.length,
          right_count: before.length,
          merged_count: merged.length,
          added_from_right: 0,
          added_from_left: addedFromLeft
        });
      } else {
        auditRows.push({
          laoguoyin: key,
          source: "both",
          left_count: lchars.length,
          right_count: before.length,
          merged_count: before.length,
          added_from_right: 0,
          added_from_left: 0
        });
      }
    }

    // 2) Append LEFT-ONLY keys as RIGHT-shaped rows
    const leftOnlyKeys =
      ROW_ORDER === "alpha"
        ? [...leftMap.keys()].filter(k => !rightIndex.has(k)).sort((a, b) => a.localeCompare(b))
        : leftOrder.filter(k => !rightIndex.has(k)); // preserve LEFT file order

    const leftHasYapin = "yapin" in (leftRows[0] || {});
    const leftHasZhaopin = "zhaopin" in (leftRows[0] || {});

    for (const key of leftOnlyKeys) {
      const lchars = leftMap.get(key) || "";
      const seed = leftRows.find(r => String(r.laoguoyin || "").trim() === key) || {};
      const newRow = {};
      for (const col of rHeader) {
        if (col === "laoguoyin") newRow[col] = key;
        else if (col === "chars") newRow[col] = lchars;
        else if (col === "yapin") newRow[col] = leftHasYapin ? (seed.yapin || "") : "";
        else if (col === "zhaopin") newRow[col] = leftHasZhaopin ? (seed.zhaopin || "") : "";
        else newRow[col] = ""; // preserve any extra RIGHT columns with blanks
      }
      outRows.push(newRow);

      auditRows.push({
        laoguoyin: key,
        source: "left",
        left_count: lchars.length,
        right_count: 0,
        merged_count: lchars.length,
        added_from_right: 0,
        added_from_left: lchars.length
      });
    }

    // Write augmented RIGHT using RIGHT's header order
    const mergedCSV = stringifyCSVWithHeader(outRows, rHeader);
    await writeFile(OUT_MERGED, mergedCSV, "utf-8");

    // Audit (what changed)
    await writeFile(OUT_AUDIT, stringifyCSV(auditRows), "utf-8");

    console.log("[merge done]");
    console.log(" • Merged CSV:", OUT_MERGED);
    console.log(" • Audit CSV :", OUT_AUDIT);
    console.log(`   Updated rows: ${auditRows.filter(r => r.source === 'both' && r.added_from_left > 0).length} | Added rows: ${leftOnlyKeys.length}`);
  }


})();
