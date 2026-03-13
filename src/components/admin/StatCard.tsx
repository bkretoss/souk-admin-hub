import React from 'react';
import { Card, CardContent, Box, Typography } from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, color = '#3B82F6' }) => {
  const isPositive = (change ?? 0) >= 0;

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" sx={{ color: '#94A3B8', fontSize: 13, fontWeight: 500, mb: 1 }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ color: '#F8FAFC', fontSize: 28, fontWeight: 700, mb: 1 }}>
              {value}
            </Typography>
            {change !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {isPositive ? (
                  <TrendingUp sx={{ fontSize: 16, color: '#10B981' }} />
                ) : (
                  <TrendingDown sx={{ fontSize: 16, color: '#EF4444' }} />
                )}
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: isPositive ? '#10B981' : '#EF4444' }}>
                  {isPositive ? '+' : ''}{change}%
                </Typography>
                <Typography sx={{ fontSize: 12, color: '#64748B', ml: 0.5 }}>vs last month</Typography>
              </Box>
            )}
          </Box>
          <Box sx={{
            width: 48, height: 48, borderRadius: 3,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            bgcolor: `${color}15`, color: color,
          }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;
