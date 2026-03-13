import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton, TextField, Skeleton,
  InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import { Add, Edit, Delete, Search } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '@/lib/api';
import { toast } from 'sonner';

const ProductsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productsApi.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: productsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setDeleteId(null);
      toast.success('Product deleted');
    },
    onError: () => toast.error('Failed to delete product'),
  });

  const filtered = products?.filter((p) =>
    `${p.title} ${p.brand}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ color: '#F8FAFC', mb: 0.5 }}>Products</Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>Manage product listings</Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />}>Add Product</Button>
      </Box>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ px: 3, py: 2, borderBottom: '1px solid rgba(148,163,184,0.08)' }}>
            <TextField size="small" placeholder="Search products…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ color: '#64748B', fontSize: 20 }} /></InputAdornment> }}
              sx={{ width: 320 }}
            />
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Condition</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>{Array.from({ length: 6 }).map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}</TableRow>
                  ))
                ) : filtered && filtered.length > 0 ? (
                  filtered.map((product) => (
                    <TableRow key={product.id} sx={{ '&:hover': { bgcolor: 'rgba(148,163,184,0.04)' } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{
                            width: 40, height: 40, borderRadius: 2, bgcolor: 'rgba(148,163,184,0.1)',
                            backgroundImage: product.images?.[0] ? `url(${product.images[0]})` : 'none',
                            backgroundSize: 'cover', backgroundPosition: 'center',
                          }} />
                          <Box>
                            <Typography sx={{ color: '#F8FAFC', fontSize: 14, fontWeight: 500 }}>{product.title}</Typography>
                            <Typography sx={{ color: '#64748B', fontSize: 12 }}>{product.brand || 'No brand'}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: '#94A3B8', fontSize: 13 }}>{(product as any).categories?.name ?? '—'}</TableCell>
                      <TableCell sx={{ color: '#F8FAFC', fontWeight: 600, fontSize: 14 }}>${product.price}</TableCell>
                      <TableCell>
                        <Chip label={product.condition ?? 'new'} size="small"
                          sx={{ bgcolor: 'rgba(59,130,246,0.12)', color: '#60A5FA', fontSize: 12 }} />
                      </TableCell>
                      <TableCell>
                        <Chip label={product.is_sold ? 'Sold' : 'Available'} size="small"
                          color={product.is_sold ? 'error' : 'success'} />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" sx={{ color: '#94A3B8' }}><Edit fontSize="small" /></IconButton>
                        <IconButton size="small" onClick={() => setDeleteId(product.id)} sx={{ color: '#EF4444' }}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6, color: '#64748B' }}>No products found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete Product</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#94A3B8' }}>Are you sure you want to delete this product? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={() => deleteId && deleteMutation.mutate(deleteId)}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductsPage;
