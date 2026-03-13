import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Select, MenuItem, Skeleton, TextField, InputAdornment,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '@/lib/api';
import { toast } from 'sonner';

const statuses = ['pending', 'processing', 'shipped', 'completed', 'cancelled'];
const statusColor: Record<string, 'warning' | 'info' | 'primary' | 'success' | 'error'> = {
  pending: 'warning', processing: 'info', shipped: 'primary', completed: 'success', cancelled: 'error',
};

const OrdersPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data: orders, isLoading } = useQuery({ queryKey: ['orders'], queryFn: ordersApi.getAll });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => ordersApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order status updated');
    },
  });

  const filtered = orders?.filter((o) =>
    `${o.id} ${o.status}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ color: '#F8FAFC', mb: 0.5 }}>Orders</Typography>
        <Typography variant="body2" sx={{ color: '#64748B' }}>Track and manage orders</Typography>
      </Box>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ px: 3, py: 2, borderBottom: '1px solid rgba(148,163,184,0.08)' }}>
            <TextField size="small" placeholder="Search orders…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ color: '#64748B', fontSize: 20 }} /></InputAdornment> }}
              sx={{ width: 320 }}
            />
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>Delivery</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>{Array.from({ length: 5 }).map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}</TableRow>
                  ))
                ) : filtered && filtered.length > 0 ? (
                  filtered.map((order) => (
                    <TableRow key={order.id} sx={{ '&:hover': { bgcolor: 'rgba(148,163,184,0.04)' } }}>
                      <TableCell sx={{ color: '#F8FAFC', fontFamily: 'monospace', fontSize: 13 }}>{order.id.slice(0, 8)}…</TableCell>
                      <TableCell sx={{ color: '#F8FAFC' }}>{(order as any).products?.title ?? 'N/A'}</TableCell>
                      <TableCell>
                        <Chip label={order.delivery_type} size="small" sx={{ bgcolor: 'rgba(148,163,184,0.1)', color: '#94A3B8' }} />
                      </TableCell>
                      <TableCell>
                        <Select
                          size="small" value={order.status}
                          onChange={(e) => updateStatus.mutate({ id: order.id, status: e.target.value })}
                          sx={{ fontSize: 13, minWidth: 130, '& .MuiSelect-select': { py: 0.75 } }}
                        >
                          {statuses.map((s) => (
                            <MenuItem key={s} value={s} sx={{ fontSize: 13 }}>{s.charAt(0).toUpperCase() + s.slice(1)}</MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                      <TableCell sx={{ color: '#94A3B8', fontSize: 13 }}>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: 'center', py: 6, color: '#64748B' }}>No orders found</TableCell>
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

export default OrdersPage;
