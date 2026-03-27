import { Divider, Typography } from "@mui/material";

type SectionHeaderDividerProps = {
  label: string;
};

export function SectionHeaderDivider({ label }: SectionHeaderDividerProps) {
  return (
    <Divider sx={{ mt: 1.5, marginBottom: "20px"}} textAlign="left">
        <Typography
        variant="h2"
        component="h2"
        sx={{
          mb: 0.5,
        }}
      >
        {label}
      </Typography>
    </Divider>
  );
}
