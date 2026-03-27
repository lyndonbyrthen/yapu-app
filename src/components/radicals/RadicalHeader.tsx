import * as React from "react";
import { Breadcrumbs, Link as MLink, Typography, Chip, Stack, Divider } from "@mui/material";
import { Link } from "react-router-dom";

type Props = {
  radicalId: string;
  radicalChar: string;
  radicalName?: string;
  radicalStrokes: string;
  count: string;
};

export default function RadicalHeader({ radicalId, radicalChar, radicalName, radicalStrokes, count }: Props) {
  const MetaChip = (label: string) => (
    <Chip sx={{
      height: 'auto',
      '& .MuiChip-label': {
        display: 'block',
        whiteSpace: 'normal',
      },
      fontFamily: 'UIGlyphs',
      fontSize: '1em',
      borderRadius: .3
    }}
      label={label} />
  )

  return (
    <Stack direction="row" spacing={1} alignItems="baseline">
      <Typography fontFamily={"RefHanGlyphs"} variant="h1" fontSize={'3rem'}>
        {radicalChar} {radicalName ? `· ${radicalName}` : ""}
      </Typography>
      <Typography variant="body1">
        {`部 ${radicalStrokes}劃  收錄共${count}字`}
      </Typography>
    </Stack>
  );
}
