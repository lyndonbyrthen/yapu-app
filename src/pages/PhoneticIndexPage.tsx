import * as React from "react";
import {
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Chip,
} from "@mui/material";
import PageSection from "@src/components/page/PageSection";
import FlowGroups from "@src/components/flow/FlowGroups";
import RefCharButton from "@src/components/char/RefCharButton";
import RefCharLabel from "@src/components/char/RefCharLabel";
import { useAppStore } from "@src/store/provider";
import { useRouteStore } from "@src/store/routeState";

// === Reuse helpers & types (adjust paths/names to match your files) ===
import type { QSystem, OrderMode } from "@lib/phoneticTypes"; // if you have these
import {
  // tone/normalization
  stripTone,                          // (s: string) => string
  normalizeUmlautU,                   // (s: string) => string   // optional
  // universes
  getHomophonesUniverse,              // (storeSlice, system) => string[] tone-stripped syllables
  // inventory (returns zhuyin/latin inventories for categories)
  getInventoryForSystem,              // (system) => { SHENGMU, JIEMU, YUNMU, FUYUN }
  // ordering helpers
  BPMF_HEAD,                          // string[]    ㄅ ㄆ ㄇ ... ㄬ ㄧ ㄨ ㄩ
  headKeyFor,                         // (syll: string, system: QSystem, mode: OrderMode) => string
  compareBpmf,                        // (a,b,system) => number
  compareAlpha,                       // (a,b) => number
} from "@lib/phonetics/phoneticUtils";

// Fallback TS types if not present in your phoneticTypes.ts
// (Delete if you already have them.)
type _QSystem = "yayin" | "laoguoyin" | "zhuyin";
type _OrderMode = "alpha" | "bpmf";
type UseQSystem = QSystem extends string ? QSystem : _QSystem;
type UseOrderMode = OrderMode extends string ? OrderMode : _OrderMode;

function useSyllableUniverse(system: UseQSystem) {
  // Reuse your store shape and a single helper to extract/normalize the universe of syllables.
  // getHomophonesUniverse should:
  //  - read the store’s homophones map for `system`
  //  - return a unique array of tone-stripped base syllables
  const homophonesBySystem = useAppStore((s: any) => s.homophonesBySystem ?? s.homophones);
  return React.useMemo(
    () => getHomophonesUniverse?.(homophonesBySystem, system) ?? [],
    [homophonesBySystem, system]
  );
}

// Narrow to entries that actually exist in the selected system’s universe
function filterInventory(
  universe: string[],
  inventory: string[],
  kind: "prefix" | "suffix" | "exact"
) {
  if (!universe?.length) return [];
  const u = new Set(universe);
  const out: string[] = [];
  for (const item of inventory) {
    const base = normalizeUmlautU ? normalizeUmlautU(stripTone(item)) : stripTone(item);
    let hit = false;
    if (kind === "exact") {
      hit = u.has(base);
    } else if (kind === "prefix") {
      hit = universe.some((syll) => syll.startsWith(base));
    } else {
      hit = universe.some((syll) => syll.endsWith(base));
    }
    if (hit) out.push(item);
  }
  return out;
}

