import { CharEntry } from "@lib/char/charTypes";
import { isChineseChar, isWhitespace } from "@lib/char/charUtils";


export const toTokens = (input: string): string[] => {
    const out: string[] = [];
    let buf = ""; // accumulates non-whitespace, non-Han

    for (const ch of input) {
        if (isChineseChar(ch)) {
            if (buf) { out.push(buf); buf = ""; }
            out.push(ch);
            continue;
        }

        if (!buf || (isWhitespace(buf[buf.length - 1]) === isWhitespace(ch))) {
            buf += ch;
            continue;
        }

        out.push(buf);
        buf = ch;
    }

    if (buf) out.push(buf);
    return out;
};


const getReadings = (
    han: string,
    orth: string,
    map: Record<string, CharEntry>
): string[] => (map[han]?.readings?.[orth] as string[] | undefined) ?? [];


export type RubyTuple = [char: string, reading?: string] | [text: string];
export type RubySaveArray = RubyTuple[];
export type ReadingPickedMap = Record<string, string>;
export type RubySaveJSON = {
    orthography: string;   // e.g. "yapu:yapin"
    data: RubySaveArray;   // 2-D array of tuples
};
export type DeserializedRuby = {
    tokens: string[];
    orthography: string;
    readingsPicked: ReadingPickedMap; // tokenId = `${char}-${index}` -> readingIndex
};

export const serializeToJSON = (
    {
        tokens,
        orthography,
        readingsPicked
    }: DeserializedRuby,
    charEntryMap: Record<string, CharEntry>,
): RubySaveJSON => {
    const data: RubySaveArray = tokens.map((t, i) => {
        const isHan = t.length === 1 && isChineseChar(t);
        if (!isHan) return [t]; // plain text run

        const list = getReadings(t, orthography, charEntryMap);
        if (list.length === 0) return [t]; // no readings available

        const id = [t, i].join('-')

        return readingsPicked[id] !== undefined ?
            [t, readingsPicked[id]] :
            [t, list[0]];
    });

    return {
        orthography,
        data
    }

};


// --- SAVE: download an object as a .json file ---
export const downloadJson = (filename: string, obj: unknown): void => {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

export const isRubySaveJSON = (x: any): x is RubySaveJSON =>
    x &&
    typeof x === "object" &&
    typeof x.orthography === "string" &&
    Array.isArray(x.data) &&
    x.data.every(
        (t: any) =>
            Array.isArray(t) &&
            (t.length === 1 || t.length === 2) &&
            typeof t[0] === "string" &&
            (t.length === 1 || typeof t[1] === "string")
    );

export const deserializeFromJSON = (doc: RubySaveJSON): DeserializedRuby => {
    if (!isRubySaveJSON(doc)) throw new Error("Invalid RubySaveJSON");

    const tokens = doc.data.map(tuple => tuple[0]);
    const readingsPicked: ReadingPickedMap = {};

    doc.data.forEach((tuple, i) => {
        const base = tuple[0];
        const reading = tuple[1]; // may be undefined for text tuples
        if (base.length === 1 && isChineseChar(base) && reading) {
            readingsPicked[`${base}-${i}`] = reading;
        }
    });

    return { tokens, orthography: doc.orthography, readingsPicked };
};

export const loadRubyFile = async (
  file: File,
  defaultOrthography: string
): Promise<DeserializedRuby> => {
  const text = await file.text();

  // Try JSON first
  try {
    const parsed = JSON.parse(text);
    if (isRubySaveJSON(parsed)) {
      return deserializeFromJSON(parsed);
    }
  } catch {
    // ignore and fall through to text fallback
  }

  // Fallback: treat as plain text
  return {
    tokens: toTokens(text),
    orthography: defaultOrthography,
    readingsPicked: {},
  };
};