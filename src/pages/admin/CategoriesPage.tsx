import React, { useState, useMemo } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Skeleton, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, Tooltip, TablePagination,
} from '@mui/material';
import { Add, Visibility, Edit, Delete, Close, Search } from '@mui/icons-material';
import InputAdornment from '@mui/material/InputAdornment';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/lib/api/categoriesApi';
import { formatDate } from '@/lib/dateUtils';
import { toast } from 'sonner';

const CategoriesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [viewItem, setViewItem] = useState<any>(null);
  const [formDialog, setFormDialog] = useState<{ mode: 'add' | 'edit'; data?: any } | null>(null);
  const [formName, setFormName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const createMutation = useMutation({
    mutationFn: () => createCategory({ name: formName.trim() }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['categories'] }); setFormDialog(null); toast.success('Category created successfully!'); },
    onError: (err: any) => toast.error(err?.message ?? 'Failed to create category'),
  });

  const updateMutation = useMutation({
    mutationFn: (id: string) => updateCategory(id, { name: formName.trim() }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['categories'] }); setFormDialog(null); toast.success('Category updated successfully!'); },
    onError: (err: any) => toast.error(err?.message ?? 'Failed to update category'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['categories'] }); setDeleteId(null); toast.success('Category deleted successfully!'); },
    onError: (err: any) => toast.error(err?.message ?? 'Failed to delete category'),
  });

  const isNameTaken = (name: string, excludeId?: string) =>
    (categories ?? []).some(
      (c: any) => c.name?.trim().toLowerCase() === name.trim().toLowerCase() && c.id !== excludeId,
    );

  const openAdd = () => { setFormName(''); setNameError(null); setFormDialog({ mode: 'add' }); };
  const openEdit = (cat: any) => { setFormName(cat.name); setNameError(null); setFormDialog({ mode: 'edit', data: cat }); };
  const handleSave = () => {
    const excludeId = formDialog?.mode === 'edit' ? formDialog.data.id : undefined;
    if (isNameTaken(formName, excludeId)) { setNameError('Category name already exists'); return; }
    if (formDialog?.mode === 'add') createMutation.mutate();
    else if (formDialog?.mode === 'edit') updateMutation.mutate(formDialog.data.id);
  };
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (categories ?? []).filter((cat: any) => !q || cat.name?.toLowerCase().includes(q));
  }, [categories, search]);

  const paginated = useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage],
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ color: '#F8FAFC', mb: 0.5 }}>Categories</Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            Manage categories · {categories?.length ?? 0} total
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={openAdd}>Add Category</Button>
      </Box>

      <Box sx={{ mb: 2 }}>
        <TextField
          size="small"
          placeholder="Search by name…"
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
      </Box>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Category Name</TableCell>
                  <TableCell>Created Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 3 }).map((_, j) => (
                        <TableCell key={j}><Skeleton variant="text" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : paginated.length > 0 ? (
                  paginated.map((cat: any) => (
                    <TableRow key={cat.id} sx={{ '&:hover': { bgcolor: 'rgba(148,163,184,0.04)' } }}>
                      <TableCell sx={{ color: '#F8FAFC', fontSize: 14, fontWeight: 500 }}>{cat.name}</TableCell>
                      <TableCell sx={{ color: '#94A3B8', fontSize: 13 }}>{formatDate(cat.created_at)}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="View">
                          <IconButton size="small" onClick={() => setViewItem(cat)} sx={{ color: '#60A5FA' }}>
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => openEdit(cat)} sx={{ color: '#94A3B8' }}>
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => setDeleteId(cat.id)} sx={{ color: '#EF4444' }}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} sx={{ textAlign: 'center', py: 6, color: '#64748B' }}>
                      No categories found
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

      {/* View Dialog */}
      <Dialog open={!!viewItem} onClose={() => setViewItem(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Category Details
          <IconButton size="small" onClick={() => setViewItem(null)}><Close /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '12px !important' }}>
          {[['Category Name', viewItem?.name], ['Created Date', formatDate(viewItem?.created_at)]].map(([label, value]) => (
            <Box key={label}>
              <Typography sx={{ color: '#64748B', fontSize: 12, mb: 0.5 }}>{String(label).toUpperCase()}</Typography>
              <Typography sx={{ color: '#F1F5F9', fontSize: 14, fontWeight: 500 }}>{value}</Typography>
            </Box>
          ))}
        </DialogContent>
      </Dialog>

      {/* Add / Edit Dialog */}
      <Dialog open={!!formDialog} onClose={() => setFormDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{formDialog?.mode === 'add' ? 'Add Category' : 'Edit Category'}</DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <TextField
            label="Category Name *"
            fullWidth
            size="small"
            value={formName}
            error={!!nameError}
            helperText={nameError ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              setFormName(val);
              const excludeId = formDialog?.mode === 'edit' ? formDialog.data.id : undefined;
              setNameError(isNameTaken(val, excludeId) ? 'Category name already exists' : null);
            }}
            onKeyDown={(e) => e.key === 'Enter' && formName.trim() && !nameError && !isSaving && handleSave()}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setFormDialog(null)}>Cancel</Button>
          <Button variant="contained" disabled={!formName.trim() || !!nameError || isSaving} onClick={handleSave}>
            {isSaving ? 'Saving…' : formDialog?.mode === 'add' ? 'Create' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Category</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: '#94A3B8' }}>Are you sure you want to delete this category? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button variant="contained" color="error" disabled={deleteMutation.isPending}
            onClick={() => deleteId && deleteMutation.mutate(deleteId)}>
            {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoriesPage;
