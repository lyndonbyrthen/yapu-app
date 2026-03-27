import * as React from "react";
import { ButtonBase } from "@mui/material";

type RefCharButtonProps = {
  label: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  size?: number;        // square side in px (default 56)
  ariaLabel?: string;
};

export default function RefCharButton({
  label,
  onClick,
  active = false,
  size = 56,
  ariaLabel,
}: RefCharButtonProps) {
  return (
    <ButtonBase
      onClick={onClick}
      aria-label={ariaLabel}
      sx={{
        width: size,
        height: size,
        borderRadius: "3px",
        border: "1px solid",
        borderColor: "primary.main",
        bgcolor: active ? "primary.light" : "background.paper",
        color: active ? "primary.contrastText" : "text.primary",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: `RefHanGlyphs`,
        fontSize: Math.max(18, Math.floor(size * 0.58)),
        lineHeight: 1,
        userSelect: "none",
      }}
    >
      {label}
    </ButtonBase>
  );
}
