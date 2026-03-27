// src/components/page/PageSection.tsx
import * as React from "react";
import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";

const Root = styled(Box)({
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden", // page itself doesn't scroll
  minHeight: 0,
});

const Scroller = styled(Box)({
  flex: 1,
  minHeight: 0,       // crucial for nested flex scroll
  overflowY: "auto",
  overflowX: "hidden",
  scrollbarGutter: "stable both-edges",
});

const Content = styled(Box)(({ theme }) => ({
  marginLeft: "auto",
  marginRight: "auto",
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(2),
  maxWidth: 1200,
  width: "100%",
}));

export default function PageSection({ children }: { children: React.ReactNode }) {
  return (
    <Root>
      <Scroller>
        <Content>{children}</Content>
      </Scroller>
    </Root>
  );
}
