import React from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Skeleton, Avatar,
  LinearProgress, Link as MuiLink,
} from '@mui/material';
import {
  People, CardMembership, EmojiEvents, TimerOff, LocalOffer,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import StatCard from '@/components/admin/StatCard';
import { dashboardApi } from '@/lib/api';

// Mock recent users for the UI (no API change)
const recentUsers = [
  { initials: 'SC', name: 'Sarah Chen', email: 'sarah@email.com', challenge: '100 Days of Code', day: 67, progress: 67, color: '#3B82F6' },
  { initials: 'MJ', name: 'Marcus Johnson', email: 'marcus@email.com', challenge: '100 Days of Fitness', day: 34, progress: 34, color: '#3B82F6' },
  { initials: 'ED', name: 'Emily Davis', email: 'emily@email.com', challenge: '100 Days of Reading', day: 89, progress: 89, color: '#7C3AED' },
  { initials: 'AR', name: 'Alex Rivera', email: 'alex@email.com', challenge: '100 Days of Meditation', day: 12, progress: 12, color: '#3B82F6' },
  { initials: 'JL', name: 'Jordan Lee', email: 'jordan@email.com', challenge: '100 Days of Writing', day: 100, progress: 100, color: '#7C3AED' },
];

const DashboardPage: React.FC = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardApi.getStats,
  });

  const statCards = [
    { title: 'Total Users', value: stats?.totalUsers ?? 0, icon: <People />, color: '#F97316', glowColor: '#F97316' },
    { title: 'Active Subscriptions', value: stats?.totalProducts ?? 0, icon: <CardMembership />, color: '#06B6D4', glowColor: '#06B6D4' },
    { title: 'Completed Challenges', value: stats?.totalOrders ?? 0, icon: <EmojiEvents />, color: '#10B981', glowColor: '#10B981' },
    { title: 'Expired Subscriptions', value: stats?.totalCategories ?? 0, icon: <TimerOff />, color: '#EAB308', glowColor: '#EAB308' },
    { title: 'Coupon Codes', value: 4, icon: <LocalOffer />, color: '#EC4899', glowColor: '#EC4899' },
  ];

  return (
    <Box>
      {/* Stats */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' },
        gap: 2.5, mb: 4,
      }}>
        {statsLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}><CardContent><Skeleton variant="rectangular" height={80} /></CardContent></Card>
            ))
          : statCards.map((s) => (
              <StatCard key={s.title} {...s} />
            ))
        }
      </Box>

      {/* Recent Users */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ color: '#F1F5F9', fontWeight: 700, fontSize: 18 }}>
          Recent Users
        </Typography>
        <MuiLink
          href="#"
          underline="none"
          sx={{
            fontSize: 13, fontWeight: 500, color: '#7C3AED',
            display: 'flex', alignItems: 'center', gap: 0.5,
            '&:hover': { color: '#A78BFA' },
          }}
        >
          View all →
        </MuiLink>
      </Box>

      <Card sx={{
        bgcolor: '#12121A',
        border: '1px solid rgba(124, 58, 237, 0.08)',
        borderRadius: 4,
      }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#64748B', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>User</TableCell>
                  <TableCell sx={{ color: '#64748B', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Challenge</TableCell>
                  <TableCell sx={{ color: '#64748B', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Progress</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentUsers.map((u) => (
                  <TableRow
                    key={u.email}
                    sx={{
                      '&:hover': { bgcolor: 'rgba(124, 58, 237, 0.04)' },
                      '&:last-child td': { borderBottom: 0 },
                      transition: 'background 0.2s',
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{
                          width: 38, height: 38,
                          bgcolor: 'rgba(124, 58, 237, 0.15)',
                          color: '#A78BFA',
                          fontSize: 13, fontWeight: 600,
                          border: '1px solid rgba(124, 58, 237, 0.2)',
                        }}>
                          {u.initials}
                        </Avatar>
                        <Box>
                          <Typography sx={{ color: '#F1F5F9', fontSize: 14, fontWeight: 500 }}>
                            {u.name}
                          </Typography>
                          <Typography sx={{ color: '#64748B', fontSize: 12 }}>
                            {u.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: '#CBD5E1', fontSize: 14 }}>
                      {u.challenge}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 200 }}>
                        <Typography sx={{ color: '#94A3B8', fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap' }}>
                          DAY {u.day}
                        </Typography>
                        <Box sx={{ flex: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={u.progress}
                            sx={{
                              height: 6, borderRadius: 3,
                              bgcolor: 'rgba(124, 58, 237, 0.1)',
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 3,
                                background: u.progress >= 80
                                  ? 'linear-gradient(90deg, #7C3AED, #A78BFA)'
                                  : 'linear-gradient(90deg, #3B82F6, #60A5FA)',
                              },
                            }}
                          />
                        </Box>
                        <Typography sx={{
                          color: u.progress >= 80 ? '#A78BFA' : '#60A5FA',
                          fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
                        }}>
                          {u.progress}%
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DashboardPage;
