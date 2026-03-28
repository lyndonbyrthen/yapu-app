import { loadCharEntryMap } from "@lib/analysis/analysisUtils";
import { log } from "@lib/buildUtils";
import { PINYIN_TO_YAPIN_CSV, YAPU_DICTIONARY_JSON_PATH } from "@lib/paths";
import { parse } from "csv-parse/sync";
import { fs } from "zx";
import { addYapinAccent, hasFinalPTK, normalizeSyllable, peelTone } from "@lib/phonetics/phoneticUtils";
import { ORTHOGRAPHY } from "@lib/phonetics/phoneticTypes";

/**
 * Aligns Yapu readings to Pinyin order and applies Pinyin tones using addYapinAccent.
 */
export function alignYapuToPinyin(
    ypArr: string[],
    pthArr: string[],
    pinyinMap: Record<string, string[]>
): string[] {
    const newArr: string[] = [];
    let remainingYp = [...ypArr];

    for (const pthSyl of pthArr) {
        // 1. Extract Pinyin tone and normalized base for matching
        const { base: pthBase, tone: pthTone } = normalizeSyllable("putonghua:pinyin", pthSyl);
        const pthKey = pthBase; // Already normalized by normalizeSyllable
        const candidates = pinyinMap[pthKey] || [];

        let matchIndex = -1;

        // 2. Find the best Yapu match
        for (const cand of candidates) {
            const normCand = normalizeSyllable("yapu:yapin", cand).base;

            matchIndex = remainingYp.findIndex(yp => {
                const { base: ypNorm } = normalizeSyllable("yapu:yapin", yp);
                return ypNorm === normCand;
            });

            if (matchIndex !== -1) break;
        }

        // 3. Process the match
        if (matchIndex !== -1) {
            const matchedYp = remainingYp[matchIndex];
            const { base: ypBase, tone: originalYpTone } = peelTone(matchedYp);

            // Rusheng check: Preserve original if it's an entering tone
            const isRusheng = hasFinalPTK(ypBase) || originalYpTone === 5;

            if (isRusheng) {
                newArr.push(matchedYp);
            } else {
                // APPLY ACCENT: Use the utility to apply the Pinyin tone to the Yapu base
                // This replaces 'z̬iên4' with the correctly accented 'z̬iên' + diacritic
                const accented = addYapinAccent(ypBase, pthTone);
                newArr.push(accented);
            }
            remainingYp.splice(matchIndex, 1);
        }
    }

    // 4. Append leftovers as-is
    return [...newArr, ...remainingYp];
}

const csv = fs.readFileSync(PINYIN_TO_YAPIN_CSV, "utf-8");

const records: string[][] = parse(csv, {
    skip_empty_lines: true,
    relax_column_count: true,
});

const pinyinMap: Record<string, string[]> = {};

for (const row of records) {
    if (row.length === 0) continue;

    const key = row[0];

    const values = row
        .slice(1)
        .filter(cell => cell && cell.trim() !== "")
        .map(cell => {
            const [x] = cell.split(":");
            return x.trim();
        });

    pinyinMap[key] = values;
}

console.log(pinyinMap);


const charEntryMap = loadCharEntryMap(YAPU_DICTIONARY_JSON_PATH);

for (const [char, entry] of Object.entries(charEntryMap)) {
    // Ensure readings exist before accessing
    const readings = entry.readings;

    if (readings) {
        // Extracting yapu:yapin (雅拼)
        const ypArr: string[] = readings["yapu:yapin"] || [];

        // Extracting putonghua:pinyin (普通話拼音)
        const pthArr: string[] = readings["putonghua:pinyin"] || [];

        // Example: Log if both exist
        if (ypArr.length > 1) {
            // console.log(`Character: ${char}`);
            // console.log(`  Yapin: ${ypArr.join(', ')}`);
            // console.log(`  Pinyin: ${pthArr.join(', ')}`);
            console.log(char, ypArr, pthArr)
            console.log(char, alignYapuToPinyin(ypArr, pthArr, pinyinMap));
        }

    }
}


// log(result.toString());
