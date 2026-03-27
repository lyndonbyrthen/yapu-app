import { CharEntry, CharEntryMap } from "@lib/char/charTypes";
import { getBaxterPTK, getCantonesePTK, getFinalPTK, getRushengFinal, getYapinTone, hasFinalPTK } from "./phoneticUtils"
import { Tone } from "./spellingInventory"
import { BAXTER_MC_MAP_PATH, DERIVED_PTK_PATH, KANGXI_PATH, YAPU_OVERRIDE_PATH } from "@lib/paths";
import { fs } from "zx";
import { ORTHOGRAPHY, RushengEntry, RushengFinal } from "./phoneticTypes";
import { log } from "@lib/buildUtils";
import { sortObjectKeys } from "@lib/generalUtils";
import { uPlusToChar } from "@lib/char/charUtils";

export type CharMCMap = Record<string, Array<string>>

const OUT_INCONSISTENT = 'scripts/data/analysis/rusheng_inconsistent.json';
const OUT_NO_RUSHENG = 'scripts/data/analysis/missing_rusheng.json';
const KX_NO_HIT = 'scripts/data/analysis/kx_misses.json';

export const getPTKUnihanFanqie = (
    entry: CharEntry,
    map: CharEntryMap
): RushengFinal | "" => {
    const fanqieChars = entry?.readings?.[ORTHOGRAPHY.MIDDLE_CHINESE_FANQIE].map(s => s[1]) || [];
    const ptks = fanqieChars.map(char => {
        const ch = map[char]?.alias ? map[char].alias : char;
        const ptk = getFinalPTK(map[ch]?.readings?.[ORTHOGRAPHY.YAPU_YAPIN].find(syl => hasFinalPTK(syl)) || "");
        return ptk;
    });
    return ptks.find(s => hasFinalPTK(s)) || "";
}

type KXFanqieEntry = { fanqie?: string; sound?: string; redirects?: string };
export type KXFanqieMap = Record<string, KXFanqieEntry>;

export const getKXFanqie = (
    entry: CharEntry,
    charEntryMap: CharEntryMap,
    kxMap: KXFanqieMap
): RushengFinal | null => {
    const key = uPlusToChar(entry?.unicode);
    if (!key) return null;

    const kx = kxMap[key];
    if (!kx) return null;

    const pair = (kx.fanqie ?? "").trim();
    const snd = (kx.sound ?? "").trim();

    // prefer fanqie-second; else first sound char
    const donor = (pair[1] ?? "") || (snd[0] ?? "");
    if (!donor) return null;

    const donorEntry = charEntryMap[donor];
    const forms = donorEntry?.readings?.[ORTHOGRAPHY.YAPU_YAPIN] ?? [];
    for (const f of forms) {
        if (hasFinalPTK(f)) {
            const p = getFinalPTK(f);
            if (p) return p; // "p̊" | "t̊" | "k̊"
        }
    }
    return null;
};

