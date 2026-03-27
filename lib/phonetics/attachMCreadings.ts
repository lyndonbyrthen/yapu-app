import { loadCSVMap, parseJsonFile } from "@lib/fileUtils";
import { CharEntryMap } from "../char/charTypes";
import { BAXTER_MC_MAP_PATH, MC_PATH, WIK_CHAR_META_PATH, WIK_MC_MAP_PATH } from "@lib/paths";
import { ORTHOGRAPHY } from "@lib/phonetics/phoneticTypes";
import { fs } from "zx";
import { WikCharMeta } from "scripts/wiktionary/wikUtils";
import { uniq } from "@lib/char/charUtils";
import { log } from "@lib/buildUtils";

let cnt = 0, total = 0;

export const attachMCReadings = (charEntryMap: CharEntryMap) => {
    const baxMap = JSON.parse(fs.readFileSync(BAXTER_MC_MAP_PATH, "utf8"));
    const wikMap: Record<string, WikCharMeta> = JSON.parse(fs.readFileSync(WIK_CHAR_META_PATH, "utf8"));

    Object.entries(charEntryMap).forEach(([char, entry]) => {
        if (!(entry && entry.readings)) return;
        // mc readings from wiktionary
        const wReadings = wikMap[char]?.readings?.baxter ?? [];
        // mc readings from baxter's csv
        const bReadings = baxMap[char] ?? [];

        total++;

        const entryMC = entry.readings[ORTHOGRAPHY.MIDDLE_CHINESE_BAXTER];

        // if (!wReadings.length) console.log(char, 'no wik mc',
        //     bReadings, entryMC);
        // if (!pinReadings.length) console.log(char, 'no wik pinyin', wikMap[char]?.redirects, 
        //     entry.readings?.[ORTHOGRAPHY.PUTONGHUA_PINYIN],entry.readings?.[ORTHOGRAPHY.YAPU_YAPIN]);

        let mcReadings: Array<string> = [...wReadings, ...bReadings];

        if (!entryMC) {
            console.log(entryMC,char);
            return;
        }

        entry.readings[ORTHOGRAPHY.MIDDLE_CHINESE_BAXTER] = uniq([...entryMC, ...mcReadings]);

        if (!entry.readings[ORTHOGRAPHY.MIDDLE_CHINESE_BAXTER].length) cnt++;

    });

    log(`  Attaching middle chinese readings from Baxter and Wiktionary`, 'HEADER');
    log(`${Object.entries(charEntryMap).length} total entries.`, 'SUCCESS');
    log(`${total} middle chinese readings attached.`, 'SUCCESS');
    if (cnt) log(`${cnt} entries have no middle chinese readings.`, 'WARNING');
}