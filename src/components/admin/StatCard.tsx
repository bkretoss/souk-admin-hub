import React from "react";
import { Card, CardContent, Box, Typography } from "@mui/material";
import { TrendingUp } from "@mui/icons-material";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color?: string;
  glowColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, change, color = "#7C3AED", glowColor }) => {
  const glow = glowColor || color;
  const isPositive = change === undefined || change >= 0;

  return (
    <Card
      sx={{
        bgcolor: "#151C2C",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 3,
        boxShadow: `0 0 24px ${glow}10, 0 4px 20px rgba(0,0,0,0.4)`,
        transition: "all 0.25s ease",
        "&:hover": {
          borderColor: `${glow}35`,
          boxShadow: `0 0 32px ${glow}22, 0 8px 32px rgba(0,0,0,0.5)`,
          transform: "translateY(-3px)",
        },
      }}
    >
      <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
        {/* Title + Icon row */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
          <Typography sx={{ color: "#94A3B8", fontSize: 14, fontWeight: 500 }}>{title}</Typography>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: `${color}22`,
              color: color,
              fontSize: 22,
              boxShadow: `0 0 14px ${glow}30`,
            }}
          >
            {icon}
          </Box>
        </Box>

        {/* Large number */}
        <Typography
          sx={{
            color: "#F1F5F9",
            fontSize: 36,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: "-0.02em",
            mb: 1.5,
          }}
        >
          {typeof value === "number" ? value.toLocaleString() : value}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default StatCard;
