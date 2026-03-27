// src/components/char/RubyChar.tsx
import * as React from "react";
import { Box, ButtonBase, Popover, RadioGroup, FormControlLabel, Radio, MenuList, MenuItem, Divider } from "@mui/material";
import { CharEntry } from "@lib/char/charTypes";
import { uPlusToChar } from "@lib/char/charUtils";
import { useEffect, useState } from "react";
import { SxProps, Theme } from "@mui/system";
import { hasFinalPTK } from "@lib/phonetics/phoneticUtils";

const unitInteractiveSx: SxProps<Theme> = {
    display: "inline-flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    alignItems: "center",
    verticalAlign: "baseline",
    userSelect: "none",
    borderRadius: "6px",
    border: "1px solid",
    borderColor: "divider",
    bgcolor: "background.paper",
    cursor: "pointer",
    "&:hover": { bgcolor: "action.hover", borderColor: "primary.main" },
    "&:active": { bgcolor: "action.selected" },
    height: "70px",
    minWidth: "fit-content",
    padding: "5px",
};

const unitPlainSx: SxProps<Theme> = {
    display: "inline-flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    alignItems: "center",
    verticalAlign: "baseline",
    userSelect: "none",
    borderRadius: 0,
    border: "none",
    bgcolor: "transparent",
    cursor: "default",
    height: "70px",
    minWidth: "fit-content",
    padding: "5px",
};

const charStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "RefHanGlyphs",
    fontSize: "1.2em",
    lineHeight: 1,
    color: "text.primary",
    userSelect: "text",
    px: 0,
};

const textStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "UIGlyphs",
    fontSize: "1em",
    lineHeight: 1,
    color: "text.primary",
    userSelect: "text",
    paddingBottom: "5px",
}

const readingStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "UIGlyphs",
    fontSize: "1em",
    paddingBottom: "15px",
}

const getRushengSyllable = (syls:string[]) => syls.find((s)=> hasFinalPTK(s));

type RubyCharProps = {
    char?: string;
    readingsList?: string[];
    text?: string;
    tokenId?: string;
    onReadingChoice?: (tokenId: string, reading: string) => void; // ← callback
    defaultReading?: string;
};

export const RubyChar: React.FC<RubyCharProps> = ({
    char,
    readingsList = [],
    text,
    tokenId,
    onReadingChoice,
    defaultReading,
}) => {

    const hasMultiple = readingsList.length > 1;

    const selectedReading = defaultReading && (readingsList.indexOf(defaultReading) !== undefined) 
    ? defaultReading 
    : getRushengSyllable(readingsList) || readingsList[0];

    const [reading, setReading] = useState(selectedReading);

    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
    const open = anchorEl !== null;

    useEffect(() => {
        selectedReading && setReading(selectedReading);
    }, [selectedReading, readingsList]);

    const handleAnchorClick = React.useCallback((e: React.MouseEvent<HTMLElement>) => {
        if (!hasMultiple) return;
        setAnchorEl(prev => {
            if (prev) {
                return null;
            }
            return e.currentTarget as HTMLElement; // opening
        });
    }, [hasMultiple]);

    const Wrapper = hasMultiple ? ButtonBase : Box;
    const style = char ? charStyle : textStyle;
    style.color = char && readingsList.length < 1 ? 'darkred' : '';

    return (
        <Wrapper
            component="span"
            onClick={hasMultiple ? handleAnchorClick : undefined}
            aria-label={hasMultiple ? "Choose reading" : undefined}
            sx={hasMultiple ? unitInteractiveSx : unitPlainSx}
        >
            <Box
                component="span"
                sx={readingStyle}
            >
                {char && reading}
            </Box>

            <Box
                component="span"
                sx={style}
            >
                {char ? char :
                    <Box component="span" sx={{ whiteSpace: "break-spaces" }}>
                        {text}
                    </Box>}

            </Box>

            {/* Selector popover */}
            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleAnchorClick}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
                transformOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <MenuList dense>
                    {readingsList.map((r, idx) => (
                        <MenuItem
                            key={r}
                            selected={reading === r}
                            onClick={(e) => {
                                setReading(r);
                                tokenId && onReadingChoice?.(tokenId, r);
                                handleAnchorClick(e);
                            }}
                        >
                            {r}
                        </MenuItem>
                    ))}
                </MenuList>
            </Popover>

        </Wrapper >
    );
};

export default RubyChar;
