import React from 'react';
import { Box, Card, CardContent, Typography, Skeleton } from '@mui/material';
import { ShoppingCart, HourglassEmpty, CheckCircle, LocalShipping, Cancel } from '@mui/icons-material';

type StatusFilter = 'all' | 'pending' | 'delivered' | 'shipped' | 'cancelled';

interface OrderStatCardsProps {
  total: number;
  pending: number;
  completed: number;
  shipped: number;
  cancelled: number;
  isLoading: boolean;
}

const CARDS = (total: number, pending: number, completed: number, shipped: number, cancelled: number) => [
  { title: 'Total Orders', value: total,     icon: <ShoppingCart />,   color: '#3B82F6' },
  { title: 'Pending',      value: pending,   icon: <HourglassEmpty />, color: '#F59E0B' },
  { title: 'Shipped',      value: shipped,   icon: <LocalShipping />,  color: '#8B5CF6' },
  { title: 'Delivered',    value: completed, icon: <CheckCircle />,    color: '#10B981' },
  { title: 'Cancelled',    value: cancelled, icon: <Cancel />,         color: '#EF4444' },
];

const OrderStatCards: React.FC<OrderStatCardsProps> = ({
  total, pending, completed, shipped, cancelled, isLoading,
}) => (
  <Box sx={{
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(5, 1fr)' },
    gap: 2,
    mb: 3,
  }}>
    {isLoading
      ? Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} sx={{ bgcolor: '#151C2C', borderRadius: 3, border: '1px solid rgba(255,255,255,0.06)' }}>
            <CardContent>
              <Skeleton variant="rectangular" height={90} sx={{ bgcolor: 'rgba(255,255,255,0.06)', borderRadius: 2 }} />
            </CardContent>
          </Card>
        ))
      : CARDS(total, pending, completed, shipped, cancelled).map(({ title, value, icon, color }) => (
          <Card
            key={title}
            sx={{
              bgcolor: '#151C2C',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 3,
              boxShadow: `0 0 24px ${color}10, 0 4px 20px rgba(0,0,0,0.4)`,
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                <Typography sx={{ color: '#94A3B8', fontSize: 13, fontWeight: 500 }}>{title}</Typography>
                <Box sx={{
                  width: 38, height: 38, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  bgcolor: `${color}22`, color, fontSize: 20,
                  boxShadow: `0 0 12px ${color}30`,
                }}>
                  {icon}
                </Box>
              </Box>
              <Typography sx={{ color: '#F1F5F9', fontSize: 32, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.02em' }}>
                {value.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        ))
    }
  </Box>
);

export default OrderStatCards;
