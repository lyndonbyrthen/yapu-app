import { Orthography, ReadingsRecord, Syllabary, Syllable } from "@lib/phonetics/phoneticTypes";

export function defaultReadingsRecord(keys: Orthography[] = []): ReadingsRecord {
  const rec: ReadingsRecord = {};
  for (const k of keys) {
    rec[k] = []
  }
  return rec;
}

export function defaultSyllable(str: string): Syllable {
  return { text: str }
}

export function defaultSyllabary(syls: string[] = []): Syllabary {
  return new Set(syls.map(s => defaultSyllable(s)));
}