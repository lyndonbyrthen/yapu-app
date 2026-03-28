import { loadCharEntryMap } from "@lib/analysis/analysisUtils";
import { sortObjectKeys } from "@lib/generalUtils";
import { PINYIN_TO_YAPIN_CSV, YAPIN_TO_PINYIN_CSV } from "@lib/paths";
import { ORTHOGRAPHY } from "@lib/phonetics/phoneticTypes";
import { hasFinalPTK, stripPinyinTone, stripPTK, stripYapinToneMark } from "@lib/phonetics/phoneticUtils";
import { fs } from "zx";


const charMap = loadCharEntryMap();
const pinyinMap: Record<string, any[]> = {};
const yapinMap: Record<string, any[]> = {};

export const top3 = (obj: Record<string, number>) => {
    const entries = Object.entries(obj).sort((a, b) => b[1] - a[1]);
    if (!entries.length) return [];
    // get distinct scores in descending order
    const distinct = [...new Set(entries.map(([, v]) => v))].sort((a, b) => b - a);
    const cutoff = distinct[Math.min(2, distinct.length - 1)]; // 3rd highest value
    return entries.filter(([, v]) => v >= cutoff);
};

const makeRow = (o: Record<string, any[]>) =>
    Object.entries(sortObjectKeys(o)).map(([psyl, arr]) => [arr[0], top3(arr[1]).map(s => s.join(':'))]);

const orth1 = ORTHOGRAPHY.PUTONGHUA_PINYIN;
const orth2 = ORTHOGRAPHY.YAPU_YAPIN;
Object.entries(charMap).forEach(([char, entry]) => {
    const pins = (entry.readings?.[orth1] || []).map(syl => stripPinyinTone(syl));
    const yas = (entry.readings?.[orth2] || []).map(syl => stripYapinToneMark(hasFinalPTK(syl) ? stripPTK(syl) + "5" : syl));

    pins.forEach(p => yas.forEach(y => {
        if (!pinyinMap[p]) pinyinMap[p] = [p, {}];
        const arr = pinyinMap[p];
        if (!arr[1][y]) arr[1][y] = 0;
        arr[1][y]++;
    }));

    yas.forEach(y => pins.forEach(p => {
        if (!yapinMap[y]) yapinMap[y] = [y, {}];
        const arr = yapinMap[y];
        if (!arr[1][p]) arr[1][p] = 0;
        arr[1][p]++;
    }))
});

const pRow = makeRow(pinyinMap);
const yRow = makeRow(yapinMap);

fs.writeFileSync(YAPIN_TO_PINYIN_CSV, yRow.join("\n"), "utf8");
fs.writeFileSync(PINYIN_TO_YAPIN_CSV, pRow.join("\n"), "utf8");


// console.log(pRow.join('\n'))