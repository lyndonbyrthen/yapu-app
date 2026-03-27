import { CharEntry, CharEntryMap, RadicalMap } from "@lib/char/charTypes";
import { RadicalsByStrokes, SimplifiedRadical, KangxiRadical } from "@lib/payloadTypes";
import fs from "fs";

const data = JSON.parse(fs.readFileSync("public/data.json", "utf8"));

const charSet: Set<string> = new Set();

Object.entries(data.charEntryMap).forEach(([char, entry]) => {
  const e = entry as CharEntry;
  const fq = e?.readings?.['middleChinese:fanqie'];
  const fqChars = fq?.join('').split('');
  charSet.add(char);
  if (fqChars) fqChars.forEach(char => charSet.add(char));
});

Object.entries(data.simplifiedRadicalMap as RadicalMap).forEach(([key, rad]) => {
  charSet.add(rad.glyph+'');
  rad.variant?.forEach(char=>charSet.add(char));
});

Object.entries(data.kangxiRadicalMap as RadicalMap).forEach(([key, rad]) => {
  charSet.add(rad.glyph+'');
  rad.variant?.forEach(char=>charSet.add(char));
});

const ascii = ` !"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_\`abcdefghijklmnopqrstuvwxyz{|}~`;

// ---------- ranges helper ----------
const range = (start: number, endInclusive: number) =>
  Array.from({ length: endInclusive - start + 1 }, (_, i) =>
    String.fromCodePoint(start + i)
  ).join("");

// ---------- Zhuyin coverage ----------
// Bopomofo: U+3100–U+312F
// Bopomofo Extended: U+31A0–U+31BF
// Tone marks: ˇ U+02C7, ˊ U+02CA, ˋ U+02CB, ˙ U+02D9, ˉ U+02C9
const bopomofoCore = range(0x3100, 0x312F);
const bopomofoExt = range(0x31A0, 0x31BF);
const zhuyinTones = "ˉˊˇˋ˙";
const katakana = range(0x30A0, 0x30FF);

const zhuyinAll = bopomofoCore + bopomofoExt + zhuyinTones;

// ---------- Radical code blocks (UI chips often use these) ----------
// CJK Radicals Supplement: U+2E80–U+2EFF
// Kangxi Radicals:        U+2F00–U+2FD5
const cjkRadicalsSupp = range(0x2E80, 0x2EFF);
const kangxiRadicals = range(0x2F00, 0x2FD5);

const simplifiedRadicals =
  "一丨丶丿乙亅二亠人儿入八冂冖冫几凵刀力勹匕匚十卜卩厂厶又口囗土士夂夊夕大女子宀寸小尢尸屮山川工己巾干幺广廴廾弋弓彐彡彳心戈户手支攴文斗斤方无日曰月木欠止歹殳毋比毛氏气水火爪父爻爿片牙牛犬玄玉瓜瓦甘生用田疋疒癶白皮皿目矛矢石示禸禾穴立竹米纟缶网羊羽而耒耳聿肉自至臼舌舛舟艮色艸虍虫血行衣西见角言谷豆豕豸贝赤走足身车辛辰辵邑酉釆里金长门阜隶隹雨青非面革韦音页风飞食首香马骨高髟鬥鬯鬲鬼鱼鸟鹿麦麻黄黍黑黹黽鼎鼓鼠鼻齐齿龙龟龠";


// ---------- Build unique set ----------
const all = Array.from(new Set([
  ...charSet,
  ...ascii,
  ...zhuyinAll,
  ...cjkRadicalsSupp,
  ...kangxiRadicals,
  ...simplifiedRadicals,
  ...katakana,
].join("")));

const toCP = ch => ch.codePointAt(0);

// split into BMP vs Extension planes
const bmp = all.filter(ch => toCP(ch) < 0x20000);
const extB = all.filter(ch => toCP(ch) >= 0x20000);

fs.mkdirSync("scripts/data/charset", { recursive: true });
fs.writeFileSync("scripts/data/charset/charset-bmp.txt", bmp.join(""), "utf8");
fs.writeFileSync("scripts/data/charset/charset-extb.txt", extB.join(""), "utf8");
// fs.writeFileSync("./charsets/charset-zhuyin.txt",
//   Array.from(new Set(zhuyinAll)).join(""), "utf8"
// );

console.log(`BMP:   ${bmp.length} chars → scripts/data/charset/charset-bmp.txt`);
console.log(`ExtB+: ${extB.length} chars → scripts/data/charset/charset-extb.txt`);
// console.log(`Zhuyin set → ./charsets/charset-zhuyin.txt`);
