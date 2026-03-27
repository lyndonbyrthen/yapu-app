import fs from "node:fs";
import { OUT_JS, YAPU_DICTIONARY_JSON_PATH } from "@lib/paths";
import { log } from "@lib/buildUtils";


function loadDictionarySync() {
  const dictionaryPath = YAPU_DICTIONARY_JSON_PATH;

  if (!dictionaryPath) {
    throw new Error('YAPU_DICTIONARY_JSON_PATH environment variable is not set.');
  }

  try {
    const fileContent = fs.readFileSync(dictionaryPath, 'utf8');
    const dictionaryJson = JSON.parse(fileContent);
    return dictionaryJson;
  } catch (error:any) {
    log(`Failed to load or parse dictionary from ${dictionaryPath}:`, error);
    throw error;
  }
}


const dictionary = loadDictionarySync();

fs.writeFileSync(OUT_JS, `window.YAPU_DATA = ${JSON.stringify(dictionary)};`, "utf8");
