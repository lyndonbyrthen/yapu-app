// src/pages/RubyToolPage.tsx
import * as React from "react";
import { Box, Button, FormControl, InputLabel, MenuItem, Select, Stack, Typography } from "@mui/material";
import PageSection from "@src/components/page/PageSection";
import { useAppStore } from "@src/store/provider";
import RubyChar from "@src/components/char/RubyChar";
import { CharEntry } from "@lib/char/charTypes";
import { ORTHOGRAPHY, ORTHOGRAPHY_LABELS } from "@lib/phonetics/phoneticTypes";
import { isChineseChar } from "@lib/char/charUtils";
import { DeserializedRuby, deserializeFromJSON, downloadJson, loadRubyFile, ReadingPickedMap, RubySaveJSON, serializeToJSON, toTokens } from "./RubyToolUtils";
import { parseJsonFile } from "@lib/fileUtils";
import { useCallback } from "react";

const INPUT = `他等不得窮忙，即入蟠桃園內查勘。本園中有個土地攔住問道：「大聖何往？」大聖道：「吾奉玉帝點差，代管蟠桃園，今來查勘也。」那土地連忙施禮，即呼那一班鋤樹力士、運水力士、修桃力士、打掃力士都來見大聖磕頭，引他進去。但見那：夭夭灼灼，顆顆株株。夭夭灼灼花盈樹，顆顆株株果壓枝。果壓枝頭垂錦彈；花盈樹上簇胭脂。時開時結千年熟，無夏無冬萬載遲。先熟的，酡顏醉臉；還生的，帶蒂青皮。凝煙肌帶綠，映日顯丹姿。樹下奇葩並異卉，四時不謝色齊齊；左右樓臺並館舍，盈空常見罩雲霓。不是玄都凡俗種，瑤池王母自栽培。`;

const DEFAULT_ORTH = ORTHOGRAPHY.YAPU_YAPIN;

const RubyToolPage: React.FC = () => {
    const charEntryMap = useAppStore((s) => (s.charEntryMap)) as Record<string, CharEntry>;
    const [ruby, setRuby] = React.useState<DeserializedRuby>(() => ({
        tokens: toTokens(INPUT),
        orthography: DEFAULT_ORTH,
        readingsPicked: {},
    }));

    const onReadingChoice = useCallback((tokenId: string, readingIndex: string) => {
        setRuby(prev => {
            const readingsPicked: ReadingPickedMap = {
                ...(prev.readingsPicked as ReadingPickedMap),
                [tokenId]: readingIndex,
            };
            const next: DeserializedRuby = { ...prev, readingsPicked };
            return next;
        });
    }, []);

    // file input ref
    const fileInputRef = React.useRef<HTMLInputElement | null>(null);

    // SAVE handler (build doc and trigger download)
    const handleSaveJson = () => {
        const doc: RubySaveJSON = serializeToJSON(ruby, charEntryMap);
        const label = ORTHOGRAPHY_LABELS?.[ruby.orthography]?.split(":")[0] ?? ruby.orthography;
        const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
        downloadJson(`ruby_${label}_${ts}.json`, doc);
    };

    // OPEN button triggers hidden input
    const handleOpenClick = () => fileInputRef.current?.click();

    // LOAD handler (read the .json and parse)
    const handleFileChosen: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = ""; // allow re-selecting the same file
        if (!file) return;

        try {
            const newRuby = await loadRubyFile(file, ruby.orthography);
            setRuby(newRuby);
        } catch (err) {
            console.error("Failed to load file:", err);
            alert("載入失敗");
        }
    };

    const ORTH_OPTIONS = [
        ORTHOGRAPHY.YAPU_YAPIN,        // 雅普‧雅拼
        ORTHOGRAPHY.LAOGUOYIN_YAPIN,    // 老國音‧雅拼
        ORTHOGRAPHY.PUTONGHUA_PINYIN,   // 普通話‧拼音
    ];

    const handleOrthChange = (e: React.ChangeEvent<{ value: unknown }> | any) => {
        const value = e.target.value as keyof typeof ORTHOGRAPHY;
        setRuby(prev => ({ ...prev, orthography: value, readingsPicked: {} }));
    };

    return (
        <PageSection>
            <Typography variant="h6" fontFamily="UIGlyphs" gutterBottom>
                拼音標註生成
            </Typography>
            <Typography variant="body2" color="text.secondary" fontFamily="UIGlyphs" gutterBottom>
                {ORTHOGRAPHY_LABELS?.[ruby.orthography]?.split(":")[0] ?? ruby.orthography}
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" fontFamily="UIGlyphs" gutterBottom>
                    <Button variant="outlined" onClick={handleOpenClick}>
                        載入
                    </Button>
                </Typography>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="*/*"
                    hidden
                    onChange={handleFileChosen}
                />
                <Typography variant="body2" color="text.secondary" fontFamily="UIGlyphs" gutterBottom>
                    <Button variant="outlined" onClick={handleSaveJson}>
                        下載
                    </Button>
                </Typography>

                <FormControl size="small" sx={{ minWidth: 220 }}>
                    <Typography variant="body2" color="text.secondary" fontFamily="UIGlyphs" gutterBottom>
                        <InputLabel id="orthography-select-label">標註體系</InputLabel>
                        <Select
                            labelId="orthography-select-label"
                            value={ruby.orthography}
                            label="標註體系"
                            onChange={handleOrthChange}
                        >
                            {ORTH_OPTIONS.map((orth) => (
                                <MenuItem key={orth} value={orth}>
                                    {ORTHOGRAPHY_LABELS?.[orth]?.split(":")[0] ?? orth}
                                </MenuItem>
                            ))}
                        </Select>
                    </Typography>
                </FormControl>
            </Stack>

            <Box
                sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    columnGap: `10px`,
                    rowGap: `15px`,     // bigger for clearer line separation
                    alignItems: "center",    // vertically center items within each row
                }}
            >
                {
                    ruby.tokens.map((t: string, i: number) => {
                        const thisId = [t, i].join('-');
                        if (isChineseChar(t)) {
                            return (
                                <RubyChar
                                    key={thisId}
                                    char={t}
                                    readingsList={charEntryMap[t]?.readings?.[ruby.orthography] || []}
                                    defaultReading={ruby.readingsPicked[thisId]}
                                    onReadingChoice={onReadingChoice}
                                    tokenId={thisId}
                                />)
                        }
                        return (
                            <RubyChar
                                key={thisId}
                                text={t}
                            ></RubyChar>)
                    })
                }
            </Box>
        </PageSection >
    );
};

export default RubyToolPage;
