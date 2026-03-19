import React from 'react';
import { Box, Card, CardContent, Typography, Skeleton } from '@mui/material';
import { People, CheckCircle, Cancel } from '@mui/icons-material';

interface UserStatCardsProps {
  total: number;
  active: number;
  inactive: number;
  isLoading: boolean;
}

const cards = (total: number, active: number, inactive: number) => [
  { title: 'Total Users',    value: total,    icon: <People />,       color: '#3B82F6' },
  { title: 'Active Users',   value: active,   icon: <CheckCircle />,  color: '#10B981' },
  { title: 'Inactive Users', value: inactive, icon: <Cancel />,       color: '#EF4444' },
];

const UserStatCards: React.FC<UserStatCardsProps> = ({ total, active, inactive, isLoading }) => (
  <Box sx={{
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' },
    gap: 2.5,
    mb: 3,
  }}>
    {isLoading
      ? Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} sx={{ bgcolor: '#151C2C', borderRadius: 3, border: '1px solid rgba(255,255,255,0.06)' }}>
            <CardContent>
              <Skeleton variant="rectangular" height={90} sx={{ bgcolor: 'rgba(255,255,255,0.06)', borderRadius: 2 }} />
            </CardContent>
          </Card>
        ))
      : cards(total, active, inactive).map(({ title, value, icon, color }) => (
          <Card
            key={title}
            sx={{
              bgcolor: '#151C2C',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 3,
              boxShadow: `0 0 24px ${color}10, 0 4px 20px rgba(0,0,0,0.4)`,
              transition: 'all 0.25s ease',
              '&:hover': {
                borderColor: `${color}35`,
                boxShadow: `0 0 32px ${color}22, 0 8px 32px rgba(0,0,0,0.5)`,
                transform: 'translateY(-3px)',
              },
            }}
          >
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                <Typography sx={{ color: '#94A3B8', fontSize: 14, fontWeight: 500 }}>{title}</Typography>
                <Box sx={{
                  width: 44, height: 44, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  bgcolor: `${color}22`, color, fontSize: 22,
                  boxShadow: `0 0 14px ${color}30`,
                }}>
                  {icon}
                </Box>
              </Box>
              <Typography sx={{ color: '#F1F5F9', fontSize: 36, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.02em' }}>
                {value.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        ))
    }
  </Box>
);

export default UserStatCards;
