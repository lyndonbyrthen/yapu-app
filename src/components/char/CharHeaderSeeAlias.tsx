// src/components/charentry/CharHeader.tsx
import { CharEntry } from "@lib/char/charTypes";
import { uPlusToChar } from "@lib/char/charUtils";
import { Box, Typography, Stack, Link as MuiLink } from "@mui/material";
import { useCharLink } from "@src/hooks/linkHooks";

export default function CharHeaderSeeAlias({ charEntry, redirects }: { charEntry: CharEntry, redirects: string[] },) {
  if (!redirects) return;

  const goChar = useCharLink();

  return (
    <Stack direction="row" spacing={2} alignItems="baseline" >
      {/* Main character */}
      <Typography
        // variant="h3"
        sx={{
          fontFamily: "RefHanGlyphs",
          lineHeight: 1,
          fontSize: "5em",
          mb: 0.5,
        }}
      >
        {uPlusToChar(charEntry.unicode)}
      </Typography>

      {/* Simplified + variants, if present */}
      <Stack direction="row" spacing={0} alignItems="baseline" >

        <Typography variant="body2" color="text.secondary" fontFamily="UIGlyphs" fontSize="1.5em">
          {'通'}
        </Typography>

        {
          redirects.map(r => {
            return <MuiLink
              component="button"
              underline="none"
              onClick={() => goChar(r)}
              sx={{ ml: 0.5, fontFamily: "RefHanGlyphs", fontSize: "3em" }}
            >
              {r}
            </MuiLink>
          })
        }



      </Stack>
    </Stack>
  );
}
