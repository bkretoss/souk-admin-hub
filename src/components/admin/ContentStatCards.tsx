import React from "react";
import { Box, Card, CardContent, Typography, Skeleton } from "@mui/material";
import { Article, CheckCircle, Cancel } from "@mui/icons-material";

interface ContentStatCardsProps {
  total: number;
  published: number;
  draft: number;
  isLoading: boolean;
}

const CARDS = (total: number, published: number, draft: number) => [
  { title: "Total Pages",     value: total,     icon: <Article />,      color: "#3B82F6" },
  { title: "Published Pages", value: published, icon: <CheckCircle />,  color: "#10B981" },
  { title: "Draft Pages",     value: draft,     icon: <Cancel />,       color: "#F59E0B" },
];

const ContentStatCards: React.FC<ContentStatCardsProps> = ({ total, published, draft, isLoading }) => (
  <Box sx={{
    display: "grid",
    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" },
    gap: 2.5,
    mb: 3,
  }}>
    {isLoading
      ? Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} sx={{ bgcolor: "#151C2C", borderRadius: 3, border: "1px solid rgba(255,255,255,0.06)" }}>
            <CardContent>
              <Skeleton variant="rectangular" height={90} sx={{ bgcolor: "rgba(255,255,255,0.06)", borderRadius: 2 }} />
            </CardContent>
          </Card>
        ))
      : CARDS(total, published, draft).map(({ title, value, icon, color }) => (
          <Card
            key={title}
            sx={{
              bgcolor: "#151C2C",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 3,
              boxShadow: `0 0 24px ${color}10, 0 4px 20px rgba(0,0,0,0.4)`,
              pointerEvents: "none",
              userSelect: "none",
            }}
          >
            <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
                <Typography sx={{ color: "#94A3B8", fontSize: 14, fontWeight: 500 }}>{title}</Typography>
                <Box sx={{
                  width: 44, height: 44, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  bgcolor: `${color}22`, color, fontSize: 22,
                  boxShadow: `0 0 14px ${color}30`,
                }}>
                  {icon}
                </Box>
              </Box>
              <Typography sx={{ color: "#F1F5F9", fontSize: 36, fontWeight: 700, lineHeight: 1, letterSpacing: "-0.02em" }}>
                {value.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        ))
    }
  </Box>
);

export default ContentStatCards;
