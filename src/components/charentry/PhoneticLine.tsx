import { Stack, Typography, Link, Box } from "@mui/material";
import InlineButton from "./InlineButton";

import { RUSHENG_LABEL, RushengFinal, Orthography, ORTHOGRAPHY } from "@lib/phonetics/phoneticTypes";
import { useCharLink, useHomophonesLink } from "@src/hooks/linkHooks";
import { getFinalPTK, getRushengLabel, hasFinalPTK, stripPTK } from "@lib/phonetics/phoneticUtils";

/** One reading row: small label + clickable phonetic tokens (keeps links). */
export default function PhoneticLine({
  label,
  syls = [],
  orth,
  link = false,
}: {
  label: string;
  syls?: string[];
  orth?: Orthography;
  link?: boolean
}) {
  const goHomophones = useHomophonesLink();
  const goChar = useCharLink();

  const isFanqie = orth === ORTHOGRAPHY.MIDDLE_CHINESE_FANQIE;

  const phoneticBlock = syls.length ? (
    <Box display="flex" flexWrap="wrap" gap={1}>
      {syls.map((syl, i) => {

        if (!link) return (
          <Typography key={`$${i}-${syl}`} component="span">
            {syl}
          </Typography>
        );
        const label = hasFinalPTK(syl) ? `${stripPTK(syl)}  |  ${syl}` : syl;
        return (
          <InlineButton key={`$${i}-${syl}`} text={label} onClick={() => goHomophones(orth + "", syl)} />
        )
      })}
    </Box>
  ) : (
    <Typography component="span" >
      暫缺
    </Typography>
  );



  const fanqieBlock = syls.length ? (
    <Box display="flex" flexWrap="wrap" columnGap={2}>
      {syls.map((syl, i) => {
        const [head, tail] = syl.split('');
        return (
          <Stack direction={"row"} spacing={.5}>
            <InlineButton key={`$${i}-${head}`} text={head} onClick={() => goChar(head)} />
            <InlineButton key={`$${i}-${tail}`} text={tail} onClick={() => goChar(tail)} />
          </Stack>
        )
      })}
    </Box>
  ) : (
    <Typography component="span" >
      暫缺
    </Typography>
  );

  return (

    <Stack direction="column" spacing={1} alignItems="baseline">
      <Stack direction="row" spacing={1} alignItems="baseline">
        <Typography
          // variant="caption"
          color="text.secondary"
        >
          {label}
        </Typography>
        {isFanqie ? fanqieBlock : phoneticBlock}
      </Stack>
    </Stack>
  );
}
