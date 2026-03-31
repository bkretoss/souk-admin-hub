import React from 'react';
import {
  Box, Card, CardContent, Skeleton, Typography,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Alert,
} from '@mui/material';
import { People, Inventory2, Category, ShoppingCart } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import StatCard from '@/components/admin/StatCard';
import { getDashboardStats, getRecentOrders } from '@/lib/api/dashboardApi';
import { formatDate } from '@/lib/dateUtils';

const statusColor: Record<string, string> = {
  pending: '#EAB308', completed: '#10B981', cancelled: '#EF4444',
  processing: '#3B82F6', shipped: '#8B5CF6',
};

const DashboardPage: React.FC = () => {
  const {
    data: stats, isLoading: statsLoading, isError: statsError,
  } = useQuery({ queryKey: ['dashboard-stats'], queryFn: getDashboardStats });

  const {
    data: recentOrders, isLoading: ordersLoading, isError: ordersError,
  } = useQuery({ queryKey: ['recent-orders'], queryFn: getRecentOrders });

  const statCards = [
    { title: 'Total Users', value: stats?.totalUsers ?? 0, icon: <People />, color: '#3B82F6', glowColor: '#3B82F6' },
    { title: 'Total Products', value: stats?.totalProducts ?? 0, icon: <Inventory2 />, color: '#10B981', glowColor: '#10B981' },
    { title: 'Total Orders', value: stats?.totalOrders ?? 0, icon: <ShoppingCart />, color: '#F59E0B', glowColor: '#F59E0B' },
    { title: 'Total Categories', value: stats?.totalCategories ?? 0, icon: <Category />, color: '#7C3AED', glowColor: '#7C3AED' },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ color: '#F1F5F9', fontWeight: 700, mb: 0.5 }}>Dashboard</Typography>
        <Typography sx={{ color: '#64748B', fontSize: 14 }}>Welcome back! Here's your overview.</Typography>
      </Box>

      {/* Stats */}
      {statsError ? (
        <Alert severity="error" sx={{ mb: 3 }}>Failed to load summary stats. Please try again.</Alert>
      ) : (
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
      )}

      {/* Recent Orders */}
      <Card sx={{ bgcolor: '#151C2C', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <Typography sx={{ color: '#F1F5F9', fontWeight: 700, fontSize: 16 }}>Recent Orders</Typography>
            <Typography sx={{ color: '#64748B', fontSize: 12, mt: 0.5 }}>Latest 10 orders</Typography>
          </Box>

          {ordersError ? (
            <Box sx={{ px: 3, py: 4 }}>
              <Alert severity="error">Failed to load recent orders. Please try again.</Alert>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    {['Order ID', 'Customer Name', 'Date', 'Status', 'Total Amount'].map((h) => (
                      <TableCell key={h} sx={{ color: '#64748B', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', borderColor: 'rgba(255,255,255,0.06)' }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {ordersLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 5 }).map((_, j) => (
                          <TableCell key={j} sx={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                            <Skeleton sx={{ bgcolor: 'rgba(255,255,255,0.06)' }} />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : recentOrders && recentOrders.length > 0 ? (
                    recentOrders.map((order: any) => {
                      const customerName = order.buyer
                        ? `${order.buyer.first_name ?? ''} ${order.buyer.last_name ?? ''}`.trim() || order.buyer.email || '—'
                        : '—';
                      const total = ((order.product?.price ?? 0) + (order.delivery_price ?? 0)).toFixed(2);
                      return (
                        <TableRow key={order.id} sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' }, '&:last-child td': { borderBottom: 0 } }}>
                          <TableCell sx={{ color: '#94A3B8', fontSize: 13, borderColor: 'rgba(255,255,255,0.06)', fontFamily: 'monospace' }}>
                            #{order.id.slice(0, 8)}
                          </TableCell>
                          <TableCell sx={{ color: '#F1F5F9', fontSize: 13, borderColor: 'rgba(255,255,255,0.06)' }}>
                            {customerName}
                          </TableCell>
                          <TableCell sx={{ color: '#64748B', fontSize: 13, borderColor: 'rgba(255,255,255,0.06)' }}>
                            {formatDate(order.created_at)}
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
                          <TableCell sx={{ color: '#34D399', fontSize: 13, fontWeight: 600, borderColor: 'rgba(255,255,255,0.06)' }}>
                            ${total}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ textAlign: 'center', py: 6, color: '#64748B', borderBottom: 0 }}>No orders yet</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default DashboardPage;
