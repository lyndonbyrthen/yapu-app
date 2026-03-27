export const YAPIN_SHENGMU: string[] = [
    // labials
    "b", "p", "m", "f",
    // dentals/alveolars
    "d", "t", "n", "l",
    // velars
    "g", "k", "h",
    // alveolo-palatals
    "j", "q", "x",
    // retroflex
    "zh", "ch", "sh", "r",
    // alveolars
    "z", "c", "s",
    // orthography extras in this system:
    "ng", "ñ", "v",
];

export const YAPIN_YUNMU: string[] = [
  // simple vowels
  "a", "o", "e", "ê", "i", "u", "ü",

  // diphthongs
  "ai", "êi", "au", "ou",

  // nasals
  "an", "en", "ên", "in", "ang", "ing", "eng", "ong",

  // special
  "er",

  // i- series
  "ia", "io", "iê",
  "iai", "iau", "ieu",
  "iên", "iang", "iong",

  // u- series
  "ua", "uo", "uai", "uêi",
  "uan", "uen", "uang", "ueng",

  // ü- series
  "üê", "üan", "üen",
];

export const PINYIN_SHENGMU: string[] = [
    "b", "p", "m", "f",
    "d", "t", "n", "l",
    "g", "k", "h",
    "j", "q", "x",
    "zh", "ch", "sh", "r",
    "z", "c", "s",
    "w", "y",
];

export const PINYIN_YUNMU: string[] = [
    "a", "o", "e", "i", "u", "ü",
    "ai", "ei", "ao", "ou",
    "an", "en", "ang", "eng", "ong",
    "ia", "ie", "iao", "iu", "ian", "in", "iang", "ing", "iong",
    "ua", "uo", "uai", "ui", "uan", "un", "uang", "ueng",
    "üe", "yuan", "yun",
    "er",
];

export const ZHUYIN_SHENGMU: string[] = [
    "ㄅ", "ㄆ", "ㄇ", "ㄈ",
    "ㄉ", "ㄊ", "ㄋ", "ㄌ",
    "ㄍ", "ㄎ", "ㄫ", "ㄏ",   // ㄫ = ng
    "ㄐ", "ㄑ", "ㄒ",
    "ㄓ", "ㄔ", "ㄕ", "ㄖ",
    "ㄗ", "ㄘ", "ㄙ",
    "ㄬ",                  // ñ
];
export const ZHUYIN_YUNMU: string[] = [
    "ㄚ", "ㄛ", "ㄜ", "ㄝ",
    "ㄞ", "ㄟ", "ㄠ", "ㄡ",
    "ㄢ", "ㄣ", "ㄝㄣ", "ㄧㄣ", "ㄤ", "ㄧㄥ", "ㄥ", "ㄨㄥ",
    "ㄦ",
    "ㄧㄚ", "ㄧㄛ", "ㄧㄝ",
    "ㄧㄞ", "ㄧㄠ", "ㄧㄡ",
    "ㄧㄢ", "ㄧㄤ", "ㄩㄥ",
    "ㄨㄚ", "ㄨㄛ", "ㄨㄞ", "ㄨㄟ",
    "ㄨㄢ", "ㄨㄣ", "ㄨㄤ", "ㄨㄥ",
    "ㄩㄝ", "ㄩㄢ", "ㄩㄣ",
];

export type ZHUYIN_TONE_MARK = "ˉ" | "ˊ" | "ˇ" | "ˋ" | "˙" | "";
export type Tone = 1 | 2 | 3 | 4 | 5 | 6 ;
export type NormalizedSyllable = { base: string; tone: Tone | null; mark?: string; };

export const YAPIN_MARK_TO_TONE: Record<string, Tone> = { "\u0331": 1, "\u0317": 2, "\u032C": 3, "\u0316": 4, "\u0323": 5 };
export const YAPIN_TONE_TO_MARK: Record<number, string> = {
    1: "\u0331", // ˍ (macron below) – adjust to your actual scheme
    2: "\u0317", // ̗
    3: "\u032C", // ̬
    4: "\u0316", // ̖
    5: "\u0323", // ̣ (dot below / 入聲)
};

export const TONE_TO_ZHUYIN: Record<Tone, ZHUYIN_TONE_MARK> = { 1: "ˉ", 2: "ˊ", 3: "ˇ", 4: "ˋ", 5: "˙", 6: "" };
export const ZHUYIN_TO_TONE: Record<ZHUYIN_TONE_MARK, Tone> = { "ˉ": 1, "ˊ": 2, "ˇ": 3, "ˋ": 4, "˙": 5, "": 6 };

export const TONE_TO_NAME = { 1: "陰平", 2: "陽平", 3: "上聲", 4: "去聲", 5: "入聲", 6: "輕聲" };


