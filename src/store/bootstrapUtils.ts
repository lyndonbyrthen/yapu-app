import { Orthography, ORTHOGRAPHY, ReadingsRecord } from "@lib/phonetics/phoneticTypes";
import type { CharEntry, CharEntryMap, RadicalMap, RadicalsByStrokes } from "@lib/char/charTypes";
import type { CharsByResidual, Syllabary } from "./storeTypes";
import type { Payload } from "@lib/payloadTypes";
import { compareYapinTones, normalizeSyllable, normalizeZhChShR, peelTone, stripPTK } from "@lib/phonetics/phoneticUtils";
import { compareCharByTotalStrokes, getGlyphForm, uniq } from "@lib/char/charUtils";
import { sortObjectKeys } from "@lib/generalUtils";


// ---------- Deep freeze (defensive immutability) ----------
export function deepFreeze<T>(obj: T): Readonly<T> {
  if (obj && typeof obj === "object" && !Object.isFrozen(obj)) {
    Object.freeze(obj as object);
    for (const k of Object.keys(obj as any)) {
      const v = (obj as any)[k];
      if (v && typeof v === "object") deepFreeze(v);
    }
  }
  return obj as Readonly<T>;
}

const addToResidualMap = (map: CharsByResidual, entry: CharEntry, radicalId: string, residual: string) => {
  if (!map[radicalId]) map[radicalId] = {};
  if (!map[radicalId][residual]) map[radicalId][residual] = [];
  map[radicalId][residual].push(entry);
}
export const buildCharsByResidual = (
  charEntryMap: CharEntryMap
): {
  kangxiByResidual: CharsByResidual;
  simplifiedByResidual: CharsByResidual;
} => {
  const kangxiByResidual: CharsByResidual = {};
  const simplifiedByResidual: CharsByResidual = {};

  for (const [char, entry] of Object.entries(charEntryMap)) {
    const e = entry as CharEntry;  // <-- type cast here
    const gf = getGlyphForm(e, charEntryMap);
    const rs = e.RSMeta;
    if (!rs) continue;

    const { radicalId, residual } = rs;
    if (!radicalId || !residual) continue;


    if (gf === "traditional") {
      addToResidualMap(kangxiByResidual, e, radicalId + '', residual + '');
    } else if (gf === "simplified") {
      addToResidualMap(simplifiedByResidual, e, radicalId + '', residual + '');
    } else {
      addToResidualMap(kangxiByResidual, e, radicalId + '', residual + '');
      addToResidualMap(simplifiedByResidual, e, radicalId + '', residual + '');
    }
  }

  return { kangxiByResidual, simplifiedByResidual };
};

export const buildHomophones = (charEntryMap: CharEntryMap) => {
  const mk = (): Syllabary => ({});

  const maps = {
    [ORTHOGRAPHY.YAPU_YAPIN]: mk(),
    [ORTHOGRAPHY.PUTONGHUA_PINYIN]: mk(),
    [ORTHOGRAPHY.LAOGUOYIN_YAPIN]: mk(),
    [ORTHOGRAPHY.LAOGUOYIN_ZHUYIN]: mk(),
  } as Record<Orthography, Syllabary>;

  Object.entries(charEntryMap).forEach(([char, entry]) => {
    const r = entry.readings ?? ({} as ReadingsRecord);

    Object.entries(r).forEach(([orth, list]) => {
      const syllabary = maps[orth as Orthography];

      if (!syllabary || !Array.isArray(list)) return;

      list.forEach((reading) => {
        if (!reading) return;

        const normalized = normalizeSyllable(orth as Orthography, reading);

        let normSly = normalized.base;

        // rusheng zh ch sh r become zhi chi shi ri, but should still belong to the same group
        if (orth === ORTHOGRAPHY.YAPU_YAPIN) normSly = normalizeZhChShR(stripPTK(normSly));
        if (!syllabary[normSly]) {
          syllabary[normSly] = {};
        }
        const syllableMap = syllabary[normSly]!;

        if (!syllableMap[reading]) syllableMap[reading] = [];
        syllableMap[reading].push(char);
        syllableMap[reading] = uniq(syllableMap[reading]).sort((a, b) => compareCharByTotalStrokes(a, b, charEntryMap));

        // index all rusheng syllables without ptk
        if (peelTone(reading).tone === 5) {
          const noPTK = stripPTK(reading);
          if (!syllableMap[noPTK]) syllableMap[noPTK] = []
          syllableMap[noPTK].push(char);
          syllableMap[noPTK] = uniq(syllableMap[noPTK]).sort((a, b) => compareCharByTotalStrokes(a, b, charEntryMap));
        }

      });
    });
  });
  return maps;
};

const buildRadicalsByStrokes = (rads: RadicalMap) => {
  const byStrokes: RadicalsByStrokes = {};
  Object.entries(rads).forEach(([key, rad]) => {
    if (!rad.totalStrokes) return;
    if (!byStrokes[rad.totalStrokes]) {
      byStrokes[rad.totalStrokes] = [];
    }
    byStrokes[rad.totalStrokes].push(rad);
  });
  return byStrokes;

}

const buildRadicalToGlyph = (map1: RadicalMap, map2: RadicalMap) => {
  const map: RadicalMap = {};
  [map1, map2].forEach(m => {
    Object.values(m).forEach(rad => {
      if (!rad.glyph) return;
      if (map[rad.glyph]) return;
      map[rad.glyph] = rad;
    })
  });
  return map;
}

export function buildDerived(payload: Payload) {
  const simplifiedRadicalsByStrokes = buildRadicalsByStrokes(payload.simplifiedRadicalMap);
  const kangxiRadicalsByStrokes = buildRadicalsByStrokes(payload.kangxiRadicalMap);
  const syllabaryMaps = buildHomophones(payload.charEntryMap);
  const charsByResidual = buildCharsByResidual(payload.charEntryMap);
  const radicalToGlyphMap = buildRadicalToGlyph(payload.simplifiedRadicalMap, payload.kangxiRadicalMap)
  console.log('+++++++++++++++++++++++++++++++++++++++++++++')
  console.log(normalizeSyllable(ORTHOGRAPHY.YAPU_YAPIN,"ê/Êü/Ü"))
  console.log('+++++++++++++++++++++++++++++++++++++++++++++')
  return {
    simplifiedRadicalMap: payload.simplifiedRadicalMap,
    kangxiRadicalMap: payload.kangxiRadicalMap,
    charEntryMap: payload.charEntryMap,
    simplifiedRadicalsByStrokes,
    kangxiRadicalsByStrokes,
    syllabaryMaps,
    radicalToGlyphMap,
    ...charsByResidual,
  } as const;
}// Build an immutable initial state from payload

