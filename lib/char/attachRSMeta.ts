import { CharEntryMap, CharEntry, CharRSMeta } from "@lib/char/charTypes";
import { UnihanMap, UnihanRow } from "@lib/unihan/unihanTypes";
import { defaultCharKSMeta } from "./charFactories";
import { digitsOnly } from "./charUtils";

export const getRSMeta = (row: UnihanRow | undefined) => {
  const radResi = row?.fields?.kRSUnicode;
  const strokes = row?.fields?.kTotalStrokes;
  if (radResi === undefined || strokes === undefined) return null;

  const rsMeta = defaultCharKSMeta();
  let [radId, residual] = radResi[0]?.split('.');
  residual = residual.split(' ')[0];

  rsMeta.residual = residual;
  rsMeta.totalStrokes = strokes[0].split(' ')[0] ?? null;
  rsMeta.radicalId = digitsOnly(radId);

  return rsMeta;
}

export function attachRSMeta(
  charEntryMap: CharEntryMap,
  irgMap: UnihanMap,
): CharEntryMap {
  for (const [ch, entry] of Object.entries(charEntryMap)) {
    const row = irgMap.get(entry.unicode);
    entry.RSMeta = getRSMeta(row);
  }

  return charEntryMap;
}