export const IAC_TO_ZHUYIN_SHENGMU = [
    ["ng", "ㄫ"], ["nj", "ㄬ"],
    ["zr", "ㄓ"], ["cr", "ㄔ"], ["sr", "ㄕ"],
    ["b", "ㄅ"], ["p", "ㄆ"], ["m", "ㄇ"], ["f", "ㄈ"], ["v", "ㄪ"],
    ["d", "ㄉ"], ["t", "ㄊ"], ["n", "ㄋ"], ["l", "ㄌ"],
    ["g", "ㄍ"], ["k", "ㄎ"], ["h", "ㄏ"],
    ["j", "ㄐ"], ["q", "ㄑ"], ["x", "ㄒ"],
    ["r", "ㄖ"], ["z", "ㄗ"], ["c", "ㄘ"], ["s", "ㄙ"],
];

export const IAC_TO_ZHUYIN_YUNMU_MAP: Record<string, string> = {
    "iai": "ㄧㄞ", "iau": "ㄧㄠ", "ieu": "ㄧㄡ", "iang": "ㄧㄤ", "ieng": "ㄧㄥ",
    "ian": "ㄧㄢ", "ien": "ㄧㄣ", "ia": "ㄧㄚ", "io": "ㄧㄛ", "ie": "ㄧㄝ",
    "uang": "ㄨㄤ", "ueng": "ㄨㄥ", "uai": "ㄨㄞ", "uei": "ㄨㄟ",
    "uan": "ㄨㄢ", "uen": "ㄨㄣ", "ua": "ㄨㄚ", "uo": "ㄨㄛ",
    "yeng": "ㄩㄥ", "yan": "ㄩㄢ", "yen": "ㄩㄣ", "yo": "ㄩㄛ", "ye": "ㄩㄝ",
    "ang": "ㄤ", "eng": "ㄥ", "ai": "ㄞ", "ei": "ㄟ", "au": "ㄠ", "eu": "ㄡ",
    "an": "ㄢ", "en": "ㄣ", "eo": "ㄜ", "er": "ㄦ", "ao": "ㄠ", "ou": "ㄡ",
    "a": "ㄚ", "o": "ㄛ", "e": "ㄝ",
    "i": "ㄧ", "u": "ㄨ", "y": "ㄩ"
};


export const YAPIN_TO_ZHUYIN_SHENGMU: Record<string, string> = {
  // labials
  "b": "ㄅ",
  "p": "ㄆ",
  "m": "ㄇ",
  "f": "ㄈ",

  // dentals/alveolars
  "d": "ㄉ",
  "t": "ㄊ",
  "n": "ㄋ",
  "l": "ㄌ",

  // velars
  "g": "ㄍ",
  "k": "ㄎ",
  "ng": "ㄫ", // extra from your list
  "h": "ㄏ",

  // alveolo-palatals
  "j": "ㄐ",
  "q": "ㄑ",
  "x": "ㄒ",

  // retroflex
  "zh": "ㄓ",
  "ch": "ㄔ",
  "sh": "ㄕ",
  "r": "ㄖ",

  // alveolars
  "z": "ㄗ",
  "c": "ㄘ",
  "s": "ㄙ",

  // orthography extras
  "ñ": "ㄬ",
  "v": "ㄪ", 
};

export const YAPIN_TO_ZHUYIN_YUNMU: Record<string, string> = {
  // simple vowels
  "a": "ㄚ",
  "o": "ㄛ",
  "e": "ㄜ",
  "ê": "ㄝ",
  "i": "ㄧ",
  "u": "ㄨ",
  "ü": "ㄩ",

  // diphthongs
  "ai": "ㄞ",
  "êi": "ㄟ",
  "au": "ㄠ",
  "ou": "ㄡ",

  // nasals
  "an": "ㄢ",
  "en": "ㄣ",
  "ên": "ㄝㄣ",
  "in": "ㄧㄣ",
  "ang": "ㄤ",
  "ing": "ㄧㄥ",
  "eng": "ㄥ",
  "ong": "ㄨㄥ",

  // special
  "er": "ㄦ",

  // i- series
  "ia": "ㄧㄚ",
  "io": "ㄧㄛ",
  "iê": "ㄧㄝ",
  "iai": "ㄧㄞ",
  "iau": "ㄧㄠ",
  "ieu": "ㄧㄡ",
  "iên": "ㄧㄢ",
  "iang": "ㄧㄤ",
  "iong": "ㄩㄥ",

  // u- series
  "ua": "ㄨㄚ",
  "uo": "ㄨㄛ",
  "uai": "ㄨㄞ",
  "uêi": "ㄨㄟ",
  "uan": "ㄨㄢ",
  "uen": "ㄨㄣ",
  "uang": "ㄨㄤ",
  "ueng": "ㄨㄥ",

  // ü- series
  "üê": "ㄩㄝ",
  "üan": "ㄩㄢ",
  "üen": "ㄩㄣ",
};


