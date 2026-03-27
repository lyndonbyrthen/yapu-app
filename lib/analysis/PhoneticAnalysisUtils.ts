import fs from "fs";
import path from "path";
import { CharEntryMap, ReadingsRecord } from "@lib/char/charTypes";
import { ORTHOGRAPHY } from "@lib/phonetics/phoneticTypes";
import { parse } from "csv-parse/sync";
import { stripPinyinTone } from "@lib/phonetics/phoneticUtils";

const uniq = (xs?: string[]) => [...new Set((xs ?? []).map(s => s.trim()).filter(Boolean))];
const esc = (s: string) => /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;


/** Prefer marked rusheng endings (…p̊/…t̊/…k̊). If both base and marked exist, drop the base. */
const keepMarkedRusheng = (readings: string[]) => {
  const markedRe = /(p|t|k)\u030A$/;                 // ring ABOVE only
  const marked = readings.filter(r => markedRe.test(r));
  if (marked.length === 0) return readings;

  const bases = new Set(marked.map(r => r.replace(markedRe, "")));
  return readings.filter(r => markedRe.test(r) || !bases.has(r));
};

export const exportYapuPolyphonesCsv = (
  charEntryMap: CharEntryMap,
  outPath = "scripts/data/analysis/yapu_polyphones.csv"
) => {
  const rows: string[][] = [["char", "unicode", "yapu_readings", "pinyin_readings", "yapu_count", "pinyin_count"]];

  for (const [char, e] of Object.entries(charEntryMap)) {
    if (!e || e.alias) continue;

    const pinyin = uniq(e.readings?.[ORTHOGRAPHY.PUTONGHUA_PINYIN]);
    if (pinyin.length === 0) continue;              // omit when no Pinyin

    const yapu = uniq(keepMarkedRusheng(uniq(e.readings?.[ORTHOGRAPHY.YAPU_YAPIN] ?? [])));

    if (yapu.length > pinyin.length) {
      rows.push([
        char,
        e.unicode ? `U+${e.unicode.toUpperCase()}` : "",
        yapu.join(" "),
        pinyin.join(" "),
        String(yapu.length),
        String(pinyin.length),
      ]);
    }
  }

  if (rows.length > 1) {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, rows.map(r => r.map(esc).join(",")).join("\n"), "utf8");
  }
  return rows.length - 1; // data rows
};


/** key (indexColumn) → array of MC readings (readingColumn), aggregating duplicates */
export const loadCSVReadingsMap = (
  csvPath: string = 'scripts/data/dictionary/BaxterSagartOC2015-10-13.csv',
  indexColumn: string = 'zi',
  readingColumn: string = 'MC'
): Record<string, string[]> => {
  const raw = fs.readFileSync(csvPath, "utf8");
  const records: Record<string, string>[] = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  const map: Record<string, string[]> = {};
  for (const row of records) {
    const key = (row[indexColumn] ?? "").trim();
    if (!key) continue;

    const field = (row[readingColumn] ?? "").trim();
    if (!field) continue;

    const readings = field
      .split(/[,\s;、·･・／/；]+/)
      .map(s => s.trim())
      .filter(Boolean);

    if (!map[key]) map[key] = [];
    map[key].push(...readings);
    map[key] = [...new Set(map[key])];
  }

  return map;
};

