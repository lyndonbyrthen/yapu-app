import { useRouteStore } from "@src/store/routeState";
import { useCallback } from "react";

export const useCharLink = () => {
    const setPath = useRouteStore((s) => s.setPath);
    return useCallback(
        (ch: string) => {
            setPath(`/char/${encodeURIComponent(ch)}`);
        },
        [setPath]
    );
};


export const useHomophonesLink = () => {
    const setPath = useRouteStore((s) => s.setPath);
    return useCallback(
        (orth: string, syl: string) => {
            setPath(`/homophones/?orth=${encodeURIComponent(orth)}&syl=${syl}`);
        },
        [setPath]
    );
};

export const useCharsByResidualLink = () => {
    const setPath = useRouteStore((s) => s.setPath);
    return useCallback(
        (radGlyph: string) => {
            setPath(`/radical/${encodeURIComponent(radGlyph)}`);
        },
        [setPath]
    );
};

export const useMenuLink = () => {
    const setPath = useRouteStore((s) => s.setPath);

    return useCallback(
        (
            target:
                | "radicals"
                | "syllabary"
                | "rubytool",
            orth?: string,
            syl?: string
        ) => {
            switch (target) {

                case "radicals":
                    setPath("/radicals");
                    break;

                case "syllabary":
                    setPath("/syllabary");
                    break;

                case "rubytool":
                    setPath("/rubytool");
                    break;

                default:
                    console.warn(`Unknown menu target: ${target}`);
            }
        },
        [setPath]
    );
};
