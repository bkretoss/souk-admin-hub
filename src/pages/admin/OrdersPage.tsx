import React, { useState, useMemo } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Skeleton, TablePagination,
  TextField, Select, MenuItem, InputAdornment, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
} from '@mui/material';
import { Search, Visibility, Delete, Close } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrders, updateOrder, deleteOrder } from '@/lib/api/ordersApi';
import { toast } from 'sonner';
import { formatDate } from '@/lib/dateUtils';

const statusColor: Record<string, 'warning' | 'info' | 'primary' | 'success' | 'error'> = {
  pending: 'warning', processing: 'info', shipped: 'primary', completed: 'success', cancelled: 'error',
};

const OrdersPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewOrder, setViewOrder] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateOrder(id, { status }),
    onMutate: ({ id }) => setUpdatingId(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order status updated successfully');
    },
    onError: () => toast.error('Failed to update order status'),
    onSettled: () => setUpdatingId(null),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setDeleteId(null);
      toast.success('Order deleted successfully');
    },
    onError: () => toast.error('Failed to delete order'),
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (orders ?? []).filter((o: any) => {
      const matchSearch = !q || o.product?.name?.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  const paginated = useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage],
  );

  const selectSx = {
    color: '#F1F5F9',
    bgcolor: 'rgba(255,255,255,0.05)',
    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.15)' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#7C3AED' },
    '& .MuiSvgIcon-root': { color: '#94A3B8' },
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ color: '#F8FAFC', mb: 0.5 }}>Orders</Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            Manage orders · {orders?.length ?? 0} total
          </Typography>
        </Box>
      </Box>

      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <TextField
          size="small"
          placeholder="Search by product name…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: '#94A3B8', fontSize: 18 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            width: '25%',
            '& .MuiOutlinedInput-root': {
              color: '#F1F5F9',
              bgcolor: 'rgba(255,255,255,0.05)',
              '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
              '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
              '&.Mui-focused fieldset': { borderColor: '#7C3AED' },
            },
            '& input::placeholder': { color: '#64748B', opacity: 1 },
          }}
        />
        <Select
          size="small"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
          sx={{ width: 160, ...selectSx }}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="completed">Completed</MenuItem>
          <MenuItem value="shipped">Shipped</MenuItem>
          <MenuItem value="cancelled">Cancelled</MenuItem>
        </Select>
      </Box>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Delivery Type</TableCell>
                  <TableCell>Created Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <TableCell key={j}><Skeleton variant="text" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : paginated.length > 0 ? (
                  paginated.map((order: any) => (
                    <TableRow key={order.id} sx={{ '&:hover': { bgcolor: 'rgba(148,163,184,0.04)' } }}>
                      <TableCell sx={{ color: '#F8FAFC', fontSize: 13 }}>{order.product?.name ?? '—'}</TableCell>
                      <TableCell>
                        <Select
                          size="small"
                          value={order.status}
                          disabled={updatingId === order.id}
                          onChange={(e) => statusMutation.mutate({ id: order.id, status: e.target.value })}
                          sx={{ fontSize: 13, minWidth: 130, ...selectSx }}
                        >
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="completed">Completed</MenuItem>
                          <MenuItem value="shipped">Shipped</MenuItem>
                          <MenuItem value="cancelled">Cancelled</MenuItem>
                        </Select>
                      </TableCell>
                      <TableCell sx={{ color: '#94A3B8', fontSize: 13, textTransform: 'capitalize' }}>{order.delivery_type ?? '—'}</TableCell>
                      <TableCell sx={{ color: '#94A3B8', fontSize: 13 }}>{formatDate(order.created_at)}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="View">
                          <IconButton size="small" onClick={() => setViewOrder(order)} sx={{ color: '#60A5FA' }}>
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => setDeleteId(order.id)} sx={{ color: '#EF4444' }}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ textAlign: 'center', py: 6, color: '#64748B' }}>
                      No Data Found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filtered.length}
            page={page}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            sx={{
              color: '#64748B',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': { color: '#64748B', fontSize: 13 },
              '.MuiTablePagination-select, .MuiTablePagination-selectIcon': { color: '#94A3B8' },
              '.MuiIconButton-root': { color: '#64748B' },
              '.MuiIconButton-root.Mui-disabled': { color: 'rgba(100,116,139,0.3)' },
            }}
          />
        </CardContent>
      </Card>

      {/* View Modal */}
      <Dialog open={!!viewOrder} onClose={() => setViewOrder(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          Order Details
          <IconButton size="small" onClick={() => setViewOrder(null)}><Close /></IconButton>
        </DialogTitle>
        {viewOrder && (
          <DialogContent dividers sx={{ p: 3 }}>

            {/* Order Info */}
            <Typography variant="caption" sx={{ color: '#7C3AED', fontWeight: 700, letterSpacing: 1 }}>ORDER INFO</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1, mb: 3 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748B' }}>Order ID</Typography>
                <Typography sx={{ color: '#F1F5F9', fontSize: 13, fontFamily: 'monospace', wordBreak: 'break-all' }}>{viewOrder.id}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748B' }}>Order Date</Typography>
                <Typography sx={{ color: '#F1F5F9', fontSize: 13 }}>{formatDate(viewOrder.created_at)}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748B' }}>Status</Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip label={viewOrder.status.charAt(0).toUpperCase() + viewOrder.status.slice(1)} size="small" color={statusColor[viewOrder.status] ?? 'default'} />
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748B' }}>Delivery Type</Typography>
                <Typography sx={{ color: '#F1F5F9', fontSize: 13, textTransform: 'capitalize' }}>{viewOrder.delivery_type ?? '—'}</Typography>
              </Box>
            </Box>

            {/* Product Info */}
            <Typography variant="caption" sx={{ color: '#7C3AED', fontWeight: 700, letterSpacing: 1 }}>PRODUCT INFO</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1, mb: 3 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748B' }}>Product Name</Typography>
                <Typography sx={{ color: '#F1F5F9', fontSize: 13 }}>{viewOrder.product?.name ?? '—'}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748B' }}>Price per Item</Typography>
                <Typography sx={{ color: '#F1F5F9', fontSize: 13 }}>${viewOrder.product?.price ?? 0}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748B' }}>Delivery Price</Typography>
                <Typography sx={{ color: '#F1F5F9', fontSize: 13 }}>${viewOrder.delivery_price ?? 0}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748B' }}>Total Amount</Typography>
                <Typography sx={{ color: '#34D399', fontSize: 15, fontWeight: 700 }}>
                  ${((viewOrder.product?.price ?? 0) + (viewOrder.delivery_price ?? 0)).toFixed(2)}
                </Typography>
              </Box>
            </Box>

            {/* User Info */}
            <Typography variant="caption" sx={{ color: '#7C3AED', fontWeight: 700, letterSpacing: 1 }}>USER INFO</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748B' }}>User Name</Typography>
                <Typography sx={{ color: '#F1F5F9', fontSize: 13 }}>
                  {viewOrder.user ? `${viewOrder.user.first_name ?? ''} ${viewOrder.user.last_name ?? ''}`.trim() || '—' : '—'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: '#64748B' }}>User Email</Typography>
                <Typography sx={{ color: '#F1F5F9', fontSize: 13, wordBreak: 'break-all' }}>{viewOrder.user?.email ?? '—'}</Typography>
              </Box>
            </Box>

          </DialogContent>
        )}
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Order</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#94A3B8' }}>
            Are you sure you want to delete this order? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button
            variant="contained" color="error"
            disabled={deleteMutation.isPending}
            onClick={() => deleteId && deleteMutation.mutate(deleteId)}
          >
            {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrdersPage;
