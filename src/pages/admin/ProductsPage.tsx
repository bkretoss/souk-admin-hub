import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton, TextField, Skeleton,
  InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions,
  Grid, MenuItem, Avatar, Tooltip, Stack,
} from '@mui/material';
import { Add, Edit, Delete, Search, Visibility, Close, CloudUpload } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi, categoriesApi } from '@/lib/api';
import { toast } from 'sonner';

interface ProductFormData {
  title: string;
  description: string;
  price: string;
  category_id: string;
  brand: string;
  condition: string;
  images: string[];
}

const emptyForm: ProductFormData = {
  title: '', description: '', price: '', category_id: '',
  brand: '', condition: 'new', images: [],
};

const ProductsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewProduct, setViewProduct] = useState<any>(null);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<ProductFormData>(emptyForm);
  const [imageUrl, setImageUrl] = useState('');

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: productsApi.getAll,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });

  const deleteMutation = useMutation({
    mutationFn: productsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setDeleteId(null);
      toast.success('Product deleted successfully');
    },
    onError: () => toast.error('Failed to delete product'),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => productsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      handleCloseForm();
      toast.success('Product created successfully');
    },
    onError: () => toast.error('Failed to create product'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => productsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      handleCloseForm();
      toast.success('Product updated successfully');
    },
    onError: () => toast.error('Failed to update product'),
  });

  const filtered = products?.filter((p) =>
    `${p.title} ${p.brand}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditProduct(null);
    setForm(emptyForm);
    setImageUrl('');
    setFormOpen(true);
  };

  const handleOpenEdit = (product: any) => {
    setEditProduct(product);
    setForm({
      title: product.title || '',
      description: product.description || '',
      price: String(product.price || ''),
      category_id: product.category_id || '',
      brand: product.brand || '',
      condition: product.condition || 'new',
      images: product.images || [],
    });
    setImageUrl('');
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditProduct(null);
    setForm(emptyForm);
    setImageUrl('');
  };

  const handleAddImage = () => {
    if (imageUrl.trim()) {
      setForm((f) => ({ ...f, images: [...f.images, imageUrl.trim()] }));
      setImageUrl('');
    }
  };

  const handleRemoveImage = (idx: number) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = () => {
    if (!form.title || !form.price || !form.category_id) {
      toast.error('Please fill in all required fields');
      return;
    }
    const payload = {
      title: form.title,
      description: form.description,
      price: parseFloat(form.price),
      category_id: form.category_id,
      brand: form.brand,
      condition: form.condition,
      images: form.images,
    };
    if (editProduct) {
      updateMutation.mutate({ id: editProduct.id, data: payload });
    } else {
      createMutation.mutate({ ...payload, seller_id: '00000000-0000-0000-0000-000000000000' });
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ color: '#F8FAFC', mb: 0.5 }}>Products</Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            Manage your product listings · {products?.length ?? 0} total
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpenAdd}>
          Add Product
        </Button>
      </Box>

      {/* Table Card */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ px: 3, py: 2, borderBottom: '1px solid rgba(148,163,184,0.08)' }}>
            <TextField
              size="small" placeholder="Search products…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: '#64748B', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{ width: { xs: '100%', sm: 320 } }}
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
                    <TableRow key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <TableCell key={j}><Skeleton variant="text" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filtered && filtered.length > 0 ? (
                  filtered.map((product) => (
                    <TableRow key={product.id} sx={{ '&:hover': { bgcolor: 'rgba(148,163,184,0.04)' } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            variant="rounded"
                            src={product.images?.[0]}
                            sx={{ width: 44, height: 44, bgcolor: 'rgba(148,163,184,0.1)', borderRadius: 2 }}
                          >
                            {product.title?.[0] || '?'}
                          </Avatar>
                          <Box>
                            <Typography sx={{ color: '#F8FAFC', fontSize: 14, fontWeight: 500 }}>
                              {product.title}
                            </Typography>
                            <Typography sx={{ color: '#64748B', fontSize: 12 }}>
                              {product.brand || 'No brand'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: '#94A3B8', fontSize: 13 }}>
                        {(product as any).categories?.name ?? '—'}
                      </TableCell>
                      <TableCell sx={{ color: '#F8FAFC', fontWeight: 600, fontSize: 14 }}>
                        ${product.price}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={product.condition ?? 'new'} size="small"
                          sx={{ bgcolor: 'rgba(59,130,246,0.12)', color: '#60A5FA', fontSize: 12 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={product.is_sold ? 'Sold' : 'Available'} size="small"
                          color={product.is_sold ? 'error' : 'success'}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View">
                          <IconButton size="small" onClick={() => setViewProduct(product)} sx={{ color: '#60A5FA' }}>
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => handleOpenEdit(product)} sx={{ color: '#94A3B8' }}>
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => setDeleteId(product.id)} sx={{ color: '#EF4444' }}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6, color: '#64748B' }}>
                      No products found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* ── View Product Modal ── */}
      <Dialog open={!!viewProduct} onClose={() => setViewProduct(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Product Details
          <IconButton size="small" onClick={() => setViewProduct(null)}><Close /></IconButton>
        </DialogTitle>
        {viewProduct && (
          <DialogContent dividers>
            {viewProduct.images?.[0] && (
              <Box
                component="img" src={viewProduct.images[0]} alt={viewProduct.title}
                sx={{ width: '100%', maxHeight: 260, objectFit: 'cover', borderRadius: 2, mb: 2 }}
              />
            )}
            <Typography variant="h6" sx={{ color: '#F8FAFC', mb: 1 }}>{viewProduct.title}</Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <Chip label={`$${viewProduct.price}`} color="primary" size="small" />
              <Chip label={viewProduct.condition ?? 'new'} size="small" sx={{ bgcolor: 'rgba(59,130,246,0.12)', color: '#60A5FA' }} />
              <Chip label={viewProduct.is_sold ? 'Sold' : 'Available'} size="small" color={viewProduct.is_sold ? 'error' : 'success'} />
            </Stack>
            <Typography variant="body2" sx={{ color: '#94A3B8', mb: 2 }}>
              {viewProduct.description || 'No description provided.'}
            </Typography>
            <Grid container spacing={2}>
              {[
                ['Category', (viewProduct as any).categories?.name ?? '—'],
                ['Brand', viewProduct.brand || '—'],
                ['Color', viewProduct.color || '—'],
                ['Size', viewProduct.size || '—'],
                ['Material', viewProduct.material || '—'],
                ['Location', viewProduct.location || '—'],
              ].map(([label, value]) => (
                <Grid size={6} key={label}>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>{label}</Typography>
                  <Typography variant="body2" sx={{ color: '#F8FAFC' }}>{value}</Typography>
                </Grid>
              ))}
            </Grid>
          </DialogContent>
        )}
      </Dialog>

      {/* ── Add / Edit Product Modal ── */}
      <Dialog open={formOpen} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <DialogTitle>{editProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
            <TextField
              label="Product Name *" fullWidth size="small"
              value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <TextField
              label="Description" fullWidth size="small" multiline rows={3}
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <Grid container spacing={2}>
              <Grid size={6}>
                <TextField
                  label="Price *" fullWidth size="small" type="number"
                  value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                  InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  label="Category *" fullWidth size="small" select
                  value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                >
                  {categories?.map((c) => (
                    <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid size={6}>
                <TextField
                  label="Brand" fullWidth size="small"
                  value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })}
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  label="Condition" fullWidth size="small" select
                  value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}
                >
                  {['new', 'like new', 'good', 'fair', 'poor'].map((c) => (
                    <MenuItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            {/* Image URLs */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Images</Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                <TextField
                  size="small" placeholder="Paste image URL…" fullWidth
                  value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImage())}
                />
                <Button variant="outlined" size="small" onClick={handleAddImage} startIcon={<CloudUpload />}>
                  Add
                </Button>
              </Stack>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                {form.images.map((img, idx) => (
                  <Box key={idx} sx={{ position: 'relative' }}>
                    <Avatar
                      variant="rounded" src={img}
                      sx={{ width: 56, height: 56, borderRadius: 1.5, border: '1px solid rgba(148,163,184,0.15)' }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveImage(idx)}
                      sx={{
                        position: 'absolute', top: -8, right: -8,
                        bgcolor: '#EF4444', color: '#fff', width: 20, height: 20,
                        '&:hover': { bgcolor: '#DC2626' },
                      }}
                    >
                      <Close sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseForm}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? 'Saving…' : editProduct ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete Confirmation ── */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Product</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#94A3B8' }}>
            Are you sure you want to delete this product? This action cannot be undone.
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

export default ProductsPage;
