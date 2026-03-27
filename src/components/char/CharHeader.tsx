// src/components/charentry/CharHeader.tsx
import { CharEntry } from "@lib/char/charTypes";
import { uPlusToChar } from "@lib/char/charUtils";
import { Box, Typography, Stack, Link as MuiLink, Divider } from "@mui/material";
import { useCharLink } from "@src/hooks/linkHooks";
import RadicalMeta from "../charentry/CharHeaderMeta";
import { useAppStore } from "@src/store/provider";
import { useMemo } from "react";
import InlineButton from "../charentry/InlineButton";

export default function CharHeader({ charEntry }: { charEntry: CharEntry }) {
  const goChar = useCharLink();
  const kxRadMap = useAppStore((s) => s.kangxiRadicalMap);

  let yiti: string[] = [];
  const vari = charEntry.variantsMeta;

  yiti = [...yiti, ...(vari ? vari.simplified : [])];
  yiti = [...yiti, ...(vari ? vari.traditional : [])];
  yiti = [...yiti, ...(vari ? vari.variants : [])];
  yiti = [...new Set(yiti)];

  yiti = yiti.filter(c => c !== uPlusToChar(charEntry.unicode));

  const { unicode, RSMeta } = charEntry;
  const radicalId = RSMeta?.radicalId ?? null;
  const residual = RSMeta?.residual ?? null;

  const radicalMeta = useMemo(() => kxRadMap[radicalId + ''], [kxRadMap, radicalId]);

  return (
    <Stack
      direction="row"
      spacing={2}
      divider={<Divider orientation="vertical" flexItem />}
      sx={{
        justifyContent: "flex-start",
        alignItems: "last baseline",
      }}
    >

      <Typography
        variant="heroTitle"
        component="h1"
        sx={{
          fontFamily: "RefHanGlyphs",
          mb: 0.5,
        }}
      >
        {uPlusToChar(charEntry.unicode)}
      </Typography>

      <Stack direction="column" spacing={0} alignItems="left" sx={{}}>
        <Stack direction="row" spacing={1} alignItems="baseline" >
          {!!yiti.length &&
            <Typography noWrap>
              異體
            </Typography>
          }
          {!!yiti.length && yiti.map((c) => {

            return (<MuiLink
              key={c}
              component="button"
              underline="none"
              fontSize="2.5rem"
              fontFamily="RefHanGlyphs"
              onClick={() => goChar(c)}
            >

              {c}
            </MuiLink>)

          })}

        </Stack>

        <RadicalMeta
          radicalGlyph={radicalMeta?.glyph}
          residual={residual + ''}
        />
      </Stack>

    </Stack >
  );
}
