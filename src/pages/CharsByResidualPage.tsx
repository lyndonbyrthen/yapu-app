// src/pages/CharsByResidualPage.tsx
import { useMemo } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Box, Breadcrumbs, Divider, Typography, Link as MLink, Stack } from "@mui/material";
import PageSection from "@src/components/page/PageSection";
import RadicalHeader from "@src/components/radicals/RadicalHeader";
import FlowGroups from "@src/components/flow/FlowGroups";
import { useAppStore } from "@src/store/provider";
import RefCharButton from "@src/components/char/RefCharButton";
import RefCharLabel from "@src/components/char/RefCharLabel";
import type { CharsByResidual } from "@src/store/storeTypes";
import { RadicalMap } from "@lib/char/charTypes";
import { uPlusToChar } from "@lib/char/charUtils";
import { useCharLink } from "@src/hooks/linkHooks";
import { SectionHeaderDivider } from "@src/components/char/SectionHeaderDivider";

type Radset = "kangxi" | "simplified";

export default function CharsByResidualPage() {
  const { id: idParam } = useParams<{ id: string }>();
  const radGlyph = String(idParam ?? "");

  const [searchParams] = useSearchParams();

  const kxByResidual = useAppStore((s) => s.kangxiByResidual) as CharsByResidual;
  // const simplifiedByResidual = useAppStore((s) => s.simplifiedByResidual) as CharsByResidual;
  // const simpMap = useAppStore((s) => s.simplifiedRadicalMap) as RadicalMap;
  const kxMap = useAppStore((s) => s.kangxiRadicalMap) as RadicalMap;

  const radical = Object.values(kxMap).find((rad) => {
    return rad.glyph == radGlyph;
  });

  if (!radical) {
    return (
      <PageSection>
        <Typography variant="body2" color="text.secondary">
          查無此部首
        </Typography>
      </PageSection>
    );
  }

  const groups = useMemo(() => {
    return kxByResidual[radical.radicalId + ''];
  }, [kxByResidual, radical]);

  const totalCount = useMemo(
    () => Object.values(kxByResidual[radical.radicalId + '']).reduce((acc, arr) => acc + arr.length, 0),
    [kxByResidual, radical]
  );

  const goChar = useCharLink();

  return (
    <PageSection>

      <Breadcrumbs aria-label="breadcrumb">
        <MLink component={Link} underline="none" to="/radicals" >
          部首索引
        </MLink>
        <Typography >
          {`${radical.glyph}部`}
        </Typography>
      </Breadcrumbs>

      <Stack
        direction="row"
        divider={<Divider orientation="vertical" flexItem />}
        spacing={2}
        sx={{
          justifyContent: "flex-start",
          alignItems: "last baseline",
        }}
      >
        
        <Stack direction="row" alignItems="baseline">
          <Typography fontFamily={"RefHanGlyphs"} variant="h1" fontSize={'5rem'}>
            {radGlyph}
          </Typography>
          <Typography >
            {`部`}
          </Typography>
        </Stack>

        <Stack direction="column" alignItems="left">
          <Typography >
            {`${radical.totalStrokes}劃`}
          </Typography>
          <Typography >
            {`共${totalCount}字`}
          </Typography>
        </Stack>

      </Stack>

      <SectionHeaderDivider label={"部外筆劃順"} />

      {totalCount === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No characters found for this radical.
        </Typography>
      ) : (
        <Box sx={{ mt: 1.5 }}>
          <FlowGroups
            groups={groups}
            order={(a, b) => Number(a) - Number(b)}
            size={60}
            gapX={14}
            gapY={26}
            renderLabel={(k) => <RefCharLabel label={k} />}
            renderItem={(entry) => (
              <RefCharButton label={uPlusToChar(entry.unicode)} size={60} onClick={() => goChar(uPlusToChar(entry.unicode))} />
            )}
            keyForItem={(ch, k, i) => `char-${k}-${ch}-${i}`}
          />
        </Box>
      )}
    </PageSection>
  );
}
