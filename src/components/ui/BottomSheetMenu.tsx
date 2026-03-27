// src/components/ui/BottomSheetMenu.tsx
import React, { useState } from "react";
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import HomeIcon from "@mui/icons-material/Home";
import SettingsIcon from "@mui/icons-material/Settings";
import InfoIcon from "@mui/icons-material/Info";
import HomeRepairServiceOutlinedIcon from '@mui/icons-material/HomeRepairServiceOutlined';
import CategoryIcon from "@mui/icons-material/Category";
import TranslateIcon from "@mui/icons-material/Translate";
import SubtitlesIcon from "@mui/icons-material/Subtitles";

import { useMenuLink } from "@src/hooks/linkHooks";

type MenuEntry = {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  href?: string;
};

export interface BottomSheetMenuProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  tabSize?: number;          // size of launcher square
  maxHeight?: string;        // cap height, default 40vh
  launcherLeftPx?: number | null; // set to a number to offset from left; null = centered
}

const BottomSheetMenu: React.FC<BottomSheetMenuProps> = ({
  open: controlledOpen,
  onOpenChange,
  tabSize = 44,
  maxHeight = "40vh",
  launcherLeftPx = null,
}) => {
  const theme = useTheme();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;

  const setOpen = (v: boolean) => (onOpenChange ? onOpenChange(v) : setUncontrolledOpen(v));
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const goToPage = useMenuLink();

  // Edit your menu items here
  const items: MenuEntry[] = [
    { label: "部首索引", onClick: () => goToPage("radicals") },
    { label: "音節索引", onClick: () => goToPage("syllabary") },
    { label: "標音工具", onClick: () => goToPage("rubytool") },
  ];

  const Launcher = () => (
    <Box
      onClick={handleOpen}
      role="button"
      aria-label="Open menu"
      sx={{
        width: tabSize,
        height: tabSize,
        borderRadius: 1,
        bgcolor: "background.paper",
        color: "text.primary",
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: 4,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      }}
    >
      <IconButton
        size="small"
        disableRipple
        disableFocusRipple
        sx={{ width: "100%", height: "100%", "&:hover": { backgroundColor: "transparent" } }}
      >
        <MenuIcon />
      </IconButton>
    </Box>
  );

  return (
    <>
      {/* Closed-state launcher. Hidden when drawer is open. */}
      {!open && (
        <Box
          sx={{
            position: "fixed",
            zIndex: theme.zIndex.drawer + 2,
            bottom: 8,
            left: launcherLeftPx === null ? "50%" : launcherLeftPx,
            transform: launcherLeftPx === null ? "translateX(-50%)" : "none",
          }}
        >
          <Launcher />
        </Box>
      )}

      <Drawer
        anchor="bottom"
        open={open}
        onClose={handleClose}
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: {
            // ✅ keep it docked to bottom
            top: "auto",
            bottom: 0,
            height: maxHeight,
            maxHeight: maxHeight,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            overflow: "hidden",
            // ❌ DO NOT set `position: 'relative'` here — it breaks bottom anchoring
          },
        }}
      >
        {/* Header with X close button */}
        <Box
          sx={{
            position: "relative",
            height: 48,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <IconButton
            aria-label="Close menu"
            onClick={handleClose}
            sx={{ position: "absolute", top: 4, right: 4 }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Scrollable content */}
        <Box sx={{ height: `calc(100% - 48px)`, overflowY: "auto", px: 2, pb: 2 }}>
          <List disablePadding>
            {items.map((item, i) => (
              <ListItem key={`${item.label}-${i}`} disablePadding>
                <ListItemButton
                  component={item.href ? "a" : "button"}
                  href={item.href}
                  onClick={() => {
                    item.onClick?.();
                    handleClose();
                  }}
                >
                  {item.icon ? <ListItemIcon>{item.icon}</ListItemIcon> : null}
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default BottomSheetMenu;
