import * as React from "react";
import { Typography, Box } from "@mui/material";
import PageSection from "@src/components/page/PageSection";
import FlowGroups from "@src/components/flow/FlowGroups";
import { useAppStore } from "@src/store/provider";
import RefCharButton from "@src/components/char/RefCharButton";
import RefCharLabel from "@src/components/char/RefCharLabel";
import { RadicalsByStrokes } from "@lib/char/charTypes";
import { useCharsByResidualLink } from "@src/hooks/linkHooks";
import { normalizeRadical } from "@lib/char/charUtils";
import { SectionHeaderDivider } from "@src/components/char/SectionHeaderDivider";

const RadicalIndexPage: React.FC = () => {
  const simplifiedRadicals = useAppStore((s) => s.simplifiedRadicalsByStrokes);
  const kangxiRadicals = useAppStore((s) => s.kangxiRadicalsByStrokes);

  const handleClick = useCharsByResidualLink();

  const renderGroups = (groups: RadicalsByStrokes, title: string, subtitle: string, radset?: string) => (
    <Box sx={{ mt: 2.5 }}>
      <Typography variant="h1" gutterBottom>
        {title}
      </Typography>

      <SectionHeaderDivider label={`${subtitle}`}></SectionHeaderDivider>

      <Box sx={{ mt: 1.5 }}>
        <FlowGroups
          groups={groups}
          order={(a, b) => Number(a) - Number(b)}
          size={60}
          gapX={14}
          gapY={26}
          renderLabel={(k) => <RefCharLabel label={k} size={60} />}
          renderItem={(rad) => (
          <RefCharButton
              label={normalizeRadical(rad.glyph+'')}
              size={60}
              onClick={() => handleClick(rad.glyph+'')}
            />)}
          keyForItem={(rad, k) => `rad-${k}-${rad.radicalId}`}
        />
      </Box>
    </Box>
  );

  return (
    <PageSection>
      {renderGroups(kangxiRadicals, "部首索引", "筆劃順")}
      {/* {renderGroups(simplifiedRadicals, "簡化部首索引", "依部首筆劃順", "simplified")} */}
    </PageSection>
  );
};

export default RadicalIndexPage;