export const attachPTK = (charEntryMap: CharEntryMap) => {
    log(`  加入聲尾音 Attaching p̊t̊k̊ finals to rusheng syllables.`, "HEADER");

    const ptkMap: Record<string, any> = JSON.parse(fs.readFileSync(DERIVED_PTK_PATH, "utf-8"));
    const yapuMap: CharEntryMap = JSON.parse(fs.readFileSync(YAPU_OVERRIDE_PATH, "utf-8"));
    const kxMap: KXFanqieMap = JSON.parse(fs.readFileSync(KANGXI_PATH, "utf-8"));


    let tone5Cnt = 0, fromMC = 0, fromDerived = 0, fromFanqie = 0, fromKX = 0, fromCant = 0;

    const diffMCRusheng: Record<string, any> = {};
    const noMCRusheng: Record<string, any> = {};

    Object.entries(charEntryMap).forEach(([char, entry]) => {

        if (!entry.readings) return;
        if (yapuMap[char]?.readings?.[ORTHOGRAPHY.YAPU_YAPIN]) {
            entry.readings[ORTHOGRAPHY.YAPU_YAPIN] = yapuMap[char].readings[ORTHOGRAPHY.YAPU_YAPIN];
            return;
        }

        const readings = entry.readings[ORTHOGRAPHY.YAPU_YAPIN];
        const mcReadings = entry.readings[ORTHOGRAPHY.MIDDLE_CHINESE_BAXTER];
        const mcPTK = getBaxterPTK(mcReadings?.find((s) => getBaxterPTK(s)));

        let isAddedFromMC = false;



        const newReadings = readings.map((s) => {
            if (getYapinTone(s) !== 5 as Tone) return s;
            if (hasFinalPTK(s)) return s;

            // using middle chinese reading for ptk
            if (mcPTK) {
                isAddedFromMC = true;
                return s + mcPTK;
            } else {
                // Yayin reading is rusheng but Middle Chinese reading is not rusheng, i.e., Baxter has no ptk endings.
                if (mcReadings && mcReadings.length > 0) {
                    !diffMCRusheng[char] && (diffMCRusheng[char] = charEntryMap[char]);
                }
            }
            return s;
        });

        if (isAddedFromMC) fromMC++;
        entry.readings[ORTHOGRAPHY.YAPU_YAPIN] = newReadings;
    });

    // Making a second pass, try adding the ptk final according to franqie, derived finals (from similar chars), or Cantonese final, in that order.
    Object.entries(charEntryMap).forEach(([char, entry]) => {

        if (!entry.readings) return;
        if (yapuMap[char]?.readings?.[ORTHOGRAPHY.YAPU_YAPIN]) {
            entry.readings[ORTHOGRAPHY.YAPU_YAPIN] = yapuMap[char].readings[ORTHOGRAPHY.YAPU_YAPIN];
            return;
        }

        const readings = entry.readings[ORTHOGRAPHY.YAPU_YAPIN];
        const ptk = getPTKUnihanFanqie(entry, charEntryMap);
        const kxPTK = getKXFanqie(entry, charEntryMap, kxMap);
        const deriveFinal: Record<string, any> = ptkMap[char]?.['deriveFinal'];
        const cantPTK = getCantonesePTK(
            entry.readings?.[ORTHOGRAPHY.CANTONESE_JYUTPING]?.find(syl => getCantonesePTK(syl)) || ""
        );

        let isAddedFromFanqie = false;
        let isAddedFromKX = false;
        let isAddedFromDerived = false;
        let isAddedFromCantonese = false;

        let isTone5 = false;

        const newReadings = readings.map((s) => {
            if (getYapinTone(s) !== 5 as Tone) return s;
            isTone5 = true;
            if (hasFinalPTK(s)) return s;

            if (ptk) { // unihan's fanqie
                isAddedFromFanqie = true;
                return s + ptk;
            } else if (kxPTK) {// kangxi's fanqie
                isAddedFromKX = true;
                return s + kxPTK;
            }

            // if no fanqie, then try finals derived from phonetic groups
            // If there are multiple derived finals, then we cannot use the derived finals. 
            if (deriveFinal?.length == 1) {
                isAddedFromDerived = true;
                return s + deriveFinal[0];
            }

            if (cantPTK) {
                isAddedFromCantonese = true;
                return s + cantPTK;
            }

            noMCRusheng[char] = entry;
            return s;
        });

        if (isTone5) tone5Cnt++;
        if (isAddedFromDerived) fromDerived++;
        if (isAddedFromFanqie) fromFanqie++;
        if (isAddedFromKX) fromKX++;
        if (isAddedFromCantonese) fromCant++;

        entry.readings[ORTHOGRAPHY.YAPU_YAPIN] = newReadings;

    });

    log(`${tone5Cnt} entries have checked tones.`, 'INFO');
    log(`1. ${fromMC} entries have finals derived from middle chinese readings.`, 'SUCCESS');
    log(`2. ${fromFanqie} entries have finals derived from unihan & kangxi Fanqie.`, 'SUCCESS');
    log(`3. ${fromDerived} entries have finals derived from phonetic groups.`, 'SUCCESS');
    log(`4. ${fromCant} entries have finals derived from Jyutping.`, 'SUCCESS');
    log(`${Object.entries(noMCRusheng).length} checked tone entries still miss ptk finals.`, 'WARNING');
    log(`${Object.entries(diffMCRusheng).length} entries are rusheng inconsistent with middle chinese.`, 'WARNING');
    // log(`${Object.keys(noMCRusheng)}`, 'WARNING');

    fs.writeFileSync(
        OUT_NO_RUSHENG,
        JSON.stringify(sortObjectKeys(noMCRusheng)),
        "utf8");
    log(`${OUT_NO_RUSHENG} written - chars missing rusheng.`, 'SUCCESS');

    fs.writeFileSync(
        OUT_INCONSISTENT,
        JSON.stringify(sortObjectKeys(diffMCRusheng)),
        "utf8");
    log(`${OUT_INCONSISTENT} written - inconsistent rusheng.`, 'SUCCESS');

}