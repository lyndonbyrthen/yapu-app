import fs from "node:fs";
import { parse } from "csv-parse/sync";

// loading a json file
// const m = JSON.parse(fs.readFileSync('scripts/data/dictionary/char_phonetic_groups_map.json', "utf8"));


/* ======================= Generic upsert helpers ============================ */

/**
 * Upsert arbitrary field into a JSON file (creates file if absent).
 * fieldValue must be plain JSON-serializable data.
 */
export function upsertFieldIntoJSON(jsonPath: string, fieldName: string, fieldValue: unknown): void {
  const obj = fs.existsSync(jsonPath)
    ? JSON.parse(fs.readFileSync(jsonPath, "utf8"))
    : {};
  (obj as Record<string, unknown>)[fieldName] = fieldValue;
  fs.mkdirSync("public", { recursive: true });
  fs.writeFileSync(jsonPath, JSON.stringify(obj, null, 2), "utf8");
  console.log(`[data.json] upserted '${fieldName}'`);
}

/**
 * Upsert arbitrary field into a JS module that exports an object.
 * Supports:
 *   1) export const <name> = { ... }
 *   2) export default { ... }
 *   3) export let/var <name> = { ... }
 * Falls back to attaching a global on window/self.
 *
 * fieldValueExpr must be a valid JS expression string, e.g. "new Map([...])" or "{...}".
 */
export function upsertFieldIntoJS(jsPath: string, fieldName: string, fieldValueExpr: string): void {
  if (!fs.existsSync(jsPath)) {
    console.warn(`[data.js] not found at ${jsPath}; skipping.`);
    return;
  }
  let code = fs.readFileSync(jsPath, "utf8");

  // export const <name> = {
  let m = code.match(/export\s+const\s+(\w+)\s*=\s*{/);
  if (m) {
    const varName = m[1];
    code += `

/* appended by build_fonts.ts */
${varName}.${fieldName} = ${fieldValueExpr};
`;
    fs.writeFileSync(jsPath, code, "utf8");
    console.log(`[data.js] attached '${fieldName}' to '${varName}' (export const).`);
    return;
  }

  // export default { ... }
  m = code.match(/export\s+default\s+({[\\s\\S]*?})\\s*;?\\s*$/);
  if (m) {
    const full = m[0];
    const obj = m[1];
    code = code.replace(
      full,
      `const __PAYLOAD__ = ${obj};
/* appended by build_fonts.ts */
__PAYLOAD__.${fieldName} = ${fieldValueExpr};
export default __PAYLOAD__;`
    );
    fs.writeFileSync(jsPath, code, "utf8");
    console.log(`[data.js] attached '${fieldName}' to default export.`);
    return;
  }

  // export let/var <name> = {
  m = code.match(/export\\s+(?:let|var)\\s+(\\w+)\\s*=\\s*{/);
  if (m) {
    const varName = m[1];
    code += `

/* appended by build_fonts.ts */
${varName}.${fieldName} = ${fieldValueExpr};
`;
    fs.writeFileSync(jsPath, code, "utf8");
    console.log(`[data.js] attached '${fieldName}' to '${varName}' (export let/var).`);
    return;
  }

  // Fallback: global
  code += `

/* appended by build_fonts.ts (fallback) */
(self || window)["${fieldName}"] = ${fieldValueExpr};
`;
  fs.writeFileSync(jsPath, code, "utf8");
  console.log(`[data.js] appended global '${fieldName}' (fallback).`);
}

export function loadCSVMap(
  csvPath: string,
  indexColumn: string
): Record<string, Record<string, string>> {
  const raw = fs.readFileSync(csvPath, "utf8");
  const records: Record<string, string>[] = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  const map: Record<string, Record<string, string>> = {};
  for (const row of records) {
    const key = row[indexColumn];
    if (key) {
      map[key] = row;
    }
  }
  return map;
}
// --- LOAD: read a chosen .json File and parse it ---

export const parseJsonFile = async <T = unknown>(file: File): Promise<T> => {
  const text = await file.text();
  return JSON.parse(text) as T;
};
