import * as React from "react";
import { Typography, Box, Stack } from "@mui/material";
import PageSection from "@src/components/page/PageSection";
import FlowGroups from "@src/components/flow/FlowGroups";
import { useAppStore } from "@src/store/provider";
import RefCharButton from "@src/components/char/RefCharButton";
import RefCharLabel from "@src/components/char/RefCharLabel";
import { RadicalsByStrokes } from "@lib/char/charTypes";
import { useCharsByResidualLink, useHomophonesLink } from "@src/hooks/linkHooks";
import { normalizeRadical } from "@lib/char/charUtils";
import { SectionHeaderDivider } from "@src/components/char/SectionHeaderDivider";
import { ORTHOGRAPHY } from "@lib/phonetics/phoneticTypes";
import { sortObjectKeys } from "@lib/generalUtils";
import InlineButton from "@src/components/charentry/InlineButton";
import QuickScrollMenu from "@src/components/ui/QuickScrollMenu";

const DEFAULT_ORTH = ORTHOGRAPHY.YAPU_YAPIN;
const ALPHA_ORDER = 'abcdefghijklmnopqrstuüxz';

const SyllableIndexPage: React.FC = () => {
  const syllabaryMaps = useAppStore((s) => s.syllabaryMaps);
  const syllabary = syllabaryMaps[DEFAULT_ORTH];

  let groups: Record<string, Array<string>> = {};

  Object.entries(syllabary).map(([normSyl, syllableMap]) => {
    const init = normSyl[0];
    if (!groups[init]) groups[init] = [];
    groups[init].push(normSyl);
    groups[init].sort();
  });

  groups = sortObjectKeys(groups);
  const goHomophones = useHomophonesLink();

  const scrollerRef = React.useRef<HTMLDivElement | null>(null);

  return (
    <PageSection>

      <Typography variant="h1" fontFamily={"UIGlyphs"} gutterBottom>
        音節索引
      </Typography>

      <Box ref={scrollerRef}>

        <Stack>
          {ALPHA_ORDER.split('').map((letter) => {
            return (
              <Stack
                key={letter}
                id={`section-${letter}`}
              >
                <SectionHeaderDivider key={`${letter}`} label={`${letter}`}></SectionHeaderDivider>
                <Box

                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    columnGap: "1.5rem",
                    rowGap: "1.5rem",     // bigger for clearer line separation
                    alignItems: "center",    // vertically center items within each row
                  }}
                >
                  {
                    groups[letter].map((syl) =>
                      <InlineButton
                        key={syl}
                        text={syl}
                        onClick={() => goHomophones(DEFAULT_ORTH + "", syl)}
                      ></InlineButton>)
                  }
                </Box>
              </Stack>)
          })}
        </Stack>
      </Box>

      <QuickScrollMenu
        letters={ALPHA_ORDER.split('')}
        sectionPrefix="section-"
        offsetTop={80} // adjust if you have a fixed header; this is the scroll offset
        scrollContainer={scrollerRef.current}
      />
    </PageSection>
  );
};

export default SyllableIndexPage;
