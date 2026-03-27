// src/pages/HomophonesPage.tsx
import { Box, Breadcrumbs, Typography, Link as MLink, Stack } from "@mui/material";
import PageSection from "@src/components/page/PageSection";
import FlowGroups from "@src/components/flow/FlowGroups";
import { Link, useSearchParams } from "react-router-dom";
import { useAppStore } from "@src/store/provider";
import { comparePinyinTones, compareYapinTones, getYapinTone, hasFinalPTK, normalizeSyllable, normalizeZhChShR, stripPTK } from "@lib/phonetics/phoneticUtils";
import RefCharLabel from "@src/components/char/RefCharLabel";
import RefCharButton from "@src/components/char/RefCharButton";
import { useMemo } from "react";
import { useCharLink } from "@src/hooks/linkHooks";
import { sortObjectKeys } from "@lib/generalUtils";
import { ORTHOGRAPHY, ORTHOGRAPHY_LABELS } from "@lib/phonetics/phoneticTypes";
import { SectionHeaderDivider } from "@src/components/char/SectionHeaderDivider";

const NotFound = () => (
  <Box sx={{ py: 6, textAlign: "center", opacity: 0.7 }}>
    <Typography variant="body1" fontFamily={"UIGlyphs"}>
      無對應同音字
    </Typography>
  </Box>
);

export default function HomophonesPage() {
  const [params] = useSearchParams();
  const syl = params.get("syl") || "";
  const orth = params.get("orth") || "";
  let normSyl = normalizeSyllable(orth, syl).base;

  // rusheng zh ch sh r become zhi chi shi ri, but should still belong to the same group
  // strip the i's at the end to get the base form of the syllable
  if (orth === ORTHOGRAPHY.YAPU_YAPIN) normSyl = normalizeZhChShR(stripPTK(normSyl));

  const sylMaps = useAppStore((s) => s.syllabaryMaps);
  const sylGroup = useMemo(
    () => sylMaps[orth][normSyl],
    [orth, sylMaps, syl]
  );

  if (!sylGroup) return NotFound();

  const { groups, ptkGroups } = useMemo(() => {
    let g: Record<string, Array<string>> = {};
    let ptk: Record<string, Array<string>> = {};

    Object.entries(sylGroup).forEach(([sylToned, charSet]) => {
      // not displaying rusheng syllables by ending
      if (hasFinalPTK(sylToned)) ptk[sylToned] = Array.from(charSet);
      else g[sylToned] = Array.from(charSet);
    });

    let compFunc = compareYapinTones;
    if (orth === ORTHOGRAPHY.PUTONGHUA_PINYIN) {
      compFunc = comparePinyinTones
    }

    return {
      groups: sortObjectKeys(g, compFunc),
      ptkGroups: sortObjectKeys(ptk, compFunc),
    };

  }, [sylGroup, orth])

  const goChar = useCharLink();

  return (
    <PageSection>
      <Stack spacing={5}>

        <Breadcrumbs aria-label="breadcrumb">
          <MLink component={Link} underline="none" to="/syllabary" >
            音節索引
          </MLink>
          <Typography>
            {ORTHOGRAPHY_LABELS[orth].split(':')[0]} {normSyl} 同音字表
          </Typography>
        </Breadcrumbs>

        <Stack>
          <SectionHeaderDivider label={"聲調筆劃順"} />
          <FlowGroups
            groups={groups}
            order={(a, b) => Number(a) - Number(b)}
            size={60}
            gapX={14}
            gapY={26}
            isDoubleWidthLabel
            renderLabel={(sylToned) => <RefCharLabel label={sylToned} isSyllable />}
            renderItem={(ch) => (
              <RefCharButton
                label={ch}
                size={60}
                onClick={() => goChar(ch as string)}
                ariaLabel={`char-${ch}`}
              />
            )}
            keyForItem={(ch, sylToned) => `${orth}-${sylToned}-${ch}`}
          />
        </Stack>

        {Object.entries(ptkGroups).length > 0 &&
          <Stack>
            <SectionHeaderDivider label={"入聲尾韻"} />
            <FlowGroups
              groups={ptkGroups}
              order={(a, b) => Number(a) - Number(b)}
              size={60}
              gapX={14}
              gapY={26}
              isDoubleWidthLabel
              renderLabel={(sylToned) => <RefCharLabel label={sylToned} isSyllable />}
              renderItem={(ch) => (
                <RefCharButton
                  label={ch}
                  size={60}
                  onClick={() => goChar(ch as string)}
                  ariaLabel={`char-${ch}`}
                />
              )}
              keyForItem={(ch, sylToned) => `${orth}-${sylToned}-${ch}`}
            />
          </Stack>
        }
      </Stack>
    </PageSection>
  );
}
