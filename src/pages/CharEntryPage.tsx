import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Divider, Button, Stack } from "@mui/material";

import { useAppStore } from "@src/store/provider";
import PhoneticLine from "@src/components/charentry/PhoneticLine";
import CharHeader from "@src/components/char/CharHeader";

import { ORTHOGRAPHY, type ReadingsRecord } from "@lib/phonetics/phoneticTypes";
import { SectionHeaderDivider } from "@src/components/char/SectionHeaderDivider";
import { hasFinalPTK, peelTone, stripPTK } from "@lib/phonetics/phoneticUtils";
import { findCharWithReadings } from "@lib/char/charUtils";
import CharHeaderSeeAlias from "@src/components/char/CharHeaderSeeAlias";
import PageSection from "@src/components/page/PageSection";

const NotFound = (char: string = '') => (
  <Box sx={{ p: 3 }}>
    <Typography sx={{ fontFamily: "UIGlyphs" }}>
      查無此字
    </Typography>
    <Typography color="text.secondary" sx={{ mt: 1, fontFamily: "UIGlyphs" }}>
      無資料：<strong>{char ?? ""}</strong>
    </Typography>
  </Box>

)

export default function CharEntryPage() {
  const { char: charParam } = useParams<{ char: string }>();

  if (!charParam) return NotFound();

  const charEntryMap = useAppStore((s) => s.charEntryMap);

  const entry = useMemo(() => charEntryMap[charParam], [charEntryMap, charParam]);

  if (!entry || !charParam) return NotFound(charParam);

  // if the char is simplified - not both trad and simp
  // then redirect
  if (entry?.variantsMeta?.traditional.length) {
    if (entry.variantsMeta.traditional.indexOf(charParam) < 0)
      return (
        <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 920, mx: "auto" }}>
          <CharHeaderSeeAlias charEntry={entry} redirects={entry.variantsMeta.traditional} />
        </Box>
      )
  }

  // if no readings, then look for alias
  if (!entry?.readings?.[ORTHOGRAPHY.YAPU_YAPIN]) {
    const alias = findCharWithReadings(charParam, charEntryMap);
    if (!alias) return NotFound(charParam);
    return (
      <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 920, mx: "auto" }}>
        <CharHeaderSeeAlias charEntry={entry} redirects={[alias]} />
      </Box>
    )
  }

  const readings = entry.readings as ReadingsRecord | null;
  const sylNoPTk = readings?.[ORTHOGRAPHY.YAPU_YAPIN].map(syl => hasFinalPTK(syl) ? stripPTK(syl) : syl);
  const sylsWithPTK = readings?.[ORTHOGRAPHY.YAPU_YAPIN].filter(syl => hasFinalPTK(syl));


  return (
    <PageSection>
      <Stack direction="column" spacing={5} sx={{ mb: "100px" }}>
        <CharHeader charEntry={entry} />

        <Stack direction="column" spacing={.5}>
          <SectionHeaderDivider label={"雅音普通話"} />

          <PhoneticLine
            label="【雅拼】"
            orth={ORTHOGRAPHY.YAPU_YAPIN}
            syls={readings?.[ORTHOGRAPHY.YAPU_YAPIN]}
            link={true}
          />

          {/* {!!sylsWithPTK?.length && <PhoneticLine
          label="【入聲尾韵】"
          orth={ORTHOGRAPHY.YAPU_YAPIN}
          syls={sylsWithPTK}
          link={true}
        />} */}
        </Stack>

        <Stack direction="column" spacing={0}>
          <SectionHeaderDivider label={"老國音"} />

          <PhoneticLine
            label="【雅拼】"
            orth={ORTHOGRAPHY.LAOGUOYIN_YAPIN}
            syls={readings?.[ORTHOGRAPHY.LAOGUOYIN_YAPIN]}
            link={true}
          />
          <PhoneticLine
            label="【注音】"
            orth={ORTHOGRAPHY.LAOGUOYIN_ZHUYIN}
            syls={readings?.[ORTHOGRAPHY.LAOGUOYIN_ZHUYIN]}
          />
        </Stack>

        {
          !!readings?.[ORTHOGRAPHY.PUTONGHUA_PINYIN]?.length &&
          <Stack direction="column" spacing={0}>
            <SectionHeaderDivider label={"普通話"} />

            <PhoneticLine
              label="【拼音】"
              orth={ORTHOGRAPHY.PUTONGHUA_PINYIN}
              syls={readings?.[ORTHOGRAPHY.PUTONGHUA_PINYIN]}
              link={true}
            />
          </Stack>
        }

        {
          !!readings?.[ORTHOGRAPHY.CANTONESE_JYUTPING]?.length &&
          <Stack direction="column" spacing={0}>
            <SectionHeaderDivider label={"廣東話"} />

            <PhoneticLine
              label="【粵拼】"
              orth={ORTHOGRAPHY.CANTONESE_JYUTPING}
              syls={readings?.[ORTHOGRAPHY.CANTONESE_JYUTPING]}

            />
          </Stack>
        }

        {
          !!readings?.[ORTHOGRAPHY.MIDDLE_CHINESE_FANQIE]?.length &&
          <Stack direction="column" spacing={0}>
            <SectionHeaderDivider label={"中古漢語"} />

            <PhoneticLine
              label="【反切】"
              orth={ORTHOGRAPHY.MIDDLE_CHINESE_FANQIE}
              syls={readings?.[ORTHOGRAPHY.MIDDLE_CHINESE_FANQIE]}
            />
          </Stack>
        }

        {
          !!readings?.[ORTHOGRAPHY.MIDDLE_CHINESE_BAXTER]?.length &&
          <Stack direction="column" spacing={0}>
            <SectionHeaderDivider label={"白一平中古漢語"} />

            <PhoneticLine
              label="【中古漢語】"
              orth={ORTHOGRAPHY.MIDDLE_CHINESE_BAXTER}
              syls={readings?.[ORTHOGRAPHY.MIDDLE_CHINESE_BAXTER]}
            />
          </Stack>
        }



      </Stack>
    </PageSection>
  );
}
