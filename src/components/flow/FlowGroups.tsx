// src/components/flow/FlowGroups.tsx
import * as React from "react";
import { Box } from "@mui/material";

type FlowGroupsProps<T> = {
  groups: Record<string, ReadonlyArray<T>>;
  order?: (a: string, b: string) => number;
  size?: number;     // square side for label + items
  gapX?: number;     // horizontal gap
  gapY?: number;     // vertical gap (row gap) - should be larger than gapX
  renderLabel: (groupKey: string, size: number) => React.ReactNode;
  renderItem: (item: T, groupKey: string, idx: number, size: number) => React.ReactNode;
  keyForItem: (item: T, groupKey: string, idx: number) => React.Key;
  isDoubleWidthLabel?: boolean;
};

export default function FlowGroups<T>({
  groups,
  order = (a, b) => Number(a) - Number(b),
  size = 56,
  gapX = 12,
  gapY = 24,
  renderLabel,
  renderItem,
  keyForItem,
  isDoubleWidthLabel = false,
}: FlowGroupsProps<T>) {
  const keys = React.useMemo(() => Object.keys(groups).sort(order), [groups, order]);

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        columnGap: `${gapX}px`,
        rowGap: `${gapY}px`,     // bigger for clearer line separation
        alignItems: "center",    // vertically center items within each row
      }}
    >
      {keys.map((k) => (
        <React.Fragment key={`grp-${k}`}>
          {/* label occupies EXACTLY one square to keep columns aligned */}
          <Box sx={{ width: isDoubleWidthLabel ? (size * 2) + gapX : size, height: size }}>
            {renderLabel(k, size)}
          </Box>
          {(groups[k] || []).map((item, i) => (
            <Box key={keyForItem(item, k, i)} sx={{ width: size, height: size }}>
              {renderItem(item, k, i, size)}
            </Box>
          ))}
        </React.Fragment>
      ))}
    </Box>
  );
}
