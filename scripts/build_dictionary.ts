import fs from "node:fs";
import path from "node:path";
import { CSV_PATH, IRG_SOURCES_PATH, KANGXI_PATH, MAPPINGS_PATH, OUT_JS, OUT_JSON, RADICAL_MAPS_PATH, READINGS_PATH, RS_META_PATH, UNIHAN_DIC_DATA_PATH, UNIHAN_VARIANTS_PATH } from "@lib/paths";
import { addMoreReadingsToCharEntryMap, loadUnihanFile } from "@lib/unihan/unihanUtils";
import { buildBaseCharEntryMapFromCSV } from "@lib/char/loadCharEntryMap";
import { attachVariants, } from "@lib/unihan/unihanVariantsUtils";
import { attachReadings } from "@lib/phonetics/attachReadings";
import { loadRadicals } from "@lib/char/buildRadicals";
import { attachRSMeta } from "@lib/char/attachRSMeta";
import { attachMCReadings } from "@lib/phonetics/attachMCreadings";
import { exportYapuPolyphonesCsv } from "@lib/analysis/PhoneticAnalysisUtils";
import { attachPTK, KXFanqieMap } from "@lib/phonetics/attachPTK";
import { buildDerivedPTK, buildKPhoneticMaps } from "@lib/unihan/buildKPhoneticMap";

// This script builds the Yapu dictionary by extracting data from multiple sources.

const charEntryMap = buildBaseCharEntryMapFromCSV(CSV_PATH);

const variantsMap = await loadUnihanFile(UNIHAN_VARIANTS_PATH);

const readingsMap = await loadUnihanFile(READINGS_PATH);

const irgMap = await loadUnihanFile(IRG_SOURCES_PATH);

// const dicDataMap = await loadUnihanFile(UNIHAN_DIC_DATA_PATH);

const kxMap: KXFanqieMap = JSON.parse(fs.readFileSync(KANGXI_PATH, "utf-8"));

attachVariants(charEntryMap, variantsMap);

attachRSMeta(
  charEntryMap,
  irgMap,
);

attachReadings(charEntryMap, readingsMap, kxMap);

attachMCReadings(charEntryMap);

attachPTK(charEntryMap);

const radicals = loadRadicals();
// buildRadicalsJSON();



const payload = { charEntryMap, ...radicals };
// console.log(payload)

fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
fs.writeFileSync(OUT_JSON, JSON.stringify(payload, null, 2), "utf8");
fs.writeFileSync(OUT_JS, `window.YAPU_DATA = ${JSON.stringify(payload)};`, "utf8");

console.log(
  `✅ Build done.`
);