export default function PhoneticIndexPage() {
  const [system, setSystem] = React.useState<UseQSystem>("zhuyin");
  const [order, setOrder] = React.useState<UseOrderMode>("bpmf");
  const setPath = useRouteStore((s) => s.setPath);

  const universe = useSyllableUniverse(system);
  const INV = React.useMemo(() => getInventoryForSystem(system), [system]);

  // Categories (reuse inventories; only render items that exist)
  const SHENGMU = React.useMemo(
    () => filterInventory(universe, INV.SHENGMU, "prefix"),
    [universe, INV]
  );
  const JIEMU = React.useMemo(
    () => filterInventory(universe, INV.JIEMU, "prefix"),
    [universe, INV]
  );
  const YUNMU = React.useMemo(
    () => filterInventory(universe, INV.YUNMU, "suffix"),
    [universe, INV]
  );
  const FUYUN = React.useMemo(
    () => filterInventory(universe, INV.FUYUN, "prefix"),
    [universe, INV]
  );

  const groups = React.useMemo(
    () => ({
      "聲母": SHENGMU,
      "介母": JIEMU,
      "韻母": YUNMU,
      "其他複韻": FUYUN,
    }),
    [SHENGMU, JIEMU, YUNMU, FUYUN]
  );

  // fixed label order
  const groupLabelOrder = ["聲母", "介母", "韻母", "其他複韻"];
  const orderGroups = (a: string, b: string) =>
    groupLabelOrder.indexOf(a) - groupLabelOrder.indexOf(b);

  // Per-item sorting — defer to helpers
  const orderItemsInGroup = React.useCallback(
    (a: string, b: string) => {
      if (order === "bpmf") {
        const byBpmf = typeof compareBpmf === "function" ? compareBpmf(a, b, system) : 0;
        if (byBpmf) return byBpmf;
        // fallback head comparison if needed
        const ha = headKeyFor(a, system, order);
        const hb = headKeyFor(b, system, order);
        const ia = BPMF_HEAD.indexOf(ha);
        const ib = BPMF_HEAD.indexOf(hb);
        if (ia !== ib) return ia - ib;
      } else {
        const byAlpha = typeof compareAlpha === "function" ? compareAlpha(a, b) : 0;
        if (byAlpha) return byAlpha;
      }
      return a.localeCompare(b);
    },
    [order, system]
  );

  const handleClick = React.useCallback(
    (syllable: string) => {
      // reuse your existing homophones route scheme
      setPath(`/homophones?type=${system}&q=${encodeURIComponent(syllable)}`);
    },
    [setPath, system]
  );

  const SYSTEM_LABEL: Record<UseQSystem, string> = {
    yayin: "雅音",
    laoguoyin: "老國音",
    zhuyin: "注音",
  };
  const ORDER_LABEL: Record<UseOrderMode, string> = {
    alpha: "A–Z",
    bpmf: "ㄅㄆㄇㄈ",
  };

  return (
    <PageSection>
      {/* Title/intro — follows RadicalsPage visual language */}
      <Typography variant="h6" fontFamily={"UIGlyphs"} gutterBottom>
        音韻索引
      </Typography>
      <Typography variant="body2" color="text.secondary" fontFamily={"UIGlyphs"} gutterBottom>
        依聲母／介母／韻母與常見複韻列舉（僅顯示實際收錄之音節）
      </Typography>

      <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap", mt: 0.5 }}>
        <ToggleButtonGroup size="small" exclusive value={system} onChange={(_, v) => v && setSystem(v)}>
          <ToggleButton value="yayin">雅音</ToggleButton>
          <ToggleButton value="laoguoyin">老國音</ToggleButton>
          <ToggleButton value="zhuyin">注音</ToggleButton>
        </ToggleButtonGroup>

        <ToggleButtonGroup size="small" exclusive value={order} onChange={(_, v) => v && setOrder(v)}>
          <ToggleButton value="alpha">A–Z</ToggleButton>
          <ToggleButton value="bpmf">ㄅㄆㄇㄈ</ToggleButton>
        </ToggleButtonGroup>

        <Chip
          size="small"
          variant="outlined"
          label={`系統：${SYSTEM_LABEL[system]}　排列：${ORDER_LABEL[order]}`}
        />
      </Box>

      <Divider sx={{ my: 1.5 }} />

      <FlowGroups
        groups={groups}
        order={(a, b) => orderGroups(a as string, b as string)}
        size={60}
        gapX={14}
        gapY={26}
        renderLabel={(label) => <RefCharLabel label={label} size={60} />}
        renderItem={(syllable) => (
          <RefCharButton label={String(syllable)} size={60} onClick={() => handleClick(String(syllable))} />
        )}
        keyForItem={(syllable, k) => `syll-${k}-${String(syllable)}`}
        orderItemsInGroup={orderItemsInGroup as any}
      />
    </PageSection>
  );
}
