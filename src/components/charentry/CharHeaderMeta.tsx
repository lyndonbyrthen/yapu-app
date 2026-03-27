import * as React from "react";
import { Stack, Button, Typography, styled } from "@mui/material";
import InlineButton from "./InlineButton";
import { useCharsByResidualLink } from "@src/hooks/linkHooks";

const RadButton = styled(Button)({
  fontSize: 22,
  padding: "4px 0px",
  lineHeight: 1,
  borderRadius: "4px",
  textTransform: "none",
  fontFamily: '"UIGlyphs"',
});

export default function RadicalMeta({
  radicalGlyph,
  residual,
}: {
  radicalGlyph?: string | null;
  residual?: string | null;
  label?: string;
}) {
  const goCharsByResidual = useCharsByResidualLink();

  const contentBlock = radicalGlyph != null ? <>
    {(
      <InlineButton
        text={`${(radicalGlyph ?? "#")}部`}
        onClick={() => goCharsByResidual(radicalGlyph)}
      >
      </InlineButton>
    )}
    {residual != null && (
      <Typography
      >
        部外{residual}劃
      </Typography>
    )}
  </> : <Typography component="span" fontFamily={"UIGlyphs"} fontSize={"1.5em"}>暫缺</Typography>;

  return (
    <Stack direction="row" spacing={2} alignItems="baseline" sx={{  }}>
      {contentBlock}
    </Stack>
  );
}
