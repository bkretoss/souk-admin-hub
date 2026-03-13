import React from 'react';
import { Box, Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Skeleton } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { People, ShoppingBag, ShoppingCart, Category } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import StatCard from '@/components/admin/StatCard';
import { dashboardApi } from '@/lib/api';

const DashboardPage: React.FC = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardApi.getStats,
  });

  const { data: recentOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['recent-orders'],
    queryFn: dashboardApi.getRecentOrders,
  });

  const statusColor: Record<string, 'warning' | 'info' | 'success' | 'error'> = {
    pending: 'warning', processing: 'info', completed: 'success', cancelled: 'error',
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ color: '#F8FAFC', mb: 0.5 }}>Dashboard</Typography>
        <Typography variant="body2" sx={{ color: '#64748B' }}>Welcome back! Here's your overview.</Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={i}>
              <Card><CardContent><Skeleton variant="rectangular" height={80} /></CardContent></Card>
            </Grid>
          ))
        ) : (
          <>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard title="Total Users" value={stats?.totalUsers ?? 0} change={12.5} icon={<People />} color="#3B82F6" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard title="Total Products" value={stats?.totalProducts ?? 0} change={8.2} icon={<ShoppingBag />} color="#10B981" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard title="Total Orders" value={stats?.totalOrders ?? 0} change={-3.1} icon={<ShoppingCart />} color="#F59E0B" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <StatCard title="Categories" value={stats?.totalCategories ?? 0} change={5.0} icon={<Category />} color="#8B5CF6" />
            </Grid>
          </>
        )}
      </Grid>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid rgba(148,163,184,0.08)' }}>
            <Typography variant="h6" sx={{ fontSize: 16 }}>Recent Orders</Typography>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ordersLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <TableCell key={j}><Skeleton /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : recentOrders && recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <TableRow key={order.id} sx={{ '&:hover': { bgcolor: 'rgba(148,163,184,0.04)' } }}>
                      <TableCell sx={{ color: '#F8FAFC', fontFamily: 'monospace', fontSize: 13 }}>
                        {order.id.slice(0, 8)}…
                      </TableCell>
                      <TableCell sx={{ color: '#F8FAFC' }}>
                        {(order as any).products?.title ?? 'N/A'}
                      </TableCell>
                      <TableCell sx={{ color: '#F8FAFC' }}>
                        ${(order as any).products?.price?.toFixed(2) ?? '0.00'}
                      </TableCell>
                      <TableCell>
                        <Chip label={order.status} size="small" color={statusColor[order.status] ?? 'default'} />
                      </TableCell>
                      <TableCell sx={{ color: '#94A3B8', fontSize: 13 }}>
                        {new Date(order.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: 'center', py: 6, color: '#64748B' }}>
                      No orders yet
                    </TableCell>
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
