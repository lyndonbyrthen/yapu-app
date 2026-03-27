// lib/loadCharEntryMap.ts
import fs from "fs";
import { parse } from "csv-parse/sync";
import { defaultReadingsRecord } from "@lib/phonetics/phoneticFactories";
import { ReadingsRecord, RushengEntry } from "@lib/phonetics/phoneticTypes";
import { getBaxterPTK, getYapinTone, peelTone, YapinNumToTone, yapinToZhuyin } from "@lib/phonetics/phoneticUtils";
import { defaultCharEntry } from "./charFactories";
import { CharEntryMap, CharEntry } from "./charTypes";
import { MC_PATH, RUSHENG_MAP_PATH, YAPU_PATH } from "@lib/paths";
import { log, logStat } from "@lib/buildUtils";

export function buildBaseCharEntryMapFromCSV(csvPath: string): CharEntryMap {

  log(` Loading Yapu char map from csv`, 'HEADER');

  const raw = fs.readFileSync(csvPath, "utf8");

  const records = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  const yapuRaw = fs.readFileSync(YAPU_PATH, "utf8");
  const yapuRecords = parse(yapuRaw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  const map: CharEntryMap = {};

  let added = 0;

  const addYapuReading = (R: ReadingsRecord, yapuYapin: string) => {
    if (!yapuYapin) return;
    R["yapu:yapin"].push(yapuYapin);
    R["yapu:yapin"] = [...new Set(R["yapu:yapin"])];
  }

  for (const row of yapuRecords) {
    const chars: Array<string> = Array.from(row["chars"] ?? "");

    let yapuYapin = YapinNumToTone(row["yapu:yapin"]);
    const yapuSongdu = YapinNumToTone(row["songdu"]);

    for (const ch of chars) {

      logStat(`loading char ${ch}...`);
      logStat(``);

      if (!map[ch]) {
        const entry: CharEntry = defaultCharEntry(ch);
        // init readings with empty arrays
        if (!entry.readings) entry.readings = defaultReadingsRecord([
          "yapu:yapin",
          "yapu_songdu:yapin",
          "laoguoyin:yapin",
          "laoguoyin:zhuyin",
          "middleChinese:baxter",
          "middleChinese:fanqie",
        ]);
        map[ch] = entry;
        added++;
      }

      const entry = map[ch]!;
      const R = entry.readings as ReadingsRecord;

      addYapuReading(R, yapuYapin);
      addYapuReading(R, yapuSongdu);
    }
  }

  log(`${Object.entries(map).length} entries loaded.`, 'SUCCESS');
  log(`${added} entries added.`, 'SUCCESS');
  log(` Loading Laoguoyin char map from csv`, 'HEADER');

  let lgyCnt = 0, total = 0;

  for (const row of records) {
    const chars: Array<string> = Array.from(row["chars"] ?? "");

    const laoguoYapin = YapinNumToTone(row["laoguoyin:yapin"]);
    const laoguoZhuyin = yapinToZhuyin(row["laoguoyin:yapin"]);

    for (const ch of chars) {
      if (!map[ch]) {
        const entry: CharEntry = defaultCharEntry(ch);
        // init readings with empty arrays
        if (!entry.readings) entry.readings = defaultReadingsRecord([
          "yapu:yapin",
          "yapu_songdu:yapin",
          "laoguoyin:yapin",
          "laoguoyin:zhuyin",
          "middleChinese:baxter",
          "middleChinese:fanqie",
        ]);
        map[ch] = entry;
        lgyCnt++;
      }

      const entry = map[ch]!;
      const R = entry.readings as ReadingsRecord;

      if (laoguoYapin) {
        R["laoguoyin:yapin"].push(laoguoYapin);
        total++;
      }
      if (laoguoZhuyin) {
        R["laoguoyin:zhuyin"].push(laoguoZhuyin);
      }
    }
  }


  if (lgyCnt) log(`${lgyCnt} laoguoyin only entries added.`, 'WARNING');
  log(`Laoguoyin in ${total} entries updated.`, 'SUCCESS');

  return map;
}
