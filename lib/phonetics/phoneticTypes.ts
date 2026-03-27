
// Traditions = language/reading families
export type ReadingTradition = "yapu" | "yapu_songdu" |
  "laoguoyin" |
  "putonghua" |
  "cantonese" |
  "middleChinese" |
  "japanese";

export const READING_TRADITION = {
  YAPU: "yapu",
  YAPU_SONGDU: "yapu_songdu",
  LAOGUOYIN: "laoguoyin",
  PUTONGHUA: "putonghua",
  CANTONESE: "cantonese",
  MIDDLE_CHINESE: "middleChinese",
  JAPANESE: "japanese",
} as const;

export type SyllabaryId =
  | "yapin"      // 雅拼
  | "pinyin"     // 拼音
  | "zhuyin"     // 注音
  | "zhaopin"    // 趙拼
  | "jyutping"   // 粵拼
  | "baxter"     // 中古音 (Baxter/Baxter–Sagart)
  | "fanqie"     // 反切
  | "katakana";  // 日本語 片仮名

export const SYLLABARY_ID = {
  YAPIN: "yapin",
  PINYIN: "pinyin",
  ZHUYIN: "zhuyin",
  ZHAOPIN: "zhaopin",
  JYUTPING: "jyutping",
  BAXTER: "baxter",
  FANQIE: "fanqie",
  KATAKANA: "katakana",
} as const;

export const ORTHOGRAPHY = {
  PUTONGHUA_PINYIN: "putonghua:pinyin",
  YAPU_YAPIN: "yapu:yapin",
  YAPU_SONGDU_YAPIN: "yapu_songdu:yapin",
  LAOGUOYIN_YAPIN: "laoguoyin:yapin",
  LAOGUOYIN_ZHAOPIN: "laoguoyin:zhaopin",
  LAOGUOYIN_ZHUYIN: "laoguoyin:zhuyin",
  CANTONESE_JYUTPING: "cantonese:jyutping",
  MIDDLE_CHINESE_BAXTER: "middleChinese:baxter",
  MIDDLE_CHINESE_FANQIE: "middleChinese:fanqie",
  JAPANESE_KATAKANA: "japanese:katakana",
}
export type Orthography = typeof ORTHOGRAPHY[keyof typeof ORTHOGRAPHY];

export const ORTHOGRAPHY_LABELS = {
  [ORTHOGRAPHY.PUTONGHUA_PINYIN]: "普通話:拼音",
  [ORTHOGRAPHY.YAPU_YAPIN]: "雅普:雅拼",
  [ORTHOGRAPHY.YAPU_SONGDU_YAPIN]: "雅普誦讀:雅拼",
  [ORTHOGRAPHY.LAOGUOYIN_YAPIN]: "老國音:雅拼",
  [ORTHOGRAPHY.LAOGUOYIN_ZHAOPIN]: "老國音:趙拼",
  [ORTHOGRAPHY.LAOGUOYIN_ZHUYIN]: "老國音:注音",
  [ORTHOGRAPHY.CANTONESE_JYUTPING]: "粵語:粵拼",
  [ORTHOGRAPHY.MIDDLE_CHINESE_BAXTER]: "中古音:白一平",
  [ORTHOGRAPHY.MIDDLE_CHINESE_FANQIE]: "中古音:反切",
  [ORTHOGRAPHY.JAPANESE_KATAKANA]: "日語:片假名",
} as const;

export type ReadingsRecord = Record<Orthography, Array<string>>;

export type RushengFinal = "p̊" | "t̊" | "k̊";

export type RushengSource =
  | 'Baxter–Sagart MC (2014/2015)'
  | 'SBGY via Unihan';

export interface RushengEntry {
  final: RushengFinal;
  source: RushengSource;
}

export type RushengMap = Record<string, RushengEntry>; // key = single Han character

export const RUSHENG_LABEL = {
  "p̊": "脣入",
  "t̊": "舌入",
  "k̊": "牙入",
} as const;



