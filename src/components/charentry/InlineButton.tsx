// src/ui/InlineButton.tsx
import * as React from "react";
import { Button, styled, Typography } from "@mui/material";

/** Small inline button, similar to FieldLabel but clickable. */
const Base = styled(Button)({
  minWidth: 0,
  padding: ".2em .3em",
  textTransform: "none",
  verticalAlign: "baseline",
  border: "1px solid currentColor",
});

export default function InlineButton({
  onClick,
  text,
}: {
  text: string;
  onClick?: () => void;
}) {
  return (
    <Base
      onClick={onClick}
      disableRipple
    >
      <Typography
      >
        {text}
      </Typography>
    </Base>
  );
}
