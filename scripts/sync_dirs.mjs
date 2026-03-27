import chokidar from "chokidar";
import { cp, rm, mkdir } from "node:fs/promises";
import path from "node:path";

const SRC = "/home/primo_uomo/workspace/yapu-app";
const DEST = "/mnt/d/workspace/app-mirror";
const SKIP = new Set([".git", "node_modules", ".pnpm"]);
const to = p => path.join(DEST, path.relative(SRC, path.resolve(p)));
const ignored = p => {
    const abs = path.resolve(p);
    if (!abs.startsWith(SRC) || abs.startsWith(DEST)) return true;
    return path.relative(SRC, abs).split(path.sep).some(s => SKIP.has(s));
};

chokidar.watch(SRC, { persistent: true, ignoreInitial: false, followSymlinks: false, usePolling: true, ignored })
    .on("ready", () => console.log("[watching]", SRC, "→", DEST))
    .on("all", async (e, p) => {
        const d = to(p);
        if (e === "add" || e === "change") {
            await mkdir(path.dirname(d), { recursive: true });
            await cp(p, d, { force: true });
        }
        else if (e === "addDir") await mkdir(d, { recursive: true });
        else if (e === "unlink") await rm(d, { force: true });
        else if (e === "unlinkDir") await rm(d, { recursive: true, force: true });
    })
    .on("error", err => console.error("[watcher error]", err));
