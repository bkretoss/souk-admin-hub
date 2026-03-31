import React, { useState, useMemo } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Skeleton, TablePagination,
  TextField, Select, MenuItem, InputAdornment, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
} from '@mui/material';
import { Search, Visibility, Delete, Close } from '@mui/icons-material';
import DateRangePicker from '@/components/admin/DateRangePicker';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrders, deleteOrder } from '@/lib/api/ordersApi';
import OrderStatCards from '@/components/admin/OrderStatCards';
import { toast } from 'sonner';
import { formatDate } from '@/lib/dateUtils';

type OrderStatus = 'pending' | 'approved' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

const ORDER_STATUSES: OrderStatus[] = ['pending', 'approved', 'paid', 'shipped', 'delivered', 'cancelled'];

const statusStyles: Record<OrderStatus, { bg: string; color: string; border: string }> = {
  pending:   { bg: 'rgba(234,179,8,0.15)',   color: '#EAB308', border: 'rgba(234,179,8,0.4)' },
  approved:  { bg: 'rgba(59,130,246,0.15)',  color: '#3B82F6', border: 'rgba(59,130,246,0.4)' },
  paid:      { bg: 'rgba(34,197,94,0.15)',   color: '#22C55E', border: 'rgba(34,197,94,0.4)' },
  shipped:   { bg: 'rgba(168,85,247,0.15)',  color: '#A855F7', border: 'rgba(168,85,247,0.4)' },
  delivered: { bg: 'rgba(21,128,61,0.15)',   color: '#15803D', border: 'rgba(21,128,61,0.4)' },
  cancelled: { bg: 'rgba(239,68,68,0.15)',   color: '#EF4444', border: 'rgba(239,68,68,0.4)' },
};

const StatusBadgeChip = ({ status }: { status: string }) => {
  const s = statusStyles[status as OrderStatus] ?? { bg: 'rgba(148,163,184,0.15)', color: '#94A3B8', border: 'rgba(148,163,184,0.4)' };
  return (
    <Box component="span" sx={{
      display: 'inline-block', px: 1.5, py: 0.4, borderRadius: '999px', fontSize: 12, fontWeight: 600,
      textTransform: 'capitalize', bgcolor: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>
      {status}
    </Box>
  );
};


const OrdersPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [viewOrder, setViewOrder] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: rawOrders, isLoading } = useQuery({
    queryKey: ['orders', dateRange.startDate, dateRange.endDate],
    queryFn: () => getOrders(dateRange.startDate || undefined, dateRange.endDate || undefined),
  });

  // Normalise legacy 'completed' → 'delivered' from DB
  const orders = useMemo(
    () => (rawOrders ?? []).map((o: any) => o.status === 'completed' ? { ...o, status: 'delivered' } : o),
    [rawOrders],
  );

  const allOrders    = orders ?? [];
  const totalOrders  = allOrders.length;
  const pendingCount    = allOrders.filter((o: any) => o.status === 'pending').length;
  const completedCount  = allOrders.filter((o: any) => o.status === 'delivered').length;
  const shippedCount    = allOrders.filter((o: any) => o.status === 'shipped').length;
  const cancelledCount  = allOrders.filter((o: any) => o.status === 'cancelled').length;

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

      {/* Order Stat Cards */}
      <OrderStatCards
        total={totalOrders}
        pending={pendingCount}
        completed={completedCount}
        shipped={shippedCount}
        cancelled={cancelledCount}
        isLoading={isLoading}
      />

      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
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
          {ORDER_STATUSES.map(s => (
            <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>{s}</MenuItem>
          ))}
        </Select>

        <DateRangePicker
          value={dateRange}
          onChange={(v) => { setDateRange(v); setPage(0); }}
          onClear={() => { setDateRange({ startDate: '', endDate: '' }); setPage(0); }}
        />
      </Box>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
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
                      {Array.from({ length: 6 }).map((_, j) => (
                        <TableCell key={j}><Skeleton variant="text" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : paginated.length > 0 ? (
                  paginated.map((order: any) => (
                    <TableRow key={order.id} sx={{ '&:hover': { bgcolor: 'rgba(148,163,184,0.04)' } }}>
                      <TableCell sx={{ color: '#94A3B8', fontSize: 13, fontFamily: 'monospace' }}>#{order.id.slice(0, 8)}</TableCell>
                      <TableCell sx={{ color: '#F8FAFC', fontSize: 13 }}>{order.product?.name ?? '—'}</TableCell>
                      <TableCell>
                        <StatusBadgeChip status={order.status} />
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
                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6, color: '#64748B' }}>
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
                  <StatusBadgeChip status={viewOrder.status} />
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
