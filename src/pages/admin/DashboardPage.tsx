import React from 'react';
import {
  Box, Card, CardContent, Skeleton, Typography,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip,
} from '@mui/material';
import { People, Inventory2, Category, ShoppingCart } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import StatCard from '@/components/admin/StatCard';
import { getDashboardStats, getRecentOrders } from '@/lib/api/dashboardApi';

const DashboardPage: React.FC = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
  });

  const { data: recentOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['recent-orders'],
    queryFn: getRecentOrders,
  });

  const statCards = [
    { title: 'Total Users', value: stats?.totalUsers ?? 0, icon: <People />, color: '#3B82F6', glowColor: '#3B82F6', change: 12.5 },
    { title: 'Total Products', value: stats?.totalProducts ?? 0, icon: <Inventory2 />, color: '#10B981', glowColor: '#10B981', change: 8.2 },
    { title: 'Total Orders', value: stats?.totalOrders ?? 0, icon: <ShoppingCart />, color: '#F59E0B', glowColor: '#F59E0B', change: -3.1 },
    { title: 'Categories', value: stats?.totalCategories ?? 0, icon: <Category />, color: '#7C3AED', glowColor: '#7C3AED', change: 5 },
  ];

  const statusColor: Record<string, string> = {
    pending: '#EAB308', completed: '#10B981', cancelled: '#EF4444', processing: '#3B82F6',
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ color: '#F1F5F9', fontWeight: 700, mb: 0.5 }}>Dashboard</Typography>
        <Typography sx={{ color: '#64748B', fontSize: 14 }}>Welcome back! Here's your overview.</Typography>
      </Box>

      {/* Stats */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
        gap: 2.5, mb: 4,
      }}>
        {statsLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} sx={{ bgcolor: '#151C2C', borderRadius: 3 }}>
                <CardContent><Skeleton variant="rectangular" height={110} sx={{ bgcolor: 'rgba(255,255,255,0.06)', borderRadius: 2 }} /></CardContent>
              </Card>
            ))
          : statCards.map((s) => <StatCard key={s.title} {...s} />)
        }
      </Box>

      {/* Recent Orders */}
      <Card sx={{ bgcolor: '#151C2C', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <Typography sx={{ color: '#F1F5F9', fontWeight: 700, fontSize: 16 }}>Recent Orders</Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {['Order ID', 'Product', 'Price', 'Status', 'Date'].map((h) => (
                    <TableCell key={h} sx={{ color: '#64748B', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', borderColor: 'rgba(255,255,255,0.06)' }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {ordersLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <TableCell key={j} sx={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                          <Skeleton sx={{ bgcolor: 'rgba(255,255,255,0.06)' }} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : recentOrders && recentOrders.length > 0 ? (
                  recentOrders.map((order: any) => (
                    <TableRow key={order.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' }, '&:last-child td': { borderBottom: 0 } }}>
                      <TableCell sx={{ color: '#94A3B8', fontSize: 13, borderColor: 'rgba(255,255,255,0.06)', fontFamily: 'monospace' }}>
                        #{order.id.slice(0, 8)}
                      </TableCell>
                      <TableCell sx={{ color: '#F1F5F9', fontSize: 13, borderColor: 'rgba(255,255,255,0.06)' }}>
                        {order.products?.title ?? '—'}
                      </TableCell>
                      <TableCell sx={{ color: '#F1F5F9', fontSize: 13, borderColor: 'rgba(255,255,255,0.06)' }}>
                        ${order.products?.price ?? order.total_amount ?? '—'}
                      </TableCell>
                      <TableCell sx={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                        <Chip
                          label={order.status}
                          size="small"
                          sx={{
                            bgcolor: `${statusColor[order.status] ?? '#64748B'}22`,
                            color: statusColor[order.status] ?? '#64748B',
                            fontWeight: 600, fontSize: 12, textTransform: 'capitalize',
                            border: `1px solid ${statusColor[order.status] ?? '#64748B'}44`,
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#64748B', fontSize: 13, borderColor: 'rgba(255,255,255,0.06)' }}>
                        {new Date(order.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: 'center', py: 6, color: '#64748B', borderBottom: 0 }}>No orders yet</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DashboardPage;
