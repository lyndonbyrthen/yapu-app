import { CharEntryMap } from "@lib/char/charTypes";
import { FINAL_CHAR_MAP } from "@lib/paths";
import { fs } from "zx";

export const loadCharEntryMap = () => {
    return JSON.parse(fs.readFileSync(FINAL_CHAR_MAP, "utf-8"))?.charEntryMap as CharEntryMap;
}