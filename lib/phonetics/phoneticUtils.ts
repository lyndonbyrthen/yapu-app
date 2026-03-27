
import { NormalizedSyllable, TONE_TO_ZHUYIN, YAPIN_TO_ZHUYIN_SHENGMU, YAPIN_TO_ZHUYIN_YUNMU, YAPIN_YUNMU } from "./spellingInventory";
import { Tone } from "./spellingInventory";
import { ZHUYIN_TONE_MARK } from "./spellingInventory";
import { YAPIN_TONE_TO_MARK } from "./spellingInventory";
import { YAPIN_MARK_TO_TONE, ZHUYIN_TO_TONE } from "./spellingInventory";
import { Orthography, RUSHENG_LABEL, RushengFinal } from "./phoneticTypes";

export function splitList(s = "") {
  return String(s || "")
    .split(/[;·,\/\s]+/)
    .map(x => x.trim())
    .filter(Boolean);
}

export function stripYapinToneMark(s = "") {
  return s.replace(/[\u0331\u0317\u032C\u0316\u0323]/g, "");
}




// Peel tone: trailing digit 1–5, or trailing q→tone 5,
// or embedded combining mark we added previously.
export function peelTone(token = ""): { base: string, tone: Tone } {
  let base = String(token).trim();
  if (!base) return { base, tone: 6 };

  if (/q$/i.test(base)) return { base: base.slice(0, -1), tone: 5 };

  const m = base.match(/([1-5])$/);
  if (m) return { base: base.slice(0, -1), tone: +m[1] as Tone || null };

  const comb = base.match(/[\u0331\u0317\u032C\u0316\u0323]/);
  if (comb) return { base: stripYapinToneMark(base), tone: YAPIN_MARK_TO_TONE[comb[0]] || null };

  return { base, tone: 6 };
}

// Put tone mark on the FIRST codepoint (no type checks)
export function addYapinAccent(base: string = "", tone: Tone | null) {
  if (!tone || !YAPIN_TONE_TO_MARK[tone]) return String(base ?? "");
  const chars = [...String(base)];
  if (!chars.length) return "";
  chars[0] = chars[0] + YAPIN_TONE_TO_MARK[tone];
  return chars.join("");
}

// yapin
export function YapinNumToTone(yapin: string) {

  const { base, tone } = peelTone(yapin);
  return addYapinAccent(base, tone);
}

export function getYapinTone(s: string): Tone {
  let tone = 6 as Tone;
  const comb = s.match(/[\u0331\u0317\u032C\u0316\u0323]/);
  if (comb) return YAPIN_MARK_TO_TONE[comb[0]];
  return tone;
}

export const hasFinalPTK = (s: string) => /[ptk]\u030A?$/u.test(s);
export const getFinalPTK = (s: string): RushengFinal | "" => (hasFinalPTK(s) ? s.substring(s.length - 2) as RushengFinal : "");

export const getPTKLabel = (s: string) => (hasFinalPTK(s) ? getRushengLabel(s[s.length - 1]) : "");

export const normalizeZhuyin = (q: string): NormalizedSyllable => {
  const last = q[q.length - 1];
  return ZHUYIN_TO_TONE.hasOwnProperty(last)
    ? { base: q.slice(0, -1), tone: ZHUYIN_TO_TONE[last as ZHUYIN_TONE_MARK], mark: last }
    : { base: q, tone: 6, mark: "" };
};

export const stripZhuyinToneMark = (q: string): NormalizedSyllable =>
  ZHUYIN_TO_TONE.hasOwnProperty(q[q.length - 1])
    ? { base: q.slice(0, -1), tone: ZHUYIN_TO_TONE[q[q.length - 1] as ZHUYIN_TONE_MARK], mark: q[q.length - 1] }
    : { base: q, tone: 6, mark: "" };


export function normalizeYapin(q: string): NormalizedSyllable {
  if (!q) return { base: "", tone: null, mark: "" }; // empty guard
  // If no tone mark, then it's a light tone, qingsheng
  let tone: Tone = getYapinTone(q);
  const base = stripDiacritics(q);
  return { base, tone };
}



