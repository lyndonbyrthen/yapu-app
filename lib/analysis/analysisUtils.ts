import { CharEntryMap } from "@lib/char/charTypes";
import { FINAL_CHAR_MAP } from "@lib/paths";
import { fs } from "zx";

export const loadCharEntryMap = (path?: string) => {
    const filePath = path && path.trim() ? path : FINAL_CHAR_MAP;

    return JSON.parse(
        fs.readFileSync(filePath, "utf-8")
    )?.charEntryMap as CharEntryMap;
};