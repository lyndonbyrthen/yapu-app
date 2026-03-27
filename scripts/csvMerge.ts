import fs from "node:fs";
import alasql from "alasql";
import { parse } from "csv-parse/sync";

const KEY = "laoguoyin:yapin" as const;

// Parse CSVs to arrays of row-objects (diacritics preserved)
const v4 = parse(fs.readFileSync("scripts/data/csv/1926年《校改國音字典》v4.csv", "utf8"), {
  columns: true, skip_empty_lines: true,
});
const lg = parse(fs.readFileSync("scripts/data/csv/老國音常用字.csv", "utf8"), {
  columns: true, skip_empty_lines: true,
});

// FULL OUTER JOIN
const merged = alasql(
  `SELECT *
   FROM ? AS v4
   FULL OUTER JOIN ? AS lg
     ON v4.[${KEY}] = lg.[${KEY}]`,
  [v4, lg]
);

// ONLY IN v4
const onlyInV4 = alasql(
  `SELECT v4.*
     FROM ? AS v4
LEFT JOIN ? AS lg
       ON v4.[${KEY}] = lg.[${KEY}]
    WHERE lg.[${KEY}] IS NULL`,
  [v4, lg]
);

// ONLY IN 老國音常用字
const onlyInLG = alasql(
  `SELECT lg.*
     FROM ? AS lg
LEFT JOIN ? AS v4
       ON lg.[${KEY}] = v4.[${KEY}]
    WHERE v4.[${KEY}] IS NULL`,
  [lg, v4]
);

// DIFFS: keys in both where chars != freq_chars
const diffs = alasql(
  `SELECT v4.[${KEY}] AS [${KEY}], v4.[chars] AS chars, lg.[freq_chars] AS freq_chars
     FROM ? AS v4
INNER JOIN ? AS lg
       ON v4.[${KEY}] = lg.[${KEY}]
    WHERE (v4.[chars] IS NULL AND lg.[freq_chars] IS NOT NULL)
       OR (v4.[chars] IS NOT NULL AND lg.[freq_chars] IS NULL)
       OR (v4.[chars] <> lg.[freq_chars])`,
  [v4, lg]
);

console.log({ merged: merged.length, onlyInV4: onlyInV4.length, onlyInLG: onlyInLG.length, diffs: diffs.length });

// Optional CSV exports (one-liners)
// alasql('SELECT * INTO CSV("scripts/data/csv/only_in_v4.csv",{headers:true,separator:","}) FROM ?', [onlyInV4]);
// alasql('SELECT * INTO CSV("scripts/data/csv/only_in_老國音常用字.csv",{headers:true,separator:","}) FROM ?', [onlyInLG]);
// alasql('SELECT * INTO CSV("scripts/data/csv/diff_chars_vs_freq_chars.csv",{headers:true,separator:","}) FROM ?', [diffs]);
alasql('SELECT * INTO CSV("scripts/data/csv/mergedlgy.csv",{headers:true,separator:","}) FROM ?', [merged]);