export const normalizePinyin = (s: string): NormalizedSyllable => ({
  base: s.normalize("NFD").replace(/\p{M}+/gu, "").normalize("NFC"),
  tone: getPinyinTone(s),
  mark: ""
});

export const stripDiacritics = (s: string): string =>
  s.normalize("NFD")
    .replace(/(?![\u0308\u0302])\p{M}/gu, "")
    .normalize("NFC");


export function normalizeSyllable(orth: Orthography, reading: string): NormalizedSyllable {
  switch (orth) {
    case "laoguoyin:zhuyin":
      return normalizeZhuyin(reading);
    case "putonghua:pinyin":
      return normalizePinyin(reading);
    default:
      return normalizeYapin(reading);
  }
}

export const PTK_ORDER: Record<RushengFinal, number> = {
  "p̊": 1,
  "t̊": 2,
  "k̊": 3,
}

export const comparePinyinTones = (syl1: string, syl2: string) =>
  getPinyinTone(syl1) - getPinyinTone(syl2);


export const compareYapinTones = (syl1: string, syl2: string) => {
  if (!syl1 || !syl2) return 0;

  // rusheng order no final comes first
  // the p < t < k
  const tone1 = peelTone(syl1).tone;
  const tone2 = peelTone(syl2).tone;
  if (tone1 === 5 && tone2 === 5) {
    const ptk1 = getFinalPTK(syl1);
    const ptk2 = getFinalPTK(syl2);

    if (ptk1 && !ptk2) return 1;
    if (!ptk1 && ptk2) return -1;

    return PTK_ORDER[ptk1 as RushengFinal] - PTK_ORDER[ptk2 as RushengFinal];
  }

  return tone1 - tone2;
}



const YAPIN_YUNMU_DESC = [...YAPIN_YUNMU].sort((a, b) => b.length - a.length);

export function yapinToZhuyin(token = ""): string {
  if (!token) return "";

  // peel tone → no digit means no mark
  const { base, tone } = peelTone(token);
  const toneMark: ZHUYIN_TONE_MARK = tone ? (TONE_TO_ZHUYIN[tone] ?? "") : "";

  // find longest matching yunmu as a suffix
  const yunmuMatch = YAPIN_YUNMU_DESC.find(y => base.endsWith(y));

  // figure out shengmu and map both parts; if no yunmu, entire base is shengmu
  const shengmuStr = yunmuMatch ? base.slice(0, base.length - yunmuMatch.length) : base;

  const zhSheng = shengmuStr ? (YAPIN_TO_ZHUYIN_SHENGMU[shengmuStr] ?? "") : "";
  const zhYun = yunmuMatch ? (YAPIN_TO_ZHUYIN_YUNMU[yunmuMatch] ?? "") : "";

  // single return; empty pieces just concatenate to nothing
  return `${zhSheng}${zhYun}${toneMark}`;
}

export const normalizeZhChShR = (syl: string): string => {
  switch (syl) {
    case "zhi": return "zh";
    case "chi": return "ch";
    case "shi": return "sh";
    case "ri": return "r";
    default: return syl;
  }
};

export const stripPTK = (syl: string): string => syl.replace(/[ptkp̊t̊k̊]\u030A?$/u, "")

export const getRushengLabel = (syl: string) => {
  if (syl.indexOf("p̊") >= 0) return RUSHENG_LABEL["p̊"];
  if (syl.indexOf("t̊") >= 0) return RUSHENG_LABEL["t̊"];
  if (syl.indexOf("k̊") >= 0) return RUSHENG_LABEL["k̊"];
  return "";
};

/** Return p̊/t̊/k̊ if Baxter string ends with p/t/k (case-insensitive). Otherwise null. */
export const getBaxterPTK = (s?: string): string | null => {
  if (!s) return null;
  const last = (s ?? "").trim().toLowerCase().slice(-1);
  const final: RushengFinal | null = last === "p" ? "p\u030A"
    : last === "t" ? "t\u030A"
      : last === "k" ? "k\u030A"
        : null;
  return final;
};

const stripCantTail = (s: string) => (s ?? "").replace(/[^A-Za-z]+$/g, "");

export const getCantonesePTK = (s: string) =>
  !!s ? getBaxterPTK(stripCantTail(s)) : null;

