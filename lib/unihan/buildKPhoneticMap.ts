import { CharEntryMap } from "@lib/char/charTypes";
import { UnihanMap } from "./unihanTypes";
import { log } from "@lib/buildUtils";
import { uniq, uPlusToChar } from "@lib/char/charUtils";
import { fs } from "zx";
import { sortObjectKeys } from "@lib/generalUtils";
import { ORTHOGRAPHY, RushengFinal } from "@lib/phonetics/phoneticTypes";
import { getFinalPTK, hasFinalPTK, peelTone } from "@lib/phonetics/phoneticUtils";

const OUT_JSON_CHAR = "scripts/data/analysis/char_phoneticGroups.json";
const OUT_JSON_GROUP = "scripts/data/analysis/phoneticGroup_Chars.json";
const OUT_JSON_DERIVED_PTK = "scripts/data/analysis/kPhonetic_derived_ptk.json";

export const parseUnihanKPhonetic = (dicDataMap: UnihanMap) => {
    log(`  Getting KPhonetic data from Unihan`, 'HEADER');

    const map: Record<string, Array<string>> = {};
    dicDataMap.forEach((row, unicode) => {
        const ph = row.fields.kPhonetic?.[0].split(' ').map(k => k.trim());
        if (!ph) return;
        const char = uPlusToChar(unicode);
        if (!map[char]) map[char] = [];
        map[char] = [...map[char], ...ph];
    });

    const sortedMap = sortObjectKeys(map);

    log(`${Object.keys(sortedMap).length} entries retrieved`, 'SUCCESS');

    fs.writeFileSync(OUT_JSON_CHAR, JSON.stringify(sortedMap), "utf8");

    log(`${OUT_JSON_CHAR} written.`, 'SUCCESS');

    return sortedMap;
}

export const buildPhoneticGroups = (map: Record<string, string[]>) => {

    log(`  Building phonetic groups`, 'HEADER');

    const rMap: Record<string, string[]> = {};
    Object.entries(map).forEach(([char, arr]) => {
        arr.forEach((n => {
            if (!rMap[n]) rMap[n] = [];
            rMap[n].push(char);
            rMap[n] = uniq(rMap[n]);
            rMap[n].sort();
        }));
    });

    const sortedMap = sortObjectKeys(rMap);

    fs.writeFileSync(OUT_JSON_GROUP, JSON.stringify(sortedMap), "utf8");

    log(`${OUT_JSON_GROUP} written.`, 'SUCCESS');

    return sortedMap;
}

export const compareEntries = (m1, m2) => {
    Object.entries(m1).forEach(([char, arr]) => {
        if (arr && arr.length) {
            if (!m2[char]) return

            if (m2[char]?.sort().join('_') !== m1[char].sort().join('_')) log(`${char} not equal, ${arr}  :: ${m2[char]}`, 'WARNING')
        }
    })
}


export type PhoneticMap = Record<string, string[]>;

export const getPhoneticallyRelatedChars = (char: string, charPhMap: PhoneticMap, phCharMap: PhoneticMap) => {

    const gs = charPhMap[char];
    if (!gs) return [];

    // getting all phonetically related chars
    let chars: string[] = [];

    gs.forEach((g: string) => {
        const id = g.replace(/\D+/g, "");
        // all possible subgroups
        ['', 'A', 'B', 'C', 'D', '*'].forEach(s => {
            const gId = id + s;
            if (!phCharMap[gId]) return;
            chars = [...chars, ...phCharMap[gId]];
        });
    });

    return uniq(chars).sort();
}

export const getCharsPTK = (chars: string[], charEntryMap: CharEntryMap) => {
    const ptkMap: Record<string, number> = {};
    chars.forEach(ch => {
        const syls = charEntryMap[ch]?.readings?.[ORTHOGRAPHY.YAPU_YAPIN];
        if (!syls) return;
        syls.forEach(s => {
            const f = getFinalPTK(s);
            if (!f) return;
            if (!ptkMap[f]) ptkMap[f] = 0;
            !ptkMap[f]++;
        });
    });

    return sortObjectKeys(ptkMap);
}

export const getMajorityPTKs = (counts: Record<string, number>) => {
    const max = Math.max(...Object.values(counts));
    return Object.entries(counts)
        .filter(([_, v]) => v === max)
        .map(([k]) => k);
};

export const buildDerivedPTK = (charEntryMap: CharEntryMap) => {
    log(`  Building a derived p̊t̊k̊ map.`, "HEADER");

    const charPhMap = JSON.parse(fs.readFileSync(OUT_JSON_CHAR, "utf8"));
    const phCharMap = JSON.parse(fs.readFileSync(OUT_JSON_GROUP, "utf8"));

    const byPhoneticGroup: Record<string, any> = {};

    let relatedFound = 0, missingPTK = 0, noRelatedPTK = 0, derivedCnt = 0;

    Object.entries(charEntryMap).forEach(([char, entry]) => {
        const syls = entry.readings?.[ORTHOGRAPHY.YAPU_YAPIN];
        if (!syls) return;
        const noPTK: string[] = [];

        syls.forEach(syl => {
            if (peelTone(syl).tone !== 5) return;
            if (hasFinalPTK(syl)) return;
            noPTK.push(syl)
        });

        if (noPTK.length < 1) return;

        missingPTK++;
        byPhoneticGroup[char] = {};

        const related = getPhoneticallyRelatedChars(char, charPhMap, phCharMap);
        if (related.length < 1) return;

        relatedFound++;

        const ptkCount = getCharsPTK(related, charEntryMap);
        const deriveFinal = getMajorityPTKs(ptkCount);

        if (Object.entries(ptkCount).length < 1) noRelatedPTK++;

        if (deriveFinal.length > 0) derivedCnt++;

        byPhoneticGroup[char] = {
            char,
            related,
            ptkCount,
            deriveFinal,
        };
        // console.log(byPhoneticGroup[char]);
    });

    log(`${missingPTK} entries miss ptk.`, "INFO");
    log(`${relatedFound} entries have phonetically related chars.`, "INFO");
    log(`${noRelatedPTK} entries have no ptk in related chars.`, "INFO");

    fs.writeFileSync(OUT_JSON_DERIVED_PTK, JSON.stringify(sortObjectKeys(byPhoneticGroup)), "utf8");

    log(`${derivedCnt} p̊t̊k̊ finals derived. ${OUT_JSON_DERIVED_PTK} written.`, "SUCCESS");
    log(`${missingPTK - derivedCnt} entries are still missing p̊t̊k̊ finals.`, "WARNING");

}

export const buildKPhoneticMaps = (charEntryMap: CharEntryMap, dicDataMap: UnihanMap) => {
    // const kPhMap = parseUnihanKPhonetic(dicDataMap);
    // const rMap = buildPhoneticGroups(kPhMap);
    // buildDerivedPTK(charEntryMap);
}