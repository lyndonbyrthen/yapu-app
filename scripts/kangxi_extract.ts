// scripts/kangxi_extract.ts
import { createReadStream } from "node:fs";
import { writeFile } from "node:fs/promises";
import readline from "node:readline";

const INPUT  = "scripts/data/dictionary/kangxizidian-v3f.txt";
const OUTPUT = "scripts/data/kx-simple.json";

const isHan = (s: string) => /\p{Script=Han}/u.test(s);
const firstHan = (s: string) => Array.from(s).find(isHan) ?? "";
const stripPUA = (s: string) => s.replace(/[\uE000-\uF8FF]+/g, "");
const headKey = (line: string) => firstHan(line.trim());

/** Parse one Kangxi line per your rules. */
export const parseKXLine = (
  line: string
): { key: string; data: Record<string, string> } | null => {
  if (!line || !line.trim()) return null;

  // 1) key = first Han character on the line
  const key = headKey(line);
  if (!key) return null;

  // 2) remove header (up to the first PUA run like "")
  const pua = line.match(/[\uE000-\uF8FF]+/);
  const rest = (pua ? line.slice((pua.index ?? 0) + pua[0].length) : line).trim();
  if (!rest) return { key, data: {} };

  // 3) only consider the FIRST sentence (before the first '。')
  const sentence = rest.split("。", 1)[0] ?? "";
  const s = sentence;

  // 4) find all labels in the sentence
  const labelMatches = [...s.matchAll(/【([^】]+)】/g)];
  const data: Record<string, string> = {};

  if (labelMatches.length === 0) {
    // no 【】 → treat pre-。 chunk as redirects
    const red = stripPUA(s).trim();
    if (red) data.redirects = red;
    return { key, data };
  }

  // 5) support multiple labels & blank runs like 【A】【B】x…
  let pending: string[] = []; // labels waiting to receive the next non-empty chunk
  for (let i = 0; i < labelMatches.length; i++) {
    const m = labelMatches[i];
    const name = m[1].trim();
    const contentStart = (m.index ?? 0) + m[0].length;
    const nextIdx = i + 1 < labelMatches.length ? (labelMatches[i + 1].index ?? s.length) : s.length;

    // slice between this label and the next label (or sentence end)
    let chunk = stripPUA(s.slice(contentStart, nextIdx)).trim();
    chunk = chunk.replace(/^[，、；：\s]+/, "").trim(); // drop leading separators if any

    if (!chunk) {
      // no content yet → defer; it shares the next non-empty chunk
      pending.push(name);
    } else {
      // fill pending blank-run labels first
      for (const lab of pending) data[lab] = chunk;
      pending = [];
      // then current label
      data[name] = chunk;
    }
  }
  // If the sentence ended with labels and no content, we leave them unset (no chunk to share)

  return { key, data };
};

async function main() {
  const rl = readline.createInterface({
    input: createReadStream(INPUT, { encoding: "utf8" }),
    crlfDelay: Infinity,
  });

  const out: Record<string, Record<string, string>> = {};
  for await (const line of rl) {
    const parsed = parseKXLine(line);
    if (!parsed) continue;
    out[parsed.key] = parsed.data; // last-write-wins (adjust if you want merging)
  }

  await writeFile(OUTPUT, JSON.stringify(out, null, 2), "utf8");
}

main().catch(() => { process.exitCode = 1; });
