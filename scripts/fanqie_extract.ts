// scripts/fanqie_extract.ts
import { readFile, writeFile } from "node:fs/promises";

const INPUT  = "scripts/data/kx-simple.json";
const OUTPUT = "scripts/data/kx-fanqie.json";

type SrcMap = Record<string, string>;
type KXMap = Record<string, SrcMap>;
type OutEntry = { fanqie?: string; sound?: string; redirects?: string };
type OutMap = Record<string, OutEntry>;

const HAN = "\\p{Script=Han}";
const isHan = (ch: string) => /\p{Script=Han}/u.test(ch);
const firstHan = (s: string) => (Array.from(s).find(isHan) ?? "");

// core patterns
const reFanqie = new RegExp(`([${HAN}]{2})切`, "u");      // XX切 -> store "XX"
const reSound  = new RegExp(`音([${HAN}]+)`, "u");        // 音X  -> store first Han of X

// redirects (both directions; 同 / 通)
const reYuTong = new RegExp(`[與与]([${HAN}]+)(?:同|通)`, "u"); // 與X同 / 与X通
const reTongX  = new RegExp(`(?:同|通)([${HAN}]+)`, "u");       // 同X / 通X
const reXTong  = new RegExp(`([${HAN}]+)(?:同|通)`, "u");       // X同 / X通

// acceptable redirect phrases
const reSuZi   = new RegExp(`俗([${HAN}]+)字`, "u"); // 俗X字
const reSuZuo  = new RegExp(`俗作([${HAN}]+)`, "u"); // 俗作X
const reBenZi  = new RegExp(`([${HAN}]+)本字`, "u"); // X本字  ← now treated as redirect

// only-ignore flag
const reGuWu   = /古無此字/u;                       // 古無此字 -> treat as “nothing usable”

const extractFanqie = (s: string) => {
  const m = s.match(reFanqie);
  return m ? m[1] : undefined; // strip "切"
};
const extractSound = (s: string) => {
  const m = s.match(reSound);
  return m ? firstHan(m[1]) : undefined;
};

const hasIgnoreFlag = (s: string) => reGuWu.test(s);

// best effort selection from a list of source strings (preserves JSON order)
const pickBestFromValues = (vals: string[]) => {
  // 1) first value with BOTH
  for (const v of vals) {
    if (hasIgnoreFlag(v)) continue;
    const fq = extractFanqie(v);
    const sd = extractSound(v);
    if (fq && sd) return { fanqie: fq, sound: sd };
  }
  // 2) first value with EITHER
  for (const v of vals) {
    if (hasIgnoreFlag(v)) continue;
    const fq = extractFanqie(v);
    const sd = extractSound(v);
    if (fq || sd) return { fanqie: fq, sound: sd };
  }
  return {};
};

const pickRedirect = (vals: string[]): string | undefined => {
  for (const v of vals) {
    if (hasIgnoreFlag(v)) continue;
    const m1 = v.match(reYuTong)?.[1]; if (m1) return firstHan(m1); // 與X同/通
    const m2 = v.match(reTongX )?.[1]; if (m2) return firstHan(m2); // 同X/通X
    const m3 = v.match(reXTong )?.[1]; if (m3) return firstHan(m3); // X同/通
    const m4 = v.match(reBenZi )?.[1]; if (m4) return firstHan(m4); // X本字
    const m5 = v.match(reSuZi  )?.[1]; if (m5) return firstHan(m5); // 俗X字
    const m6 = v.match(reSuZuo )?.[1]; if (m6) return firstHan(m6); // 俗作X
  }
  return undefined;
};

async function main() {
  const raw = await readFile(INPUT, "utf8");
  const kx: KXMap = JSON.parse(raw);

  const out: OutMap = {};
  for (const [ch, rec] of Object.entries(kx)) {
    const vals = Object.values(rec);

    const picked = pickBestFromValues(vals);
    if (picked.fanqie || picked.sound) {
      out[ch] = picked as OutEntry;
      continue;
    }

    const red = pickRedirect(vals);
    out[ch] = red ? { redirects: red } : {};
  }

  await writeFile(OUTPUT, JSON.stringify(out, null, 2), "utf8");
}

main().catch(() => { process.exitCode = 1; });