// ---- main: first-hit wins (MC → Cantonese) ----
export const getRushengFinal = (char: string, wikCharMap: Record<string, any>): RushengFinal | null => {
  const entry = wikCharMap[char];
  if (!entry?.etymology?.length) return null;

  for (const et of entry.etymology) {
    for (const mc of et.readings?.middleChinese ?? []) {
      const f = getBaxterPTK(mc);
      if (f) return f as RushengFinal;
    }
  }
  for (const et of entry.etymology) {
    for (const yue of et.readings?.cantonese ?? []) {
      const f = getCantonesePTK(yue);
      if (f) return f as RushengFinal;
    }
  }
  return null;
};


// toneChars[tone] — tone 1..4 are marked; 5 = reserved (rusheng, empty);
// 6 = plain vowels (no tone).
export const toneChars: string[] = [
  "", // 0
  "āēīōūǖĀĒĪŌŪǕ", // 1
  "áéíóúǘÁÉÍÓÚǗ", // 2
  "ǎěǐǒǔǚǍĚǏǑǓǙ", // 3
  "àèìòùǜÀÈÌÒÙǛ", // 4
  "",              // 5 rusheng (reserved, no mapping)
  "aeiouüAEIOUÜ", // 6 = no tone (bases)
];

// Build lookup tables
export const TONE_FROM_CHAR: Record<string, Tone> = Object.fromEntries(
  ([1, 2, 3, 4] as const).flatMap(tone =>
    [...toneChars[tone]].map((ch): [string, Tone] => [ch, tone])
  )
);

export const BASE_FROM_CHAR: Record<string, string> = Object.fromEntries(
  ([1, 2, 3, 4] as const).flatMap(tone =>
    [...toneChars[tone]].map((ch, i): [string, string] => [ch, toneChars[6][i]])
  ).concat(
    [...toneChars[6]].map((ch): [string, string] => [ch, ch])
  )
);

/** Strip tone marks from a proper Pinyin syllable; preserve ü/Ü. */
export function stripPinyinTone(syllable: string): string {
  if (!syllable) return "";
  return syllable.replace(/./gu, ch => BASE_FROM_CHAR[ch] ?? ch);
}

/** Return the tone (1–4 if matched; 6 for no-tone chars; 5 reserved for rusheng). */
export function getPinyinTone(s: string): Tone {
  for (const ch of s) {
    const tone = TONE_FROM_CHAR[ch];
    if (tone) return tone;
  }
  return 6; // default: no tone
}

// tone-number → tone-mark for a single syllable (e.g. "han4" → "hàn")
export function pinyinNumToMark(s: string) {
  // split trailing tone number 1–5
  const m = String(s).match(/^(.*?)([1-5])$/);
  const base = m ? m[1] : s;
  const tone = m ? +m[2] : 5; // 5 = neutral
  // priority order for vowels to mark
  const order = ["a", "e", "o", "u", "i", "ü"];
  let idx = -1, vowel = "";
  for (const v of order) {
    const i = base.indexOf(v);
    if (i !== -1) { idx = i; vowel = v; break; }
  }
  if (idx === -1) return base; // no vowel?
  const toneMap: Record<string, Array<string>> = {
    a: ["a", "ā", "á", "ǎ", "à"],
    e: ["e", "ē", "é", "ě", "è"],
    i: ["i", "ī", "í", "ǐ", "ì"],
    o: ["o", "ō", "ó", "ǒ", "ò"],
    u: ["u", "ū", "ú", "ǔ", "ù"],
    ü: ["ü", "ǖ", "ǘ", "ǚ", "ǜ"]
  };
  const tbl = toneMap[vowel] || [vowel, vowel, vowel, vowel, vowel];
  const repl = tbl[[5, 1, 2, 3, 4].indexOf(tone)]; // map 1..5 → index 1..4, 5→0
  return base.slice(0, idx) + repl + base.slice(idx + vowel.length);
}

// remove invalid Unihan pinyin entries
export const removeInvalidPinyin = (arr: string[]) =>
  arr.filter(s => {
    const n = s.normalize("NFD"), b = n.replace(/\p{M}+/gu, "").toLowerCase();
    return !(/e\u0302/iu.test(n) || b === "m" || b === "n" || b === "ng");
  });
