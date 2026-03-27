// src/components/char/StrokeLabel.tsx
import * as React from "react";
import { Box, Typography, useTheme } from "@mui/material";

type RefCharLabelProps = {
  label: string;
  size?: number;
  isSyllable?: boolean   // square side in px
};

export default function RefCharLabel({ label, size = 60, isSyllable = false }: RefCharLabelProps) {

  const theme = useTheme();

  return (
    <Box
      aria-label={label}
      sx={{
        height: size,
        width: isSyllable ? 132 : size,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid",
        borderColor: theme.palette.grey[300],
        bgcolor: theme.palette.grey[300],
        color: "primary.text",
        lineHeight: 1,
        userSelect: "none",
      }}
    >
      <Typography
        variant="body2"
      >
        {label}
      </Typography>
    </Box>
  );
}
