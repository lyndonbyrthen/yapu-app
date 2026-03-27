import fs from "fs";
import { Radical } from "./charTypes";
import { charToUPlus } from "./charUtils";
import { UnihanMap } from "@lib/unihan/unihanTypes";
import { getRSMeta } from "./attachRSMeta";
import { defaultRadical } from "./charFactories";


export const getKangxiRadicalMap = () => {
  const start = 0x2F00; // Kangxi Radicals block start
  const count = 214;    // total radicals
  const map: Record<string, Radical> = {};

  for (let i = 0; i < count; i++) {
    const id = (i + 1).toString();
    const char = String.fromCodePoint(start + i);
    map[id] = defaultRadical();
    map[id].kxGlyph = char;
  }

  return map;
};

export type RadicalMaps = {
  KangxiRadicals: Record<string, Radical>;
  SimplifiedRadicals: Record<string, Radical>;
}

export const loadRadicals = () => {
  return JSON.parse(fs.readFileSync('scripts/data/radicals/master_radicals.json', "utf8"));
}


