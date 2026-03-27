// scripts/fetch-unihan.js
import fs from "node:fs";
import path from "node:path";
import https from "node:https";
import AdmZip from "adm-zip";

const OUT_DIR = path.resolve("data/unihan");
const ZIP_URL = "https://www.unicode.org/Public/UCD/latest/ucd/Unihan.zip";
const WANT_FILE = "Unihan_DictionaryLikeData.txt";

fs.mkdirSync(OUT_DIR, { recursive: true });

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      if (res.statusCode !== 200) return reject(new Error("HTTP " + res.statusCode));
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on("finish", () => file.close(resolve));
    }).on("error", reject);
  });
}

function unzipWant(zipPath, wantName, outPath) {
  const AdmZip = require("adm-zip"); // add adm-zip as a dev dep or switch to node:stream unzip if you prefer
  const zip = new AdmZip(zipPath);
  const entry = zip.getEntry(wantName);
  if (!entry) throw new Error(`Entry ${wantName} not found in zip`);
  fs.writeFileSync(outPath, entry.getData());
}

(async () => {
  const zipPath = path.join(OUT_DIR, "Unihan.zip");
  const outPath = path.join(OUT_DIR, WANT_FILE);

  if (fs.existsSync(outPath)) {
    console.log("✅ Unihan file already present:", outPath);
    return;
  }
  console.log("⬇️  Downloading Unihan.zip …");
  await download(ZIP_URL, zipPath);

  // If you don't want adm-zip, you can shell out to unzip or use another lib.
  try {
    // dynamic require so the script runs even if you skip it
    unzipWant(zipPath, WANT_FILE, outPath);
  } catch (e) {
    console.error("You need adm-zip. Run: npm i -D adm-zip");
    throw e;
  }
  console.log("✅ Extracted", WANT_FILE, "to", outPath);
})();
