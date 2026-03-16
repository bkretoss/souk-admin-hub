import React from 'react';
import { Card, CardContent, Box, Typography } from '@mui/material';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color?: string;
  glowColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title, value, icon,
  color = '#7C3AED',
  glowColor,
}) => {
  const glow = glowColor || color;

  return (
    <Card sx={{
      bgcolor: '#12121A',
      border: `1px solid ${glow}20`,
      borderRadius: 4,
      boxShadow: `0 0 20px ${glow}12, 0 4px 24px rgba(0,0,0,0.4)`,
      transition: 'all 0.3s ease',
      '&:hover': {
        borderColor: `${glow}40`,
        boxShadow: `0 0 30px ${glow}20, 0 8px 32px rgba(0,0,0,0.5)`,
        transform: 'translateY(-2px)',
      },
    }}>
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography sx={{
              color: '#94A3B8', fontSize: 13, fontWeight: 500, mb: 1.5,
              letterSpacing: '0.01em',
            }}>
              {title}
            </Typography>
            <Typography sx={{
              color: '#F1F5F9', fontSize: 32, fontWeight: 700,
              lineHeight: 1, letterSpacing: '-0.02em',
            }}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Typography>
          </Box>
          <Box sx={{
            width: 48, height: 48, borderRadius: 3,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: `${color}18`,
            color: color,
            boxShadow: `0 0 16px ${glow}20`,
          }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;
